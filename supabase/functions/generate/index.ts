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
- image1: first person
- image2: second person
- image3: MASTER REFERENCE

PRIMARY GOAL: Recreate image3 as closely as possible with ONLY the two provided people.

CRITICAL RULE (NO EXTRA CHARACTERS):
- The image must contain EXACTLY TWO characters
- Only the two people from image1 and image2 are allowed
- Do NOT add any extra people
- Do NOT add background characters
- Do NOT generate animals or additional figures
- If image3 contains other characters → REMOVE them

POSE LOCK (VERY STRICT):
- replicate the exact pose from image3
- match body positions precisely
- match interaction between the two characters
- match distance between them
- match camera angle and framing

IDENTITY PRESERVATION (IMPROVED):
- strongly preserve facial structure from image1 and image2
- preserve eyes, nose, mouth, and face shape
- preserve hairstyle and hair color
- preserve proportions and key traits
- faces must remain clearly recognizable
- do NOT over-stylize faces
- do NOT distort identity
- do NOT merge faces together

STYLE REPLICATION:
- copy lighting from image3
- copy colors and color grading
- copy shadows and highlights
- copy depth and background blur
- copy overall atmosphere

ENVIRONMENT:
- replicate background structure
- match depth of field
- match atmosphere exactly

INTEGRATION:
- match lighting on faces to scene
- match skin tones to environment
- blend naturally into scene
`;

    if (selectedStyle === "titanic") {
      prompt += `
STYLE MODE - TITANIC:
- cinematic realism
- warm golden-hour lighting
- soft romantic atmosphere
- realistic skin and light interaction
- film-like rendering
`;
    } else if (selectedStyle === "euphoria") {
      prompt += `
STYLE MODE - EUPHORIA:
- moody cinematic lighting
- strong color grading
- intimate close composition
- soft shadows and contrast
- emotional tone
`;
    } else if (selectedStyle === "zootopia") {
      prompt += `
STYLE MODE - ZOOTOPIA:
- transform BOTH people into animated characters
- BUT keep ONLY TWO characters total
- do NOT add extra animals
- stylized 3D animation style
- expressive eyes, smooth shading, clean geometry
- vibrant colors
- keep recognizable traits from original faces
`;
    }

    prompt += `
STRICT RULES:
- do NOT create new composition
- do NOT add extra elements or characters
- do NOT weaken pose accuracy
- do NOT change number of characters from TWO

NEGATIVE: extra people, extra animals, background characters, crowd, wrong pose, distorted faces, merged faces, weak style, flat lighting, three or more people

FINAL RULE: The result must look like the SAME scene as image3, recreated with ONLY the two provided people.`;

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
