import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatMessage {
  id: string;
  user_id: string;
  pet_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const useChatMessages = (petId: string | undefined) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat_messages", petId],
    queryFn: async () => {
      if (!petId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!petId && !!session,
  });

  const saveMessage = useMutation({
    mutationFn: async (msg: { pet_id: string; role: string; content: string }) => {
      const { error } = await supabase.from("chat_messages").insert({
        ...msg,
        user_id: session!.user.id,
      });
      if (error) throw error;
    },
  });

  const clearChat = useMutation({
    mutationFn: async () => {
      if (!petId) return;
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("pet_id", petId)
        .eq("user_id", session!.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(["chat_messages", petId], []);
    },
  });

  return { ...query, saveMessage, clearChat };
};
