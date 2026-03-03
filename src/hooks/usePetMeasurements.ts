import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { saveData } from "@/lib/saveData";

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

  return useMutation({
    mutationFn: async (entry: { pet_id: string; category: string; custom_category?: string; measurement_value: number; measurement_unit: string; recorded_date: string }) => {
      await saveData({ table: "pet_measurements", action: "insert", data: entry });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["pet-measurements", vars.pet_id] });
    },
  });
};

export const useUpdatePetMeasurement = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, petId, data }: { id: string; petId: string; data: Record<string, any> }) => {
      await saveData({ table: "pet_measurements", action: "update", data, match: { id } });
      return petId;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["pet-measurements", petId] });
    },
  });
};

export const useDeletePetMeasurement = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      await saveData({ table: "pet_measurements", action: "delete", match: { id } });
      return petId;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["pet-measurements", petId] });
    },
  });
};
