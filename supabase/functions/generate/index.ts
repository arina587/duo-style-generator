import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// PIPELINE FLAG
// Set USE_LEGACY_IMAGE_PIPELINE=true in secrets to revert to old OpenAI-only flow
// ─────────────────────────────────────────────

function useLegacyPipeline(): boolean {
  return Deno.env.get("USE_LEGACY_IMAGE_PIPELINE") === "true";
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Domain = "titanic" | "euphoria" | "zootopia_cartoon" | "zootopia_animals";

type FaceVisibility = "front" | "three_quarter" | "profile" | "back" | "occluded";
type HeadOrientation = "frontal" | "left_three_quarter" | "right_three_quarter" | "left_profile" | "right_profile" | "back";
type GazeDirection = "camera" | "left" | "right" | "away" | "unknown";
type Gender = "female" | "male" | "ambiguous";

interface SubjectAnalysis {
  gender: Gender;
  face_visibility: FaceVisibility;
  head_orientation: HeadOrientation;
  gaze: GazeDirection;
  emotion: string;
  swap_face: boolean;
}

interface SceneAnalysis {
  left: SubjectAnalysis;
  right: SubjectAnalysis;
}

// ─────────────────────────────────────────────
// LEGACY PROMPT TEMPLATES
// ─────────────────────────────────────────────

const LEGACY_FILM_FACE_SWAP_PROMPT = `STRICT LOCAL FACE IDENTITY MAPPING.

THIS IS NOT IMAGE GENERATION.
THIS IS A PRECISE LOCAL EDIT.

---

PRIORITY ORDER (HIGHEST → LOWEST):

1. facial expression from Image[0]
2. face geometry and position from Image[0]
3. identity from Image[1] and Image[2]
4. preservation of all non-face regions

---

INPUT:

Image[0] = base scene (source of truth)
Image[1] = Person A (identity source)
Image[2] = Person B (identity source)

---

GLOBAL CONSTRAINT:

Do NOT recreate or reinterpret the image.
Do NOT regenerate the full scene.

Only perform minimal local edits on faces.

---

IDENTITY STRICTNESS (CRITICAL):

Map the facial identity from Image[1] onto the LEFT face in Image[0].

Map the facial identity from Image[2] onto the RIGHT face in Image[0].

Facial identity must match EXACTLY.

Do NOT:
- approximate identity
- blend identities
- adapt identity to the scene

---

EMOTION LOCK (ABSOLUTE):

Use ONLY the facial expression from Image[0].

Preserve EXACT:
- eye openness and direction
- eyebrow tension and position
- mouth shape
- facial muscle tension

Ignore all expressions from Image[1] and Image[2].

---

FACE ANCHORING:

Keep exact face position, rotation, scale, and alignment.

Do NOT move or resize faces.

---

EDIT BOUNDARY (CRITICAL):

Modify ONLY facial regions.

Everything else must remain EXACTLY unchanged.

---

HAND PRESERVATION (CRITICAL):

Hands and fingers must remain EXACTLY as in Image[0].

Do NOT modify or regenerate hands.

---

SURFACE DETAIL PRESERVATION:

Keep all details from Image[0]:

- dirt
- sweat
- skin texture
- imperfections

---

LIGHTING:

Match lighting, shadows, and color grading EXACTLY.

---

SKIN RULE:

Preserve natural skin texture and facial muscle definition.

Do NOT smooth or beautify.

---

FORBIDDEN:

- full image regeneration
- changing composition
- changing pose
- changing emotion
- identity blending
- modifying hands
- stylizing the whole image

---

FINAL RESULT:

The output must be identical to Image[0],
with ONLY the faces changed to Person A and Person B,
while preserving identity, expression, and all non-face details perfectly.`;

const LEGACY_ZOOTOPIA_CARTOON_PROMPT = `STRICT IMAGE EDITING.

INPUT:
Image[0] = reference scene (SOURCE OF TRUTH)
Image[1] = Person A (LEFT identity)
Image[2] = Person B (RIGHT identity)

---

IDENTITY REPLACEMENT (CRITICAL):

You must TAKE the real people from Image[1] and Image[2] and INSERT them into Image[0].

* Replace the LEFT person in Image[0] with Person A
* Replace the RIGHT person in Image[0] with Person B

DO NOT create new characters.
DO NOT generate random faces.
DO NOT mix identities.

The final characters must clearly look like the people from Image[1] and Image[2].

---

BACKGROUND LOCK (CRITICAL):

* Use ONLY the background from Image[0]
* Keep it EXACTLY the same
* Do NOT redesign, regenerate, or modify the environment
* Do NOT use background from Image[1] or Image[2]

---

POSE & SCENE LOCK:

* Keep exact pose and body position from Image[0]
* Keep exact clothing, folds, textures
* Keep camera angle and framing identical
* Do NOT move characters
* Do NOT change composition

---

STYLE LOCK (VERY STRICT):

Apply a polished 3D animated character style to the people.

VISUAL STYLE:

* smooth, clean 3D rendering
* plastic-like skin (no pores, no noise)
* rounded, soft facial shapes
* slightly enlarged head proportions
* large expressive glossy eyes
* simplified, appealing facial features
* soft cinematic lighting
* clean shading, no grain

IMPORTANT:

* apply style ONLY to characters
* scene and background must stay unchanged

FORBIDDEN:

* anime
* manga
* 2D illustration
* sketch or painterly styles
* photorealistic skin

---

MODE: CARTOON

* keep human characters
* stylize into 3D animated humans

---

IDENTITY PRESERVATION:

Preserve:

* face structure
* eye spacing
* expression
* head proportions

Characters must remain recognizable.

---

HANDS (CRITICAL):

* correct number of fingers
* natural anatomy
* no deformations

---

FINAL RESULT:

* SAME scene as Image[0]
* SAME background (unchanged)
* SAME pose and clothing
* ONLY characters replaced with Person A and Person B
* characters are stylized in consistent 3D animated style`;

const LEGACY_ZOOTOPIA_ANIMALS_PROMPT = `STRICT IMAGE EDITING.

INPUT:
Image[0] = reference scene (SOURCE OF TRUTH)
Image[1] = Person A (LEFT identity)
Image[2] = Person B (RIGHT identity)

---

IDENTITY REPLACEMENT (CRITICAL):

You must TAKE the real people from Image[1] and Image[2] and INSERT them into Image[0].

* Replace the LEFT person in Image[0] with Person A
* Replace the RIGHT person in Image[0] with Person B

DO NOT create new characters.
DO NOT generate random faces.
DO NOT mix identities.

---

BACKGROUND LOCK (CRITICAL):

* Use ONLY the background from Image[0]
* Keep it EXACTLY the same
* Do NOT redesign, regenerate, or modify the environment
* Do NOT use background from Image[1] or Image[2]

---

POSE & SCENE LOCK:

* Keep exact pose and body position from Image[0]
* Keep exact clothing, folds, textures
* Keep camera angle and framing identical
* Do NOT move characters
* Do NOT change composition

---

STYLE LOCK (VERY STRICT):

Apply a polished 3D animated character style to the people.

VISUAL STYLE:

* smooth, clean 3D rendering
* plastic-like skin (no pores, no noise)
* rounded, soft facial shapes
* slightly enlarged head proportions
* large expressive glossy eyes
* simplified, appealing facial features
* soft cinematic lighting
* clean shading, no grain

IMPORTANT:

* apply style ONLY to characters
* scene and background must stay unchanged

FORBIDDEN:

* anime
* manga
* 2D illustration
* sketch or painterly styles
* photorealistic skin

---

MODE: ANIMALS

* transform characters into anthropomorphic animals
* Person A = FOX
* Person B = RABBIT

ANIMALS RULES (CRITICAL):

* full animal faces (NO human faces)
* no human skin
* upright humanoid bodies
* stylized fur (smooth, not realistic)

FOX:

* orange fur
* elongated muzzle
* pointed ears

RABBIT:

* long ears
* soft rounded face
* compact muzzle

FORBIDDEN (ANIMALS):

* realistic animals
* real fur
* hybrid human-animal faces

---

IDENTITY PRESERVATION:

Preserve:

* expression
* head proportions

Characters must remain recognizable.

---

HANDS (CRITICAL):

* correct number of fingers
* natural anatomy
* no deformations

---

FINAL RESULT:

* SAME scene as Image[0]
* SAME background (unchanged)
* SAME pose and clothing
* ONLY characters replaced with Person A (FOX) and Person B (RABBIT)
* characters are stylized in consistent 3D animated style
* Characters MUST be a fox and a rabbit
* NO humans allowed`;

// ─────────────────────────────────────────────
// DOMAIN / PROMPT RESOLVERS (LEGACY)
// ─────────────────────────────────────────────

function resolveDomain(
  domain: string | null,
  style: string | null,
  mode: string | null
): Domain {
  if (domain && ["titanic", "euphoria", "zootopia_cartoon", "zootopia_animals"].includes(domain)) {
    return domain as Domain;
  }
  if (style === "zootopia") {
    if (mode === "zootopia_animals") return "zootopia_animals";
    if (mode === "zootopia_cartoon") return "zootopia_cartoon";
    return "zootopia_cartoon";
  }
  if (style === "titanic") return "titanic";
  if (style === "euphoria") return "euphoria";
  return "titanic";
}

function resolveLegacyPrompt(domain: Domain): string {
  switch (domain) {
    case "titanic":
    case "euphoria":
      return LEGACY_FILM_FACE_SWAP_PROMPT;
    case "zootopia_cartoon":
      return LEGACY_ZOOTOPIA_CARTOON_PROMPT;
    case "zootopia_animals":
      return LEGACY_ZOOTOPIA_ANIMALS_PROMPT;
  }
}

// ─────────────────────────────────────────────
// STAGE A — SCENE ANALYSIS (OpenAI Vision)
// ─────────────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `You are a precise scene analysis assistant. Analyze the provided images and return strict JSON only. No explanations, no markdown, no prose.`;

const ANALYSIS_USER_PROMPT = `You will receive 3 images:
- Image 1: reference scene (the scene to be edited)
- Image 2: Person A (female identity source)
- Image 3: Person B (male identity source)

Analyze the reference scene (Image 1) only. Identify the LEFT subject and RIGHT subject in the frame.

Return ONLY this JSON object, nothing else:

{
  "left": {
    "gender": "female | male | ambiguous",
    "face_visibility": "front | three_quarter | profile | back | occluded",
    "head_orientation": "frontal | left_three_quarter | right_three_quarter | left_profile | right_profile | back",
    "gaze": "camera | left | right | away | unknown",
    "emotion": "<short label>",
    "swap_face": true | false
  },
  "right": {
    "gender": "female | male | ambiguous",
    "face_visibility": "front | three_quarter | profile | back | occluded",
    "head_orientation": "frontal | left_three_quarter | right_three_quarter | left_profile | right_profile | back",
    "gaze": "camera | left | right | away | unknown",
    "emotion": "<short label>",
    "swap_face": true | false
  }
}

Rules:
- swap_face = true if face_visibility is front, three_quarter, or profile
- swap_face = false if face_visibility is back or occluded
- LEFT = the subject appearing on the left side of the frame
- RIGHT = the subject appearing on the right side of the frame
- Return strict JSON only`;

async function analyzeScene(
  reference: File,
  person1: File,
  person2: File,
  apiKey: string
): Promise<SceneAnalysis> {
  const toBase64 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const mimeType = (file: File): string => {
    const t = file.type;
    if (t && t.startsWith("image/")) return t;
    return "image/jpeg";
  };

  const [refB64, p1B64, p2B64] = await Promise.all([
    toBase64(reference),
    toBase64(person1),
    toBase64(person2),
  ]);

  const body = {
    model: "gpt-4o",
    max_tokens: 512,
    messages: [
      {
        role: "system",
        content: ANALYSIS_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          { type: "text", text: ANALYSIS_USER_PROMPT },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType(reference)};base64,${refB64}`, detail: "high" },
          },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType(person1)};base64,${p1B64}`, detail: "high" },
          },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType(person2)};base64,${p2B64}`, detail: "high" },
          },
        ],
      },
    ],
  };

  console.log("=== STAGE A: SCENE ANALYSIS ===");
  console.log("model: gpt-4o");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  console.log("analysis status:", response.status);
  console.log("analysis raw response:", responseText.substring(0, 1000));

  if (!response.ok) {
    throw new Error(`Scene analysis failed (${response.status}): ${responseText.substring(0, 300)}`);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(`Scene analysis returned non-JSON: ${responseText.substring(0, 300)}`);
  }

  const content = (parsed?.choices as Record<string, unknown>[])?.[0]?.message as Record<string, unknown> | undefined;
  const rawText = content?.content as string | undefined;

  if (!rawText) {
    throw new Error(`Scene analysis returned empty content: ${JSON.stringify(parsed)}`);
  }

  console.log("analysis content:", rawText);

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Scene analysis content does not contain JSON: ${rawText.substring(0, 300)}`);
  }

  let analysis: SceneAnalysis;
  try {
    analysis = JSON.parse(jsonMatch[0]) as SceneAnalysis;
  } catch {
    throw new Error(`Scene analysis JSON parse failed: ${jsonMatch[0].substring(0, 300)}`);
  }

  if (!analysis?.left || !analysis?.right) {
    throw new Error(`Scene analysis returned incomplete data: ${JSON.stringify(analysis)}`);
  }

  console.log("analysis result:", JSON.stringify(analysis));
  console.log("=== STAGE A COMPLETE ===");

  return analysis;
}

// ─────────────────────────────────────────────
// PROMPT BUILDER — builds dynamic edit prompt from analysis
// ─────────────────────────────────────────────

function buildSubjectBlock(
  side: "LEFT" | "RIGHT",
  subject: SubjectAnalysis,
  identityLabel: string,
  identityImageNum: number
): string {
  const { face_visibility, head_orientation, gaze, emotion, swap_face } = subject;

  const visibleFace = swap_face;

  if (visibleFace) {
    return `${side} SUBJECT:
- Face is visible (${face_visibility} view)
- Transfer identity from ${identityLabel} (Image[${identityImageNum}]) onto this subject
- Preserve exact head orientation: ${head_orientation}
- Preserve exact gaze direction: ${gaze}
- Preserve exact facial expression: ${emotion}
- Replace both face AND hair with those from ${identityLabel}
- Do not rotate or change the viewing angle
- Do not modify expression`;
  } else {
    return `${side} SUBJECT:
- Face is NOT visible (${face_visibility} view)
- Do NOT generate or modify a face
- Do NOT place a face where none exists
- Apply identity-consistent hair from ${identityLabel} (Image[${identityImageNum}]) only
- Preserve exact body position and head direction
- Head orientation: ${head_orientation}`;
  }
}

function buildEditPrompt(analysis: SceneAnalysis): string {
  const leftIsFemale = analysis.left.gender !== "male";
  const rightIsFemale = analysis.right.gender !== "male";

  let leftIdentityLabel: string;
  let leftIdentityNum: number;
  let rightIdentityLabel: string;
  let rightIdentityNum: number;

  if (leftIsFemale && !rightIsFemale) {
    leftIdentityLabel = "Person A (female identity)";
    leftIdentityNum = 1;
    rightIdentityLabel = "Person B (male identity)";
    rightIdentityNum = 2;
  } else if (!leftIsFemale && rightIsFemale) {
    leftIdentityLabel = "Person B (male identity)";
    leftIdentityNum = 2;
    rightIdentityLabel = "Person A (female identity)";
    rightIdentityNum = 1;
  } else {
    leftIdentityLabel = "Person A";
    leftIdentityNum = 1;
    rightIdentityLabel = "Person B";
    rightIdentityNum = 2;
  }

  const leftBlock = buildSubjectBlock("LEFT", analysis.left, leftIdentityLabel, leftIdentityNum);
  const rightBlock = buildSubjectBlock("RIGHT", analysis.right, rightIdentityLabel, rightIdentityNum);

  return `STRICT CONTROLLED IMAGE EDIT.

This is a precise local identity transfer and scene-preserving edit, not a full image regeneration.

Image[0] = reference scene
Image[1] = Person A
Image[2] = Person B

GLOBAL RULES:
- Preserve the original scene exactly
- Preserve composition, camera angle, lighting, pose, environment, clothing, and body position
- Do not redesign or reinterpret the scene
- Do not regenerate the full image

POSITION LOCK:
- LEFT subject remains LEFT
- RIGHT subject remains RIGHT

IDENTITY LOCK:
- Person A may map only to the female-presenting subject
- Person B may map only to the male-presenting subject
- Do not blend identities
- Do not invent faces

${leftBlock}

${rightBlock}

FACE RULE:
- If swap_face = true, transfer identity onto the existing visible face
- If swap_face = false, do not generate or modify a face

HAIR RULE:
- Hair must always come from the identity image
- Front view: replace face and hair
- Profile view: replace face and hair in the same orientation
- Back view: do not generate face, apply identity-consistent hair only
- Never keep original reference hair when identity should be transferred

HEAD ORIENTATION LOCK:
- Preserve exact head direction and orientation
- Do not rotate profile to frontal
- Do not change the viewing angle

GAZE LOCK:
- Preserve gaze direction from the reference scene exactly

EXPRESSION LOCK:
- Preserve the emotional expression from the reference scene exactly
- Preserve eye openness, eyebrow tension, mouth shape, and facial muscle tension
- Ignore expression from identity images

SURFACE DETAIL LOCK:
- Preserve dirt, blood, sweat, water droplets, snow, skin texture, imperfections, and all scene-related facial surface details from the reference image

HAND LOCK:
- Hands and fingers must remain exactly as in the reference image
- Do not modify hands or fingers

FORBIDDEN:
- full scene redraw
- face invention
- identity averaging
- pose changes
- camera changes
- hand regeneration
- beautification
- smoothing away expression details

FINAL RESULT:
The output must look like the original frame with only valid identity transfer applied where appropriate, while preserving scene, expression, gaze, head orientation, surface details, and hands.`;
}

// ─────────────────────────────────────────────
// STAGE B — IMAGE EDIT via Replicate (Nano Banana)
// ─────────────────────────────────────────────

async function uploadToStorage(file: File, replicateApiKey: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const uploadResponse = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${replicateApiKey}`,
      "Content-Type": file.type || "image/jpeg",
    },
    body: arrayBuffer,
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text();
    throw new Error(`Replicate file upload failed (${uploadResponse.status}): ${text.substring(0, 300)}`);
  }

  const uploadData = await uploadResponse.json() as { urls?: { get?: string }; url?: string };
  const fileUrl = uploadData?.urls?.get || uploadData?.url;

  if (!fileUrl) {
    throw new Error(`Replicate file upload returned no URL: ${JSON.stringify(uploadData)}`);
  }

  return fileUrl;
}

async function generateWithReplicate(
  prompt: string,
  reference: File,
  person1: File,
  person2: File,
  apiKey: string
): Promise<string> {
  console.log("=== STAGE B: REPLICATE IMAGE EDIT ===");
  console.log("model: bytedance/nana-banana");
  console.log("prompt length:", prompt.length);

  console.log("uploading images to Replicate...");
  const [referenceUrl, person1Url, person2Url] = await Promise.all([
    uploadToStorage(reference, apiKey),
    uploadToStorage(person1, apiKey),
    uploadToStorage(person2, apiKey),
  ]);

  console.log("reference url:", referenceUrl);
  console.log("person1 url:", person1Url);
  console.log("person2 url:", person2Url);

  const predictionBody = {
    version: "bytedance/nana-banana",
    input: {
      prompt,
      images: [referenceUrl, person1Url, person2Url],
    },
  };

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(predictionBody),
  });

  const createText = await createResponse.text();
  console.log("create prediction status:", createResponse.status);
  console.log("create prediction response:", createText.substring(0, 500));

  if (!createResponse.ok) {
    throw new Error(`Replicate prediction creation failed (${createResponse.status}): ${createText.substring(0, 300)}`);
  }

  let prediction: Record<string, unknown>;
  try {
    prediction = JSON.parse(createText);
  } catch {
    throw new Error(`Replicate create response non-JSON: ${createText.substring(0, 300)}`);
  }

  const predictionId = prediction?.id as string | undefined;
  if (!predictionId) {
    throw new Error(`Replicate prediction has no ID: ${JSON.stringify(prediction)}`);
  }

  console.log("prediction id:", predictionId);

  const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
  const maxAttempts = 60;
  const pollIntervalMs = 3000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const pollResponse = await fetch(pollUrl, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!pollResponse.ok) {
      const pollText = await pollResponse.text();
      throw new Error(`Replicate poll failed (${pollResponse.status}): ${pollText.substring(0, 300)}`);
    }

    const pollData = await pollResponse.json() as Record<string, unknown>;
    const status = pollData?.status as string | undefined;

    console.log(`poll attempt ${attempt + 1}: status = ${status}`);

    if (status === "succeeded") {
      const output = pollData?.output;
      let outputUrl: string | undefined;

      if (typeof output === "string") {
        outputUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        outputUrl = output[0] as string;
      }

      if (!outputUrl) {
        throw new Error(`Replicate succeeded but no output URL: ${JSON.stringify(pollData)}`);
      }

      console.log("output url:", outputUrl);
      console.log("=== STAGE B COMPLETE ===");

      const imgResponse = await fetch(outputUrl);
      if (!imgResponse.ok) {
        throw new Error(`Failed to fetch output image from Replicate: ${imgResponse.status}`);
      }
      const imgBuffer = await imgResponse.arrayBuffer();
      const imgBytes = new Uint8Array(imgBuffer);
      let binary = "";
      for (let i = 0; i < imgBytes.byteLength; i++) {
        binary += String.fromCharCode(imgBytes[i]);
      }
      const b64 = btoa(binary);
      return `data:image/png;base64,${b64}`;
    }

    if (status === "failed" || status === "canceled") {
      const errDetail = pollData?.error ?? pollData?.logs ?? status;
      throw new Error(`Replicate prediction ${status}: ${JSON.stringify(errDetail)}`);
    }
  }

  throw new Error("Replicate prediction timed out after polling limit");
}

// ─────────────────────────────────────────────
// LEGACY PIPELINE — OpenAI gpt-image-1.5 direct
// ─────────────────────────────────────────────

async function generateWithOpenAI(
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

  console.log("=== LEGACY PIPELINE: GPT IMAGE EDIT ===");
  console.log("model: gpt-image-1.5");
  console.log("prompt length:", prompt.length);

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: form,
  });

  const responseText = await response.text();
  console.log("openai status:", response.status);
  console.log("openai response:", responseText.substring(0, 500));

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`OpenAI returned non-JSON response (${response.status}): ${responseText.substring(0, 500)}`);
  }

  if (!(data?.data as unknown[])?.length || !(data.data as Record<string, unknown>[])[0]?.b64_json) {
    throw new Error(`OpenAI generation failed: ${JSON.stringify(data)}`);
  }

  return `data:image/png;base64,${(data.data as Record<string, unknown>[])[0].b64_json}`;
}

// ─────────────────────────────────────────────
// NEW TWO-STAGE PIPELINE
// ─────────────────────────────────────────────

async function runTwoStagePipeline(
  reference: File,
  person1: File,
  person2: File,
  openaiApiKey: string,
  replicateApiKey: string
): Promise<{ imageUrl: string; analysis: SceneAnalysis; prompt: string }> {
  const analysis = await analyzeScene(reference, person1, person2, openaiApiKey);

  const prompt = buildEditPrompt(analysis);

  console.log("=== BUILT EDIT PROMPT ===");
  console.log(prompt);
  console.log("=========================");

  const imageUrl = await generateWithReplicate(prompt, reference, person1, person2, replicateApiKey);

  return { imageUrl, analysis, prompt };
}

// ─────────────────────────────────────────────
// EDGE FUNCTION ENTRY POINT
// ─────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();

    const reference = formData.get("reference") as File;
    const person1 = formData.get("person1") as File;
    const person2 = formData.get("person2") as File;
    const selectedStyle = formData.get("style") as string;
    const requestedMode = formData.get("mode") as string;
    const requestedDomain = formData.get("domain") as string;

    if (!reference || !person1 || !person2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing images: reference, person1, and person2 are all required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supportedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    for (const [label, file] of [["reference", reference], ["person1", person1], ["person2", person2]] as [string, File][]) {
      if (file.size === 0) {
        return new Response(
          JSON.stringify({ success: false, error: `${label} file is empty` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (file.type && !supportedImageTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ success: false, error: `${label} has unsupported format: ${file.type}. Use JPEG, PNG, or WebP.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) throw new Error("OpenAI API key not configured");

    const legacy = useLegacyPipeline();

    console.log("GENERATE:", JSON.stringify({
      style: selectedStyle,
      mode: requestedMode,
      domain: requestedDomain,
      pipeline: legacy ? "legacy" : "two-stage",
    }));

    if (legacy) {
      const domain = resolveDomain(requestedDomain, selectedStyle, requestedMode);
      const prompt = resolveLegacyPrompt(domain);

      const imageUrl = await generateWithOpenAI(prompt, reference, person1, person2, openaiApiKey);

      return new Response(
        JSON.stringify({
          success: true,
          imageUrl,
          debug: {
            pipeline: "legacy",
            domain,
            provider: "openai",
            model: "gpt-image-1.5",
            promptLength: prompt.length,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateApiKey) {
      console.warn("REPLICATE_API_KEY not configured, falling back to legacy pipeline");
      const domain = resolveDomain(requestedDomain, selectedStyle, requestedMode);
      const prompt = resolveLegacyPrompt(domain);
      const imageUrl = await generateWithOpenAI(prompt, reference, person1, person2, openaiApiKey);
      return new Response(
        JSON.stringify({
          success: true,
          imageUrl,
          debug: {
            pipeline: "legacy-fallback",
            reason: "REPLICATE_API_KEY not set",
            domain,
            provider: "openai",
            model: "gpt-image-1.5",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageUrl, analysis, prompt } = await runTwoStagePipeline(
      reference,
      person1,
      person2,
      openaiApiKey,
      replicateApiKey
    );

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        debug: {
          pipeline: "two-stage",
          provider: "replicate/nana-banana",
          analysis,
          promptLength: prompt.length,
          promptPreview: prompt.substring(0, 300) + "...",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("GENERATE ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
