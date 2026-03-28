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

    // STEP 1: QWEN - Structure and Pose
    console.log("=== STEP 1: QWEN (Structure + Pose) ===");

    const qwenPrompt = `Create an image from three inputs:

- image1: first person
- image2: second person
- image3: pose reference

CORE RULE:
This is a strict reconstruction task.

SUBJECT RULE (ABSOLUTE):
The image must contain EXACTLY TWO people.
Remove ALL people from the reference.
DO NOT add any extra person.
DO NOT add animals.
DO NOT generate background characters, silhouettes, reflections.

If more than two people appear, the result is invalid.

IDENTITY:
Keep both people recognizable:
- preserve face structure, proportions, hair, skin tone
- no beautification

POSE (CRITICAL):
Copy pose EXACTLY from reference:
- match body positions precisely
- match distance and interaction
- match camera angle
- match framing and crop

BACKGROUND:
Recreate environment layout from reference, but keep it empty except for the two people.

NEGATIVE:
extra people, third person, animals, background figures, silhouettes, reflections, distorted anatomy`;

    console.log("Running QWEN with prompt:", qwenPrompt);

    const qwenOutput = await replicate.run(
      "qwen/qwen-image-edit-plus",
      {
        input: {
          prompt: qwenPrompt,
          image: [person1DataURL, person2DataURL, styleBoardDataURL]
        }
      }
    );

    console.log("QWEN raw output:", JSON.stringify(qwenOutput, null, 2));

    let intermediateUrl: string | null = null;
    let qwenFirstItem = Array.isArray(qwenOutput) ? qwenOutput[0] : qwenOutput;

    if (typeof qwenFirstItem === 'string') {
      intermediateUrl = qwenFirstItem;
    } else if (qwenFirstItem && typeof qwenFirstItem === 'object') {
      if (typeof qwenFirstItem.url === 'function') {
        intermediateUrl = await qwenFirstItem.url();
      } else if (typeof qwenFirstItem.url === 'string') {
        intermediateUrl = qwenFirstItem.url;
      } else if (qwenFirstItem.toString && qwenFirstItem.toString() !== '[object Object]') {
        intermediateUrl = qwenFirstItem.toString();
      }
    }

    if (!intermediateUrl || typeof intermediateUrl !== 'string' || !intermediateUrl.startsWith('http')) {
      console.error("Invalid QWEN output:", intermediateUrl);
      return new Response(
        JSON.stringify({
          success: false,
          error: "QWEN step failed",
          details: "No valid intermediate image was generated"
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

    console.log("QWEN intermediate image:", intermediateUrl);

    // STEP 2: FLUX - Style Lock
    console.log("=== STEP 2: FLUX (Style Lock + Realism) ===");

    let fluxPrompt = `Apply an extremely strong, recognizable cinematic or animation style.

STRICT RULE:
DO NOT change faces.
DO NOT change pose.
DO NOT add or remove people.
DO NOT add animals.
ONLY apply style, lighting, and rendering.

`;

    if (selectedStyle === "zootopia") {
      fluxPrompt += `STYLE LOCK (HARD):
Transform into a Disney/Pixar animated film frame.

- high-end 3D animation rendering
- smooth stylized geometry
- expressive eyes
- soft global illumination
- vibrant clean colors
- polished animation materials

CRITICAL:
Must clearly look like a Disney animated movie.
Must NOT look like generic 3D.
Must NOT look realistic.`;
    } else if (selectedStyle === "euphoria") {
      fluxPrompt += `STYLE LOCK (HARD):
Ultra-realistic cinematic TV drama frame.

- strong color grading (pink, purple, warm tones)
- moody lighting
- soft shadows
- shallow depth of field
- subtle film grain

REALISM LOCK:
- real skin texture (pores visible)
- NO plastic skin
- NO beauty retouch
- NO glossy CGI look

CRITICAL:
Must look like a real filmed scene.`;
    } else if (selectedStyle === "titanic") {
      fluxPrompt += `STYLE LOCK (HARD):
Ultra-realistic cinematic epic romance.

- golden hour sunlight OR cold dramatic tones
- strong directional lighting
- film-grade color grading
- atmospheric depth

REALISM LOCK:
- natural skin texture
- no smoothing
- no AI look
- realistic lighting on faces and clothes

CRITICAL:
Must look like a real movie frame.`;
    }

    fluxPrompt += `

GLOBAL NEGATIVE:
extra people, third person, crowd, animals, pets, background characters, silhouettes, reflections of people, duplicated faces, plastic skin, CGI look, beauty retouch, wrong pose, incorrect composition`;

    console.log("Running FLUX with prompt:", fluxPrompt);

    const fluxOutput = await replicate.run(
      "black-forest-labs/flux-2-pro",
      {
        input: {
          prompt: fluxPrompt,
          image: intermediateUrl,
          prompt_strength: 0.85,
          num_outputs: 1,
          output_format: "jpg",
          output_quality: 90
        }
      }
    );

    console.log("FLUX raw output:", JSON.stringify(fluxOutput, null, 2));

    let imageUrl: string | null = null;
    let fluxFirstItem = Array.isArray(fluxOutput) ? fluxOutput[0] : fluxOutput;

    if (typeof fluxFirstItem === 'string') {
      imageUrl = fluxFirstItem;
    } else if (fluxFirstItem && typeof fluxFirstItem === 'object') {
      if (typeof fluxFirstItem.url === 'function') {
        imageUrl = await fluxFirstItem.url();
      } else if (typeof fluxFirstItem.url === 'string') {
        imageUrl = fluxFirstItem.url;
      } else if (fluxFirstItem.toString && fluxFirstItem.toString() !== '[object Object]') {
        imageUrl = fluxFirstItem.toString();
      }
    }

    console.log("Parsed final imageUrl:", imageUrl);

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      console.error("Invalid imageUrl after parsing:", imageUrl);
      return new Response(
        JSON.stringify({
          success: false,
          error: "FLUX step failed",
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
          error: "Invalid FLUX output",
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
