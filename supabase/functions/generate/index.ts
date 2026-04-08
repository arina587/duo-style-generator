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

  zootopia_animal: `TASK: FULL ANTHROPOMORPHIC ANIMAL TRANSFORMATION

MODE: Disney Zootopia-style animal character rendering

CHARACTER ASSIGNMENT (NON-NEGOTIABLE):
- Person A (LEFT in Image[0]) → anthropomorphic RED FOX
  - Reference type: Nick Wilde from Zootopia
  - Species characteristics: pointed ears, elongated snout, red/orange fur, bushy tail posture
  - DO NOT render as cat, wolf, dog, or any other canid
- Person B (RIGHT in Image[0]) → anthropomorphic RABBIT
  - Reference type: Judy Hopps from Zootopia
  - Species characteristics: tall upright ears, round nose, compact snout, grey fur
  - DO NOT render as mouse, rat, or other small animal

SPECIES ENFORCEMENT (ABSOLUTE):
- FULL animal transformation required — NO human facial features remaining
- Both characters must be unambiguously their assigned species
- DO NOT blend human and animal features
- DO NOT default to generic cat-like or ambiguous faces
- Snout shape, ear shape, and fur pattern must be species-accurate

STYLE REQUIREMENTS (STRICT):
- EXACT Disney Zootopia 3D film style
- Film-quality rendering with soft cinematic lighting
- Detailed fur shading with individual strand definition
- Realistic depth and subsurface scattering in fur
- Expressive anatomy grounded in species physicality
- NOT anime, NOT manga, NOT flat cartoon, NOT 2D illustration

IDENTITY PRESERVATION THROUGH SPECIES:
- Maintain personality and emotional identity through:
  - Eye shape and color referencing Image[1] and Image[2]
  - Facial expression matching Image[0] expression
  - Body proportions and posture matching Image[0] pose
  - Attitude and character energy from the source persons

SCENE AND CLOTHING:
- Background must remain fully consistent with Image[0]
- Clothing adapted to fit anthropomorphic anatomy while preserving design, colors, and layers
- Environmental details (snow, dirt, particles) must remain present
- Lighting must match Image[0] direction and color temperature

QUALITY STANDARD:
- Feature-film render quality (Zootopia 2016 standard)
- No low-detail fur textures
- No flat or unrendered surfaces
- Full cinematic depth, lighting, and atmosphere`,
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

async function generateWithReplicate(
  model: string,
  prompt: string,
  reference: File,
  person1: File,
  person2: File,
  apiKey: string
): Promise<string> {
  const [refUrl, p1Url, p2Url] = await Promise.all([
    fileToBase64DataUrl(reference),
    fileToBase64DataUrl(person1),
    fileToBase64DataUrl(person2),
  ]);

  const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: model,
      input: {
        prompt,
        image: refUrl,
        person_a_image: p1Url,
        person_b_image: p2Url,
      },
    }),
  });

  const prediction = await predictionResponse.json();

  if (!prediction.id) {
    throw new Error(`Replicate prediction failed: ${JSON.stringify(prediction)}`);
  }

  const pollUrl = `https://api.replicate.com/v1/predictions/${prediction.id}`;
  const maxAttempts = 60;
  const pollInterval = 3000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const statusResponse = await fetch(pollUrl, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    const status = await statusResponse.json();

    if (status.status === "succeeded") {
      const outputUrl = Array.isArray(status.output) ? status.output[0] : status.output;
      if (!outputUrl) {
        throw new Error("Replicate returned empty output");
      }
      const imgResponse = await fetch(outputUrl);
      const imgBuffer = await imgResponse.arrayBuffer();
      const imgBytes = new Uint8Array(imgBuffer);
      let binary = "";
      for (let i = 0; i < imgBytes.byteLength; i++) {
        binary += String.fromCharCode(imgBytes[i]);
      }
      const base64 = btoa(binary);
      return `data:image/png;base64,${base64}`;
    }

    if (status.status === "failed" || status.status === "canceled") {
      throw new Error(`Replicate prediction ${status.status}: ${status.error || "unknown error"}`);
    }
  }

  throw new Error("Replicate prediction timed out");
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
