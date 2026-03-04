import { useState } from "react";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CprIllustration } from "./CprIllustrations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CprStep {
  title: string;
  instruction: string;
}

const dogSteps: CprStep[] = [
  {
    title: "Check for responsiveness",
    instruction:
      "Tap your dog firmly and call their name. Look for any signs of movement, blinking, or response. If unresponsive, proceed immediately.",
  },
  {
    title: "Check for breathing",
    instruction:
      "Watch the chest for rise and fall. Place your hand near the nose and mouth to feel for airflow. If no breathing is detected, proceed to the next step.",
  },
  {
    title: "Check for a pulse",
    instruction:
      "Feel for a pulse on the femoral artery, located on the inner thigh where the leg meets the body. Use two fingers and press gently for 10 seconds.",
  },
  {
    title: "Clear the airway & give rescue breaths",
    instruction:
      "Gently open the mouth and pull the tongue forward. Check for any visible obstructions. Close the mouth, extend the neck to straighten the airway, and seal your lips around the nose. Give 2 rescue breaths — each should make the chest rise.",
  },
  {
    title: "Begin chest compressions",
    instruction:
      "Lay your dog on their right side on a firm surface. For medium/large dogs, place the heel of one hand over the widest part of the rib cage and the other hand on top. For small dogs, wrap one hand around the chest. Compress to 1/3 the depth of the chest.",
  },
  {
    title: "Maintain compression rate",
    instruction:
      'Compress at a rate of 100–120 compressions per minute. A helpful tempo is the beat of "Stayin\' Alive" by the Bee Gees. Push hard and fast, allowing full chest recoil between compressions.',
  },
  {
    title: "Cycle: 30 compressions, 2 breaths",
    instruction:
      "After every 30 chest compressions, give 2 rescue breaths through the nose. Continue this cycle without interruption.",
  },
  {
    title: "Check for a pulse every 2 minutes",
    instruction:
      "Pause briefly every 2 minutes to check for a pulse and spontaneous breathing. If a pulse returns, stop compressions but continue rescue breaths if needed (1 breath every 3–5 seconds).",
  },
  {
    title: "Continue until help arrives",
    instruction:
      "Do not stop CPR until your pet revives, you reach a veterinary hospital, or you are physically unable to continue. Have someone call an emergency vet while you perform CPR.",
  },
];

const catSteps: CprStep[] = [
  {
    title: "Check for responsiveness",
    instruction:
      "Gently tap your cat and call their name. Cats may be less visibly responsive — check for any muscle tension, ear movement, or eye response.",
  },
  {
    title: "Check for breathing",
    instruction:
      "Watch for chest movement. Place a tissue near the nostrils to detect faint airflow. Cats breathe more subtly than dogs.",
  },
  {
    title: "Check for a pulse",
    instruction:
      "Feel for a pulse on the femoral artery (inner thigh) or place your hand directly over the left side of the chest, just behind the elbow.",
  },
  {
    title: "Clear the airway & give rescue breaths",
    instruction:
      "Open the mouth gently and check for obstructions. Close the mouth, cup your hand around both the nose and mouth (cats have small muzzles), and give 2 small, gentle breaths — just enough to see the chest rise.",
  },
  {
    title: "Begin chest compressions",
    instruction:
      "Lay your cat on their right side. Use one hand to wrap around the chest, placing your thumb on one side and fingers on the other, just behind the elbows. Compress to 1/3 the depth of the chest using a gentle squeezing motion.",
  },
  {
    title: "Maintain compression rate",
    instruction:
      "Compress at a rate of 100–120 compressions per minute. Cats require less force — be firm but gentle to avoid rib fractures.",
  },
  {
    title: "Cycle: 30 compressions, 2 breaths",
    instruction:
      "After every 30 compressions, give 2 gentle rescue breaths. Keep breaths small and watch for chest rise. Continue the cycle.",
  },
  {
    title: "Check for a pulse every 2 minutes",
    instruction:
      "Pause briefly every 2 minutes to reassess. If pulse returns, stop compressions but continue rescue breaths if your cat is not breathing on their own.",
  },
  {
    title: "Continue until help arrives",
    instruction:
      "Continue CPR until your cat revives, you arrive at a vet, or you are physically unable to continue. Time is critical — get to a vet as quickly as possible.",
  },
];

const CprGuide = () => {
  const [species, setSpecies] = useState<string>("dog");
  const steps = species === "cat" ? catSteps : dogSteps;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-destructive" />
        <h3 className="text-base font-bold text-destructive">
          Pet CPR — Step by Step
        </h3>
      </div>

      <ToggleGroup
        type="single"
        value={species}
        onValueChange={(v) => v && setSpecies(v)}
        className="w-full border border-destructive/20 rounded-lg p-1 bg-emergency-bg"
      >
        <ToggleGroupItem
          value="dog"
          className="flex-1 text-sm font-semibold data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground rounded-md"
        >
          🐕 Dog
        </ToggleGroupItem>
        <ToggleGroupItem
          value="cat"
          className="flex-1 text-sm font-semibold data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground rounded-md"
        >
          🐈 Cat
        </ToggleGroupItem>
      </ToggleGroup>

      <Accordion type="single" collapsible className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <AccordionItem
            key={i}
            value={`step-${i}`}
            className="border border-destructive/20 rounded-lg bg-background overflow-hidden"
          >
            <AccordionTrigger className="px-3 py-3 hover:no-underline gap-3 [&>svg]:text-destructive">
              <div className="flex items-center gap-3 text-left">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {step.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="pl-10">
                <CprIllustration stepIndex={i} species={species as "dog" | "cat"} />
                <p className="text-sm text-foreground leading-relaxed">
                  {step.instruction}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default CprGuide;
