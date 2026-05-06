import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isIOS } from "@/utils/platform";
import { RevenueCatService } from "@/services/RevenueCatService";

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
    if (!session?.access_token || !session?.user?.id) {
      setState({ subscribed: false, subscriptionEnd: null, loading: false });
      return;
    }

    try {
      // Check Stripe via Supabase
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      
      let isSubscribed = data?.subscribed ?? false;
      let end = data?.subscription_end ?? null;

      // If on iOS, also check RevenueCat
      if (isIOS()) {
        const rcSubscribed = await RevenueCatService.checkSubscription();
        if (rcSubscribed) {
          isSubscribed = true;
          // Note: end date might not be easily available from rc checkSubscription currently
          // but if they are subscribed we trust it
        }
      }

      setState({
        subscribed: isSubscribed,
        subscriptionEnd: end,
        loading: false,
      });
    } catch (err) {
      console.error("check-subscription error:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [session?.access_token, session?.user?.id]);

  useEffect(() => {
    checkSubscription();
    // Re-check every 60 seconds
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const startCheckout = async () => {
    try {
      if (isIOS()) {
        const success = await RevenueCatService.presentPaywall();
        if (success) {
          await checkSubscription();
        }
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (err: any) {
      console.error("startCheckout error:", err);
      throw err;
    }
  };

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  };

  return { ...state, checkSubscription, startCheckout, openPortal };
};
