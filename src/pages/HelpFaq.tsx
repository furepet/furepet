import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "How do I add a pet?",
    a: "Go to Settings → Your Pets → Add New Pet. You'll be guided through a quick onboarding flow to enter your pet's name, species, breed, and birthday.",
  },
  {
    q: "How do I upgrade to Premium?",
    a: "Go to Settings → Subscription → Upgrade. Premium unlocks unlimited pets, AI chat, medical document storage, and more for $4.99/month.",
  },
  {
    q: "How do I upload medical records?",
    a: "Navigate to the Medical tab and tap the upload button. You can upload PDFs or images of your vet records. They'll be stored securely and you can download them anytime.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Settings → Subscription → Manage. This will open your billing portal where you can cancel, update your payment method, or view invoices.",
  },
  {
    q: "How do I contact support?",
    a: "Email us anytime at hello@furepet.com — we typically respond within 24 hours. You can also reach us from Settings → Contact Support.",
  },
];

const HelpFaq = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-foreground">Help & FAQ</h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-sm text-left">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2 mt-2">
        <p className="text-sm text-muted-foreground">
          Still have questions? We're happy to help.
        </p>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.open("mailto:hello@furepet.com", "_blank")}
        >
          <Mail className="h-4 w-4" />
          hello@furepet.com
        </Button>
      </div>
    </div>
  );
};

export default HelpFaq;
