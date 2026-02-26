import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple VAPID key generation using Web Crypto
async function generateVAPIDKeys() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const publicKeyBuffer = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return { publicKey, privateKey };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Ensure VAPID keys exist
    const { data: vapidRow } = await supabaseAdmin
      .from("vapid_keys")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!vapidRow) {
      const keys = await generateVAPIDKeys();
      await supabaseAdmin.from("vapid_keys").insert({
        id: 1,
        public_key: keys.publicKey,
        private_key: keys.privateKey,
      });
    }

    // Check for due notifications
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getUTCHours();

    // Get all pets with medical records that have upcoming dates
    const { data: pets } = await supabaseAdmin
      .from("pets")
      .select("id, user_id, pet_name, species, breed, is_deceased");

    if (!pets || pets.length === 0) {
      return new Response(JSON.stringify({ message: "No pets found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let notificationsCreated = 0;

    for (const pet of pets) {
      if (pet.is_deceased) continue;

      // Check user's notification preferences
      const { data: prefs } = await supabaseAdmin
        .from("notification_preferences")
        .select("*")
        .eq("user_id", pet.user_id)
        .maybeSingle();

      if (prefs && !prefs.enabled) continue;

      // Check quiet hours
      if (prefs) {
        const startHour = parseInt(prefs.quiet_hours_start?.split(":")[0] || "21");
        const endHour = parseInt(prefs.quiet_hours_end?.split(":")[0] || "8");
        if (startHour > endHour) {
          if (currentHour >= startHour || currentHour < endHour) continue;
        } else {
          if (currentHour >= startHour && currentHour < endHour) continue;
        }
      }

      // Get medical records for this pet
      const { data: records } = await supabaseAdmin
        .from("medical_records")
        .select("*")
        .eq("pet_id", pet.id);

      if (!records) continue;

      for (const record of records) {
        const details = record.details as Record<string, unknown>;
        let dueDate: string | null = null;
        let notifType = "";
        let title = "";
        let body = "";
        let actionUrl = "/medical";

        // Vaccine reminders
        if (record.category === "vaccines" && details?.next_due_date) {
          if (prefs && !prefs.vaccine_reminders) continue;
          dueDate = details.next_due_date as string;
          notifType = "vaccine_reminder";
          const daysDiff = Math.ceil(
            (new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 30) {
            title = `${pet.pet_name} has a vaccine due in 30 days`;
            body = `${record.title} is due on ${dueDate}`;
          } else if (daysDiff === 14) {
            title = `${pet.pet_name}'s ${record.title} is due in 2 weeks`;
            body = `Don't forget to schedule the appointment`;
          } else if (daysDiff === 3) {
            title = `${pet.pet_name}'s ${record.title} is due in 3 days!`;
            body = `Make sure to get this taken care of soon`;
          } else if (daysDiff === 0) {
            title = `${pet.pet_name}'s ${record.title} is due today`;
            body = `Time for the vaccine appointment`;
          } else {
            continue;
          }
        }

        // Medication refill reminders
        if (record.category === "medications" && details?.refill_date) {
          if (prefs && !prefs.medication_reminders) continue;
          dueDate = details.refill_date as string;
          if (dueDate === today) {
            notifType = "medication_refill";
            title = `Time to refill ${pet.pet_name}'s ${record.title}`;
            body = `The refill date for ${record.title} is today`;
          } else {
            continue;
          }
        }

        // Observation follow-ups
        if (record.category === "observations" && details?.follow_up_date) {
          if (prefs && !prefs.observation_followups) continue;
          dueDate = details.follow_up_date as string;
          if (dueDate === today) {
            notifType = "observation_followup";
            title = `Follow-up reminder for ${pet.pet_name}`;
            body = `Check on "${record.title}"`;
          } else {
            continue;
          }
        }

        if (!title) continue;

        // Check if we already sent this notification today
        const { data: existing } = await supabaseAdmin
          .from("notifications")
          .select("id")
          .eq("user_id", pet.user_id)
          .eq("type", notifType)
          .gte("created_at", `${today}T00:00:00Z`)
          .like("title", `%${record.title}%`)
          .limit(1);

        if (existing && existing.length > 0) continue;

        // Create in-app notification
        await supabaseAdmin.from("notifications").insert({
          user_id: pet.user_id,
          pet_id: pet.id,
          title,
          body,
          type: notifType,
          action_url: actionUrl,
        });

        notificationsCreated++;

        // Send web push to all user's subscriptions
        const { data: subscriptions } = await supabaseAdmin
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", pet.user_id);

        if (subscriptions && subscriptions.length > 0) {
          // For web push, we'd need the web-push library
          // Since Deno edge functions have limited npm support,
          // we send push via the Push API directly where possible
          // For now, in-app notifications are created above
          console.log(`Would send push to ${subscriptions.length} devices for ${pet.pet_name}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ message: `Created ${notificationsCreated} notifications` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error checking notifications:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
