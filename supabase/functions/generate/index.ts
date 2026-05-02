import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_VERSION = "fdf4cb96614227f3021c42f35bc92d4fd2e3e1ae9f50ca4004ffa8da64bf8dca";
const MODEL_NAME = "zsxkib/flux-pulid";

const UNIVERSAL_PROMPT = `SCENE REFERENCE:
image_input[0] is the original scene reference.
It defines ONLY:
- body pose and skeleton
- head position, angle, and visibility
- facial expression and emotion
- interaction between characters
- camera angle, framing, and perspective
- lighting, shadows, and color grading
- clothing, environment, and objects
Do NOT reuse, copy, or edit any pixels from image_input[0].
Do NOT treat the scene as a base image.
Treat the scene strictly as a blueprint.

---

CHARACTER REPLACEMENT:
Completely remove the original characters from the scene.
Recreate both characters from scratch using the identity source images.
The final image must look like the scene was originally created with these people.

---

IDENTITY RULES:
Each character must be built ONLY from their assigned identity images.
- The man must use ONLY the MAN identity images
- The woman must use ONLY the WOMAN identity images
Do NOT:
- mix identities
- blend identities
- transfer features between people
- use any facial traits from the original scene characters

---

IDENTITY PRIORITY:
Identity accuracy is the highest priority.
The characters must clearly look like the identity source images,
not like modified versions of the original actors.

---

FULL HEAD RECONSTRUCTION:
Reconstruct the entire head and face using identity images, including:
- skull structure
- facial proportions
- bone structure
- skin tone and texture
- eyes, nose, lips
- hair shape, hairline, and structure
Do NOT:
- reuse the original head or face
- paste or overlay faces
- perform face swap or face transfer

---

EXPRESSION LOCK:
Preserve the exact facial expression and emotion from the original scene.
Expression must come from the scene,
NOT from the identity photos.

---

SCENE LOCK:
Preserve exactly:
- pose and body geometry
- head angle and direction
- character positioning and interaction
- camera framing and perspective
- lighting and shadows
- background and environment
- clothing and accessories

---

GEOMETRY AND LIGHTING INTEGRATION:
Ensure the reconstructed faces:
- match the exact head angle and perspective
- match scene lighting and shadows
- have correct depth and 3D structure
- integrate naturally with the body
No flat faces. No mismatched lighting.

---

QUALITY:
High-resolution image.
Natural skin texture.
Accurate lighting and color.
No artifacts, distortions, or unnatural blending.

---

OUTPUT:
A fully reconstructed scene with the same composition,
but with the uploaded man and woman as the real characters.
The result must look natural, consistent, and not edited.`;

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
    const promptSource = (typeof clientPrompt === "string" && clientPrompt.trim().length > 0)
      ? "custom"
      : "universal";
    const basePrompt = promptSource === "custom"
      ? (clientPrompt as string).trim()
      : UNIVERSAL_PROMPT;

    // Compute exact image_input indices from the actual array build order.
    // image_input layout:
    //   [0]          = scene reference (always)
    //   [1]          = man primary (always)
    //   [2]          = man secondary (only if hasMan2)
    //   [1+manCount] = woman primary (always)
    //   [2+manCount] = woman secondary (only if hasWoman2)
    const manCount = hasMan2 ? 2 : 1;
    const womanCount = hasWoman2 ? 2 : 1;
    const idxScene = 0;
    const idxManStart = 1;
    const idxManEnd = idxManStart + manCount - 1;       // inclusive
    const idxWomanStart = idxManEnd + 1;
    const idxWomanEnd = idxWomanStart + womanCount - 1; // inclusive
    const totalImages = 1 + manCount + womanCount;

    // Build IMAGE ROLE MAPPING block injected into every request.
    // Uses exact array indices — no vague "first N images" language.
    // Appended after base prompt so it overrides any conflicting abstract
    // role references (e.g. "female reference photo") in the base prompt.
    const manIdxList = manCount === 1
      ? `image_input[${idxManStart}]`
      : `image_input[${idxManStart}] and image_input[${idxManEnd}]`;
    const womanIdxList = womanCount === 1
      ? `image_input[${idxWomanStart}]`
      : `image_input[${idxWomanStart}] and image_input[${idxWomanEnd}]`;

    const roleMappingBlock = `

IMAGE ROLE MAPPING (${totalImages} images total):
- image_input[${idxScene}] = scene to recreate (pose, lighting, composition source)
- ${manIdxList} = MAN identity source${manCount > 1 ? " (same person, merge into one identity)" : ""}
- ${womanIdxList} = WOMAN identity source${womanCount > 1 ? " (same person, merge into one identity)" : ""}

The man in the scene must look like the person in ${manIdxList}.
The woman in the scene must look like the person in ${womanIdxList}.
Do NOT mix man and woman identity sources.
Do NOT use image_input[${idxScene}] as an identity source.`;

    const finalPrompt = basePrompt + roleMappingBlock;

    console.log("[PROMPT] source=" + promptSource + " base_len=" + basePrompt.length + " final_len=" + finalPrompt.length);
    console.log("[PROMPT] role mapping block:\n" + roleMappingBlock.trim());
    console.log("[PROMPT] full text:\n" + finalPrompt);

    const personDataUrls = await Promise.all([
      fileToDataUrl(person1),
      ...(hasMan2 ? [fileToDataUrl(person1b!)] : []),
      fileToDataUrl(person2),
      ...(hasWoman2 ? [fileToDataUrl(person2b!)] : []),
    ]);

    const referenceDataUrl = await fileToDataUrl(reference);

    const images = [referenceDataUrl, ...personDataUrls];

    // Verify computed indices match actual array length
    if (images.length !== totalImages) {
      throw new Error(`Image count mismatch: expected ${totalImages}, got ${images.length}`);
    }

    console.log("[IMAGES]", JSON.stringify(images.map((img, i) => ({
      index: i,
      role: i === idxScene ? "scene" : i <= idxManEnd ? `man${i > idxManStart ? "-secondary" : ""}` : `woman${i > idxWomanStart ? "-secondary" : ""}`,
      mime: img.startsWith("data:") ? img.substring(5, img.indexOf(";")) : "unknown",
      bytes: Math.floor((img.length - img.indexOf(",") - 1) * 3 / 4),
    }))));

    console.log("[PAYLOAD]", JSON.stringify({
      referenceId,
      promptSource,
      hasMan2,
      hasWoman2,
      promptLength: finalPrompt.length,
      imageCount: images.length,
      images: {
        reference: { size: reference.size, type: reference.type, name: reference.name },
        person1: { size: person1.size, type: person1.type, name: person1.name },
        person1b: hasMan2 ? { size: person1b!.size, type: person1b!.type } : null,
        person2: { size: person2.size, type: person2.type, name: person2.name },
        person2b: hasWoman2 ? { size: person2b!.size, type: person2b!.type } : null,
      },
    }));

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
