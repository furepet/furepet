import { supabase } from "@/integrations/supabase/client";

interface SaveDataParams {
  table: string;
  action: "insert" | "update" | "delete";
  data?: Record<string, any>;
  match?: { id: string };
}

export async function saveData(params: SaveDataParams): Promise<any> {
  const TIMEOUT_MS = 5000;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const url = `https://${projectId}.supabase.co/functions/v1/save-data`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Save failed (${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Save timed out — please try again");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
