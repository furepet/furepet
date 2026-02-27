
-- Fix pets table: drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "pets_insert" ON public.pets;
DROP POLICY IF EXISTS "pets_select" ON public.pets;
DROP POLICY IF EXISTS "pets_update" ON public.pets;
DROP POLICY IF EXISTS "pets_delete" ON public.pets;

CREATE POLICY "pets_insert" ON public.pets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pets_select" ON public.pets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pets_update" ON public.pets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pets_delete" ON public.pets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix profiles table: drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
