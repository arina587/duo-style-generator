import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_VERSION = "fdf4cb96614227f3021c42f35bc92d4fd2e3e1ae9f50ca4004ffa8da64bf8dca";
const MODEL_NAME = "zsxkib/flux-pulid";

const UNIVERSAL_PROMPT = `Use the provided reference image and separately uploaded photos of the man and the woman.
The man replaces the male character, the woman replaces the female character.

STRICT IDENTITY LOCK:
Preserve identity 1:1 from uploaded photos — exact facial structure, proportions, age, skin tone, eye shape, eyelids, eyebrows, nose, lips, jawline, hairstyle, hair color and length. Faces must remain fully recognizable.

CRITICAL POSE & EXPRESSION LOCK:
Match the reference EXACTLY:
— same head angle and rotation
— same tilt and perspective
— same facial expression
— if eyes are closed → keep them closed
— if eyes look sideways → keep same gaze direction
— if face is partially turned → keep the same angle (no frontal correction)

CRITICAL FACE GEOMETRY:
Rebuild the face directly inside the original head position.
Do NOT paste or overlay the face.
Do NOT shift head position or proportions.
Face must follow the exact skull orientation from the reference.

CRITICAL LIGHTING & COLOR MATCH:
Fully inherit lighting from the scene:
— same color temperature
— same shadows and highlights
— same contrast and exposure
— same environment color influence (warm, cold, neon, etc.)
Skin tones must be adapted to the scene lighting, not original photo lighting.

CRITICAL HAIR & OCCLUSION:
Preserve all occlusions exactly as in the reference:
— hair covering parts of the face must stay in place
— do not remove or move hair
— do not reveal hidden parts of the face
— respect shadows, objects, hands, or motion blur covering the face

CRITICAL VISIBILITY RULE:
Only generate what is visible in the reference.
Do NOT reconstruct hidden facial areas.
Do NOT "complete" the face.

CRITICAL BODY & PROPORTION LOCK:
Keep original body, pose, proportions, and anatomy from the reference.
Only minimally adapt if needed for natural integration.
Do not distort body shape or posture.

CRITICAL STYLE ADAPTATION:
Automatically match the style of the reference:
— if realistic → photorealistic
— if cinematic → cinematic grading
— if stylized 3D → same stylized 3D rendering
Faces must be converted into the same style (not pasted realism into cartoon).

CRITICAL BACKGROUND LOCK:
Keep environment, clothing, objects, composition, framing and camera unchanged.

CRITICAL HANDS:
All visible hands must be correct — five fingers, natural anatomy, no deformation.

FINAL GOAL:
The result must look like the same original scene, with identical pose, lighting, and composition, but with these two people naturally present in place of the original characters.
No pasted look, no plastic skin, no pose drift, no lighting mismatch.
High detail, consistent rendering, 4K.`;

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  const b64 = btoa(binary);
  const mime = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  return `data:${mime};base64,${b64}`;
}

async function runReplicate(
  prompt: string,
  referenceDataUrl: string,
  person1DataUrl: string,
  person2DataUrl: string,
  apiKey: string
): Promise<{ outputUrl: string; debugInfo: Record<string, unknown> }> {
  const inputObject = {
    prompt,
    image_input: [referenceDataUrl, person1DataUrl, person2DataUrl],
  };

  const debugInfo: Record<string, unknown> = {
    model: MODEL_NAME,
    version: MODEL_VERSION,
    prompt_length: prompt.length,
    images: {
      reference: {
        exists: !!referenceDataUrl,
        is_data_url: referenceDataUrl.startsWith("data:"),
        preview: referenceDataUrl.substring(0, 50),
        size_chars: referenceDataUrl.length,
      },
      person1: {
        exists: !!person1DataUrl,
        is_data_url: person1DataUrl.startsWith("data:"),
        preview: person1DataUrl.substring(0, 50),
        size_chars: person1DataUrl.length,
      },
      person2: {
        exists: !!person2DataUrl,
        is_data_url: person2DataUrl.startsWith("data:"),
        preview: person2DataUrl.substring(0, 50),
        size_chars: person2DataUrl.length,
      },
    },
  };

  console.log("[DEBUG] full debug info:", JSON.stringify(debugInfo, null, 2));

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: inputObject,
    }),
  });

  const createText = await createResponse.text();
  const replicateStatus = createResponse.status;

  console.log("[REPLICATE] create status:", replicateStatus);
  console.log("[REPLICATE] create response:", createText.substring(0, 1200));

  debugInfo.replicate_response_status = replicateStatus;
  debugInfo.replicate_raw_body = createText.substring(0, 2000);

  if (!createResponse.ok) {
    throw Object.assign(
      new Error(`Replicate prediction creation failed (${replicateStatus}): ${createText.substring(0, 500)}`),
      { debugInfo }
    );
  }

  let prediction: Record<string, unknown>;
  try {
    prediction = JSON.parse(createText);
  } catch {
    throw Object.assign(
      new Error(`Replicate create response non-JSON: ${createText.substring(0, 400)}`),
      { debugInfo }
    );
  }

  const predictionId = prediction?.id as string | undefined;
  if (!predictionId) {
    throw Object.assign(
      new Error(`Replicate prediction has no ID: ${JSON.stringify(prediction).substring(0, 300)}`),
      { debugInfo }
    );
  }

  const immediateStatus = prediction?.status as string | undefined;

  if (immediateStatus === "succeeded") {
    return { outputUrl: extractOutput(prediction), debugInfo };
  }

  if (immediateStatus === "failed" || immediateStatus === "canceled") {
    throw Object.assign(
      new Error(`Replicate prediction ${immediateStatus}: ${JSON.stringify(prediction?.error ?? prediction?.logs ?? immediateStatus)}`),
      { debugInfo }
    );
  }

  console.log("[REPLICATE] polling prediction:", predictionId);

  const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
  const maxAttempts = 80;
  const pollIntervalMs = 3000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const pollResponse = await fetch(pollUrl, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!pollResponse.ok) {
      const pollText = await pollResponse.text();
      throw Object.assign(
        new Error(`Replicate poll failed (${pollResponse.status}): ${pollText.substring(0, 300)}`),
        { debugInfo }
      );
    }

    const pollData = await pollResponse.json() as Record<string, unknown>;
    const status = pollData?.status as string | undefined;

    console.log(`[REPLICATE] poll attempt ${attempt + 1}: status = ${status}`);

    if (status === "succeeded") {
      return { outputUrl: extractOutput(pollData), debugInfo };
    }

    if (status === "failed" || status === "canceled") {
      throw Object.assign(
        new Error(`Replicate prediction ${status}: ${JSON.stringify(pollData?.error ?? pollData?.logs ?? status)}`),
        { debugInfo }
      );
    }
  }

  throw Object.assign(new Error("Replicate prediction timed out"), { debugInfo });
}

function extractOutput(prediction: Record<string, unknown>): string {
  const output = prediction?.output;

  let outputUrl: string | undefined;
  if (typeof output === "string" && output.startsWith("http")) {
    outputUrl = output;
  } else if (Array.isArray(output) && output.length > 0 && typeof output[0] === "string") {
    outputUrl = output[0] as string;
  }

  if (!outputUrl) {
    throw new Error(`Replicate succeeded but no output URL found: ${JSON.stringify(prediction).substring(0, 300)}`);
  }

  console.log("[REPLICATE] output url:", outputUrl);
  return outputUrl;
}

async function fetchOutputAsDataUrl(url: string): Promise<string> {
  const imgResponse = await fetch(url);
  if (!imgResponse.ok) {
    throw new Error(`Failed to fetch Replicate output image (${imgResponse.status})`);
  }
  const imgBuffer = await imgResponse.arrayBuffer();
  const imgBytes = new Uint8Array(imgBuffer);

  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < imgBytes.length; i += chunkSize) {
    const chunk = imgBytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  const b64 = btoa(binary);
  const contentType = imgResponse.headers.get("content-type") ?? "image/jpeg";
  return `data:${contentType};base64,${b64}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const formData = await req.formData();

    const reference = formData.get("reference") as File | null;
    const person1 = formData.get("person1") as File | null;
    const person2 = formData.get("person2") as File | null;

    if (!reference || !person1 || !person2) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required images: reference, person1, person2" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const [label, file] of [["reference", reference], ["person1", person1], ["person2", person2]] as [string, File][]) {
      if (file.size === 0) {
        return new Response(
          JSON.stringify({ success: false, error: `${label} file is empty` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateApiKey) throw new Error("REPLICATE_API_KEY not configured");

    console.log("[GENERATE] using universal prompt, length:", UNIVERSAL_PROMPT.length);

    const [referenceDataUrl, person1DataUrl, person2DataUrl] = await Promise.all([
      fileToDataUrl(reference),
      fileToDataUrl(person1),
      fileToDataUrl(person2),
    ]);

    const { outputUrl, debugInfo } = await runReplicate(UNIVERSAL_PROMPT, referenceDataUrl, person1DataUrl, person2DataUrl, replicateApiKey);
    const imageUrl = await fetchOutputAsDataUrl(outputUrl);

    return new Response(
      JSON.stringify({ success: true, imageUrl, debug: debugInfo }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const debugInfo = (error as { debugInfo?: Record<string, unknown> }).debugInfo ?? {};
    console.error("[GENERATE ERROR]", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg, debug: debugInfo }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
