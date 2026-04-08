import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Domain = "titanic" | "euphoria" | "zootopia_human" | "zootopia_animal";
type Provider = "openai" | "replicate";
type PromptKey = "film_face_swap" | "zootopia_human" | "zootopia_animal";

interface RouteConfig {
  provider: Provider;
  model: string;
  promptKey: PromptKey;
}

// ─────────────────────────────────────────────
// MODEL ROUTER
// ─────────────────────────────────────────────

function modelRouter(domain: Domain): RouteConfig {
  switch (domain) {
    case "titanic":
    case "euphoria":
      return {
        provider: "openai",
        model: "gpt-image-1.5",
        promptKey: "film_face_swap",
      };
    case "zootopia_human":
      return {
        provider: "replicate",
        model: "google/nano-banana-2",
        promptKey: "zootopia_human",
      };
    case "zootopia_animal":
      return {
        provider: "replicate",
        model: "google/nano-banana-2",
        promptKey: "zootopia_animal",
      };
  }
}

// ─────────────────────────────────────────────
// PROMPT TEMPLATES
// ─────────────────────────────────────────────

const sharedPrefix = `STRICT CONTROLLED IMAGE EDITING. NO CREATIVE INTERPRETATION ALLOWED.

INPUT IMAGES:
Image[0] = REFERENCE SCENE (this image MUST be preserved exactly as-is)
Image[1] = Person A (LEFT person identity source)
Image[2] = Person B (RIGHT person identity source)

IDENTITY MAPPING (STRICT):
- The LEFT person in Image[0] must receive the face/identity of Person A (Image[1])
- The RIGHT person in Image[0] must receive the face/identity of Person B (Image[2])
- DO NOT swap or mix identity assignments

EXPRESSION LOCK (MANDATORY):
- Copy the EXACT facial expression from Image[0] for each person
- Match precisely: mouth shape, eye openness, eyebrow position, gaze direction
- DO NOT use neutral or default expressions
- The emotional state of both persons must be identical to Image[0]

POSE AND CLOTHING PRESERVATION (NON-NEGOTIABLE):
- Body pose must be identical to Image[0]
- Clothing must be EXACTLY the same: folds, fabric texture, shadows, wetness, snow, dirt
- If there is snow, dirt, or particles on clothes → KEEP THEM
- If there is snow, dirt, or particles on the face in Image[0] → APPLY to the new face
- DO NOT alter, simplify, or reinterpret any environmental detail

`;

const promptTemplates: Record<PromptKey, string> = {
  film_face_swap: `TASK: PHOTOREALISTIC FACE REPLACEMENT

MODE: Realistic film-quality face swap

OPERATION:
- Replace only the faces of the two persons in Image[0]
- LEFT person face → replaced with Person A from Image[1]
- RIGHT person face → replaced with Person B from Image[2]

PHOTOREALISM REQUIREMENTS (STRICT):
- The result must look like a real photograph with different people
- NO style change whatsoever
- NO cartoon, illustration, or rendering artifacts
- Faces must NOT look pasted, composited, or artificially smoothed

SKIN AND TEXTURE INTEGRATION:
- Preserve original skin texture, pores, imperfections, and lighting noise from Image[0]
- Match the sharpness, grain, motion blur, and depth-of-field to Image[0]
- Skin tone must adjust to match Image[0] lighting conditions exactly
- No artificial smoothing, retouching, or beautification

SCENE PRESERVATION (HIGHEST PRIORITY):
- DO NOT recreate, redraw, or reinterpret the background
- DO NOT simplify or stylize any part of the scene
- ALL background details must remain pixel-accurate: textures, lighting, reflections, objects
- Preserve film grain, color grading, and atmosphere of the original image

FACE INTEGRATION QUALITY:
- Faces must be seamlessly integrated with correct lighting, shadow direction, and color temperature
- Skin color must match ambient light from Image[0]
- No visible seam or compositing edge around the face
- Eye reflections and catch-lights must match Image[0] lighting

FINAL RESULT:
- Must appear as if Person A and Person B were always in this scene
- No evidence of editing should be visible
- Identity must be strongly preserved and recognizable`,

  zootopia_human: `TASK: STYLIZED 3D ANIMATED HUMAN RENDERING

MODE: Disney Zootopia-style cartoon human transformation

STYLE TARGET:
- Disney/Pixar cinematic 3D animation style
- Reference: Zootopia (2016) human character aesthetic
- NOT anime, NOT manga, NOT 2D flat illustration, NOT cel-shading

RENDERING REQUIREMENTS (STRICT):
- Pixar/Disney 3D shading model ONLY
- Soft global illumination with subsurface scattering in skin
- Rounded, stylized facial geometry while maintaining recognizable identity
- Natural human proportions — NOT exaggerated, NOT chibi, NOT anime-proportioned
- Physically consistent shadows, highlights, and lighting direction
- Cinematic depth-of-field matching Image[0] composition

CHARACTER TRANSFORMATION:
- Both persons remain HUMAN (no animal features)
- Faces must be stylized but strongly recognizable as Person A and Person B
- Preserve: face shape, eye spacing, nose structure, chin, overall facial identity
- Stylize while retaining the personality visible in Image[0]'s expression

SCENE AND CLOTHING:
- Background must remain consistent with Image[0] composition
- Clothing stylized into the 3D animated style but maintaining same design, color, layers
- All environmental elements (snow, dirt, objects) remain present, stylized consistently

QUALITY STANDARD:
- Film-quality render
- No low-detail textures
- No flat shading
- Full depth, atmosphere, and cinematic polish`,

  zootopia_animal: `You are editing a fixed base image.

IMAGE ROLES:
Image[0] = BASE SCENE (highest priority, must be preserved)
Image[1] = Identity reference for LEFT character
Image[2] = Identity reference for RIGHT character

PRIORITY ORDER (CRITICAL):
1. Preserve base scene (Image[0])
2. Preserve character pose and position
3. Apply identity from Image[1] and Image[2]
4. Apply Zootopia animal transformation
5. Apply cinematic style

BASE SCENE LOCK (VERY IMPORTANT):
The image must remain the SAME SCENE as Image[0]:
- same composition
- same camera angle
- same framing
- same background
- same environment details
Do NOT redesign or reimagine the scene.
Do NOT move characters.
Do NOT change clothing.
The result must look like the SAME photo, not a new illustration.

CHARACTER REPLACEMENT:
Replace ONLY the two people:
LEFT person → Person A (Image[1])
RIGHT person → Person B (Image[2])
Keep:
- exact pose
- exact body position
- exact proportions
- exact clothing

ANIMAL TRANSFORMATION (STRICT):
Convert characters into FULL anthropomorphic animals.
Person A → RED FOX
Person B → RABBIT
MANDATORY:
- fully animal faces
- no human skin
- no human nose or lips
- no hybrid faces

SPECIES DETAILS:
FOX:
- elongated muzzle
- orange fur
- white lower face
- triangular ears
RABBIT:
- shorter muzzle
- long vertical ears
- soft rounded face

ANTI-ERROR (CRITICAL):
- female character must NOT become a cat
- do NOT use feline features
- do NOT generate random animals

IDENTITY PRESERVATION:
Keep identity through:
- eye shape and spacing
- expression
- head tilt
- emotional expression
Characters must feel like the same people.

STYLE:
- Zootopia-style cinematic 3D rendering
- high-end animated film quality
- soft lighting
- detailed fur shading

FINAL RESULT:
The final image must look like:
- the SAME original scene
- with the SAME composition and clothing
- but characters are clearly a fox and a rabbit
- identity is preserved`,
};

// ─────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────

function promptBuilder(promptKey: PromptKey): string {
  return sharedPrefix + promptTemplates[promptKey];
}

// ─────────────────────────────────────────────
// DOMAIN RESOLVER (backward compatibility)
// Maps legacy style+mode fields to domain
// ─────────────────────────────────────────────

function resolveDomain(
  domain: string | null,
  style: string | null,
  mode: string | null,
  referenceId: string | null
): Domain {
  if (domain && ["titanic", "euphoria", "zootopia_human", "zootopia_animal"].includes(domain)) {
    return domain as Domain;
  }

  if (style === "zootopia") {
    if (mode === "animal") return "zootopia_animal";
    if (mode === "cartoon_human") return "zootopia_human";
    return "zootopia_human";
  }

  if (style === "titanic") return "titanic";
  if (style === "euphoria") return "euphoria";

  return "titanic";
}

// ─────────────────────────────────────────────
// SAFE FALLBACK PROMPT (titanic ref3 edge case)
// ─────────────────────────────────────────────

const SAFE_TITANIC_REF3_PROMPT = `Edit the image by replacing the people with the provided individuals.

Keep the overall scene similar.

Allow slight adjustments to ensure the image is appropriate.

* Maintain background and lighting
* Keep composition similar
* Ensure people are not overlapping too closely
* Keep interaction neutral

Only update identity.

The result must be natural, appropriate, and non-sensitive.`;

// ─────────────────────────────────────────────
// OPENAI GENERATOR
// ─────────────────────────────────────────────

async function generateWithOpenAI(
  model: string,
  prompt: string,
  reference: File,
  person1: File,
  person2: File,
  apiKey: string
): Promise<string> {
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", prompt);
  form.append("image[]", reference);
  form.append("image[]", person1);
  form.append("image[]", person2);

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: form,
  });

  const data = await response.json();

  if (!data?.data?.[0]?.b64_json) {
    throw new Error(`OpenAI generation failed: ${JSON.stringify(data)}`);
  }

  return `data:image/png;base64,${data.data[0].b64_json}`;
}

// ─────────────────────────────────────────────
// REPLICATE GENERATOR
// ─────────────────────────────────────────────

async function fileToBase64DataUrl(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${file.type};base64,${base64}`;
}

async function uploadFileToSupabaseStorage(file: File, supabaseUrl: string, supabaseKey: string): Promise<string> {
  const filename = `replicate-input/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.type.split("/")[1] || "jpg"}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/replicate-uploads/${filename}`;

  console.log("REPLICATE_UPLOAD: uploading", file.name, "size", file.size, "type", file.type, "→", filename);

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: await file.arrayBuffer(),
  });

  if (!uploadResponse.ok) {
    const uploadError = await uploadResponse.text();
    console.error("REPLICATE_UPLOAD_ERROR:", uploadResponse.status, uploadError);
    throw new Error(`Failed to upload image to storage: ${uploadResponse.status} ${uploadError}`);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/replicate-uploads/${filename}`;
  console.log("REPLICATE_UPLOAD_OK:", publicUrl);
  return publicUrl;
}

async function generateWithReplicate(
  model: string,
  prompt: string,
  reference: File,
  person1: File,
  person2: File,
  apiKey: string
): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured");
  }

  console.log("REPLICATE_IMAGES: uploading 3 files to Supabase storage for public URLs");

  const [refUrl, p1Url, p2Url] = await Promise.all([
    uploadFileToSupabaseStorage(reference, supabaseUrl, supabaseKey),
    uploadFileToSupabaseStorage(person1, supabaseUrl, supabaseKey),
    uploadFileToSupabaseStorage(person2, supabaseUrl, supabaseKey),
  ]);

  const inputPayload = {
    prompt,
    image: refUrl,
    image_1: p1Url,
    image_2: p2Url,
  };

  console.log("REPLICATE_REQUEST_PAYLOAD:", JSON.stringify({
    model,
    prompt_length: prompt.length,
    prompt_preview: prompt.substring(0, 300),
    input_fields: Object.keys(inputPayload),
    image: refUrl,
    image_1: p1Url,
    image_2: p2Url,
  }));

  const predictionResponse = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({ input: inputPayload }),
  });

  const predictionRaw = await predictionResponse.text();
  console.log("REPLICATE_PREDICTION_RAW_STATUS:", predictionResponse.status);
  console.log("REPLICATE_PREDICTION_RAW_BODY:", predictionRaw.substring(0, 2000));

  let prediction: Record<string, unknown>;
  try {
    prediction = JSON.parse(predictionRaw);
  } catch {
    throw new Error(`Replicate returned non-JSON response (${predictionResponse.status}): ${predictionRaw.substring(0, 500)}`);
  }

  if (!prediction.id) {
    throw new Error(`Replicate prediction creation failed (${predictionResponse.status}): ${JSON.stringify(prediction)}`);
  }

  console.log("REPLICATE_PREDICTION_ID:", prediction.id, "status:", prediction.status);

  if (prediction.status === "succeeded") {
    const outputUrl = Array.isArray(prediction.output) ? (prediction.output as string[])[0] : prediction.output as string;
    if (!outputUrl) throw new Error("Replicate returned succeeded but empty output");
    console.log("REPLICATE_OUTPUT_URL:", outputUrl);
    const imgResponse = await fetch(outputUrl);
    const imgBuffer = await imgResponse.arrayBuffer();
    const imgBytes = new Uint8Array(imgBuffer);
    let binary = "";
    for (let i = 0; i < imgBytes.byteLength; i++) binary += String.fromCharCode(imgBytes[i]);
    return `data:image/png;base64,${btoa(binary)}`;
  }

  if (prediction.status === "failed" || prediction.status === "canceled") {
    console.error("REPLICATE_PREDICTION_FAILED:", JSON.stringify(prediction));
    throw new Error(`Replicate prediction ${prediction.status}: ${prediction.error || JSON.stringify(prediction.logs || "no logs")}`);
  }

  const pollUrl = `https://api.replicate.com/v1/predictions/${prediction.id}`;
  const maxAttempts = 60;
  const pollInterval = 3000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const statusResponse = await fetch(pollUrl, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    const status = await statusResponse.json() as Record<string, unknown>;
    console.log(`REPLICATE_POLL [${attempt + 1}/${maxAttempts}]:`, status.status);

    if (status.status === "succeeded") {
      const outputUrl = Array.isArray(status.output) ? (status.output as string[])[0] : status.output as string;
      if (!outputUrl) throw new Error("Replicate returned empty output");
      console.log("REPLICATE_OUTPUT_URL:", outputUrl);
      const imgResponse = await fetch(outputUrl);
      const imgBuffer = await imgResponse.arrayBuffer();
      const imgBytes = new Uint8Array(imgBuffer);
      let binary = "";
      for (let i = 0; i < imgBytes.byteLength; i++) binary += String.fromCharCode(imgBytes[i]);
      return `data:image/png;base64,${btoa(binary)}`;
    }

    if (status.status === "failed" || status.status === "canceled") {
      console.error("REPLICATE_POLL_FAILED:", JSON.stringify(status));
      throw new Error(`Replicate prediction ${status.status}: ${status.error || JSON.stringify(status.logs || "no logs")}`);
    }
  }

  throw new Error("Replicate prediction timed out after 3 minutes");
}

// ─────────────────────────────────────────────
// MAIN GENERATE FUNCTION
// ─────────────────────────────────────────────

async function generateImage(
  domain: Domain,
  reference: File,
  person1: File,
  person2: File,
  style: string,
  referenceId: string
): Promise<{ imageUrl: string; debug: Record<string, unknown> }> {
  const route = modelRouter(domain);
  const isTitanicRef3 = style === "titanic" && referenceId === "ref3";
  const prompt = isTitanicRef3 ? SAFE_TITANIC_REF3_PROMPT : promptBuilder(route.promptKey);

  const debug = {
    domain,
    provider: route.provider,
    model: route.model,
    promptKey: route.promptKey,
    isTitanicRef3,
    promptPreview: prompt.substring(0, 200) + "...",
  };

  console.log("GENERATE:", JSON.stringify({ domain, provider: route.provider, model: route.model, promptKey: route.promptKey }));

  if (route.provider === "openai") {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API key not configured");
    const imageUrl = await generateWithOpenAI(route.model, prompt, reference, person1, person2, apiKey);
    return { imageUrl, debug };
  }

  if (route.provider === "replicate") {
    const apiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!apiKey) throw new Error("Replicate API key not configured");
    const imageUrl = await generateWithReplicate(route.model, prompt, reference, person1, person2, apiKey);
    return { imageUrl, debug };
  }

  throw new Error(`Unknown provider: ${route.provider}`);
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
    const selectedReference = formData.get("referenceId") as string;
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

    const domain = resolveDomain(requestedDomain, selectedStyle, requestedMode, selectedReference);

    const { imageUrl, debug } = await generateImage(
      domain,
      reference,
      person1,
      person2,
      selectedStyle,
      selectedReference
    );

    return new Response(
      JSON.stringify({ success: true, imageUrl, debug }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
