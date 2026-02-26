
-- Fix: Remove overly permissive INSERT policy on notifications
-- Edge function uses service_role which bypasses RLS
DROP POLICY "System can insert notifications" ON public.notifications;
