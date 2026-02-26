import { useState } from "react";
import { Scale, Ruler } from "lucide-react";
import type { Pet } from "@/hooks/usePets";
import { WeightSection } from "./trends/WeightSection";
import { MeasurementsSection } from "./trends/MeasurementsSection";

type TrendTab = "weight" | "measurements";

interface Props {
  pet: Pet;
}

export const PhysicalTrends = ({ pet }: Props) => {
  const [tab, setTab] = useState<TrendTab>("weight");

  const tabs: { key: TrendTab; label: string; icon: React.ElementType }[] = [
    { key: "weight", label: "Weight", icon: Scale },
    { key: "measurements", label: "Measurements", icon: Ruler },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Inner tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "weight" && <WeightSection pet={pet} />}
      {tab === "measurements" && <MeasurementsSection pet={pet} />}
    </div>
  );
};
