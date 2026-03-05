import { useState } from "react";
import { Plus, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

interface Pet {
  id: string;
  pet_name: string;
  photo_url: string | null;
}

interface PetSwitcherProps {
  pets: Pet[];
  activePetId: string;
  onSelectPet: (id: string) => void;
  onAddPet: () => void;
}

const PetAvatar = ({ pet }: { pet: Pet }) => {
  const [failed, setFailed] = useState(false);

  if (!pet.photo_url || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <PawPrint className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={pet.photo_url}
      alt={pet.pet_name}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
};

export const PetSwitcher = ({ pets, activePetId, onSelectPet, onAddPet }: PetSwitcherProps) => {
  if (pets.length <= 1) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {pets.map((pet) => (
        <button
          key={pet.id}
          onClick={() => onSelectPet(pet.id)}
          className={cn(
            "relative shrink-0 h-12 w-12 rounded-full border-2 overflow-hidden transition-all",
            pet.id === activePetId
              ? "border-primary ring-2 ring-primary/20"
              : "border-border opacity-60 hover:opacity-100"
          )}
        >
          <PetAvatar pet={pet} />
        </button>
      ))}
      <button
        onClick={onAddPet}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-primary/40 text-primary hover:border-primary hover:bg-primary/5 transition-colors"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
};
