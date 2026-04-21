import { PawPrint, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "@/components/notifications/NotificationBell";

const TopAppBar = () => {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-base font-semibold text-foreground">FurePET</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => navigate("/more")}
            aria-label="Account and settings"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <UserCircle className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
