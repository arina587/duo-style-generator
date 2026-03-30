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

    const person1 = formData.get("person1") as File;
    const person2 = formData.get("person2") as File;
    const reference = formData.get("reference") as File;

    if (!person1 || !person2 || !reference) {
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
      prompt: `Use the reference image as the base composition.

Insert TWO people into the scene:
- Person A = first uploaded image
- Person B = second uploaded image

STRICT RULES:
- Do NOT merge faces
- Keep identities 100% separate
- Preserve facial structure and likeness
- No stylization of faces
- Keep natural skin texture

Match:
- pose
- lighting
- perspective
- camera angle

Final image must contain exactly TWO people.`,
      image: referenceBase64,
      face_image_1: person1Base64,
      face_image_2: person2Base64,
      guidance_scale: 5,
      num_inference_steps: 30
    };

    const output = await replicate.run(
      "usamaehsan/instant-id-x-juggernaut",
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
