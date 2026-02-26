import { Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmergencyNumbers = () => {
  const openMaps = () => {
    const query = encodeURIComponent("emergency veterinarian near me");
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://maps.apple.com/?q=${query}`
      : `https://www.google.com/maps/search/${query}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="border-destructive/30 bg-background shadow-md">
      <CardContent className="flex flex-col gap-3 p-4">
        <h3 className="text-sm font-bold text-destructive uppercase tracking-wide">
          Emergency Numbers
        </h3>

        <a
          href="tel:8884264435"
          className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-emergency-bg p-3 active:bg-destructive/10 transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Phone className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              ASPCA Animal Poison Control
            </p>
            <p className="text-base font-bold text-destructive">(888) 426-4435</p>
          </div>
        </a>

        <a
          href="tel:8557647661"
          className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-emergency-bg p-3 active:bg-destructive/10 transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Phone className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Pet Poison Helpline
            </p>
            <p className="text-base font-bold text-destructive">(855) 764-7661</p>
          </div>
        </a>

        <Button
          variant="destructive"
          className="w-full gap-2 mt-1"
          onClick={openMaps}
        >
          <MapPin className="h-4 w-4" />
          Find Nearest Emergency Vet
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-1">
          Keep these numbers saved in your phone contacts
        </p>
      </CardContent>
    </Card>
  );
};

export default EmergencyNumbers;
