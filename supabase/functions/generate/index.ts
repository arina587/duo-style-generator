import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_VERSION = "fdf4cb96614227f3021c42f35bc92d4fd2e3e1ae9f50ca4004ffa8da64bf8dca";
const MODEL_NAME = "zsxkib/flux-pulid";

const UNIVERSAL_PROMPT = `Use the original scene image as the base.

PRIMARY TASK:
Replace both character identities using the reference photos.

CHARACTER MAPPING:
- female → woman from female reference
- male → man from male reference

PRIORITY ORDER:
1. Identity accuracy (highest priority)
2. Pose, body position, head angle, visibility
3. Scene, lighting, camera, background, clothing, style

IDENTITY SOURCE OF TRUTH (CRITICAL):
The reference photos are the only source of appearance.

All facial features, proportions, skin tone, and identity must come from the reference images.

Do not use, inherit, or recreate any facial structure or appearance from the original scene characters.

The result must look like the reference people placed into the scene, not a transformation of the original actors.

IDENTITY DOMINANCE:
The reference identity must dominate completely.

Minimize any resemblance to the original scene actors as much as possible.

If a conflict occurs, preserve identity accuracy over original facial features.

Perform full character replacement, not face swapping.

POSE LOCK (CRITICAL):
Keep the exact original pose and skeleton.

Do not change:
- body position
- shoulders or torso
- head position
- limb placement

No pose reinterpretation or refinement.

SCENE PRESERVATION:
Keep unchanged:
- pose and body alignment
- head angle and face direction
- camera, framing, perspective
- lighting, shadows, color grading
- background and all objects
- clothing and accessories

Recreate each person naturally in the same position, fitting identity into the original perspective and lighting.

IDENTITY ACCURACY:
Preserve:
- facial structure and proportions
- skin tone and texture
- eyes, nose, lips, bone structure
- hair shape, color, and length

Avoid identity blending.
The result should look like the reference person placed into the scene.

HEAD RECONSTRUCTION (CRITICAL):
Do not reuse the original head or facial structure as a base.

Reconstruct the head from the reference identity while matching the original head position and angle.

Do not morph the reference face to fit the original identity.

Ensure correct 3D structure, depth, and lighting.

Do not paste or overlay faces.

STYLE ADAPTATION:
Match the original scene style:
- animated → same stylized/cartoon form
- realistic → photorealistic detail

Do not over-stylize or reinterpret the scene.

HEAD ANGLE & VISIBILITY:
Preserve original head angle, direction, and visibility.

Do not rotate or frontalize faces.

LOW VISIBILITY CASES (CRITICAL):
If a face is not fully visible:
- profile → keep strict profile
- back view → keep back view, do not generate a face
- partially occluded → show only visible parts
- blurred/motion → preserve blur level

Do not invent new facial features or expressions.
Do not reveal hidden parts.

ANATOMY:
Hands must be natural:
- 5 fingers
- correct proportions
- no deformation

Respect occlusions (hair, objects, motion blur).
Do not generate hidden parts.

QUALITY:
High-resolution, sharp image.

Natural skin texture (no plastic smoothing).
Accurate lighting, contrast, and color.

OUTPUT:
Same scene and composition — only identities replaced with the reference people.
Must look like a real, original frame, not edited or composited.`;

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let b64 = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const a = bytes[i];
    const b = i + 1 < len ? bytes[i + 1] : 0;
    const c = i + 2 < len ? bytes[i + 2] : 0;
    b64 += CHARS[a >> 2];
    b64 += CHARS[((a & 3) << 4) | (b >> 4)];
    b64 += i + 1 < len ? CHARS[((b & 15) << 2) | (c >> 6)] : "=";
    b64 += i + 2 < len ? CHARS[c & 63] : "=";
  }

  // Normalize MIME type — reject HEIC/HEIF which Replicate does not accept
  let mime = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  if (mime === "image/heic" || mime === "image/heif" || mime === "image/heic-sequence" || mime === "image/heif-sequence") {
    mime = "image/jpeg";
  }

  console.log(`[FILE] name=${file.name} size=${file.size} mime=${file.type} → normalized=${mime} b64len=${b64.length}`);
  return `data:${mime};base64,${b64}`;
}

const IMAGE_SIZE_LIMIT_BYTES = 6 * 1024 * 1024; // 6MB hard limit (model max is 7MB)
const BASE64_OVERHEAD = 4 / 3; // base64 expands ~33%

function base64ByteSize(dataUrl: string): number {
  // data:<mime>;base64,<data> — count only the base64 payload
  const commaIdx = dataUrl.indexOf(",");
  const b64 = commaIdx >= 0 ? dataUrl.length - commaIdx - 1 : dataUrl.length;
  // base64 chars → raw bytes
  return Math.floor(b64 * 3 / 4);
}

async function runReplicateOnce(
  prompt: string,
  images: string[],
  apiKey: string,
  debugInfo: Record<string, unknown>
): Promise<string> {
  const inputObject = { prompt, image_input: images };

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({ version: MODEL_VERSION, input: inputObject }),
  });

  const createText = await createResponse.text();
  const replicateStatus = createResponse.status;

  console.log("[REPLICATE] create status:", replicateStatus);
  console.log("[REPLICATE] create response:", createText.substring(0, 2000));

  debugInfo.replicate_response_status = replicateStatus;
  debugInfo.replicate_raw_body = createText.substring(0, 3000);

  if (!createResponse.ok) {
    throw new Error(`Replicate prediction creation failed (${replicateStatus}): ${createText.substring(0, 500)}`);
  }

  let prediction: Record<string, unknown>;
  try {
    prediction = JSON.parse(createText);
  } catch {
    throw new Error(`Replicate create response non-JSON: ${createText.substring(0, 400)}`);
  }

  const predictionId = prediction?.id as string | undefined;
  if (!predictionId) {
    throw new Error(`Replicate prediction has no ID: ${JSON.stringify(prediction).substring(0, 300)}`);
  }

  const immediateStatus = prediction?.status as string | undefined;

  if (immediateStatus === "succeeded") {
    return extractOutput(prediction);
  }

  if (immediateStatus === "failed" || immediateStatus === "canceled") {
    const errDetail = JSON.stringify(prediction?.error ?? prediction?.logs ?? immediateStatus);
    console.error("[REPLICATE FAIL]", errDetail);
    throw new Error(`Prediction failed (${immediateStatus}): ${errDetail}`);
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
      throw new Error(`Replicate poll failed (${pollResponse.status}): ${pollText.substring(0, 300)}`);
    }

    const pollData = await pollResponse.json() as Record<string, unknown>;
    const status = pollData?.status as string | undefined;

    console.log(`[REPLICATE] poll attempt ${attempt + 1}: status = ${status}`);

    if (status === "succeeded") {
      return extractOutput(pollData);
    }

    if (status === "failed" || status === "canceled") {
      const errDetail = JSON.stringify(pollData?.error ?? pollData?.logs ?? status);
      console.error("[REPLICATE FAIL]", { status, error: pollData?.error, logs: pollData?.logs });
      throw new Error(`Prediction failed (${status}): ${errDetail}`);
    }
  }

  throw new Error("Replicate prediction timed out");
}

async function runReplicate(
  prompt: string,
  images: string[],
  apiKey: string
): Promise<{ outputUrl: string; debugInfo: Record<string, unknown> }> {
  // Log full model input for diagnostics
  const imageSummary = images.map((img, i) => {
    const rawBytes = base64ByteSize(img);
    const mime = img.startsWith("data:") ? img.substring(5, img.indexOf(";")) : "unknown";
    return { index: i, mime, rawBytes, b64Chars: img.length, overLimit: rawBytes > IMAGE_SIZE_LIMIT_BYTES };
  });

  const totalRawBytes = imageSummary.reduce((s, x) => s + x.rawBytes, 0);

  const debugInfo: Record<string, unknown> = {
    model: MODEL_NAME,
    version: MODEL_VERSION,
    prompt_length: prompt.length,
    image_count: images.length,
    images: imageSummary,
    total_raw_bytes: totalRawBytes,
  };

  console.log("[MODEL INPUT]", JSON.stringify({
    imageCount: images.length,
    promptLength: prompt.length,
    images: imageSummary,
    totalRawBytes,
    totalMB: (totalRawBytes / 1024 / 1024).toFixed(2),
  }));

  // Hard limit check — fail fast with a clear message before hitting E6802
  for (const img of imageSummary) {
    if (img.overLimit) {
      throw Object.assign(
        new Error(`Image ${img.index} is ${(img.rawBytes / 1024 / 1024).toFixed(2)}MB — exceeds the 6MB per-image limit. Please use a smaller or more compressed photo.`),
        { debugInfo }
      );
    }
  }

  // Attempt with one automatic retry for transient E6802 / model instability failures
  const MAX_ATTEMPTS = 2;
  let lastError: Error = new Error("Unknown error");
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[REPLICATE] attempt ${attempt}/${MAX_ATTEMPTS}`);
      const outputUrl = await runReplicateOnce(prompt, images, apiKey, debugInfo);
      return { outputUrl, debugInfo };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[REPLICATE] attempt ${attempt} failed:`, lastError.message);
      if (attempt < MAX_ATTEMPTS) {
        console.log("[REPLICATE] retrying in 4s...");
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }

  throw Object.assign(lastError, { debugInfo });
}

function extractOutput(prediction: Record<string, unknown>): string {
  const output = prediction?.output;

  console.log("[OUTPUT] raw prediction.output:", JSON.stringify(output)?.substring(0, 300));
  console.log("[OUTPUT] typeof output:", typeof output, "isArray:", Array.isArray(output));

  let outputUrl: string | undefined;

  if (typeof output === "string" && output.length > 0) {
    outputUrl = output;
  } else if (Array.isArray(output) && output.length > 0 && typeof output[0] === "string") {
    outputUrl = output[0] as string;
  } else if (output && typeof output === "object" && !Array.isArray(output)) {
    const obj = output as Record<string, unknown>;
    const candidate = obj.url ?? obj.image ?? obj.output ?? obj.uri;
    if (typeof candidate === "string") outputUrl = candidate;
  }

  if (!outputUrl) {
    throw new Error(
      `Replicate succeeded but output URL could not be extracted. ` +
      `output type=${typeof output} isArray=${Array.isArray(output)} ` +
      `raw=${JSON.stringify(output)?.substring(0, 200)}`
    );
  }

  console.log("[OUTPUT] extracted url:", outputUrl);
  return outputUrl;
}

async function probeOutputUrl(url: string): Promise<{ ok: boolean; status: number; contentType: string; contentLength: string }> {
  try {
    const probe = await fetch(url, { method: "HEAD" });
    return {
      ok: probe.ok,
      status: probe.status,
      contentType: probe.headers.get("content-type") ?? "unknown",
      contentLength: probe.headers.get("content-length") ?? "unknown",
    };
  } catch (e) {
    return { ok: false, status: 0, contentType: "error", contentLength: String(e) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Image proxy — GET /generate?proxyUrl=<encoded-url>
  // Streams the remote image through the edge function so mobile clients never
  // fetch replicate.delivery directly (avoids mobile Safari CORS/network failures).
  const reqUrl = new URL(req.url);
  if (req.method === "GET" && reqUrl.searchParams.has("proxyUrl")) {
    try {
      const proxyUrl = reqUrl.searchParams.get("proxyUrl")!;
      console.log("[PROXY] fetching:", proxyUrl.substring(0, 80));

      if (!proxyUrl.startsWith("https://replicate.delivery/")) {
        return new Response(JSON.stringify({ error: "Invalid proxy target" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const upstream = await fetch(proxyUrl);
      console.log("[PROXY] upstream status:", upstream.status, "content-type:", upstream.headers.get("content-type"), "content-length:", upstream.headers.get("content-length"));

      if (!upstream.ok) {
        return new Response(JSON.stringify({ error: `Upstream ${upstream.status}` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const contentType = upstream.headers.get("content-type") || "image/jpeg";
      const contentLength = upstream.headers.get("content-length");

      const responseHeaders: Record<string, string> = {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      };
      if (contentLength) responseHeaders["Content-Length"] = contentLength;

      return new Response(upstream.body, { status: 200, headers: responseHeaders });
    } catch (proxyErr) {
      const msg = proxyErr instanceof Error ? proxyErr.message : String(proxyErr);
      console.error("[PROXY] error:", msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const formData = await req.formData();

    const referenceId = formData.get("referenceId");

    const reference = formData.get("reference") as File | null;
    const person1 = formData.get("person1") as File | null;
    const person1b = formData.get("person1b") as File | null;
    const person2 = formData.get("person2") as File | null;
    const person2b = formData.get("person2b") as File | null;

    if (!reference) {
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

    if (reference.size === 0) {
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

    const hasMan2 = !!person1b && person1b.size > 0;
    const hasWoman2 = !!person2b && person2b.size > 0;

    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateApiKey) throw new Error("REPLICATE_API_KEY not configured");

    const clientPrompt = formData.get("prompt");
    let finalPrompt =
      typeof clientPrompt === "string" && clientPrompt.trim().length > 0
        ? clientPrompt.trim()
        : UNIVERSAL_PROMPT;

    // When secondary photos are provided, append a multi-image identity mapping block.
    // This tells the model how to group the person images into two identities.
    if (hasMan2 || hasWoman2) {
      const manCount = hasMan2 ? 2 : 1;
      const womanCount = hasWoman2 ? 2 : 1;
      finalPrompt += `

MULTI-IMAGE IDENTITY MAPPING:
- First ${manCount} person image${manCount > 1 ? "s" : ""} → SAME MAN
- Next ${womanCount} person image${womanCount > 1 ? "s" : ""} → SAME WOMAN
Treat each group as ONE identity.
Merge features within group.
Do NOT mix identities.`;
    }

    // Diagnostic payload log — compare desktop vs mobile submissions
    console.log("[PAYLOAD]", JSON.stringify({
      referenceId,
      hasMan2,
      hasWoman2,
      promptSource: (typeof clientPrompt === "string" && clientPrompt.trim().length > 0) ? "reference-override" : "universal",
      promptLength: finalPrompt.length,
      images: {
        reference: { size: reference.size, type: reference.type, name: reference.name },
        person1: { size: person1.size, type: person1.type, name: person1.name },
        person1b: hasMan2 ? { size: person1b!.size, type: person1b!.type } : null,
        person2: { size: person2.size, type: person2.type, name: person2.name },
        person2b: hasWoman2 ? { size: person2b!.size, type: person2b!.type } : null,
      },
    }));

    console.log("[GENERATE] prompt length:", finalPrompt.length);

    const personDataUrls = await Promise.all([
      fileToDataUrl(person1),
      ...(hasMan2 ? [fileToDataUrl(person1b!)] : []),
      fileToDataUrl(person2),
      ...(hasWoman2 ? [fileToDataUrl(person2b!)] : []),
    ]);

    const referenceDataUrl = await fileToDataUrl(reference);

    const images = [referenceDataUrl, ...personDataUrls];

    console.log("[IMAGES COUNT]", images.length);

    const { outputUrl, debugInfo } = await runReplicate(finalPrompt, images, replicateApiKey);

    // Probe the output URL so we can log accessibility before returning it
    const probe = await probeOutputUrl(outputUrl);
    console.log("[OUTPUT] probe:", JSON.stringify(probe));
    debugInfo.output_url = outputUrl;
    debugInfo.output_probe = probe;

    // Return the raw output URL directly — do NOT attempt to fetch and base64-encode
    // the output image inside the edge function. Output images from Nano Banana Pro
    // can be 3–10 MB; base64-encoding them inflates to 4–13 MB which exceeds the
    // Supabase Edge Function response size limit (~6 MB), causing silent truncation
    // that the frontend sees as "Load failed". The frontend fetches the URL directly
    // and converts it to a local blob URL instead.
    return new Response(
      JSON.stringify({ success: true, imageUrl: outputUrl, debug: debugInfo }),
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
