import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Replicate from "npm:replicate";

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
    const styleBoard = formData.get("styleBoard");
    const selectedStyle = formData.get("selectedStyle") as string;

    console.log("Extracted values:", {
      person1: person1 ? `File (${(person1 as File).name}, ${(person1 as File).size} bytes)` : "MISSING",
      person2: person2 ? `File (${(person2 as File).name}, ${(person2 as File).size} bytes)` : "MISSING",
      styleBoard: styleBoard ? `File (${(styleBoard as File).name}, ${(styleBoard as File).size} bytes)` : "MISSING",
      selectedStyle: selectedStyle || "MISSING"
    });

    console.log("Validation check:", {
      person1Present: !!person1,
      person2Present: !!person2,
      styleBoardPresent: !!styleBoard,
      selectedStylePresent: !!selectedStyle
    });

    if (!person1 || !person2 || !styleBoard || !selectedStyle) {
      const missing = [];
      if (!person1) missing.push("person1");
      if (!person2) missing.push("person2");
      if (!styleBoard) missing.push("styleBoard");
      if (!selectedStyle) missing.push("selectedStyle");

      console.error("=== VALIDATION FAILED ===");
      console.error("Missing required fields:", missing);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
          details: `The following fields are missing: ${missing.join(", ")}`,
          received: {
            person1: !!person1,
            person2: !!person2,
            styleBoard: !!styleBoard,
            selectedStyle: !!selectedStyle
          }
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

    console.log("=== VALIDATION PASSED ===");

    if (!["zootopia", "euphoria", "titanic"].includes(selectedStyle)) {
      console.error("Invalid selectedStyle:", selectedStyle);
      return new Response(
        JSON.stringify({
          error: "Invalid style",
          details: `selectedStyle must be one of: zootopia, euphoria, titanic. Received: ${selectedStyle}`
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

    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN");

    if (!replicateToken) {
      return new Response(
        JSON.stringify({
          error: "Replicate API token not configured",
          details: "The REPLICATE_API_TOKEN environment variable is missing. Please configure it in your Supabase project settings."
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

    const fileToDataURL = async (file: File): Promise<string> => {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      return `data:${file.type};base64,${base64}`;
    };

    console.log("Converting files to data URLs...");
    const person1DataURL = await fileToDataURL(person1 as File);
    const person2DataURL = await fileToDataURL(person2 as File);
    const styleBoardDataURL = await fileToDataURL(styleBoard as File);
    console.log("Files converted successfully");

    const replicate = new Replicate({
      auth: replicateToken,
      useFileOutput: false,
    });

    let prompt = `Create one final image from three inputs:
- image1: first person (identity)
- image2: second person (identity)
- image3: MASTER REFERENCE (exact scene to recreate)

PRIMARY GOAL: Recreate image3 as closely as possible with new people.

HARD CONSTRAINT: This is NOT a new composition. This is a reconstruction of image3.

SCENE RECONSTRUCTION:
- replicate the exact pose from image3
- replicate exact body positions
- replicate character interaction
- replicate framing and camera angle
- replicate distance between subjects

STYLE REPLICATION (STRICT):
- copy exact colors from image3
- copy lighting direction and intensity
- copy shadows and highlights
- copy contrast and color grading
- copy rendering style (cinematic / animated)

ENVIRONMENT:
- replicate background structure and depth
- match blur / depth of field
- match atmosphere exactly

CHARACTERS:
- replace people with image1 and image2 identities
- keep faces recognizable
- preserve hair, proportions, and key traits

INTEGRATION:
- adapt faces into the lighting of image3
- match skin tones to scene lighting
- match shadows and highlights exactly
`;

    if (selectedStyle === "titanic") {
      prompt += `
TITANIC MODE:
- cinematic realism
- golden hour lighting
- warm tones
- romantic atmosphere
- film-like rendering
- realistic skin
`;
    } else if (selectedStyle === "euphoria") {
      prompt += `
EUPHORIA MODE:
- moody cinematic lighting
- strong color grading
- intimate close-up feeling
- soft shadows
- emotional tone
`;
    } else if (selectedStyle === "zootopia") {
      prompt += `
ZOOTOPIA MODE:
- fully transform into animated characters
- 3D animated rendering
- smooth shading
- stylized proportions
- large expressive eyes
- vibrant clean colors
- no realism
`;
    }

    prompt += `
STRICT RULE: Do NOT create a new scene. Do NOT change pose. Do NOT change lighting. Do NOT simplify style.

PRIORITY: image3 (scene, style, pose) = 90%, identity = 10%

NEGATIVE: different pose, different lighting, weak colors, generic look, flat image, modern portrait style

FINAL CHECK: The result must look like the SAME image as image3, with different people inserted. If it looks like a different scene it is incorrect.`;

    console.log("Starting Replicate prediction...");
    console.log("Selected style:", selectedStyle);
    console.log("Using prompt:", prompt);

    const output = await replicate.run(
      "qwen/qwen-image-edit-plus",
      {
        input: {
          prompt: prompt,
          image: [person1DataURL, person2DataURL, styleBoardDataURL]
        }
      }
    );

    console.log("Replicate raw output:", JSON.stringify(output, null, 2));
    console.log("Output type:", typeof output);
    console.log("Output is array:", Array.isArray(output));

    let imageUrl: string | null = null;

    let firstItem = Array.isArray(output) ? output[0] : output;
    console.log("First item:", firstItem);
    console.log("First item type:", typeof firstItem);

    if (typeof firstItem === 'string') {
      console.log("First item is string, using directly");
      imageUrl = firstItem;
    } else if (firstItem && typeof firstItem === 'object') {
      console.log("First item is object, checking for URL");

      if (typeof firstItem.url === 'function') {
        console.log("First item has url() method, calling it");
        imageUrl = await firstItem.url();
      } else if (typeof firstItem.url === 'string') {
        console.log("First item has url property as string");
        imageUrl = firstItem.url;
      } else if (firstItem.toString && firstItem.toString() !== '[object Object]') {
        console.log("Attempting to convert object to string");
        imageUrl = firstItem.toString();
      } else {
        console.error("Object does not have url method or property:", Object.keys(firstItem));
      }
    }

    console.log("Parsed imageUrl:", imageUrl);

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      console.error("Invalid imageUrl after parsing:", imageUrl);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid Replicate output",
          details: "No valid image URL was returned"
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

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      console.error("imageUrl is not a valid URL:", imageUrl);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid Replicate output",
          details: "Returned value is not a valid URL"
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

    console.log("Final validated imageUrl:", imageUrl);

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
    console.error("Generation error:", error);

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
