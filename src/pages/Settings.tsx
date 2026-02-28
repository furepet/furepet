import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  ArrowLeft, User, Mail, Lock, Crown, PawPrint, Bell,
  Ruler, HelpCircle, MessageSquare, Star, FileText, Shield,
  LogOut, Trash2, ChevronRight, Rainbow, Plus, Pencil, Check,
  Sun, Moon, Monitor,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePets } from "@/hooks/usePets";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { PremiumLockSheet } from "@/components/home/PremiumLockSheet";

/* ── Section Header ── */
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mt-2">
    {children}
  </p>
);

/* ── Menu Row ── */
const MenuRow = ({
  icon: Icon,
  label,
  desc,
  onClick,
  trailing,
  destructive,
}: {
  icon: React.ElementType;
  label: string;
  desc?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  destructive?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-3 min-h-[44px] text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
      destructive
        ? "text-destructive hover:bg-destructive/5"
        : "text-foreground hover:bg-accent"
    }`}
  >
    <Icon className={`h-5 w-5 shrink-0 ${destructive ? "" : "text-muted-foreground"}`} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">{label}</p>
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
    </div>
    {trailing ?? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
  </button>
);

const Settings = () => {
  const navigate = useNavigate();
  const { user, firstName, signOut } = useAuth();
  const { data: pets = [] } = usePets();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();

  // Edit profile state
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [newName, setNewName] = useState(firstName);
  const [savingName, setSavingName] = useState(false);

  // Change email state
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Change password state
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  // Unit preference
  const [unitPref, setUnitPref] = useState<"imperial" | "metric">("imperial");

  // Premium upsell
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [upgradingSub, setUpgradingSub] = useState(false);

  // Danger zone dialogs
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setNewName(firstName);
  }, [firstName]);

  // Load unit preference
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("unit_preference")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.unit_preference) setUnitPref(data.unit_preference as "imperial" | "metric");
      });
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: newName.trim() })
      .eq("user_id", user.id);
    setSavingName(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Name updated" });
      setEditNameOpen(false);
      // Force reload to update AuthContext
      window.location.reload();
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSavingEmail(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Confirmation sent", description: "Check your new email for a confirmation link." });
      setNewEmail("");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPw) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password changed" });
      setChangePwOpen(false);
      setNewPassword("");
      setConfirmPw("");
    }
  };

  const handleUnitToggle = async (checked: boolean) => {
    const newPref = checked ? "metric" : "imperial";
    setUnitPref(newPref);
    if (user) {
      await supabase
        .from("profiles")
        .update({ unit_preference: newPref })
        .eq("user_id", user.id);
    }
  };

  const handleLogout = async () => {
    setLogoutOpen(false);
    await signOut();
  };

  const handleDeleteAccount = async () => {
    if (!user || !deletePassword) return;
    setDeleting(true);

    // Verify password by re-signing in
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: deletePassword,
    });

    if (authError) {
      setDeleting(false);
      toast({ title: "Incorrect password", description: "Please enter your current password.", variant: "destructive" });
      return;
    }

    // Soft-delete: mark profile with deleted_at
    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", user.id);

    setDeleting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDeleteOpen(false);
      toast({
        title: "Account scheduled for deletion",
        description: "Your account will be permanently deleted in 30 days. Contact hello@furepet.com to cancel.",
      });
      await signOut();
    }
  };

  const activePet = pets[0];
  const isPremium = activePet?.is_premium ?? false;

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2 className="text-xl font-semibold text-foreground">Settings & Account</h2>
      </div>

      {/* ── ACCOUNT ── */}
      <SectionHeader>Account</SectionHeader>
      <Card>
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-foreground">{firstName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <MenuRow icon={Pencil} label="Edit Profile" desc="Name & email" onClick={() => setEditNameOpen(true)} />
        <Separator />
        <MenuRow icon={Lock} label="Change Password" onClick={() => setChangePwOpen(true)} />
        <Separator />
        <MenuRow
          icon={Crown}
          label="Subscription"
          desc={isPremium ? "Premium — $4.99/month" : "Free plan"}
          trailing={
            isPremium ? (
              <span className="text-xs font-medium text-primary">Active</span>
            ) : (
              <Button size="sm" variant="default" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setPremiumOpen(true); }}>
                Upgrade
              </Button>
            )
          }
        />
      </div>

      {/* ── PETS ── */}
      <SectionHeader>Your Pets</SectionHeader>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {pets.map((pet, i) => (
          <div key={pet.id}>
            {i > 0 && <Separator />}
            <button
              onClick={() => navigate("/my-pet")}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-accent transition-colors"
            >
              <div className="relative h-10 w-10 shrink-0 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
                {pet.photo_url ? (
                  <img src={pet.photo_url} alt={`Photo of ${pet.pet_name}`} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <PawPrint className="h-5 w-5 text-primary" />
                )}
                {pet.is_deceased && (
                  <div className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary">
                    <Rainbow className="h-3 w-3 text-secondary-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{pet.pet_name}</p>
                <p className="text-xs text-muted-foreground">
                  {pet.is_deceased ? "Memorial" : "Active"} · {pet.species}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ))}
        <Separator />
        <button
          onClick={() => navigate("/onboarding")}
          className="flex w-full items-center gap-3 px-3.5 py-3 text-left text-primary hover:bg-accent transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium">Add New Pet</span>
        </button>
      </div>

      {/* ── NOTIFICATIONS ── */}
      <SectionHeader>Notifications</SectionHeader>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <MenuRow icon={Bell} label="Notification Settings" desc="Manage reminders & quiet hours" onClick={() => navigate("/more/notifications")} />
      </div>

      {/* ── APP PREFERENCES ── */}
      <SectionHeader>App Preferences</SectionHeader>
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Ruler className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Units</p>
              <p className="text-xs text-muted-foreground">
                {unitPref === "imperial" ? "Imperial (lbs / in)" : "Metric (kg / cm)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Imperial</span>
            <Switch checked={unitPref === "metric"} onCheckedChange={handleUnitToggle} aria-label="Toggle metric units" />
            <span className="text-xs text-muted-foreground">Metric</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            ) : theme === "light" ? (
              <Sun className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            ) : (
              <Monitor className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">Appearance</p>
              <p className="text-xs text-muted-foreground capitalize">{theme ?? "system"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {(["light", "system", "dark"] as const).map((t) => {
              const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  aria-label={`${t} theme`}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                    theme === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── SUPPORT ── */}
      <SectionHeader>Support</SectionHeader>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <MenuRow icon={HelpCircle} label="Help & FAQ" onClick={() => {}} />
        <Separator />
        <MenuRow
          icon={MessageSquare}
          label="Contact Support"
          desc="hello@furepet.com"
          onClick={() => window.open("mailto:hello@furepet.com", "_blank")}
        />
        <Separator />
        <MenuRow icon={Star} label="Rate FurePET" onClick={() => {}} />
      </div>

      {/* ── LEGAL ── */}
      <SectionHeader>Legal</SectionHeader>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <MenuRow icon={FileText} label="Terms of Service" onClick={() => {}} />
        <Separator />
        <MenuRow icon={Shield} label="Privacy Policy" onClick={() => {}} />
      </div>

      {/* ── DANGER ZONE ── */}
      <SectionHeader>Danger Zone</SectionHeader>
      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          className="justify-start gap-3 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
          onClick={() => setLogoutOpen(true)}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </button>
      </div>

      {/* ── DIALOGS ── */}

      {/* Edit Name */}
      <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1.5"
                maxLength={50}
              />
            </div>
            <Separator />
            <div>
              <Label>Email Address</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">{user?.email}</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New email address"
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleChangeEmail}
                  disabled={savingEmail || !newEmail.trim()}
                  className="shrink-0"
                >
                  {savingEmail ? "Sending…" : "Change"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">A confirmation link will be sent to your new email.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveName} disabled={savingName || !newName.trim()} className="w-full">
              {savingName ? "Saving…" : "Save Name"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password */}
      <Dialog open={changePwOpen} onOpenChange={setChangePwOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword} disabled={savingPw || newPassword.length < 8} className="w-full">
              {savingPw ? "Updating…" : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of FurePET?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all pet data. This cannot be undone.
              Your account will be recoverable for 30 days — contact hello@furepet.com if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1">
            <Label>Enter your password to confirm</Label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your current password"
              className="mt-1.5"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting || !deletePassword}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Premium Upsell */}
      <PremiumLockSheet
        open={premiumOpen}
        onOpenChange={setPremiumOpen}
        onStartPremium={async () => {
          if (!user) return;
          setUpgradingSub(true);
          const { error } = await supabase
            .from("profiles")
            .update({ subscription_status: "premium" })
            .eq("user_id", user.id);
          if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
            setUpgradingSub(false);
            return;
          }
          // Also mark active pet as premium
          if (activePet) {
            await supabase
              .from("pets")
              .update({ is_premium: true })
              .eq("user_id", user.id);
          }
          setUpgradingSub(false);
          setPremiumOpen(false);
          toast({ title: "Welcome to Premium! 🎉" });
          window.location.reload();
        }}
        upgrading={upgradingSub}
      />
    </div>
  );
};

export default Settings;
