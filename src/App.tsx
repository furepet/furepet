import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ActivePetProvider } from "@/contexts/ActivePetContext";
import SplashScreen from "./components/SplashScreen";
import AppShell from "./components/AppShell";
import Index from "./pages/Index";
import MyPet from "./pages/MyPet";
import Village from "./pages/Village";
import Medical from "./pages/Medical";
import More from "./pages/More";
import FirstAid from "./pages/FirstAid";
import AiChat from "./pages/AiChat";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import NotificationSettings from "./pages/NotificationSettings";
import Settings from "./pages/Settings";
import HelpFaq from "./pages/HelpFaq";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const queryClient = new QueryClient();

const AuthLoadingScreen = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary">
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-full bg-primary-foreground/20 p-6">
        <PawPrint className="h-16 w-16 text-primary-foreground animate-pulse" strokeWidth={2.5} />
      </div>
      <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">FurePET</h1>
      <p className="text-primary-foreground/70 text-sm">Loading your pet data…</p>
    </div>
  </div>
);

const OAuthCallback = () => {
  const { session, loading } = useAuth();
  const [callbackProcessed, setCallbackProcessed] = useState(false);

  useEffect(() => {
    let active = true;

    const consumeOAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const searchParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get("access_token") ?? searchParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") ?? searchParams.get("refresh_token");
        const code = searchParams.get("code");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) console.error("OAuth callback setSession error:", error);
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.error("OAuth callback exchangeCodeForSession error:", error);
        }
      } finally {
        window.history.replaceState({}, document.title, "/~oauth");
        if (active) {
          setTimeout(() => {
            if (active) setCallbackProcessed(true);
          }, 150);
        }
      }
    };

    void consumeOAuthCallback();

    return () => {
      active = false;
    };
  }, []);

  if (!loading && session) return <Navigate to="/" replace />;
  if (loading || !callbackProcessed) return <AuthLoadingScreen />;
  return <Navigate to="/auth" replace />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, onboardingCompleted } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!session) return <Navigate to="/auth" replace />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, onboardingCompleted } = useAuth();
  const [searchParams] = useSearchParams();
  if (loading) return <AuthLoadingScreen />;
  if (!session) return <Navigate to="/auth" replace />;
  // Allow access with ?addPet=true even if onboarding is completed
  const isAddPet = searchParams.get("addPet") === "true";
  if (onboardingCompleted && !isAddPet) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      <div style={{ display: splashDone ? undefined : "none" }}>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/auth/signup" element={<AuthRoute><SignUp /></AuthRoute>} />
        <Route path="/auth/login" element={<Navigate to="/auth" replace />} />
        <Route path="/auth/verify" element={<VerifyEmail />} />
        <Route path="/auth/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><ActivePetProvider><AppShell /></ActivePetProvider></ProtectedRoute>}>
          <Route path="/" element={<Index />} />
          <Route path="/my-pet" element={<MyPet />} />
          <Route path="/village" element={<Village />} />
          <Route path="/medical" element={<Medical />} />
          <Route path="/more" element={<More />} />
          <Route path="/more/first-aid" element={<FirstAid />} />
          <Route path="/more/ai-chat" element={<AiChat />} />
          <Route path="/more/notifications" element={<NotificationSettings />} />
          <Route path="/more/settings" element={<Settings />} />
          <Route path="/more/help" element={<HelpFaq />} />
          <Route path="/more/terms" element={<TermsOfService />} />
          <Route path="/more/privacy" element={<PrivacyPolicy />} />
        </Route>

        <Route path="/~oauth" element={<OAuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
