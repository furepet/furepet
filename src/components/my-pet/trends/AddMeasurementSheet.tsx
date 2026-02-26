import { useState } from "react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddPetMeasurement } from "@/hooks/usePetMeasurements";
import { toast } from "sonner";

const CATEGORIES = ["Neck", "Back Length", "Chest/Girth", "Paw/Foot", "Height (at shoulder)", "Other"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
}

export const AddMeasurementSheet = ({ open, onOpenChange, petId }: Props) => {
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [date, setDate] = useState<Date>(new Date());
  const addMeasurement = useAddPetMeasurement();

  const handleSave = () => {
    const v = parseFloat(value);
    if (!category) { toast.error("Select a category"); return; }
    if (category === "Other" && !customCategory.trim()) { toast.error("Enter a measurement name"); return; }
    if (!v || v <= 0) { toast.error("Enter a valid measurement"); return; }

    addMeasurement.mutate(
      {
        pet_id: petId,
        category: category === "Other" ? customCategory.trim() : category,
        custom_category: category === "Other" ? customCategory.trim() : "",
        measurement_value: v,
        measurement_unit: unit,
        recorded_date: format(date, "yyyy-MM-dd"),
      },
      {
        onSuccess: () => {
          toast.success("Measurement saved");
          setCategory("");
          setCustomCategory("");
          setValue("");
          setDate(new Date());
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to save"),
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add Measurement</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 pt-4">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category === "Other" && (
            <div>
              <Label>Measurement Name</Label>
              <Input placeholder="e.g. Tail length" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Value</Label>
              <Input type="number" inputMode="decimal" placeholder="0.0" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["in", "cm"] as const).map((u) => (
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

          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} disabled={(d) => d > new Date()} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleSave} disabled={addMeasurement.isPending} className="w-full">
            {addMeasurement.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
