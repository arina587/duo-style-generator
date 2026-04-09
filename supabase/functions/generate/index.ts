import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Domain = "titanic" | "euphoria" | "zootopia_cartoon" | "zootopia_animals";
type PromptKey = "film_face_swap" | "zootopia_cartoon" | "zootopia_animals";

// ─────────────────────────────────────────────
// PROMPT TEMPLATES
// ─────────────────────────────────────────────

const promptTemplates: Record<PromptKey, string> = {
  film_face_swap: `STRICT REALISTIC IMAGE EDITING — SCENE-ACCURATE FACE SWAP.

INPUT:
Image[0] = reference scene (authoritative source of all environmental conditions)
Image[1] = person A (face donor)
Image[2] = person B (face donor)

TASK:
Replace the faces in Image[0] with the faces from Image[1] and Image[2].

SCENE PRESERVATION (NON-NEGOTIABLE):
- Keep background, lighting, camera angle, and composition PIXEL-EXACT
- Keep pose, clothing, and body positions UNCHANGED
- Keep film grain, noise, motion blur, lens distortion, and depth-of-field UNCHANGED
- Keep the original color grading, tones, and mood of Image[0]

ENVIRONMENT MATCH — READ IMAGE[0] AND APPLY EXACTLY:
- Analyze the VISIBLE environmental conditions in Image[0] and transfer them to the new faces
- If Image[0] shows cold or freezing conditions (pale skin, blue-white skin tones, desaturated complexion): apply that color temperature to the new faces
- If Image[0] shows wet skin or water droplets: apply wetness, reflections, and wet-skin texture to the new faces
- If Image[0] shows sweat, tears, dirt, blood, bruises, or physical damage: preserve and transfer those details
- If Image[0] has strong colored lighting (warm/cool/tinted): the new faces must inherit exactly that lighting color
- If Image[0] shows dry, clean, normal conditions: render faces cleanly with NO added damage or effects
- DO NOT invent or add any environmental effect that is NOT visibly present in Image[0]

SKIN INTEGRATION (CRITICAL):
- Match lighting direction and intensity to Image[0] exactly
- Match color temperature of skin to the scene's lighting (cold scene = cold skin, warm scene = warm skin)
- Match skin texture to what is visible in Image[0] — wet if scene is wet, dry if scene is dry
- DO NOT smooth, beautify, or normalize the face
- Keep all pores, asymmetry, wrinkles, and natural imperfections of Image[1] / Image[2]
- No artificial sharpening, glow, or skin-softening filters

REALISM:
- Do NOT add effects not present in Image[0]
- Do NOT apply cold/blue skin tones unless clearly visible in Image[0]
- Do NOT apply wetness unless clearly visible in Image[0]
- The replaced faces must look like they were part of the original scene when it was filmed

HANDS & ANATOMY:
- Preserve natural hand anatomy
- Correct finger count (5 fingers per hand)
- No deformed or merged fingers
- Maintain realistic body proportions

FINAL RESULT:
The output must look like an authentic, unedited film frame where the original actors were replaced seamlessly. No composite look. No lighting mismatch. No texture mismatch.`,

  zootopia_cartoon: `STRICT CONTROLLED IMAGE EDITING.

INPUT IMAGES:
Image[0] = reference scene
Image[1] = Person A (LEFT)
Image[2] = Person B (RIGHT)

IDENTITY:
LEFT → Person A
RIGHT → Person B

LOCK:
- keep exact pose, composition, clothing, background
- do not change scene

TASK:
Transform both people into stylized animated human characters.

STYLE:
- Disney / Zootopia-inspired 3D style
- smooth skin, clean shading
- soft cinematic lighting
- slightly larger expressive eyes

IDENTITY PRESERVATION:
- preserve facial structure, proportions, and expression
- characters must remain recognizable

FINAL RESULT:
- same scene
- same pose
- same clothing
- both people are cartoon human versions of themselves`,

  zootopia_animals: `STRICT CONTROLLED IMAGE EDITING.

INPUT IMAGES:
Image[0] = reference scene
Image[1] = Person A (LEFT)
Image[2] = Person B (RIGHT)

IDENTITY:
LEFT → Person A (FOX)
RIGHT → Person B (RABBIT)

LOCK:
- keep exact pose, composition, clothing, background
- do not change scene

TASK:
Transform both people into anthropomorphic animals.

TRANSFORMATION RULES:
- full animal faces (no human skin)
- upright human bodies
- preserve pose and clothing

FOX (Person A):
- orange fur
- elongated muzzle
- pointed ears

RABBIT (Person B):
- softer face
- long ears
- rounded features

STYLE:
- Disney / Zootopia-style 3D cinematic rendering
- detailed fur shading
- soft lighting

IDENTITY PRESERVATION:
- preserve eye spacing, expression, and head position
- characters must feel like the same people

FINAL RESULT:
- same scene
- same pose and clothing
- clearly a fox and a rabbit
- identity still recognizable`,
};

// ─────────────────────────────────────────────
// DOMAIN RESOLVER
// Maps incoming style + mode fields to domain
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

// ─────────────────────────────────────────────
// PROMPT RESOLVER
// ─────────────────────────────────────────────

function resolvePromptKey(domain: Domain): PromptKey {
  switch (domain) {
    case "titanic":
    case "euphoria":
      return "film_face_swap";
    case "zootopia_cartoon":
      return "zootopia_cartoon";
    case "zootopia_animals":
      return "zootopia_animals";
  }
}

// ─────────────────────────────────────────────
// OPENAI GENERATOR
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

  console.log("=== GPT REQUEST ===");
  console.log("model: gpt-image-1.5");
  console.log("endpoint: https://api.openai.com/v1/images/edits");
  console.log("prompt length:", prompt.length);
  console.log("prompt:\n" + prompt);
  console.log("images:");
  console.log("  [0] reference  — name:", reference.name, "| size:", reference.size, "bytes | type:", reference.type);
  console.log("  [1] person1    — name:", person1.name, "| size:", person1.size, "bytes | type:", person1.type);
  console.log("  [2] person2    — name:", person2.name, "| size:", person2.size, "bytes | type:", person2.type);
  console.log("payload: FormData { model, prompt, image[0], image[1], image[2] }");
  console.log("===================");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: form,
  });

  const responseText = await response.text();

  console.log("=== GPT RESPONSE ===");
  console.log("status:", response.status);
  console.log("body:", responseText);
  console.log("====================");

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

    const domain = resolveDomain(requestedDomain, selectedStyle, requestedMode);
    const promptKey = resolvePromptKey(domain);
    const prompt = promptTemplates[promptKey];

    const debug = {
      domain,
      provider: "openai",
      model: "gpt-image-1.5",
      promptKey,
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 200) + "...",
    };

    console.log("GENERATE:", JSON.stringify({ domain, provider: "openai", model: "gpt-image-1.5", promptKey }));

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API key not configured");

    const imageUrl = await generateWithOpenAI(prompt, reference, person1, person2, apiKey);

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
