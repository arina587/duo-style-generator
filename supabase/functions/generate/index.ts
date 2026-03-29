import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Replicate from "npm:replicate";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Category-level style definitions (STYLE ONLY)
const styleDefinitions: Record<string, string> = {
  zootopia: `STYLE (LOCKED):
Zootopia-style 3D cartoon.
Non-photorealistic.
Large expressive eyes.
Smooth simplified faces.
No skin texture.
Soft clean cartoon lighting.

IMPORTANT:
Style must stay identical for all references.`,

  titanic: `STYLE:
1996 cinematic film aesthetic.
Shot on 35mm film.
Natural skin texture.
Realistic materials.
Period-appropriate styling.
Golden hour lighting.`,

  euphoria: `STYLE:
Modern TV drama cinematography.
Ultra-realistic.
Natural skin with pores visible.
Moody atmospheric lighting.
Pink/purple/amber tones.
Shallow depth of field.`
};

// Reference-level scene definitions (POSE/COMPOSITION/CAMERA ONLY)
const sceneDefinitions: Record<string, Record<string, string>> = {
  zootopia: {
    ref1: `SCENE:
Clean symmetric selfie.
Girl holds phone.
Both faces centered.
Same distance to camera.
Cheeks touching.
Minimal clean background.`,

    ref2: `SCENE:
Close asymmetric selfie.
Girl pushes into man from side.
Faces overlap.
One face closer to camera.
Off-center framing.
Soft blurred background.`,

    ref3: `SCENE:
Dynamic selfie.
Man holding girl in arms.
Man taking selfie with extended arm.
Upper bodies visible.
Girl higher than man.
Slight camera tilt.
Simple blurred party background with colored lights.`
  },

  titanic: {
    ref1: `SCENE:
Person A in front with arms extended horizontally.
Person B behind holding person A's waist.
Side camera angle.
Ship bow visible.
Ocean in background.
Period 1912 clothing.`,

    ref2: `SCENE:
Both in water.
Close intimate distance.
Person A leaning down toward person B.
Tight framing on faces.
Dark environment.
Wet clothing.`,

    ref3: `SCENE:
Faces very close, near-kiss distance.
Intimate tension.
Close-up framing.
Shallow depth of field.
Period formal wear.`
  },

  euphoria: {
    ref1: `SCENE:
Match pose from reference image exactly.
Match camera angle and framing.
Natural authentic expressions.`,

    ref2: `SCENE:
Match pose from reference image exactly.
Match camera angle and framing.
Natural authentic expressions.`,

    ref3: `SCENE:
Match pose from reference image exactly.
Match camera angle and framing.
Natural authentic expressions.`
  }
};

// Prompt builder function
function buildPrompt(style: string, reference: string): string {
  const styleDef = styleDefinitions[style];
  const sceneDef = sceneDefinitions[style]?.[reference];

  if (!styleDef || !sceneDef) {
    throw new Error(`Invalid style or reference: ${style}/${reference}`);
  }

  return `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features:
face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces.
Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

${styleDef}

${sceneDef}

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`;
}

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
    const selectedStyle = formData.get("selectedStyle") as string;
    const selectedReference = formData.get("selectedReference") as string;

    console.log("Extracted values:", {
      person1: person1 ? `File (${(person1 as File).name}, ${(person1 as File).size} bytes)` : "MISSING",
      person2: person2 ? `File (${(person2 as File).name}, ${(person2 as File).size} bytes)` : "MISSING",
      selectedStyle: selectedStyle || "MISSING",
      selectedReference: selectedReference || "MISSING"
    });

    if (!person1 || !person2 || !selectedStyle || !selectedReference) {
      const missing = [];
      if (!person1) missing.push("person1");
      if (!person2) missing.push("person2");
      if (!selectedStyle) missing.push("selectedStyle");
      if (!selectedReference) missing.push("selectedReference");

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
            selectedStyle: !!selectedStyle,
            selectedReference: !!selectedReference
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

    if (!["ref1", "ref2", "ref3"].includes(selectedReference)) {
      console.error("Invalid selectedReference:", selectedReference);
      return new Response(
        JSON.stringify({
          error: "Invalid reference",
          details: `selectedReference must be one of: ref1, ref2, ref3. Received: ${selectedReference}`
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
    console.log("Files converted successfully");

    const replicate = new Replicate({
      auth: replicateToken,
      useFileOutput: false,
    });

    console.log("=== PROMPT GENERATION ===");
    console.log("STYLE:", selectedStyle);
    console.log("REFERENCE:", selectedReference);

    // Build the final prompt using the builder function
    const prompt = buildPrompt(selectedStyle, selectedReference);

    console.log("PROMPT STRUCTURE:");
    console.log("- Style category:", selectedStyle);
    console.log("- Scene reference:", selectedReference);
    console.log("- Total prompt length:", prompt.length);
    console.log("- First 300 chars:", prompt.substring(0, 300));

    const payload = {
      input: {
        prompt: prompt,
        image: [person1DataURL, person2DataURL]
      }
    };

    console.log("=== FINAL PAYLOAD DEBUG ===");
    console.log("IMAGE COUNT:", payload.input.image.length);
    console.log("FINAL PROMPT (first 300 chars):", payload.input.prompt.substring(0, 300));

    console.log("Running QWEN with structured prompt (2 identity images only)");

    const output = await replicate.run(
      "qwen/qwen-image-edit-plus",
      payload
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
