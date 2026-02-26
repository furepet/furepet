import { FileText, Syringe, ClipboardList, Pill, Activity, Brain, AlertTriangle, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  { label: "Documents", icon: FileText },
  { label: "Vaccines", icon: Syringe },
  { label: "Diagnoses", icon: ClipboardList },
  { label: "Medications", icon: Pill },
  { label: "Surgeries", icon: Activity },
  { label: "Behavioral Issues", icon: Brain },
  { label: "Allergies", icon: AlertTriangle },
  { label: "Observations", icon: Eye },
];

const Medical = () => (
  <div className="flex flex-col gap-5">
    <h2 className="text-xl font-semibold text-foreground">Medical</h2>
    <div className="flex flex-col gap-3">
      {sections.map((s) => (
        <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{s.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Medical;
