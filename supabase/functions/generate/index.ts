import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_VERSION = "google/nano-banana-pro";

// ── Universal prompt (used for styles with locked: false) ──
const UNIVERSAL_PROMPT = `Use the reference image as a composition and scene template.

Erase all original people from the scene. Their positions are empty slots — fill them with the people from the uploaded identity photos.

CHARACTER REPLACEMENT:
— woman in the scene → woman from the uploaded female photo
— man in the scene → man from the uploaded male photo
Gender must match exactly. Do NOT swap roles.

PLACEMENT:
Place each new person into the exact spatial position of the original:
— same location, scale, depth, and perspective.

FULL RECONSTRUCTION:
Rebuild each person entirely from their identity image — face, body, proportions, silhouette.
Do NOT face-swap. Do NOT blend with original characters.

IDENTITY:
Preserve from uploaded photos: facial structure, features, skin tone, hair, proportions.
Identity must remain clearly recognizable.

CLOTHING:
Adapt clothing naturally to the scene — match the style and environment, avoid mismatched outfits.

POSE & COMPOSITION:
Preserve camera angle, pose structure, body orientation, spacing, framing.
Match pose and placement, NOT original anatomy.

LIGHTING & INTEGRATION:
Fully integrate into the scene — match lighting direction, shadows, color grading, depth of field, grain.
Faces and bodies must inherit scene lighting. Result must not look pasted or composited.`;

// ── Per-style prompt constants ──

const ZOOTOPIA_1 = `Replace the fox (left) with the uploaded man and the rabbit (right) with the uploaded woman. Recreate them as stylized Pixar/Disney 3D CGI human characters — fully reconstructed, not face-swapped.

IDENTITY:
Faces must be highly recognizable: facial proportions, bone structure, eye shape, nose, lips, jawline, skin tone, hairstyle and color.

POSE (ABSOLUTE):
— both characters cheek-to-cheek, heads slightly tilted inward
— woman (right) holds camera at arm's length
— tight selfie framing, both looking directly into the camera
Do NOT change angle, framing, or head tilt.

EXPRESSION: man — relaxed half-smile. Woman — soft friendly smile.

STYLE: Full Pixar/Disney 3D — soft shading, clean skin, expressive eyes. Plain neutral background, unchanged.

HANDS: Human, anatomically correct, exactly five fingers, correct selfie grip perspective.`;

const ZOOTOPIA_2 = `Replace the fox (left) with the uploaded man and the rabbit (right) with the uploaded woman as stylized Pixar/Disney 3D CGI humans.

IDENTITY: Faces fully recognizable — facial structure, features, proportions, hair.

POSE (ABSOLUTE):
— woman (right) leans hard into the man's face, cheek pressing into his cheek
— man's head tilts slightly away from the pressure
— woman holds camera at arm's length, very tight selfie framing
Do NOT loosen contact. Do NOT reposition heads.

EXPRESSION: woman — playful, wide smile. Man — slightly uncomfortable, compressed expression.
CONTACT: Visible cheek compression and skin contact must be maintained.

STYLE: High-end Pixar/Disney 3D rendering. Background and lighting identical to reference.

HANDS: Human, exactly five fingers, no distortion, correct selfie perspective.`;

const ZOOTOPIA_3 = `Replace the fox (left) with the uploaded man and the rabbit (right) with the uploaded woman as fully human Pixar-style 3D CGI characters integrated into the scene.

PRIORITY: 1) Identity from uploaded photos  2) Original pose and composition  3) Lighting and style

IDENTITY:
Preserve with high accuracy: facial structure, eye shape, nose, lips, jawline, skin tone, hairstyle, hair color and length. Do NOT genericize or mix identities.

BODY:
Both characters must be fully human with realistic adult anatomy. The fox and rabbit are pose references only — remove all animal features (paws, fur, tails, ears, claws). Woman must have full realistic adult proportions, not shortened or compressed. Man must have two fully human arms and hands with exactly five fingers each. No animal anatomy anywhere.

POSE:
Man — raised arm holding phone in selfie position, slight head tilt, relaxed confident posture.
Woman — naturally close to the man, slight lean toward him.
Preserve selfie composition, camera angle, framing, depth. Do NOT change perspective.

EXPRESSION: Man — confident playful smirk. Woman — cheerful, slightly mischievous smile.

LIGHTING: Colorful nightclub lighting — magenta, purple, blue tones, mixed ambient sources, color reflections on skin. Match light direction, atmosphere, cinematic contrast, depth of field, film grain. Faces fully inherit scene lighting.

SCENE: Do NOT change environment, background characters, or composition. Only replace characters.

HANDS: Exactly five fingers, correct anatomy, natural placement. Man holds smartphone in proper selfie grip.`;

const TANGLED_1 = `Use the reference image as a composition and scene template.

Erase all original characters completely. Their positions are empty slots — fill them with the people from the uploaded photos.

REPLACEMENT:
— woman slot → woman from uploaded female photo
— man slot → man from uploaded male photo

Do NOT swap genders or roles.

STYLE:
Disney/Pixar-style high-end 3D CGI animated movie aesthetic.
Stylized cinematic animated rendering with realistic facial identity preservation.

RECONSTRUCTION:
Rebuild each person fully:
— full body
— face
— proportions
— silhouette
— anatomy

Do NOT face-swap.
Do NOT blend with original characters.
Do NOT preserve original character anatomy or facial features.

Generate entirely new Disney/Pixar-style characters based ONLY on the uploaded people.

IDENTITY:
Preserve:
— facial structure
— facial proportions
— eye shape
— nose
— lips
— jawline
— skin tone
— hairstyle
— hair color
— hair length
— body proportions
— recognizable appearance

Both people must remain clearly recognizable as the uploaded identities even in stylized animated form.

CLOTHING:
Adapt naturally to the fantasy lantern scene.
Disney/Pixar-style fantasy clothing matching the environment and cinematic mood.

POSE & COMPOSITION:
Preserve:
— exact camera angle
— exact pose
— body orientation
— spacing
— framing
— romantic interaction
— strong eye contact
— woman looking upward
— man looking downward

Match placement and composition only.
Do NOT preserve original anatomy.

LIGHTING:
Match:
— warm golden lantern lighting
— soft cinematic glow
— warm reflections on skin and hair
— atmospheric shadows
— cinematic depth of field
— subtle filmic rendering

Faces and bodies inherit scene lighting naturally.

HANDS:
Natural human anatomy.
Exactly five fingers per hand.
Correct proportions and natural positioning.

BACKGROUND:
Preserve:
— floating lanterns
— water reflections
— fantasy castle environment
— nighttime atmosphere
— original framing and perspective

INTEGRATION:
Result must look like a real Disney/Pixar-style animated movie frame with the uploaded people fully replacing the original characters naturally and recognizably.

No pasted faces.
No compositing artifacts.
No traces of the original characters.`;

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

Same dance scene, but with completely new characters replacing the originals.`

const CINDERELLA_PROMPT = `Use the original scene image as the base.

PRIMARY TASK:
Replace both character identities using the reference photos.

CHARACTER MAPPING:
- female → woman from female reference
- male → man from male reference

PRIORITY ORDER:
1. Identity replacement (highest priority)
2. Pose, body position, head angle, visibility, interaction
3. Scene, lighting, camera, background, clothing, style

IDENTITY RULES:
Completely remove the original identities.
Use only the reference identities.
Do NOT mix original and new identity.
Do NOT keep any original facial features, hair identity, or recognizable traits.

Perform full character replacement, not face swapping.

SCENE PRESERVATION:
Keep unchanged:
- pose and body alignment
- head angle and face direction
- camera, framing, perspective
- lighting, shadows, color grading
- background and all objects
- clothing and accessories

Recreate each person naturally in the same position, adapting identity to fit perspective, lighting, and body.

IDENTITY ACCURACY:
Preserve:
- facial structure and proportions
- skin tone and texture
- eyes, nose, lips, bone structure
- hair shape, color, length
Keep the person clearly recognizable.

Do not paste or overlay faces.
Ensure seamless head–body integration.

STYLE ADAPTATION:
Match the original style:
- animated → same stylized/cartoon form
- realistic → photorealistic detail
Do not over-stylize.

HEAD ANGLE & VISIBILITY:
Keep original head angle, direction, and visibility.
No rotation, no frontalization.
Do not reveal hidden faces.
Respect gaze direction and perspective.

ANATOMY:
Preserve body anatomy.
Hands: 5 fingers, correct proportions, no distortion.

Respect occlusions (hair, objects, motion blur).
Do not generate hidden parts.

QUALITY:
High-resolution, sharp, natural skin texture, correct lighting.

OUTPUT:
Same scene, same composition — only identities replaced.`;

const EUPHORIA_1 = `Use the reference image as a composition and scene template.

Remove all original people from the scene completely. Keep the hallway, lockers, lighting, framing, perspective, and background intact.

REPLACEMENT:
— left female position → woman from uploaded female reference photo
— right male position → man from uploaded male reference photo
Do NOT swap roles or genders.

RECONSTRUCTION:
Rebuild both characters from scratch using the uploaded references.
Do NOT perform face-swap, morphing, or partial blending with the original people.
Generate entirely new full-body subjects matching the reference identities.

IDENTITY:
Preserve:
— facial structure
— eyes, nose, lips, jawline
— hairstyle and hair texture
— skin tone
— body proportions and silhouette

Both people must remain clearly recognizable as the uploaded individuals.

POSE & COMPOSITION:
Preserve:
— exact camera angle
— body orientation
— relative distance between characters
— framing and perspective
— eye-line interaction
— hallway positioning

Match the scene composition precisely, but use the anatomy and proportions of the uploaded people.

CLOTHING:
Adapt outfits naturally to the environment and cinematic tone of the scene.
Clothing should feel realistic for a modern high-school hallway scene.
Avoid copying the original outfits exactly unless requested.

LIGHTING & INTEGRATION:
Match:
— indoor fluorescent lighting
— shadow direction and softness
— cinematic color grading
— shallow depth of field
— lens characteristics
— image grain/noise

Faces and bodies must inherit the scene lighting naturally.
The final image must look like a real photograph captured in-camera, not composited or pasted.

BACKGROUND:
Preserve lockers, hallway depth, students in the background, blur intensity, and environmental realism.

STYLE:
Cinematic, realistic, emotionally tense school hallway scene, natural skin texture, high realism, subtle film look.`;

const EUPHORIA_2 = `Use the reference image as a composition and scene template.

Erase all original people. Their positions are empty slots — fill them with the people from the uploaded photos.

REPLACEMENT:
— woman slot → woman from uploaded female photo
— man slot → man from uploaded male photo
Do NOT swap genders or roles.

RECONSTRUCTION: Rebuild each person fully — full body, face, proportions, silhouette. Do NOT face-swap or blend with original characters.

IDENTITY: Preserve facial structure, features, skin tone, hair, proportions. Must remain recognizable.

CLOTHING: Adapt naturally to the scene — match style and environment.

POSE & COMPOSITION: Preserve camera angle, pose, body orientation, spacing, framing. Match placement, not original anatomy.

LIGHTING: Match lighting direction, shadows, color grading, depth of field, grain. Faces inherit scene lighting. Result must not look pasted or composited.`;

const EUPHORIA_3 = `Use the reference image as a composition and scene template.

Erase all original people. Their positions are empty slots — fill them with the people from the uploaded photos.

REPLACEMENT:
— woman slot → woman from uploaded female photo
— man slot → man from uploaded male photo
Do NOT swap genders or roles.

RECONSTRUCTION: Rebuild each person fully — full body, face, proportions, silhouette. Do NOT face-swap or blend with original characters.

IDENTITY: Preserve facial structure, features, skin tone, hair, proportions. Must remain recognizable.

CLOTHING: Adapt naturally to the scene — match style and environment.

POSE & COMPOSITION: Preserve camera angle, pose, body orientation, spacing, framing. Match placement, not original anatomy.

LIGHTING: Match lighting direction, shadows, color grading, depth of field, grain. Faces inherit scene lighting. Result must not look pasted or composited.`;

const TITANIC_1 = `Use the reference image as a composition and cinematic scene template only.

Erase all original people completely.
Treat their positions as empty slots with no remaining identity, anatomy, face, body, or silhouette.

Insert the people from the uploaded photos into those empty slots.

REPLACEMENT:
— woman slot → woman from uploaded female photo
— man slot → man from uploaded male photo
Do NOT swap genders or roles.

FULL RECONSTRUCTION:
Rebuild each inserted person entirely from the uploaded references:
— full body
— full face
— head shape
— body proportions
— silhouette
— skin tone
— hair
— facial structure

Transfer the uploaded people fully into the scene, not just the face.
Do NOT face-swap.
Do NOT edit the original actors.
Do NOT blend identities or inherit anatomy from the original characters.

IDENTITY:
Preserve exact facial structure, proportions, ethnicity, skin tone, hairline, and recognizable appearance from the uploaded photos.

SCENE ADAPTATION:
The uploaded people must physically belong inside the scene naturally:
— realistic cinematic posture
— natural interaction with wind and environment
— proper body perspective
— correct scale relative to the ship
— realistic clothing folds
— natural skin response to sunset lighting
— scene-consistent shadows and reflections
— atmospheric integration with haze and depth of field

Their bodies, skin, clothes, and hair must fully inherit the environment and cinematic mood of the scene.

POSE & COMPOSITION:
Preserve:
— camera angle
— framing
— pose
— body orientation
— spacing between characters
— perspective

Match placement only, not original anatomy or body shape.

CLOTHING:
Adapt naturally to the Titanic-style cinematic environment while fitting the uploaded people realistically. Clothing must look physically worn by them and react naturally to wind, lighting, and movement.

LIGHTING:
Match lighting direction, sunset atmosphere, shadows, color grading, depth of field, haze, and film grain consistently across the entire image.

The final result must look like a real cinematic photograph of the uploaded people shot on location, not a face replacement or edited movie still.

Negative prompt:
original actors, Leonardo DiCaprio, Kate Winslet, movie characters, face swap, partial replacement, preserved body, preserved anatomy, preserved silhouette, identity blending, hybrid face, morphing, inherited features, deepfake artifacts, pasted face, flat lighting, incorrect shadows, disconnected subjects, wrong perspective, wrong scale, distorted anatomy, extra fingers, blurry face, CGI look, compositing artifacts.`;

const TITANIC_2 = `Use the reference image ONLY as a cinematic composition, emotion, pose, lighting, and environment template.

Completely remove the original man and woman from the scene.
Treat them as empty placeholders only.

FULL CHARACTER REPLACEMENT:
— woman on floating debris → uploaded female reference
— man in freezing water → uploaded male reference

Do NOT swap genders or roles.

STRICT IDENTITY LOCK:
The generated people must clearly match the uploaded reference photos and must NOT resemble the original Titanic actors in any way.

Preserve from uploaded references:
— facial anatomy
— eye shape
— nose
— lips
— jawline
— skin tone
— hairstyle and texture
— body proportions
— recognizable identity

CRITICAL SIDE-PROFILE RECONSTRUCTION:

The male character is NOT front-facing.
His face is partially turned away, partially obscured, wet, and viewed from an angled profile.

Despite this:
— reconstruct his identity from the uploaded male reference photo
— generate a recognizable side-profile version of the uploaded man
— preserve his jawline, nose shape, brow structure, hairline, cheek structure, and side silhouette
— infer his appearance correctly from angled perspective
— maintain identity consistency under profile view and partial visibility

Treat the uploaded male reference as a full 3D identity source, not only a frontal face reference.

The male character must be fully recast from the uploaded identity even in side-angle view.

IMPORTANT:
The uploaded male identity is MORE IMPORTANT than exact similarity to the original movie frame.

Use identity persistence across non-frontal angles.

DO NOT fallback to:
— generic male face
— original Titanic actor
— Leonardo DiCaprio resemblance
— approximate resemblance
— blended identity
— original male profile
— original male hair
— original male facial structure
— partial preservation of original actor

This is a complete cinematic recast, NOT a face swap.

FEMALE CHARACTER:
Also fully replace the woman using the uploaded female reference while preserving:
— recognizable identity
— facial structure
— wet/cold emotional realism

POSE & COMPOSITION:
Preserve:
— exact emotional positioning
— woman leaning on floating debris
— man in freezing water beside her
— same framing and camera angle
— same cinematic intimacy
— same body positioning

ENVIRONMENT & PHYSICAL STATE:
Both characters are freezing and exhausted from icy ocean water.

Add realistic cold exposure details:
— soaked hair
— wet skin
— pale cold skin tones
— slightly blue lips
— trembling tension
— exhausted emotional expressions
— damp clothing texture
— realistic water reflections

LIGHTING:
Match:
— cold night cinematic lighting
— wet reflective highlights
— realistic moisture
— dim oceanic atmosphere
— shallow depth of field
— cinematic film grain
— realistic skin shading

CLOTHING:
Adapt clothing naturally into realistic wet Titanic-era clothing appropriate to the scene.

BACKGROUND:
Preserve:
— floating debris
— dark ocean atmosphere
— cinematic Titanic environment
— water reflections
— original framing and perspective

INTEGRATION:
The result must look like a real photographed cinematic frame.
No pasted faces.
No compositing artifacts.
No identity leakage from original actors.

FINAL REQUIREMENT:
The original actors must disappear completely.
The scene must look like a fully recast version of Titanic using the uploaded identities.

PRIORITY ORDER:
1. uploaded male identity
2. uploaded female identity
3. full replacement of original actors
4. emotional pose and composition
5. cinematic Titanic atmosphere.`;

const TITANIC_3 = `Use the reference image as a locked composition and cinematic scene template only.

Erase all original people completely.
Treat their positions as empty slots with no remaining identity, anatomy, face, body, silhouette, or facial features.

Insert the people from the uploaded photos into those exact slots.

REPLACEMENT:
— woman slot → woman from uploaded female photo
— man slot → man from uploaded male photo
Do NOT swap genders or roles.

FULL RECONSTRUCTION:
Rebuild each inserted person entirely from the uploaded references:
— full body
— full face
— exact head shape
— exact body proportions
— exact silhouette
— exact skin tone
— exact hair
— exact facial structure
— exact eyes
— exact jawline
— exact nose
— exact lips
— exact facial proportions

Transfer the uploaded people fully into the scene, not just the face.

Do NOT face-swap.
Do NOT edit the original actors.
Do NOT blend identities.
Do NOT inherit anatomy, proportions, expressions, or facial features from the original characters.

IDENTITY:
Preserve exact facial structure, proportions, ethnicity, skin tone, hairline, eye shape, jawline, and recognizable appearance from the uploaded photos.

Identity accuracy is the highest priority.
The uploaded people must remain instantly recognizable under cinematic lighting.

Do NOT stylize, beautify, reinterpret, or replace their facial geometry with generic cinematic faces.

SCENE ADAPTATION:
The uploaded people must physically belong inside the scene naturally:
— realistic cinematic posture
— natural interaction between bodies
— direct eye contact with each other
— proper body perspective
— correct scale relative to the scene
— realistic clothing folds and tension
— natural skin response to sunset lighting
— scene-consistent shadows and reflections
— atmospheric integration with haze and depth of field
— realistic neck and shoulder transitions
— realistic skin texture continuity between face and body

Faces must feel physically attached to the bodies:
— no pasted-on appearance
— no disconnected skin tone
— no floating heads
— no mismatched lighting
— no incorrect perspective

Their bodies, skin, clothes, and hair must fully inherit the environment and cinematic mood of the scene.

STRICT POSE & COMPOSITION LOCK:
Preserve exactly:
— camera angle
— framing
— pose
— head tilt
— hand placement
— body orientation
— body contact
— spacing between characters
— perspective
— intimacy positioning
— background composition

Match placement and pose exactly.
Do NOT regenerate or reinterpret the pose or scene layout.

CLOTHING:
Adapt naturally to the Titanic-style cinematic environment while fitting the uploaded people realistically. Clothing must look physically worn by them and react naturally to body movement, lighting, and wind.

LIGHTING:
Match lighting direction, sunset atmosphere, shadows, color grading, depth of field, haze, soft cinematic contrast, and film grain consistently across the entire image.

The final result must look like a real cinematic photograph of the uploaded people physically present during filming, not a face replacement, edited movie still, or AI composite.

Negative prompt:
original actors, Leonardo DiCaprio, Kate Winslet, movie characters, face swap, pasted face, floating head, disconnected neck, weak likeness, generic cinematic face, beautified face, identity blending, hybrid face, morphing, inherited features, preserved body, preserved anatomy, preserved silhouette, incorrect gaze direction, looking away, changed pose, altered hand placement, incorrect intimacy posture, flat lighting, mismatched shadows, disconnected subjects, wrong perspective, wrong scale, distorted anatomy, extra fingers, blurry face, CGI look, compositing artifacts, deepfake artifacts.`;

const TERABITHIA_1 = `Use the reference image as a composition and scene template.

Erase all original people from the scene. Their positions are empty slots — fill them with the people from the uploaded identity photos.

CHARACTER REPLACEMENT:
— woman in the scene → woman from the uploaded female photo
— man in the scene → man from the uploaded male photo
Gender must match exactly. Do NOT swap roles.

PLACEMENT:
Place each new person into the exact spatial position of the original:
— same location, scale, depth, and perspective.

FULL RECONSTRUCTION:
Rebuild each person entirely from their identity image — face, body, proportions, silhouette.
Do NOT face-swap. Do NOT blend with original characters.

IDENTITY:
Preserve from uploaded photos: facial structure, features, skin tone, hair, proportions.
Identity must remain clearly recognizable.

CLOTHING:
Adapt clothing naturally to the scene — match the style and environment, avoid mismatched outfits.

POSE & COMPOSITION:
Preserve camera angle, pose structure, body orientation, spacing, framing.
Match pose and placement, NOT original anatomy.

LIGHTING & INTEGRATION:
Fully integrate into the scene — match lighting direction, shadows, color grading, depth of field, grain.
Faces and bodies must inherit scene lighting. Result must not look pasted or composited.`;

const WORLD_1 = `Use the reference image as a composition and scene template.

Erase the original couple from the scene completely. Their positions become empty placeholders to be filled with the people from the uploaded identity photos.

CHARACTER REPLACEMENT:
— woman leaning across the chair → woman from the uploaded female identity photo
— man sitting in the chair → man from the uploaded male identity photo

Gender must match exactly. Do NOT swap roles.

PLACEMENT:
Place each new person into the exact spatial position of the originals:
— same body placement
— same scale
— same perspective
— same depth relative to camera
— same interaction and physical contact

Preserve the intimate pose:
— woman’s arm around the man
— relaxed seated posture
— head angles and body orientation

FULL RECONSTRUCTION:
Rebuild both characters entirely from the uploaded identity photos:
— face
— hair
— body proportions
— silhouette
— skin texture

Do NOT perform face swapping.
Do NOT blend original facial anatomy with the new identities.

IDENTITY PRESERVATION:
Maintain:
— recognizable facial structure
— eye shape
— jawline
— nose and lips
— skin tone
— hairstyle and hair color
— realistic proportions

The result must clearly resemble the uploaded people.

CLOTHING:
Keep the elegant casual aesthetic of the original image:
— woman in a soft light-colored dress
— man in a dark formal jacket/suit style

Adapt clothing naturally to the new bodies while preserving the cinematic mood and realism.

SCENE PRESERVATION:
Keep unchanged:
— coffee shop / café interior
— espresso machines
— background people
— wooden textures
— table objects
— framing and environment

Maintain the candid documentary-style atmosphere.

POSE & COMPOSITION:
Preserve:
— camera angle
— tilted framing
— composition balance
— subject spacing
— body positioning
— close physical interaction

Match pose and composition only — not the anatomy of the original people.

LIGHTING & INTEGRATION:
Fully integrate the new people into the environment:
— match warm indoor lighting
— flash photography look
— realistic shadows
— skin reflections
— cinematic depth of field
— subtle film grain
— natural color grading

Faces and clothing must inherit the exact lighting conditions of the café scene.
The final image must look like an authentic candid photograph, not an AI composite or face swap.`;

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
  // ── Euphoria ──
  "euphoria-1": { locked: true, prompt: EUPHORIA_1 },
  "euphoria-2": { locked: true, prompt: EUPHORIA_2 },
  "euphoria-3": { locked: true, prompt: EUPHORIA_3 },
  // ── Titanic ──
  "titanic-1": { locked: true, prompt: TITANIC_1 },
  "titanic-2": { locked: true, prompt: TITANIC_2 },
  "titanic-3": { locked: true, prompt: TITANIC_3 },
  // ── Universal styles ──
  "spiderman-1": { locked: false },
  "spiderman-2": { locked: false },
  "spiderman-3": { locked: false },
  "terabithia-1": { locked: true, prompt: TERABITHIA_1 },
  "terabithia-2": { locked: false },
  "terabithia-3": { locked: false },
  "stranger-things-1": { locked: false },
  "stranger-things-2": { locked: false },
  "stranger-things-3": { locked: false },
  "end-of-the-fucking-world-1": { locked: true, prompt: WORLD_1 },
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

const IMAGE_SIZE_LIMIT_BYTES = 6 * 1024 * 1024; // 6MB hard limit

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

      // ── Debug logging ──
      console.log("[MODEL_VERSION]", MODEL_VERSION);
      console.log("[REQUEST_MODE]", "legacy-version-dispatch");
      console.log("[REFERENCE_ID]", referenceId);
      console.log("[INPUT_IMAGES]", images.length);
      console.log("[PROMPT_SOURCE]", config.locked ? "locked" : "universal");
      console.log("[PROMPT_LENGTH]", finalPrompt.length);
      console.log("[IMAGE_SUMMARY]", JSON.stringify(imageSummary));
      console.log("[TOTAL_MB]", (imageSummary.reduce((s, x) => s + x.bytes, 0) / 1024 / 1024).toFixed(2));
      console.log("[REQUEST_BODY_SHAPE]", JSON.stringify({
        version: MODEL_VERSION,
        input: {
          image_input: `[${images.length} base64 data URLs]`,
          prompt: `[${finalPrompt.length} chars]`,
        },
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
          input: {
            prompt: finalPrompt,
            image_input: images,
          },
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
