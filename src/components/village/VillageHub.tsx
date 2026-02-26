import { useState } from "react";
import { Stethoscope, Dog, Building, Scissors, Phone, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Pet } from "@/hooks/usePets";
import { useVillageMembers, type VillageMember } from "@/hooks/useVillageMembers";
import { VillageEditSheet } from "./VillageEditSheet";

type Category = "vet" | "walker" | "daycare" | "groomer" | "emergency";

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

function getPrimaryName(cat: Category, details: Record<string, any>): string | null {
  switch (cat) {
    case "vet": return details.vet_name || details.clinic_name || null;
    case "walker": return details.name || null;
    case "daycare": return details.facility_name || null;
    case "groomer": return details.groomer_name || details.salon_name || null;
    case "emergency": {
      const c = details.contacts?.[0];
      return c?.name || null;
    }
    default: return null;
  }
}

interface Props {
  pet: Pet;
}

export const VillageHub = ({ pet }: Props) => {
  const { data: members = [], isLoading } = useVillageMembers(pet.id);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const memberMap = new Map<string, VillageMember>();
  members.forEach((m) => memberMap.set(m.category, m));

  if (isLoading) {
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
          const member = memberMap.get(cat.key);
          const primary = member ? getPrimaryName(cat.key, member.details) : null;

          return (
            <Card key={cat.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setEditCategory(cat.key)}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
                  <p className={`text-xs truncate ${primary ? "text-muted-foreground" : "text-muted-foreground/60 italic"}`}>
                    {primary ?? "Not set up yet"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
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
          existing={memberMap.get(editCategory)}
        />
      )}
    </div>
  );
};
