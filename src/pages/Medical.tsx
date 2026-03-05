import { useState } from "react";
import { Lock, Share2 } from "lucide-react";
import { useActivePet } from "@/contexts/ActivePetContext";
import { PremiumLockSheet } from "@/components/home/PremiumLockSheet";
import { DocumentUpload } from "@/components/medical/DocumentUpload";
import { DocumentGallery } from "@/components/medical/DocumentGallery";
import { MedicalSections } from "@/components/medical/MedicalSections";
import { SharePetSheet } from "@/components/share/SharePetSheet";

const Medical = () => {
  const { activePet, isLoading, isPremium } = useActivePet();
  const [lockSheetOpen, setLockSheetOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-32 rounded bg-muted" />
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted" />)}
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Medical Records</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Track vaccines, medications, diagnoses, and more. Upload documents for AI-powered extraction.
        </p>
        <button
          onClick={() => setLockSheetOpen(true)}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Unlock with Premium
        </button>
        <PremiumLockSheet open={lockSheetOpen} onOpenChange={setLockSheetOpen} />
      </div>
    );
  }

  if (!activePet) {
    return <p className="text-sm text-muted-foreground">Add a pet first to manage medical records.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{activePet.pet_name}'s Medical</h2>
        <button
          onClick={() => setShareOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Share medical records"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <DocumentUpload petId={activePet.id} petName={activePet.pet_name} />
      <DocumentGallery petId={activePet.id} />
      <MedicalSections petId={activePet.id} />

      <SharePetSheet pet={activePet} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
};

export default Medical;
