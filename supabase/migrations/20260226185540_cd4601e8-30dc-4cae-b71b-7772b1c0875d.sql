
-- ═══════════════════════════════════════════════════
-- 1. Add missing columns to existing tables
-- ═══════════════════════════════════════════════════

-- profiles: add subscription & stripe fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- pets: add status column
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- ═══════════════════════════════════════════════════
-- 2. Village tables (normalized from village_members)
-- ═══════════════════════════════════════════════════

CREATE TABLE public.village_vet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  clinic_name text NOT NULL DEFAULT '',
  vet_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  last_checkup_date date,
  checkup_reminder_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.village_walker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  started_date date,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.village_daycare (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  facility_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  started_date date,
  favorite_caretaker text DEFAULT '',
  friends text[] DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.village_groomer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  salon_name text NOT NULL DEFAULT '',
  groomer_name text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  preferred_services text[] DEFAULT '{}',
  frequency text DEFAULT '',
  last_appointment_date date,
  rebook_reminder_enabled boolean NOT NULL DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  name text NOT NULL DEFAULT '',
  relationship text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- 3. Medical tables (normalized from medical_records)
-- ═══════════════════════════════════════════════════

CREATE TABLE public.vaccines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vaccine_name text NOT NULL DEFAULT '',
  date_administered date,
  administering_vet text DEFAULT '',
  next_due_date date,
  lot_number text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  diagnosis_name text NOT NULL DEFAULT '',
  date_diagnosed date,
  diagnosing_vet text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  medication_name text NOT NULL DEFAULT '',
  dosage text DEFAULT '',
  frequency text DEFAULT '',
  start_date date,
  end_date date,
  prescribing_vet text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  refill_reminder_enabled boolean NOT NULL DEFAULT false,
  refill_date date,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.surgeries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  procedure_name text NOT NULL DEFAULT '',
  date date,
  surgeon_clinic text DEFAULT '',
  reason text DEFAULT '',
  outcome_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.behavioral_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  issue text NOT NULL DEFAULT '',
  first_noticed date,
  severity text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  treatment_plan text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  allergen text NOT NULL DEFAULT '',
  type text DEFAULT '',
  reaction text DEFAULT '',
  severity text DEFAULT '',
  date_identified date,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  date_first_noticed date,
  body_location text DEFAULT '',
  size_description text DEFAULT '',
  photo_url text,
  status text NOT NULL DEFAULT 'monitoring',
  follow_up_date date,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- 4. Memorial table
-- ═══════════════════════════════════════════════════

CREATE TABLE public.memorial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  photo_urls text[] DEFAULT '{}',
  favorite_memory text DEFAULT '',
  what_made_special text DEFAULT '',
  message_to_pet text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pet_id)
);

-- ═══════════════════════════════════════════════════
-- 5. Enable RLS on ALL new tables
-- ═══════════════════════════════════════════════════

ALTER TABLE public.village_vet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_walker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_daycare ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_groomer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════
-- 6. RLS Policies: users can only CRUD their own data
-- ═══════════════════════════════════════════════════

-- Helper macro for each table
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'village_vet','village_walker','village_daycare','village_groomer',
    'emergency_contacts','vaccines','diagnoses','medications',
    'surgeries','behavioral_issues','allergies','observations','memorial'
  ]
  LOOP
    EXECUTE format('CREATE POLICY "Users can select own %1$s" ON public.%1$I FOR SELECT USING (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "Users can insert own %1$s" ON public.%1$I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "Users can update own %1$s" ON public.%1$I FOR UPDATE USING (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "Users can delete own %1$s" ON public.%1$I FOR DELETE USING (auth.uid() = user_id)', tbl);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════
-- 7. updated_at triggers for all new tables
-- ═══════════════════════════════════════════════════

CREATE TRIGGER update_village_vet_updated_at BEFORE UPDATE ON public.village_vet FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_village_walker_updated_at BEFORE UPDATE ON public.village_walker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_village_daycare_updated_at BEFORE UPDATE ON public.village_daycare FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_village_groomer_updated_at BEFORE UPDATE ON public.village_groomer FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON public.emergency_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vaccines_updated_at BEFORE UPDATE ON public.vaccines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_diagnoses_updated_at BEFORE UPDATE ON public.diagnoses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_surgeries_updated_at BEFORE UPDATE ON public.surgeries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_behavioral_issues_updated_at BEFORE UPDATE ON public.behavioral_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_allergies_updated_at BEFORE UPDATE ON public.allergies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_observations_updated_at BEFORE UPDATE ON public.observations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_memorial_updated_at BEFORE UPDATE ON public.memorial FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
