import { Outlet, useLocation } from "react-router-dom";
import TopAppBar from "./TopAppBar";
import BottomTabBar from "./BottomTabBar";
import { OfflineBanner } from "./OfflineBanner";

const AppShell = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <TopAppBar />
      <main className="mx-auto max-w-lg px-4 pb-20 pt-4">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
};

export default AppShell;
