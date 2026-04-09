import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Domain = "titanic" | "euphoria" | "zootopia_human" | "zootopia_animal";
type Provider = "openai" | "replicate";
type PromptKey = "film_face_swap" | "zootopia_human" | "zootopia_animal";

interface RouteConfig {
  provider: Provider;
  model: string;
  promptKey: PromptKey;
}

// ─────────────────────────────────────────────
// MODEL ROUTER
// ─────────────────────────────────────────────

function modelRouter(domain: Domain): RouteConfig {
  switch (domain) {
    case "titanic":
    case "euphoria":
      return {
        provider: "openai",
        model: "gpt-image-1.5",
        promptKey: "film_face_swap",
      };
    case "zootopia_human":
      return {
        provider: "replicate",
        model: "google/nano-banana-pro",
        promptKey: "zootopia_human",
      };
    case "zootopia_animal":
      return {
        provider: "replicate",
        model: "google/nano-banana-pro",
        promptKey: "zootopia_animal",
      };
  }
}

// ─────────────────────────────────────────────
// PROMPT TEMPLATES
// ─────────────────────────────────────────────

const promptTemplates: Record<PromptKey, string> = {
  film_face_swap: `STRICT REALISTIC IMAGE EDITING.

INPUT:
Image[0] = reference scene
Image[1] = person A
Image[2] = person B

TASK:
Replace faces only.

RULES:
- Keep background, lighting, camera, composition EXACT
- Keep pose and clothing EXACT
- Keep film grain, noise, blur, and imperfections

REALISM (CRITICAL):
- Do NOT beautify faces
- Do NOT smooth skin
- Keep pores, asymmetry, imperfections
- Keep natural lighting inconsistencies
- Match original color grading exactly

HANDS & FINGERS (IMPORTANT):
- Preserve natural hand anatomy
- Correct finger count (5 fingers)
- No deformed or merged fingers
- Maintain realistic proportions and joints

FACE INTEGRATION:
- Match shadows and light direction
- Match skin tone to scene lighting
- No artificial sharpness or glow

RESULT:
Must look like a real unedited film frame.`,

  zootopia_human: `Replace the two people in the base image with the people from the reference images.

Use the base image as the main scene. Keep background, composition, camera angle, pose, and clothing exactly the same.

The left person should match image_1.
The right person should match image_2.

Keep both characters clearly recognizable.

Do not beautify or change identity.

Now restyle both characters into a Disney / Zootopia-style 3D animated HUMAN version.

IMPORTANT:
- Keep them human (no animal features)

Style:
- cinematic 3D animation
- soft lighting
- expressive eyes
- smooth but natural skin

Avoid:
- anime
- flat cartoon
- plastic look

Keep pose and interaction identical.`,

  zootopia_animal: `Replace the two people in the base image with the people from the reference images.

INPUT MAPPING:
- image = base scene
- image_1 = left person
- image_2 = right person

Keep the scene exactly the same:
- background
- composition
- pose
- clothing

Keep identity recognizable.

Transform characters:
- Left → fox (NOT a cat)
- Right → rabbit

RULES:
- full animal transformation
- no human skin or features
- no mixed faces

FOX:
- narrow muzzle
- orange fur
- upright ears

RABBIT:
- long ears
- soft face
- correct proportions

Keep pose and interaction identical.

Style:
- Zootopia cinematic 3D
- soft lighting
- detailed fur

RESULT:
Same scene, but characters are fox and rabbit.`,
};

// ─────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────

function promptBuilder(promptKey: PromptKey): string {
  return promptTemplates[promptKey];
}

// ─────────────────────────────────────────────
// DOMAIN RESOLVER (backward compatibility)
// Maps legacy style+mode fields to domain
// ─────────────────────────────────────────────

function resolveDomain(
  domain: string | null,
  style: string | null,
  mode: string | null,
  referenceId: string | null
): Domain {
  if (domain && ["titanic", "euphoria", "zootopia_human", "zootopia_animal"].includes(domain)) {
    return domain as Domain;
  }

  if (style === "zootopia") {
    if (mode === "animal") return "zootopia_animal";
    if (mode === "cartoon_human") return "zootopia_human";
    return "zootopia_human";
  }

  if (style === "titanic") return "titanic";
  if (style === "euphoria") return "euphoria";

  return "titanic";
}

// ─────────────────────────────────────────────
// OPENAI GENERATOR
// ─────────────────────────────────────────────

async function generateWithOpenAI(
  model: string,
  prompt: string,
  reference: File,
  person1: File,
  person2: File,
  apiKey: string
): Promise<string> {
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", prompt);
  form.append("image[]", reference);
  form.append("image[]", person1);
  form.append("image[]", person2);

  console.log("=== GPT REQUEST ===");
  console.log("model:", model);
  console.log("endpoint: https://api.openai.com/v1/images/edits");
  console.log("prompt length:", prompt.length);
  console.log("prompt:\n" + prompt);
  console.log("images:");
  console.log("  [0] reference  — name:", reference.name, "| size:", reference.size, "bytes | type:", reference.type);
  console.log("  [1] person1    — name:", person1.name, "| size:", person1.size, "bytes | type:", person1.type);
  console.log("  [2] person2    — name:", person2.name, "| size:", person2.size, "bytes | type:", person2.type);
  console.log("payload: FormData { model, prompt, image[0], image[1], image[2] }");
  console.log("===================");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: form,
  });

  const responseText = await response.text();

  console.log("=== GPT RESPONSE ===");
  console.log("status:", response.status);
  console.log("body:", responseText);
  console.log("====================");

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`OpenAI returned non-JSON response (${response.status}): ${responseText.substring(0, 500)}`);
  }

  if (!(data?.data as unknown[])?.length || !(data.data as Record<string, unknown>[])[0]?.b64_json) {
    throw new Error(`OpenAI generation failed: ${JSON.stringify(data)}`);
  }

  return `data:image/png;base64,${(data.data as Record<string, unknown>[])[0].b64_json}`;
}

// ─────────────────────────────────────────────
// REPLICATE GENERATOR
// ─────────────────────────────────────────────

async function uploadFileToSupabaseStorage(file: File, supabaseUrl: string, supabaseKey: string): Promise<string> {
  const filename = `replicate-input/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.type.split("/")[1] || "jpg"}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/replicate-uploads/${filename}`;

  console.log("SUPABASE_KEY_DIAGNOSTIC: exists=", !!supabaseKey, "length=", supabaseKey?.length ?? 0, "prefix=", supabaseKey?.substring(0, 20) ?? "MISSING");
  console.log("REPLICATE_UPLOAD: uploading", file.name, "size", file.size, "type", file.type, "→", filename);

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: await file.arrayBuffer(),
  });

  if (!uploadResponse.ok) {
    const uploadError = await uploadResponse.text();
    console.error("REPLICATE_UPLOAD_ERROR:", uploadResponse.status, uploadError);
    throw new Error(`Failed to upload image to storage: ${uploadResponse.status} ${uploadError}`);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/replicate-uploads/${filename}`;
  console.log("REPLICATE_UPLOAD_OK:", publicUrl);
  return publicUrl;
}

async function generateWithReplicate(
  model: string,
  prompt: string,
  reference: File,
  person1: File,
  person2: File,
  apiKey: string
): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured");
  }

  console.log("REPLICATE_IMAGES: uploading 3 files to Supabase storage for public URLs");

  const [refUrl, p1Url, p2Url] = await Promise.all([
    uploadFileToSupabaseStorage(reference, supabaseUrl, supabaseKey),
    uploadFileToSupabaseStorage(person1, supabaseUrl, supabaseKey),
    uploadFileToSupabaseStorage(person2, supabaseUrl, supabaseKey),
  ]);

  const inputPayload = {
    prompt,
    image: refUrl,
    image_1: p1Url,
    image_2: p2Url,
  };

  console.log("=== REPLICATE REQUEST ===");
  console.log("model:", model);
  console.log("endpoint:", `https://api.replicate.com/v1/models/${model}/predictions`);
  console.log("prompt length:", prompt.length);
  console.log("prompt:\n" + prompt);
  console.log("input:", JSON.stringify(inputPayload, null, 2));
  console.log("=========================");

  const predictionResponse = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({ input: inputPayload }),
  });

  const predictionRaw = await predictionResponse.text();
  console.log("=== REPLICATE RESPONSE ===");
  console.log("status:", predictionResponse.status);
  console.log("body:", predictionRaw);
  console.log("==========================");

  let prediction: Record<string, unknown>;
  try {
    prediction = JSON.parse(predictionRaw);
  } catch {
    throw new Error(`Replicate returned non-JSON response (${predictionResponse.status}): ${predictionRaw.substring(0, 500)}`);
  }

  if (!prediction.id) {
    throw new Error(`Replicate prediction creation failed (${predictionResponse.status}): ${JSON.stringify(prediction)}`);
  }

  console.log("REPLICATE_PREDICTION_ID:", prediction.id, "status:", prediction.status);

  if (prediction.status === "succeeded") {
    const outputUrl = Array.isArray(prediction.output) ? (prediction.output as string[])[0] : prediction.output as string;
    if (!outputUrl) throw new Error("Replicate returned succeeded but empty output");
    console.log("REPLICATE_OUTPUT_URL:", outputUrl);
    const imgResponse = await fetch(outputUrl);
    const imgBuffer = await imgResponse.arrayBuffer();
    const imgBytes = new Uint8Array(imgBuffer);
    let binary = "";
    for (let i = 0; i < imgBytes.byteLength; i++) binary += String.fromCharCode(imgBytes[i]);
    return `data:image/png;base64,${btoa(binary)}`;
  }

  if (prediction.status === "failed" || prediction.status === "canceled") {
    console.error("REPLICATE_PREDICTION_FAILED:", JSON.stringify(prediction));
    throw new Error(`Replicate prediction ${prediction.status}: ${prediction.error || JSON.stringify(prediction.logs || "no logs")}`);
  }

  const pollUrl = `https://api.replicate.com/v1/predictions/${prediction.id}`;
  const maxAttempts = 60;
  const pollInterval = 3000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const statusResponse = await fetch(pollUrl, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    const status = await statusResponse.json() as Record<string, unknown>;
    console.log(`REPLICATE_POLL [${attempt + 1}/${maxAttempts}]:`, status.status);

    if (status.status === "succeeded") {
      const outputUrl = Array.isArray(status.output) ? (status.output as string[])[0] : status.output as string;
      if (!outputUrl) throw new Error("Replicate returned empty output");
      console.log("REPLICATE_OUTPUT_URL:", outputUrl);
      const imgResponse = await fetch(outputUrl);
      const imgBuffer = await imgResponse.arrayBuffer();
      const imgBytes = new Uint8Array(imgBuffer);
      let binary = "";
      for (let i = 0; i < imgBytes.byteLength; i++) binary += String.fromCharCode(imgBytes[i]);
      return `data:image/png;base64,${btoa(binary)}`;
    }

    if (status.status === "failed" || status.status === "canceled") {
      console.error("REPLICATE_POLL_FAILED:", JSON.stringify(status));
      throw new Error(`Replicate prediction ${status.status}: ${status.error || JSON.stringify(status.logs || "no logs")}`);
    }
  }

  throw new Error("Replicate prediction timed out after 3 minutes");
}

// ─────────────────────────────────────────────
// MAIN GENERATE FUNCTION
// ─────────────────────────────────────────────

async function generateImage(
  domain: Domain,
  reference: File,
  person1: File,
  person2: File
): Promise<{ imageUrl: string; debug: Record<string, unknown> }> {
  const route = modelRouter(domain);
  const prompt = promptBuilder(route.promptKey);

  const debug = {
    domain,
    provider: route.provider,
    model: route.model,
    promptKey: route.promptKey,
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 200) + "...",
  };

  console.log("GENERATE:", JSON.stringify({ domain, provider: route.provider, model: route.model, promptKey: route.promptKey }));

  if (route.provider === "openai") {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API key not configured");
    const imageUrl = await generateWithOpenAI(route.model, prompt, reference, person1, person2, apiKey);
    return { imageUrl, debug };
  }

  if (route.provider === "replicate") {
    const apiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!apiKey) throw new Error("Replicate API key not configured");
    const imageUrl = await generateWithReplicate(route.model, prompt, reference, person1, person2, apiKey);
    return { imageUrl, debug };
  }

  throw new Error(`Unknown provider: ${route.provider}`);
}

// ─────────────────────────────────────────────
// EDGE FUNCTION ENTRY POINT
// ─────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();

    const reference = formData.get("reference") as File;
    const person1 = formData.get("person1") as File;
    const person2 = formData.get("person2") as File;
    const selectedStyle = formData.get("style") as string;
    const requestedMode = formData.get("mode") as string;
    const requestedDomain = formData.get("domain") as string;
    const selectedReference = formData.get("referenceId") as string;

    if (!reference || !person1 || !person2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing images: reference, person1, and person2 are all required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const domain = resolveDomain(requestedDomain, selectedStyle, requestedMode, selectedReference);

    const { imageUrl, debug } = await generateImage(
      domain,
      reference,
      person1,
      person2
    );

    return new Response(
      JSON.stringify({ success: true, imageUrl, debug }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
