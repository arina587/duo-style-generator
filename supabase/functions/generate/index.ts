import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Replicate from "npm:replicate";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Category-level style definitions (STYLE ONLY)
const styleDefinitions: Record<string, { style: string; lighting: string; background: string }> = {
  zootopia: {
    style: `STYLE (LOCKED — ZOOTOPIA CARTOON):
- stylized 3D animated cartoon look matching Zootopia (2016 film)
- CLEARLY NON-PHOTOREALISTIC
- cartoon stylization (NOT realistic humans)
- exaggerated cartoon proportions
- large expressive cartoon eyes with simplified iris
- simplified facial structure with soft rounded shapes
- smooth cartoon surfaces (NO real skin texture, NO pores)
- slightly plastic/stylized material quality
- cartoon character rendering (NOT PBR realism)
- output MUST look like an animated movie frame

SHADING:
- soft cartoon shading
- simplified lighting model
- gentle toon-like gradients
- slightly plastic appearance
- NO photorealistic skin rendering
- NO detailed subsurface scattering

RENDERING (CRITICAL):
- cartoon stylization has HIGHEST PRIORITY
- NOT cinematic realism
- NOT semi-realistic
- NOT photorealistic
- simplified cartoon materials only

LIGHTING:
- soft, even, bright cartoon lighting
- minimal shadows
- no dramatic or cinematic lighting
- flat, friendly illumination

COLOR:
- vibrant cartoon color palette
- clean saturated colors
- warm friendly tones
- no photorealistic color grading

IMPORTANT:
- style MUST remain identical across all three references
- only the scene/pose/lighting changes between references
- output must be clearly cartoon, not realistic`,
    lighting: `LIGHTING (DEFAULT):
- soft bright cartoon lighting
- even illumination
- minimal shadows
- friendly warm tone`,
    background: `BACKGROUND (DEFAULT):
- simple cartoon environment
- soft neutral backdrop
- no distracting elements`
  },

  titanic: {
    style: `STYLE (TITANIC - 1990s FILM):
- cinematic 1996 film aesthetic
- shot on 35mm film stock
- soft film grain texture
- analog color grading (Kodak tone curves)
- slight lens softness (not digital sharp)
- natural skin texture with pores visible
- realistic fabric and material rendering
- period-appropriate styling`,
    lighting: `LIGHTING:
- natural light sources only
- golden hour warm tones OR cool blue ocean light
- strong directional light with soft shadows
- atmospheric depth and haze
- rim lighting for separation`,
    background: `BACKGROUND:
- realistic ship deck or ocean environment
- atmospheric perspective
- period-accurate details
- cinematic depth of field`
  },

  euphoria: {
    style: `STYLE (EUPHORIA - TV DRAMA):
- ultra-realistic modern cinematography
- high-end TV drama quality
- natural skin texture with visible pores and imperfections
- NO plastic or glossy skin
- NO artificial smoothing or beautification
- realistic fabric textures and materials
- shallow depth of field for cinematic look
- subtle film grain for organic feel`,
    lighting: `LIGHTING:
- moody, atmospheric lighting
- warm pink/purple/amber color palette
- soft shadows with depth
- practical light sources (lamps, windows, neon)
- high contrast but not harsh
- cinematic color grading`,
    background: `BACKGROUND:
- realistic modern environments
- use spatial structure from reference image
- atmospheric depth
- remove ALL background people
- clean, focused composition`
  }
};

// Reference-level scene definitions (POSE/COMPOSITION/CAMERA ONLY)
const sceneDefinitions: Record<string, Record<string, string>> = {
  zootopia: {
    ref1: `SCENE (REFERENCE 1 — STATIC BALANCED SELFIE):

CRITICAL RULE:
- this scene MUST produce a perfectly balanced, symmetric selfie
- DO NOT collapse into a generic close-face shot
- exact pose geometry is required

ROLE MAPPING:
- first image = girl
- second image = man

POSE (STRICT GEOMETRY):
- both heads aligned horizontally at same height
- faces at equal distance from camera
- cheeks touching symmetrically in center
- NO head tilt on either person
- both faces perfectly centered together
- heads form a stable horizontal line
- NO asymmetry

CAMERA:
- girl holding camera with extended arm
- camera is the viewpoint (selfie perspective)
- slight wide-angle lens effect
- centered framing

COMPOSITION:
- tight close-up on faces
- symmetric framing (left-right balance)
- both faces equally prominent
- stable, balanced geometry
- upper shoulders barely visible

EMOTION:
- calm, friendly expressions
- gentle natural smiles
- both looking directly at camera
- warm, approachable mood

LIGHTING:
- soft, even cartoon lighting on both faces
- no shadows
- balanced exposure

BACKGROUND:
- minimal clean neutral environment
- soft neutral colors

CLOTHING:
- casual modern clothing
- girl: light fitted top
- man: casual t-shirt or hoodie`,

    ref2: `SCENE (REFERENCE 2 — ASYMMETRIC COMPRESSED SELFIE):

CRITICAL RULE:
- this scene MUST be physically different from ref1
- strong asymmetry is REQUIRED
- faces must overlap/compress
- DO NOT produce a balanced selfie

ROLE MAPPING:
- first image = girl
- second image = man

POSE (STRICT GEOMETRY):
- girl pushes her face strongly into the man from the side
- heads NOT aligned horizontally
- one face partially overlaps the other
- faces visibly compressed together
- man slightly leaning away from pressure
- strong LEFT-RIGHT asymmetry
- girl's face closer to camera
- heads at different depths

CAMERA:
- camera extremely close to faces
- very tight framing
- noticeable wide-angle distortion
- off-center composition

COMPOSITION:
- asymmetrical framing (NOT centered)
- faces compressed and overlapping
- unusual spontaneous angle
- girl dominates frame slightly

EMOTION:
- girl: smiling, energetic, playful, pushing in
- man: reacting, slightly uncomfortable or surprised
- contrasting expressions
- spontaneous, unposed interaction

LIGHTING:
- soft cartoon lighting
- gentle shadows from compression
- slightly uneven

BACKGROUND:
- neutral, minimal visibility
- very soft focus

CLOTHING:
- casual modern clothing
- girl: soft pastel sweater or fitted top
- man: casual hoodie or t-shirt`,

    ref3: `SCENE (REFERENCE 3 — DYNAMIC BODY INTERACTION):

CRITICAL RULE:
- this scene MUST show full body interaction
- NOT a face-only selfie
- man physically lifting girl is REQUIRED
- vertical separation between heads is REQUIRED
- DO NOT collapse into close-face composition

ROLE MAPPING:
- first image = girl
- second image = man

POSE (STRICT GEOMETRY):
- man holding the girl in his arms (clear physical lift)
- girl positioned HIGHER than man (vertical offset)
- girl's head above man's head
- bodies clearly visible (NOT just faces)
- man's arms visible around girl
- girl leaning toward man
- close intimate contact but FULL BODIES visible
- dynamic energetic interaction

CAMERA:
- man holding phone camera with one hand
- camera slightly above and angled down
- dynamic tilted angle (NOT level)
- phone partially visible in frame

COMPOSITION:
- MEDIUM SHOT showing upper bodies and torsos
- NOT a tight face crop
- dynamic tilted angle for energy
- both faces visible but bodies dominate
- vertical composition showing lift

EMOTION:
- joyful, dynamic, playful energy
- excited, laughing expressions
- both looking at camera
- party/celebration atmosphere

LIGHTING (SPECIAL):
- strong neon/colored lighting (pink, purple, blue)
- colored highlights on faces and hair
- vibrant cartoon lighting
- high energy feel

BACKGROUND:
- blurred crowd in background
- party/club atmosphere
- bokeh lights from background
- vibrant colored environment

CLOTHING:
- casual party attire
- girl: light casual outfit, fitted top + light pants
- man: casual streetwear, t-shirt + jacket`
  },

  titanic: {
    ref1: `SCENE (REFERENCE 1 - ICONIC BOW POSE):

POSE:
- person A in front with arms fully extended horizontally
- person B directly behind person A
- person B's hands on person A's waist
- bodies aligned, close contact
- both facing forward

CAMERA:
- side angle (NOT frontal)
- camera positioned to side of subjects
- captures profile and three-quarter view
- cinematic wide framing showing full pose

COMPOSITION:
- horizontal emphasis (extended arms)
- ship bow edge visible in frame
- ocean and horizon in background
- dramatic perspective

EMOTION:
- freedom, exhilaration, romance
- person A: arms spread wide, joyful
- person B: protective, close embrace

CLOTHING:
- period-appropriate 1912 style
- person A: long flowing dress or period coat
- person B: suit jacket or vest`,

    ref2: `SCENE (REFERENCE 2 - WATER SCENE):

POSE:
- both people in water
- person A slightly higher, leaning down
- person A leaning toward person B
- person A holding person B's arm or shoulder
- close intimate distance

CAMERA:
- close-up shot
- slightly unstable handheld feeling
- tight framing on faces and upper bodies

COMPOSITION:
- vertical emphasis
- water surface visible
- dark surrounding environment
- intimate, tense framing

EMOTION:
- sadness, tension, intimacy, desperation
- intense emotional connection
- vulnerable expressions

CLOTHING:
- wet, soaked clothing
- period-appropriate but distressed
- visible water on skin and fabric`,

    ref3: `SCENE (REFERENCE 3 - INTIMATE MOMENT):

POSE:
- bodies very close together
- faces at near-kiss distance
- one hand on waist or face
- intimate, romantic tension
- eyes locked on each other OR one looking at camera

CAMERA:
- close-up cinematic framing
- shallow depth of field
- tight crop on faces and upper bodies

COMPOSITION:
- intimate dual portrait
- soft focus background
- faces fill most of frame

EMOTION:
- intense romantic tension
- desire, connection, intimacy
- soft, vulnerable expressions

CLOTHING:
- period-appropriate formal wear
- person A: elegant dress or period attire
- person B: suit or formal jacket`
  },

  euphoria: {
    ref1: `SCENE (REFERENCE 1):

POSE:
- copy pose EXACTLY from the uploaded style reference image
- match body positions precisely
- match physical interaction and gestures
- match relative distance between subjects
- match head angles and orientation

CAMERA:
- match camera angle from reference image exactly
- match framing (close/medium/wide)
- match perspective and lens choice

COMPOSITION:
- replicate composition from reference
- match subject placement in frame
- match negative space distribution

EMOTION:
- match emotional tone from reference
- natural, authentic expressions
- eyes and gaze matching reference direction`,

    ref2: `SCENE (REFERENCE 2):

POSE:
- copy pose EXACTLY from the uploaded style reference image
- match body positions precisely
- match physical interaction and gestures
- match relative distance between subjects
- match head angles and orientation

CAMERA:
- match camera angle from reference image exactly
- match framing (close/medium/wide)
- match perspective and lens choice

COMPOSITION:
- replicate composition from reference
- match subject placement in frame
- match negative space distribution

EMOTION:
- match emotional tone from reference
- natural, authentic expressions
- eyes and gaze matching reference direction`,

    ref3: `SCENE (REFERENCE 3):

POSE:
- copy pose EXACTLY from the uploaded style reference image
- match body positions precisely
- match physical interaction and gestures
- match relative distance between subjects
- match head angles and orientation

CAMERA:
- match camera angle from reference image exactly
- match framing (close/medium/wide)
- match perspective and lens choice

COMPOSITION:
- replicate composition from reference
- match subject placement in frame
- match negative space distribution

EMOTION:
- match emotional tone from reference
- natural, authentic expressions
- eyes and gaze matching reference direction`
  }
};

// Prompt builder function
function buildPrompt(style: string, reference: string): string {
  const styleDef = styleDefinitions[style];
  const sceneDef = sceneDefinitions[style]?.[reference];

  if (!styleDef || !sceneDef) {
    throw new Error(`Invalid style or reference: ${style}/${reference}`);
  }

  return `Generate an image using TWO uploaded identity images and ONE style reference image.

IDENTITY PRESERVATION (CRITICAL - HIGHEST PRIORITY):

TWO SEPARATE PEOPLE - DO NOT MERGE:
- first uploaded image = girl (distinct individual)
- second uploaded image = man (distinct individual)
- these are TWO DIFFERENT PEOPLE
- DO NOT blend, merge, or average their faces
- DO NOT create a single person from two faces
- each person must remain individually recognizable

PRESERVE EXACT IDENTITY FOR EACH PERSON:
- face shape and bone structure (jawline, cheekbones, forehead)
- eye shape, size, color, and spacing
- nose shape and size
- lip shape and thickness
- skin tone and texture
- facial proportions and asymmetries

PRESERVE UNIQUE FEATURES:
- hair: color, texture, style, length
- facial hair: beard, mustache, stubble (exact style and coverage)
- eyebrows: shape, thickness, color
- accessories: glasses, piercings, jewelry
- distinctive marks: scars, moles, tattoos
- age indicators: wrinkles, skin texture

DO NOT:
- beautify or idealize faces
- smooth skin unnaturally
- change facial structure
- alter eye color or shape
- remove or modify unique features
- blend characteristics between the two people

VERIFICATION:
- both people must be clearly recognizable as their original selves
- someone who knows them should identify both immediately
- faces should look like the uploaded images, just in a new style/scene

${styleDef.style}

${styleDef.lighting}

${styleDef.background}

${sceneDef}

STRICT RULES:
- exactly TWO people in the entire image
- both faces clearly visible and distinct
- NO third person, background people, silhouettes, or distant figures
- NO animals or creatures
- NO face merging or identity blending

QUALITY:
- 4K resolution
- sharp focus on faces
- professional composition
- no text, logos, or watermarks

NEGATIVE PROMPT:
extra people, third person, fourth person, background people, crowd, distant figures, silhouettes, face merge, blended faces, averaged faces, merged identity, animals, creatures, distorted faces, bad anatomy, plastic skin, over-smoothing, incorrect pose, misaligned eyes, floating objects, text, watermark`;
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

    console.log("Running QWEN with structured prompt");

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
