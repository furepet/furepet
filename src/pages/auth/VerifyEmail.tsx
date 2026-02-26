import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { PawPrint, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) return;
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email sent", description: "Check your inbox." });
      setCooldown(60);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <PawPrint className="mx-auto h-10 w-10 text-primary" />
        <Mail className="mx-auto h-12 w-12 text-primary/60" />
        <h2 className="text-lg font-semibold text-foreground">Check Your Inbox</h2>
        <p className="text-sm text-muted-foreground">
          We've sent a verification link to{" "}
          <span className="font-medium text-foreground">{email || "your email"}</span>. Please check your inbox.
        </p>

        <Button onClick={handleResend} variant="outline" className="w-full" disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend Email (${cooldown}s)` : "Resend Email"}
        </Button>

        <Link to="/auth/signup" className="block text-sm text-primary hover:underline">
          Use a different email
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
