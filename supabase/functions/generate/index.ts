import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────

const FILM_REALISM_PROMPT = `STRICT CINEMATIC IDENTITY INTEGRATION INTO AN EXISTING FILM FRAME.

INPUT:
- Reference image = original movie frame and absolute source of truth
- Image 1 = Person A
- Image 2 = Person B

TASK:
Integrate the identity of Person A into the LEFT character and the identity of Person B into the RIGHT character while preserving the original film frame exactly.

This is NOT a pasted face overlay.
This is NOT a clean portrait insertion.
This is identity integration inside the existing shot.

SCENE LOCK (ABSOLUTE):
Do not alter:
- camera
- lens perspective
- framing
- composition
- body pose
- body position
- clothing
- background
- environment
- hands

The output must remain the same shot.

IDENTITY RULE:
Preserve recognizable real identity through:
- facial structure
- proportions
- key identity features

Do NOT beautify.
Do NOT smooth skin.
Do NOT make faces cleaner than the original frame.
Do NOT generate glamour portraits.

EXPRESSION RULE:
Expression must come only from the reference frame:
- eyes
- eyebrows
- mouth
- facial tension
- emotional intensity
- micro-expression

Identity must conform to the existing expression in the shot.

HEAD AND GAZE LOCK (CRITICAL):
Preserve exactly:
- head angle
- head tilt
- neck direction
- gaze direction
- eye line
- perspective

Do NOT rotate the head.
Do NOT redirect the eyes.
Do NOT make the subject look into camera unless the reference already does.

POSE-AWARE HANDLING:
- front-facing → integrate identity fully while preserving exact expression and angle
- side profile → preserve exact profile; adapt identity only within the visible angle
- back-facing / heavily occluded → do not invent a visible face; preserve the original back view and only adapt hair or silhouette subtly if appropriate

LIGHTING AND SHADOW INTEGRATION (HARD REQUIREMENT):
The face must inherit the exact cinematic lighting of the reference frame:
- same light direction
- same shadow placement
- same highlight placement
- same exposure
- same color temperature
- same contrast
- same depth and falloff

Do not brighten the face separately.
Do not flatten shadows.
Do not neutralize film lighting.
Do not produce a pasted or composited look.

TEXTURE AND ENVIRONMENTAL TRANSFER:
Preserve and carry over all contextual surface qualities from the original frame:
- film grain
- skin texture
- sweat
- dirt
- blood
- water
- cold tone
- warm cast
- haze
- environmental tint
- scene imperfections

Hair must follow identity, but remain consistent with:
- original angle
- original silhouette
- original motion
- original scene lighting

FORBIDDEN:
- full redraw
- scene reinterpretation
- camera changes
- pose changes
- head rotation
- gaze changes
- softened beauty face
- studio-lit skin
- pasted face artifacts
- altered hands
- altered clothing
- altered background

RESULT:
The same movie shot, with the same emotional performance, same head direction, same gaze, same lighting, same shadow logic, and the identities naturally integrated as if captured in-camera.`;

const ZOOTOPIA_HUMAN_PROMPT = `STRICT PIXAR-STYLE HUMAN CHARACTER RECASTING.

INPUT:
- Reference image = Zootopia-style scene and source of truth
- Image 1 = Person A
- Image 2 = Person B

TASK:
Transform the LEFT and RIGHT characters into stylized animated humans inspired by Person A and Person B while preserving the original scene.

CHARACTER MAPPING:
- LEFT → Person A
- RIGHT → Person B

SCENE LOCK:
Preserve exactly:
- pose
- body position
- composition
- camera angle
- framing
- background
- environment
- head orientation
- gaze direction

STYLE LOCK (CRITICAL):
Must be:
- strong Disney / Pixar 3D animated style
- clearly stylized
- clearly non-realistic
- expressive
- polished
- cleanly shaded

Do NOT become realistic.
Do NOT become semi-realistic.
Do NOT weaken the cartoon style.

IDENTITY RULE:
Adapt recognizable identity into animated human design through:
- recognizable facial structure
- recognizable features
- stylized proportions
- hairstyle cues

Do NOT paste realistic faces into the cartoon.
Do NOT create uncanny half-real human faces.

EXPRESSION RULE:
Keep the exact expression and emotional tone from the reference scene.

HEAD AND GAZE LOCK:
Preserve:
- head direction
- head tilt
- eye direction
- pose logic

Do NOT rotate heads.
Do NOT change where the characters are looking.

LIGHTING:
Preserve the original scene lighting and color palette in animated form.

FORBIDDEN:
- photorealistic skin
- realism
- anime style
- weak cartoonization
- uncanny faces
- scene changes
- camera changes
- pose changes
- gaze changes

RESULT:
A strong Zootopia / Pixar-like frame with animated human characters inspired by Person A and Person B, while preserving the original composition, pose, emotion, head direction, and gaze.`;

const ZOOTOPIA_ANIMALS_PROMPT = `STRICT ZOOTOPIA-STYLE CHARACTER REINTERPRETATION.

INPUT:
- Reference image = Zootopia-style scene and source of truth
- Image 1 = Person A
- Image 2 = Person B

TASK:
Reimagine the LEFT and RIGHT characters as original stylized Zootopia-style animal characters inspired by Person A and Person B.

CHARACTER MAPPING:
- LEFT → animal character inspired by Person A
- RIGHT → animal character inspired by Person B

IMPORTANT:
This mode is NOT face replacement.
This mode is NOT human face transfer.
This mode is NOT identity face mapping.
This mode is original stylized character reinterpretation inspired by the people.

The result must preserve recognizability through creative character design cues, not through transplanted human faces.

STYLE LOCK:
Must remain:
- Disney / Pixar Zootopia-style 3D
- stylized
- expressive
- clean
- cinematic
- animation-consistent

IDENTITY INSPIRATION RULE:
Use only soft inspiration from the provided people:
- hairstyle influence
- color accents
- personality
- attitude
- expression energy
- vibe
- silhouette suggestions

Do NOT reproduce the real human face.
Do NOT map human facial structure onto the animal.
Do NOT create hybrid human-animal faces.
Do NOT generate deepfake-like animal versions of real people.

SCENE LOCK:
Preserve exactly:
- pose
- composition
- camera
- framing
- background
- environment
- head orientation
- gaze direction
- emotional tone

EXPRESSION RULE:
Keep the same emotional performance from the reference image.

FORBIDDEN:
- human faces
- realistic people turned into animals via face transfer
- hybrid human-animal facial anatomy
- creepy results
- photorealism
- scene changes
- camera changes
- pose changes
- gaze changes

RESULT:
An authentic Zootopia-style scene with original stylized animal characters inspired by Person A and Person B through design language, personality, and visual cues only, while preserving the original pose, background, composition, head direction, and emotional tone.`;

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
