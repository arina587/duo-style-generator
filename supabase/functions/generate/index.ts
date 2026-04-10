import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────

const FILM_REALISM_PROMPT = `STRICT CINEMATIC IDENTITY TRANSFER. NO FULL SCENE REGENERATION.

Reference image = base scene
Image 1 = Person A
Image 2 = Person B

Replace the LEFT subject with Person A.
Replace the RIGHT subject with Person B.
Do not swap positions.

Preserve exactly:
- scene composition
- camera angle and perspective
- lighting and color grading
- depth of field
- body pose and posture
- clothing
- background
- framing
- hands and fingers (do not modify)

Use ONLY the facial expression from the reference scene:
- eye direction
- eyebrow tension
- mouth shape
- micro-expressions

Ignore expressions from identity images.

Keep exact head orientation from the reference:
- front → transfer face + hair
- three-quarter → keep angle, transfer face + hair
- profile → keep exact profile, do not rotate to front, transfer face + hair
- back / hidden face → do not generate a face

Hair must come from the identity images, not from the reference.

LIGHTING INTEGRATION IS CRITICAL:
The transferred faces must match the exact scene lighting:
- same light direction
- same shadows
- same highlights
- same color temperature
- same contrast response

Faces must look naturally captured in the same shot, not cut out or pasted.

Preserve all original facial surface details from the reference:
- dirt
- sweat
- blood
- water
- snow
- skin texture
- imperfections

Preserve identity strongly:
- face shape
- eye spacing
- nose structure
- jawline
- proportions

Do not beautify.
Do not smooth skin.
Do not blur details.
Do not blend identities.
Do not modify hands.
Do not redraw the full image.

Result:
The final frame must look like the original scene with only the LEFT and RIGHT identities replaced naturally and realistically.`;

const ZOOTOPIA_HUMAN_PROMPT = `STRICT STYLIZED CHARACTER TRANSFER. KEEP THE ORIGINAL SCENE.

Reference image = base scene
Image 1 = Person A
Image 2 = Person B

Replace the LEFT subject with Person A.
Replace the RIGHT subject with Person B.
Do not swap positions.

Transform the characters into stylized 3D animated humans in a Disney/Pixar-like cinematic cartoon style.

Important style target:
- polished 3D animated feature film look
- soft but structured facial forms
- expressive eyes
- clean cinematic shading
- stylized proportions
- appealing animated design
- clearly cartoon, not realistic

Keep exactly:
- original scene composition
- original camera and framing
- original background
- original body pose
- original character position
- original head orientation

Identity must stay recognizable, but adapted to animated human design.

Use the expression from the reference scene.
Keep exact gaze direction.
Keep exact head angle.

Hair must come from the identity images, adapted into the animated style.

Do not make them photorealistic humans.
Do not make them generic cartoon dolls.
Do not change the scene.
Do not regenerate the whole frame.

Result:
The output must look like the original Zootopia-style scene, but with the LEFT and RIGHT characters replaced by clearly recognizable animated human versions of Person A and Person B in a strong Disney/Pixar-like 3D style.`;

const ZOOTOPIA_ANIMALS_PROMPT = `STRICT ANTHROPOMORPHIC ANIMAL TRANSFORMATION. KEEP THE ORIGINAL SCENE.

Reference image = base scene
Image 1 = Person A
Image 2 = Person B

Replace the LEFT subject with Person A as an anthropomorphic fox.
Replace the RIGHT subject with Person B as an anthropomorphic rabbit.
Do not swap positions.

Keep exactly:
- original background
- original composition
- original framing
- original body pose
- original character position
- original head orientation

Transform the characters fully into stylized 3D animated animals.
This must be clearly a Disney/Pixar/Zootopia-like cartoon world.

CRITICAL:
- do not keep human faces
- do not keep human skin
- do not create half-human half-animal faces
- faces must be fully animal-based

Identity should be preserved through:
- expression
- attitude
- facial proportions adapted into animal design
- recognizable personality cues

NOT through literal human facial structure.

Fox design:
- orange fur
- elongated muzzle
- pointed ears
- stylized 3D cartoon fur

Rabbit design:
- long ears
- soft rounded muzzle
- stylized 3D cartoon fur

Keep exact expression from the reference.
Keep exact gaze direction.
Keep exact pose.

Do not generate realistic animals.
Do not use photorealistic fur.
Do not create a horror hybrid.
Do not make realistic human likeness in animal mode.

Result:
The output must look like the original Zootopia-style scene, with the LEFT and RIGHT characters transformed into fully stylized anthropomorphic fox and rabbit characters that preserve pose, expression, scene, and recognizable identity feeling.`;

// ─────────────────────────────────────────────
// PROMPT ROUTING
// ─────────────────────────────────────────────

function resolvePrompt(style: string | null, mode: string | null): string {
  if (style === "zootopia" && mode === "zootopia_animals") {
    return ZOOTOPIA_ANIMALS_PROMPT;
  }
  if (style === "zootopia") {
    return ZOOTOPIA_HUMAN_PROMPT;
  }
  return FILM_REALISM_PROMPT;
}

// ─────────────────────────────────────────────
// IMAGE CONVERSION
// ─────────────────────────────────────────────

async function fileToDataUrl(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error(`Image file is empty or missing: ${file?.name ?? "unknown"}`);
  }

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

// ─────────────────────────────────────────────
// REPLICATE — google/nano-banana-pro
// ─────────────────────────────────────────────

async function runReplicate(
  prompt: string,
  referenceDataUrl: string,
  person1DataUrl: string,
  person2DataUrl: string,
  apiKey: string
): Promise<string> {
  console.log("[REPLICATE] creating prediction | model: google/nano-banana-pro");

  const predictionBody = {
    version: "fdf4cb96614227f3021c42f35bc92d4fd2e3e1ae9f50ca4004ffa8da64bf8dca",
    input: {
      prompt,
      image_input: [referenceDataUrl, person1DataUrl, person2DataUrl],
    },
  };

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify(predictionBody),
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
  console.log("[REPLICATE] fetching output image from:", url);
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

// ─────────────────────────────────────────────
// EDGE FUNCTION ENTRY POINT
// ─────────────────────────────────────────────

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

    const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    for (const [label, file] of [["reference", reference], ["person1", person1], ["person2", person2]] as [string, File][]) {
      if (file.size === 0) {
        return new Response(
          JSON.stringify({ success: false, error: `${label} file is empty` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (file.type && !supportedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ success: false, error: `${label} has unsupported format: ${file.type}. Use JPEG, PNG, or WebP.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateApiKey) throw new Error("REPLICATE_API_KEY not configured");

    console.log("[GENERATE] style:", style, "| mode:", mode);

    const [referenceDataUrl, person1DataUrl, person2DataUrl] = await Promise.all([
      fileToDataUrl(reference),
      fileToDataUrl(person1),
      fileToDataUrl(person2),
    ]);

    const prompt = resolvePrompt(style, mode);
    console.log("[GENERATE] prompt variant:", style === "zootopia" && mode === "zootopia_animals" ? "ZOOTOPIA_ANIMALS" : style === "zootopia" ? "ZOOTOPIA_HUMAN" : "FILM_REALISM");

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
