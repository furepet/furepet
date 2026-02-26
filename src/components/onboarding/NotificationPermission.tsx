import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPermissionProps {
  onEnable: () => void;
  onSkip: () => void;
  loading?: boolean;
}

export const NotificationPermission = ({ onEnable, onSkip, loading }: NotificationPermissionProps) => (
  <div className="flex flex-col items-center text-center px-4 pt-12">
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
      <Bell className="h-10 w-10 text-primary" />
    </div>

    <h1 className="text-2xl font-bold text-foreground mb-2">Stay on top of your pet's care</h1>
    <p className="text-muted-foreground text-sm max-w-xs mb-8">
      FurePET can remind you about vaccines, vet visits, and medications. Enable notifications to never miss an important date.
    </p>

    <div className="w-full max-w-xs space-y-3">
      <Button
        onClick={onEnable}
        disabled={loading}
        className="w-full h-12 text-base font-semibold"
      >
        Enable Notifications
      </Button>
      <Button
        variant="ghost"
        onClick={onSkip}
        disabled={loading}
        className="w-full text-sm text-muted-foreground"
      >
        Not right now
      </Button>
    </div>
  </div>
);
