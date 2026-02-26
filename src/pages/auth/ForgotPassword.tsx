import { useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <PawPrint className="mx-auto h-10 w-10 text-primary" />
          <Mail className="mx-auto h-12 w-12 text-primary/60" />
          <h2 className="text-lg font-semibold text-foreground">Reset Link Sent</h2>
          <p className="text-sm text-muted-foreground">
            Check your inbox at <span className="font-medium text-foreground">{email}</span> for a password reset link.
          </p>
          <Link to="/auth/login" className="block text-sm text-primary hover:underline">
            Back to Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-1">
          <PawPrint className="h-10 w-10 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Reset Password</h1>
          <p className="text-xs text-muted-foreground">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>

        <Link to="/auth/login" className="block text-center text-sm text-primary hover:underline">
          Back to Log In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
