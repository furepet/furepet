import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Types matching the new normalized tables ──

export interface VillageVet {
  id: string;
  pet_id: string;
  user_id: string;
  clinic_name: string;
  vet_name: string;
  phone: string;
  email: string;
  address: string;
  last_checkup_date: string | null;
  checkup_reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface VillageWalker {
  id: string;
  pet_id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  started_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface VillageDaycare {
  id: string;
  pet_id: string;
  user_id: string;
  facility_name: string;
  phone: string;
  email: string;
  address: string;
  started_date: string | null;
  favorite_caretaker: string;
  friends: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface VillageGroomer {
  id: string;
  pet_id: string;
  user_id: string;
  salon_name: string;
  groomer_name: string;
  phone: string;
  email: string;
  preferred_services: string[];
  frequency: string;
  last_appointment_date: string | null;
  rebook_reminder_enabled: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  pet_id: string;
  user_id: string;
  priority: number;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export type Category = "vet" | "walker" | "daycare" | "groomer" | "emergency";

// ── Generic query/mutation factory ──

function useVillageTable<T>(table: string, petId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["village", table, petId],
    queryFn: async () => {
      if (!petId || !user) return [] as T[];
      const { data, error } = await (supabase as any)
        .from(table)
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
    enabled: !!petId && !!user,
  });
}

function useUpsertVillageRow(table: string) {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, pet_id, data }: { id?: string; pet_id: string; data: Record<string, any> }) => {
      if (!user) throw new Error("Not authenticated");
      if (id) {
        const { error } = await (supabase as any).from(table).update(data).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from(table)
          .insert({ ...data, pet_id, user_id: user.id });
        if (error) throw error;
      }
      return pet_id;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["village", table, petId] });
    },
  });
}

function useDeleteVillageRow(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
      return petId;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["village", table, petId] });
    },
  });
}

// ── Exported hooks per category ──

export const useVillageVet = (petId?: string) => useVillageTable<VillageVet>("village_vet", petId);
export const useVillageWalker = (petId?: string) => useVillageTable<VillageWalker>("village_walker", petId);
export const useVillageDaycare = (petId?: string) => useVillageTable<VillageDaycare>("village_daycare", petId);
export const useVillageGroomer = (petId?: string) => useVillageTable<VillageGroomer>("village_groomer", petId);
export const useEmergencyContacts = (petId?: string) => useVillageTable<EmergencyContact>("emergency_contacts", petId);

export const useUpsertVet = () => useUpsertVillageRow("village_vet");
export const useUpsertWalker = () => useUpsertVillageRow("village_walker");
export const useUpsertDaycare = () => useUpsertVillageRow("village_daycare");
export const useUpsertGroomer = () => useUpsertVillageRow("village_groomer");
export const useUpsertEmergencyContact = () => useUpsertVillageRow("emergency_contacts");

export const useDeleteVet = () => useDeleteVillageRow("village_vet");
export const useDeleteWalker = () => useDeleteVillageRow("village_walker");
export const useDeleteDaycare = () => useDeleteVillageRow("village_daycare");
export const useDeleteGroomer = () => useDeleteVillageRow("village_groomer");
export const useDeleteEmergencyContact = () => useDeleteVillageRow("emergency_contacts");

// ── Aggregated hook for the hub overview ──

export interface VillageOverview {
  vet: VillageVet | null;
  walker: VillageWalker | null;
  daycare: VillageDaycare | null;
  groomer: VillageGroomer | null;
  emergencyContacts: EmergencyContact[];
  isLoading: boolean;
}

export const useVillageOverview = (petId?: string): VillageOverview => {
  const vet = useVillageVet(petId);
  const walker = useVillageWalker(petId);
  const daycare = useVillageDaycare(petId);
  const groomer = useVillageGroomer(petId);
  const emergency = useEmergencyContacts(petId);

  return {
    vet: vet.data?.[0] ?? null,
    walker: walker.data?.[0] ?? null,
    daycare: daycare.data?.[0] ?? null,
    groomer: groomer.data?.[0] ?? null,
    emergencyContacts: emergency.data ?? [],
    isLoading: vet.isLoading || walker.isLoading || daycare.isLoading || groomer.isLoading || emergency.isLoading,
  };
};
