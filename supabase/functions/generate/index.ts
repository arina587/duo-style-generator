import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────

const FILM_REALISM_PROMPT = `STRICT CINEMATIC CHARACTER RECASTING. DO NOT REGENERATE THE SCENE.

Reference image = base shot
Image 1 = Person A
Image 2 = Person B

Recast LEFT character as Person A.
Recast RIGHT character as Person B.

Preserve EXACTLY:
- camera
- composition
- perspective
- pose
- body position
- clothing
- background
- framing
- hands (do not modify)

PRIORITY ORDER:
1. expression from reference
2. lighting and scene effects from reference
3. identity structure from person images

Do NOT average or blend identity with expression.

EXPRESSION:
Use expression ONLY from reference:
- eyes
- eyebrows
- mouth
- micro-expressions

If conflict occurs, preserve reference expression over identity accuracy.

HEAD:
Keep exact orientation from reference.
Keep exact gaze direction from reference.
No rotation correction.

IDENTITY:
Transfer only facial identity structure from person images:
- bone structure
- jawline
- cheekbones
- nose shape
- natural lip shape
- natural eye shape without changing reference expression

Do NOT transfer:
- source expression
- source lighting
- source skin rendering

HAIR:
Use identity hair, adapted to reference angle, lighting, and scene continuity.

LIGHTING (CRITICAL):
Face must obey scene lighting exactly:
- same light direction
- same shadows
- same highlights
- same color temperature
- same contrast
- same exposure behavior

Face must look naturally captured in the same shot, NOT pasted.

DETAILS:
Preserve and apply scene surface effects from reference:
- dirt
- sweat
- blood
- water
- snow
- skin texture
- texture imperfections

These details must follow the reference scene, even if source images are clean.

IDENTITY:
Preserve real facial structure and proportions.
No beautifying.
No smoothing.
No glamour retouching.

FORBIDDEN:
- full redraw
- pose change
- camera change
- face blending
- pasted look
- beauty retouching
- modifying hands

RESULT:
Same scene, same shot, same cinematic frame, with both identities naturally integrated as if they were physically present on set.`;

const ZOOTOPIA_HUMAN_PROMPT = `STRICT DISNEY/PIXAR STYLE CHARACTER RECASTING.

Reference image = base scene
Image 1 = Person A
Image 2 = Person B

Recast LEFT character as animated human Person A.
Recast RIGHT character as animated human Person B.

Preserve EXACTLY:
- pose
- composition
- camera
- background
- framing
- head orientation
- gaze direction
- scene emotion

EXPRESSION:
Use expression ONLY from reference:
- eyes
- eyebrows
- mouth
- emotional intensity

STYLE:
- strong Disney/Pixar 3D animated look
- stylized human faces
- expressive eyes
- clean cinematic shading
- clearly non-realistic
- polished feature animation aesthetic

IDENTITY:
Keep recognizable facial identity adapted into animated human form:
- face proportions
- hairstyle
- visual character feel

Do NOT make them realistic.
Do NOT make them semi-real.
Do NOT drift into live-action.

HAIR:
Use identity hair adapted to cartoon styling and reference angle.

FORBIDDEN:
- realistic faces
- weak cartoon style
- scene changes
- animal features
- hybrid human-animal look

RESULT:
A Zootopia-style scene with strong Pixar-like animated human characters, preserving the original scene while transforming both people into stylized 3D cartoon humans.`;

const ZOOTOPIA_ANIMALS_PROMPT = `STRICT ANTHROPOMORPHIC CHARACTER REINTERPRETATION.

Reference image = base scene
Image 1 = Person A
Image 2 = Person B

Recast LEFT character as an anthropomorphic animal character inspired by Person A.
Recast RIGHT character as an anthropomorphic animal character inspired by Person B.

IMPORTANT:
Do NOT transfer human faces.
Do NOT perform face swap.
Do NOT create human-animal hybrid faces.

This is character reinterpretation, not face replacement.

PRESERVE EXACTLY:
- pose
- scene
- camera
- composition
- background
- framing
- head orientation
- gaze direction
- emotional situation

EXPRESSION:
Keep expression and emotion from reference,
but expressed through stylized animal anatomy.

IDENTITY:
Preserve recognizability indirectly through non-literal traits only:
- personality feel
- visual attitude
- soft vs sharp facial impression
- wide vs narrow character proportions
- hairstyle silhouette reinterpreted as fur shape, fur styling, or head silhouette
- subtle color inspiration reinterpreted into fur palette or design accents

Do NOT copy directly:
- human facial structure
- human skin
- human lips
- human nose
- human eyes
- exact human face layout

STYLE:
- Disney/Pixar Zootopia-style 3D
- stylized fur
- expressive anthropomorphic animal faces
- clean animated rendering
- fully non-human character design

CHARACTER RULE:
Characters must remain believable Zootopia-style animals.
They must look like original animated animal characters inspired by the persons,
not transformed humans.

SAFETY RULE:
If resemblance becomes too literal, reduce human similarity and increase stylization.

Priority:
1. believable animal character
2. strong Zootopia style
3. subtle inspiration from Person A / Person B

FORBIDDEN:
- human faces on animals
- realistic humans
- hybrid faces
- direct face transfer
- uncanny humanized animal skin
- scene changes

RESULT:
A Zootopia-style scene with fully anthropomorphic animal characters inspired by Person A and Person B, while preserving the original animated scene, pose, and emotion.`;

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
