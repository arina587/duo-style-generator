import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FILM_REALISM_PROMPT = `Use image 1 as the original fixed movie frame.

Replace the LEFT character with the person from image 2 and the RIGHT character with the person from image 3.

Keep both people exactly recognizable — same facial features, proportions, skin texture, and natural look. No beauty filters, no smoothing, no plastic skin, no retouching.

Keep the exact expression from image 1. Keep the exact head angle, head tilt, eye direction, gaze, and mouth position. Do not change where the characters are looking.

Match the lighting from image 1 exactly — same shadows, same highlights, same color temperature, same contrast. Keep all cinematic details like darkness, cold or warm tones, grain, dirt, sweat, water, and realistic shadows.

Keep the hair from image 2 and image 3, but naturally adapted to the angle and lighting of image 1.

Keep the background, camera, framing, composition, body pose, clothing, and hands exactly unchanged.

Do NOT change the scene. Do NOT redesign the shot. Do NOT generate a new image.

If the face is in profile — keep the exact profile.
If the character is turned away — do not generate a new face.

Only perform a minimal, realistic face replacement.

The result must look like the same original movie frame, as if it was filmed with these people.`;

const ZOOTOPIA_HUMAN_PROMPT = `Use image 1 as the original fixed animated frame.

Replace the LEFT character with a 3D Pixar-style human version of the person from image 2 and the RIGHT character with a 3D Pixar-style human version of the person from image 3.

Keep both people recognizable, but adapted into Pixar style — same key facial features and hairstyle, translated into stylized 3D animation.

Style must be clearly Disney Pixar 3D:
- smooth stylized skin
- large expressive eyes
- clean shapes
- soft cinematic shading

Keep the exact pose, head angle, gaze, expression, composition, background, and camera from image 1.

Do NOT change the scene. Do NOT redesign anything.

Do NOT use realism. Do NOT mix realistic and cartoon styles.

The result must look like the same Zootopia frame, but with Pixar-style human characters.`;

const ZOOTOPIA_ANIMALS_PROMPT = `Use image 1 as the original fixed animated frame.

Keep the same characters, but redesign them slightly so they feel inspired by the people from image 2 and image 3.

Do NOT replace faces.
Do NOT copy human facial features.
Do NOT turn humans into animals directly.

Only add very subtle inspiration:
- hairstyle hints
- personality
- expression energy
- small design details

Keep characters fully as animals in Zootopia Pixar style.

Keep the exact pose, head angle, gaze, expression, composition, background, and camera from image 1.

Do NOT change the scene. Do NOT redesign composition.

The result must look like the same original Zootopia frame, just slightly restyled characters inspired by the people.`;

function resolvePrompt(style: string | null, mode: string | null): string {
  if (style === "zootopia" && mode === "zootopia_animals") {
    return ZOOTOPIA_ANIMALS_PROMPT;
  }
  if (style === "zootopia") {
    return ZOOTOPIA_HUMAN_PROMPT;
  }
  return FILM_REALISM_PROMPT;
}

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
): Promise<string> {
  console.log("[REPLICATE] creating prediction | model: google/nano-banana-pro");

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({
      version: "fdf4cb96614227f3021c42f35bc92d4fd2e3e1ae9f50ca4004ffa8da64bf8dca",
      input: {
        prompt,
        image_input: [referenceDataUrl, person1DataUrl, person2DataUrl],
      },
    }),
  });

  const createText = await createResponse.text();
  console.log("[REPLICATE] create status:", createResponse.status);
  console.log("[REPLICATE] create response:", createText.substring(0, 800));

  if (!createResponse.ok) {
    throw new Error(`Replicate prediction creation failed (${createResponse.status}): ${createText.substring(0, 400)}`);
  }

  let prediction: Record<string, unknown>;
  try {
    prediction = JSON.parse(createText);
  } catch {
    throw new Error(`Replicate create response non-JSON: ${createText.substring(0, 300)}`);
  }

  const predictionId = prediction?.id as string | undefined;
  if (!predictionId) {
    throw new Error(`Replicate prediction has no ID: ${JSON.stringify(prediction).substring(0, 300)}`);
  }

  const immediateStatus = prediction?.status as string | undefined;

  if (immediateStatus === "succeeded") {
    return extractOutput(prediction);
  }

  if (immediateStatus === "failed" || immediateStatus === "canceled") {
    throw new Error(`Replicate prediction ${immediateStatus}: ${JSON.stringify(prediction?.error ?? prediction?.logs ?? immediateStatus)}`);
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
      throw new Error(`Replicate poll failed (${pollResponse.status}): ${pollText.substring(0, 300)}`);
    }

    const pollData = await pollResponse.json() as Record<string, unknown>;
    const status = pollData?.status as string | undefined;

    console.log(`[REPLICATE] poll attempt ${attempt + 1}: status = ${status}`);

    if (status === "succeeded") {
      return extractOutput(pollData);
    }

    if (status === "failed" || status === "canceled") {
      throw new Error(`Replicate prediction ${status}: ${JSON.stringify(pollData?.error ?? pollData?.logs ?? status)}`);
    }
  }

  throw new Error("Replicate prediction timed out");
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
    const style = formData.get("style") as string | null;
    const mode = formData.get("mode") as string | null;

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

    const prompt = resolvePrompt(style, mode);
    console.log("[GENERATE] style:", style, "| mode:", mode, "| prompt length:", prompt.length);

    const [referenceDataUrl, person1DataUrl, person2DataUrl] = await Promise.all([
      fileToDataUrl(reference),
      fileToDataUrl(person1),
      fileToDataUrl(person2),
    ]);

    const outputUrl = await runReplicate(prompt, referenceDataUrl, person1DataUrl, person2DataUrl, replicateApiKey);
    const imageUrl = await fetchOutputAsDataUrl(outputUrl);

    return new Response(
      JSON.stringify({ success: true, imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[GENERATE ERROR]", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
