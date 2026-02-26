import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TOTAL_STEPS = 1;

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [petName, setPetName] = useState("");
  const [nickname, setNickname] = useState("");
  const [species, setSpecies] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const img = new Image();
    img.onload = () => {
      if (img.width < 400 || img.height < 400) {
        toast({ title: "Image too small", description: "Minimum dimensions are 400×400px.", variant: "destructive" });
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    };
    img.src = URL.createObjectURL(file);
  };

  const handleNext = async () => {
    if (!petName.trim()) {
      toast({ title: "Pet name required", description: "Please enter your pet's name.", variant: "destructive" });
      return;
    }
    if (!species) {
      toast({ title: "Species required", description: "Please select your pet's species.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("pet-photos")
          .upload(path, photoFile, { contentType: photoFile.type });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("pet-photos")
          .getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("pets").insert({
        user_id: user.id,
        pet_name: petName.trim(),
        nickname: nickname.trim() || null,
        species,
        photo_url: photoUrl,
      });
      if (error) throw error;

      // Mark onboarding complete
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      navigate("/", { replace: true });
      // Force a page reload so AuthContext re-evaluates
      window.location.reload();
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const progress = (1 / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="px-4 pt-6 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Step 1 of {TOTAL_STEPS}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">Let's meet your pet! 🐾</h1>
        <p className="text-muted-foreground text-sm mb-8">Tell us about your furry friend.</p>

        {/* Photo upload */}
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs text-primary font-medium hover:underline"
            >
              Change Photo
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <div>
            <Label htmlFor="petName">Pet's Full Name *</Label>
            <Input
              id="petName"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Buddy"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="nickname">Nickname(s)</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Bud, Little Bear"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Species *</Label>
            <Select value={species} onValueChange={setSpecies}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dog">Dog</SelectItem>
                <SelectItem value="Cat">Cat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4 max-w-lg mx-auto w-full">
        <Button
          onClick={handleNext}
          disabled={saving}
          className="w-full h-12 text-base font-semibold"
        >
          {saving ? "Saving…" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
