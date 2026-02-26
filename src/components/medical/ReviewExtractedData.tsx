import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddMedicalRecord } from "@/hooks/useMedicalRecords";
import { toast } from "sonner";

interface ExtractedItem {
  category: string;
  title: string;
  details: Record<string, any>;
  date?: string;
  selected: boolean;
}

interface Props {
  data: {
    vaccines?: any[];
    diagnoses?: any[];
    medications?: any[];
    surgeries?: any[];
    allergies?: any[];
  };
  petId: string;
  petName: string;
  documentId: string;
  onDone: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  vaccine: "Vaccine",
  diagnosis: "Diagnosis",
  medication: "Medication",
  surgery: "Surgery",
  allergy: "Allergy",
};

export const ReviewExtractedData = ({ data, petId, petName, documentId, onDone }: Props) => {
  const addRecord = useAddMedicalRecord();

  const buildItems = (): ExtractedItem[] => {
    const items: ExtractedItem[] = [];
    data.vaccines?.forEach((v) => items.push({ category: "vaccine", title: v.name, details: { notes: v.notes }, date: v.date, selected: true }));
    data.diagnoses?.forEach((d) => items.push({ category: "diagnosis", title: d.name, details: { notes: d.notes }, date: d.date, selected: true }));
    data.medications?.forEach((m) => items.push({ category: "medication", title: m.name, details: { dosage: m.dosage, frequency: m.frequency, start_date: m.start_date, end_date: m.end_date, notes: m.notes }, date: m.start_date, selected: true }));
    data.surgeries?.forEach((s) => items.push({ category: "surgery", title: s.name, details: { notes: s.notes }, date: s.date, selected: true }));
    data.allergies?.forEach((a) => items.push({ category: "allergy", title: a.name, details: { severity: a.severity, notes: a.notes }, selected: true }));
    return items;
  };

  const [items, setItems] = useState<ExtractedItem[]>(buildItems);
  const [saving, setSaving] = useState(false);

  const toggle = (idx: number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item)));
  };

  const totalFound = items.length;
  const selectedCount = items.filter((i) => i.selected).length;

  if (totalFound === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">No medical data could be extracted from this document.</p>
        <Button variant="outline" onClick={onDone}>Continue</Button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const selected = items.filter((i) => i.selected);
    try {
      for (const item of selected) {
        await addRecord.mutateAsync({
          pet_id: petId,
          category: item.category,
          title: item.title,
          details: item.details,
          record_date: item.date || undefined,
          source_document_id: documentId,
        });
      }
      toast.success(`${selected.length} record${selected.length > 1 ? "s" : ""} saved`);
      onDone();
    } catch {
      toast.error("Failed to save records");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <h3 className="text-base font-semibold text-foreground mb-1">Review Extracted Data</h3>
      <p className="text-xs text-muted-foreground mb-4">
        We found {totalFound} item{totalFound > 1 ? "s" : ""} in your document. Review and confirm.
      </p>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item, idx) => (
          <label key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <Checkbox checked={item.selected} onCheckedChange={() => toggle(idx)} className="mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground mt-1">{item.title}</p>
              {item.date && <p className="text-xs text-muted-foreground">{item.date}</p>}
              {item.details?.dosage && <p className="text-xs text-muted-foreground">Dosage: {item.details.dosage}</p>}
              {item.details?.notes && <p className="text-xs text-muted-foreground">{item.details.notes}</p>}
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={handleSave} disabled={saving || selectedCount === 0} className="flex-1">
          <Check className="h-4 w-4 mr-1" />
          {saving ? "Saving…" : `Save ${selectedCount} item${selectedCount > 1 ? "s" : ""}`}
        </Button>
        <Button variant="outline" onClick={onDone}>
          <X className="h-4 w-4 mr-1" /> Dismiss
        </Button>
      </div>
    </div>
  );
};
