import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BreedWeightRange {
  id: string;
  species: string;
  breed: string;
  min_weight_lbs: number;
  max_weight_lbs: number;
  avg_weight_lbs: number;
}

export const useBreedWeightRange = (species: string | undefined, breed: string | undefined) => {
  return useQuery({
    queryKey: ["breed-weight-range", species, breed],
    queryFn: async () => {
      if (!species || !breed) return null;
      const { data, error } = await supabase
        .from("breed_weight_ranges")
        .select("*")
        .eq("species", species)
        .eq("breed", breed)
        .maybeSingle();
      if (error) throw error;
      return data as BreedWeightRange | null;
    },
    enabled: !!species && !!breed,
  });
};
