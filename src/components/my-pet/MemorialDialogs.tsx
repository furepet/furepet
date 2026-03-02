import { useState } from "react";
import { format } from "date-fns";
import { Heart } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/onboarding/DatePickerField";
import { useToast } from "@/hooks/use-toast";
import { saveData } from "@/lib/saveData";
import { useQueryClient } from "@tanstack/react-query";
import type { Pet } from "@/hooks/usePets";

interface MarkAsPassedDialogProps {
  pet: Pet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MarkAsPassedDialog = ({ pet, open, onOpenChange }: MarkAsPassedDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateOfPassing, setDateOfPassing] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!dateOfPassing) {
      toast({ title: "Please select a date", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await saveData({
        table: "pets",
        action: "update",
        data: {
          is_deceased: true,
          date_of_passing: format(dateOfPassing, "yyyy-MM-dd"),
          deceased_at: new Date().toISOString(),
        },
        match: { id: pet.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      onOpenChange(false);
      toast({ title: `Memorial created for ${pet.pet_name} 🌈` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
              <Heart className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">
            We're so sorry for your loss
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Would you like to create a memorial page for {pet.pet_name}?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <DatePickerField
            label="Date of Passing"
            value={dateOfPassing}
            onChange={setDateOfPassing}
            placeholder="Select date"
          />
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleConfirm}
            disabled={saving || !dateOfPassing}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {saving ? "Creating…" : "Create Memorial 🌈"}
          </Button>
          <AlertDialogCancel className="w-full mt-0">
            Not right now
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface RestoreProfileDialogProps {
  pet: Pet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RestoreProfileDialog = ({ pet, open, onOpenChange }: RestoreProfileDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const canRestore = (): boolean => {
    if (!pet.deceased_at) return false;
    const deceasedDate = new Date(pet.deceased_at);
    const daysSince = (Date.now() - deceasedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30;
  };

  const handleRestore = async () => {
    setSaving(true);
    try {
      await saveData({
        table: "pets",
        action: "update",
        data: {
          is_deceased: false,
          date_of_passing: null,
          deceased_at: null,
        },
        match: { id: pet.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      onOpenChange(false);
      toast({ title: `${pet.pet_name}'s profile restored!` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!canRestore()) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Restore Active Profile
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This will remove the memorial and restore {pet.pet_name}'s profile to active status. Memorial photos and messages will be preserved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleRestore} disabled={saving} className="w-full">
            {saving ? "Restoring…" : "Restore Profile"}
          </Button>
          <AlertDialogCancel className="w-full mt-0">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
