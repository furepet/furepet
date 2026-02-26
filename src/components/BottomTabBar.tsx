import { useState, useRef } from "react";
import { Home, PawPrint, Users, Stethoscope, MoreHorizontal } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "Home", icon: Home, path: "/" },
  { label: "My Pet", icon: PawPrint, path: "/my-pet" },
  { label: "Village", icon: Users, path: "/village" },
  { label: "Medical", icon: Stethoscope, path: "/medical" },
  { label: "More", icon: MoreHorizontal, path: "/more" },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bouncingTab, setBouncingTab] = useState<string | null>(null);

  const handleTap = (path: string) => {
    setBouncingTab(path);
    navigate(path);
    setTimeout(() => setBouncingTab(null), 300);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path ||
            (tab.path !== "/" && location.pathname.startsWith(tab.path));
          const isBouncing = bouncingTab === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => handleTap(tab.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon
                className={`h-5 w-5 transition-transform ${isBouncing ? "animate-tab-bounce" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive ? "currentColor" : "none"}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
