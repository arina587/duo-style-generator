import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_VERSION = "fdf4cb96614227f3021c42f35bc92d4fd2e3e1ae9f50ca4004ffa8da64bf8dca";
const MODEL_NAME = "zsxkib/flux-pulid";

const UNIVERSAL_PROMPT = `Use the reference image as a composition and scene template.

Completely remove all original people from the scene.
Treat their positions as EMPTY SLOTS that must be filled with new characters.

---

CHARACTER REPLACEMENT (STRICT):

Replace characters using the uploaded identity photos:

— the woman in the scene → replace with the woman from the uploaded female photo  
— the man in the scene → replace with the man from the uploaded male photo  

Gender must match exactly. Do NOT swap roles.

---

EMPTY SLOT PLACEMENT (CRITICAL):

The original characters must be considered non-existent.

Place the new people into the exact same spatial positions where the original people were:

— same location in frame  
— same scale  
— same depth  
— same perspective  

Do NOT reuse any part of the original bodies.

---

FULL RECONSTRUCTION:

Rebuild each person completely from the identity images:

— full body  
— face  
— proportions  
— silhouette  

Do NOT perform face swap.
Do NOT mix identities.
Do NOT blend with original characters.

---

IDENTITY (CRITICAL):

Preserve the real appearance from uploaded photos:

— facial structure  
— features (eyes, nose, lips)  
— proportions  
— skin tone  
— hair  

Identity must remain clearly recognizable.

---

CLOTHING ADAPTATION (IMPORTANT):

Clothing should be adapted to fit the scene naturally:

— keep general style consistent with the scene  
— allow changes in clothing details if needed  
— avoid exact copying of the original outfit  
— avoid mismatch with environment or lighting  

The result must feel like the person belongs in this scene.

---

POSE & COMPOSITION (STRICT):

Preserve:
— camera angle  
— pose structure  
— body orientation  
— spacing between people  
— framing and crop  

Important:
Match pose and placement, NOT original anatomy or identity.

---

LIGHTING & INTEGRATION (CRITICAL):

Fully integrate the new people into the scene:

— match lighting direction  
— match shadows  
— match color grading  
— match depth of field  
— match noise / grain  

Faces and bodies must inherit scene lighting.

The result must NOT look pasted or composited.

---

FINAL:

A fully reconstructed scene where original people are completely removed and replaced by new individuals from uploaded photos, naturally integrated into the environment, with correct pose, lighting, and composition.`;

// ── Per-style prompt constants ──

const ZOOTOPIA_1 = `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the fox (left) with the uploaded man and the rabbit (right) with the uploaded woman. Recreate them as stylized 3D animated human characters in the same Pixar/Disney-quality CGI style, not as pasted faces.

STRICT IDENTITY PRESERVATION (ENHANCED):
Faces must remain highly recognizable:
— exact facial proportions and bone structure
— eye shape, spacing, eyelids, eyebrows
— nose shape and bridge
— lip shape and mouth width
— jawline and chin
— natural skin tone adapted to scene lighting
— hairstyle, hair color, and hair length must match the uploaded photos

CRITICAL POSE LOCK (ABSOLUTE):
— both characters extremely close, cheek-to-cheek
— heads slightly tilted inward toward each other
— camera held at arm's length by the woman on the right
— tight selfie framing, cropped like a phone photo
— both looking directly into the camera

Do NOT change angle, framing, distance, or head tilt.

CRITICAL EXPRESSION LOCK:
— man: relaxed, slightly smug half-smile
— woman: soft friendly smile

CRITICAL STYLE:
Full Pixar/Disney 3D look — soft shading, clean stylized skin, expressive eyes.

CRITICAL SCENE LOCK:
Keep plain neutral background, framing, and lighting EXACTLY the same.

CRITICAL HANDS (VERY IMPORTANT):
All hands must be human — anatomically correct, realistic proportions, clearly defined fingers.
Each hand must have exactly five fingers.
Correct perspective for a selfie grip, no deformation, no fusion, no missing fingers.

FINAL:
Identical selfie composition with stylized human characters, strong identity match, no pose drift.`;

const ZOOTOPIA_2 = `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the fox (left) with the uploaded man and the rabbit (right) with the uploaded woman. Recreate them as stylized 3D animated human characters in the same Pixar/Disney CGI style.

STRICT IDENTITY PRESERVATION:
Faces must remain fully recognizable and consistent with uploaded photos (facial structure, features, proportions, hair).

CRITICAL POSE LOCK (ABSOLUTE):
— characters pressed tightly together
— woman (right) leans strongly into the man's face
— her cheek pushes into his cheek
— man's head slightly turned away due to pressure
— camera held by woman at arm's length
— very tight selfie framing

Do NOT loosen contact. Do NOT reposition heads.

CRITICAL EXPRESSION LOCK:
— woman: playful, energetic, wide smile
— man: slightly uncomfortable, compressed expression

CRITICAL CONTACT PHYSICS:
Maintain visible cheek compression and skin contact.

CRITICAL STYLE:
Same high-end Pixar/Disney 3D rendering.

CRITICAL SCENE LOCK:
Keep background and lighting identical.

CRITICAL HANDS (VERY IMPORTANT):
All visible hands must be human — anatomically correct, natural proportions.
Exactly five fingers per hand.
No distortion, no merging fingers, correct perspective for selfie position.

FINAL:
Same tight, compressed selfie moment, exact pose preserved, stylized human version.`;

const ZOOTOPIA_3 = `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the fox (left) with the uploaded man and the rabbit (right) with the uploaded woman.

Recreate them as stylized Pixar-style 3D CGI humans matching the exact cinematic visual style of the reference image.

Generate fully reconstructed human characters naturally integrated into the scene.

---

PRIORITY ORDER (STRICT):

1) Identity from uploaded photos  
2) Original pose and composition  
3) Lighting and visual style  

---

IDENTITY (CRITICAL):

Preserve identity with high accuracy:

— facial structure and proportions  
— eye shape, eyebrows, eyelids  
— nose shape  
— lips and jawline  
— skin tone adapted to scene lighting  
— hairstyle, hair color, and hair length  

Do NOT:
— genericize faces  
— mix identities  
— stylize away identity  

---

BODY & PROPORTIONS (CRITICAL):

The fox and rabbit are ONLY pose references.

Both characters must be fully human with realistic human anatomy.

Remove all animal features:
— paws
— fur
— tails
— whiskers
— animal ears
— animal limbs

The woman must have full realistic adult human proportions.

She must NOT be:
— tiny
— shortened
— compressed
— scaled down compared to the man

The man and woman must have natural proportional adult human height relative to each other.

The woman must be standing naturally with fully human legs and realistic feminine body proportions.

The man must have two fully human arms and two fully human hands with exactly five fingers on each hand.

The left arm wrapped around the woman must also be fully human with realistic anatomy and a realistic human hand.

No paws.
No claws.
No extra fingers.
No missing fingers.
No animal anatomy.

---

POSE & COMPOSITION (STRICT):

Man:
— raised arm holding a phone in selfie position  
— slight head tilt toward the woman  
— relaxed confident posture  

Woman:
— standing naturally close to the man  
— slight lean toward him  

Preserve:
— selfie composition  
— camera angle  
— framing and crop  
— perspective  
— depth  

Do NOT change composition or camera perspective.

---

EXPRESSION:

Man:
— confident playful smirk  

Woman:
— cheerful slightly mischievous smile  

---

LIGHTING & COLOR:

Match the original scene lighting:

— colorful nightclub lighting  
— magenta, purple, and blue tones  
— mixed ambient lighting  
— realistic color reflections on skin  

Preserve:
— light direction  
— atmosphere  
— cinematic contrast  
— depth of field  
— film grain  

Faces and bodies must fully inherit scene lighting.

---

SCENE LOCK:

Do NOT change:
— environment  
— background characters  
— lighting setup  
— composition  

Only replace the characters.

---

INTEGRATION:

Rebuild the characters naturally inside the original positions with correct perspective and depth.

Ensure seamless cinematic integration.

No pasted faces.
No furry anatomy.
No animal limbs.
No face swap artifacts.

---

FINAL:

A high-quality Pixar-style 3D CGI cinematic image of two fully human characters based on the uploaded photos, with realistic human anatomy, proportional body sizes, correct human hands and legs, accurate identity, cinematic lighting, and stable composition.`;

const TANGLED_1 = `Use the provided reference image and separately uploaded photos of the man and the woman.

Treat the reference image as a scene template ONLY (composition, pose, lighting).

CRITICAL RULE:
The original characters must NOT be used as identity source in any way.

Do NOT use:
— their faces
— their head shapes
— their facial proportions
— their skin tones
— any part of their identity

They must be completely ignored.

---

FULL CHARACTER REPLACEMENT (ABSOLUTE):

Replace both characters completely:

— man from uploaded male photo → left position
— woman from uploaded female photo → right position

Rebuild them as entirely new people based ONLY on uploaded identity images.

Do NOT reuse or preserve any original character features.

---

STRICT IDENTITY PRESERVATION (ENHANCED):

Faces must remain highly recognizable:
— exact facial proportions and bone structure
— eye shape, spacing, eyelids, eyebrows
— nose shape and bridge
— lip shape and mouth width
— jawline and chin
— natural skin tone adapted to scene lighting
— hairstyle, hair color, and hair length

---

CRITICAL POSE LOCK (ABSOLUTE):

— man (left) holding the woman closely
— woman (right) leaning into the man
— faces very close with strong eye contact
— woman looking up toward the man
— man looking down toward the woman
— bodies positioned chest-to-chest

Do NOT change angle, framing, or positioning.

---

CRITICAL STYLE:

Recreate characters in Pixar/Disney 3D CGI style.
NOT as pasted faces — fully reconstructed characters.

---

CRITICAL LIGHTING:

— warm golden lantern lighting
— soft glow from multiple sources
— visible reflections from lanterns

Faces must inherit scene lighting, not neutral.

---

CRITICAL HANDS:

All hands must be human:
— exactly five fingers
— correct anatomy
— natural grip
— no deformation

---

FINAL:

Same romantic lantern scene, but original characters fully removed and replaced with new identities from uploaded photos.`;

const TANGLED_2 = `Use the provided reference image and separately uploaded photos of the man and the woman.

Treat the reference image as a scene template ONLY.

CRITICAL RULE:
The original characters must be completely ignored.

Do NOT use:
— their faces
— their head shapes
— their proportions
— any identity information

---

FULL CHARACTER REPLACEMENT:

Insert entirely new people:

— man from uploaded male photo → left
— woman from uploaded female photo → right

Rebuild them from scratch.

---

STRICT IDENTITY PRESERVATION:

Faces must clearly match uploaded photos:
— facial structure
— features
— proportions
— hair
— skin tone

---

CRITICAL POSE LOCK:

— man sitting relaxed, slightly turned toward the woman
— woman leaning forward with chin resting on both hands
— strong eye contact between them

Do NOT change posture or positioning.

---

CRITICAL LIGHTING:

— dark environment with warm fire light
— strong shadows present

IMPORTANT:
Faces must remain visible:
— slightly reduce shadow on faces only
— keep identity readable

---

CRITICAL STYLE:

Pixar/Disney 3D CGI characters, fully reconstructed.

---

CRITICAL HANDS:

— exactly five fingers
— correct anatomy
— proper chin support position

---

FINAL:

Same intimate night scene, but original characters completely replaced with new identities.`;

const TANGLED_3 = `Use the provided reference image and separately uploaded photos of the man and the woman.

Treat the reference image as a composition and pose template ONLY.

CRITICAL RULE:
The original characters must NOT be used in any way.

Do NOT use:
— faces
— body shapes
— proportions
— identity elements

They must be treated as non-existent.

---

FULL CHARACTER REPLACEMENT:

Create new people:

— man → left
— woman → right

Using ONLY uploaded identity photos.

---

STRICT IDENTITY PRESERVATION:

Preserve:
— facial structure
— proportions
— features
— skin tone
— hair

---

CRITICAL POSE LOCK:

— man leading the movement, slightly leaning forward
— holding the woman's hand
— woman extending arm toward him
— maintaining natural dance spacing

Do NOT change interaction or gesture.

---

CRITICAL SCENE LOCK:

Keep:
— crowd
— architecture
— perspective
— framing

---

CRITICAL LIGHTING:

— natural daylight
— soft shadows
— consistent color temperature

Faces must match scene lighting.

---

CRITICAL STYLE:

Pixar/Disney CGI, fully reconstructed characters.

---

CRITICAL HANDS:

— exactly five fingers
— correct anatomy
— natural interaction

---

FINAL:

Same dance scene, but with completely new characters replacing the originals.`;

const CINDERELLA_PROMPT = `Use the reference scene image as the absolute base. Perform ONLY character identity replacement.

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

const EUPHORIA_1 = `Use the reference image as a composition and scene template.

Completely remove the two original main characters from the scene before generation.

The original people must be treated as fully nonexistent and permanently discarded.

Forget the original actors completely.

Do NOT preserve, reuse, transform, edit, blend, or inherit ANY part of the original people:
— faces
— heads
— bodies
— anatomy
— facial structure
— skin
— proportions
— silhouettes
— identity
— facial geometry

Absolutely nothing from the original actors may remain visible in the final image.

Treat their positions as EMPTY SLOTS that must be filled with completely new people from the uploaded photos.

---

CHARACTER GENERATION (STRICT):

Generate completely new realistic people using ONLY the uploaded identity photos:

— the woman in the scene → generate from uploaded female photo  
— the man in the scene → generate from uploaded male photo  

The uploaded photos are the ONLY source of identity and appearance information.

Do NOT perform face swap.
Do NOT place new faces onto original bodies.
Do NOT morph existing actors.
Do NOT blend identities.

Do NOT transfer ONLY the faces.

Instead, fully recreate the ENTIRE people from the uploaded photos:
— full face
— full head
— full body
— anatomy
— proportions
— silhouette
— skin
— hair

The final people must look like they were naturally photographed in the scene from the beginning.

---

EMPTY SLOT PLACEMENT:

Place the generated people into the same positions where the original people were:

— same location in frame  
— same scale  
— same depth  
— same perspective  

Preserve only:
— environment
— composition
— camera angle
— framing
— body positioning
— spacing between people
— cinematic atmosphere

---

IDENTITY (CRITICAL):

Preserve the real appearance from uploaded photos:

— facial structure  
— eyes  
— nose  
— lips  
— skin tone  
— hair  
— proportions  

Identity must remain clearly recognizable.

---

LIGHTING & INTEGRATION:

Fully and realistically adapt the generated people to the cinematic environment:

— match lighting direction  
— match realistic shadows  
— match color grading  
— match depth of field  
— match film grain  
— match low-light skin shading  
— match lens softness  

The generated people must look physically present in the environment.

The result must NOT look pasted, composited, face-swapped, or AI-generated.

---

FINAL:

A fully reconstructed cinematic image where the original actors are completely erased and forgotten, and entirely new people from the uploaded photos are naturally generated into the same scene.`;

const EUPHORIA_2 = `Use the reference image as a composition and scene template.

Completely remove all original people from the scene.
Treat their positions as EMPTY SLOTS that must be filled with new characters.

---

CHARACTER REPLACEMENT (STRICT):

Replace characters using the uploaded identity photos:

— the woman in the scene → replace with the woman from the uploaded female photo  
— the man in the scene → replace with the man from the uploaded male photo  

Gender must match exactly. Do NOT swap roles.

---

EMPTY SLOT PLACEMENT (CRITICAL):

The original characters must be considered non-existent.

Place the new people into the exact same spatial positions where the original people were:

— same location in frame  
— same scale  
— same depth  
— same perspective  

Do NOT reuse any part of the original bodies.

---

FULL RECONSTRUCTION:

Rebuild each person completely from the identity images:

— full body  
— face  
— proportions  
— silhouette  

Do NOT perform face swap.
Do NOT mix identities.
Do NOT blend with original characters.

---

IDENTITY (CRITICAL):

Preserve the real appearance from uploaded photos:

— facial structure  
— features (eyes, nose, lips)  
— proportions  
— skin tone  
— hair  

Identity must remain clearly recognizable.

---

CLOTHING ADAPTATION (IMPORTANT):

Clothing should be adapted to fit the scene naturally:

— keep general style consistent with the scene  
— allow changes in clothing details if needed  
— avoid exact copying of the original outfit  
— avoid mismatch with environment or lighting  

The result must feel like the person belongs in this scene.

---

POSE & COMPOSITION (STRICT):

Preserve:
— camera angle  
— pose structure  
— body orientation  
— spacing between people  
— framing and crop  

Important:
Match pose and placement, NOT original anatomy or identity.

---

LIGHTING & INTEGRATION (CRITICAL):

Fully integrate the new people into the scene:

— match lighting direction  
— match shadows  
— match color grading  
— match depth of field  
— match noise / grain  

Faces and bodies must inherit scene lighting.

The result must NOT look pasted or composited.

---

FINAL:

A fully reconstructed scene where original people are completely removed and replaced by new individuals from uploaded photos, naturally integrated into the environment, with correct pose, lighting, and composition.`;

const EUPHORIA_3 = `Use the reference image as a composition and scene template.

Completely remove all original people from the scene.
Treat their positions as EMPTY SLOTS that must be filled with new characters.

---

CHARACTER REPLACEMENT (STRICT):

Replace characters using the uploaded identity photos:

— the woman in the scene → replace with the woman from the uploaded female photo  
— the man in the scene → replace with the man from the uploaded male photo  

Gender must match exactly. Do NOT swap roles.

---

EMPTY SLOT PLACEMENT (CRITICAL):

The original characters must be considered non-existent.

Place the new people into the exact same spatial positions where the original people were:

— same location in frame  
— same scale  
— same depth  
— same perspective  

Do NOT reuse any part of the original bodies.

---

FULL RECONSTRUCTION:

Rebuild each person completely from the identity images:

— full body  
— face  
— proportions  
— silhouette  

Do NOT perform face swap.
Do NOT mix identities.
Do NOT blend with original characters.

---

IDENTITY (CRITICAL):

Preserve the real appearance from uploaded photos:

— facial structure  
— features (eyes, nose, lips)  
— proportions  
— skin tone  
— hair  

Identity must remain clearly recognizable.

---

CLOTHING ADAPTATION (IMPORTANT):

Clothing should be adapted to fit the scene naturally:

— keep general style consistent with the scene  
— allow changes in clothing details if needed  
— avoid exact copying of the original outfit  
— avoid mismatch with environment or lighting  

The result must feel like the person belongs in this scene.

---

POSE & COMPOSITION (STRICT):

Preserve:
— camera angle  
— pose structure  
— body orientation  
— spacing between people  
— framing and crop  

Important:
Match pose and placement, NOT original anatomy or identity.

---

LIGHTING & INTEGRATION (CRITICAL):

Fully integrate the new people into the scene:

— match lighting direction  
— match shadows  
— match color grading  
— match depth of field  
— match noise / grain  

Faces and bodies must inherit scene lighting.

The result must NOT look pasted or composited.

---

FINAL:

A fully reconstructed scene where original people are completely removed and replaced by new individuals from uploaded photos, naturally integrated into the environment, with correct pose, lighting, and composition.`;

const TITANIC_1 = `Use the reference image as a composition and cinematic scene template.

Completely remove the original man and woman from the scene.
Treat them as EMPTY SLOTS only.

The original characters must be considered fully nonexistent.

Do NOT preserve, reuse, transform, blend, or inherit any part of the original people:
— faces
— bodies
— anatomy
— facial structure
— skin
— proportions
— silhouettes
— hair
— identity traits

Do NOT perform face swap.

---

CHARACTER REPLACEMENT (STRICT):

Generate completely new realistic people using ONLY the uploaded identity photos:

— the woman in the scene → generate from uploaded female photo  
— the man in the scene → generate from uploaded male photo  

The uploaded photos are the ONLY source of identity and appearance information.

Do NOT mix identities.
Do NOT morph existing actors.
Do NOT place new faces onto original bodies.

Rebuild both people completely from scratch:
— full body
— face
— head
— arms
— hands
— proportions
— silhouette

---

EMPTY SLOT PLACEMENT (CRITICAL):

Place the new people into the exact same positions where the original characters were:

Woman:
— standing at the front of the ship
— arms fully extended outward
— body leaning slightly forward
— same perspective and framing

Man:
— standing directly behind the woman
— body close behind her
— same relative position and spacing

Preserve:
— camera angle
— composition
— perspective
— framing
— cinematic spacing
— ship environment

Do NOT alter composition or perspective.

---

BODY & PROPORTIONS (CRITICAL):

The woman must have full realistic adult human proportions.

She must NOT be:
— tiny
— shortened
— compressed
— scaled down compared to the man

The couple must have natural proportional adult human scale relative to each other.

The woman’s arms must remain fully human and anatomically correct while extended outward.

The man must have two fully human arms and two fully human hands with exactly five fingers on each hand.

No:
— extra fingers
— missing fingers
— distorted anatomy
— broken arms
— unrealistic proportions

---

IDENTITY (CRITICAL):

Preserve the real appearance from uploaded photos:

— facial structure
— eyes
— nose
— lips
— jawline
— skin tone
— hair
— facial proportions

Identity must remain clearly recognizable.

---

CLOTHING ADAPTATION:

Adapt clothing naturally to the cinematic Titanic-style scene.

Preserve:
— elegant romantic aesthetic
— flowing fabric feeling
— cinematic realism

Allow natural clothing adaptation to fit the uploaded identities.

---

LIGHTING & INTEGRATION (CRITICAL):

Fully integrate the generated people into the scene.

Accurately match:
— warm sunset lighting
— golden-hour skin tones
— cinematic shadows
— atmospheric haze
— depth of field
— film grain
— cinematic color grading
— realistic light direction

Faces and bodies must fully inherit scene lighting.

The result must NOT look pasted, composited, or AI-generated.

---

FINAL:

A fully reconstructed cinematic Titanic-style scene where the original couple is completely removed and replaced by new realistic people from the uploaded photos, naturally integrated into the environment with accurate identity, realistic anatomy, cinematic lighting, and stable composition.`;

const TITANIC_2 = ``;

const TITANIC_3 = ``;

// ── All styles. locked: true → use config.prompt. locked: false → use UNIVERSAL_PROMPT. ──
const STYLE_CONFIG: Record<string, { locked: boolean; prompt?: string }> = {
  // ── Zootopia ──
  "zootopia-1": { locked: true, prompt: ZOOTOPIA_1 },
  "zootopia-2": { locked: true, prompt: ZOOTOPIA_2 },
  "zootopia-3": { locked: true, prompt: ZOOTOPIA_3 },
  // ── Tangled ──
  "tangled-1": { locked: true, prompt: TANGLED_1 },
  "tangled-2": { locked: true, prompt: TANGLED_2 },
  "tangled-3": { locked: true, prompt: TANGLED_3 },
  // ── Cinderella ──
  "cinderella-1": { locked: true, prompt: CINDERELLA_PROMPT },
  "cinderella-2": { locked: true, prompt: CINDERELLA_PROMPT },
  "cinderella-3": { locked: true, prompt: CINDERELLA_PROMPT },
  // ── Default styles ──
  "euphoria-1": { locked: true, prompt: EUPHORIA_1 },
  "euphoria-2": { locked: true, prompt: EUPHORIA_2 },
  "euphoria-3": { locked: true, prompt: EUPHORIA_3 },
  "titanic-1": { locked: true, prompt: TITANIC_1 },
  "titanic-2": { locked: true, prompt: TITANIC_2 },
  "titanic-3": { locked: true, prompt: TITANIC_3 },
  "spiderman-1": { locked: false },
  "spiderman-2": { locked: false },
  "spiderman-3": { locked: false },
  "terabithia-1": { locked: false },
  "terabithia-2": { locked: false },
  "terabithia-3": { locked: false },
  "stranger-things-1": { locked: false },
  "stranger-things-2": { locked: false },
  "stranger-things-3": { locked: false },
  "end-of-the-fucking-world-1": { locked: false },
  "end-of-the-fucking-world-2": { locked: false },
  "end-of-the-fucking-world-3": { locked: false },
};

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


      // ── IMAGE ROLE MAPPING ──
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

      const config = STYLE_CONFIG[referenceId as string];
      if (!config) {
        throw new Error(`Unknown referenceId: ${referenceId}`);
      }

      const finalPrompt = config.locked
        ? roleMappingBlock + "\n\n" + config.prompt
        : roleMappingBlock + "\n\n" + UNIVERSAL_PROMPT;

      console.log("[PROMPT] locked=" + config.locked + " ref=" + referenceId + " final_len=" + finalPrompt.length);

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
        promptSource: config.locked ? "locked" : "universal",
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