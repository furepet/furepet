import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  firstName: string;
  onboardingCompleted: boolean;
  loading: boolean;
  completeOnboarding: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId: string, userMeta?: Record<string, any>) => {
      const [
        { data: profile, error: profileError },
        { data: pets, error: petsError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("first_name, onboarding_completed")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase.from("pets").select("id").eq("user_id", userId).limit(1),
      ]);

      if (profileError) {
        console.error("Failed to load profile during auth bootstrap:", profileError);
      }

      if (petsError) {
        console.error("Failed to check pet records during auth bootstrap:", petsError);
      }

      if (!mounted) return;

      const hasAtLeastOnePet = (pets?.length ?? 0) > 0;
      setFirstName(profile?.first_name || userMeta?.first_name || "");
      setOnboardingCompleted(Boolean(profile?.onboarding_completed) || hasAtLeastOnePet);
    };

    // Safety timeout: if auth check hangs, stop loading to prevent blank screen
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth check timed out after 3s — clearing loading state");
        setLoading(false);
      }
    }, 3000);

    // Initialize from getSession first to avoid blank screen
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id, currentSession.user.user_metadata);
      }
      if (mounted) {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    }).catch((err) => {
      console.error("getSession failed:", err);
      if (mounted) {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id, session.user.user_metadata);
        } else {
          setFirstName("");
          setOnboardingCompleted(false);
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, firstName, onboardingCompleted, loading, completeOnboarding, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
