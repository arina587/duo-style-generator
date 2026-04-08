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

    const MULTI_MODE_PROMPT = `STRICT MULTI-MODE IMAGE EDITING TASK.

INPUT IMAGES (ORDER IS CRITICAL):
Image[0] = REFERENCE SCENE
Image[1] = Person A
Image[2] = Person B

MODE: {{MODE}}
(allowed: realistic / cartoon_human / animal)

TASK:
Recreate the reference scene while replacing the two people using the identities from Image[1] and Image[2].

IDENTITY MAPPING:
- Left character → Person A
- Right character → Person B

--------------------------------
IDENTITY PRESERVATION (CRITICAL):
--------------------------------
- Use ONLY faces from Image[1] and Image[2]
- Preserve facial structure, proportions, and key features
- Maintain recognizability
- Do NOT generate new or random faces
- Do NOT blend identities

--------------------------------
EXPRESSION TRANSFER (VERY IMPORTANT):
--------------------------------
- Match the facial expression from the reference scene
- Adapt the source faces to the exact emotion (smile, gaze, tension, etc.)
- Eyes, eyebrows, and mouth must reflect the same emotion as in Image[0]

--------------------------------
SCENE INTEGRATION (CRITICAL):
--------------------------------
- Faces must look naturally part of the scene, NOT pasted
- Match lighting direction, shadows, and color grading
- Apply environmental effects from Image[0] onto faces:
  snow, dirt, water, reflections, glow, blur, grain
- Match depth of field and focus

--------------------------------
MODE BEHAVIOR:
--------------------------------

IF MODE = "realistic":
- Perform high-quality face replacement
- Keep full photorealism
- Do not change bodies or scene
- Only replace identity and integrate naturally

IF MODE = "cartoon_human":
- Transform all characters into stylized animated humans
- Faces must remain recognizable but fully cartoon-stylized
- Large expressive eyes, simplified features, smooth shading
- No photorealism

IF MODE = "animal":
- Transform each person into a stylized animal character
- Fully non-human characters (no human skin)
- Preserve identity through:
  face shape, eye structure, color palette, expression
- Translate hair into fur/ears/horns

--------------------------------
FINAL:
--------------------------------
The result must be a cohesive, high-quality image:
- correct emotion
- strong identity preservation
- no cutout or pasted face artifacts
- full integration into the scene`;

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
