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
        ref1: `Create a Disney Zootopia-style 3D animated image using two uploaded people.

IDENTITY (STRICT):
- preserve exact facial structure
- preserve beard, piercings, unique features
- preserve face proportions
- DO NOT beautify
- DO NOT change identity

EYES (CRITICAL):
- both characters must look directly into the camera
- eyes must be perfectly aligned
- no cross-eye, no lazy eye, no asymmetry

STYLE (ZOOTOPIA SPECIFIC):
- anthropomorphic Zootopia-style adaptation
- stylized but grounded anatomy
- slightly enlarged eyes but natural alignment
- realistic fur-like shading but adapted from human skin
- cinematic Disney lighting (not generic 3D)

EMOTION:
- playful, happy, energetic
- natural smiling expressions

CAMERA (VERY IMPORTANT):
- BOTH characters holding the camera together
- camera is physically in their hands
- shot MUST feel taken from their hands (selfie POV)

POSE:
- cheek-to-cheek contact
- heads touching
- both leaning toward camera

CLOTHING:
- casual modern clothing
- girl: light fitted top, soft fabric, minimalistic style
- guy: casual t-shirt or hoodie, neutral colors

COMPOSITION:
- tight selfie framing
- slight wide-angle distortion

BACKGROUND:
- clean soft environment

RULE:
- exactly two characters
- no floating camera

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose, misaligned eyes`,

        ref2: `Create a Disney Zootopia-style 3D animated image using two uploaded people.

IDENTITY:
Preserve all unique features including beard, piercings.

EYES:
- both looking into camera
- perfectly aligned gaze

STYLE:
- Zootopia-style characters
- soft but realistic materials
- expressive but not exaggerated

EMOTION:
- warm, affectionate, calm happiness

CAMERA:
- ONLY the girl holds the camera
- camera clearly in her hand
- perspective must match her arm position

POSE:
- girl hugging the guy from the side
- guy slightly leaning toward her
- heads angled inward

CLOTHING:
- girl: soft pastel sweater or fitted top
- guy: casual jacket or hoodie layered over t-shirt

COMPOSITION:
- selfie framing
- upper torso visible

BACKGROUND:
- soft neutral background

RULE:
- exactly two characters
- no floating objects

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose, misaligned eyes`,

        ref3: `Create a Disney Zootopia-style 3D animated image using two uploaded people.

IDENTITY:
Keep all features (beard, piercings, hair).

EYES:
- both looking at camera
- no misalignment

STYLE:
- strong Zootopia look (anthropomorphic realism)
- cinematic animated lighting

EMOTION:
- joyful, dynamic, playful

CAMERA:
- MAN is holding the camera
- camera in his hand
- clear selfie POV from his arm

POSE:
- man holding girl in arms (full lift)
- girl slightly elevated
- bodies close together
- faces near each other

CLOTHING:
- girl: light casual outfit, fitted top + light pants
- guy: casual streetwear, t-shirt + jacket

COMPOSITION:
- dynamic selfie angle
- slight tilt

BACKGROUND:
- simple environment

RULE:
- exactly two characters

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose, misaligned eyes`
      },

      titanic: {
        ref1: `Create a cinematic 1990s film-style image using two uploaded people.

IDENTITY:
- preserve exact real faces
- preserve beard, piercings
- no smoothing

EYES:
- natural gaze alignment
- no distortion

STYLE (VERY IMPORTANT):
- shot like 1996 film on 35mm
- soft film grain
- warm Kodak tones
- no digital sharpness
- slight lens softness

EMOTION:
- freedom, exhilaration, romance

CAMERA (CRITICAL):
- side angle (NOT front)
- camera slightly to the side of subjects
- perspective matches Titanic reference

POSE:
- woman in front with arms fully extended
- man directly behind
- hands on her waist
- bodies aligned

LIGHT:
- golden sunset
- strong rim light

BACKGROUND:
- ship edge visible
- ocean

RULE:
- exactly two people

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose, misaligned eyes`,

        ref2: `Create a cinematic 1990s film-style image using two uploaded people.

IDENTITY:
Preserve full realism and features.

EYES:
- emotional gaze
- no misalignment

STYLE:
- cold blue film tone
- grain
- analog contrast

EMOTION:
- sadness, tension, intimacy

POSE:
- both in water
- woman slightly higher
- leaning toward man
- holding his arm

CAMERA:
- close shot
- slightly unstable handheld feeling

LIGHT:
- dim blue light
- reflections

BACKGROUND:
- dark ocean

RULE:
- exactly two people

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose, misaligned eyes`,

        ref3: `Create a cinematic 1990s film-style image using two uploaded people.

IDENTITY:
Keep faces realistic and detailed.

EYES:
- focused gaze
- aligned

STYLE:
- warm 90s film tone
- soft bloom
- grain

EMOTION:
- intense romantic tension

POSE:
- bodies very close
- near kiss distance
- hand on waist

CAMERA:
- close-up cinematic framing

LIGHT:
- warm soft light
- shadow contrast

BACKGROUND:
- blurred ship environment

RULE:
- exactly two people

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose, misaligned eyes`
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
