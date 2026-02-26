import { useBreedWeightRange } from "@/hooks/useBreedWeightRange";
import type { PetWeight } from "@/hooks/usePetWeights";

interface Props {
  species: string;
  breed: string | null;
  petName: string;
  latestWeight: PetWeight | undefined;
}

export const BreedPercentile = ({ species, breed, petName, latestWeight }: Props) => {
  const { data: range } = useBreedWeightRange(species, breed ?? undefined);

  if (!range || !latestWeight) return null;

  // Convert to lbs if needed
  let weightLbs = Number(latestWeight.weight_value);
  if (latestWeight.weight_unit === "kg") weightLbs = weightLbs * 2.20462;

  // Calculate percentile (linear interpolation within min-max range)
  const { min_weight_lbs, max_weight_lbs } = range;
  const minW = Number(min_weight_lbs);
  const maxW = Number(max_weight_lbs);
  const pct = Math.round(Math.max(0, Math.min(100, ((weightLbs - minW) / (maxW - minW)) * 100)));

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <h4 className="text-sm font-semibold text-foreground mb-3">Breed Weight Percentile</h4>

      <p className="text-sm text-muted-foreground mb-3">
        Based on <span className="font-medium text-foreground">{breed}</span> averages, {petName} is in the{" "}
        <span className="font-bold text-primary">{pct}th</span> percentile for weight.
      </p>

      {/* Gauge */}
      <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-2">
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary-foreground border-2 border-primary"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{minW} lbs</span>
        <span>{maxW} lbs</span>
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 italic">
        Percentile based on standard breed weight ranges. Consult your vet for personalized guidance.
      </p>
    </div>
  );
};
