import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PetWeight {
  id: string;
  pet_id: string;
  user_id: string;
  weight_value: number;
  weight_unit: string;
  recorded_date: string;
  note: string;
  created_at: string;
}

export const usePetWeights = (petId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pet-weights", petId],
    queryFn: async () => {
      if (!petId || !user) return [];
      const { data, error } = await supabase
        .from("pet_weights")
        .select("*")
        .eq("pet_id", petId)
        .order("recorded_date", { ascending: true });
      if (error) throw error;
      return data as PetWeight[];
    },
    enabled: !!petId && !!user,
  });
};

export const useAddPetWeight = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entry: { pet_id: string; weight_value: number; weight_unit: string; recorded_date: string; note: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("pet_weights").insert({ ...entry, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["pet-weights", vars.pet_id] });
    },
  });
};

export const useDeletePetWeight = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      const { error } = await supabase.from("pet_weights").delete().eq("id", id);
      if (error) throw error;
      return petId;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["pet-weights", petId] });
    },
  });
};
