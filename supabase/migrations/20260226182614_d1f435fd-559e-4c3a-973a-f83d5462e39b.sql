
-- Add memorial columns to pets
ALTER TABLE public.pets
  ADD COLUMN is_deceased boolean NOT NULL DEFAULT false,
  ADD COLUMN date_of_passing date,
  ADD COLUMN memorial_photos text[] DEFAULT '{}',
  ADD COLUMN memorial_memories jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN deceased_at timestamp with time zone;

-- Storage bucket for memorial photos
INSERT INTO storage.buckets (id, name, public) VALUES ('memorial-photos', 'memorial-photos', true);

-- Storage policies
CREATE POLICY "Memorial photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memorial-photos');

CREATE POLICY "Users can upload memorial photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'memorial-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own memorial photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'memorial-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
