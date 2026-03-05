import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const TermsOfService = () => {
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
        <h2 className="text-xl font-semibold text-foreground">Terms of Service</h2>
      </div>

      <EmptyState
        icon={FileText}
        title="Coming Soon"
        description="Our Terms of Service are being finalized and will be available here shortly."
      />
    </div>
  );
};

export default TermsOfService;
