import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { useDeletePetWeight, type PetWeight } from "@/hooks/usePetWeights";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Props {
  weights: PetWeight[];
  petId: string;
}

export const WeightHistory = ({ weights, petId }: Props) => {
  const deleteWeight = useDeletePetWeight();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = [...weights].sort((a, b) => b.recorded_date.localeCompare(a.recorded_date));

  if (sorted.length === 0) return null;

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <h4 className="text-sm font-semibold text-foreground px-4 pt-4 pb-2">Weight History</h4>
      <div className="divide-y divide-border">
        {sorted.map((w) => (
          <div key={w.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {Number(w.weight_value)} {w.weight_unit}
              </p>
              <p className="text-xs text-muted-foreground">{format(parseISO(w.recorded_date), "PPP")}</p>
              {w.note && <p className="text-xs text-muted-foreground mt-0.5">{w.note}</p>}
            </div>
            <button onClick={() => setDeleteId(w.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete weight entry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteWeight.mutate({ id: deleteId, petId }, {
                    onSuccess: () => toast.success("Entry deleted"),
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
