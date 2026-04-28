import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_VERSION = "fdf4cb96614227f3021c42f35bc92d4fd2e3e1ae9f50ca4004ffa8da64bf8dca";
const MODEL_NAME = "zsxkib/flux-pulid";

const UNIVERSAL_PROMPT = `Use the reference scene image as the absolute base. Perform ONLY character identity replacement.

PRIORITY ORDER (STRICT):
1) Identity from uploaded photos
2) Original scene geometry and composition
3) Style adaptation

IDENTITY TRANSFER (HARD CONSTRAINT):
Replace characters using uploaded photos only:
- female character → woman from female photo
- male character → man from male photo

Preserve identity EXACTLY 1:1:
- facial structure, proportions, age
- skin tone and texture
- eyes, nose, lips, bone structure
- hairline, hair color, length, and shape

Do NOT:
- beautify or enhance faces
- stylize or reinterpret identity
- mix identities
- generate new faces

Uploaded photos are the single source of truth.

SCENE LOCK (ABSOLUTE):
Do NOT change ANYTHING in the original scene except identity.

Preserve EXACTLY:
- full body pose and skeleton alignment
- body proportions and orientation
- head position, angle, rotation
- gaze direction and eye state (open/closed)
- facial expression and emotion
- camera angle, framing, crop, perspective, lens
- spatial composition and character placement
- interaction between characters (distance, touch, contact)
- background, environment, all objects
- clothing, outfit details, accessories
- lighting, shadows, highlights
- color grading and mood

NO MODIFICATIONS:
- no pose changes
- no camera changes
- no composition changes
- no added or removed elements
- no outfit or styling changes
- no background alterations

FACE INTEGRATION (CRITICAL):
Do NOT paste or overlay faces.
Reconstruct faces naturally within the original head geometry.

Faces must match:
- exact head orientation from the reference
- original perspective and depth
- original lighting and shadow direction
- original focus and motion blur

VISIBILITY & OCCLUSION:
Only generate visible parts of the face.
Do NOT reconstruct hidden areas.
Respect occlusion (hair, angle, motion blur, objects).

STYLE MATCH:
Match the original reference style automatically (photorealistic or animated).
Adapt identity into that style while preserving recognizability.

ANATOMY CONSISTENCY:
Keep original body anatomy unchanged.
Hands must be natural, 5 fingers, no deformation.

OUTPUT:
Identical scene in every aspect — same pose, composition, lighting, and environment.
Only identities are replaced.
Seamless, artifact-free integration with correct perspective, lighting, and realism.`;

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
  referenceDataUrl: string,
  person1DataUrl: string,
  person2DataUrl: string,
  apiKey: string
): Promise<{ outputUrl: string; debugInfo: Record<string, unknown> }> {
  const inputObject = {
    prompt,
    image_input: [referenceDataUrl, person1DataUrl, person2DataUrl],
  };

  const debugInfo: Record<string, unknown> = {
    model: MODEL_NAME,
    version: MODEL_VERSION,
    prompt_length: prompt.length,
    images: {
      reference: {
        exists: !!referenceDataUrl,
        is_data_url: referenceDataUrl.startsWith("data:"),
        preview: referenceDataUrl.substring(0, 50),
        size_chars: referenceDataUrl.length,
      },
      person1: {
        exists: !!person1DataUrl,
        is_data_url: person1DataUrl.startsWith("data:"),
        preview: person1DataUrl.substring(0, 50),
        size_chars: person1DataUrl.length,
      },
      person2: {
        exists: !!person2DataUrl,
        is_data_url: person2DataUrl.startsWith("data:"),
        preview: person2DataUrl.substring(0, 50),
        size_chars: person2DataUrl.length,
      },
    },
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

    const reference = formData.get("reference") as File | null;
    const person1 = formData.get("person1") as File | null;
    const person2 = formData.get("person2") as File | null;

    if (!reference || !person1 || !person2) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required images: reference, person1, person2" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const [label, file] of [["reference", reference], ["person1", person1], ["person2", person2]] as [string, File][]) {
      if (file.size === 0) {
        return new Response(
          JSON.stringify({ success: false, error: `${label} file is empty` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateApiKey) throw new Error("REPLICATE_API_KEY not configured");

    console.log("[GENERATE] using universal prompt, length:", UNIVERSAL_PROMPT.length);

    const [referenceDataUrl, person1DataUrl, person2DataUrl] = await Promise.all([
      fileToDataUrl(reference),
      fileToDataUrl(person1),
      fileToDataUrl(person2),
    ]);

    const { outputUrl, debugInfo } = await runReplicate(UNIVERSAL_PROMPT, referenceDataUrl, person1DataUrl, person2DataUrl, replicateApiKey);
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
