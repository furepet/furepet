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

/** Try to recover a session from localStorage when getSession hangs */
const recoverSessionFromStorage = (): Session | null => {
  try {
    const raw = localStorage.getItem("furepet-auth") || localStorage.getItem("sb-sxzrzkgodbounjvrjcuj-auth-token");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.access_token && parsed?.user) return parsed as Session;
    // Some versions nest under currentSession
    if (parsed?.currentSession?.access_token) return parsed.currentSession as Session;
    return null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let resolved = false;

    const markResolved = () => {
      resolved = true;
      if (mounted) setLoading(false);
    };

    const fetchProfile = async (userId: string, userMeta?: Record<string, any>) => {
      // Query pets FIRST — if user has any pet, onboarding is done regardless of profile flag
      const [
        { data: pets, error: petsError },
        { data: profile, error: profileError },
      ] = await Promise.all([
        supabase.from("pets").select("id").eq("user_id", userId).limit(1),
        supabase
          .from("profiles")
          .select("first_name, onboarding_completed")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (petsError) console.error("Failed to check pet records:", petsError);
      if (profileError) console.error("Failed to load profile:", profileError);
      if (!mounted) return;

      const hasAtLeastOnePet = (pets?.length ?? 0) > 0;
      setFirstName(profile?.first_name || userMeta?.first_name || "");
      // Pet existence is the PRIMARY check — profile flag is secondary
      setOnboardingCompleted(hasAtLeastOnePet || Boolean(profile?.onboarding_completed));
    };

    // Safety timeout: if auth check hangs, try localStorage recovery
    const safetyTimeout = setTimeout(() => {
      if (!mounted || resolved) return;
      console.warn("Auth check timed out after 3s — attempting localStorage recovery");

      const recovered = recoverSessionFromStorage();
      if (recovered?.user) {
        console.info("Recovered session from localStorage");
        setSession(recovered);
        setUser(recovered.user);
        // Fetch profile in background, but unblock UI now
        fetchProfile(recovered.user.id, recovered.user.user_metadata).finally(() => {
          if (mounted) markResolved();
        });
      } else {
        // No session recoverable — unblock UI cleanly (will redirect to /auth)
        console.info("No recoverable session — clearing loading state");
        markResolved();
      }
    }, 3000);

    // Initialize from getSession
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!mounted || resolved) return;
      clearTimeout(safetyTimeout);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id, currentSession.user.user_metadata);
      }
      if (mounted) markResolved();
    }).catch((err) => {
      console.error("getSession failed:", err);
      if (!mounted || resolved) return;
      clearTimeout(safetyTimeout);
      // Try localStorage fallback on error too
      const recovered = recoverSessionFromStorage();
      if (recovered?.user) {
        setSession(recovered);
        setUser(recovered.user);
        fetchProfile(recovered.user.id, recovered.user.user_metadata).finally(() => {
          if (mounted) markResolved();
        });
      } else {
        markResolved();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.user_metadata);
        } else {
          setFirstName("");
          setOnboardingCompleted(false);
        }
        if (mounted && !resolved) markResolved();
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
