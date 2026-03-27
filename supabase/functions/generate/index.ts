import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  person1: string;
  person2: string;
  styleBoard: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { person1, person2, styleBoard }: GenerateRequest = await req.json();

    if (!person1 || !person2 || !styleBoard) {
      return new Response(
        JSON.stringify({ error: "Missing required images" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN");

    if (!replicateToken) {
      return new Response(
        JSON.stringify({ error: "Replicate API token not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Start prediction
    const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${replicateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "qwen/qwen-image-edit-plus",
        input: {
          image: person1,
          image2: person2,
          style_image: styleBoard,
        },
      }),
    });

    if (!predictionResponse.ok) {
      const errorText = await predictionResponse.text();
      console.error("Replicate API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to start image generation" }),
        {
          status: predictionResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prediction = await predictionResponse.json();
    const predictionId = prediction.id;

    // Poll for result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max

    while (result.status !== "succeeded" && result.status !== "failed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            "Authorization": `Bearer ${replicateToken}`,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to check prediction status");
      }

      result = await statusResponse.json();
      attempts++;
    }

    if (result.status === "failed") {
      return new Response(
        JSON.stringify({ error: "Image generation failed", details: result.error }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (result.status !== "succeeded") {
      return new Response(
        JSON.stringify({ error: "Image generation timed out" }),
        {
          status: 408,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        imageUrl: result.output,
        success: true
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Generation error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
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
