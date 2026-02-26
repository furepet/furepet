
-- Medical records table - unified for all 7 categories
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  category TEXT NOT NULL, -- 'vaccine','diagnosis','medication','surgery','behavioral','allergy','observation'
  title TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  record_date DATE,
  source_document_id UUID, -- links to medical_documents if auto-extracted
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical records" ON public.medical_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medical records" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medical records" ON public.medical_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medical records" ON public.medical_records FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_medical_records_pet ON public.medical_records(pet_id, category);

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Medical documents table
CREATE TABLE public.medical_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded', -- 'uploaded','processing','processed','error'
  extracted_data JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical documents" ON public.medical_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medical documents" ON public.medical_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medical documents" ON public.medical_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medical documents" ON public.medical_documents FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_medical_documents_pet ON public.medical_documents(pet_id);

-- Storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-documents', 'medical-documents', false);

CREATE POLICY "Users can upload own medical docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own medical docs" ON storage.objects FOR SELECT USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own medical docs" ON storage.objects FOR DELETE USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
