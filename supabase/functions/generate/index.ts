import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_VERSION = "fdf4cb96614227f3021c42f35bc92d4fd2e3e1ae9f50ca4004ffa8da64bf8dca";
const MODEL_NAME = "zsxkib/flux-pulid";

const UNIVERSAL_PROMPT = `Use the original scene image as the base.
Replace the female character with the woman from the female reference image, and replace the male character with the man from the male reference image.
Perform full character replacement, not face swapping.
Preserve the original scene exactly:
- pose, body position, and interaction
- camera angle, framing, and perspective
- lighting, shadows, and color grading
- background, environment, and all objects
- clothing and accessories
Recreate each person naturally in the same pose and position, adapting their identity to fit the original body, perspective, and lighting.
Maintain strong identity accuracy:
- facial structure and proportions
- skin tone and texture
- eyes, nose, lips, bone structure
- hair shape, color, and length
Keep the person clearly recognizable.
Do not paste or overlay faces. Ensure seamless integration of head and body with correct proportions, perspective, and lighting.
STYLE ADAPTATION:
Match the original scene style automatically:
- if the scene is animated or cartoon → render characters in the same stylized form
- if the scene is realistic/live-action → render in photorealistic detail
Do not over-stylize or reinterpret the scene.
Keep the original level of realism and detail.
HEAD ANGLE & VISIBILITY CONTROL:
Preserve the original head angle, face direction, and visibility exactly.
Do not rotate, frontalize, or reveal faces that are not visible in the original scene.
If a character is in profile, keep them in profile.
If a character is turned away, from the back, partially hidden, blurred, or out of frame, keep the same visibility.
Do not make hidden facial features visible.
Do not change gaze direction or eye visibility.
Match the original perspective, depth, and camera angle.
ANATOMY CONTROL:
Preserve original body anatomy.
Hands must be natural:
- exactly 5 fingers per hand
- correct proportions
- no deformation or extra fingers
Respect occlusions (hair, hands, objects, motion blur). Do not generate hidden parts.
QUALITY:
- high resolution, sharp, clean image
- natural skin texture (no plastic smoothing)
- accurate lighting and contrast
Output must look like an original frame with the new people, not edited or composited.`;

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  const b64 = btoa(binary);
  const mime = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  return `data:${mime};base64,${b64}`;
}

async function runReplicate(
  prompt: string,
  images: string[],
  apiKey: string
): Promise<{ outputUrl: string; debugInfo: Record<string, unknown> }> {
  const inputObject = {
    prompt,
    image_input: images,
  };

  const debugInfo: Record<string, unknown> = {
    model: MODEL_NAME,
    version: MODEL_VERSION,
    prompt_length: prompt.length,
    image_count: images.length,
    images: images.map((img, i) => ({
      index: i,
      exists: !!img,
      is_data_url: img.startsWith("data:"),
      preview: img.substring(0, 50),
      size_chars: img.length,
    })),
  };

  console.log("[DEBUG] full debug info:", JSON.stringify(debugInfo, null, 2));

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: inputObject,
    }),
  });

  const createText = await createResponse.text();
  const replicateStatus = createResponse.status;

  console.log("[REPLICATE] create status:", replicateStatus);
  console.log("[REPLICATE] create response:", createText.substring(0, 1200));

  debugInfo.replicate_response_status = replicateStatus;
  debugInfo.replicate_raw_body = createText.substring(0, 2000);

  if (!createResponse.ok) {
    throw Object.assign(
      new Error(`Replicate prediction creation failed (${replicateStatus}): ${createText.substring(0, 500)}`),
      { debugInfo }
    );
  }

  let prediction: Record<string, unknown>;
  try {
    prediction = JSON.parse(createText);
  } catch {
    throw Object.assign(
      new Error(`Replicate create response non-JSON: ${createText.substring(0, 400)}`),
      { debugInfo }
    );
  }

  const predictionId = prediction?.id as string | undefined;
  if (!predictionId) {
    throw Object.assign(
      new Error(`Replicate prediction has no ID: ${JSON.stringify(prediction).substring(0, 300)}`),
      { debugInfo }
    );
  }

  const immediateStatus = prediction?.status as string | undefined;

  if (immediateStatus === "succeeded") {
    return { outputUrl: extractOutput(prediction), debugInfo };
  }

  if (immediateStatus === "failed" || immediateStatus === "canceled") {
    throw Object.assign(
      new Error(`Replicate prediction ${immediateStatus}: ${JSON.stringify(prediction?.error ?? prediction?.logs ?? immediateStatus)}`),
      { debugInfo }
    );
  }

  console.log("[REPLICATE] polling prediction:", predictionId);

  const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
  const maxAttempts = 80;
  const pollIntervalMs = 3000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const pollResponse = await fetch(pollUrl, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!pollResponse.ok) {
      const pollText = await pollResponse.text();
      throw Object.assign(
        new Error(`Replicate poll failed (${pollResponse.status}): ${pollText.substring(0, 300)}`),
        { debugInfo }
      );
    }

    const pollData = await pollResponse.json() as Record<string, unknown>;
    const status = pollData?.status as string | undefined;

    console.log(`[REPLICATE] poll attempt ${attempt + 1}: status = ${status}`);

    if (status === "succeeded") {
      return { outputUrl: extractOutput(pollData), debugInfo };
    }

    if (status === "failed" || status === "canceled") {
      throw Object.assign(
        new Error(`Replicate prediction ${status}: ${JSON.stringify(pollData?.error ?? pollData?.logs ?? status)}`),
        { debugInfo }
      );
    }
  }

  throw Object.assign(new Error("Replicate prediction timed out"), { debugInfo });
}

function extractOutput(prediction: Record<string, unknown>): string {
  const output = prediction?.output;

  let outputUrl: string | undefined;
  if (typeof output === "string" && output.startsWith("http")) {
    outputUrl = output;
  } else if (Array.isArray(output) && output.length > 0 && typeof output[0] === "string") {
    outputUrl = output[0] as string;
  }

  if (!outputUrl) {
    throw new Error(`Replicate succeeded but no output URL found: ${JSON.stringify(prediction).substring(0, 300)}`);
  }

  console.log("[REPLICATE] output url:", outputUrl);
  return outputUrl;
}

async function fetchOutputAsDataUrl(url: string): Promise<string> {
  const imgResponse = await fetch(url);
  if (!imgResponse.ok) {
    throw new Error(`Failed to fetch Replicate output image (${imgResponse.status})`);
  }
  const imgBuffer = await imgResponse.arrayBuffer();
  const imgBytes = new Uint8Array(imgBuffer);

  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < imgBytes.length; i += chunkSize) {
    const chunk = imgBytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  const b64 = btoa(binary);
  const contentType = imgResponse.headers.get("content-type") ?? "image/jpeg";
  return `data:${contentType};base64,${b64}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const formData = await req.formData();

    const referenceId = formData.get("referenceId");
    const isSpiderMan =
      typeof referenceId === "string" &&
      referenceId.startsWith("spiderman");

    const reference = formData.get("reference") as File | null;
    const person1 = formData.get("person1") as File | null;
    const person2 = formData.get("person2") as File | null;

    if (!isSpiderMan && !reference) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required images: reference, person1, person2" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!person1 || !person2) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required images: person1, person2" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isSpiderMan && reference && reference.size === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "reference file is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const [label, file] of [["person1", person1], ["person2", person2]] as [string, File][]) {
      if (file.size === 0) {
        return new Response(
          JSON.stringify({ success: false, error: `${label} file is empty` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateApiKey) throw new Error("REPLICATE_API_KEY not configured");

    const clientPrompt = formData.get("prompt");
    const finalPrompt =
      typeof clientPrompt === "string" && clientPrompt.trim().length > 0
        ? clientPrompt.trim()
        : UNIVERSAL_PROMPT;

    console.log("[GENERATE] prompt source:", finalPrompt === UNIVERSAL_PROMPT ? "universal" : "reference-override", "length:", finalPrompt.length);
    console.log("[GENERATE] spider-man mode:", isSpiderMan);

    const [person1DataUrl, person2DataUrl] = await Promise.all([
      fileToDataUrl(person1),
      fileToDataUrl(person2),
    ]);

    const referenceDataUrl = isSpiderMan
      ? ""
      : await fileToDataUrl(reference!);

    const images = isSpiderMan
      ? [person1DataUrl, person2DataUrl]
      : [referenceDataUrl, person1DataUrl, person2DataUrl];

    const { outputUrl, debugInfo } = await runReplicate(finalPrompt, images, replicateApiKey);
    const imageUrl = await fetchOutputAsDataUrl(outputUrl);

    return new Response(
      JSON.stringify({ success: true, imageUrl, debug: debugInfo }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const debugInfo = (error as { debugInfo?: Record<string, unknown> }).debugInfo ?? {};
    console.error("[GENERATE ERROR]", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg, debug: debugInfo }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
