import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FirstAid = () => (
  <div className="flex flex-col gap-5">
    <div className="flex items-center gap-2">
      <Heart className="h-6 w-6 text-destructive" />
      <h2 className="text-xl font-semibold text-destructive">CPR & First Aid</h2>
    </div>
    <Card className="border-destructive/20 bg-emergency-bg">
      <CardContent className="p-4">
        <p className="text-sm text-foreground">
          Emergency first aid guides for your pet — coming soon.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default FirstAid;
