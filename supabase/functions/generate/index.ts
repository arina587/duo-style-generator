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

- image1: first person identity reference
- image2: second person identity reference
- image3: pose and composition reference only

CORE RULE:
Reconstruct the pose, framing, and background layout of image3, but REMOVE all original subjects from image3 and REPLACE them with ONLY the two people from image1 and image2.

SUBJECT COUNT RULE (ABSOLUTE):
The final image must contain EXACTLY TWO human characters.
No third person.
No crowd.
No silhouette.
No reflection of another person.
No animals.
No pets.
No background figures.
If any extra subject appears, the result is incorrect.

IDENTITY LOCK:
Preserve both people from image1 and image2 as accurately as possible:

- face shape
- asymmetry
- eyes, nose, lips
- jawline
- age
- skin tone
- natural skin texture
- hair color, length, texture, and hairstyle

Do not beautify, idealize, smooth, retouch, or plasticize faces.
Faces must remain clearly recognizable.

POSE AND COMPOSITION LOCK:
Use image3 ONLY for:

- exact pose
- body positions
- subject interaction
- distance between subjects
- camera angle
- crop and framing
- background structure and perspective

Do not copy any characters from image3.
Do not copy any animals from image3.

BACKGROUND RULE:
Rebuild the same environment layout from image3, but keep it empty except for the two provided people.
No extra subjects in the background.

STYLE BIBLE:
selectedStyle fully controls rendering style, lighting style, realism level, color grading, and overall visual world.
`;

    if (selectedStyle === "zootopia") {
      prompt += `
IF selectedStyle is "zootopia":
Create a premium Disney/Pixar-style 3D animated image.

- same visual style every time within this category
- polished family-feature animation quality
- smooth clean geometry
- expressive eyes
- stylized but consistent facial design
- soft global illumination
- vibrant clean color palette
- high-end animated shading
- no realism
- no random style drift

The final image must look like it belongs to the same animated movie every time.
`;
    } else if (selectedStyle === "euphoria") {
      prompt += `
IF selectedStyle is "euphoria":
Create an ultra-realistic cinematic drama frame.

- same visual style every time within this category
- highly realistic skin texture
- moody premium cinematography
- warm, pink, amber, and low-light tones
- realistic falloff in shadows
- subtle film grain
- soft lens bloom
- shallow depth of field
- natural imperfections
- absolutely no plastic skin
- absolutely no AI glamour look
- absolutely no glossy CGI feel

The final image must look like it belongs to the same prestige drama series every time.

REALISM LOCK FOR EUPHORIA:
Realism is mandatory.
Use:
- realistic skin pores
- realistic facial micro-texture
- realistic fabric behavior
- realistic shadows
- natural lens look

Avoid:
- plastic skin
- over-smoothing
- doll-like faces
- artificial fashion retouch
- hyper-clean AI portrait look
`;
    } else if (selectedStyle === "titanic") {
      prompt += `
IF selectedStyle is "titanic":
Create an ultra-realistic romantic epic film frame.

- same visual style every time within this category
- realistic skin texture
- cinematic golden-hour or cold dramatic marine lighting depending on composition
- film-grade contrast
- soft atmospheric glow
- realistic wind, fabric, and light interaction
- natural human rendering
- absolutely no plastic skin
- absolutely no beauty retouching
- absolutely no glossy CGI feel

The final image must look like it belongs to the same epic romance film every time.

REALISM LOCK FOR TITANIC:
Realism is mandatory.
Use:
- realistic skin pores
- realistic facial micro-texture
- realistic fabric behavior
- realistic shadows
- natural lens look

Avoid:
- plastic skin
- over-smoothing
- doll-like faces
- artificial fashion retouch
- hyper-clean AI portrait look
`;
    }

    prompt += `
CONSISTENCY LOCK:
All outputs inside the same selectedStyle must use the same visual pipeline:

- same rendering language
- same lighting behavior
- same realism level
- same color grading family
- same atmosphere family

NEGATIVE:
extra people, third person, crowd, animal, pet, background figure, silhouette, reflection person, duplicate body, duplicate face, plastic skin, glossy skin, CGI portrait, beauty retouch, AI glamour look, wrong pose, weak realism, style drift`;

    // Use deterministic settings for consistency
    console.log("Using deterministic generation settings for style consistency");

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
