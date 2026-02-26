import { useState } from "react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddPetWeight } from "@/hooks/usePetWeights";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
}

export const AddWeightSheet = ({ open, onOpenChange, petId }: Props) => {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const addWeight = useAddPetWeight();

  const handleSave = () => {
    const val = parseFloat(weight);
    if (!val || val <= 0) {
      toast.error("Enter a valid weight");
      return;
    }
    addWeight.mutate(
      { pet_id: petId, weight_value: val, weight_unit: unit, recorded_date: format(date, "yyyy-MM-dd"), note },
      {
        onSuccess: () => {
          toast.success("Weight recorded");
          setWeight("");
          setNote("");
          setDate(new Date());
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to save weight"),
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add Weight</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 pt-4">
          {/* Weight + unit toggle */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Weight</Label>
              <Input type="number" inputMode="decimal" placeholder="0.0" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["lbs", "kg"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${unit === u ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} disabled={(d) => d > new Date()} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note */}
          <div>
            <Label>Note (optional)</Label>
            <Textarea placeholder="e.g. After morning walk" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>

          <Button onClick={handleSave} disabled={addWeight.isPending} className="w-full">
            {addWeight.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
