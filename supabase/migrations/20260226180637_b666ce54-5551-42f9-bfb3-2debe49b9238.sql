
-- Village members table - stores all care provider types for each pet
CREATE TABLE public.village_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  category TEXT NOT NULL, -- 'vet', 'walker', 'daycare', 'groomer', 'emergency'
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.village_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own village members" ON public.village_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own village members" ON public.village_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own village members" ON public.village_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own village members" ON public.village_members FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_village_members_pet ON public.village_members(pet_id, category);

CREATE TRIGGER update_village_members_updated_at
  BEFORE UPDATE ON public.village_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
