
-- Drop ALL restrictive policies on pets and profiles and recreate as PERMISSIVE

-- PETS table
DROP POLICY IF EXISTS "Users can delete own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can view own pets" ON public.pets;

CREATE POLICY "pets_select" ON public.pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pets_insert" ON public.pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pets_update" ON public.pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pets_delete" ON public.pets FOR DELETE USING (auth.uid() = user_id);

-- PROFILES table
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
