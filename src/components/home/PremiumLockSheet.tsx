import { Lock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const premiumFeatures = [
  "Medical records & document uploads",
  "Weight & measurement tracking",
  "My Village (vet, groomer, walker, daycare)",
  "Vaccine reminders & medical history",
  "AI Pet Chat",
  "Rainbow Bridge Memorial",
  "Share with family and vet",
];

interface PremiumLockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartPremium?: () => void;
  upgrading?: boolean;
}

export const PremiumLockSheet = ({ open, onOpenChange, onStartPremium, upgrading }: PremiumLockSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8 pt-6">
      <SheetHeader className="items-center text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <SheetTitle className="text-xl">Unlock with Premium</SheetTitle>
        <SheetDescription>
          Get the full pet passport experience for just{" "}
          <span className="font-semibold text-foreground">$4.99/month</span>
        </SheetDescription>
      </SheetHeader>

      <ul className="mt-5 space-y-2.5">
        {premiumFeatures.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-foreground">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3">
        <Button
          className="h-12 w-full text-base font-semibold bg-primary hover:bg-primary/90"
          onClick={onStartPremium}
          disabled={upgrading}
        >
          {upgrading ? "Upgrading…" : "Start Premium"}
        </Button>
        <button
          onClick={() => onOpenChange(false)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </SheetContent>
  </Sheet>
);
