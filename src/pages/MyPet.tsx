import { useState } from "react";
import { PawPrint, TrendingUp, Lock, Rainbow } from "lucide-react";
import { usePets } from "@/hooks/usePets";
import { PetBasics } from "@/components/my-pet/PetBasics";
import { PhysicalTrends } from "@/components/my-pet/PhysicalTrends";
import { RainbowBridge } from "@/components/my-pet/RainbowBridge";
import { PremiumLockSheet } from "@/components/home/PremiumLockSheet";

type SubTab = "basics" | "trends" | "memorial";

const MyPet = () => {
  const [activeTab, setActiveTab] = useState<SubTab>("basics");
  const { data: pets = [], isLoading } = usePets();
  const [lockSheetOpen, setLockSheetOpen] = useState(false);

  const activePet = pets[0] ?? null;
  const isPremium = activePet?.is_premium ?? false;
  const isDeceased = activePet?.is_deceased ?? false;

  const tabs: { key: SubTab; label: string; icon: React.ElementType; locked?: boolean; hidden?: boolean }[] = [
    { key: "basics", label: "Basics", icon: PawPrint },
    { key: "trends", label: "Physical Trends", icon: TrendingUp, locked: !isPremium },
    { key: "memorial", label: "Rainbow Bridge", icon: Rainbow, locked: !isPremium, hidden: !isDeceased },
  ];

  const visibleTabs = tabs.filter((t) => !t.hidden);

  const handleTabClick = (tab: SubTab, locked?: boolean) => {
    if (locked) {
      setLockSheetOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 animate-pulse">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-10 w-64 rounded bg-muted" />
        <div className="h-60 rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold text-foreground">My Pet</h2>

      {/* Sub-navigation */}
      <div className="flex gap-2 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key, tab.locked)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key && !tab.locked
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.locked && <Lock className="h-3 w-3 ml-1" />}
          </button>
        ))}
      </div>

      {activeTab === "basics" && activePet && <PetBasics pet={activePet} />}
      {activeTab === "trends" && activePet && <PhysicalTrends pet={activePet} />}
      {activeTab === "memorial" && activePet && isDeceased && <RainbowBridge pet={activePet} />}

      <PremiumLockSheet open={lockSheetOpen} onOpenChange={setLockSheetOpen} />
    </div>
  );
};

export default MyPet;
