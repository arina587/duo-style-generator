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
    // Read FormData
    const formData = await req.formData();

    const person1 = formData.get("person1");
    const person2 = formData.get("person2");
    const styleBoard = formData.get("styleBoard");

    console.log("Received FormData:", {
      person1: person1 ? `File (${(person1 as File).name}, ${(person1 as File).size} bytes)` : null,
      person2: person2 ? `File (${(person2 as File).name}, ${(person2 as File).size} bytes)` : null,
      styleBoard: styleBoard ? `File (${(styleBoard as File).name}, ${(styleBoard as File).size} bytes)` : null,
    });

    // Validate all required images are present
    if (!person1 || !person2 || !styleBoard) {
      const missing = [];
      if (!person1) missing.push("person1");
      if (!person2) missing.push("person2");
      if (!styleBoard) missing.push("styleBoard");

      console.error("Missing required images:", missing);

      return new Response(
        JSON.stringify({
          error: "Missing required images",
          missing: missing
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

    // Convert Files to base64
    const person1File = person1 as File;
    const person2File = person2 as File;
    const styleBoardFile = styleBoard as File;

    const person1Base64 = `data:${person1File.type};base64,${btoa(String.fromCharCode(...new Uint8Array(await person1File.arrayBuffer())))}`;
    const person2Base64 = `data:${person2File.type};base64,${btoa(String.fromCharCode(...new Uint8Array(await person2File.arrayBuffer())))}`;
    const styleBoardBase64 = `data:${styleBoardFile.type};base64,${btoa(String.fromCharCode(...new Uint8Array(await styleBoardFile.arrayBuffer())))}`;

    console.log("Converted images to base64 successfully");

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
          image: person1Base64,
          image2: person2Base64,
          style_image: styleBoardBase64,
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
