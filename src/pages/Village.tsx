import { Stethoscope, Dog, Building, Scissors, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const contacts = [
  { label: "Veterinarian", icon: Stethoscope },
  { label: "Dog Walker", icon: Dog },
  { label: "Daycare", icon: Building },
  { label: "Groomer", icon: Scissors },
  { label: "Emergency Contacts", icon: Phone },
];

const Village = () => (
  <div className="flex flex-col gap-5">
    <h2 className="text-xl font-semibold text-foreground">My Village</h2>
    <div className="flex flex-col gap-3">
      {contacts.map((c) => (
        <Card key={c.label} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <c.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{c.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Village;
