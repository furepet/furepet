import {
  AlertTriangle,
  Droplets,
  Skull,
  Flame,
  Thermometer,
  Zap,
  Bone,
  ShieldAlert,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FirstAidTopic {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  signs: string[];
  steps: string[];
  erWarning: string;
}

const topics: FirstAidTopic[] = [
  {
    icon: AlertTriangle,
    title: "Choking",
    signs: [
      "Pawing at the mouth",
      "Gagging or retching without producing anything",
      "Difficulty breathing, blue-tinged gums",
      "Excessive drooling or panic",
    ],
    steps: [
      "Stay calm — restrain your pet gently to avoid being bitten.",
      "Open the mouth and look for a visible object. If you can see it, carefully try to remove it with tweezers or your fingers.",
      "Do NOT blindly sweep the throat — this can push objects deeper.",
      "For small dogs/cats: hold them upside down by the hind legs and give firm back blows between the shoulder blades.",
      "For larger dogs: perform a modified Heimlich — stand behind your dog, place your fists below the rib cage, and give firm upward thrusts.",
      "If the object is dislodged, check the mouth and remove debris.",
    ],
    erWarning:
      "Go to the ER immediately if you cannot dislodge the object within 1–2 minutes, if your pet loses consciousness, or if gums turn blue/grey.",
  },
  {
    icon: Droplets,
    title: "Bleeding & Wounds",
    signs: [
      "Visible blood or open wound",
      "Limping or favoring a limb",
      "Swelling around the wound area",
      "Excessive licking at one spot",
    ],
    steps: [
      "Apply direct pressure with a clean cloth or gauze for at least 5 minutes. Do not lift to check — this disrupts clotting.",
      "If blood soaks through, add more layers on top — do not remove the original cloth.",
      "For limb wounds, you can wrap with a bandage but not too tight — you should be able to slide one finger underneath.",
      "Clean minor wounds with saline or clean water. Avoid hydrogen peroxide — it damages healthy tissue.",
      "Do not apply tourniquets unless trained to do so.",
    ],
    erWarning:
      "Go to the ER if bleeding doesn't stop after 10 minutes of pressure, if the wound is deep or gaping, if caused by an animal bite, or if located near the eyes, throat, or chest.",
  },
  {
    icon: Skull,
    title: "Poisoning",
    signs: [
      "Vomiting or diarrhea",
      "Drooling, foaming at the mouth",
      "Tremors, seizures, or collapse",
      "Lethargy or unusual behavior",
    ],
    steps: [
      "Identify the substance if possible — take a photo of the packaging or plant.",
      "Do NOT induce vomiting unless specifically instructed by a veterinarian or poison control.",
      "Do NOT give milk, oil, or home remedies — they can worsen absorption.",
      "Call ASPCA Poison Control (888-426-4435) or Pet Poison Helpline (855-764-7661) immediately.",
      "Provide the substance name, amount ingested, your pet's weight, and time of ingestion.",
      "Common toxins: chocolate, xylitol, grapes/raisins, lilies (cats), antifreeze, rodent bait, ibuprofen.",
    ],
    erWarning:
      "Go to the ER immediately for any suspected poisoning. Time is critical — many toxins cause irreversible damage within hours.",
  },
  {
    icon: Flame,
    title: "Burns",
    signs: [
      "Red or blistered skin",
      "Singed or missing fur",
      "Pain, whimpering when touched",
      "Swelling in the affected area",
    ],
    steps: [
      "Immediately cool the burn with cool (not cold) running water for at least 10 minutes.",
      "Do NOT apply ice, butter, toothpaste, or any ointments.",
      "Cover loosely with a clean, damp cloth.",
      "Do not pop blisters — they protect the healing skin underneath.",
      "For chemical burns: flush with large amounts of water for 15+ minutes. Wear gloves to avoid contact.",
    ],
    erWarning:
      "Go to the ER for burns larger than your palm, burns on the face/paws/genitals, chemical or electrical burns, or if your pet shows signs of shock (pale gums, rapid breathing).",
  },
  {
    icon: Thermometer,
    title: "Heatstroke",
    signs: [
      "Excessive panting, drooling",
      "Bright red tongue and gums",
      "Vomiting or diarrhea",
      "Staggering, confusion, collapse",
      "Body temp above 104°F (40°C)",
    ],
    steps: [
      "Move your pet to a cool, shaded area immediately.",
      "Apply cool (not ice-cold) water to the body — focus on the neck, armpits, and groin.",
      "Place cool wet towels on these areas and replace them frequently (they heat up fast).",
      "Offer small amounts of cool water to drink — do not force water.",
      "Fan your pet or use air conditioning.",
      "Do NOT use ice or ice-cold water — this causes blood vessels to constrict and traps heat inside.",
    ],
    erWarning:
      "Go to the ER if temperature exceeds 104°F, if your pet is vomiting, having seizures, or is unresponsive. Heatstroke can cause organ failure rapidly.",
  },
  {
    icon: Zap,
    title: "Seizures",
    signs: [
      "Uncontrollable shaking or convulsing",
      "Falling over, paddling legs",
      "Loss of consciousness",
      "Drooling, urination, or defecation during episode",
    ],
    steps: [
      "Stay calm. Time the seizure — note when it starts and stops.",
      "Clear the area of hard or sharp objects your pet could hit.",
      "Do NOT restrain your pet or put anything in their mouth.",
      "Do NOT try to hold the tongue — pets cannot swallow their tongues.",
      "Dim the lights and reduce noise to minimize stimulation.",
      "After the seizure: speak softly, keep your pet warm, and monitor recovery.",
      "Record a video if possible — it helps the vet with diagnosis.",
    ],
    erWarning:
      "Go to the ER if a seizure lasts more than 3 minutes, if multiple seizures occur in a row, if it's your pet's first seizure, or if your pet doesn't recover normally within 30 minutes.",
  },
  {
    icon: Bone,
    title: "Broken Bones & Limping",
    signs: [
      "Obvious deformity or unnatural angle",
      "Swelling, bruising",
      "Refusal to bear weight on a limb",
      "Crying or aggression when touched",
    ],
    steps: [
      "Keep your pet as still and calm as possible — movement can worsen the injury.",
      "Do NOT attempt to splint or set the bone yourself.",
      "If there's an open wound, cover it loosely with a clean cloth.",
      "Use a flat surface (board, baking sheet) as a stretcher for transport if possible.",
      "For small pets, place them in a carrier lined with a towel.",
      "Support the injured area during transport — avoid jostling.",
    ],
    erWarning:
      "Go to the ER for any suspected fracture. Also go immediately if there's an open/compound fracture (bone visible), heavy bleeding, or if your pet cannot move.",
  },
  {
    icon: ShieldAlert,
    title: "Allergic Reactions",
    signs: [
      "Swelling of the face, muzzle, or eyes",
      "Hives or raised bumps on the skin",
      "Excessive itching or scratching",
      "Vomiting, diarrhea",
      "Difficulty breathing (anaphylaxis)",
    ],
    steps: [
      "Remove the allergen if identifiable (e.g., remove a bee stinger by scraping, not squeezing).",
      "Monitor closely for the first 30 minutes — reactions can escalate quickly.",
      "For mild reactions (hives only, no breathing issues): contact your vet for guidance on antihistamine dosing.",
      "Do NOT give any medication without veterinary guidance — doses differ significantly from humans.",
      "Keep your pet calm and in a cool environment.",
    ],
    erWarning:
      "Go to the ER immediately if you see facial swelling that progresses rapidly, difficulty breathing, pale or blue gums, collapse, or vomiting. Anaphylaxis is life-threatening and requires immediate treatment.",
  },
];

const FirstAidBasics = () => (
  <div className="flex flex-col gap-3">
    <h3 className="text-base font-bold text-destructive flex items-center gap-2">
      <ShieldAlert className="h-5 w-5" />
      First Aid Basics
    </h3>

    <Accordion type="single" collapsible className="flex flex-col gap-2">
      {topics.map((topic, i) => (
        <AccordionItem
          key={i}
          value={`topic-${i}`}
          className="border border-destructive/20 rounded-lg bg-background overflow-hidden"
        >
          <AccordionTrigger className="px-3 py-3 hover:no-underline gap-3 [&>svg]:text-destructive">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <topic.icon className="h-4 w-4 text-destructive" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                {topic.title}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-4">
            <div className="flex flex-col gap-3 pl-11">
              {/* Signs */}
              <div>
                <p className="text-xs font-bold text-destructive uppercase tracking-wide mb-1.5">
                  Signs to watch for
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {topic.signs.map((sign, j) => (
                    <li key={j} className="text-sm text-foreground">
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What to do */}
              <div>
                <p className="text-xs font-bold text-destructive uppercase tracking-wide mb-1.5">
                  What to do
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  {topic.steps.map((step, j) => (
                    <li key={j} className="text-sm text-foreground leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* ER Warning */}
              <div className="rounded-lg border-2 border-destructive/40 bg-emergency-bg p-3">
                <p className="text-xs font-bold text-destructive uppercase tracking-wide mb-1">
                  🚨 When to go to the ER
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {topic.erWarning}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default FirstAidBasics;
