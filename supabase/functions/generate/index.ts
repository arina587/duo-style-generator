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

    let prompt = `Create an image using three inputs:
- image1: first person
- image2: second person
- image3: pose reference ONLY

CORE RULE:
The STYLE must be fully controlled by selectedStyle.
The reference image MUST be used ONLY for pose, composition, and framing.

DO NOT copy style from image3.

IDENTITY (STRICT):
Preserve both people recognizable:
- face shape
- facial proportions
- hair color and hairstyle
- skin tone

Do NOT heavily stylize or distort identity.

CHARACTER RULE:
- EXACTLY TWO characters
- NO extra people
- NO animals
- NO background figures

POSE (STRICT):
- copy pose EXACTLY from image3
- match body positions
- match interaction
- match camera angle
- match framing

BACKGROUND:
- recreate environment structure from image3
- but adapt it to the selectedStyle visual world
`;

    if (selectedStyle === "zootopia") {
      prompt += `
STYLE LOCK - ZOOTOPIA:
Create a Disney/Pixar animated film style that is instantly recognizable.

- high-end 3D animation rendering
- smooth rounded geometry
- large expressive eyes
- stylized proportions
- soft global illumination
- subsurface scattering
- clean vibrant color palette
- slightly glossy materials
- cinematic animation lighting

IMPORTANT:
The result must look like it is from the SAME Disney animated movie every time.
`;
    } else if (selectedStyle === "euphoria") {
      prompt += `
STYLE LOCK - EUPHORIA:
Create a cinematic style that clearly resembles the visual identity of the Euphoria TV series.

- strong stylized color grading
- warm, pink, purple, and golden tones
- soft but contrast-rich lighting
- glowing highlights
- shallow depth of field
- skin with realistic texture but cinematic glow
- emotional, intimate atmosphere

IMPORTANT:
All outputs must look like scenes from the SAME TV episode.
`;
    } else if (selectedStyle === "titanic") {
      prompt += `
STYLE LOCK - TITANIC:
Create a cinematic style that clearly resembles Titanic film visuals.

- golden hour sunlight OR cold blue dramatic tones
- strong cinematic lighting direction
- soft glow around highlights
- romantic, epic atmosphere
- film-grade color grading
- realistic materials and textures

IMPORTANT:
All outputs must look like scenes from the SAME movie.
`;
    }

    prompt += `
LIGHTING:
Follow STYLE rules, NOT the reference image.

COLOR:
Follow STYLE rules strictly.
Do NOT inherit colors from reference.

CONSISTENCY RULE (VERY IMPORTANT):
All images within the same selectedStyle must:
- have identical rendering style
- have identical lighting behavior
- have identical color grading
- feel like frames from the same film universe

NEGATIVE:
extra people, animals, mixed styles, inconsistent lighting, wrong color palette, distorted faces, bad anatomy`;

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
