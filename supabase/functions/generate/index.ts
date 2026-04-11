import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────

const FILM_REALISM_PROMPT = `STRICT CINEMATIC IDENTITY REPLACEMENT.

INPUT:
- Reference image = original movie frame (source of truth)
- Image 1 = Person A
- Image 2 = Person B

TASK:
Replace identities of characters WITHOUT altering the original frame.

CHARACTER MAPPING:
- LEFT character → Person A
- RIGHT character → Person B

SCENE LOCK (ABSOLUTE):
The reference frame must remain unchanged:
- camera
- lens perspective
- composition
- framing
- body pose
- clothing
- background
- hands

NO regeneration.
NO reinterpretation.
NO scene redraw.

IDENTITY REPLACEMENT:
Transfer ONLY identity:
- facial structure
- facial proportions
- identity-specific features

Do NOT:
- beautify
- average the face
- smooth skin
- stylize identity

EXPRESSION LOCK:
Expression comes ONLY from the reference frame:
- eyes
- eyebrows
- mouth
- facial tension
- micro-expressions

Identity must adapt to the reference expression, never replace it.

POSE-AWARE RULES:
- Front-facing subject → full identity replacement
- Side profile → partial identity adaptation respecting perspective
- Back-facing or occluded → do NOT replace face, only adapt hair / silhouette

HEAD:
Keep exact orientation. No rotation.

HAIR:
Use identity hair adapted to:
- angle
- motion
- silhouette
- lighting

LIGHTING (CRITICAL):
Face must obey scene lighting exactly:
- same direction
- same shadows
- same highlights
- same exposure
- same color temperature
- same contrast

Face must look naturally captured in the same shot, never pasted.

TEXTURE TRANSFER:
Preserve:
- film grain
- skin texture
- dirt
- sweat
- blood
- water
- environmental tint

FORBIDDEN:
- full redraw
- pose change
- camera change
- composition change
- clean studio face
- smoothing
- pasted look
- altering hands
- altering clothing
- altering background

RESULT:
Original scene preserved, identities seamlessly integrated as if filmed on set.`;

const ZOOTOPIA_HUMAN_PROMPT = `STRICT PIXAR-STYLE HUMAN TRANSFORMATION.

INPUT:
- Reference image = Zootopia scene
- Image 1 = Person A
- Image 2 = Person B

TASK:
Convert characters into stylized animated humans while preserving the original scene.

CHARACTER MAPPING:
- LEFT → Person A
- RIGHT → Person B

SCENE LOCK:
Preserve exactly:
- pose
- composition
- camera
- framing
- background

STYLE LOCK (CRITICAL):
Must be:
- Disney / Pixar 3D style
- clearly stylized
- non-realistic
- expressive
- clean shading

IDENTITY:
Translate identity into stylized form:
- recognizable features
- adapted to Pixar proportions

Do NOT paste real faces.
Do NOT break stylization.

EXPRESSION:
Keep from reference.

HEAD:
No rotation. Preserve orientation.

HAIR:
Convert to stylized 3D animated hair.

LIGHTING:
Preserve original scene lighting and color palette.

FORBIDDEN:
- realism
- weak cartoon style
- anime
- uncanny faces
- scene changes

RESULT:
Pixar-style human characters in original Zootopia scene.`;

const ZOOTOPIA_ANIMALS_PROMPT = `STRICT ZOOTOPIA CHARACTER REINTERPRETATION.

INPUT:
- Reference image = Zootopia scene
- Image 1 = Person A
- Image 2 = Person B

TASK:
Reinterpret characters as animals inspired by people, NOT face swap.

CHARACTER MAPPING:
- LEFT → fox inspired by Person A
- RIGHT → rabbit inspired by Person B

CORE RULE:
NO human face transfer.
NO hybrid faces.

STYLE:
- Disney Pixar Zootopia 3D
- stylized
- clean
- expressive

IDENTITY:
Represent via:
- expression
- personality
- attitude
- subtle design cues

NOT via human facial structure.

SCENE LOCK:
Preserve:
- pose
- composition
- camera
- background
- lighting

EXPRESSION:
Keep original emotion.

FORBIDDEN:
- human faces
- realistic animals
- creepy hybrids
- scene changes

RESULT:
Authentic Zootopia-style animals inspired by the people.`;

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
    const promptVariant =
      style === "zootopia" && mode === "zootopia_animals"
        ? "ZOOTOPIA_ANIMALS"
        : style === "zootopia"
        ? "ZOOTOPIA_HUMAN"
        : "FILM_REALISM";
    console.log("[GENERATE] prompt variant:", promptVariant);

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
