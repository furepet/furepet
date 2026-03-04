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
    // Try all known Supabase storage key patterns
    const keys = [
      "sb-sxzrzkgodbounjvrjcuj-auth-token",
      "furepet-auth",
    ];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      // Supabase stores session directly or nested
      if (parsed?.access_token && parsed?.user) return parsed as Session;
      if (parsed?.currentSession?.access_token) return parsed.currentSession as Session;
      // Some versions nest under session key
      if (parsed?.session?.access_token && parsed?.session?.user) return parsed.session as Session;
    }
    return null;
  } catch {
    return null;
  }
};

/** Race getSession against a timeout to avoid auth lock hangs */
const getSessionWithTimeout = (ms: number): Promise<Session | null> => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.warn(`getSession timed out after ${ms}ms`);
      resolve(null);
    }, ms);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timer);
      resolve(session);
    }).catch((err) => {
      clearTimeout(timer);
      console.error("getSession error:", err);
      resolve(null);
    });
  });
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

    // Hard cap: never show loading for more than 5 seconds
    const hardCap = setTimeout(() => {
      if (!mounted || resolved) return;
      console.warn("Hard cap reached (5s) — forcing loading=false");
      markResolved();
    }, 5000);

    // Try getSession with 3s timeout, then fall back to localStorage
    const init = async () => {
      if (!mounted || resolved) return;

      const session = await getSessionWithTimeout(3000);

      if (!mounted || resolved) return;

      if (session?.user) {
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.user_metadata);
        if (mounted) markResolved();
        return;
      }

      // getSession returned null or timed out — try localStorage
      console.info("Attempting localStorage session recovery…");
      const recovered = recoverSessionFromStorage();
      if (!mounted || resolved) return;

      if (recovered?.user) {
        console.info("Recovered session from localStorage");
        setSession(recovered);
        setUser(recovered.user);
        await fetchProfile(recovered.user.id, recovered.user.user_metadata);
        if (mounted) markResolved();
      } else {
        // No session anywhere — unblock UI so it redirects to /auth
        console.info("No recoverable session — redirecting to login");
        markResolved();
      }
    };

    init();

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
      clearTimeout(hardCap);
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
