import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import AppShell from "./components/AppShell";
import Index from "./pages/Index";
import MyPet from "./pages/MyPet";
import Village from "./pages/Village";
import Medical from "./pages/Medical";
import More from "./pages/More";
import FirstAid from "./pages/FirstAid";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Index />} />
              <Route path="/my-pet" element={<MyPet />} />
              <Route path="/village" element={<Village />} />
              <Route path="/medical" element={<Medical />} />
              <Route path="/more" element={<More />} />
              <Route path="/more/first-aid" element={<FirstAid />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
