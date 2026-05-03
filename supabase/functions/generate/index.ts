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

---

SCENE LOCK (CONTROLLED):

Do NOT change scene composition, pose, camera, or environment.

HOWEVER:
Allow minimal local adjustments to lighting, shadows, skin tone, and color on the face ONLY, to match the scene lighting and ensure natural integration.

---

NO MODIFICATIONS:
- no pose changes
- no camera changes
- no composition changes
- no added or removed elements
- no outfit or styling changes
- no background alterations

---

FACE INTEGRATION (CRITICAL):

Do NOT paste or overlay faces.

Reconstruct faces naturally within the original head geometry.

Faces must match:
- exact head orientation from the reference
- original perspective and depth
- original lighting direction and shadow falloff
- original focus and motion blur

The face must be fully integrated into the scene lighting, not appear flat or separately lit.

---

VISIBILITY & OCCLUSION:

Respect occlusion from the original scene (hair, objects, motion blur).

Reconstruct the visible parts of the face based on the identity images.

Do NOT leave original facial features even if partially occluded.

---

STYLE MATCH:

Match the original reference style automatically (photorealistic or animated).
Adapt identity into that style while preserving recognizability.

---

ANATOMY CONSISTENCY:

Keep original body anatomy unchanged.
Hands must be natural, 5 fingers, no deformation.

---

OUTPUT:

Identical scene in composition and structure.

Only identities are replaced.

Faces must be seamlessly integrated with correct lighting, shadows, depth, and texture — no flat or pasted appearance.`;

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

function base64ByteSize(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(",");
  const b64 = commaIdx >= 0 ? dataUrl.length - commaIdx - 1 : dataUrl.length;
  return Math.floor(b64 * 3 / 4);
}

function extractOutputUrl(output: unknown): string | undefined {
  if (typeof output === "string" && output.length > 0) return output;
  if (Array.isArray(output) && output.length > 0 && typeof output[0] === "string") return output[0] as string;
  if (output && typeof output === "object" && !Array.isArray(output)) {
    const obj = output as Record<string, unknown>;
    const candidate = obj.url ?? obj.image ?? obj.output ?? obj.uri;
    if (typeof candidate === "string") return candidate;
  }
  return undefined;
}

const MIN_IMAGE_BYTES = 50_000;

async function proxyImage(proxyUrl: string): Promise<Response> {
  if (!proxyUrl.startsWith("https://replicate.delivery/")) {
    return new Response(JSON.stringify({ error: "Invalid proxy target" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const MAX_ATTEMPTS = 2;
  let lastErr: Error = new Error("Unknown proxy error");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 90_000);

      let upstream: Response;
      try {
        upstream = await fetch(proxyUrl, { signal: abort.signal, headers: { "Accept": "image/*" } });
      } catch (fetchErr) {
        clearTimeout(timeout);
        throw fetchErr;
      }

      console.log(`[PROXY] status=${upstream.status} content-type=${upstream.headers.get("content-type")} (attempt ${attempt})`);

      if (upstream.status === 403) {
        clearTimeout(timeout);
        return new Response(JSON.stringify({ error: "Signed URL expired (403)" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!upstream.ok) {
        clearTimeout(timeout);
        throw new Error(`Upstream error ${upstream.status}`);
      }

      const contentType = upstream.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        clearTimeout(timeout);
        return new Response(JSON.stringify({ error: `Invalid content type: ${contentType}` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const buffer = await upstream.arrayBuffer();
      clearTimeout(timeout);

      console.log(`[PROXY] SIZE: ${buffer.byteLength} bytes`);

      if (buffer.byteLength < MIN_IMAGE_BYTES) {
        return new Response(JSON.stringify({ error: `Image too small / corrupted: ${buffer.byteLength} bytes` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(buffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "Content-Length": String(buffer.byteLength),
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      console.error(`[PROXY] attempt ${attempt} error:`, lastErr.message);
    }
  }

  return new Response(JSON.stringify({ error: lastErr.message }), {
    status: 502,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const reqUrl = new URL(req.url);

  // ── GET /generate?proxyUrl=... ── proxy a replicate.delivery image
  if (req.method === "GET" && reqUrl.searchParams.has("proxyUrl")) {
    const proxyUrl = reqUrl.searchParams.get("proxyUrl")!;
    console.log("[PROXY] fetching:", proxyUrl.substring(0, 80));
    return proxyImage(proxyUrl);
  }

  // ── GET /generate?id=... ── poll prediction status
  if (req.method === "GET" && reqUrl.searchParams.has("id")) {
    const predictionId = reqUrl.searchParams.get("id")!;
    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateApiKey) {
      return new Response(JSON.stringify({ error: "REPLICATE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { "Authorization": `Bearer ${replicateApiKey}` },
      });

      if (!res.ok) {
        const text = await res.text();
        return new Response(JSON.stringify({ error: `Replicate status check failed (${res.status}): ${text.substring(0, 200)}` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prediction = await res.json() as Record<string, unknown>;
      const status = prediction.status as string;

      console.log(`[STATUS] id=${predictionId} status=${status}`);

      if (status === "succeeded") {
        console.log("REPLICATE OUTPUT:", JSON.stringify(prediction.output)?.substring(0, 300));
        const outputUrl = extractOutputUrl(prediction.output);
        console.log("PARSED IMAGE URL:", outputUrl?.substring(0, 200) ?? "(none)");
        if (!outputUrl) {
          return new Response(JSON.stringify({ status: "failed", error: "Output URL could not be extracted" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ status: "succeeded", output: outputUrl }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (status === "failed" || status === "canceled") {
        const errDetail = JSON.stringify(prediction.error ?? prediction.logs ?? status);
        console.error(`[STATUS] prediction ${status}:`, errDetail);
        return new Response(JSON.stringify({ status, error: errDetail }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // starting / processing
      return new Response(JSON.stringify({ status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[STATUS ERROR]", msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── POST /generate ── start a new prediction and return its ID immediately
  if (req.method === "POST") {
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
          JSON.stringify({ error: "Missing required field: reference" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!person1 || !person2) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: person1, person2" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (reference.size === 0) {
        return new Response(
          JSON.stringify({ error: "reference file is empty" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      for (const [label, file] of [["person1", person1], ["person2", person2]] as [string, File][]) {
        if (file.size === 0) {
          return new Response(
            JSON.stringify({ error: `${label} file is empty` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const hasMan2 = !!person1b && person1b.size > 0;
      const hasWoman2 = !!person2b && person2b.size > 0;

      const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
      if (!replicateApiKey) throw new Error("REPLICATE_API_KEY not configured");

      // ── Locked styles: fully isolated, no global changes can affect them ──
      const LOCKED_STYLES = ["zootopia", "cinderella"];
      const isLocked = typeof referenceId === "string" &&
        LOCKED_STYLES.some((s) => referenceId.startsWith(s));

      // ── IMAGE ROLE MAPPING (unchanged) ──
      const manCount = hasMan2 ? 2 : 1;
      const womanCount = hasWoman2 ? 2 : 1;
      const idxScene = 0;
      const idxManStart = 1;
      const idxManEnd = idxManStart + manCount - 1;
      const idxWomanStart = idxManEnd + 1;
      const idxWomanEnd = idxWomanStart + womanCount - 1;
      const totalImages = 1 + manCount + womanCount;

      const manIdxList = manCount === 1
        ? `image_input[${idxManStart}]`
        : `image_input[${idxManStart}] and image_input[${idxManEnd}]`;
      const womanIdxList = womanCount === 1
        ? `image_input[${idxWomanStart}]`
        : `image_input[${idxWomanStart}] and image_input[${idxWomanEnd}]`;

      const roleMappingBlock = `IMAGE ROLE MAPPING (${totalImages} images total):
- image_input[${idxScene}] = base scene (pose, expression, lighting, composition source)
- ${manIdxList} = MAN identity source${manCount > 1 ? " (same person, merge into one identity)" : ""}
- ${womanIdxList} = WOMAN identity source${womanCount > 1 ? " (same person, merge into one identity)" : ""}

The man in the scene must look like the person in ${manIdxList}.
The woman in the scene must look like the person in ${womanIdxList}.
Do NOT mix man and woman identity sources.
Do NOT use image_input[${idxScene}] as an identity source.`;

      let finalPrompt: string;

      if (isLocked) {
        // FULL ISOLATION: use only the client prompt (reference's own prompt) + role mapping.
        // No UNIVERSAL_PROMPT, no modifiers, no multiImageBlock appended.
        const lockedPrompt = (typeof formData.get("prompt") === "string" && (formData.get("prompt") as string).trim().length > 0)
          ? (formData.get("prompt") as string).trim()
          : UNIVERSAL_PROMPT;
        finalPrompt = roleMappingBlock + "\n\n" + lockedPrompt;
        console.log("[PROMPT] source=locked ref=" + referenceId + " base_len=" + lockedPrompt.length + " final_len=" + finalPrompt.length);
      } else {
        // NORMAL FLOW
        const clientPrompt = formData.get("prompt");
        const hasCustomPrompt = typeof clientPrompt === "string" && clientPrompt.trim().length > 0;
        const basePrompt = hasCustomPrompt ? (clientPrompt as string).trim() : UNIVERSAL_PROMPT;

        const REFERENCE_MODIFIERS: Record<string, string> = {
          "euphoria-1": "Force strong identity replacement for the face. Fully override the original facial identity and remove any resemblance to the original actress. The face must clearly match the identity images, even in close-up shots. Do not preserve original facial features or structure.",
          "euphoria-3": "Match warm cinematic low-light precisely. Apply the same color grading, shadow depth, and soft directional lighting from the scene to the faces. Ensure skin tones are affected by the scene lighting and not neutral. Increase shadow contrast on the face to match the original scene. Apply natural film grain, subtle noise, and slight color imperfection to the face. Reduce skin smoothness and avoid clean or studio-like appearance. Ensure the face inherits the same cinematic texture as the scene.",
        };
        const modifier = (typeof referenceId === "string" && REFERENCE_MODIFIERS[referenceId]) || "";

        const multiImageBlock = (hasMan2 || hasWoman2)
          ? `\n\nIf multiple identity images are provided for the same person, treat them as the same identity and combine their features consistently.`
          : "";

        finalPrompt = roleMappingBlock + "\n\n" + basePrompt + multiImageBlock + (modifier ? "\n\n" + modifier : "");
        console.log("[PROMPT] source=" + (hasCustomPrompt ? "custom" : "universal") + " base_len=" + basePrompt.length + " final_len=" + finalPrompt.length);
      }

      // ── Build image array ──
      const personDataUrls = await Promise.all([
        fileToDataUrl(person1),
        ...(hasMan2 ? [fileToDataUrl(person1b!)] : []),
        fileToDataUrl(person2),
        ...(hasWoman2 ? [fileToDataUrl(person2b!)] : []),
      ]);

      const referenceDataUrl = await fileToDataUrl(reference);
      const images = [referenceDataUrl, ...personDataUrls];

      if (images.length !== totalImages) {
        throw new Error(`Image count mismatch: expected ${totalImages}, got ${images.length}`);
      }

      // Per-image size guard
      for (let i = 0; i < images.length; i++) {
        const rawBytes = base64ByteSize(images[i]);
        if (rawBytes > IMAGE_SIZE_LIMIT_BYTES) {
          throw new Error(`Image ${i} is ${(rawBytes / 1024 / 1024).toFixed(2)}MB — exceeds the 6MB per-image limit. Please use a smaller or more compressed photo.`);
        }
      }

      const imageSummary = images.map((img, i) => ({
        index: i,
        mime: img.startsWith("data:") ? img.substring(5, img.indexOf(";")) : "unknown",
        bytes: base64ByteSize(img),
      }));
      console.log("[MODEL INPUT]", JSON.stringify({
        model: MODEL_NAME,
        version: MODEL_VERSION,
        referenceId,
        promptSource,
        promptLength: finalPrompt.length,
        imageCount: images.length,
        images: imageSummary,
        totalMB: (imageSummary.reduce((s, x) => s + x.bytes, 0) / 1024 / 1024).toFixed(2),
      }));

      // ── Create prediction WITHOUT waiting for it to complete ──
      const createRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${replicateApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: MODEL_VERSION,
          input: { prompt: finalPrompt, image_input: images },
        }),
      });

      const createText = await createRes.text();
      console.log("[CREATE] status:", createRes.status, "body:", createText.substring(0, 500));

      if (!createRes.ok) {
        throw new Error(`Replicate prediction creation failed (${createRes.status}): ${createText.substring(0, 400)}`);
      }

      let prediction: Record<string, unknown>;
      try {
        prediction = JSON.parse(createText);
      } catch {
        throw new Error(`Replicate create response non-JSON: ${createText.substring(0, 300)}`);
      }

      const predictionId = prediction.id as string | undefined;
      if (!predictionId) {
        throw new Error(`Replicate prediction has no ID: ${JSON.stringify(prediction).substring(0, 300)}`);
      }

      console.log("[CREATE] prediction started id=" + predictionId + " status=" + prediction.status);

      return new Response(JSON.stringify({ id: predictionId, status: prediction.status }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("[GENERATE ERROR]", msg);
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
