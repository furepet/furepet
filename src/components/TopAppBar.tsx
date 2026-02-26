import { PawPrint } from "lucide-react";

const TopAppBar = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-card border border-border">
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground leading-tight">Buddy</h1>
            <p className="text-xs text-muted-foreground">Good morning! 🐾</p>
          </div>
        </div>
        <div className="flex h-8 items-center rounded-sm bg-primary px-3">
          <span className="text-xs font-semibold text-primary-foreground tracking-wide">FurePET</span>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
