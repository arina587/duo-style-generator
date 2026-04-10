import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// IMAGE CONVERSION — File → base64 data URL
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
// PROMPT BUILDER
// ─────────────────────────────────────────────

function buildPrompt(style: string | null, mode: string | null): string {
  const resolvedMode = mode ?? style ?? "realism";

  return `STRICT IDENTITY TRANSFER. NO FULL REGENERATION.

Reference image = base scene
Image 1 = Person A
Image 2 = Person B

Mode = ${resolvedMode}
(MODE: realism | zootopia_human | zootopia_animals)

Replace LEFT subject with Person A.
Replace RIGHT subject with Person B.
Do not swap positions.

---

SCENE (LOCK):

Preserve EXACTLY:
- composition
- camera angle & perspective
- lighting & color grading
- depth of field
- body pose & posture
- clothing
- background
- framing
- hands and fingers (do not modify)

Do NOT move or redesign anything.

---

EXPRESSION:

Use ONLY expression from reference:
- eye direction
- eyebrow tension
- mouth shape
- micro-expressions

Ignore expressions from identity images.

---

HEAD ORIENTATION:

Keep exact head angle from reference.
Do NOT rotate faces.

Rules:
- front → transfer face + hair
- 3/4 → keep angle, transfer face + hair
- profile → keep profile (no frontalization), transfer face + hair
- back / no visible face → do NOT generate a face

---

HAIR (CRITICAL):

Hair MUST come from identity images.
- never use reference hair
- adapt to angle (profile/back must match direction)

---

LIGHTING INTEGRATION (CRITICAL):

Faces must be fully integrated into scene lighting:
- match light direction
- match shadows
- match highlights
- match color temperature

Faces must look captured in the same shot, NOT pasted.

Apply scene lighting to the face.

---

IDENTITY STRICTNESS:

Preserve exact identity:
- face shape
- eye spacing
- nose structure
- jawline
- proportions

No approximation.
No generic faces.
No identity blending.

---

SURFACE DETAILS:

Preserve all:
- dirt, sweat, blood, water, snow
- skin texture and imperfections

---

STYLE:

If MODE = realism:
- keep photorealistic human result
- cinematic consistency (film grain, shadows, highlights)

If MODE = zootopia_human:
- convert characters to stylized 3D animated humans (Pixar-like)
- smooth shading, simplified features
- keep exact pose and scene

If MODE = zootopia_animals:

Transform into anthropomorphic animals:

LEFT → fox
RIGHT → rabbit

CRITICAL:
- keep exact pose and scene
- use stylized 3D animation (Pixar/Zootopia look)
- NO realistic fur

FACE RULE (IMPORTANT):
- do NOT keep human faces
- faces must be fully animal-based

Identity must be expressed through:
- expression
- proportions
- personality

NOT through human facial structure

---

SAFETY (IMPORTANT):

Use stylized transformation when needed.
Avoid photorealistic identity reproduction in animal mode.

---

FORBIDDEN:

- full image redraw
- pose change
- camera change
- rotating faces
- generating face when not visible
- identity blending
- smoothing / beautifying (realism mode)
- modifying hands

---

RESULT:

Return the same scene with:
- correct identity transfer
- correct pose
- correct orientation
- correct lighting integration
- correct style based on MODE`;
}

// ─────────────────────────────────────────────
// REPLICATE — google/nano-banana
// ─────────────────────────────────────────────

async function runReplicate(
  prompt: string,
  referenceDataUrl: string,
  person1DataUrl: string,
  person2DataUrl: string,
  apiKey: string
): Promise<string> {
  console.log("[REPLICATE] creating prediction | model: google/nano-banana-pro");
  console.log("[REPLICATE] prompt length:", prompt.length);

  if (!referenceDataUrl || !person1DataUrl || !person2DataUrl) {
    throw new Error("One or more image data URLs are empty or undefined");
  }

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
    return extractReplicateOutput(prediction);
  }

  if (immediateStatus === "failed" || immediateStatus === "canceled") {
    const errDetail = prediction?.error ?? prediction?.logs ?? immediateStatus;
    throw new Error(`Replicate prediction ${immediateStatus}: ${JSON.stringify(errDetail)}`);
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
      return extractReplicateOutput(pollData);
    }

    if (status === "failed" || status === "canceled") {
      const errDetail = pollData?.error ?? pollData?.logs ?? status;
      throw new Error(`Replicate prediction ${status}: ${JSON.stringify(errDetail)}`);
    }
  }

  throw new Error("Replicate prediction timed out");
}

function extractReplicateOutput(prediction: Record<string, unknown>): string {
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

    const prompt = buildPrompt(style, mode);
    console.log("[GENERATE] prompt length:", prompt.length);

    const outputUrl = await runReplicate(prompt, referenceDataUrl, person1DataUrl, person2DataUrl, replicateApiKey);
    const imageUrl = await fetchOutputAsDataUrl(outputUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        debug: {
          pipeline: "replicate/google/nano-banana",
          style,
          mode,
          promptLength: prompt.length,
        },
      }),
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
