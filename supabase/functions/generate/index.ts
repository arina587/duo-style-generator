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
    ref1: `Create a stylized 3D cartoon image of two people based on uploaded photos.

Keep both people recognizable.
Do not merge faces.
Exactly two people only. No other people.

Style:
Zootopia-style 3D animated cartoon.
Non-photorealistic.
Large expressive eyes.
Smooth simplified faces.
No realistic skin texture.
Soft clean lighting.

Scene:
Natural close selfie perspective.
Camera is the viewpoint but NOT visible in frame.
No phone visible.

Both faces aligned at the same height.
Cheeks touching.
Centered symmetric framing.
Both looking directly into camera.

Eyes must look natural and lively.
No glassy or empty eyes.

Background:
Simple clean neutral background.`,

    ref2: `Create a stylized 3D cartoon image of two people based on uploaded photos.

Keep both people recognizable.
Do not merge faces.
Exactly two people only. No other people.

Style:
Zootopia-style 3D animated cartoon.
Non-photorealistic.
Large expressive eyes.
Smooth simplified faces.
No realistic skin texture.
Soft clean lighting.

Scene:
Close selfie with asymmetry.
Girl pushes her face into the man from the side.
Girl closer to camera.
Faces slightly overlapping.
Heads not aligned.
Man leaning slightly away.
Off-center framing.
Camera very close.

Background:
Soft blurred neutral background.`,

    ref3: `Create a stylized 3D cartoon image of two people based on uploaded photos.

Keep both people recognizable.
Do not merge faces.
Exactly two people only. No other people.

Style:
Zootopia-style 3D animated cartoon.
Non-photorealistic.
Large expressive eyes.
Smooth simplified faces.
No realistic skin texture.
Soft clean lighting.

Scene:
Dynamic selfie.
Man holding the girl in his arms.
Man taking the selfie with one extended arm.
Girl lifted higher than man.
Upper bodies and arms clearly visible.
Not a close-up.
Camera slightly tilted.
Wider framing.

Background:
Simple soft party lighting (pink, purple, blue), blurred.`
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
Girl standing at the front of the ship.
Arms extended wide.
Body facing the ocean.

Man standing directly behind her.
Holding her at the waist.

They are NOT looking at the camera.
Both looking forward toward the horizon.

Camera in front.
Medium-wide framing (slightly further away).

Wind blowing hair and clothes.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)`,

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
Night ocean survival scene.

Girl lying on her stomach on a floating wooden plank.
Her body stretched along the plank.
Chest and arms resting on the plank.
Lower body partially in the water.

Man in the water next to the plank.
His body mostly submerged.

He is NOT climbing onto the plank.
He is only holding onto the edge with one arm.

His upper body slightly leaning against the plank.
Head and shoulders above water.

He looks up toward the girl.
The girl looks down toward him.

Faces close but clearly separated.

Camera slightly above water level.
Medium distance (not close-up).

Water surface clearly visible with small waves.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)`,

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
Romantic moment at the edge of the ship.

Both characters standing upright at the railing.
Their bodies facing forward (frontally aligned).

They do NOT turn their bodies toward each other.

Only their heads are turned toward each other.

Man standing directly behind the girl.
Arms wrapped around her waist.

Girl leaning slightly back into him.

Their faces extremely close.
Almost touching lips (near kiss).

Camera medium shot.
Upper bodies clearly visible.

Background:
Ship railing clearly visible.
Open ocean behind them.
Warm sunset sky.

GLOBAL RULES:
- Only TWO people allowed
- No third person anywhere
- No background faces
- No silhouettes of people
- Eyes must be straight and natural (no cross-eye)`
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
