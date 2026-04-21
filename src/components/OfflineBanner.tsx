import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-secondary px-4 py-2 text-center animate-slide-down"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-center gap-2">
        <WifiOff className="h-4 w-4 text-secondary-foreground" />
        <span className="text-xs font-medium text-secondary-foreground">
          You're offline. Some features may be unavailable.
        </span>
        <button
          onClick={() => window.location.reload()}
          className="ml-2 flex items-center gap-1 rounded bg-secondary-foreground/10 px-2 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-secondary-foreground/20 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    </div>
  );
};
