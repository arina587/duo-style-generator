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
  let styleBlock: string;

  if (style === "zootopia" && mode === "animals") {
    styleBlock = `STYLE: zootopia — animals mode

Transform characters into anthropomorphic animals:
- LEFT subject → fox: orange fur, elongated muzzle, pointed ears
- RIGHT subject → rabbit: long ears, soft rounded face, compact muzzle

Use stylized 3D animation rendering (not realistic fur, not photorealistic).
Do NOT use human skin on transformed characters.`;
  } else if (style === "zootopia") {
    styleBlock = `STYLE: zootopia — cartoon mode

Convert characters to stylized 3D animated humans.
Use Pixar-like proportions: smooth shading, slightly exaggerated features, large expressive eyes.
Do NOT use anime, manga, 2D illustration, or photorealistic skin.`;
  } else {
    styleBlock = `STYLE: ${style ?? "realistic"} — cinematic mode

Keep realistic human appearance.
Preserve cinematic lighting and color tone from reference.
No stylization. No beautification. No smoothing.`;
  }

  return `STRICT IDENTITY TRANSFER. DO NOT REGENERATE THE SCENE.

Reference image = base scene
Image 1 = Person A
Image 2 = Person B

Replace LEFT subject with Person A.
Replace RIGHT subject with Person B.

Do not swap positions.

---

SCENE:

Preserve EXACTLY:
- composition
- camera
- lighting
- pose
- background
- clothing
- hands (do not modify)

---

EXPRESSION:

Preserve expression from reference:
- eyes
- eyebrows
- mouth
- micro-expressions

Ignore identity expressions.

---

ORIENTATION:

Keep exact head orientation.

Rules:
- front → face + hair
- profile → keep profile (no rotation), face + hair
- back → do NOT generate face

---

HAIR:

Hair must ALWAYS come from identity images.

- never use reference hair
- back view → hair only

---

DETAILS:

Preserve:
- dirt
- sweat
- blood
- water
- skin texture

---

${styleBlock}

---

FORBIDDEN:

- full scene redraw
- pose change
- camera change
- identity blending
- smoothing or beautification
- hand modification

---

RESULT:

Return one image that matches the original scene,
with correct identity transfer,
correct pose,
correct orientation,
and correct style based on input parameters.`;
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
