import { useState } from "react";
import { Plus, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Pet } from "@/hooks/usePets";
import { usePetWeights } from "@/hooks/usePetWeights";
import { WeightChart } from "./WeightChart";
import { BreedPercentile } from "./BreedPercentile";
import { WeightHistory } from "./WeightHistory";
import { AddWeightSheet } from "./AddWeightSheet";

interface Props {
  pet: Pet;
}

export const WeightSection = ({ pet }: Props) => {
  const [addOpen, setAddOpen] = useState(false);
  const { data: weights = [], isLoading } = usePetWeights(pet.id);

  const latestWeight = [...weights].sort((a, b) => b.recorded_date.localeCompare(a.recorded_date))[0];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="h-6 w-24 rounded bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
      </div>
    );
  }

  if (weights.length === 0) {
    return (
      <>
        <EmptyState
          icon={Scale}
          title={`Start tracking ${pet.pet_name}'s weight`}
          description="Monitor weight trends over time to keep your pet healthy."
          actionLabel="Add First Entry"
          onAction={() => setAddOpen(true)}
        />
        <AddWeightSheet open={addOpen} onOpenChange={setAddOpen} petId={pet.id} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Weight</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Weight
        </Button>
      </div>

      <WeightChart weights={weights} />
      <BreedPercentile species={pet.species} breed={pet.breed} petName={pet.pet_name} latestWeight={latestWeight} />
      <WeightHistory weights={weights} petId={pet.id} />
      <AddWeightSheet open={addOpen} onOpenChange={setAddOpen} petId={pet.id} />
    </div>
  );
};
