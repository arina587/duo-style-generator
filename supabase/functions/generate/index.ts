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

    const person1 = formData.get("person1");
    const person2 = formData.get("person2");
    const styleBoard = formData.get("styleBoard");

    console.log("Received FormData:", {
      person1: person1 ? `File (${(person1 as File).name}, ${(person1 as File).size} bytes)` : null,
      person2: person2 ? `File (${(person2 as File).name}, ${(person2 as File).size} bytes)` : null,
      styleBoard: styleBoard ? `File (${(styleBoard as File).name}, ${(styleBoard as File).size} bytes)` : null,
    });

    if (!person1 || !person2 || !styleBoard) {
      const missing = [];
      if (!person1) missing.push("person1");
      if (!person2) missing.push("person2");
      if (!styleBoard) missing.push("styleBoard");

      console.error("Missing required images:", missing);

      return new Response(
        JSON.stringify({
          error: "Missing required images",
          details: `The following fields are missing: ${missing.join(", ")}`
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

    console.log("Starting Replicate prediction...");

    const output = await replicate.run(
      "qwen/qwen-image-edit-plus",
      {
        input: {
          prompt: "Create one final image using three inputs: Image 1 (person1 face must be preserved), Image 2 (person2 face must be preserved), Image 3 (style reference - this is the ONLY source of style). PRIMARY GOAL: The final image must look as if it was created inside the world of Image 3. STYLE (STRICT AND DOMINANT): Fully replicate the atmosphere of Image 3. Match its color palette exactly. Match lighting conditions, shadows, and highlights. Match textures, materials, and rendering style. Match environment, mood, and visual tone. Match composition feeling (cinematic, cartoon, etc). Reuse visual elements if present (background style, color grading, depth). IMPORTANT: The third image defines EVERYTHING about style. Do NOT use style from the first two images. Do NOT create a neutral or mixed style. The result must clearly belong to the same visual universe as Image 3. IDENTITY: Keep both faces recognizable and realistic. Preserve facial structure and identity. Do not merge faces. Do not distort facial features. INTEGRATION: Place both people naturally inside the world of Image 3. Adjust their clothing, lighting, and colors to match the environment. Make them feel like part of that scene, not pasted on top. RENDERING: matte finish, no glossy or plastic skin, no generic realism if style is stylized. NEGATIVE: ignore original lighting of input photos, ignore original background, no style mixing, no weak stylization, no realism override. If the final image does not clearly match the style of Image 3, the result is incorrect.",
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
