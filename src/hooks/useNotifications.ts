import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { saveData } from "@/lib/saveData";

export interface Notification {
  id: string;
  user_id: string;
  pet_id: string | null;
  title: string;
  body: string;
  type: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  enabled: boolean;
  vaccine_reminders: boolean;
  vet_checkup_reminders: boolean;
  groomer_reminders: boolean;
  medication_reminders: boolean;
  observation_followups: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    refetchInterval: 30000,
  });
};

export const useUnreadCount = () => {
  const { data: notifications } = useNotifications();
  return notifications?.filter((n) => !n.read).length ?? 0;
};

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await saveData({ table: "notifications", action: "update", data: { read: true }, match: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await saveData({ table: "notifications", action: "update", data: { read: true }, filters: { read: false } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notification-preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as NotificationPreferences | null;
    },
  });
};

export const useUpsertNotificationPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      await saveData({ table: "notification_preferences", action: "upsert", data: prefs, onConflict: "user_id" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });
};
