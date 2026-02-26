import { Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmergencyNumbers from "@/components/first-aid/EmergencyNumbers";
import CprGuide from "@/components/first-aid/CprGuide";
import FirstAidBasics from "@/components/first-aid/FirstAidBasics";

const FirstAid = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-destructive -mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header banner */}
      <div className="rounded-xl bg-destructive p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Heart className="h-6 w-6 text-destructive-foreground" />
          <h1 className="text-xl font-bold text-destructive-foreground">
            Pet Emergency Guide
          </h1>
        </div>
        <p className="text-sm text-destructive-foreground/80">
          Know what to do when every second counts
        </p>
      </div>

      {/* Emergency numbers */}
      <EmergencyNumbers />

      {/* CPR Guide */}
      <CprGuide />

      {/* First Aid Basics */}
      <FirstAidBasics />

      {/* Disclaimer */}
      <div className="rounded-lg border border-destructive/20 bg-emergency-bg p-3">
        <p className="text-xs text-muted-foreground leading-relaxed text-center">
          This guide is for informational purposes only and is not a substitute
          for professional veterinary care. In any emergency, contact your
          veterinarian or nearest emergency animal hospital immediately.
        </p>
      </div>
    </div>
  );
};

export default FirstAid;
