import { useNavigate } from "react-router-dom";
import { PawPrint, Users, Stethoscope, MessageCircle, Heart, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 17) return "Good afternoon!";
  return "Good evening!";
};

const Index = () => {
  const navigate = useNavigate();
  const userName = "User"; // TODO: replace with actual user name

  const pet = {
    name: "Buddy",
    breed: "Golden Retriever",
    age: "3 years",
    photo: null,
  };

  const quickCards = [
    { label: "My Pet", icon: PawPrint, path: "/my-pet", color: "text-primary" },
    { label: "Village", icon: Users, path: "/village", color: "text-primary" },
    { label: "Medical", icon: Stethoscope, path: "/medical", color: "text-primary" },
    { label: "AI Chat", icon: MessageCircle, path: "/more", color: "text-primary" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Hi {userName}!</h2>
        <p className="text-sm text-muted-foreground">{getGreeting()} 🐾</p>
      </div>

      {/* Pet Profile Card */}
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {pet.photo ? (
              <img src={pet.photo} alt={pet.name} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <PawPrint className="h-7 w-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">{pet.name}</p>
            <p className="text-sm text-muted-foreground">{pet.breed} · {pet.age}</p>
          </div>
          <button
            onClick={() => navigate("/my-pet")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-3">
        {quickCards.map((card) => (
          <Card
            key={card.path}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(card.path)}
          >
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <card.icon className={`h-7 w-7 ${card.color}`} />
              <span className="text-sm font-medium text-foreground">{card.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency CPR/First Aid Card */}
      <Card
        className="cursor-pointer border-destructive/30 bg-emergency-bg hover:shadow-md transition-shadow"
        onClick={() => navigate("/more/first-aid")}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Heart className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-destructive">CPR & First Aid</p>
            <p className="text-xs text-muted-foreground">Emergency guide — always free</p>
          </div>
          <ChevronRight className="h-5 w-5 text-destructive/60" />
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
