import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VillageMember {
  id: string;
  pet_id: string;
  user_id: string;
  category: string;
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useVillageMembers = (petId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["village-members", petId],
    queryFn: async () => {
      if (!petId || !user) return [];
      const { data, error } = await supabase
        .from("village_members")
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as VillageMember[];
    },
    enabled: !!petId && !!user,
  });
};

export const useUpsertVillageMember = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entry: { id?: string; pet_id: string; category: string; details: Record<string, any> }) => {
      if (!user) throw new Error("Not authenticated");
      if (entry.id) {
        const { error } = await supabase
          .from("village_members")
          .update({ details: entry.details as any })
          .eq("id", entry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("village_members")
          .insert({ pet_id: entry.pet_id, user_id: user.id, category: entry.category, details: entry.details as any });
        if (error) throw error;
      }
      return entry.pet_id;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["village-members", petId] });
    },
  });
};

export const useDeleteVillageMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      const { error } = await supabase.from("village_members").delete().eq("id", id);
      if (error) throw error;
      return petId;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["village-members", petId] });
    },
  });
};
