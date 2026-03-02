import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReviewExtractedData } from "./ReviewExtractedData";

interface Props {
  petId: string;
  petName: string;
}

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";
const MAX_SIZE = 20 * 1024 * 1024;

export const DocumentUpload = ({ petId, petName }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "jpg", "jpeg", "png"].includes(ext ?? "")) {
        toast.error(`${file.name}: unsupported format`);
        continue;
      }

      setUploading(true);
      try {
        const filePath = `${user.id}/${petId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("medical-documents")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        // Create document record
        const { data: doc, error: docError } = await supabase
          .from("medical_documents")
          .insert({
            pet_id: petId,
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            status: "uploaded",
          })
          .select()
          .single();
        if (docError) throw docError;

        qc.invalidateQueries({ queryKey: ["medical-documents", petId] });
        toast.success(`${file.name} uploaded`);

        // Trigger AI analysis
        setUploading(false);
        setAnalyzing(true);
        setCurrentDocId(doc.id);

        const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-medical-doc", {
          body: { documentId: doc.id },
        });

        if (fnError) {
          console.error("Analysis error:", fnError);
          toast.error("Document analysis failed");
          setAnalyzing(false);
          continue;
        }

        if (fnData?.data) {
          setExtractedData(fnData.data);
          qc.invalidateQueries({ queryKey: ["medical-documents", petId] });
        } else {
          toast.info("No medical data found in document");
        }
        setAnalyzing(false);
      } catch (e) {
        console.error(e);
        toast.error("Upload failed");
        setUploading(false);
        setAnalyzing(false);
      }
    }
  };

  const handleReviewDone = () => {
    setExtractedData(null);
    setCurrentDocId(null);
    qc.invalidateQueries({ queryKey: ["medical-records", petId] });
  };

  if (extractedData) {
    return (
      <ReviewExtractedData
        data={extractedData}
        petId={petId}
        petName={petName}
        documentId={currentDocId!}
        onDone={handleReviewDone}
      />
    );
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        onClick={() => fileRef.current?.click()}
        disabled={uploading || analyzing}
        className="w-full"
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading…</>
        ) : analyzing ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing document…</>
        ) : (
          <><Upload className="h-4 w-4 mr-2" /> Upload Medical Records</>
        )}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center mt-1">PDF, JPG, PNG · Max 20MB</p>
    </div>
  );
};
