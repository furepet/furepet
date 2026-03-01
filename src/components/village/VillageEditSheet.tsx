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
import {
  useUpsertVet, useUpsertWalker, useUpsertDaycare, useUpsertGroomer,
  useUpsertEmergencyContact, useDeleteEmergencyContact,
  useEmergencyContacts,
  type Category,
} from "@/hooks/useVillageMembers";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneInput } from "./PhoneInput";
import { AddressFields, parseAddress, serializeAddress, type AddressData } from "./AddressFields";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  petName: string;
  category: Category;
  existingId?: string;
  existingData?: Record<string, any>;
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
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {date ? format(date, "MMM d, yyyy") : "MM/DD/YYYY"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))} className={cn("p-3 pointer-events-auto")} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const VillageEditSheet = ({ open, onOpenChange, petId, petName, category, existingId, existingData }: Props) => {
  const [fields, setFields] = useState<Record<string, any>>(existingData ?? {});
  const { user } = useAuth();

  const upsertVet = useUpsertVet();
  const upsertWalker = useUpsertWalker();
  const upsertDaycare = useUpsertDaycare();
  const upsertGroomer = useUpsertGroomer();
  const upsertEmergency = useUpsertEmergencyContact();

  const set = (key: string, val: any) => setFields((d) => ({ ...d, [key]: val }));

  const isPending = upsertVet.isPending || upsertWalker.isPending || upsertDaycare.isPending || upsertGroomer.isPending || upsertEmergency.isPending;

  const handleSave = async () => {
    const opts = {
      onSuccess: () => { toast.success("Saved"); onOpenChange(false); },
      onError: () => toast.error("Failed to save"),
    };

    // Strip out fields that shouldn't go to DB
    const { id: _id, pet_id: _pid, user_id: _uid, created_at: _ca, updated_at: _ua, ...cleanFields } = fields;

    switch (category) {
      case "vet":
        upsertVet.mutate({ id: existingId, pet_id: petId, data: cleanFields }, opts);
        break;
      case "walker":
        upsertWalker.mutate({ id: existingId, pet_id: petId, data: cleanFields }, opts);
        break;
      case "daycare":
        upsertDaycare.mutate({ id: existingId, pet_id: petId, data: cleanFields }, opts);
        break;
      case "groomer":
        upsertGroomer.mutate({ id: existingId, pet_id: petId, data: cleanFields }, opts);
        break;
      case "emergency": {
        // Emergency contacts are individual rows
        const contacts = fields.contacts ?? [];
        for (let i = 0; i < contacts.length; i++) {
          const c = contacts[i];
          if (!c.name && !c.phone) continue;
          const { id: cId, pet_id: _p, user_id: _u, created_at: _c, updated_at: _uu, ...contactData } = c;
          await upsertEmergency.mutateAsync({
            id: c.id,
            pet_id: petId,
            data: { ...contactData, priority: i + 1 },
          });
        }
        toast.success("Saved");
        onOpenChange(false);
        break;
      }
    }
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setFields(existingData ?? {});
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="bottom" className="rounded-t-2xl h-[85vh]">
        <SheetHeader>
          <SheetTitle>
            {existingId || (category === "emergency" && existingData) ? "Edit" : "Add"} {getCategoryTitle(category)}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(85vh-8rem)] pr-2">
          <div className="flex flex-col gap-4 pt-4 pb-4">
            {category === "vet" && <VetFields fields={fields} set={set} />}
            {category === "walker" && <WalkerFields fields={fields} set={set} petName={petName} />}
            {category === "daycare" && <DaycareFields fields={fields} set={set} petName={petName} />}
            {category === "groomer" && <GroomerFields fields={fields} set={set} />}
            {category === "emergency" && <EmergencyFields fields={fields} set={set} />}
          </div>
        </ScrollArea>
        <div className="pt-2">
          <Button onClick={handleSave} disabled={isPending} className="w-full">
            {isPending ? "Saving…" : "Save"}
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
function VetFields({ fields, set }: { fields: Record<string, any>; set: (k: string, v: any) => void }) {
  const lastCheckup = fields.last_checkup_date ? parseISO(fields.last_checkup_date) : null;
  const nextCheckup = lastCheckup ? addYears(lastCheckup, 1) : null;
  const daysUntil = nextCheckup ? differenceInDays(nextCheckup, new Date()) : null;
  const address = parseAddress(fields.address);

  return (
    <>
      <Field label="Clinic Name" value={fields.clinic_name} onChange={(v) => set("clinic_name", v)} />
      <Field label="Veterinarian Name" value={fields.vet_name} onChange={(v) => set("vet_name", v)} />
      <PhoneInput value={fields.phone} onChange={(v) => set("phone", v)} />
      <Field label="Email" value={fields.email} onChange={(v) => set("email", v)} type="email" />
      <AddressFields address={address} onChange={(a) => set("address", serializeAddress(a))} />
      <div className="flex items-center justify-between">
        <Label>Annual Check-Up Reminder</Label>
        <Switch checked={!!fields.checkup_reminder_enabled} onCheckedChange={(v) => set("checkup_reminder_enabled", v)} />
      </div>
      <DateField label="Date of Last Check-Up" value={fields.last_checkup_date ?? ""} onChange={(v) => set("last_checkup_date", v)} />
      {daysUntil !== null && (
        <p className="text-sm text-primary font-medium">
          Next check-up {daysUntil > 0 ? `in ${daysUntil} days` : daysUntil === 0 ? "is today!" : `was ${Math.abs(daysUntil)} days ago`}
        </p>
      )}
    </>
  );
}

// ── WALKER ──
function WalkerFields({ fields, set, petName }: { fields: Record<string, any>; set: (k: string, v: any) => void; petName: string }) {
  const started = fields.started_date ? parseISO(fields.started_date) : null;
  const months = started ? differenceInMonths(new Date(), started) : null;

  return (
    <>
      <Field label="Walker Name" value={fields.name} onChange={(v) => set("name", v)} />
      <PhoneInput value={fields.phone} onChange={(v) => set("phone", v)} />
      <Field label="Email" value={fields.email} onChange={(v) => set("email", v)} type="email" />
      <DateField label={`Started with ${petName} on`} value={fields.started_date ?? ""} onChange={(v) => set("started_date", v)} />
      {months !== null && months > 0 && <p className="text-sm text-primary font-medium">Walking together for {months} month{months !== 1 ? "s" : ""}</p>}
      <div>
        <Label>Notes</Label>
        <Textarea placeholder="Schedule, preferences..." value={fields.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </div>
    </>
  );
}

// ── DAYCARE ──
function DaycareFields({ fields, set, petName }: { fields: Record<string, any>; set: (k: string, v: any) => void; petName: string }) {
  const started = fields.started_date ? parseISO(fields.started_date) : null;
  const months = started ? differenceInMonths(new Date(), started) : null;
  const friends: string[] = fields.friends ?? [];
  const [friendInput, setFriendInput] = useState("");
  const address = parseAddress(fields.address);

  const addFriend = () => {
    const name = friendInput.trim();
    if (name && !friends.includes(name)) {
      set("friends", [...friends, name]);
      setFriendInput("");
    }
  };

  return (
    <>
      <Field label="Facility Name" value={fields.facility_name} onChange={(v) => set("facility_name", v)} />
      <PhoneInput value={fields.phone} onChange={(v) => set("phone", v)} />
      <Field label="Email" value={fields.email} onChange={(v) => set("email", v)} type="email" />
      <AddressFields address={address} onChange={(a) => set("address", serializeAddress(a))} />
      <DateField label="Started on" value={fields.started_date ?? ""} onChange={(v) => set("started_date", v)} />
      {months !== null && months > 0 && <p className="text-sm text-primary font-medium">Attending for {months} month{months !== 1 ? "s" : ""}</p>}
      <Field label="Favorite Caretaker" value={fields.favorite_caretaker} onChange={(v) => set("favorite_caretaker", v)} />
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
                <button onClick={() => set("friends", friends.filter((x) => x !== f))} aria-label={`Remove ${f}`}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea placeholder="Schedule, special instructions..." value={fields.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </div>
    </>
  );
}

// ── GROOMER ──
function GroomerFields({ fields, set }: { fields: Record<string, any>; set: (k: string, v: any) => void }) {
  const services: string[] = fields.preferred_services ?? [];
  const freq = fields.frequency ?? "";
  const lastAppt = fields.last_appointment_date ? parseISO(fields.last_appointment_date) : null;

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
      <Field label="Salon Name" value={fields.salon_name} onChange={(v) => set("salon_name", v)} />
      <Field label="Groomer Name" value={fields.groomer_name} onChange={(v) => set("groomer_name", v)} />
      <PhoneInput value={fields.phone} onChange={(v) => set("phone", v)} />
      <Field label="Email" value={fields.email} onChange={(v) => set("email", v)} type="email" />

      <div>
        <Label>Preferred Services</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {GROOMER_SERVICES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={services.includes(s)}
                onCheckedChange={(checked) => {
                  set("preferred_services", checked ? [...services, s] : services.filter((x) => x !== s));
                }}
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Frequency</Label>
        <Select value={freq} onValueChange={(v) => set("frequency", v)}>
          <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
          <SelectContent>
            {GROOMER_FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label>Re-book Reminder</Label>
        <Switch checked={!!fields.rebook_reminder_enabled} onCheckedChange={(v) => set("rebook_reminder_enabled", v)} />
      </div>

      <DateField label="Date of Last Appointment" value={fields.last_appointment_date ?? ""} onChange={(v) => set("last_appointment_date", v)} />
      {daysUntil !== null && (
        <p className="text-sm text-primary font-medium">
          Next appointment {daysUntil > 0 ? `in ${daysUntil} days` : daysUntil === 0 ? "is today!" : `was ${Math.abs(daysUntil)} days ago`}
        </p>
      )}

      <div>
        <Label>Notes</Label>
        <Textarea placeholder="Grooming preferences..." value={fields.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </div>
    </>
  );
}

// ── EMERGENCY ──
function EmergencyFields({ fields, set }: { fields: Record<string, any>; set: (k: string, v: any) => void }) {
  const contacts = fields.contacts ?? [{}, {}, {}];
  const updateContact = (idx: number, key: string, val: string) => {
    const updated = [...contacts];
    updated[idx] = { ...updated[idx], [key]: val };
    set("contacts", updated);
  };

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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
            <Input
              type="tel"
              placeholder="(555) 555-5555"
              value={contacts[i]?.phone ?? ""}
              onChange={(e) => updateContact(i, "phone", formatPhone(e.target.value))}
            />
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
