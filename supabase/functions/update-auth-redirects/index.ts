import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

type AuthConfig = {
  site_url?: string;
  uri_allow_list?: string[] | string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const toList = (value: string[] | string | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
  return value
    .split(/[\n,]/g)
    .map((v) => v.trim())
    .filter(Boolean);
};

const getProjectRef = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  try {
    const host = new URL(supabaseUrl).hostname;
    return host.split(".")[0] ?? "";
  } catch {
    return "";
  }
};

const managementToken =
  Deno.env.get("SUPABASE_MANAGEMENT_API_ACCESS_TOKEN") ??
  Deno.env.get("SUPABASE_ACCESS_TOKEN") ??
  Deno.env.get("LOVABLE_API_KEY") ??
  "";

const fetchAuthConfig = async (projectRef: string) => {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${managementToken}`,
      "Content-Type": "application/json",
    },
  });

  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
};

const patchAuthConfig = async (projectRef: string, payload: Record<string, unknown>) => {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${managementToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const previewOrigin = body?.preview_origin as string | undefined;
    const explicitProjectRef = body?.project_ref as string | undefined;

    const projectRef = explicitProjectRef || getProjectRef();
    if (!projectRef) {
      return new Response(JSON.stringify({ error: "Project ref not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!managementToken) {
      return new Response(
        JSON.stringify({
          error: "Missing management API token",
          expected_secret_names: ["SUPABASE_MANAGEMENT_API_ACCESS_TOKEN", "SUPABASE_ACCESS_TOKEN"],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentRes = await fetchAuthConfig(projectRef);
    if (!currentRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to read auth config",
          project_ref: projectRef,
          status: currentRes.status,
          response: currentRes.body,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentConfig = JSON.parse(currentRes.body) as AuthConfig;
    const currentAllow = toList(currentConfig.uri_allow_list);

    const desired = [
      previewOrigin,
      previewOrigin ? `${previewOrigin}/~oauth` : undefined,
      "https://*.lovable.app",
      "https://*.lovable.app/~oauth",
    ].filter((v): v is string => Boolean(v));

    const mergedAllow = Array.from(new Set([...currentAllow, ...desired]));
    const siteUrl = currentConfig.site_url || previewOrigin || "https://lovable.app";

    const patchPayloadArray = {
      site_url: siteUrl,
      uri_allow_list: mergedAllow,
    };

    let patchRes = await patchAuthConfig(projectRef, patchPayloadArray);

    if (!patchRes.ok) {
      const patchPayloadCsv = {
        site_url: siteUrl,
        uri_allow_list: mergedAllow.join(","),
      };
      patchRes = await patchAuthConfig(projectRef, patchPayloadCsv);
    }

    return new Response(
      JSON.stringify({
        project_ref: projectRef,
        requested_additions: desired,
        current_site_url: currentConfig.site_url ?? null,
        current_redirect_urls: currentAllow,
        patch_status: patchRes.status,
        patch_ok: patchRes.ok,
        patch_response: patchRes.body,
      }),
      {
        status: patchRes.ok ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
