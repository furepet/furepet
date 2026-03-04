import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { PawPrint, Camera } from "lucide-react";
import { NotificationPermission } from "@/components/onboarding/NotificationPermission";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/onboarding/DatePickerField";
import { BreedCombobox } from "@/components/onboarding/BreedCombobox";
import { PremiumUpsell } from "@/components/onboarding/PremiumUpsell";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TOTAL_STEPS = 5;

const buildPetPayload = (
  petName: string,
  nickname: string,
  species: string,
  dateOfBirth: Date | undefined,
  togetherSince: Date | undefined,
  breed: string,
  microchipNumber: string,
  neuterSpayStatus: string,
  neuterSpayDate: Date | undefined,
  hasInsurance: boolean,
  insuranceCompany: string,
  policyNumber: string,
) => ({
  pet_name: petName.trim(),
  nickname: nickname.trim() || null,
  species,
  photo_url: null,
  date_of_birth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
  together_since: togetherSince ? format(togetherSince, "yyyy-MM-dd") : null,
  breed: breed || null,
  microchip_number: microchipNumber.trim() || null,
  neuter_spay_status: neuterSpayStatus,
  neuter_spay_date:
    neuterSpayStatus === "Yes" && neuterSpayDate ? format(neuterSpayDate, "yyyy-MM-dd") : null,
  has_insurance: hasInsurance,
  insurance_company: hasInsurance ? insuranceCompany.trim() || null : null,
  policy_number: hasInsurance ? policyNumber.trim() || null : null,
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, session, completeOnboarding } = useAuth();
  const { toast } = useToast();
  const { subscribe } = usePushSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [petName, setPetName] = useState("");
  const [nickname, setNickname] = useState("");
  const [species, setSpecies] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [togetherSince, setTogetherSince] = useState<Date | undefined>();
  const [breed, setBreed] = useState("");
  const [microchipNumber, setMicrochipNumber] = useState("");

  const [neuterSpayStatus, setNeuterSpayStatus] = useState("Unknown");
  const [neuterSpayDate, setNeuterSpayDate] = useState<Date | undefined>();
  const [hasInsurance, setHasInsurance] = useState(false);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast({ title: "Invalid format", description: "Please upload a JPG or PNG image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.width < 400 || img.height < 400) {
        URL.revokeObjectURL(nextPreviewUrl);
        toast({ title: "Image too small", description: "Minimum dimensions are 400×400px.", variant: "destructive" });
        return;
      }
      setPhotoFile(file);
      setPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextPreviewUrl;
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(nextPreviewUrl);
      toast({ title: "Image error", description: "Unable to load that image.", variant: "destructive" });
    };
    img.src = nextPreviewUrl;
  };

  const savePet = async (isPremium: boolean) => {
    if (!user || !session) {
      navigate("/", { replace: true });
      return;
    }

    setSaving(true);

    const petPayload = buildPetPayload(
      petName, nickname, species, dateOfBirth, togetherSince,
      breed, microchipNumber, neuterSpayStatus, neuterSpayDate,
      hasInsurance, insuranceCompany, policyNumber,
    );

    try {
      // Use raw fetch() to call the edge function — bypasses client-side auth lock entirely
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/complete-onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ pet: petPayload, isPremium }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save pet data");
      }

      console.log("Onboarding: pet saved via edge function, id:", result.petId);

      // Redirect immediately — don't wait for photo upload
      completeOnboarding();

      // Fire-and-forget photo upload using raw fetch to avoid auth lock
      if (photoFile && result.petId) {
        const petId = result.petId;
        const accessToken = session.access_token;
        const uid = user.id;
        const file = photoFile;
        setTimeout(async () => {
          try {
            const ext = file.name.split(".").pop();
            const path = `${uid}/${crypto.randomUUID()}.${ext}`;
            const formData = new FormData();
            formData.append("", file);
            const uploadRes = await fetch(
              `${supabaseUrl}/storage/v1/object/pet-photos/${path}`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                },
                body: formData,
              }
            );
            if (uploadRes.ok) {
              const publicUrl = `${supabaseUrl}/storage/v1/object/public/pet-photos/${path}`;
              await fetch(`${supabaseUrl}/rest/v1/pets?id=eq.${petId}&user_id=eq.${uid}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${accessToken}`,
                  "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                },
                body: JSON.stringify({ photo_url: publicUrl }),
              });
            }
          } catch (e) {
            console.warn("Background photo upload failed:", e);
          }
        }, 0);
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Onboarding save error:", err);
      toast({
        title: "Unable to save",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!petName.trim()) {
        toast({ title: "Pet name required", description: "Please enter your pet's name.", variant: "destructive" });
        return;
      }
      if (!species) {
        toast({ title: "Species required", description: "Please select your pet's species.", variant: "destructive" });
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!breed) {
        toast({ title: "Breed required", description: "Please select your pet's breed.", variant: "destructive" });
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) { setStep(4); return; }
    if (step === 4) { setStep(5); return; }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 pt-6 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">Let's meet your pet! 🐾</h1>
            <p className="text-muted-foreground text-sm mb-8">Tell us about your furry friend.</p>

            <div className="flex flex-col items-center mb-8">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-32 h-32 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden bg-muted hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Pet preview" className="w-full h-full object-cover" />
                ) : (
                  <PawPrint className="w-12 h-12 text-muted-foreground" />
                )}
                <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1.5">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </button>

              {photoPreview && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs text-primary font-medium hover:underline">
                  Change Photo
                </button>
              )}

              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoSelect} />
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="petName">Pet's Full Name *</Label>
                <Input id="petName" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="e.g. Buddy" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="nickname">Nickname(s)</Label>
                <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Bud, Little Bear" className="mt-1.5" />
              </div>
              <div>
                <Label>Species *</Label>
                <Select value={species} onValueChange={setSpecies}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        ) : step === 2 ? (
          <>
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">A few more details</h1>
            <p className="text-muted-foreground text-sm mb-8">Help us complete your pet profile.</p>
            <div className="space-y-5">
              <DatePickerField label="Date of Birth" value={dateOfBirth} onChange={setDateOfBirth} placeholder="Pick a date" />
              <DatePickerField label="When did your pet join your family?" value={togetherSince} onChange={setTogetherSince} placeholder="Pick a date" />
              <BreedCombobox species={species} value={breed} onChange={setBreed} />
              <div>
                <Label htmlFor="microchipNumber">Microchip Number (optional)</Label>
                <Input id="microchipNumber" value={microchipNumber} onChange={(e) => setMicrochipNumber(e.target.value)} placeholder="Enter microchip number" className="mt-1.5" />
              </div>
            </div>
          </>
        ) : step === 3 ? (
          <>
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">Health basics 🏥</h1>
            <p className="text-muted-foreground text-sm mb-8">Just a few health-related questions.</p>
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Neuter / Spay Status</Label>
                <RadioGroup value={neuterSpayStatus} onValueChange={setNeuterSpayStatus} className="flex gap-4">
                  {["Yes", "No", "Unknown"].map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <RadioGroupItem value={option} id={`neuter-${option}`} />
                      <Label htmlFor={`neuter-${option}`} className="font-normal cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              {neuterSpayStatus === "Yes" && (
                <DatePickerField label="Date of Procedure (optional)" value={neuterSpayDate} onChange={setNeuterSpayDate} placeholder="Pick a date" />
              )}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <Label htmlFor="insurance-toggle" className="font-normal cursor-pointer">Do you have pet insurance?</Label>
                <Switch id="insurance-toggle" checked={hasInsurance} onCheckedChange={setHasInsurance} />
              </div>
              {hasInsurance && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="insuranceCompany">Insurance Company</Label>
                    <Input id="insuranceCompany" value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} placeholder="e.g. Healthy Paws" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input id="policyNumber" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="e.g. HP-123456" className="mt-1.5" />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : step === 4 ? (
          <NotificationPermission
            onEnable={async () => { await subscribe(); setStep(5); }}
            onSkip={() => setStep(5)}
          />
        ) : (
          <PremiumUpsell saving={saving} onChoosePremium={() => savePet(false).then(() => {
            supabase.functions.invoke("create-checkout").then(({ data }) => {
              if (data?.url) window.open(data.url, "_blank");
            });
          })} onChooseFree={() => savePet(false)} />
        )}
      </div>

      {step < 4 && (
        <div className="sticky bottom-0 bg-background border-t border-border p-4 max-w-lg mx-auto w-full">
          {step === 1 ? (
            <Button type="button" onClick={handleNext} className="w-full h-12 text-base font-semibold">Next</Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={saving} className="h-12 text-base font-semibold">Back</Button>
              <Button type="button" onClick={handleNext} disabled={saving} className="h-12 text-base font-semibold">Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Onboarding;
