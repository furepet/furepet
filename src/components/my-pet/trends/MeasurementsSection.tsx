import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Pet } from "@/hooks/usePets";
import { usePetMeasurements, useDeletePetMeasurement, type PetMeasurement } from "@/hooks/usePetMeasurements";
import { AddMeasurementSheet } from "./AddMeasurementSheet";
import { EditMeasurementSheet } from "./EditMeasurementSheet";
import { toast } from "sonner";

interface Props {
  pet: Pet;
}

export const MeasurementsSection = ({ pet }: Props) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editMeasurement, setEditMeasurement] = useState<PetMeasurement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: measurements = [], isLoading } = usePetMeasurements(pet.id);
  const deleteMeasurement = useDeletePetMeasurement();

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof measurements>();
    measurements.forEach((m) => {
      const key = m.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return map;
  }, [measurements]);

  if (isLoading) {
    return <div className="h-40 rounded-xl bg-muted animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Measurements</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Measurement
        </Button>
      </div>

      <p className="text-xs text-muted-foreground -mt-2">
        These measurements help determine clothing, harness, and shoe sizes for {pet.pet_name}.
      </p>

      {grouped.size === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground rounded-xl bg-card border border-border">
          No measurements yet. Tap "Add Measurement" to start.
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {Array.from(grouped.entries()).map(([cat, items]) => {
            const latest = items[0]; // already sorted desc
            return (
              <AccordionItem key={cat} value={cat} className="rounded-xl bg-card border border-border px-4 overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    <div>
                      <p className="text-sm font-medium text-foreground">{cat}</p>
                      <p className="text-xs text-muted-foreground">
                        Latest: {Number(latest.measurement_value)} {latest.measurement_unit} — {format(parseISO(latest.recorded_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="divide-y divide-border -mx-4">
                    {items.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                        <div>
                          <p className="text-sm text-foreground">
                            {Number(m.measurement_value)} {m.measurement_unit}
                          </p>
                          <p className="text-xs text-muted-foreground">{format(parseISO(m.recorded_date), "PPP")}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setEditMeasurement(m)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(m.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <AddMeasurementSheet open={addOpen} onOpenChange={setAddOpen} petId={pet.id} />
      <EditMeasurementSheet measurement={editMeasurement} onOpenChange={(open) => { if (!open) setEditMeasurement(null); }} petId={pet.id} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete measurement?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMeasurement.mutate({ id: deleteId, petId: pet.id }, {
                    onSuccess: () => toast.success("Deleted"),
                    onError: () => toast.error("Failed to delete"),
                  });
                }
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
