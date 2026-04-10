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

// ─────────────────────────────────────────────
// PROMPT TEMPLATES
// ─────────────────────────────────────────────

const FILM_FACE_SWAP_PROMPT = `STRICT LOCAL FACE IDENTITY MAPPING.

THIS IS NOT IMAGE GENERATION.
THIS IS A PRECISE LOCAL EDIT OF AN EXISTING IMAGE.

---

PRIORITY ORDER (HIGHEST → LOWEST):

1. facial expressions from Image[0]
2. face position and geometry from Image[0]
3. identity from Image[1] and Image[2]
4. background preservation
5. minimal stylization

---

INPUT:

Image[0] = base scene (source of truth)
Image[1] = Person A (identity source)
Image[2] = Person B (identity source)

---

GLOBAL CONSTRAINT:

Do NOT recreate or reinterpret the image.
Do NOT re-render the full scene.

Only perform minimal local face edits.

---

IDENTITY MAPPING (NOT REPLACEMENT):

Map the facial identity from Image[1] onto the existing face of the LEFT subject in Image[0].

Map the facial identity from Image[2] onto the existing face of the RIGHT subject in Image[0].

Do NOT generate new faces.
Do NOT blend identities.

---

EXPRESSION DOMINANCE (ABSOLUTE):

Preserve the EXACT facial expressions from Image[0].

This includes:
- eye openness and direction
- eyebrow position and tension
- mouth shape
- all micro-expressions

Ignore expressions from Image[1] and Image[2].

---

FACE ANCHORING:

Keep exact face position, scale, rotation, and alignment.

Do NOT move, resize, or recompose faces.

---

EDIT BOUNDARY (CRITICAL):

Modify ONLY the facial regions.

Do NOT change:
- hair
- body
- clothing
- background
- lighting of the scene

---

SURFACE DETAIL PRESERVATION:

Keep all environmental and surface details from Image[0]:

- dirt
- sweat
- water
- snow
- skin imperfections

They must remain consistent after identity mapping.

---

LIGHTING CONSISTENCY:

Match lighting, shadows, highlights, and color grading exactly from Image[0].

Do NOT introduce new lighting.

---

SKIN & DETAIL:

Preserve natural skin texture and facial muscle definition.

Do NOT smooth, beautify, or stylize skin.

---

FORBIDDEN:

- full image regeneration
- changing composition
- changing pose
- changing emotion
- identity blending
- artificial smoothing
- stylizing the entire scene

---

FINAL RESULT:

The output must be identical to Image[0] in every aspect,
with ONLY the facial identities replaced by Person A and Person B,
while fully preserving expressions, pose, lighting, and environment.`;

const ZOOTOPIA_CARTOON_PROMPT = `STRICT IMAGE EDITING.

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

const ZOOTOPIA_ANIMALS_PROMPT = `STRICT IMAGE EDITING.

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

function resolvePrompt(domain: Domain): string {
  switch (domain) {
    case "titanic":
    case "euphoria":
      return FILM_FACE_SWAP_PROMPT;
    case "zootopia_cartoon":
      return ZOOTOPIA_CARTOON_PROMPT;
    case "zootopia_animals":
      return ZOOTOPIA_ANIMALS_PROMPT;
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
    const prompt = resolvePrompt(domain);

    const debug = {
      domain,
      provider: "openai",
      model: "gpt-image-1.5",
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 200) + "...",
    };

    console.log("GENERATE:", JSON.stringify({ domain, provider: "openai", model: "gpt-image-1.5" }));

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
