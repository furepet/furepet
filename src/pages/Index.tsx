import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PawPrint,
  Users,
  Stethoscope,
  MessageCircle,
  ChevronRight,
  Lock,
  Pencil,
  Cross,
  Rainbow,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/contexts/AuthContext";
import { useActivePet } from "@/contexts/ActivePetContext";
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
  const todayDate = new Date();
  if (birthDate.getMonth() === todayDate.getMonth() && birthDate.getDate() === todayDate.getDate()) {
    return "🎂 Happy Birthday!";
  }
  const years = differenceInYears(todayDate, birthDate);
  if (years >= 1) return `${years} year${years !== 1 ? "s" : ""} old`;
  const months = differenceInMonths(todayDate, birthDate);
  return months >= 1 ? `${months} month${months !== 1 ? "s" : ""} old` : "< 1 month old";
};

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { firstName } = useAuth();
  const { pets, activePet, setActivePetId, isLoading, isPremium } = useActivePet();

  const [lockSheetOpen, setLockSheetOpen] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setLoadingTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const age = activePet ? formatAge(activePet.date_of_birth) : null;

  const handleLockedTap = (path: string) => {
    if (isPremium) {
      navigate(path);
    } else {
      setLockSheetOpen(true);
    }
  };

  if (isLoading && !loadingTimedOut) {
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

  if (pets.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Hi {firstName || "there"}!
          </h1>
          <p className="text-sm text-muted-foreground">{getGreeting()} 🐾</p>
        </div>
        <EmptyState
          icon={PawPrint}
          title="No pets found"
          description="Add your first pet to get started!"
          actionLabel="Add a Pet"
          onAction={() => navigate("/onboarding?addPet=true")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Hi {firstName || "there"}!
        </h1>
        <p className="text-sm text-muted-foreground">{getGreeting()} 🐾</p>
      </div>

      {pets.length > 1 && (
        <PetSwitcher
          pets={pets}
          activePetId={activePet?.id ?? ""}
          onSelectPet={setActivePetId}
          onAddPet={() => navigate("/onboarding?addPet=true")}
        />
      )}

      {activePet && (
        <Card className={`overflow-hidden ${activePet.is_deceased ? 'border-secondary/40' : ''}`}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
              {activePet.photo_url ? (
                <img
                  src={activePet.photo_url}
                  alt={`Photo of ${activePet.pet_name}`}
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
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={`Edit ${activePet.pet_name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard
          icon={PawPrint}
          title="My Pet"
          subtitle={`View ${activePet?.pet_name ?? "your pet"}'s profile & trends`}
          onClick={() => navigate("/my-pet")}
        />
        <SectionCard
          icon={Users}
          title="My Village"
          subtitle="Vet, groomer, walker & more"
          locked={!isPremium}
          onClick={() => handleLockedTap("/village")}
        />
        <SectionCard
          icon={Stethoscope}
          title="Medical"
          subtitle="Records, vaccines & medications"
          locked={!isPremium}
          onClick={() => handleLockedTap("/medical")}
        />
        <SectionCard
          icon={MessageCircle}
          title="AI Pet Chat"
          subtitle="Ask anything about pet care"
          locked={!isPremium}
          onClick={() => handleLockedTap("/more/ai-chat")}
        />
      </div>

      <Card
        className="cursor-pointer border-none shadow-lg mt-2 overflow-hidden bg-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:col-span-2"
        style={{ boxShadow: "0 4px 20px -4px hsl(0 84% 50% / 0.4)" }}
        onClick={() => navigate("/more/first-aid")}
        tabIndex={0}
        role="button"
        aria-label="Emergency CPR and First Aid guide"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/more/first-aid"); } }}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive-foreground/20">
            <Cross className="h-6 w-6 text-destructive-foreground" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-destructive-foreground">Emergency CPR & First Aid</p>
            <p className="text-sm text-destructive-foreground/80">Know what to do in an emergency</p>
          </div>
          <ChevronRight className="h-5 w-5 text-destructive-foreground/70" aria-hidden="true" />
        </CardContent>
      </Card>

      <PremiumLockSheet open={lockSheetOpen} onOpenChange={setLockSheetOpen} />
    </div>
  );
};

interface SectionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  locked?: boolean;
  onClick: () => void;
}

const SectionCard = ({ icon: Icon, title, subtitle, locked, onClick }: SectionCardProps) => (
  <Card
    className="cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    onClick={onClick}
    tabIndex={0}
    role="button"
    aria-label={`${title}${locked ? " (Premium)" : ""}`}
    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
  >
    <CardContent className="flex items-center gap-3 p-4 min-h-[56px]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 relative">
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        {locked && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground">
            <Lock className="h-2.5 w-2.5 text-primary-foreground" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    </CardContent>
  </Card>
);

export default Index;
