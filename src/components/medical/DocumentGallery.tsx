import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { FileText, Image, Trash2, Download, FolderOpen, Pencil } from "lucide-react";
import { useMedicalDocuments, useDeleteMedicalDocument } from "@/hooks/useMedicalRecords";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { saveData } from "@/lib/saveData";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  petId: string;
  onUpload?: () => void;
}

const InlineRename = ({ docId, petId, currentName, onDone }: { docId: string; petId: string; currentName: string; onDone: () => void }) => {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(currentName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === currentName) { onDone(); return; }
    setSaving(true);
    try {
      await saveData({ table: "medical_documents", action: "update", data: { file_name: trimmed }, match: { id: docId } });
      qc.invalidateQueries({ queryKey: ["medical-documents", petId] });
      toast.success("Renamed");
    } catch {
      toast.error("Rename failed");
    }
    onDone();
  };

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onDone(); }}
      disabled={saving}
      className="text-[10px] text-foreground w-full bg-transparent border-b border-primary outline-none"
    />
  );
};

export const DocumentGallery = ({ petId, onUpload }: Props) => {
  const { data: docs = [] } = useMedicalDocuments(petId);
  const deleteMutation = useDeleteMedicalDocument();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; filePath: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  if (docs.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No documents uploaded"
        description="Upload medical records, lab results, or vet notes to keep them safe and accessible."
        actionLabel="Upload Records"
        onAction={onUpload}
      />
    );
  }

  const getSignedUrl = async (filePath: string) => {
    const { data } = await supabase.storage.from("medical-documents").createSignedUrl(filePath, 3600);
    return data?.signedUrl;
  };

  const viewDoc = async (filePath: string) => {
    const url = await getSignedUrl(filePath);
    if (url) window.open(url, "_blank");
  };

  const downloadDoc = async (filePath: string, fileName: string) => {
    try {
      const url = await getSignedUrl(filePath);
      if (!url) { toast.error("Could not generate download link"); return; }
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-2">Documents ({docs.length})</h4>
      <div className="grid grid-cols-3 gap-2">
        {docs.map((doc) => {
          const isImg = doc.file_type.startsWith("image/");
          return (
            <div key={doc.id} className="relative rounded-lg border border-border bg-card p-2 group">
              <button onClick={() => viewDoc(doc.file_path)} className="w-full">
                <div className="flex h-16 items-center justify-center rounded bg-muted mb-1">
                  {isImg ? <Image className="h-6 w-6 text-muted-foreground" /> : <FileText className="h-6 w-6 text-muted-foreground" />}
                </div>
              </button>

              {renamingId === doc.id ? (
                <InlineRename docId={doc.id} petId={petId} currentName={doc.file_name} onDone={() => setRenamingId(null)} />
              ) : (
                <button
                  onClick={() => setRenamingId(doc.id)}
                  className="w-full text-left flex items-center gap-0.5 group/name"
                  title="Tap to rename"
                >
                  <p className="text-[10px] text-foreground truncate flex-1">{doc.file_name}</p>
                  <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover/name:opacity-100 shrink-0" />
                </button>
              )}
              <p className="text-[9px] text-muted-foreground">{format(parseISO(doc.created_at), "MMM d")}</p>

              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => downloadDoc(doc.file_path, doc.file_name)}
                  className="p-1 rounded bg-primary/10 text-primary"
                  aria-label="Download"
                >
                  <Download className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: doc.id, filePath: doc.file_path })}
                  className="p-1 rounded bg-destructive/10 text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the file and cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteTarget) {
                deleteMutation.mutate({ id: deleteTarget.id, petId, filePath: deleteTarget.filePath }, {
                  onSuccess: () => toast.success("Document deleted"),
                  onError: () => toast.error("Failed to delete"),
                });
              }
              setDeleteTarget(null);
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
