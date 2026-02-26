
-- Add unit preference and soft-delete columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS unit_preference TEXT NOT NULL DEFAULT 'imperial',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
