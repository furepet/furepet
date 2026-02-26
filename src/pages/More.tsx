import { useNavigate } from "react-router-dom";
import {
  MessageCircle, Heart, Settings, HelpCircle, Mail, Star,
  FileText, LogOut, Trash2, Lock, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const More = () => {
  const navigate = useNavigate();

  const handlePremiumTap = () => {
    // TODO: check subscription, show upgrade prompt for free users
  };

  const menuItems = [
    { label: "Settings & Account", icon: Settings, action: () => {} },
    { label: "Help & FAQ", icon: HelpCircle, action: () => {} },
    { label: "Contact Support", icon: Mail, action: () => {} },
    { label: "Rate FurePET", icon: Star, action: () => {} },
    { label: "Terms of Service / Privacy Policy", icon: FileText, action: () => {} },
  ];

  const dangerItems = [
    { label: "Log Out", icon: LogOut, action: () => {} },
    { label: "Delete Account", icon: Trash2, action: () => {} },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold text-foreground">More</h2>

      {/* AI Chat — Premium */}
      <Card
        className="cursor-pointer border-secondary/40 bg-secondary/5 hover:shadow-md transition-shadow"
        onClick={handlePremiumTap}
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

      {/* Menu Items */}
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Card key={item.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={item.action}>
            <CardContent className="flex items-center gap-3 p-3.5">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground flex-1">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="flex flex-col gap-2">
        {dangerItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default More;
