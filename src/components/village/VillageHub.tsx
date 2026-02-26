import { useState } from "react";
import { Stethoscope, Dog, Building, Scissors, Phone, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Pet } from "@/hooks/usePets";
import { useVillageOverview, type Category } from "@/hooks/useVillageMembers";
import { VillageEditSheet } from "./VillageEditSheet";

interface CategoryDef {
  key: Category;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryDef[] = [
  { key: "vet", label: "Veterinarian", icon: Stethoscope },
  { key: "walker", label: "Dog Walker", icon: Dog },
  { key: "daycare", label: "Daycare", icon: Building },
  { key: "groomer", label: "Groomer", icon: Scissors },
  { key: "emergency", label: "Emergency Contacts", icon: Phone },
];

function getPrimaryName(cat: Category, overview: ReturnType<typeof useVillageOverview>): string | null {
  switch (cat) {
    case "vet": return overview.vet?.vet_name || overview.vet?.clinic_name || null;
    case "walker": return overview.walker?.name || null;
    case "daycare": return overview.daycare?.facility_name || null;
    case "groomer": return overview.groomer?.groomer_name || overview.groomer?.salon_name || null;
    case "emergency": return overview.emergencyContacts[0]?.name || null;
  }
}

function getExistingId(cat: Category, overview: ReturnType<typeof useVillageOverview>): string | undefined {
  switch (cat) {
    case "vet": return overview.vet?.id;
    case "walker": return overview.walker?.id;
    case "daycare": return overview.daycare?.id;
    case "groomer": return overview.groomer?.id;
    case "emergency": return undefined; // handled separately
  }
}

function getExistingData(cat: Category, overview: ReturnType<typeof useVillageOverview>): Record<string, any> | undefined {
  switch (cat) {
    case "vet": return overview.vet ? { ...overview.vet } : undefined;
    case "walker": return overview.walker ? { ...overview.walker } : undefined;
    case "daycare": return overview.daycare ? { ...overview.daycare } : undefined;
    case "groomer": return overview.groomer ? { ...overview.groomer } : undefined;
    case "emergency": return overview.emergencyContacts.length > 0 ? { contacts: overview.emergencyContacts } : undefined;
  }
}

interface Props {
  pet: Pet;
}

export const VillageHub = ({ pet }: Props) => {
  const overview = useVillageOverview(pet.id);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  if (overview.isLoading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 rounded-xl bg-muted" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">{pet.pet_name}'s Village</h2>

      <div className="flex flex-col gap-3">
        {CATEGORIES.map((cat) => {
          const primary = getPrimaryName(cat.key, overview);

          return (
            <Card
              key={cat.key}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setEditCategory(cat.key)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <cat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
                  <p className={`text-xs truncate ${primary ? "text-muted-foreground" : "text-muted-foreground/60 italic"}`}>
                    {primary ?? "Not set up yet"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editCategory && (
        <VillageEditSheet
          open={!!editCategory}
          onOpenChange={(o) => !o && setEditCategory(null)}
          petId={pet.id}
          petName={pet.pet_name}
          category={editCategory}
          existingId={getExistingId(editCategory, overview)}
          existingData={getExistingData(editCategory, overview)}
        />
      )}
    </div>
  );
};
