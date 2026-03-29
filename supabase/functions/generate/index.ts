import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Replicate from "npm:replicate";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Complete prompt map: one full prompt per reference
const promptMap: Record<string, Record<string, string>> = {
  zootopia: {
    ref1: `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features: face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces. Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

STYLE (LOCKED):
Zootopia-style 3D cartoon.
Non-photorealistic.
Large expressive eyes.
Smooth simplified faces.
No skin texture.
Soft clean cartoon lighting.
Style must stay identical for all references.

SCENE:
Clean symmetric selfie.
Girl holds phone.
Both faces centered.
Same distance to camera.
Cheeks touching.
Minimal clean background.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`,

    ref2: `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features: face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces. Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

STYLE (LOCKED):
Zootopia-style 3D cartoon.
Non-photorealistic.
Large expressive eyes.
Smooth simplified faces.
No skin texture.
Soft clean cartoon lighting.
Style must stay identical for all references.

SCENE:
Close asymmetric selfie.
Girl pushes into man from side.
Faces overlap.
One face closer to camera.
Off-center framing.
Soft blurred background.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`,

    ref3: `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features: face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces. Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

STYLE (LOCKED):
Zootopia-style 3D cartoon.
Non-photorealistic.
Large expressive eyes.
Smooth simplified faces.
No skin texture.
Soft clean cartoon lighting.
Style must stay identical for all references.

SCENE:
Dynamic selfie.
Man holding girl in arms.
Man taking selfie with extended arm.
Upper bodies visible.
Girl higher than man.
Slight camera tilt.
Simple blurred party background with colored lights.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`
  },

  titanic: {
    ref1: `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features: face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces. Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

STYLE:
1996 cinematic film aesthetic.
Shot on 35mm film.
Natural skin texture.
Realistic materials.
Period-appropriate styling.
Golden hour lighting.

SCENE:
Person A in front with arms extended horizontally.
Person B behind holding person A's waist.
Side camera angle.
Ship bow visible.
Ocean in background.
Period 1912 clothing.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`,

    ref2: `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features: face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces. Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

STYLE:
1996 cinematic film aesthetic.
Shot on 35mm film.
Natural skin texture.
Realistic materials.
Period-appropriate styling.
Golden hour lighting.

SCENE:
Both in water.
Close intimate distance.
Person A leaning down toward person B.
Tight framing on faces.
Dark environment.
Wet clothing.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`,

    ref3: `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features: face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces. Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

STYLE:
1996 cinematic film aesthetic.
Shot on 35mm film.
Natural skin texture.
Realistic materials.
Period-appropriate styling.
Golden hour lighting.

SCENE:
Faces very close, near-kiss distance.
Intimate tension.
Close-up framing.
Shallow depth of field.
Period formal wear.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`
  },

  euphoria: {
    ref1: `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features: face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces. Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

STYLE:
Modern TV drama cinematography.
Ultra-realistic.
Natural skin with pores visible.
Moody atmospheric lighting.
Pink/purple/amber tones.
Shallow depth of field.

SCENE:
Match pose from reference image exactly.
Match camera angle and framing.
Natural authentic expressions.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`,

    ref2: `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features: face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces. Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

STYLE:
Modern TV drama cinematography.
Ultra-realistic.
Natural skin with pores visible.
Moody atmospheric lighting.
Pink/purple/amber tones.
Shallow depth of field.

SCENE:
Match pose from reference image exactly.
Match camera angle and framing.
Natural authentic expressions.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`,

    ref3: `IDENTITY:
Use two uploaded images as identity reference.
These are TWO DIFFERENT PEOPLE.
Preserve recognizable facial features: face shape, eyes, nose, lips, hair, accessories.
Do NOT merge faces. Do NOT create a third face.

CRITICAL RULE:
Exactly TWO people in the image.
No background people.
No extra characters.

STYLE:
Modern TV drama cinematography.
Ultra-realistic.
Natural skin with pores visible.
Moody atmospheric lighting.
Pink/purple/amber tones.
Shallow depth of field.

SCENE:
Match pose from reference image exactly.
Match camera angle and framing.
Natural authentic expressions.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)
- Both people must look at the camera`
  }
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

    console.log("=== PROMPT SELECTION ===");
    console.log("STYLE:", selectedStyle);
    console.log("REFERENCE:", selectedReference);

    // Direct prompt selection from promptMap
    const prompt = promptMap[selectedStyle][selectedReference];

    if (!prompt) {
      throw new Error(`No prompt found for ${selectedStyle}/${selectedReference}`);
    }

    console.log("PROMPT DETAILS:");
    console.log("- Style category:", selectedStyle);
    console.log("- Scene reference:", selectedReference);
    console.log("- Prompt length:", prompt.length);
    console.log("- Preview:", prompt.substring(0, 200));

    const payload = {
      input: {
        prompt: prompt,
        image: [person1DataURL, person2DataURL]
      }
    };

    console.log("=== FINAL PAYLOAD ===");
    console.log("MODEL: qwen/qwen-image-edit-2511");
    console.log("IMAGE COUNT:", payload.input.image.length);
    console.log("PROMPT PREVIEW:", payload.input.prompt.substring(0, 200));

    const output = await replicate.run(
      "qwen/qwen-image-edit-2511",
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
