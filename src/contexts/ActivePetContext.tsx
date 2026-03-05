import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { usePets, Pet } from "@/hooks/usePets";

interface ActivePetContextType {
  pets: Pet[];
  activePet: Pet | null;
  activePetId: string | null;
  setActivePetId: (id: string) => void;
  isLoading: boolean;
  isPremium: boolean;
}

const ActivePetContext = createContext<ActivePetContextType | null>(null);

export const ActivePetProvider = ({ children }: { children: ReactNode }) => {
  const { data: pets = [], isLoading } = usePets();
  const [activePetId, setActivePetId] = useState<string | null>(null);

  const activePet = useMemo(() => {
    if (pets.length === 0) return null;
    return pets.find((p) => p.id === activePetId) ?? pets[0];
  }, [pets, activePetId]);

  const isPremium = activePet?.is_premium ?? false;

  return (
    <ActivePetContext.Provider
      value={{ pets, activePet, activePetId: activePet?.id ?? null, setActivePetId, isLoading, isPremium }}
    >
      {children}
    </ActivePetContext.Provider>
  );
};

export const useActivePet = () => {
  const ctx = useContext(ActivePetContext);
  if (!ctx) throw new Error("useActivePet must be used within ActivePetProvider");
  return ctx;
};
