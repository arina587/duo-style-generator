import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Replicate from "npm:replicate@0.34.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  return `data:${file.type};base64,${base64}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();

    const reference = formData.get("reference") as File;
    const person1 = formData.get("person1") as File;
    const person2 = formData.get("person2") as File;

    if (!reference || !person1 || !person2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing images"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN");

    if (!replicateToken) {
      return new Response(
        JSON.stringify({
          error: "Replicate API token not configured"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const replicate = new Replicate({
      auth: replicateToken
    });

    const referenceBase64 = await fileToBase64(reference);
    const person1Base64 = await fileToBase64(person1);
    const person2Base64 = await fileToBase64(person2);

    const input = {
      prompt: `Replace the people in the reference image with the two provided persons.

Person A = first uploaded image
Person B = second uploaded image

STRICT RULES:
- Do NOT merge faces
- Keep identities strictly separate
- Preserve facial structure and likeness
- Do not stylize faces
- Keep natural skin texture

Match exactly:
- pose
- framing
- camera angle
- lighting
- background

The final image must contain exactly TWO people.`,
      image: [
        referenceBase64,
        person1Base64,
        person2Base64
      ]
    };

    const output = await replicate.run(
      "qwen/qwen-image-edit-2511",
      { input }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
