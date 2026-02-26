import { useNavigate } from "react-router-dom";
import {
  MessageCircle, Heart, Settings, Lock, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const More = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">More</h1>

      {/* AI Chat — Premium */}
      <Card
        className="cursor-pointer border-secondary/40 bg-secondary/5 hover:shadow-md transition-shadow"
        onClick={() => navigate("/more/ai-chat")}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/20">
            <MessageCircle className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">AI Chat</p>
            <p className="text-xs text-muted-foreground">Ask anything about your pet</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-secondary-foreground">
            <Lock className="h-3.5 w-3.5" />
            Premium
          </div>
        </CardContent>
      </Card>

      {/* CPR & First Aid */}
      <Card
        className="cursor-pointer border-destructive/30 bg-emergency-bg hover:shadow-md transition-shadow"
        onClick={() => navigate("/more/first-aid")}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Heart className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-destructive">CPR & First Aid</p>
            <p className="text-xs text-muted-foreground">Emergency guide — always free</p>
          </div>
          <ChevronRight className="h-5 w-5 text-destructive/60" />
        </CardContent>
      </Card>

      {/* Settings & Account */}
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate("/more/settings")}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Settings & Account</p>
            <p className="text-xs text-muted-foreground">Profile, pets, notifications, preferences</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
};

export default More;
