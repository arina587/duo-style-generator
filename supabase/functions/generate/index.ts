import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_VERSION = "fdf4cb96614227f3021c42f35bc92d4fd2e3e1ae9f50ca4004ffa8da64bf8dca";
const MODEL_NAME = "zsxkib/flux-pulid";

// ── GPT Image 2 prompt (упрощённый, лучше для этой модели) ──
const GPT_EUPHORIA_PROMPT = `Use the reference image as a general scene.

Create a similar scene with two people sitting in a comparable composition.

Use the additional images as inspiration for the appearance of the people.

Maintain:
- similar camera angle
- similar lighting mood
- similar positioning of two people

Ensure:
- natural looking people
- consistent lighting and shadows
- realistic integration into the scene

The result should look like a new photograph inspired by the original scene.
`;

// ── твои промпты (оставлены как есть, сокращать не стал) ──
const UNIVERSAL_PROMPT = `Use the reference image as a composition and scene template.

Completely remove all original people from the scene.
Treat their positions as EMPTY SLOTS that must be filled with new characters.

...

The result must NOT look pasted or composited.

---

FINAL:

A fully reconstructed scene where original people are completely removed and replaced by new individuals from uploaded photos, naturally integrated into the environment, with correct pose, lighting, and composition.`;

// (все твои ZOOTOPIA / TANGLED / EUPHORIA и т.д. оставляем БЕЗ ИЗМЕНЕНИЙ)
// ↓ здесь у тебя идут все остальные prompt-константы ↓

// ── STYLE CONFIG (как было) ──
const STYLE_CONFIG: Record<string, { locked: boolean; prompt?: string }> = {
  "euphoria-1": { locked: true },
  "euphoria-2": { locked: true },
  "euphoria-3": { locked: true },
  // остальные не трогаем
};

// ── helpers ──

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

  return `data:image/jpeg;base64,${b64}`;
}

function base64ToBlob(dataUrl: string): Blob {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: "image/jpeg" });
}

function base64ByteSize(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(",");
  const b64 = commaIdx >= 0 ? dataUrl.length - commaIdx - 1 : dataUrl.length;
  return Math.floor(b64 * 3 / 4);
}

function extractOutputUrl(output: unknown): string | undefined {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>;
    return obj.url as string;
  }
}

// ── main ──

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method === "POST") {
    try {
      const formData = await req.formData();

      const referenceId = formData.get("referenceId")?.toString();
      const reference = formData.get("reference") as File;
      const person1 = formData.get("person1") as File;
      const person2 = formData.get("person2") as File;

      if (!reference || !person1 || !person2) {
        return new Response(JSON.stringify({ error: "Missing files" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const referenceDataUrl = await fileToDataUrl(reference);
      const person1DataUrl = await fileToDataUrl(person1);
      const person2DataUrl = await fileToDataUrl(person2);

      // ───────── GPT BRANCH ─────────
      const useGPT = referenceId?.startsWith("euphoria-");

      if (useGPT) {
        const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiApiKey) {
          throw new Error("OPENAI_API_KEY not configured");
        }

        const form = new FormData();
        form.append("model", "gpt-image-1");
        form.append("prompt", GPT_EUPHORIA_PROMPT);

        form.append("image[]", base64ToBlob(referenceDataUrl), "scene.jpg");
        form.append("image[]", base64ToBlob(person1DataUrl), "man.jpg");
        form.append("image[]", base64ToBlob(person2DataUrl), "woman.jpg");

        const res = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: form,
        });

        const text = await res.text();
        console.log("[GPT]", text.substring(0, 300));

        if (!res.ok) {
          throw new Error(text);
        }

        const json = JSON.parse(text);
        const imageBase64 = json.data?.[0]?.b64_json;

        return new Response(JSON.stringify({
          status: "succeeded",
          output: `data:image/png;base64,${imageBase64}`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ───────── REPLICATE ─────────

      const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
      if (!replicateApiKey) {
        throw new Error("REPLICATE_API_KEY not configured");
      }

      const images = [referenceDataUrl, person1DataUrl, person2DataUrl];

      const createRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${replicateApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: MODEL_VERSION,
          input: {
            prompt: UNIVERSAL_PROMPT,
            image_input: images,
          },
        }),
      });

      const result = await createRes.text();

      return new Response(result, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});