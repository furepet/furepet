import { useState } from "react";
import {
  Share2,
  FileText,
  Stethoscope,
  CreditCard,
  Download,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generatePetPdf, sharePdf, type ShareType } from "@/lib/pdfGenerator";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import type { Pet } from "@/hooks/usePets";

interface SharePetSheetProps {
  pet: Pet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shareOptions: {
  type: ShareType;
  icon: React.ElementType;
  title: string;
  description: string;
}[] = [
  {
    type: "full",
    icon: FileText,
    title: "Share Full Profile",
    description: "Basics, medical history, allergies, vaccines & medications",
  },
  {
    type: "vet",
    icon: Stethoscope,
    title: "Share with Vet",
    description: "Medical records, medications, allergies & vaccine history",
  },
  {
    type: "basics",
    icon: CreditCard,
    title: "Share Basics Only",
    description: "Photo, name, breed, age, microchip & insurance",
  },
];

export const SharePetSheet = ({ pet, open, onOpenChange }: SharePetSheetProps) => {
  const { toast } = useToast();
  const { data: records = [] } = useMedicalRecords(pet.id);
  const [generating, setGenerating] = useState<ShareType | null>(null);

  const handleShare = async (type: ShareType) => {
    setGenerating(type);
    try {
      const doc = generatePetPdf(pet, records, type);
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `${pet.pet_name}_${type}_${dateStr}.pdf`;
      await sharePdf(doc, filename);
      onOpenChange(false);
      toast({ title: "PDF ready!", description: `${pet.pet_name}'s report has been generated.` });
    } catch (err: any) {
      toast({ title: "Error generating PDF", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share {pet.pet_name}'s Info
          </SheetTitle>
          <SheetDescription>
            Generate a PDF to share via email, text, or AirDrop
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 mt-4 pb-4">
          {shareOptions.map((opt) => (
            <Button
              key={opt.type}
              variant="outline"
              className="flex items-center gap-3 h-auto p-4 justify-start text-left"
              onClick={() => handleShare(opt.type)}
              disabled={generating !== null}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {generating === opt.type ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <opt.icon className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              <Download className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
