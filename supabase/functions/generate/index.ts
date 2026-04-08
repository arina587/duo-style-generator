import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const isZootopia = selectedStyle === "zootopia";

    // All modes now require person images for identity preservation
    if (!reference || !person1 || !person2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing images: reference, person1, and person2 are all required"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate mode for zootopia
    if (isZootopia && !requestedMode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Mode is required for zootopia style"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OpenAI API key not configured"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const isTitanicRef3 = selectedStyle === "titanic" && selectedReference === "ref3";

    const MULTI_MODE_PROMPT = `STRICT CONTROLLED IMAGE EDITING. NO CREATIVE INTERPRETATION ALLOWED.

INPUT IMAGES:
Image[0] = REFERENCE SCENE (this image MUST be preserved)
Image[1] = Person A
Image[2] = Person B

MODE: {{MODE}}
(realistic / cartoon_human / animal)

--------------------------------
ABSOLUTE RULE:
--------------------------------
The reference image MUST remain unchanged in composition, background, clothing, and details.
Only identity and rendering style (depending on MODE) may change.

--------------------------------
IDENTITY MAPPING (STRICT):
--------------------------------
- LEFT person in Image[0] → Person A (Image[1])
- RIGHT person in Image[0] → Person B (Image[2])

--------------------------------
BACKGROUND & DETAIL PRESERVATION (HIGHEST PRIORITY):
--------------------------------
- DO NOT recreate or redraw the scene
- DO NOT simplify or restyle the background
- ALL background details must remain EXACT:
  snow, dirt, textures, lighting, reflections, objects

- Clothing MUST remain EXACTLY the same:
  folds, fabric texture, shadows, wetness, snow, dirt

- If there is snow / dirt / particles on:
  - clothes → KEEP IT
  - face → APPLY IT to the new face
  - environment → KEEP EXACT

--------------------------------
FACE REPLACEMENT QUALITY:
--------------------------------
- Faces must NOT look pasted, smooth, or artificial
- Preserve skin texture, imperfections, lighting noise
- Match sharpness, grain, blur to the original image

--------------------------------
EXPRESSION LOCK (VERY STRICT):
--------------------------------
- Copy the EXACT facial expression from Image[0]
- Match:
  - mouth shape
  - eye openness
  - eyebrow position
  - gaze direction
- DO NOT use neutral faces
- Emotion must be identical to the reference

--------------------------------
IDENTITY RULES:
--------------------------------
- Use ONLY faces from Image[1] and Image[2]
- Preserve real facial structure and recognizability
- DO NOT invent new faces
- DO NOT blend faces together

--------------------------------
MODE LOGIC:
--------------------------------

IF MODE = "realistic":
- Perform pure face replacement
- NO style change
- NO scene change
- Result must look like original photo with different people

--------------------------------

IF MODE = "cartoon_human":

STYLE REQUIREMENT (STRICT):
- Disney Zootopia-style 3D rendering ONLY
- NOT anime, NOT manga, NOT 2D
- Pixar/Disney 3D shading model

STYLE CHARACTERISTICS:
- Soft global illumination
- Subsurface scattering in skin
- Rounded facial geometry
- Natural proportions (NOT exaggerated anime)
- Physically consistent lighting and shadows

RULES:
- Characters remain HUMAN
- Faces must be stylized but still recognizable
- Keep same pose, composition, clothing

--------------------------------

IF MODE = "animal":

STRICT CHARACTER TYPES:
- Person A → anthropomorphic FOX (Nick Wilde type)
- Person B → anthropomorphic RABBIT (Judy Hopps type)

ABSOLUTE:
- DO NOT choose random animals
- DO NOT mix human and animal
- FULL animal transformation required

STYLE REQUIREMENT:
- EXACT Disney Zootopia 3D style:
  - film-quality rendering
  - soft cinematic lighting
  - detailed fur shading
  - realistic depth and shadows
  - expressive but grounded anatomy

IDENTITY PRESERVATION:
- Maintain personality through:
  - eye shape
  - expression
  - proportions
  - attitude

--------------------------------
STYLE RESTRICTIONS:
--------------------------------
- NO anime
- NO manga
- NO flat cartoon
- NO low-detail style
- ONLY cinematic Disney Zootopia-quality rendering

--------------------------------
FINAL OUTPUT REQUIREMENTS:
--------------------------------
- Background identical to Image[0]
- Clothing identical with all details preserved
- Snow / dirt / particles correctly present
- Expression identical to reference
- Faces fully integrated (not pasted)
- Strong identity preservation
- No randomness, no reinterpretation`;

    const SAFE_TITANIC_REF3_PROMPT = `Edit the image by replacing the people with the provided individuals.

Keep the overall scene similar.

Allow slight adjustments to ensure the image is appropriate.

* Maintain background and lighting
* Keep composition similar
* Ensure people are not overlapping too closely
* Keep interaction neutral

Only update identity.

The result must be natural, appropriate, and non-sensitive.`;

    // Determine mode based on style and user selection
    let mode = "realistic";
    if (isZootopia && requestedMode) {
      mode = requestedMode;
    }

    // Select prompt and replace {{MODE}} placeholder
    let prompt = MULTI_MODE_PROMPT.replace("{{MODE}}", mode);

    // Use safe prompt for titanic ref3
    if (isTitanicRef3) {
      prompt = SAFE_TITANIC_REF3_PROMPT;
    }

    const form = new FormData();

    form.append("model", "gpt-image-1.5");
    form.append("prompt", prompt);

    // Add images based on mode
    // For all modes, we send reference + person images
    // The prompt will control how they are used
    form.append("image[]", reference);

    if (!isZootopia) {
      // Face transfer modes: include person images
      form.append("image[]", person1);
      form.append("image[]", person2);
    } else {
      // Animal mode: also include person images for identity preservation
      form.append("image[]", person1);
      form.append("image[]", person2);
    }

    // Debug logging
    console.log("Style:", selectedStyle);
    console.log("IMAGE COUNT:", form.getAll("image[]").length);
    console.log("FORM KEYS:");
    for (const key of form.keys()) {
      console.log(key);
    }

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: form
    });

    const data = await response.json();

    if (!data?.data?.[0]?.b64_json) {
      return new Response(
        JSON.stringify({
          success: false,
          error: JSON.stringify(data)
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const imageBase64 = data.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    const images = form.getAll("image[]");

    const debug = {
      mode,
      imageCount: images.length,
      formKeys: Array.from(form.keys()),
      selectedStyle,
      selectedReference,
      promptPreview: prompt.substring(0, 200) + "..."
    };

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        debug
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
