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

    const form = new FormData();

    form.append("model", "gpt-image-1.5");

    form.append("prompt", `STRICT IMAGE EDITING TASK.

The FIRST image is the reference scene.
The SECOND image is Person A.
The THIRD image is Person B.

OBJECTIVE:
Replace the people in the reference image with Person A and Person B.

HARD CONSTRAINTS (must be strictly followed):
- DO NOT change composition
- DO NOT change camera angle
- DO NOT change pose
- DO NOT change framing
- DO NOT change background
- DO NOT change lighting
- DO NOT change colors
- DO NOT restyle the image
- DO NOT regenerate the scene

ONLY modify:
- faces
- identity

IDENTITY RULES:
- Person A must match the second image exactly
- Person B must match the third image exactly
- Keep faces максимально похожими
- Preserve facial structure and proportions
- Do NOT merge faces
- Do NOT blend identities

PLACEMENT RULES:
- Person A replaces the left person in the reference
- Person B replaces the right person in the reference
- Keep original body positions unchanged
- Keep original head size and orientation

REALISM RULES:
- Maintain natural skin texture
- Match lighting to the original scene
- Avoid artificial or stylized look

FINAL RESULT:
The output must look identical to the reference image,
with ONLY the people replaced.`);

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
