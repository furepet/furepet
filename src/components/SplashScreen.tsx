import { useState, useEffect } from "react";
import { PawPrint } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onFinish, 400);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary transition-opacity duration-400 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="animate-fade-in flex flex-col items-center gap-4">
        <div className="rounded-full bg-primary-foreground/20 p-6">
          <PawPrint className="h-16 w-16 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">
          FurePET
        </h1>
        <p className="opacity-0 animate-slide-up text-primary-foreground/80 text-base font-medium">
          The Ultimate Pet Passport
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
