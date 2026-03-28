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

    console.log("=== Single-Step Generation with Identity Preservation ===");
    console.log("Selected style:", selectedStyle);

    let prompt = `Create an image using three inputs:

- image1: first person
- image2: second person
- image3: pose reference ONLY

CORE RULE:
This is a pose reconstruction with identity preservation and controlled style enhancement.

- image3 controls ONLY pose and composition
- style must NOT be copied from image3
- style must be applied carefully from selectedStyle

SUBJECT RULE (ABSOLUTE):
EXACTLY TWO people in the final image.
DO NOT add any extra person.
DO NOT add animals.
DO NOT add background people, silhouettes, reflections.

If more than two people appear, regenerate.

IDENTITY (HIGHEST PRIORITY):
Preserve both people as accurately as possible:

- original face shape and asymmetry
- eyes, nose, lips proportions
- skin tone and natural texture
- hair color, length, and structure

STRICT:
- no beautification
- no smoothing
- no plastic skin
- no stylization of identity

Faces must remain clearly recognizable.

POSE (SECOND PRIORITY):
- copy pose EXACTLY from image3
- match body positions precisely
- match interaction and gesture
- match distance between subjects
- match camera angle
- match framing and crop

No pose deviation allowed.

BACKGROUND:
- use spatial structure from image3
- keep environment consistent
- remove all people from background

STYLE APPLICATION (CONTROLLED — DO NOT OVERRIDE IDENTITY):
Apply style AFTER identity and pose are preserved.

`;

    if (selectedStyle === "zootopia") {
      prompt += `IF selectedStyle is "zootopia":
Apply clean Disney/Pixar-inspired animation style:

- soft stylization ONLY (do not distort faces)
- slightly enlarged expressive eyes
- smooth geometry
- soft global illumination
- vibrant but balanced colors

IMPORTANT:
- keep facial identity recognizable
- avoid over-cartoon distortion`;
    } else if (selectedStyle === "euphoria") {
      prompt += `IF selectedStyle is "euphoria":
Apply cinematic realism:

- natural skin texture with visible pores
- NO plastic or glossy skin
- moody lighting (warm / pink / purple tones)
- soft shadows
- shallow depth of field
- subtle film grain

IMPORTANT:
- realism must dominate
- avoid AI-generated beauty look`;
    } else if (selectedStyle === "titanic") {
      prompt += `IF selectedStyle is "titanic":
Apply cinematic realistic film look:

- natural skin texture (no smoothing)
- golden hour OR cold dramatic lighting
- soft atmospheric glow
- realistic shadows and highlights

IMPORTANT:
- must look like real photographed scene
- no CGI appearance`;
    }

    prompt += `

STYLE PRIORITY RULE:
If there is any conflict:
- keep identity
- keep pose
- apply style gently

CONSISTENCY RULE:
All images within the same selectedStyle must:
- share similar lighting behavior
- share similar color grading
- feel like part of the same visual world

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`;

    console.log("Running QWEN with prompt:", prompt);

    const output = await replicate.run(
      "qwen/qwen-image-edit-plus",
      {
        input: {
          prompt: prompt,
          image: [person1DataURL, person2DataURL, styleBoardDataURL]
        }
      }
    );

    console.log("QWEN raw output:", JSON.stringify(output, null, 2));

    let imageUrl: string | null = null;
    let firstItem = Array.isArray(output) ? output[0] : output;

    if (typeof firstItem === 'string') {
      imageUrl = firstItem;
    } else if (firstItem && typeof firstItem === 'object') {
      if (typeof firstItem.url === 'function') {
        imageUrl = await firstItem.url();
      } else if (typeof firstItem.url === 'string') {
        imageUrl = firstItem.url;
      } else if (firstItem.toString && firstItem.toString() !== '[object Object]') {
        imageUrl = firstItem.toString();
      }
    }

    console.log("Parsed imageUrl:", imageUrl);

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      console.error("Invalid imageUrl after parsing:", imageUrl);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid generation output",
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
          error: "Invalid generation output",
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
