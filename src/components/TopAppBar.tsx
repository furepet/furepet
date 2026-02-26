import { PawPrint, UserCircle } from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 17) return "Good afternoon!";
  return "Good evening!";
};

const TopAppBar = () => {
  const userName = "User"; // TODO: replace with actual user name

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-base font-semibold text-foreground leading-tight">
              Hi {userName}!
            </h1>
            <p className="text-xs text-muted-foreground">{getGreeting()} 🐾</p>
          </div>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors">
          <UserCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default TopAppBar;
