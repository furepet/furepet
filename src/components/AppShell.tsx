import { Outlet } from "react-router-dom";
import TopAppBar from "./TopAppBar";
import BottomTabBar from "./BottomTabBar";

const AppShell = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <main className="mx-auto max-w-lg px-4 pb-20 pt-4">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
};

export default AppShell;
