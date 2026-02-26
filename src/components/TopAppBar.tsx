import { PawPrint, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "@/components/notifications/NotificationBell";

const TopAppBar = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="text-base font-semibold text-foreground">FurePET</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => navigate("/more")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <UserCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
