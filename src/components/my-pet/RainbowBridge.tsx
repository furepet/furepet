import { useState, useRef } from "react";
import { format, parseISO } from "date-fns";
import { Camera, PawPrint, Plus, X, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveData } from "@/lib/saveData";
import { useQueryClient } from "@tanstack/react-query";
import type { Pet } from "@/hooks/usePets";

interface RainbowBridgeProps {
  pet: Pet;
}

export const RainbowBridge = ({ pet }: RainbowBridgeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const memories = (pet.memorial_memories as Record<string, string>) ?? {};
  const photos = (pet.memorial_photos as string[]) ?? [];

  const [favoriteMemory, setFavoriteMemory] = useState(memories.favorite_memory ?? "");
  const [whatMadeSpecial, setWhatMadeSpecial] = useState(memories.what_made_special ?? "");
  const [messageTo, setMessageTo] = useState(memories.message_to ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const birthDate = pet.date_of_birth ? format(parseISO(pet.date_of_birth), "MMMM d, yyyy") : null;
  const passingDate = pet.date_of_passing ? format(parseISO(pet.date_of_passing), "MMMM d, yyyy") : null;

  const handleSaveMemories = async () => {
    setSaving(true);
    try {
      await saveData({
        table: "pets",
        action: "update",
        data: {
          memorial_memories: {
            favorite_memory: favoriteMemory,
            what_made_special: whatMadeSpecial,
            message_to: messageTo,
          },
        },
        match: { id: pet.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      toast({ title: "Memorial updated 💛" });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (photos.length >= 5) {
      toast({ title: "Maximum 5 photos", description: "Remove a photo first.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${pet.user_id}/${pet.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("memorial-photos")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("memorial-photos").getPublicUrl(path);
      const newPhotos = [...photos, urlData.publicUrl];
      await saveData({
        table: "pets",
        action: "update",
        data: { memorial_photos: newPhotos },
        match: { id: pet.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      toast({ title: "Photo added 📷" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    try {
      await saveData({
        table: "pets",
        action: "update",
        data: { memorial_photos: newPhotos },
        match: { id: pet.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["pets"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Soft gradient header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-secondary/20 via-primary/5 to-background p-6 text-center">
        <div className="mx-auto mb-4 h-32 w-32 rounded-full p-1 bg-gradient-to-br from-secondary to-secondary-light shadow-lg">
          <div className="h-full w-full rounded-full overflow-hidden bg-card flex items-center justify-center">
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.pet_name} className="h-full w-full object-cover" />
            ) : (
              <PawPrint className="h-12 w-12 text-primary/40" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground">{pet.pet_name}</h2>
        {(birthDate || passingDate) && (
          <p className="text-sm text-muted-foreground mt-1">
            {birthDate ?? "?"} — {passingDate ?? "?"}
          </p>
        )}
        <p className="text-sm text-primary/70 mt-1 italic flex items-center justify-center gap-1.5">
          <Heart className="h-3.5 w-3.5 fill-current" />
          Forever in our hearts
        </p>
      </div>

      {/* Photo Gallery */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold text-foreground">Photo Gallery</Label>
          <span className="text-xs text-muted-foreground">{photos.length}/5 photos</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
              <img src={url} alt={`Memory ${i + 1}`} className="h-full w-full object-cover" />
              <button
                onClick={() => handleRemovePhoto(i)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-foreground/60 text-background flex items-center justify-center hover:bg-foreground/80 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 text-primary/60 hover:border-primary/50 hover:bg-primary/10 transition-colors"
            >
              {uploading ? (
                <span className="text-xs">Uploading…</span>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Add Photo</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* Memory Sections */}
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="p-4 space-y-4">
          <div>
            <Label className="text-sm font-semibold">Our Favorite Memory</Label>
            <Textarea
              value={favoriteMemory}
              onChange={(e) => setFavoriteMemory(e.target.value)}
              placeholder="Share a memory that makes you smile…"
              className="mt-1.5 min-h-[80px] bg-background"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">
              What Made {pet.pet_name} Special
            </Label>
            <Textarea
              value={whatMadeSpecial}
              onChange={(e) => setWhatMadeSpecial(e.target.value)}
              placeholder={`What made ${pet.pet_name} one of a kind…`}
              className="mt-1.5 min-h-[80px] bg-background"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">
              A Message to {pet.pet_name}
            </Label>
            <Textarea
              value={messageTo}
              onChange={(e) => setMessageTo(e.target.value)}
              placeholder={`Write a letter to ${pet.pet_name}…`}
              className="mt-1.5 min-h-[80px] bg-background"
            />
          </div>

          <Button
            onClick={handleSaveMemories}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving…" : "Save Memorial"}
          </Button>
        </CardContent>
      </Card>

      {/* View-only records note */}
      <Card className="border-border/50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {pet.pet_name}'s Records — View Only
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            All medical, village, and profile records are preserved and can be viewed in their respective tabs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
