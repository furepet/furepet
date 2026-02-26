import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Types for normalized medical tables ──

export interface Vaccine {
  id: string; pet_id: string; user_id: string;
  vaccine_name: string; date_administered: string | null;
  administering_vet: string; next_due_date: string | null;
  lot_number: string; notes: string;
  created_at: string; updated_at: string;
}

export interface Diagnosis {
  id: string; pet_id: string; user_id: string;
  diagnosis_name: string; date_diagnosed: string | null;
  diagnosing_vet: string; status: string; notes: string;
  created_at: string; updated_at: string;
}

export interface Medication {
  id: string; pet_id: string; user_id: string;
  medication_name: string; dosage: string; frequency: string;
  start_date: string | null; end_date: string | null;
  prescribing_vet: string; status: string;
  refill_reminder_enabled: boolean; refill_date: string | null;
  notes: string; created_at: string; updated_at: string;
}

export interface Surgery {
  id: string; pet_id: string; user_id: string;
  procedure_name: string; date: string | null;
  surgeon_clinic: string; reason: string; outcome_notes: string;
  created_at: string; updated_at: string;
}

export interface BehavioralIssue {
  id: string; pet_id: string; user_id: string;
  issue: string; first_noticed: string | null;
  severity: string; status: string; treatment_plan: string; notes: string;
  created_at: string; updated_at: string;
}

export interface Allergy {
  id: string; pet_id: string; user_id: string;
  allergen: string; type: string; reaction: string;
  severity: string; date_identified: string | null; notes: string;
  created_at: string; updated_at: string;
}

export interface Observation {
  id: string; pet_id: string; user_id: string;
  title: string; date_first_noticed: string | null;
  body_location: string; size_description: string;
  photo_url: string | null; status: string;
  follow_up_date: string | null; notes: string;
  created_at: string; updated_at: string;
}

export type MedicalCategory = "vaccine" | "diagnosis" | "medication" | "surgery" | "behavioral" | "allergy" | "observation";

// Map category keys to table names
const TABLE_MAP: Record<MedicalCategory, string> = {
  vaccine: "vaccines",
  diagnosis: "diagnoses",
  medication: "medications",
  surgery: "surgeries",
  behavioral: "behavioral_issues",
  allergy: "allergies",
  observation: "observations",
};

// Map category to the date column used for ordering
const DATE_COL_MAP: Record<MedicalCategory, string> = {
  vaccine: "date_administered",
  diagnosis: "date_diagnosed",
  medication: "start_date",
  surgery: "date",
  behavioral: "first_noticed",
  allergy: "date_identified",
  observation: "date_first_noticed",
};

// ── Generic hooks ──

function useMedicalTable<T>(category: MedicalCategory, petId: string | undefined) {
  const { user } = useAuth();
  const table = TABLE_MAP[category];
  return useQuery({
    queryKey: ["medical", category, petId],
    queryFn: async () => {
      if (!petId || !user) return [] as T[];
      const { data, error } = await (supabase as any)
        .from(table)
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
    enabled: !!petId && !!user,
  });
}

function useAddMedicalRow(category: MedicalCategory) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const table = TABLE_MAP[category];

  return useMutation({
    mutationFn: async ({ pet_id, data }: { pet_id: string; data: Record<string, any> }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase as any)
        .from(table)
        .insert({ ...data, pet_id, user_id: user.id });
      if (error) throw error;
      return pet_id;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["medical", category, petId] });
    },
  });
}

function useUpdateMedicalRow(category: MedicalCategory) {
  const qc = useQueryClient();
  const table = TABLE_MAP[category];

  return useMutation({
    mutationFn: async ({ id, pet_id, data }: { id: string; pet_id: string; data: Record<string, any> }) => {
      const { error } = await (supabase as any).from(table).update(data).eq("id", id);
      if (error) throw error;
      return pet_id;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["medical", category, petId] });
    },
  });
}

function useDeleteMedicalRow(category: MedicalCategory) {
  const qc = useQueryClient();
  const table = TABLE_MAP[category];

  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
      return petId;
    },
    onSuccess: (petId) => {
      qc.invalidateQueries({ queryKey: ["medical", category, petId] });
    },
  });
}

// ── Per-category query hooks ──
export const useVaccines = (petId?: string) => useMedicalTable<Vaccine>("vaccine", petId);
export const useDiagnoses = (petId?: string) => useMedicalTable<Diagnosis>("diagnosis", petId);
export const useMedications = (petId?: string) => useMedicalTable<Medication>("medication", petId);
export const useSurgeries = (petId?: string) => useMedicalTable<Surgery>("surgery", petId);
export const useBehavioralIssues = (petId?: string) => useMedicalTable<BehavioralIssue>("behavioral", petId);
export const useAllergies = (petId?: string) => useMedicalTable<Allergy>("allergy", petId);
export const useObservations = (petId?: string) => useMedicalTable<Observation>("observation", petId);

// ── Per-category mutation hooks ──
export const useAddVaccine = () => useAddMedicalRow("vaccine");
export const useAddDiagnosis = () => useAddMedicalRow("diagnosis");
export const useAddMedication = () => useAddMedicalRow("medication");
export const useAddSurgery = () => useAddMedicalRow("surgery");
export const useAddBehavioralIssue = () => useAddMedicalRow("behavioral");
export const useAddAllergy = () => useAddMedicalRow("allergy");
export const useAddObservation = () => useAddMedicalRow("observation");

export const useUpdateVaccine = () => useUpdateMedicalRow("vaccine");
export const useUpdateDiagnosis = () => useUpdateMedicalRow("diagnosis");
export const useUpdateMedication = () => useUpdateMedicalRow("medication");
export const useUpdateSurgery = () => useUpdateMedicalRow("surgery");
export const useUpdateBehavioralIssue = () => useUpdateMedicalRow("behavioral");
export const useUpdateAllergy = () => useUpdateMedicalRow("allergy");
export const useUpdateObservation = () => useUpdateMedicalRow("observation");

export const useDeleteVaccine = () => useDeleteMedicalRow("vaccine");
export const useDeleteDiagnosis = () => useDeleteMedicalRow("diagnosis");
export const useDeleteMedication = () => useDeleteMedicalRow("medication");
export const useDeleteSurgery = () => useDeleteMedicalRow("surgery");
export const useDeleteBehavioralIssue = () => useDeleteMedicalRow("behavioral");
export const useDeleteAllergy = () => useDeleteMedicalRow("allergy");
export const useDeleteObservation = () => useDeleteMedicalRow("observation");

// ── Generic add/update/delete for use with dynamic category ──
export const useAddMedicalRecord = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entry: { pet_id: string; category: MedicalCategory; data: Record<string, any> }) => {
      if (!user) throw new Error("Not authenticated");
      const table = TABLE_MAP[entry.category];
      const { error } = await (supabase as any)
        .from(table)
        .insert({ ...entry.data, pet_id: entry.pet_id, user_id: user.id });
      if (error) throw error;
      return { petId: entry.pet_id, category: entry.category };
    },
    onSuccess: ({ petId, category }) => {
      qc.invalidateQueries({ queryKey: ["medical", category, petId] });
    },
  });
};

export const useUpdateMedicalRecord = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entry: { id: string; pet_id: string; category: MedicalCategory; data: Record<string, any> }) => {
      const table = TABLE_MAP[entry.category];
      const { error } = await (supabase as any).from(table).update(entry.data).eq("id", entry.id);
      if (error) throw error;
      return { petId: entry.pet_id, category: entry.category };
    },
    onSuccess: ({ petId, category }) => {
      qc.invalidateQueries({ queryKey: ["medical", category, petId] });
    },
  });
};

export const useDeleteMedicalRecord = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, petId, category }: { id: string; petId: string; category: MedicalCategory }) => {
      const table = TABLE_MAP[category];
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
      return { petId, category };
    },
    onSuccess: ({ petId, category }) => {
      qc.invalidateQueries({ queryKey: ["medical", category, petId] });
    },
  });
};

// ── Document hooks (unchanged table) ──

export interface MedicalDocument {
  id: string; pet_id: string; user_id: string;
  file_name: string; file_path: string; file_type: string;
  file_size: number; status: string; extracted_data: any;
  created_at: string;
}

export const useMedicalDocuments = (petId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["medical-documents", petId],
    queryFn: async () => {
      if (!petId || !user) return [];
      const { data, error } = await supabase
        .from("medical_documents")
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MedicalDocument[];
    },
    enabled: !!petId && !!user,
  });
};

export const useDeleteMedicalDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, petId, filePath }: { id: string; petId: string; filePath: string }) => {
      await supabase.storage.from("medical-documents").remove([filePath]);
      const { error } = await supabase.from("medical_documents").delete().eq("id", id);
      if (error) throw error;
      return petId;
    },
    onSuccess: (petId) => { qc.invalidateQueries({ queryKey: ["medical-documents", petId] }); },
  });
};
