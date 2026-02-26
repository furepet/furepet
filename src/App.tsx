import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, onboardingCompleted } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/auth/login" replace />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, onboardingCompleted } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/auth/login" replace />;
  if (onboardingCompleted) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Routes>
        {/* Auth routes */}
        <Route path="/auth/signup" element={<AuthRoute><SignUp /></AuthRoute>} />
        <Route path="/auth/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/auth/verify" element={<VerifyEmail />} />
        <Route path="/auth/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/" element={<Index />} />
          <Route path="/my-pet" element={<MyPet />} />
          <Route path="/village" element={<Village />} />
          <Route path="/medical" element={<Medical />} />
          <Route path="/more" element={<More />} />
          <Route path="/more/first-aid" element={<FirstAid />} />
          <Route path="/more/ai-chat" element={<AiChat />} />
          <Route path="/more/notifications" element={<NotificationSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
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
