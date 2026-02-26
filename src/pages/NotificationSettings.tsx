import { useEffect, useState } from "react";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useNotificationPreferences,
  useUpsertNotificationPreferences,
} from "@/hooks/useNotifications";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: prefs, isLoading } = useNotificationPreferences();
  const upsert = useUpsertNotificationPreferences();
  const { subscribe, permission, isSupported } = usePushSubscription();

  const [form, setForm] = useState({
    enabled: true,
    vaccine_reminders: true,
    vet_checkup_reminders: true,
    groomer_reminders: true,
    medication_reminders: true,
    observation_followups: true,
    quiet_hours_start: "21:00",
    quiet_hours_end: "08:00",
  });

  useEffect(() => {
    if (prefs) {
      setForm({
        enabled: prefs.enabled,
        vaccine_reminders: prefs.vaccine_reminders,
        vet_checkup_reminders: prefs.vet_checkup_reminders,
        groomer_reminders: prefs.groomer_reminders,
        medication_reminders: prefs.medication_reminders,
        observation_followups: prefs.observation_followups,
        quiet_hours_start: prefs.quiet_hours_start,
        quiet_hours_end: prefs.quiet_hours_end,
      });
    }
  }, [prefs]);

  const handleToggle = (key: keyof typeof form) => (checked: boolean) => {
    const updated = { ...form, [key]: checked };
    setForm(updated);
    upsert.mutate(updated);
  };

  const handleTimeChange = (key: "quiet_hours_start" | "quiet_hours_end", val: string) => {
    const updated = { ...form, [key]: val };
    setForm(updated);
    upsert.mutate(updated);
  };

  const handleEnablePush = async () => {
    const ok = await subscribe();
    if (ok) {
      toast({ title: "Push notifications enabled!" });
    } else {
      toast({ title: "Could not enable push", description: "Please allow notifications in your browser settings.", variant: "destructive" });
    }
  };

  const toggles = [
    { key: "vaccine_reminders" as const, label: "Vaccine reminders", desc: "30, 14, 3 days & day-of" },
    { key: "vet_checkup_reminders" as const, label: "Vet check-up reminders", desc: "Annual check-up alerts" },
    { key: "groomer_reminders" as const, label: "Groomer reminders", desc: "Re-booking nudges" },
    { key: "medication_reminders" as const, label: "Medication refills", desc: "Refill date alerts" },
    { key: "observation_followups" as const, label: "Observation follow-ups", desc: "Follow-up date reminders" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-40 rounded bg-muted" />
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
      </div>

      {/* Push permission */}
      {isSupported && permission !== "granted" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Bell className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Enable push notifications</p>
              <p className="text-xs text-muted-foreground">Get reminders even when the app is closed</p>
            </div>
            <Button size="sm" onClick={handleEnablePush}>Enable</Button>
          </CardContent>
        </Card>
      )}

      {/* Master toggle */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {form.enabled ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
            <div>
              <p className="text-sm font-semibold text-foreground">All notifications</p>
              <p className="text-xs text-muted-foreground">{form.enabled ? "On" : "Off"}</p>
            </div>
          </div>
          <Switch checked={form.enabled} onCheckedChange={handleToggle("enabled")} />
        </CardContent>
      </Card>

      {/* Individual toggles */}
      {form.enabled && (
        <div className="flex flex-col gap-2">
          {toggles.map((t) => (
            <Card key={t.key}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <Switch
                  checked={form[t.key]}
                  onCheckedChange={handleToggle(t.key)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quiet hours */}
      {form.enabled && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Quiet hours</p>
            <p className="text-xs text-muted-foreground">No notifications during these hours</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">From</Label>
                <Input
                  type="time"
                  value={form.quiet_hours_start}
                  onChange={(e) => handleTimeChange("quiet_hours_start", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <Input
                  type="time"
                  value={form.quiet_hours_end}
                  onChange={(e) => handleTimeChange("quiet_hours_end", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationSettings;
