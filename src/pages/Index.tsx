import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PawPrint,
  Users,
  Stethoscope,
  MessageCircle,
  Heart,
  ChevronRight,
  Lock,
  Pencil,
  Cross,
  Rainbow,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePets } from "@/hooks/usePets";
import { PetSwitcher } from "@/components/home/PetSwitcher";
import { PremiumLockSheet } from "@/components/home/PremiumLockSheet";
import { differenceInYears, differenceInMonths, parseISO } from "date-fns";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 17) return "Good afternoon!";
  return "Good evening!";
};

const formatAge = (dob: string | null): string | null => {
  if (!dob) return null;
  const birthDate = parseISO(dob);
  const years = differenceInYears(new Date(), birthDate);
  if (years >= 1) return `${years} year${years !== 1 ? "s" : ""} old`;
  const months = differenceInMonths(new Date(), birthDate);
  return months >= 1 ? `${months} month${months !== 1 ? "s" : ""} old` : "< 1 month old";
};

const Index = () => {
  const navigate = useNavigate();
  const { firstName } = useAuth();
  const { data: pets = [], isLoading } = usePets();

  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [lockSheetOpen, setLockSheetOpen] = useState(false);

  const activePet = useMemo(() => {
    if (pets.length === 0) return null;
    return pets.find((p) => p.id === activePetId) ?? pets[0];
  }, [pets, activePetId]);

  const isPremium = activePet?.is_premium ?? false;
  const age = activePet ? formatAge(activePet.date_of_birth) : null;

  const handleLockedTap = (path: string) => {
    if (isPremium) {
      navigate(path);
    } else {
      setLockSheetOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 animate-pulse">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="h-24 rounded-xl bg-muted" />
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Hi {firstName || "there"}!
        </h1>
        <p className="text-sm text-muted-foreground">{getGreeting()} 🐾</p>
      </div>

      {/* Pet Switcher */}
      {pets.length > 1 && (
        <PetSwitcher
          pets={pets}
          activePetId={activePet?.id ?? ""}
          onSelectPet={setActivePetId}
          onAddPet={() => navigate("/onboarding")}
        />
      )}

      {/* Pet Profile Card */}
      {activePet && (
        <Card className={`overflow-hidden ${activePet.is_deceased ? 'border-secondary/40' : ''}`}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
              {activePet.photo_url ? (
                <img
                  src={activePet.photo_url}
                  alt={activePet.pet_name}
                  className={`h-20 w-20 rounded-full object-cover ${activePet.is_deceased ? 'opacity-80' : ''}`}
                />
              ) : (
                <PawPrint className="h-9 w-9 text-primary" />
              )}
              {activePet.is_deceased && (
                <div className="absolute -top-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                  <Rainbow className="h-3.5 w-3.5 text-secondary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-lg font-bold ${activePet.is_deceased ? 'text-muted-foreground' : 'text-foreground'}`}>
                {activePet.pet_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {activePet.is_deceased
                  ? "🌈 Forever in our hearts"
                  : [activePet.breed, age].filter(Boolean).join(" · ") || activePet.species}
              </p>
            </div>
            <button
              onClick={() => navigate("/my-pet")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Edit pet"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Section Cards */}
      <div className="flex flex-col gap-3">
        {/* My Pet — always accessible */}
        <SectionCard
          icon={PawPrint}
          title="My Pet"
          subtitle={`View ${activePet?.pet_name ?? "your pet"}'s profile & trends`}
          onClick={() => navigate("/my-pet")}
        />

        {/* My Village — locked if free */}
        <SectionCard
          icon={Users}
          title="My Village"
          subtitle="Vet, groomer, walker & more"
          locked={!isPremium}
          onClick={() => handleLockedTap("/village")}
        />

        {/* Medical — locked if free */}
        <SectionCard
          icon={Stethoscope}
          title="Medical"
          subtitle="Records, vaccines & medications"
          locked={!isPremium}
          onClick={() => handleLockedTap("/medical")}
        />

        {/* AI Pet Chat — locked if free */}
        <SectionCard
          icon={MessageCircle}
          title="AI Pet Chat"
          subtitle="Ask anything about pet care"
          locked={!isPremium}
          onClick={() => handleLockedTap("/more/ai-chat")}
        />

        {/* Rainbow Bridge — only if deceased, locked if free */}
        {/* Future: show only if activePet?.is_deceased */}
      </div>

      {/* Emergency CPR & First Aid */}
      <Card
        className="cursor-pointer border-none shadow-lg mt-2 overflow-hidden"
        style={{
          background: "hsl(0 84% 50%)",
          boxShadow: "0 4px 20px -4px hsl(0 84% 50% / 0.4)",
        }}
        onClick={() => navigate("/more/first-aid")}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Cross className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white">Emergency CPR & First Aid</p>
            <p className="text-sm text-white/80">Know what to do in an emergency</p>
          </div>
          <ChevronRight className="h-5 w-5 text-white/70" />
        </CardContent>
      </Card>

      <PremiumLockSheet open={lockSheetOpen} onOpenChange={setLockSheetOpen} />
    </div>
  );
};

/* ── Reusable Section Card ── */

interface SectionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  locked?: boolean;
  onClick: () => void;
}

const SectionCard = ({ icon: Icon, title, subtitle, locked, onClick }: SectionCardProps) => (
  <Card
    className="cursor-pointer hover:shadow-md transition-shadow"
    onClick={onClick}
  >
    <CardContent className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 relative">
        <Icon className="h-5 w-5 text-primary" />
        {locked && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground">
            <Lock className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </CardContent>
  </Card>
);

export default Index;
