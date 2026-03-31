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

    if (!reference || !person1 || !person2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing images"
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
    const isZootopia = selectedStyle === "zootopia";

    const DEFAULT_PROMPT = `STRICT IMAGE EDITING TASK.

The first image is the reference scene.
The second image is Person A.
The third image is Person B.

OBJECTIVE:
Replace the people in the reference image with Person A and Person B.

CONSTRAINTS:

* Keep the original scene unchanged
* Preserve composition, pose, camera angle, framing, and background
* Maintain original lighting and colors
* Keep body positions and proportions exactly the same

EDITING RULES:

* Only update facial identity
* Do not change body posture
* Do not move people
* Do not resize heads
* Do not restyle the image
* Do not regenerate the scene

IDENTITY:

* Person A must match the second image
* Person B must match the third image
* Preserve facial structure and proportions
* Keep high facial similarity
* Do not merge or blend faces

FINAL RESULT:
The output should look like the same image,
with only the identities of the people changed.`;

    const SAFE_TITANIC_REF3_PROMPT = `Edit the image by replacing the people with the provided individuals.

Keep the overall scene similar.

Allow slight adjustments to ensure the image is appropriate.

* Maintain background and lighting
* Keep composition similar
* Ensure people are not overlapping too closely
* Keep interaction neutral

Only update identity.

The result must be natural, appropriate, and non-sensitive.`;

    const CARTOON_PROMPT = `FULL STYLIZED RE-RENDER TASK.

The first image is the reference scene.
The second and third images are two real people.

OBJECTIVE:

Recreate the scene as a fully stylized animated illustration.

CRITICAL:

* DO NOT copy or paste real faces
* DO NOT preserve photorealistic facial features
* Completely redraw both people as stylized characters

POSE & COMPOSITION:

* Preserve EXACT body pose and positioning from the reference image
* Keep camera angle, framing, and proportions identical
* Keep left/right placement unchanged

STYLE:

* Modern high-quality animated film style
* Stylized, expressive, clean shapes
* Soft shading, smooth gradients
* Cartoon proportions
* Large expressive eyes
* Simplified facial structure

CHARACTER DESIGN:

* Convert both people into stylized human-like or slightly anthropomorphic characters

* Add subtle playful character elements:

  Person A (second image):

  * Add a cute accessory (e.g. headband, small animal ears, stylized hair detail)

  Person B (third image):

  * Add a subtle stylized feature (e.g. jacket detail, hairstyle exaggeration, small character trait)

* Keep design tasteful and non-cartoony-extreme

* Avoid anything creepy or exaggerated

IDENTITY:

* Preserve general resemblance:

  * hair color
  * face shape (stylized)
  * overall vibe

* NOT a realistic likeness

* NOT a face transfer

CONSISTENCY:

* Both characters must match the same animation style
* Lighting and environment must match the reference

FINAL RESULT:

The output must look like a fully illustrated animated scene,
with the SAME pose and composition,
but with both people completely redrawn as stylized characters.`;

    let prompt = DEFAULT_PROMPT;
    if (isZootopia) {
      prompt = CARTOON_PROMPT;
    } else if (isTitanicRef3) {
      prompt = SAFE_TITANIC_REF3_PROMPT;
    }

    const form = new FormData();

    form.append("model", "gpt-image-1.5");
    form.append("prompt", prompt);

    form.append("image[]", reference);
    form.append("image[]", person1);
    form.append("image[]", person2);

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

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl
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
