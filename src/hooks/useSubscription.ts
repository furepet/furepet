import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionState {
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
}

export const useSubscription = () => {
  const { session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    subscriptionEnd: null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState({ subscribed: false, subscriptionEnd: null, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setState({
        subscribed: data?.subscribed ?? false,
        subscriptionEnd: data?.subscription_end ?? null,
        loading: false,
      });
    } catch (err) {
      console.error("check-subscription error:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [session?.access_token]);

  useEffect(() => {
    checkSubscription();
    // Re-check every 60 seconds
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const startCheckout = async () => {
    const { data, error } = await supabase.functions.invoke("create-checkout");
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  };

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  };

  return { ...state, checkSubscription, startCheckout, openPortal };
};
