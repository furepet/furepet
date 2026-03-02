import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Parse request
    const { table, action, data, match, filters, onConflict } = await req.json();

    if (!table || !action) {
      return new Response(JSON.stringify({ error: "Missing table or action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Allowlist of tables
    const allowedTables = [
      "pets", "profiles", "pet_weights", "pet_measurements",
      "vaccines", "medications", "diagnoses", "surgeries",
      "allergies", "behavioral_issues", "observations",
      "medical_records", "medical_documents", "memorial",
      "notification_preferences", "push_subscriptions",
      "chat_messages", "emergency_contacts", "notifications",
      "village_vet", "village_walker", "village_daycare", "village_groomer",
      "village_members",
    ];

    if (!allowedTables.includes(table)) {
      return new Response(JSON.stringify({ error: `Table '${table}' not allowed` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client to bypass RLS
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result;

    switch (action) {
      case "insert": {
        const insertData = { ...data, user_id: userId };
        const { data: inserted, error } = await serviceClient
          .from(table)
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;
        result = inserted;
        break;
      }

      case "upsert": {
        const upsertData = { ...data, user_id: userId };
        const upsertOpts: any = {};
        if (onConflict) upsertOpts.onConflict = onConflict;
        const { data: upserted, error } = await serviceClient
          .from(table)
          .upsert(upsertData, upsertOpts)
          .select()
          .single();
        if (error) throw error;
        result = upserted;
        break;
      }

      case "update": {
        if (match?.id) {
          // Single record update by ID - verify ownership
          const { data: existing, error: fetchErr } = await serviceClient
            .from(table)
            .select("user_id")
            .eq("id", match.id)
            .single();
          if (fetchErr || !existing) throw new Error("Record not found");
          if (existing.user_id !== userId) throw new Error("Not authorized");

          const { data: updated, error } = await serviceClient
            .from(table)
            .update(data)
            .eq("id", match.id)
            .select()
            .single();
          if (error) throw error;
          result = updated;
        } else if (filters) {
          // Bulk update with filters - always scoped to user_id
          let query = serviceClient.from(table).update(data).eq("user_id", userId);
          for (const [col, val] of Object.entries(filters)) {
            query = query.eq(col, val);
          }
          const { data: updated, error } = await query.select();
          if (error) throw error;
          result = updated;
        } else {
          return new Response(JSON.stringify({ error: "Missing match.id or filters for update" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;
      }

      case "delete": {
        if (match?.id) {
          // Single record delete by ID - verify ownership
          const { data: existing, error: fetchErr } = await serviceClient
            .from(table)
            .select("user_id")
            .eq("id", match.id)
            .single();
          if (fetchErr || !existing) throw new Error("Record not found");
          if (existing.user_id !== userId) throw new Error("Not authorized");

          const { error } = await serviceClient
            .from(table)
            .delete()
            .eq("id", match.id);
          if (error) throw error;
          result = { deleted: true };
        } else if (filters) {
          // Bulk delete with filters - always scoped to user_id
          let query = serviceClient.from(table).delete().eq("user_id", userId);
          for (const [col, val] of Object.entries(filters)) {
            query = query.eq(col, val);
          }
          const { error } = await query;
          if (error) throw error;
          result = { deleted: true };
        } else {
          return new Response(JSON.stringify({ error: "Missing match.id or filters for delete" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("save-data error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
