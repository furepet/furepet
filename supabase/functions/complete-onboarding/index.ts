import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authUser.id;
    const body = await req.json();
    const { pet, isPremium } = body;

    if (!pet?.pet_name || !pet?.species) {
      return new Response(
        JSON.stringify({ error: "pet_name and species are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert pet
    const { data: petRecord, error: petError } = await supabase
      .from("pets")
      .insert({ ...pet, user_id: userId })
      .select("id")
      .single();

    if (petError) {
      console.error("Pet insert error:", JSON.stringify(petError));
      return new Response(JSON.stringify({ error: petError.message, code: petError.code }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        subscription_status: isPremium ? "premium" : "free",
      })
      .eq("user_id", userId);

    if (profileError) {
      console.error("Profile update error:", JSON.stringify(profileError));
      // Non-blocking — pet was created successfully
    }

    return new Response(
      JSON.stringify({ success: true, petId: petRecord.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
