import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Replicate from "npm:replicate";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const referenceMap: Record<string, Record<string, string>> = {
  zootopia: {
    ref1: "/styles/zootopia/ref1.jpg",
    ref2: "/styles/zootopia/ref2.jpg",
    ref3: "/styles/zootopia/ref3.jpg"
  },
  titanic: {
    ref1: "/styles/titanic/ref1.jpg",
    ref2: "/styles/titanic/ref2.jpg",
    ref3: "/styles/titanic/ref3.jpg"
  },
  euphoria: {
    ref1: "/styles/euphoria/ref1.jpg",
    ref2: "/styles/euphoria/ref2.jpg",
    ref3: "/styles/euphoria/ref3.jpg"
  }
}

const basePrompt = `Keep the original reference image unchanged.
Preserve pose, composition, and background exactly.
Replace only the identity of the target person.
Do not modify other people.
Do not merge faces.
Do not add or remove people.`

const prompt1 = `${basePrompt}
Apply this identity to the first person only.`

const prompt2 = `${basePrompt}
The first person is already correct. Do not change them. Apply identity only to the second person.`

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

    if (!person1 || !person2 || !selectedStyle || !selectedReference) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields"
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

    if (!["zootopia", "euphoria", "titanic"].includes(selectedStyle)) {
      return new Response(
        JSON.stringify({ error: "Invalid style" }),
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
      return new Response(
        JSON.stringify({ error: "Invalid reference" }),
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
          error: "Replicate API token not configured"
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

    console.log("=== RUNTIME LOGS ===");
    console.log("selectedStyle:", selectedStyle);
    console.log("selectedReference:", selectedReference);
    console.log("referenceMap[selectedStyle]:", referenceMap[selectedStyle]);
    console.log("referenceMap[selectedStyle][selectedReference]:", referenceMap[selectedStyle][selectedReference]);

    const referenceImagePath = referenceMap[selectedStyle][selectedReference];
    const referenceImageUrl = `https://yourdomain.com${referenceImagePath}`;

    console.log("\nREFERENCE IMAGE URL:");
    console.log(referenceImageUrl);

    console.log("\n=== VALIDATION ===");
    console.log("Is referenceMap defined?", referenceMap ? "YES" : "NO");
    console.log("Is referenceMap[selectedStyle] defined?", referenceMap[selectedStyle] ? "YES" : "NO");
    console.log("Is referenceMap[selectedStyle][selectedReference] defined?", referenceMap[selectedStyle][selectedReference] ? "YES" : "NO");
    console.log("Is input_image a valid URL string?", (typeof referenceImageUrl === 'string' && referenceImageUrl.startsWith('http')) ? "YES" : "NO");

    console.log("\n=== STEP 1: Replace first person ===");
    const step1Payload = {
      input: {
        prompt: prompt1,
        input_image: referenceImageUrl,
        aspect_ratio: "match_input_image",
        prompt_upsampling: false,
        output_format: "png",
        safety_tolerance: 2
      }
    };

    console.log("\n=== REPLICATE INPUT (STEP 1) ===");
    console.log("prompt:", step1Payload.input.prompt);
    console.log("input_image:", step1Payload.input.input_image);

    const step1Output = await replicate.run(
      "black-forest-labs/flux-kontext-pro",
      step1Payload
    );

    console.log("\n=== REPLICATE RAW OUTPUT (STEP 1) ===");
    console.log("RAW OUTPUT:");
    console.log(JSON.stringify(step1Output, null, 2));
    console.log("Did replicate.run return a value?", step1Output ? "YES" : "NO");

    let step1ImageUrl: string | null = null;
    let step1Item = Array.isArray(step1Output) ? step1Output[0] : step1Output;

    if (typeof step1Item === 'string') {
      step1ImageUrl = step1Item;
    } else if (step1Item && typeof step1Item === 'object') {
      if (typeof step1Item.url === 'function') {
        step1ImageUrl = await step1Item.url();
      } else if (typeof step1Item.url === 'string') {
        step1ImageUrl = step1Item.url;
      } else if (step1Item.toString && step1Item.toString() !== '[object Object]') {
        step1ImageUrl = step1Item.toString();
      }
    }

    if (!step1ImageUrl || typeof step1ImageUrl !== 'string') {
      throw new Error("Step 1 failed to produce valid image URL");
    }

    console.log("Step 1 result:", step1ImageUrl);

    console.log("\n=== STEP 2: Replace second person ===");
    const step2Payload = {
      input: {
        prompt: prompt2,
        input_image: step1ImageUrl,
        aspect_ratio: "match_input_image",
        prompt_upsampling: false,
        output_format: "png",
        safety_tolerance: 2
      }
    };

    console.log("\n=== REPLICATE INPUT (STEP 2) ===");
    console.log("prompt:", step2Payload.input.prompt);
    console.log("input_image:", step2Payload.input.input_image);

    const step2Output = await replicate.run(
      "black-forest-labs/flux-kontext-pro",
      step2Payload
    );

    console.log("\n=== REPLICATE RAW OUTPUT (STEP 2) ===");
    console.log("RAW OUTPUT:");
    console.log(JSON.stringify(step2Output, null, 2));
    console.log("Did replicate.run return a value?", step2Output ? "YES" : "NO");

    let finalImageUrl: string | null = null;
    let step2Item = Array.isArray(step2Output) ? step2Output[0] : step2Output;

    if (typeof step2Item === 'string') {
      finalImageUrl = step2Item;
    } else if (step2Item && typeof step2Item === 'object') {
      if (typeof step2Item.url === 'function') {
        finalImageUrl = await step2Item.url();
      } else if (typeof step2Item.url === 'string') {
        finalImageUrl = step2Item.url;
      } else if (step2Item.toString && step2Item.toString() !== '[object Object]') {
        finalImageUrl = step2Item.toString();
      }
    }

    if (!finalImageUrl || typeof finalImageUrl !== 'string') {
      throw new Error("Step 2 failed to produce valid image URL");
    }

    console.log("Final result:", finalImageUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: finalImageUrl
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("=== FULL ERROR ===");
    console.error("FULL ERROR:", error);

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
