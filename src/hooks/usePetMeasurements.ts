import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PetMeasurement {
  id: string;
  pet_id: string;
  user_id: string;
  category: string;
  custom_category: string;
  measurement_value: number;
  measurement_unit: string;
  recorded_date: string;
  created_at: string;
}

export const usePetMeasurements = (petId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pet-measurements", petId],
    queryFn: async () => {
      if (!petId || !user) return [];
      const { data, error } = await supabase
        .from("pet_measurements")
        .select("*")
        .eq("pet_id", petId)
        .order("recorded_date", { ascending: false });
      if (error) throw error;
      return data as PetMeasurement[];
    },
    enabled: !!petId && !!user,
  });
};

export const useAddPetMeasurement = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entry: { pet_id: string; category: string; custom_category?: string; measurement_value: number; measurement_unit: string; recorded_date: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("pet_measurements").insert({ ...entry, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["pet-measurements", vars.pet_id] });
    },
  });
};

export const useDeletePetMeasurement = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      const { error } = await supabase.from("pet_measurements").delete().eq("id", id);
      if (error) throw error;
      return petId;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["pet-measurements", petId] });
    },
  });
};
