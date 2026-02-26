import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { documentId } = await req.json();
    if (!documentId) {
      return new Response(JSON.stringify({ error: "documentId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get document record
    const { data: doc, error: docError } = await supabase
      .from("medical_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Update status to processing
    await supabase.from("medical_documents").update({ status: "processing" }).eq("id", documentId);

    // Download file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("medical-documents")
      .download(doc.file_path);

    if (fileError || !fileData) {
      await supabase.from("medical_documents").update({ status: "error" }).eq("id", documentId);
      return new Response(JSON.stringify({ error: "Could not download file" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      await supabase.from("medical_documents").update({ status: "error" }).eq("id", documentId);
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // For images, convert to base64; for PDFs, extract text description
    let contentPayload: any[];
    const isImage = doc.file_type.startsWith("image/");

    if (isImage) {
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      contentPayload = [
        { type: "text", text: "Extract all medical information from this veterinary document image." },
        { type: "image_url", image_url: { url: `data:${doc.file_type};base64,${base64}` } },
      ];
    } else {
      // For PDFs, send as text prompt asking to analyze
      const text = await fileData.text();
      contentPayload = [
        { type: "text", text: `Extract all medical information from this veterinary document:\n\n${text.substring(0, 15000)}` },
      ];
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a veterinary medical record analyzer. Extract structured medical information from pet medical documents.`,
          },
          { role: "user", content: contentPayload },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_medical_data",
              description: "Extract structured medical data from a veterinary document",
              parameters: {
                type: "object",
                properties: {
                  vaccines: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        date: { type: "string", description: "YYYY-MM-DD if available" },
                        notes: { type: "string" },
                      },
                      required: ["name"],
                      additionalProperties: false,
                    },
                  },
                  diagnoses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        date: { type: "string" },
                        notes: { type: "string" },
                      },
                      required: ["name"],
                      additionalProperties: false,
                    },
                  },
                  medications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        dosage: { type: "string" },
                        frequency: { type: "string" },
                        start_date: { type: "string" },
                        end_date: { type: "string" },
                        notes: { type: "string" },
                      },
                      required: ["name"],
                      additionalProperties: false,
                    },
                  },
                  surgeries: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        date: { type: "string" },
                        notes: { type: "string" },
                      },
                      required: ["name"],
                      additionalProperties: false,
                    },
                  },
                  allergies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        severity: { type: "string" },
                        notes: { type: "string" },
                      },
                      required: ["name"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["vaccines", "diagnoses", "medications", "surgeries", "allergies"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_medical_data" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      await supabase.from("medical_documents").update({ status: "error" }).eq("id", documentId);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted, please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiResult = await aiResponse.json();
    let extractedData = { vaccines: [], diagnoses: [], medications: [], surgeries: [], allergies: [] };

    try {
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        extractedData = JSON.parse(toolCall.function.arguments);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
    }

    // Save extracted data to document
    await supabase.from("medical_documents").update({
      status: "processed",
      extracted_data: extractedData as any,
    }).eq("id", documentId);

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-medical-doc error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
