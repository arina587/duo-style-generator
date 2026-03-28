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
    const selectedReference = formData.get("selectedReference") as string;

    console.log("Extracted values:", {
      person1: person1 ? `File (${(person1 as File).name}, ${(person1 as File).size} bytes)` : "MISSING",
      person2: person2 ? `File (${(person2 as File).name}, ${(person2 as File).size} bytes)` : "MISSING",
      styleBoard: styleBoard ? `File (${(styleBoard as File).name}, ${(styleBoard as File).size} bytes)` : "MISSING",
      selectedStyle: selectedStyle || "MISSING",
      selectedReference: selectedReference || "MISSING"
    });

    console.log("Validation check:", {
      person1Present: !!person1,
      person2Present: !!person2,
      styleBoardPresent: !!styleBoard,
      selectedStylePresent: !!selectedStyle,
      selectedReferencePresent: !!selectedReference
    });

    if (!person1 || !person2 || !styleBoard || !selectedStyle || !selectedReference) {
      const missing = [];
      if (!person1) missing.push("person1");
      if (!person2) missing.push("person2");
      if (!styleBoard) missing.push("styleBoard");
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
            styleBoard: !!styleBoard,
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
    const styleBoardDataURL = await fileToDataURL(styleBoard as File);
    console.log("Files converted successfully");

    const replicate = new Replicate({
      auth: replicateToken,
      useFileOutput: false,
    });

    console.log("=== PROMPT MAP GENERATION ===");
    console.log("STYLE:", selectedStyle);
    console.log("REFERENCE:", selectedReference);

    // Define all prompts in a strict map structure
    const promptMap: Record<string, Record<string, string>> = {
      zootopia: {
        ref1: `Create a premium Disney/Pixar-style 3D animated image using two uploaded people.

IDENTITY:
Preserve both faces recognizable and consistent.

STYLE (LOCKED):
- high-end Pixar animation
- smooth geometry
- expressive eyes
- soft global illumination
- clean materials
- vibrant controlled colors

SCENE (VERY STRICT — CAMERA-DRIVEN SELFIE):

- the GIRL is holding the camera with her arm extended forward
- the camera is the viewpoint → image must look like taken from her hand
- the frame is slightly wide-angle selfie perspective

POSE:
- both faces VERY close together
- cheek-to-cheek contact
- heads touching
- both looking directly into the camera
- tight framing

COMPOSITION:
- selfie framing
- slight perspective distortion from near camera
- girl's arm partially visible

LIGHT:
- soft clean lighting

BACKGROUND:
- minimal, clean

RULE:
- exactly two characters
- no animals
- no extra people

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref2: `Create a premium Disney/Pixar-style 3D animated image using two uploaded people.

IDENTITY:
Preserve both faces exactly.

STYLE (LOCKED):
- Pixar-level 3D rendering
- smooth geometry
- expressive eyes
- soft lighting
- clean materials

SCENE (DUAL SELFIE — VERY IMPORTANT):

- BOTH characters are holding the camera together (shared selfie moment)
- camera is in front of them → viewpoint from that camera

POSE:
- girl slightly closer to camera
- girl wrapping one arm around the guy (side hug)
- guy leaning slightly toward her
- heads angled inward
- both looking into camera

COMPOSITION:
- selfie framing
- upper torso visible
- slight asymmetry
- camera perspective visible

LIGHT:
- soft balanced lighting

BACKGROUND:
- minimal

RULE:
- exactly two characters
- no animals
- no extra people

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref3: `Create a premium Disney/Pixar-style 3D animated image using two uploaded people.

IDENTITY:
Preserve faces clearly.

STYLE (LOCKED):
- Pixar 3D animation
- smooth geometry
- expressive eyes
- cinematic lighting

SCENE (CARRY SELFIE — VERY STRICT):

- the MAN is holding the GIRL in his arms (full lift)
- the MAN is also holding the camera → selfie perspective
- camera viewpoint comes from his extended arm

POSE:
- girl lifted in his arms (not standing)
- her body angled slightly upward
- their faces close together
- both looking toward camera
- dynamic but controlled pose

COMPOSITION:
- selfie angle
- slightly tilted framing
- upper bodies visible

LIGHT:
- clean soft lighting

BACKGROUND:
- simple, no people

RULE:
- exactly two characters
- no animals
- no extra people

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`
      },

      titanic: {
        ref1: `Create an ultra-realistic cinematic image using two uploaded people.

IDENTITY:
Preserve exact real faces with natural texture.

STYLE (LOCKED — 1990s FILM):
- 35mm film look
- soft grain
- warm analog tones
- no digital sharpness
- no glossy skin

SCENE (ICONIC SHIP — EXACT):

POSE:
- woman stands at front
- arms fully extended horizontally (perfect straight line)
- chest open, chin slightly raised
- wind pushing hair backward

- man stands directly behind her
- his chest aligned with her back
- both hands placed on her waist
- close physical contact

COMPOSITION:
- camera in front of them
- medium-wide framing
- both bodies visible from waist up
- horizon line centered

LIGHT:
- golden sunset
- strong backlight
- warm rim light

BACKGROUND:
- ocean horizon
- ship railing visible
- no people

RULE:
- exactly two people
- no crowd

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref2: `Create an ultra-realistic cinematic image using two uploaded people.

IDENTITY:
Preserve faces with wet skin realism.

STYLE (LOCKED — 1990s FILM):
- cold blue tones
- film grain
- natural lighting
- no digital look

SCENE (WATER — VERY PRECISE):

POSE:
- both floating in water
- water level around shoulders

- woman positioned slightly higher
- leaning down toward the man
- her hand holding or touching his arm

- man lower in frame
- partially submerged
- looking up at her

COMPOSITION:
- tight framing
- faces close
- water visible in foreground

LIGHT:
- cold dim blue light
- reflections on water

BACKGROUND:
- dark open ocean only
- no objects
- no people

RULE:
- exactly two people

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref3: `Create an ultra-realistic cinematic image using two uploaded people.

IDENTITY:
Keep faces natural and recognizable.

STYLE (LOCKED — 1990s FILM):
- warm analog tones
- film grain
- soft lens bloom
- cinematic depth

SCENE (INTIMATE CLOSE — EXACT):

POSE:
- bodies extremely close
- woman leaning slightly backward
- man leaning forward toward her

- faces almost touching (near kiss distance)
- man's hand placed around her waist
- emotional tension in posture

COMPOSITION:
- medium close-up
- shallow depth of field
- focus on faces

LIGHT:
- warm soft light
- subtle shadows
- romantic tone

BACKGROUND:
- blurred ship environment
- no people

RULE:
- exactly two people

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`
      },

      euphoria: {
        ref1: `Generate an image from two identity references (image1 and image2) matching the pose from a third reference image.

IDENTITY (STRICT — DO NOT CHANGE):
Preserve both people exactly as in the photos:
- face shape, proportions, asymmetry
- eyes, nose, lips
- natural skin texture (no smoothing, no beautification)
- hair color and hairstyle

Faces must remain fully recognizable.

CHARACTER RULES (CRITICAL):
- EXACTLY TWO PEOPLE
- NO third person
- NO background people
- NO silhouettes
- NO animals

STYLE (LOCKED):
Ultra-realistic cinematic TV drama:
- natural skin texture with visible pores
- NO plastic or glossy skin
- moody lighting (warm / pink / purple tones)
- soft shadows
- shallow depth of field
- subtle film grain

POSE:
- copy pose EXACTLY from reference image
- match body positions precisely
- match interaction and gesture
- match distance between subjects
- match camera angle

BACKGROUND:
- use spatial structure from reference
- keep environment consistent
- remove all people from background

FINAL OUTPUT:
- match scene EXACTLY
- preserve identity and pose
- 4K quality
- no text, no logos, no artifacts

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref2: `Generate an image from two identity references (image1 and image2) matching the pose from a third reference image.

IDENTITY (STRICT — DO NOT CHANGE):
Preserve both people exactly as in the photos:
- face shape, proportions, asymmetry
- eyes, nose, lips
- natural skin texture (no smoothing, no beautification)
- hair color and hairstyle

Faces must remain fully recognizable.

CHARACTER RULES (CRITICAL):
- EXACTLY TWO PEOPLE
- NO third person
- NO background people
- NO silhouettes
- NO animals

STYLE (LOCKED):
Ultra-realistic cinematic TV drama:
- natural skin texture with visible pores
- NO plastic or glossy skin
- moody lighting (warm / pink / purple tones)
- soft shadows
- shallow depth of field
- subtle film grain

POSE:
- copy pose EXACTLY from reference image
- match body positions precisely
- match interaction and gesture
- match distance between subjects
- match camera angle

BACKGROUND:
- use spatial structure from reference
- keep environment consistent
- remove all people from background

FINAL OUTPUT:
- match scene EXACTLY
- preserve identity and pose
- 4K quality
- no text, no logos, no artifacts

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref3: `Generate an image from two identity references (image1 and image2) matching the pose from a third reference image.

IDENTITY (STRICT — DO NOT CHANGE):
Preserve both people exactly as in the photos:
- face shape, proportions, asymmetry
- eyes, nose, lips
- natural skin texture (no smoothing, no beautification)
- hair color and hairstyle

Faces must remain fully recognizable.

CHARACTER RULES (CRITICAL):
- EXACTLY TWO PEOPLE
- NO third person
- NO background people
- NO silhouettes
- NO animals

STYLE (LOCKED):
Ultra-realistic cinematic TV drama:
- natural skin texture with visible pores
- NO plastic or glossy skin
- moody lighting (warm / pink / purple tones)
- soft shadows
- shallow depth of field
- subtle film grain

POSE:
- copy pose EXACTLY from reference image
- match body positions precisely
- match interaction and gesture
- match distance between subjects
- match camera angle

BACKGROUND:
- use spatial structure from reference
- keep environment consistent
- remove all people from background

FINAL OUTPUT:
- match scene EXACTLY
- preserve identity and pose
- 4K quality
- no text, no logos, no artifacts

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`
      }
    };

    // Get the EXACT prompt for this style + reference combination
    const prompt = promptMap[selectedStyle]?.[selectedReference];

    if (!prompt) {
      console.error("No prompt found for:", { selectedStyle, selectedReference });
      return new Response(
        JSON.stringify({
          error: "Invalid style/reference combination",
          details: `No prompt defined for ${selectedStyle}/${selectedReference}`
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

    console.log("PROMPT USED (first 200 chars):", prompt.substring(0, 200));
    console.log("Running QWEN with single isolated prompt");

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
