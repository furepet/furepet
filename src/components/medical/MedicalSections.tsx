import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, Syringe, ClipboardList, Pill, Activity, Brain, AlertTriangle, Eye, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMedicalRecords, useAddMedicalRecord, useDeleteMedicalRecord, type MedicalRecord } from "@/hooks/useMedicalRecords";
import { toast } from "sonner";

type Category = "vaccine" | "diagnosis" | "medication" | "surgery" | "behavioral" | "allergy" | "observation";

interface CategoryDef {
  key: Category;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryDef[] = [
  { key: "vaccine", label: "Vaccine History", icon: Syringe },
  { key: "diagnosis", label: "Diagnoses", icon: ClipboardList },
  { key: "medication", label: "Medications", icon: Pill },
  { key: "surgery", label: "Surgeries", icon: Activity },
  { key: "behavioral", label: "Behavioral Issues", icon: Brain },
  { key: "allergy", label: "Allergies", icon: AlertTriangle },
  { key: "observation", label: "Observations", icon: Eye },
];

interface Props {
  petId: string;
}

export const MedicalSections = ({ petId }: Props) => {
  const { data: records = [] } = useMedicalRecords(petId);
  const [expandedCat, setExpandedCat] = useState<Category | null>(null);
  const [addCat, setAddCat] = useState<Category | null>(null);

  const byCategory = (cat: Category) => records.filter((r) => r.category === cat);

  return (
    <div className="flex flex-col gap-3">
      {CATEGORIES.map((cat) => {
        const items = byCategory(cat.key);
        const latest = items[0];
        return (
          <Card key={cat.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setExpandedCat(cat.key)}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <cat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{cat.label}</p>
                <p className="text-xs text-muted-foreground">
                  {items.length > 0
                    ? `${items.length} entr${items.length > 1 ? "ies" : "y"} · Last: ${latest?.record_date ? format(parseISO(latest.record_date), "MMM d, yyyy") : "N/A"}`
                    : "No entries yet"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        );
      })}

      {/* Expanded category sheet */}
      {expandedCat && (
        <CategoryDetailSheet
          category={expandedCat}
          records={byCategory(expandedCat)}
          petId={petId}
          onClose={() => setExpandedCat(null)}
          onAdd={() => { setAddCat(expandedCat); }}
        />
      )}

      {/* Add record sheet */}
      {addCat && (
        <AddRecordSheet
          category={addCat}
          petId={petId}
          onClose={() => setAddCat(null)}
        />
      )}
    </div>
  );
};

// ── Category Detail Sheet ──
function CategoryDetailSheet({ category, records, petId, onClose, onAdd }: {
  category: Category; records: MedicalRecord[]; petId: string; onClose: () => void; onAdd: () => void;
}) {
  const deleteRecord = useDeleteMedicalRecord();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const catDef = CATEGORIES.find((c) => c.key === category)!;

  return (
    <>
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="rounded-t-2xl h-[75vh]">
          <SheetHeader>
            <SheetTitle>{catDef.label}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 pt-4 overflow-y-auto h-[calc(75vh-8rem)]">
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No entries yet</p>
            ) : (
              records.map((r) => (
                <div key={r.id} className="flex items-start justify-between rounded-lg border border-border p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    {r.record_date && <p className="text-xs text-muted-foreground">{format(parseISO(r.record_date), "PPP")}</p>}
                    {r.details?.dosage && <p className="text-xs text-muted-foreground">Dosage: {r.details.dosage}</p>}
                    {r.details?.frequency && <p className="text-xs text-muted-foreground">Frequency: {r.details.frequency}</p>}
                    {r.details?.severity && <p className="text-xs text-muted-foreground">Severity: {r.details.severity}</p>}
                    {r.details?.notes && <p className="text-xs text-muted-foreground mt-1">{r.details.notes}</p>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="pt-2">
            <Button onClick={onAdd} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Add Entry
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete record?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteId) deleteRecord.mutate({ id: deleteId, petId }, {
                onSuccess: () => toast.success("Deleted"),
                onError: () => toast.error("Failed"),
              });
              setDeleteId(null);
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Add Record Sheet ──
function AddRecordSheet({ category, petId, onClose }: { category: Category; petId: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [severity, setSeverity] = useState("");
  const addRecord = useAddMedicalRecord();
  const catDef = CATEGORIES.find((c) => c.key === category)!;

  const handleSave = () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    const details: Record<string, any> = {};
    if (notes) details.notes = notes;
    if (dosage) details.dosage = dosage;
    if (frequency) details.frequency = frequency;
    if (severity) details.severity = severity;

    addRecord.mutate({
      pet_id: petId,
      category,
      title: title.trim(),
      details,
      record_date: date ? format(date, "yyyy-MM-dd") : undefined,
    }, {
      onSuccess: () => { toast.success("Record added"); onClose(); },
      onError: () => toast.error("Failed to save"),
    });
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add {catDef.label.replace(/s$/, "").replace(/ies$/, "y")}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 pt-4">
          <div>
            <Label>Name / Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`e.g. ${category === "vaccine" ? "Rabies" : category === "medication" ? "Apoquel" : "Description"}`} />
          </div>

          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {(category === "medication") && (
            <>
              <div><Label>Dosage</Label><Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 16mg" /></div>
              <div><Label>Frequency</Label><Input value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g. Once daily" /></div>
            </>
          )}

          {category === "allergy" && (
            <div><Label>Severity</Label><Input value={severity} onChange={(e) => setSeverity(e.target.value)} placeholder="e.g. Mild, Moderate, Severe" /></div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
          </div>

          <Button onClick={handleSave} disabled={addRecord.isPending} className="w-full">
            {addRecord.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
