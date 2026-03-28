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
        ref1: `Generate an image from two identity references (image1 and image2).

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
High-end Disney/Pixar 3D animation:
- smooth polished geometry
- expressive slightly enlarged eyes
- soft rounded facial features
- clean materials
- soft global illumination
- cinematic animation lighting
- vibrant but controlled colors

SCENE 1 (clean selfie portrait):
Two characters very close together, facing camera.

POSE:
- heads aligned horizontally
- shoulders slightly touching
- both looking directly at camera

COMPOSITION:
- tight shoulder-up framing
- centered

LIGHTING:
- soft studio lighting
- minimal shadows

BACKGROUND:
- clean minimal gradient

FINAL OUTPUT:
- match scene EXACTLY
- preserve identity and pose
- 4K quality
- no text, no logos, no artifacts

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref2: `Generate an image from two identity references (image1 and image2).

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
High-end Disney/Pixar 3D animation:
- smooth polished geometry
- expressive slightly enlarged eyes
- soft rounded facial features
- clean materials
- soft global illumination
- cinematic animation lighting
- vibrant but controlled colors

SCENE 2 (friendly interaction):
Two characters standing close together.

POSE:
- one slightly leaning toward the other
- heads slightly angled inward
- relaxed expressions

COMPOSITION:
- medium close-up
- slight asymmetry

LIGHTING:
- soft balanced lighting
- gentle shadows

BACKGROUND:
- minimal soft gradient

FINAL OUTPUT:
- match scene EXACTLY
- preserve identity and pose
- 4K quality
- no text, no logos, no artifacts

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref3: `Generate an image from two identity references (image1 and image2).

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
High-end Disney/Pixar 3D animation:
- smooth polished geometry
- expressive slightly enlarged eyes
- soft rounded facial features
- clean materials
- soft global illumination
- cinematic animation lighting
- vibrant but controlled colors

SCENE 3 (club selfie):
Two characters taking a selfie.

POSE:
- one holding camera with arm extended forward
- camera slightly above eye level
- both leaning inward
- heads very close

COMPOSITION:
- close selfie framing
- slight perspective distortion

LIGHTING:
- purple and pink neon lighting
- soft glow on faces

BACKGROUND:
- blurred nightclub
- NO people

FINAL OUTPUT:
- match scene EXACTLY
- preserve identity and pose
- 4K quality
- no text, no logos, no artifacts

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`
      },

      titanic: {
        ref1: `Generate an image from two identity references (image1 and image2).

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
Ultra-realistic cinematic film still:
- shot on 50mm lens
- shallow depth of field
- natural skin texture (NO plastic look)
- cinematic lighting
- film grain
- high dynamic range

SCENE 1 (ship bow iconic):

POSE:
- woman in front, arms fully extended horizontally
- head slightly raised, eyes closed
- wind in hair

- man directly behind her
- hands on her waist
- close body contact

COMPOSITION:
- medium-wide shot
- ship rail visible

LIGHTING:
- warm golden sunset
- strong backlight

BACKGROUND:
- ocean horizon

FINAL OUTPUT:
- match scene EXACTLY
- preserve identity and pose
- 4K quality
- no text, no logos, no artifacts

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref2: `Generate an image from two identity references (image1 and image2).

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
Ultra-realistic cinematic film still:
- shot on 50mm lens
- shallow depth of field
- natural skin texture (NO plastic look)
- cinematic lighting
- film grain
- high dynamic range

SCENE 2 (water scene):

POSE:
- both in water
- woman slightly above, leaning toward man
- holding his hand near her face

- man partially submerged
- looking at her

COMPOSITION:
- tight cinematic shot

LIGHTING:
- cold blue lighting
- reflections on water

BACKGROUND:
- dark ocean

FINAL OUTPUT:
- match scene EXACTLY
- preserve identity and pose
- 4K quality
- no text, no logos, no artifacts

NEGATIVE:
extra people, third person, animals, crowd, background figures, distorted faces, merged faces, bad anatomy, plastic skin, over-smoothing, CGI look, incorrect pose`,

        ref3: `Generate an image from two identity references (image1 and image2).

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
Ultra-realistic cinematic film still:
- shot on 50mm lens
- shallow depth of field
- natural skin texture (NO plastic look)
- cinematic lighting
- film grain
- high dynamic range

SCENE 3 (intimate close moment):

POSE:
- bodies very close
- woman slightly leaning back
- man leaning toward her
- faces almost touching

COMPOSITION:
- medium close-up
- shallow depth of field

LIGHTING:
- warm cinematic tones
- soft shadows

BACKGROUND:
- blurred ship environment

FINAL OUTPUT:
- match scene EXACTLY
- preserve identity and pose
- 4K quality
- no text, no logos, no artifacts

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
