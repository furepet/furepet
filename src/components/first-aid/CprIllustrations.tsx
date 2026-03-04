import React from "react";

interface IllustrationProps {
  species: "dog" | "cat";
}

const PRIMARY = "hsl(var(--primary))";
const LIGHT = "hsl(var(--primary) / 0.15)";
const STROKE = "hsl(var(--primary))";

/* Shared pet silhouette — dog is bigger/rounder, cat is sleeker */
const PetBody = ({ species }: IllustrationProps) => {
  if (species === "cat") {
    return (
      <g>
        {/* Cat body lying on side */}
        <ellipse cx="80" cy="62" rx="32" ry="14" fill={LIGHT} stroke={STROKE} strokeWidth="1.5" />
        {/* Cat head */}
        <circle cx="118" cy="52" r="12" fill={LIGHT} stroke={STROKE} strokeWidth="1.5" />
        {/* Cat ears */}
        <polygon points="112,42 115,32 120,42" fill={LIGHT} stroke={STROKE} strokeWidth="1.2" />
        <polygon points="120,40 125,30 128,40" fill={LIGHT} stroke={STROKE} strokeWidth="1.2" />
        {/* Tail */}
        <path d="M48,60 Q35,45 30,50" fill="none" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      {/* Dog body lying on side */}
      <ellipse cx="80" cy="62" rx="36" ry="16" fill={LIGHT} stroke={STROKE} strokeWidth="1.5" />
      {/* Dog head */}
      <circle cx="122" cy="50" r="14" fill={LIGHT} stroke={STROKE} strokeWidth="1.5" />
      {/* Ear (floppy) */}
      <ellipse cx="130" cy="42" rx="6" ry="10" fill={LIGHT} stroke={STROKE} strokeWidth="1.2" />
      {/* Snout */}
      <ellipse cx="135" cy="54" rx="6" ry="4" fill={LIGHT} stroke={STROKE} strokeWidth="1.2" />
      {/* Tail */}
      <path d="M44,58 Q32,42 28,48" fill="none" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
};

/* Step 1 – Tapping to check responsiveness */
const Step1 = ({ species }: IllustrationProps) => (
  <svg viewBox="0 0 160 90" className="w-full h-full" aria-label={`Tapping ${species} to check responsiveness`}>
    <PetBody species={species} />
    {/* Tapping hand */}
    <g>
      <path d="M125,30 L130,22 L134,30" fill="none" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="1s" repeatCount="indefinite" />
      </path>
      {/* Hand shape */}
      <rect x="123" y="18" width="14" height="6" rx="3" fill={PRIMARY} opacity="0.6">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="1s" repeatCount="indefinite" />
      </rect>
    </g>
    {/* Tap ripples */}
    <circle cx="130" cy="44" r="4" fill="none" stroke={STROKE} strokeWidth="0.8" opacity="0">
      <animate attributeName="r" values="4;12" dur="1s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
    </circle>
  </svg>
);

/* Step 2 – Checking for breathing */
const Step2 = ({ species }: IllustrationProps) => (
  <svg viewBox="0 0 160 90" className="w-full h-full" aria-label={`Checking ${species} breathing`}>
    <PetBody species={species} />
    {/* Person's head near pet's nose */}
    <circle cx="148" cy="40" r="8" fill={PRIMARY} opacity="0.3" stroke={STROKE} strokeWidth="1.2" />
    {/* Airflow lines */}
    {[0, 1, 2].map((i) => (
      <line key={i} x1={species === "cat" ? "130" : "141"} y1={String(52 + i * 3)} x2={species === "cat" ? "140" : "148"} y2={String(48 + i * 3)} stroke={STROKE} strokeWidth="1" strokeLinecap="round" opacity="0.5">
        <animate attributeName="opacity" values="0;0.7;0" dur="1.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
      </line>
    ))}
  </svg>
);

/* Step 3 – Checking pulse on inner thigh */
const Step3 = ({ species }: IllustrationProps) => (
  <svg viewBox="0 0 160 90" className="w-full h-full" aria-label={`Checking ${species} pulse`}>
    <PetBody species={species} />
    {/* Leg indication */}
    <line x1="90" y1="76" x2="95" y2="86" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    {/* Two fingers on inner thigh */}
    <circle cx="92" cy="82" r="2.5" fill={PRIMARY} opacity="0.7">
      <animate attributeName="r" values="2.5;3.5;2.5" dur="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="96" cy="84" r="2.5" fill={PRIMARY} opacity="0.7">
      <animate attributeName="r" values="2.5;3.5;2.5" dur="1s" repeatCount="indefinite" />
    </circle>
    {/* Pulse wave */}
    <path d="M60,85 L68,85 L70,80 L73,88 L76,82 L78,85 L86,85" fill="none" stroke={PRIMARY} strokeWidth="1.2">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
    </path>
  </svg>
);

/* Step 4 – Airway clear + rescue breaths */
const Step4 = ({ species }: IllustrationProps) => (
  <svg viewBox="0 0 160 90" className="w-full h-full" aria-label={`Giving ${species} rescue breaths`}>
    <PetBody species={species} />
    {/* Person's head giving breath */}
    <circle cx="146" cy="38" r="8" fill={PRIMARY} opacity="0.3" stroke={STROKE} strokeWidth="1.2" />
    {/* Breath arrow into nose */}
    <path d={species === "cat" ? "M140,44 L130,50" : "M142,46 L137,52"} stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" markerEnd="url(#arrowhead)">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
    </path>
    {/* Chest rise */}
    <ellipse cx="80" cy="62" rx={species === "cat" ? "32" : "36"} ry="14" fill="none" stroke={PRIMARY} strokeWidth="1" strokeDasharray="3,3">
      <animate attributeName="ry" values="14;17;14" dur="2s" repeatCount="indefinite" />
    </ellipse>
    <defs>
      <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill={PRIMARY} />
      </marker>
    </defs>
  </svg>
);

/* Step 5 – Hands on chest for compressions */
const Step5 = ({ species }: IllustrationProps) => (
  <svg viewBox="0 0 160 90" className="w-full h-full" aria-label={`Chest compressions on ${species}`}>
    <PetBody species={species} />
    {/* Hands pressing down */}
    <g>
      <rect x="72" y="38" width="16" height="8" rx="4" fill={PRIMARY} opacity="0.6">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,4;0,0" dur="0.6s" repeatCount="indefinite" />
      </rect>
      {/* Pressure arrows */}
      <line x1="80" y1="34" x2="80" y2="40" stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,4;0,0" dur="0.6s" repeatCount="indefinite" />
      </line>
    </g>
    {/* Compression depth indicator */}
    <line x1="60" y1="62" x2="60" y2="70" stroke={STROKE} strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
    <text x="52" y="73" fontSize="5" fill={STROKE} opacity="0.6">⅓</text>
  </svg>
);

/* Step 6 – Compression rate 100-120/min */
const Step6 = ({ species }: IllustrationProps) => (
  <svg viewBox="0 0 160 90" className="w-full h-full" aria-label="Compression rate">
    <PetBody species={species} />
    {/* Metronome / tempo indicator */}
    <g transform="translate(20,10)">
      <rect x="0" y="5" width="20" height="26" rx="3" fill="none" stroke={STROKE} strokeWidth="1.2" />
      {/* Pendulum */}
      <line x1="10" y1="28" x2="10" y2="10" stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="-15,10,28;15,10,28;-15,10,28" dur="0.5s" repeatCount="indefinite" />
      </line>
      <circle cx="10" cy="10" r="2" fill={PRIMARY}>
        <animateTransform attributeName="transform" type="rotate" values="-15,10,28;15,10,28;-15,10,28" dur="0.5s" repeatCount="indefinite" />
      </circle>
      <text x="2" y="42" fontSize="5" fill={STROKE} fontWeight="bold">100-120</text>
      <text x="6" y="48" fontSize="4" fill={STROKE}>/min</text>
    </g>
  </svg>
);

/* Step 7 – 30:2 cycle */
const Step7 = ({ species }: IllustrationProps) => (
  <svg viewBox="0 0 160 90" className="w-full h-full" aria-label="30 compressions 2 breaths cycle">
    <PetBody species={species} />
    {/* Cycle diagram */}
    <g transform="translate(8,8)">
      <circle cx="18" cy="18" r="16" fill="none" stroke={STROKE} strokeWidth="1.2" />
      {/* Rotating arrow */}
      <path d="M18,2 A16,16 0 1,1 4,26" fill="none" stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="0,18,18;360,18,18" dur="3s" repeatCount="indefinite" />
      </path>
      <text x="10" y="16" fontSize="7" fill={PRIMARY} fontWeight="bold">30</text>
      <text x="10" y="24" fontSize="5" fill={STROKE}>: 2</text>
    </g>
  </svg>
);

/* Step 8 – Check pulse every 2 min */
const Step8 = ({ species }: IllustrationProps) => (
  <svg viewBox="0 0 160 90" className="w-full h-full" aria-label="Check pulse every 2 minutes">
    <PetBody species={species} />
    {/* Timer / clock */}
    <g transform="translate(12,10)">
      <circle cx="14" cy="14" r="12" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <line x1="14" y1="14" x2="14" y2="6" stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="0,14,14;360,14,14" dur="4s" repeatCount="indefinite" />
      </line>
      <line x1="14" y1="14" x2="20" y2="14" stroke={STROKE} strokeWidth="1" strokeLinecap="round" />
      <text x="6" y="35" fontSize="6" fill={PRIMARY} fontWeight="bold">2 min</text>
    </g>
    {/* Pulse check indicator */}
    <path d="M35,32 L40,32 L42,27 L44,36 L46,30 L48,32 L52,32" fill="none" stroke={PRIMARY} strokeWidth="1">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
    </path>
  </svg>
);

/* Step 9 – Continue until help arrives */
const Step9 = ({ species }: IllustrationProps) => (
  <svg viewBox="0 0 160 90" className="w-full h-full" aria-label="Continue until help arrives">
    <PetBody species={species} />
    {/* Emergency cross / vet symbol */}
    <g transform="translate(10,8)">
      <rect x="4" y="0" width="16" height="24" rx="2" fill={PRIMARY} opacity="0.15" stroke={STROKE} strokeWidth="1.2" />
      <line x1="12" y1="4" x2="12" y2="20" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="12" x2="18" y2="12" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" />
      {/* Pulsing effect */}
      <rect x="4" y="0" width="16" height="24" rx="2" fill="none" stroke={PRIMARY} strokeWidth="1" opacity="0">
        <animate attributeName="opacity" values="0;0.5;0" dur="1.5s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="1.5s" repeatCount="indefinite" additive="sum" />
      </rect>
    </g>
    {/* Arrow pointing to vet */}
    <path d="M30,20 L38,20" stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arrow9)">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
    </path>
    <defs>
      <marker id="arrow9" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
        <polygon points="0 0, 5 2, 0 4" fill={PRIMARY} />
      </marker>
    </defs>
  </svg>
);

const illustrations: Record<number, React.FC<IllustrationProps>> = {
  0: Step1,
  1: Step2,
  2: Step3,
  3: Step4,
  4: Step5,
  5: Step6,
  6: Step7,
  7: Step8,
  8: Step9,
};

export const CprIllustration = ({ stepIndex, species }: { stepIndex: number; species: "dog" | "cat" }) => {
  const Illustration = illustrations[stepIndex];
  if (!Illustration) return null;
  return (
    <div className="w-full h-20 mb-2 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center overflow-hidden">
      <Illustration species={species} />
    </div>
  );
};

export default CprIllustration;
