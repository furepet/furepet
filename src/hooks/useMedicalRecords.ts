import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MedicalRecord {
  id: string;
  pet_id: string;
  user_id: string;
  category: string;
  title: string;
  details: Record<string, any>;
  record_date: string | null;
  source_document_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalDocument {
  id: string;
  pet_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  status: string;
  extracted_data: any;
  created_at: string;
}

export const useMedicalRecords = (petId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["medical-records", petId],
    queryFn: async () => {
      if (!petId || !user) return [];
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("pet_id", petId)
        .order("record_date", { ascending: false });
      if (error) throw error;
      return data as MedicalRecord[];
    },
    enabled: !!petId && !!user,
  });
};

export const useAddMedicalRecord = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (entry: { pet_id: string; category: string; title: string; details?: Record<string, any>; record_date?: string; source_document_id?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("medical_records").insert({
        ...entry,
        user_id: user.id,
        details: (entry.details ?? {}) as any,
      });
      if (error) throw error;
      return entry.pet_id;
    },
    onSuccess: (petId) => { qc.invalidateQueries({ queryKey: ["medical-records", petId] }); },
  });
};

export const useDeleteMedicalRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) => {
      const { error } = await supabase.from("medical_records").delete().eq("id", id);
      if (error) throw error;
      return petId;
    },
    onSuccess: (petId) => { qc.invalidateQueries({ queryKey: ["medical-records", petId] }); },
  });
};

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
