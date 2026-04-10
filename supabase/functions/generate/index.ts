import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// ROLLBACK FLAG
// Set secret USE_LEGACY_PIPELINE=true to revert to old OpenAI-only flow
// ─────────────────────────────────────────────

function useLegacyPipeline(): boolean {
  return Deno.env.get("USE_LEGACY_PIPELINE") === "true";
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Domain = "titanic" | "euphoria" | "zootopia_cartoon" | "zootopia_animals";

interface SubjectAnalysis {
  gender: "female" | "male" | "ambiguous";
  face_visibility: "front" | "three_quarter" | "profile" | "back" | "occluded";
  head_orientation: "frontal" | "profile_left" | "profile_right" | "back";
  gaze: "camera" | "left" | "right" | "away" | "unknown";
  swap_face: boolean;
}

interface SceneAnalysis {
  left: SubjectAnalysis;
  right: SubjectAnalysis;
}

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
// LEGACY PROMPT TEMPLATES
// ─────────────────────────────────────────────

const LEGACY_FILM_PROMPT = `STRICT LOCAL FACE IDENTITY MAPPING.
THIS IS NOT IMAGE GENERATION. THIS IS A PRECISE LOCAL EDIT.

PRIORITY ORDER:
1. facial expression from Image[0]
2. face geometry and position from Image[0]
3. identity from Image[1] and Image[2]
4. preservation of all non-face regions

Image[0] = base scene
Image[1] = Person A (LEFT identity)
Image[2] = Person B (RIGHT identity)

Do NOT recreate or reinterpret the image. Only perform minimal local edits on faces.

Map Image[1] identity → LEFT face. Map Image[2] identity → RIGHT face.
Facial identity must match EXACTLY. Do NOT blend.

EMOTION LOCK: Use ONLY expression from Image[0]. Preserve eye openness, brows, mouth, muscle tension.
HAND PRESERVATION: Hands and fingers EXACTLY as in Image[0]. Do NOT modify.
SURFACE DETAIL: Keep dirt, sweat, skin texture, imperfections from Image[0].
LIGHTING: Match exactly.

FORBIDDEN: full regeneration, changing composition, changing pose, changing emotion, identity blending, modifying hands.

FINAL RESULT: Identical to Image[0] with ONLY faces changed to Person A and Person B.`;

const LEGACY_ZOOTOPIA_CARTOON_PROMPT = `STRICT IMAGE EDITING.
Image[0] = reference scene. Image[1] = Person A (LEFT). Image[2] = Person B (RIGHT).

Replace LEFT person with Person A. Replace RIGHT person with Person B.
Background: ONLY from Image[0]. Keep exactly.
Pose & scene: Keep exact pose, clothing, camera angle.
Style: Polished 3D animated characters. Smooth 3D rendering, rounded shapes, large glossy eyes.
FORBIDDEN: anime, manga, 2D, photorealistic skin.
Characters must remain recognizable as Person A and Person B.
HANDS: correct fingers, natural anatomy.`;

const LEGACY_ZOOTOPIA_ANIMALS_PROMPT = `STRICT IMAGE EDITING.
Image[0] = reference scene. Image[1] = Person A (LEFT, FOX). Image[2] = Person B (RIGHT, RABBIT).

Background: ONLY from Image[0]. Keep exactly.
Pose & scene: Keep exact pose, clothing, camera angle.
Style: Polished 3D animated anthropomorphic animals.
Person A = FOX: orange fur, elongated muzzle, pointed ears.
Person B = RABBIT: long ears, soft rounded face, compact muzzle.
FORBIDDEN: realistic animals, real fur, hybrid human-animal faces, humans.`;

// ─────────────────────────────────────────────
// DOMAIN RESOLVER
// ─────────────────────────────────────────────

function resolveDomain(domain: string | null, style: string | null, mode: string | null): Domain {
  if (domain && ["titanic", "euphoria", "zootopia_cartoon", "zootopia_animals"].includes(domain)) {
    return domain as Domain;
  }
  if (style === "zootopia") {
    if (mode === "zootopia_animals") return "zootopia_animals";
    return "zootopia_cartoon";
  }
  if (style === "titanic") return "titanic";
  if (style === "euphoria") return "euphoria";
  return "titanic";
}

function resolveLegacyPrompt(domain: Domain): string {
  if (domain === "zootopia_cartoon") return LEGACY_ZOOTOPIA_CARTOON_PROMPT;
  if (domain === "zootopia_animals") return LEGACY_ZOOTOPIA_ANIMALS_PROMPT;
  return LEGACY_FILM_PROMPT;
}

// ─────────────────────────────────────────────
// LEGACY PIPELINE — OpenAI gpt-image-1.5
// ─────────────────────────────────────────────

async function runLegacyPipeline(
  prompt: string,
  reference: File,
  person1: File,
  person2: File,
  apiKey: string
): Promise<string> {
  const form = new FormData();
  form.append("model", "gpt-image-1.5");
  form.append("prompt", prompt);
  form.append("image[]", reference);
  form.append("image[]", person1);
  form.append("image[]", person2);

  console.log("[LEGACY] sending to OpenAI gpt-image-1.5");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}` },
    body: form,
  });

  const responseText = await response.text();
  console.log("[LEGACY] status:", response.status);
  console.log("[LEGACY] body:", responseText.substring(0, 500));

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`OpenAI returned non-JSON (${response.status}): ${responseText.substring(0, 300)}`);
  }

  const items = data?.data as Record<string, unknown>[] | undefined;
  if (!items?.length || !items[0]?.b64_json) {
    throw new Error(`OpenAI generation failed: ${JSON.stringify(data)}`);
  }

  return `data:image/png;base64,${items[0].b64_json}`;
}

// ─────────────────────────────────────────────
// STAGE 1 — SCENE ANALYSIS (OpenAI Vision)
// ─────────────────────────────────────────────

const ANALYSIS_SYSTEM = `You are a precise scene analysis assistant. Return strict JSON only. No explanations, no markdown, no prose.`;

const ANALYSIS_USER = `Analyze Image 1 (reference scene). Identify the LEFT and RIGHT subjects in the frame.

Return ONLY this JSON:
{
  "left": {
    "gender": "female | male | ambiguous",
    "face_visibility": "front | three_quarter | profile | back | occluded",
    "head_orientation": "frontal | profile_left | profile_right | back",
    "gaze": "camera | left | right | away | unknown",
    "swap_face": true
  },
  "right": {
    "gender": "female | male | ambiguous",
    "face_visibility": "front | three_quarter | profile | back | occluded",
    "head_orientation": "frontal | profile_left | profile_right | back",
    "gaze": "camera | left | right | away | unknown",
    "swap_face": true
  }
}

Rules:
- swap_face = true if face_visibility is front, three_quarter, or profile
- swap_face = false if face_visibility is back or occluded
- LEFT = subject on the left side of the frame
- RIGHT = subject on the right side of the frame
- Return strict JSON only, no other text`;

async function analyzeScene(
  referenceDataUrl: string,
  person1DataUrl: string,
  person2DataUrl: string,
  apiKey: string
): Promise<SceneAnalysis> {
  console.log("[STAGE-1] sending analysis request to gpt-4o");

  const body = {
    model: "gpt-4o",
    max_tokens: 512,
    messages: [
      { role: "system", content: ANALYSIS_SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: ANALYSIS_USER },
          { type: "image_url", image_url: { url: referenceDataUrl, detail: "high" } },
          { type: "image_url", image_url: { url: person1DataUrl, detail: "high" } },
          { type: "image_url", image_url: { url: person2DataUrl, detail: "high" } },
        ],
      },
    ],
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  console.log("[STAGE-1] status:", response.status);
  console.log("[STAGE-1] response:", responseText.substring(0, 800));

  if (!response.ok) {
    throw new Error(`Scene analysis failed (${response.status}): ${responseText.substring(0, 300)}`);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(`Analysis response non-JSON: ${responseText.substring(0, 300)}`);
  }

  const choices = parsed?.choices as Record<string, unknown>[] | undefined;
  const rawContent = (choices?.[0]?.message as Record<string, unknown>)?.content as string | undefined;

  if (!rawContent) {
    throw new Error(`Analysis returned empty content: ${JSON.stringify(parsed)}`);
  }

  console.log("[STAGE-1] content:", rawContent);

  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Analysis content has no JSON: ${rawContent.substring(0, 300)}`);
  }

  let analysis: SceneAnalysis;
  try {
    analysis = JSON.parse(jsonMatch[0]) as SceneAnalysis;
  } catch {
    throw new Error(`Analysis JSON parse failed: ${jsonMatch[0].substring(0, 300)}`);
  }

  if (!analysis?.left || !analysis?.right) {
    throw new Error(`Analysis incomplete: ${JSON.stringify(analysis)}`);
  }

  console.log("[STAGE-1] result:", JSON.stringify(analysis));
  return analysis;
}

// ─────────────────────────────────────────────
// STAGE 2 — PROMPT BUILDER
// ─────────────────────────────────────────────

function buildSubjectBlock(
  side: "LEFT" | "RIGHT",
  subject: SubjectAnalysis,
  identityLabel: string,
  identityNum: number
): string {
  if (subject.swap_face) {
    return `${side} SUBJECT (${subject.face_visibility} view):
Subject has a visible face.
Transfer identity from ${identityLabel} (Image[${identityNum}]).
Preserve exact head orientation: ${subject.head_orientation}.
Preserve exact gaze direction: ${subject.gaze}.
Preserve exact facial expression from reference.
Replace both face AND hair with those from ${identityLabel}.
Do NOT rotate or change viewing angle.
Do NOT modify expression.`;
  }

  return `${side} SUBJECT (${subject.face_visibility} view):
Subject is back-facing or occluded. Do NOT generate or modify a face.
Apply identity-consistent hair from ${identityLabel} (Image[${identityNum}]) only.
Preserve exact body position and head direction: ${subject.head_orientation}.`;
}

function buildEditPrompt(analysis: SceneAnalysis): string {
  const leftIsFemale = analysis.left.gender !== "male";
  const rightIsFemale = analysis.right.gender !== "male";

  let leftLabel: string, leftNum: number, rightLabel: string, rightNum: number;

  if (leftIsFemale && !rightIsFemale) {
    leftLabel = "Person A (female identity)";
    leftNum = 1;
    rightLabel = "Person B (male identity)";
    rightNum = 2;
  } else if (!leftIsFemale && rightIsFemale) {
    leftLabel = "Person B (male identity)";
    leftNum = 2;
    rightLabel = "Person A (female identity)";
    rightNum = 1;
  } else {
    leftLabel = "Person A";
    leftNum = 1;
    rightLabel = "Person B";
    rightNum = 2;
  }

  const leftBlock = buildSubjectBlock("LEFT", analysis.left, leftLabel, leftNum);
  const rightBlock = buildSubjectBlock("RIGHT", analysis.right, rightLabel, rightNum);

  return `STRICT CONTROLLED IMAGE EDIT.

This is a precise local edit, not full generation.

Image[0] = reference
Image[1] = Person A
Image[2] = Person B

---

GLOBAL RULES:

Preserve EXACT:
- scene
- lighting
- camera
- pose
- composition

Do NOT re-render the full image.

---

POSITION:

LEFT stays LEFT
RIGHT stays RIGHT

---

IDENTITY:

Person A → female subject only
Person B → male subject only

---

${leftBlock}

---

${rightBlock}

---

FACE RULE:

swap_face = true → replace face
swap_face = false → DO NOT generate face

---

HAIR (CRITICAL):

Hair ALWAYS from identity images.

- front → replace face + hair
- profile → replace face + hair
- back → replace hair only

---

ORIENTATION:

Keep exact head direction
Do NOT rotate faces

---

GAZE:

Preserve gaze direction exactly

---

EXPRESSION:

Preserve expression EXACTLY from reference

---

DETAILS:

Preserve:
- dirt
- sweat
- blood
- water
- skin texture

---

HANDS:

Do NOT modify hands or fingers

---

FORBIDDEN:

- full redraw
- new faces
- identity blending
- pose changes
- camera changes

---

FINAL:

Same image, correct identity, correct orientation, correct hair.`;
}

// ─────────────────────────────────────────────
// STAGE 3 — IMAGE EDIT via Replicate (Nano Banana)
// Input schema: { prompt: string, image_input: string[] }
// image_input items must be base64 data URLs or HTTPS URLs
// Output: single URI string
// ─────────────────────────────────────────────

async function runReplicate(
  prompt: string,
  referenceDataUrl: string,
  person1DataUrl: string,
  person2DataUrl: string,
  apiKey: string
): Promise<string> {
  console.log("[STAGE-3] creating Replicate prediction");
  console.log("[STAGE-3] model: google/nano-banana");
  console.log("[STAGE-3] prompt length:", prompt.length);
  console.log("[STAGE-3] image_input[0] length:", referenceDataUrl.length);
  console.log("[STAGE-3] image_input[1] length:", person1DataUrl.length);
  console.log("[STAGE-3] image_input[2] length:", person2DataUrl.length);

  const predictionBody = {
    model: "google/nano-banana",
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
  console.log("[STAGE-3] create status:", createResponse.status);
  console.log("[STAGE-3] create response:", createText.substring(0, 800));

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

  console.log("[STAGE-3] polling prediction:", predictionId);

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

    console.log(`[STAGE-3] poll attempt ${attempt + 1}: status = ${status}`);

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

  console.log("[STAGE-3] output url:", outputUrl);
  return outputUrl;
}

async function fetchOutputAsDataUrl(url: string): Promise<string> {
  console.log("[STAGE-3] fetching output image from:", url);
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
// TWO-STAGE PIPELINE ORCHESTRATOR
// ─────────────────────────────────────────────

async function runTwoStagePipeline(
  reference: File,
  person1: File,
  person2: File,
  openaiApiKey: string,
  replicateApiKey: string
): Promise<{ imageUrl: string; analysis: SceneAnalysis; prompt: string }> {
  console.log("[PIPELINE] converting images to base64 data URLs");

  const [referenceDataUrl, person1DataUrl, person2DataUrl] = await Promise.all([
    fileToDataUrl(reference),
    fileToDataUrl(person1),
    fileToDataUrl(person2),
  ]);

  console.log("[PIPELINE] reference:", referenceDataUrl.substring(0, 50), "...", "length:", referenceDataUrl.length);
  console.log("[PIPELINE] person1:", person1DataUrl.substring(0, 50), "...", "length:", person1DataUrl.length);
  console.log("[PIPELINE] person2:", person2DataUrl.substring(0, 50), "...", "length:", person2DataUrl.length);

  const analysis = await analyzeScene(referenceDataUrl, person1DataUrl, person2DataUrl, openaiApiKey);

  const prompt = buildEditPrompt(analysis);
  console.log("[PIPELINE] prompt length:", prompt.length);

  const outputUrl = await runReplicate(prompt, referenceDataUrl, person1DataUrl, person2DataUrl, replicateApiKey);

  const imageUrl = await fetchOutputAsDataUrl(outputUrl);

  return { imageUrl, analysis, prompt };
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
    const selectedStyle = formData.get("style") as string | null;
    const requestedMode = formData.get("mode") as string | null;
    const requestedDomain = formData.get("domain") as string | null;

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

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) throw new Error("OPENAI_API_KEY not configured");

    const legacy = useLegacyPipeline();

    console.log("[GENERATE] pipeline:", legacy ? "legacy" : "two-stage", "| style:", selectedStyle, "| domain:", requestedDomain);

    if (legacy) {
      const domain = resolveDomain(requestedDomain, selectedStyle, requestedMode);
      const prompt = resolveLegacyPrompt(domain);
      const imageUrl = await runLegacyPipeline(prompt, reference, person1, person2, openaiApiKey);
      return new Response(
        JSON.stringify({ success: true, imageUrl, debug: { pipeline: "legacy", domain } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateApiKey) {
      console.warn("[GENERATE] REPLICATE_API_KEY not set — falling back to legacy pipeline");
      const domain = resolveDomain(requestedDomain, selectedStyle, requestedMode);
      const prompt = resolveLegacyPrompt(domain);
      const imageUrl = await runLegacyPipeline(prompt, reference, person1, person2, openaiApiKey);
      return new Response(
        JSON.stringify({ success: true, imageUrl, debug: { pipeline: "legacy-fallback", reason: "REPLICATE_API_KEY missing", domain } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageUrl, analysis, prompt } = await runTwoStagePipeline(
      reference, person1, person2, openaiApiKey, replicateApiKey
    );

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        debug: {
          pipeline: "two-stage",
          provider: "replicate/google/nano-banana",
          analysis,
          promptLength: prompt.length,
          promptPreview: prompt.substring(0, 300) + "...",
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
