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

    console.log("=== BACKEND RECEIVING REQUEST ===");
    console.log("FormData keys:", Array.from(formData.keys()));

    const person1 = formData.get("person1");
    const person2 = formData.get("person2");
    const reference = formData.get("reference");
    const selectedStyle = formData.get("selectedStyle") as string;

    if (!person1 || !person2 || !reference || !selectedStyle) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields"
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

    if (!["zootopia", "euphoria", "titanic"].includes(selectedStyle)) {
      return new Response(
        JSON.stringify({ error: "Invalid style" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openaiToken = Deno.env.get("OPENAI_API_KEY");

    if (!openaiToken) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API token not configured"
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

    console.log("Building OpenAI request...");

    const form = new FormData();

    form.append("model", "gpt-image-1");

    form.append("prompt", `Use the reference image as the base composition.

Insert both provided people into the scene.

Keep both faces as close as possible to the original photos.
Do not merge faces.
Ensure there are exactly two people.

Preserve pose, framing, camera angle, and background.

Keep facial identity very close.
Do not change facial structure.
Avoid stylization of faces.`);

    form.append("image[]", reference);
    form.append("image[]", person1);
    form.append("image[]", person2);

    console.log("Calling OpenAI Images API...");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiToken}`
      },
      body: form
    });

    console.log("OpenAI response status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      throw new Error(data.error?.message || "OpenAI API error");
    }

    console.log("OpenAI response data:", JSON.stringify(data, null, 2));

    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      throw new Error("Invalid response from OpenAI");
    }

    const imageBase64 = data.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    console.log("Image generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("=== FULL ERROR ===");
    console.error("FULL ERROR:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        error: "Image generation failed",
        details: errorMessage
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
