import { useState } from "react";
import { format, parseISO, isBefore, differenceInDays } from "date-fns";
import { Plus, Trash2, Syringe, ClipboardList, Pill, Activity, Brain, AlertTriangle, Eye, ChevronRight, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useVaccines, useDiagnoses, useMedications, useSurgeries,
  useBehavioralIssues, useAllergies, useObservations,
  useAddMedicalRecord, useUpdateMedicalRecord, useDeleteMedicalRecord,
  type MedicalCategory, type Vaccine, type Diagnosis, type Medication,
  type Surgery, type BehavioralIssue, type Allergy, type Observation,
} from "@/hooks/useMedicalRecords";
import { toast } from "sonner";

type CategoryDef = { key: MedicalCategory; label: string; icon: React.ElementType };

const CATEGORIES: CategoryDef[] = [
  { key: "vaccine", label: "Vaccine History", icon: Syringe },
  { key: "diagnosis", label: "Diagnoses", icon: ClipboardList },
  { key: "medication", label: "Medications", icon: Pill },
  { key: "surgery", label: "Surgeries", icon: Activity },
  { key: "behavioral", label: "Behavioral Issues", icon: Brain },
  { key: "allergy", label: "Allergies", icon: AlertTriangle },
  { key: "observation", label: "Observations", icon: Eye },
];

const VACCINE_NAMES = ["Rabies", "DHPP/DHLPP", "Bordetella", "Leptospirosis", "Canine Influenza", "Lyme Disease", "FVRCP", "FeLV", "Other"];
const MED_FREQUENCIES = ["Once daily", "Twice daily", "As needed", "Weekly", "Monthly", "Other"];
const ALLERGY_TYPES = ["Food", "Environmental", "Medication", "Contact", "Other"];
const OBSERVATION_STATUSES = ["New", "Monitoring", "Vet Reviewed", "Resolved"];

// Unified record type for display purposes
interface DisplayRecord {
  id: string;
  category: MedicalCategory;
  name: string;
  date: string | null;
  data: Record<string, any>;
}

function toDisplayRecords(category: MedicalCategory, items: any[]): DisplayRecord[] {
  return items.map((item) => {
    let name = "";
    let date: string | null = null;
    switch (category) {
      case "vaccine": name = item.vaccine_name; date = item.date_administered; break;
      case "diagnosis": name = item.diagnosis_name; date = item.date_diagnosed; break;
      case "medication": name = item.medication_name; date = item.start_date; break;
      case "surgery": name = item.procedure_name; date = item.date; break;
      case "behavioral": name = item.issue; date = item.first_noticed; break;
      case "allergy": name = item.allergen; date = item.date_identified; break;
      case "observation": name = item.title; date = item.date_first_noticed; break;
    }
    return { id: item.id, category, name, date, data: item };
  });
}

interface Props { petId: string }

export const MedicalSections = ({ petId }: Props) => {
  const vaccines = useVaccines(petId);
  const diagnoses = useDiagnoses(petId);
  const medications = useMedications(petId);
  const surgeries = useSurgeries(petId);
  const behavioralIssues = useBehavioralIssues(petId);
  const allergies = useAllergies(petId);
  const observations = useObservations(petId);

  const dataMap: Record<MedicalCategory, any[]> = {
    vaccine: vaccines.data ?? [],
    diagnosis: diagnoses.data ?? [],
    medication: medications.data ?? [],
    surgery: surgeries.data ?? [],
    behavioral: behavioralIssues.data ?? [],
    allergy: allergies.data ?? [],
    observation: observations.data ?? [],
  };

  const [expandedCat, setExpandedCat] = useState<MedicalCategory | null>(null);
  const [addCat, setAddCat] = useState<MedicalCategory | null>(null);
  const [editRecord, setEditRecord] = useState<DisplayRecord | null>(null);

  // Upcoming vaccines
  const upcomingVaccines = (dataMap.vaccine as Vaccine[]).filter((v) => {
    if (!v.next_due_date) return false;
    const days = differenceInDays(parseISO(v.next_due_date), new Date());
    return days >= 0 && days <= 90;
  });

  const activeAllergies = dataMap.allergy as Allergy[];

  return (
    <div className="flex flex-col gap-3">
      {activeAllergies.length > 0 && (
        <div className="rounded-xl border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Known Allergies</p>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            {activeAllergies.map((a) => a.allergen).join(", ")}
          </p>
        </div>
      )}

      {upcomingVaccines.length > 0 && (
        <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 p-3">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">🔔 Upcoming Vaccines</p>
          {upcomingVaccines.map((v) => {
            const days = differenceInDays(parseISO(v.next_due_date!), new Date());
            return (
              <p key={v.id} className="text-xs text-yellow-700 dark:text-yellow-400">
                {v.vaccine_name} — due in {days} day{days !== 1 ? "s" : ""} ({format(parseISO(v.next_due_date!), "MMM d, yyyy")})
              </p>
            );
          })}
        </div>
      )}

      {CATEGORIES.map((cat) => {
        const items = dataMap[cat.key];
        const displayItems = toDisplayRecords(cat.key, items);
        const latest = displayItems[0];
        return (
          <Card key={cat.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setExpandedCat(cat.key)}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <cat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{cat.label}</p>
                <p className="text-xs text-muted-foreground">
                  {items.length > 0
                    ? `${items.length} entr${items.length > 1 ? "ies" : "y"} · Last: ${latest?.date ? format(parseISO(latest.date), "MMM d, yyyy") : "N/A"}`
                    : "No entries yet"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            </CardContent>
          </Card>
        );
      })}

      {expandedCat && (
        <CategoryDetailSheet
          category={expandedCat}
          records={toDisplayRecords(expandedCat, dataMap[expandedCat])}
          petId={petId}
          onClose={() => setExpandedCat(null)}
          onAdd={() => setAddCat(expandedCat)}
          onEdit={(r) => setEditRecord(r)}
        />
      )}

      {(addCat || editRecord) && (
        <RecordFormSheet
          category={editRecord?.category ?? addCat!}
          petId={petId}
          existing={editRecord}
          onClose={() => { setAddCat(null); setEditRecord(null); }}
        />
      )}
    </div>
  );
};

// ── Category Detail Sheet ──
function CategoryDetailSheet({ category, records, petId, onClose, onAdd, onEdit }: {
  category: MedicalCategory; records: DisplayRecord[]; petId: string; onClose: () => void; onAdd: () => void; onEdit: (r: DisplayRecord) => void;
}) {
  const deleteRecord = useDeleteMedicalRecord();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [medTab, setMedTab] = useState<"current" | "past">("current");
  const catDef = CATEGORIES.find((c) => c.key === category)!;

  let filtered = records;

  if (category === "diagnosis" && statusFilter !== "all") {
    filtered = records.filter((r) => r.data.status === statusFilter);
  }

  if (category === "medication") {
    filtered = records.filter((r) => {
      const endDate = r.data.end_date;
      const isCurrent = !endDate || !isBefore(parseISO(endDate), new Date());
      return medTab === "current" ? isCurrent : !isCurrent;
    });
  }

  return (
    <>
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="rounded-t-2xl h-[80vh]">
          <SheetHeader><SheetTitle>{catDef.label}</SheetTitle></SheetHeader>

          {category === "diagnosis" && (
            <div className="flex gap-1 pt-3">
              {["all", "Active", "Resolved", "Monitoring"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >{s === "all" ? "All" : s}</button>
              ))}
            </div>
          )}

          {category === "medication" && (
            <div className="flex gap-1 pt-3">
              {(["current", "past"] as const).map((t) => (
                <button key={t} onClick={() => setMedTab(t)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${medTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >{t === "current" ? "Current" : "Past"}</button>
              ))}
            </div>
          )}

          <ScrollArea className="h-[calc(80vh-10rem)] pt-3">
            <div className="flex flex-col gap-2 pr-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No entries yet</p>
              ) : (
                filtered.map((r) => (
                  <div key={r.id} className="flex items-start gap-2 rounded-lg border border-border p-3">
                    <button onClick={() => onEdit(r)} className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      {r.date && <p className="text-xs text-muted-foreground">{format(parseISO(r.date), "PPP")}</p>}
                      <RecordSummary category={category} data={r.data} />
                    </button>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => onEdit(r)} className="p-1 text-muted-foreground hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="pt-2">
            <Button onClick={onAdd} className="w-full"><Plus className="h-4 w-4 mr-1" /> Add Entry</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete record?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteRecord.mutate({ id: deleteId, petId, category }, { onSuccess: () => toast.success("Deleted"), onError: () => toast.error("Failed") }); setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RecordSummary({ category, data: d }: { category: MedicalCategory; data: Record<string, any> }) {
  return (
    <div className="mt-0.5 space-y-0.5">
      {d.status && <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${d.status === "Active" || d.status === "Current" || d.status === "active" ? "bg-primary/10 text-primary" : d.status === "Resolved" || d.status === "resolved" ? "bg-muted text-muted-foreground" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>{d.status}</span>}
      {d.dosage && <p className="text-xs text-muted-foreground">Dosage: {d.dosage}</p>}
      {d.frequency && <p className="text-xs text-muted-foreground">Frequency: {d.frequency}</p>}
      {d.severity && <p className="text-xs text-muted-foreground">Severity: {d.severity}</p>}
      {d.type && <p className="text-xs text-muted-foreground">Type: {d.type}</p>}
      {d.reaction && <p className="text-xs text-muted-foreground">Reaction: {d.reaction}</p>}
      {d.next_due_date && <p className="text-xs text-primary font-medium">Next due: {format(parseISO(d.next_due_date), "MMM d, yyyy")}</p>}
      {d.body_location && <p className="text-xs text-muted-foreground">Location: {d.body_location}</p>}
      {d.notes && <p className="text-xs text-muted-foreground line-clamp-2">{d.notes}</p>}
    </div>
  );
}

// ── Unified Record Form Sheet ──
function RecordFormSheet({ category, petId, existing, onClose }: { category: MedicalCategory; petId: string; existing: DisplayRecord | null; onClose: () => void }) {
  const isEdit = !!existing;
  const addRecord = useAddMedicalRecord();
  const updateRecord = useUpdateMedicalRecord();
  const catDef = CATEGORIES.find((c) => c.key === category)!;

  const d = existing?.data ?? {};

  // Name/title
  const [name, setName] = useState(existing?.name ?? "");
  const [date, setDate] = useState<Date | undefined>(() => {
    const dateStr = existing?.date;
    return dateStr ? parseISO(dateStr) : new Date();
  });

  // Shared
  const [notes, setNotes] = useState(d.notes ?? d.outcome_notes ?? "");
  const [vet, setVet] = useState(d.administering_vet ?? d.diagnosing_vet ?? d.prescribing_vet ?? d.surgeon_clinic ?? "");

  // Vaccine
  const [nextDueDate, setNextDueDate] = useState(d.next_due_date ?? "");
  const [lotNumber, setLotNumber] = useState(d.lot_number ?? "");

  // Diagnosis
  const [diagStatus, setDiagStatus] = useState(d.status ?? "active");

  // Medication
  const [dosage, setDosage] = useState(d.dosage ?? "");
  const [frequency, setFrequency] = useState(d.frequency ?? "");
  const [endDate, setEndDate] = useState(d.end_date ?? "");
  const [refillReminder, setRefillReminder] = useState(d.refill_reminder_enabled ?? false);
  const [refillDate, setRefillDate] = useState(d.refill_date ?? "");

  // Surgery
  const [reason, setReason] = useState(d.reason ?? "");
  const [outcome, setOutcome] = useState(d.outcome_notes ?? "");

  // Behavioral
  const [severity, setSeverity] = useState(d.severity ?? "Mild");
  const [behavStatus, setBehavStatus] = useState(d.status ?? "active");
  const [treatment, setTreatment] = useState(d.treatment_plan ?? "");

  // Allergy
  const [allergyType, setAllergyType] = useState(d.type ?? "");
  const [reaction, setReaction] = useState(d.reaction ?? "");
  const [allergySeverity, setAllergySeverity] = useState(d.severity ?? "Mild");

  // Observation
  const [bodyLocation, setBodyLocation] = useState(d.body_location ?? "");
  const [sizeDescription, setSizeDescription] = useState(d.size_description ?? "");
  const [obsStatus, setObsStatus] = useState(d.status ?? "New");
  const [followUpDate, setFollowUpDate] = useState(d.follow_up_date ?? "");

  const isPending = addRecord.isPending || updateRecord.isPending;

  const buildData = (): Record<string, any> => {
    const dateStr = date ? format(date, "yyyy-MM-dd") : null;

    switch (category) {
      case "vaccine":
        return { vaccine_name: name, date_administered: dateStr, administering_vet: vet, next_due_date: nextDueDate || null, lot_number: lotNumber, notes };
      case "diagnosis":
        return { diagnosis_name: name, date_diagnosed: dateStr, diagnosing_vet: vet, status: diagStatus, notes };
      case "medication":
        return {
          medication_name: name, start_date: dateStr, dosage, frequency,
          end_date: endDate || null, prescribing_vet: vet,
          status: endDate && isBefore(parseISO(endDate), new Date()) ? "discontinued" : "active",
          refill_reminder_enabled: refillReminder, refill_date: refillDate || null, notes,
        };
      case "surgery":
        return { procedure_name: name, date: dateStr, surgeon_clinic: vet, reason, outcome_notes: outcome };
      case "behavioral":
        return { issue: name, first_noticed: dateStr, severity, status: behavStatus, treatment_plan: treatment, notes };
      case "allergy":
        return { allergen: name, date_identified: dateStr, type: allergyType, reaction, severity: allergySeverity, notes };
      case "observation":
        return { title: name, date_first_noticed: dateStr, body_location: bodyLocation, size_description: sizeDescription, status: obsStatus, follow_up_date: followUpDate || null, notes };
    }
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Name/title is required"); return; }
    const data = buildData();

    if (isEdit && existing) {
      updateRecord.mutate({ id: existing.id, pet_id: petId, category, data }, {
        onSuccess: () => { toast.success("Updated"); onClose(); },
        onError: () => toast.error("Failed to update"),
      });
    } else {
      addRecord.mutate({ pet_id: petId, category, data }, {
        onSuccess: () => { toast.success("Added"); onClose(); },
        onError: () => toast.error("Failed to save"),
      });
    }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl h-[85vh]">
        <SheetHeader><SheetTitle>{isEdit ? "Edit" : "Add"} {catDef.label.replace(/ies$/, "y").replace(/s$/, "")}</SheetTitle></SheetHeader>
        <ScrollArea className="h-[calc(85vh-9rem)] pr-2">
          <div className="flex flex-col gap-4 pt-4 pb-2">

            {category === "vaccine" ? (
              <div>
                <Label>Vaccine Name</Label>
                <Select value={name} onValueChange={setName}>
                  <SelectTrigger><SelectValue placeholder="Select vaccine" /></SelectTrigger>
                  <SelectContent>{VACCINE_NAMES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>{category === "allergy" ? "Allergen" : category === "observation" ? "Title" : category === "behavioral" ? "Issue" : "Name"}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={
                  category === "medication" ? "e.g. Apoquel" : category === "allergy" ? "e.g. Chicken" : category === "behavioral" ? "e.g. Separation anxiety" : category === "observation" ? "e.g. New lump on left shoulder" : "Enter name"
                } />
              </div>
            )}

            <DateField label={category === "behavioral" ? "First Noticed" : category === "allergy" ? "Date Identified" : category === "observation" ? "Date First Noticed" : category === "vaccine" ? "Date Administered" : category === "surgery" ? "Date of Surgery" : "Date"} value={date} onChange={setDate} />

            {category === "vaccine" && (
              <>
                <div><Label>Administering Vet/Clinic</Label><Input value={vet} onChange={(e) => setVet(e.target.value)} /></div>
                <DateFieldStr label="Next Due Date" value={nextDueDate} onChange={setNextDueDate} />
                <div><Label>Lot Number</Label><Input value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} /></div>
              </>
            )}

            {category === "diagnosis" && (
              <>
                <div><Label>Diagnosing Vet</Label><Input value={vet} onChange={(e) => setVet(e.target.value)} /></div>
                <div>
                  <Label>Status</Label>
                  <RadioGroup value={diagStatus} onValueChange={setDiagStatus} className="flex gap-4 mt-1">
                    {["active", "resolved", "monitoring"].map((s) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <RadioGroupItem value={s} id={`diag-${s}`} />
                        <Label htmlFor={`diag-${s}`} className="text-sm font-normal capitalize">{s}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {category === "medication" && (
              <>
                <div><Label>Dosage</Label><Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 50mg" /></div>
                <div>
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                    <SelectContent>{MED_FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <DateFieldStr label="End Date (blank if ongoing)" value={endDate} onChange={setEndDate} />
                <div><Label>Prescribing Vet</Label><Input value={vet} onChange={(e) => setVet(e.target.value)} /></div>
                <div className="flex items-center justify-between">
                  <Label>Refill Reminder</Label>
                  <Switch checked={refillReminder} onCheckedChange={setRefillReminder} />
                </div>
                {refillReminder && <DateFieldStr label="Refill Date" value={refillDate} onChange={setRefillDate} />}
              </>
            )}

            {category === "surgery" && (
              <>
                <div><Label>Surgeon/Clinic</Label><Input value={vet} onChange={(e) => setVet(e.target.value)} /></div>
                <div><Label>Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} /></div>
                <div><Label>Outcome/Notes</Label><Textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={2} /></div>
              </>
            )}

            {category === "behavioral" && (
              <>
                <div>
                  <Label>Severity</Label>
                  <RadioGroup value={severity} onValueChange={setSeverity} className="flex gap-4 mt-1">
                    {["Mild", "Moderate", "Severe"].map((s) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <RadioGroupItem value={s} id={`bsev-${s}`} />
                        <Label htmlFor={`bsev-${s}`} className="text-sm font-normal">{s}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label>Status</Label>
                  <RadioGroup value={behavStatus} onValueChange={setBehavStatus} className="flex gap-4 mt-1">
                    {["active", "improving", "resolved"].map((s) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <RadioGroupItem value={s} id={`bstat-${s}`} />
                        <Label htmlFor={`bstat-${s}`} className="text-sm font-normal capitalize">{s}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div><Label>Treatment/Plan</Label><Textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={2} /></div>
              </>
            )}

            {category === "allergy" && (
              <>
                <div>
                  <Label>Type</Label>
                  <Select value={allergyType} onValueChange={setAllergyType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{ALLERGY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Reaction</Label><Textarea value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="e.g. Hives, vomiting" rows={2} /></div>
                <div>
                  <Label>Severity</Label>
                  <RadioGroup value={allergySeverity} onValueChange={setAllergySeverity} className="flex gap-4 mt-1">
                    {["Mild", "Moderate", "Severe"].map((s) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <RadioGroupItem value={s} id={`asev-${s}`} />
                        <Label htmlFor={`asev-${s}`} className="text-sm font-normal">{s}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {category === "observation" && (
              <>
                <div><Label>Location on Body</Label><Input value={bodyLocation} onChange={(e) => setBodyLocation(e.target.value)} placeholder="e.g. Left shoulder" /></div>
                <div><Label>Size/Description</Label><Textarea value={sizeDescription} onChange={(e) => setSizeDescription(e.target.value)} rows={2} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={obsStatus} onValueChange={setObsStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{OBSERVATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <DateFieldStr label="Follow-up Date" value={followUpDate} onChange={setFollowUpDate} />
              </>
            )}

            {category !== "surgery" && (
              <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} /></div>
            )}
          </div>
        </ScrollArea>
        <div className="pt-2">
          <Button onClick={handleSave} disabled={isPending} className="w-full">
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Date helpers ──
function DateField({ label, value, onChange }: { label: string; value: Date | undefined; onChange: (d: Date | undefined) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {value ? format(value, "MMM d, yyyy") : "MM/DD/YYYY"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} className={cn("p-3 pointer-events-auto")} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DateFieldStr({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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
          <Calendar mode="single" selected={date} onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")} className={cn("p-3 pointer-events-auto")} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
