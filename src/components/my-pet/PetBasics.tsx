import { useState, useRef, type ChangeEvent } from "react";
import { format, parseISO, differenceInYears, differenceInMonths } from "date-fns";
import { Camera, PawPrint, Pencil, X, Heart, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkAsPassedDialog, RestoreProfileDialog } from "./MemorialDialogs";
import { SharePetSheet } from "@/components/share/SharePetSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/onboarding/DatePickerField";
import { BreedCombobox } from "@/components/onboarding/BreedCombobox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Pet } from "@/hooks/usePets";

/* ── helpers ── */

const formatDateWithDuration = (iso: string | null): string => {
  if (!iso) return "Not provided";
  const d = parseISO(iso);
  const now = new Date();
  const yrs = differenceInYears(now, d);
  const mos = differenceInMonths(now, d) % 12;
  const parts: string[] = [];
  if (yrs > 0) parts.push(`${yrs} year${yrs !== 1 ? "s" : ""}`);
  if (mos > 0) parts.push(`${mos} month${mos !== 1 ? "s" : ""}`);
  const duration = parts.length ? ` (${parts.join(", ")})` : "";
  return `${format(d, "MMMM d, yyyy")}${duration}`;
};

/* ── component ── */

interface PetBasicsProps {
  pet: Pet;
}

export const PetBasics = ({ pet }: PetBasicsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passedDialogOpen, setPassedDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  const isDeceased = pet.is_deceased ?? false;
  const canRestore = isDeceased && pet.deceased_at
    ? (Date.now() - new Date(pet.deceased_at).getTime()) / (1000 * 60 * 60 * 24) <= 30
    : false;
  const [shareOpen, setShareOpen] = useState(false);

  // edit form state
  const [petName, setPetName] = useState(pet.pet_name);
  const [nickname, setNickname] = useState(pet.nickname ?? "");
  const [species, setSpecies] = useState(pet.species);
  const [breed, setBreed] = useState(pet.breed ?? "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    pet.date_of_birth ? parseISO(pet.date_of_birth) : undefined,
  );
  const [togetherSince, setTogetherSince] = useState<Date | undefined>(
    pet.together_since ? parseISO(pet.together_since) : undefined,
  );
  const [microchipNumber, setMicrochipNumber] = useState(pet.microchip_number ?? "");
  const [neuterSpayStatus, setNeuterSpayStatus] = useState(pet.neuter_spay_status);
  const [neuterSpayDate, setNeuterSpayDate] = useState<Date | undefined>(
    pet.neuter_spay_date ? parseISO(pet.neuter_spay_date) : undefined,
  );
  const [hasInsurance, setHasInsurance] = useState(pet.has_insurance);
  const [insuranceCompany, setInsuranceCompany] = useState(pet.insurance_company ?? "");
  const [policyNumber, setPolicyNumber] = useState(pet.policy_number ?? "");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const displayPhoto = photoPreview ?? pet.photo_url;

  /* reset form to current pet values */
  const resetForm = () => {
    setPetName(pet.pet_name);
    setNickname(pet.nickname ?? "");
    setSpecies(pet.species);
    setBreed(pet.breed ?? "");
    setDateOfBirth(pet.date_of_birth ? parseISO(pet.date_of_birth) : undefined);
    setTogetherSince(pet.together_since ? parseISO(pet.together_since) : undefined);
    setMicrochipNumber(pet.microchip_number ?? "");
    setNeuterSpayStatus(pet.neuter_spay_status);
    setNeuterSpayDate(pet.neuter_spay_date ? parseISO(pet.neuter_spay_date) : undefined);
    setHasInsurance(pet.has_insurance);
    setInsuranceCompany(pet.insurance_company ?? "");
    setPolicyNumber(pet.policy_number ?? "");
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleCancel = () => {
    resetForm();
    setEditing(false);
  };

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
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.width < 400 || img.height < 400) {
        URL.revokeObjectURL(url);
        toast({ title: "Image too small", description: "Minimum dimensions are 400×400px.", variant: "destructive" });
        return;
      }
      setPhotoFile(file);
      setPhotoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
    };
    img.onerror = () => { URL.revokeObjectURL(url); };
    img.src = url;
  };

  const handleSave = async () => {
    if (!petName.trim()) {
      toast({ title: "Pet name required", variant: "destructive" });
      return;
    }
    if (!breed) {
      toast({ title: "Breed required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let photoUrl = pet.photo_url;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${pet.user_id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("pet-photos")
          .upload(path, photoFile, { contentType: photoFile.type });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("pet-photos").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("pets")
        .update({
          pet_name: petName.trim(),
          nickname: nickname.trim() || null,
          species,
          breed: breed || null,
          date_of_birth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
          together_since: togetherSince ? format(togetherSince, "yyyy-MM-dd") : null,
          microchip_number: microchipNumber.trim() || null,
          neuter_spay_status: neuterSpayStatus,
          neuter_spay_date: neuterSpayStatus === "Yes" && neuterSpayDate ? format(neuterSpayDate, "yyyy-MM-dd") : null,
          has_insurance: hasInsurance,
          insurance_company: hasInsurance ? insuranceCompany.trim() || null : null,
          policy_number: hasInsurance ? policyNumber.trim() || null : null,
          photo_url: photoUrl,
        })
        .eq("id", pet.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      setEditing(false);
      toast({ title: "Changes saved!" });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  /* ── VIEW MODE ── */
  if (!editing) {
    const rows: { label: string; value: string }[] = [
      { label: "Full Name", value: pet.pet_name },
      { label: "Nickname(s)", value: pet.nickname || "—" },
      { label: "Species", value: pet.species },
      { label: "Breed", value: pet.breed || "—" },
      { label: "Date of Birth", value: formatDateWithDuration(pet.date_of_birth) },
      { label: "Together Since", value: formatDateWithDuration(pet.together_since) },
      { label: "Microchip Number", value: pet.microchip_number || "Not provided" },
      {
        label: "Neuter/Spay Status",
        value:
          pet.neuter_spay_status === "Yes" && pet.neuter_spay_date
            ? `Yes — ${format(parseISO(pet.neuter_spay_date), "MMMM d, yyyy")}`
            : pet.neuter_spay_status,
      },
      {
        label: "Pet Insurance",
        value: pet.has_insurance
          ? [pet.insurance_company, pet.policy_number].filter(Boolean).join(" · ") || "On file"
          : "None on file",
      },
    ];

    return (
      <div className="flex flex-col gap-4">
        {/* Photo + edit button */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="relative h-[120px] w-[120px] rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
              {pet.photo_url ? (
                <img src={pet.photo_url} alt={pet.pet_name} className="h-full w-full object-cover" />
              ) : (
                <PawPrint className="h-12 w-12 text-primary" />
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShareOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Share pet info"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {!isDeceased && (
              <button
                onClick={() => setEditing(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Edit pet details"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Detail card */}
        <Card>
          <CardContent className="space-y-3 p-4">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm gap-4">
                <span className="text-muted-foreground shrink-0">{label}</span>
                <span className={`font-medium text-right ${
                  value === "Not provided" || value === "None on file" || value === "—"
                    ? "text-muted-foreground"
                    : "text-foreground"
                }`}>
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mark as Passed / Restore */}
        {!isDeceased && (
          <button
            onClick={() => setPassedDialogOpen(true)}
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-2"
          >
            <Heart className="h-3 w-3" />
            Mark as Passed Away
          </button>
        )}
        {canRestore && (
          <button
            onClick={() => setRestoreDialogOpen(true)}
            className="flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors py-2"
          >
            Restore active profile
          </button>
        )}

        <MarkAsPassedDialog pet={pet} open={passedDialogOpen} onOpenChange={setPassedDialogOpen} />
        <RestoreProfileDialog pet={pet} open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen} />
        <SharePetSheet pet={pet} open={shareOpen} onOpenChange={setShareOpen} />
      </div>
    );
  }

  /* ── EDIT MODE ── */
  return (
    <div className="flex flex-col gap-4">
      {/* Photo */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative h-[120px] w-[120px] rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden bg-muted hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {displayPhoto ? (
            <img src={displayPhoto} alt="Pet" className="h-full w-full object-cover" />
          ) : (
            <PawPrint className="h-12 w-12 text-muted-foreground" />
          )}
          <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1.5">
            <Camera className="h-3.5 w-3.5" />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </div>

      {/* Fields */}
      <Card>
        <CardContent className="space-y-5 p-4">
          <div>
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input id="edit-name" value={petName} onChange={(e) => setPetName(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label htmlFor="edit-nick">Nickname(s)</Label>
            <Input id="edit-nick" value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label>Species *</Label>
            <Select value={species} onValueChange={(v) => { setSpecies(v); setBreed(""); }}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Dog">Dog</SelectItem>
                <SelectItem value="Cat">Cat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <BreedCombobox species={species} value={breed} onChange={setBreed} />

          <DatePickerField label="Date of Birth" value={dateOfBirth} onChange={setDateOfBirth} placeholder="Pick a date" />
          <DatePickerField label="Together Since" value={togetherSince} onChange={setTogetherSince} placeholder="Pick a date" />

          <div>
            <Label htmlFor="edit-chip">Microchip Number</Label>
            <Input id="edit-chip" value={microchipNumber} onChange={(e) => setMicrochipNumber(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label className="mb-3 block">Neuter / Spay Status</Label>
            <RadioGroup value={neuterSpayStatus} onValueChange={setNeuterSpayStatus} className="flex gap-4">
              {["Yes", "No", "Unknown"].map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem value={opt} id={`edit-neuter-${opt}`} />
                  <Label htmlFor={`edit-neuter-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {neuterSpayStatus === "Yes" && (
            <DatePickerField label="Date of Procedure" value={neuterSpayDate} onChange={setNeuterSpayDate} placeholder="Pick a date" />
          )}

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <Label htmlFor="edit-insurance" className="font-normal cursor-pointer">Pet Insurance?</Label>
            <Switch id="edit-insurance" checked={hasInsurance} onCheckedChange={setHasInsurance} />
          </div>

          {hasInsurance && (
            <>
              <div>
                <Label htmlFor="edit-ins-co">Insurance Company</Label>
                <Input id="edit-ins-co" value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="edit-pol">Policy Number</Label>
                <Input id="edit-pol" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} className="mt-1.5" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 pb-4">
        <Button onClick={handleSave} disabled={saving} className="h-12 w-full text-base font-semibold">
          {saving ? "Saving…" : "Save Changes"}
        </Button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
