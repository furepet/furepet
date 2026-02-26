import { useState } from "react";
import { format, parseISO, differenceInDays, differenceInMonths, addYears, addWeeks, addMonths } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpsertVillageMember, type VillageMember } from "@/hooks/useVillageMembers";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

type Category = "vet" | "walker" | "daycare" | "groomer" | "emergency";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  petName: string;
  category: Category;
  existing?: VillageMember;
}

const GROOMER_SERVICES = ["Bath", "Haircut", "Nail Trim", "Teeth Brushing", "De-shedding", "Ear Cleaning", "Other"];
const GROOMER_FREQUENCIES = ["Every 2 weeks", "Monthly", "Every 6 weeks", "Every 2 months", "Every 3 months", "Custom"];
const EMERGENCY_RELATIONSHIPS = ["Family Member", "Friend", "Neighbor", "Pet Sitter", "Other"];

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const date = value ? parseISO(value) : undefined;
  return (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))} className={cn("p-3 pointer-events-auto")} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const VillageEditSheet = ({ open, onOpenChange, petId, petName, category, existing }: Props) => {
  const [details, setDetails] = useState<Record<string, any>>(existing?.details ?? {});
  const upsert = useUpsertVillageMember();

  const set = (key: string, val: any) => setDetails((d) => ({ ...d, [key]: val }));

  const handleSave = () => {
    upsert.mutate(
      { id: existing?.id, pet_id: petId, category, details },
      {
        onSuccess: () => { toast.success("Saved"); onOpenChange(false); },
        onError: () => toast.error("Failed to save"),
      }
    );
  };

  // Reset details when existing changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setDetails(existing?.details ?? {});
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="bottom" className="rounded-t-2xl h-[85vh]">
        <SheetHeader>
          <SheetTitle>
            {existing ? "Edit" : "Add"} {getCategoryTitle(category)}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(85vh-8rem)] pr-2">
          <div className="flex flex-col gap-4 pt-4 pb-4">
            {category === "vet" && <VetFields details={details} set={set} />}
            {category === "walker" && <WalkerFields details={details} set={set} petName={petName} />}
            {category === "daycare" && <DaycareFields details={details} set={set} petName={petName} />}
            {category === "groomer" && <GroomerFields details={details} set={set} />}
            {category === "emergency" && <EmergencyFields details={details} set={set} />}
          </div>
        </ScrollArea>
        <div className="pt-2">
          <Button onClick={handleSave} disabled={upsert.isPending} className="w-full">
            {upsert.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

function getCategoryTitle(cat: Category) {
  const map: Record<Category, string> = { vet: "Veterinarian", walker: "Dog Walker", daycare: "Daycare", groomer: "Groomer", emergency: "Emergency Contacts" };
  return map[cat];
}

// ── VET ──
function VetFields({ details, set }: { details: Record<string, any>; set: (k: string, v: any) => void }) {
  const lastCheckup = details.last_checkup ? parseISO(details.last_checkup) : null;
  const nextCheckup = lastCheckup ? addYears(lastCheckup, 1) : null;
  const daysUntil = nextCheckup ? differenceInDays(nextCheckup, new Date()) : null;

  return (
    <>
      <Field label="Clinic Name" value={details.clinic_name} onChange={(v) => set("clinic_name", v)} />
      <Field label="Veterinarian Name" value={details.vet_name} onChange={(v) => set("vet_name", v)} />
      <Field label="Phone Number" value={details.phone} onChange={(v) => set("phone", v)} type="tel" />
      <Field label="Email" value={details.email} onChange={(v) => set("email", v)} type="email" />
      <Field label="Address" value={details.address} onChange={(v) => set("address", v)} />
      <div className="flex items-center justify-between">
        <Label>Annual Check-Up Reminder</Label>
        <Switch checked={!!details.checkup_reminder} onCheckedChange={(v) => set("checkup_reminder", v)} />
      </div>
      <DateField label="Date of Last Check-Up" value={details.last_checkup ?? ""} onChange={(v) => set("last_checkup", v)} />
      {daysUntil !== null && (
        <p className="text-sm text-primary font-medium">
          Next check-up {daysUntil > 0 ? `in ${daysUntil} days` : daysUntil === 0 ? "is today!" : `was ${Math.abs(daysUntil)} days ago`}
        </p>
      )}
    </>
  );
}

// ── WALKER ──
function WalkerFields({ details, set, petName }: { details: Record<string, any>; set: (k: string, v: any) => void; petName: string }) {
  const started = details.started_on ? parseISO(details.started_on) : null;
  const months = started ? differenceInMonths(new Date(), started) : null;

  return (
    <>
      <Field label="Walker Name" value={details.name} onChange={(v) => set("name", v)} />
      <Field label="Phone Number" value={details.phone} onChange={(v) => set("phone", v)} type="tel" />
      <Field label="Email" value={details.email} onChange={(v) => set("email", v)} type="email" />
      <DateField label={`Started with ${petName} on`} value={details.started_on ?? ""} onChange={(v) => set("started_on", v)} />
      {months !== null && months > 0 && <p className="text-sm text-primary font-medium">Walking together for {months} month{months !== 1 ? "s" : ""}</p>}
      <div>
        <Label>Notes</Label>
        <Textarea placeholder="Schedule, preferences..." value={details.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </div>
    </>
  );
}

// ── DAYCARE ──
function DaycareFields({ details, set, petName }: { details: Record<string, any>; set: (k: string, v: any) => void; petName: string }) {
  const started = details.started_on ? parseISO(details.started_on) : null;
  const months = started ? differenceInMonths(new Date(), started) : null;
  const friends: string[] = details.friends ?? [];
  const [friendInput, setFriendInput] = useState("");

  const addFriend = () => {
    const name = friendInput.trim();
    if (name && !friends.includes(name)) {
      set("friends", [...friends, name]);
      setFriendInput("");
    }
  };

  return (
    <>
      <Field label="Facility Name" value={details.facility_name} onChange={(v) => set("facility_name", v)} />
      <Field label="Phone Number" value={details.phone} onChange={(v) => set("phone", v)} type="tel" />
      <Field label="Email" value={details.email} onChange={(v) => set("email", v)} type="email" />
      <Field label="Address" value={details.address} onChange={(v) => set("address", v)} />
      <DateField label="Started on" value={details.started_on ?? ""} onChange={(v) => set("started_on", v)} />
      {months !== null && months > 0 && <p className="text-sm text-primary font-medium">Attending for {months} month{months !== 1 ? "s" : ""}</p>}
      <Field label="Favorite Caretaker" value={details.fav_caretaker} onChange={(v) => set("fav_caretaker", v)} />
      <div>
        <Label>{petName}'s Friends at Daycare</Label>
        <div className="flex gap-2 mt-1">
          <Input placeholder="Friend's name" value={friendInput} onChange={(e) => setFriendInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFriend())} />
          <Button type="button" variant="outline" size="sm" onClick={addFriend}>Add</Button>
        </div>
        {friends.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {friends.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {f}
                <button onClick={() => set("friends", friends.filter((x) => x !== f))}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea placeholder="Schedule, special instructions..." value={details.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </div>
    </>
  );
}

// ── GROOMER ──
function GroomerFields({ details, set }: { details: Record<string, any>; set: (k: string, v: any) => void }) {
  const services: string[] = details.services ?? [];
  const freq = details.frequency ?? "";
  const lastAppt = details.last_appointment ? parseISO(details.last_appointment) : null;

  const getNextAppointment = () => {
    if (!lastAppt || !freq) return null;
    const freqMap: Record<string, Date> = {
      "Every 2 weeks": addWeeks(lastAppt, 2),
      "Monthly": addMonths(lastAppt, 1),
      "Every 6 weeks": addWeeks(lastAppt, 6),
      "Every 2 months": addMonths(lastAppt, 2),
      "Every 3 months": addMonths(lastAppt, 3),
    };
    return freqMap[freq] ?? null;
  };

  const next = getNextAppointment();
  const daysUntil = next ? differenceInDays(next, new Date()) : null;

  return (
    <>
      <Field label="Salon Name" value={details.salon_name} onChange={(v) => set("salon_name", v)} />
      <Field label="Groomer Name" value={details.groomer_name} onChange={(v) => set("groomer_name", v)} />
      <Field label="Phone Number" value={details.phone} onChange={(v) => set("phone", v)} type="tel" />
      <Field label="Email" value={details.email} onChange={(v) => set("email", v)} type="email" />

      <div>
        <Label>Preferred Services</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {GROOMER_SERVICES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={services.includes(s)}
                onCheckedChange={(checked) => {
                  set("services", checked ? [...services, s] : services.filter((x) => x !== s));
                }}
              />
              {s}
            </label>
          ))}
        </div>
        {services.includes("Other") && (
          <Input className="mt-2" placeholder="Specify service" value={details.other_service ?? ""} onChange={(e) => set("other_service", e.target.value)} />
        )}
      </div>

      <div>
        <Label>Frequency</Label>
        <Select value={freq} onValueChange={(v) => set("frequency", v)}>
          <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
          <SelectContent>
            {GROOMER_FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
        {freq === "Custom" && (
          <Input className="mt-2" placeholder="e.g. Every 5 weeks" value={details.custom_frequency ?? ""} onChange={(e) => set("custom_frequency", e.target.value)} />
        )}
      </div>

      <div className="flex items-center justify-between">
        <Label>Re-book Reminder</Label>
        <Switch checked={!!details.rebook_reminder} onCheckedChange={(v) => set("rebook_reminder", v)} />
      </div>

      <DateField label="Date of Last Appointment" value={details.last_appointment ?? ""} onChange={(v) => set("last_appointment", v)} />
      {daysUntil !== null && (
        <p className="text-sm text-primary font-medium">
          Next appointment {daysUntil > 0 ? `in ${daysUntil} days` : daysUntil === 0 ? "is today!" : `was ${Math.abs(daysUntil)} days ago`}
        </p>
      )}
    </>
  );
}

// ── EMERGENCY ──
function EmergencyFields({ details, set }: { details: Record<string, any>; set: (k: string, v: any) => void }) {
  const contacts = details.contacts ?? [{}, {}, {}];
  const updateContact = (idx: number, key: string, val: string) => {
    const updated = [...contacts];
    updated[idx] = { ...updated[idx], [key]: val };
    set("contacts", updated);
  };

  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-border p-3 space-y-3">
          <p className="text-sm font-semibold text-foreground">Emergency Contact {i + 1}</p>
          <div>
            <Label>Name</Label>
            <Input value={contacts[i]?.name ?? ""} onChange={(e) => updateContact(i, "name", e.target.value)} />
          </div>
          <div>
            <Label>Relationship to Pet</Label>
            <Select value={contacts[i]?.relationship ?? ""} onValueChange={(v) => updateContact(i, "relationship", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {EMERGENCY_RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input type="tel" value={contacts[i]?.phone ?? ""} onChange={(e) => updateContact(i, "phone", e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={contacts[i]?.email ?? ""} onChange={(e) => updateContact(i, "email", e.target.value)} />
          </div>
        </div>
      ))}
    </>
  );
}

// ── Shared Field helper ──
function Field({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
