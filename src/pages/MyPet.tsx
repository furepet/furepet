import { useState } from "react";
import { PawPrint, TrendingUp, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SubTab = "basics" | "trends";

const MyPet = () => {
  const [activeTab, setActiveTab] = useState<SubTab>("basics");
  const isDeceased = false; // TODO: from pet data

  const tabs: { key: SubTab; label: string; icon: React.ElementType }[] = [
    { key: "basics", label: "Basics", icon: PawPrint },
    { key: "trends", label: "Physical Trends", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold text-foreground">My Pet</h2>

      {/* Sub-navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Basics */}
      {activeTab === "basics" && (
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pet Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Name", "Buddy"],
                ["Breed", "Golden Retriever"],
                ["Date of Birth", "Jan 15, 2022"],
                ["Microchip #", "—"],
                ["Insurance", "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Physical Trends */}
      {activeTab === "trends" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weight Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Weight chart coming soon
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rainbow Bridge Memorial */}
      {isDeceased && (
        <Card className="border-muted">
          <CardContent className="flex items-center gap-3 p-4">
            <Heart className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Rainbow Bridge Memorial</p>
              <p className="text-xs text-muted-foreground">In loving memory</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyPet;
