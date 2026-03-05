import { useState } from "react";
import { Lock } from "lucide-react";
import { useActivePet } from "@/contexts/ActivePetContext";
import { VillageHub } from "@/components/village/VillageHub";
import { PremiumLockSheet } from "@/components/home/PremiumLockSheet";

const Village = () => {
  const { activePet, isLoading, isPremium } = useActivePet();
  const [lockSheetOpen, setLockSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-48 rounded bg-muted" />
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
        <h2 className="text-xl font-semibold text-foreground">My Village</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Keep all your pet's care providers organized in one place. Unlock with Premium.
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
    return <p className="text-sm text-muted-foreground">Add a pet first to set up your village.</p>;
  }

  return <VillageHub pet={activePet} />;
};

export default Village;
