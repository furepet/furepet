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

    const fetchProfile = async (userId: string, accessToken: string, userMeta?: Record<string, any>) => {
      // Try client-side pet check first
      let hasAtLeastOnePet = false;
      let profileFirstName = userMeta?.first_name || "";

      try {
        const [
          { data: pets, error: petsError },
          { data: profile, error: profileError },
        ] = await Promise.all([
          supabase.from("pets").select("id").eq("user_id", userId).limit(1),
          supabase
            .from("profiles")
            .select("first_name")
            .eq("user_id", userId)
            .maybeSingle(),
        ]);

        if (petsError) console.error("Client pet check failed:", petsError);
        if (profileError) console.error("Client profile check failed:", profileError);

        hasAtLeastOnePet = (pets?.length ?? 0) > 0;
        profileFirstName = profile?.first_name || profileFirstName;

        // If client query returned empty but no error, it might be RLS blocking
        // due to session not being set on the client. Try server-side fallback.
        if (!hasAtLeastOnePet && !petsError) {
          console.info("Client pet check returned 0 — trying server-side fallback…");
          try {
            const res = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/pets?user_id=eq.${userId}&select=id&limit=1`,
              {
                headers: {
                  "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                  "Authorization": `Bearer ${accessToken}`,
                },
              }
            );
            if (res.ok) {
              const serverPets = await res.json();
              hasAtLeastOnePet = Array.isArray(serverPets) && serverPets.length > 0;
              if (hasAtLeastOnePet) console.info("Server-side fallback confirmed pets exist");
            }
          } catch (fetchErr) {
            console.error("Server-side pet check failed:", fetchErr);
          }
        }
      } catch (err) {
        console.error("fetchProfile error:", err);
      }

      if (!mounted) return;

      setFirstName(profileFirstName);
      // Pet existence is the ONLY check — no reliance on profile flags
      setOnboardingCompleted(hasAtLeastOnePet);
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
        await fetchProfile(session.user.id, session.access_token, session.user.user_metadata);
        if (mounted) markResolved();
        return;
      }

      // getSession returned null or timed out — try localStorage
      console.info("Attempting localStorage session recovery…");
      const recovered = recoverSessionFromStorage();
      if (!mounted || resolved) return;

      if (recovered?.user) {
        console.info("Recovered session from localStorage");
        // Set session on the Supabase client so RLS queries work
        try { await supabase.auth.setSession({ access_token: recovered.access_token, refresh_token: recovered.refresh_token }); } catch {}
        setSession(recovered);
        setUser(recovered.user);
        await fetchProfile(recovered.user.id, recovered.access_token, recovered.user.user_metadata);
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
          await fetchProfile(newSession.user.id, newSession.access_token, newSession.user.user_metadata);
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
