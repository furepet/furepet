
-- Fix notification_preferences: drop restrictive policy, add permissive ones
DROP POLICY IF EXISTS "Users manage own notification prefs" ON public.notification_preferences;

CREATE POLICY "Users can select own notification prefs"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification prefs"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification prefs"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification prefs"
ON public.notification_preferences FOR DELETE
USING (auth.uid() = user_id);
