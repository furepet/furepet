import { Check, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const FREE_FEATURES = [
  "Pet Basics profile",
  "Emergency CPR / First Aid guide",
];

const PREMIUM_FEATURES = [
  "Medical records & document uploads",
  "Weight & measurement tracking",
  "My Village (vet, groomer, walker, daycare, emergency contacts)",
  "Vaccine reminders & medical history",
  "AI Pet Chat",
  "Rainbow Bridge Memorial",
  "Share with family & vet",
];

type PremiumUpsellProps = {
  saving: boolean;
  onChoosePremium: () => void;
  onChooseFree: () => void;
};

export const PremiumUpsell = ({ saving, onChoosePremium, onChooseFree }: PremiumUpsellProps) => (
  <>
    <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">
      Want to unlock the full passport? 🎖️
    </h1>
    <p className="text-muted-foreground text-sm mb-6">
      Choose the plan that's right for you and {" "}
      <span className="font-medium text-foreground">your best friend</span>.
    </p>

    {/* Free tier */}
    <div className="rounded-xl border border-border p-4 mb-4">
      <h2 className="text-base font-semibold text-foreground mb-3">Free</h2>
      <ul className="space-y-2">
        {FREE_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
    </div>

    {/* Premium tier */}
    <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 relative">
      <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
        <Crown className="h-3 w-3" /> PREMIUM
      </div>
      <p className="text-lg font-bold text-foreground mt-2 mb-1">
        $4.99<span className="text-sm font-normal text-muted-foreground">/month</span>
      </p>

      <p className="text-xs text-muted-foreground mb-3">Everything in Free, plus:</p>
      <ul className="space-y-2">
        {PREMIUM_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
    </div>

    {/* CTA buttons */}
    <div className="mt-8 space-y-3">
      <Button
        type="button"
        onClick={onChoosePremium}
        disabled={saving}
        className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
      >
        {saving ? "Saving…" : "Start Premium"}
      </Button>
      <button
        type="button"
        onClick={onChooseFree}
        disabled={saving}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        Maybe Later — Continue with Free
      </button>
    </div>
  </>
);
