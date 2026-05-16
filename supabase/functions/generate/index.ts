import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUNCTION_VERSION = "generate-v3-async-openai";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type GenerateResponse = {
  provider: "openai" | "replicate";
  status: "processing" | "succeeded" | "failed";
  predictionId?: string;
  output?: string;
  error?: string;
  model?: string;
  referenceId?: string;
  functionVersion?: string;
};

function jsonResponse(body: GenerateResponse | Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const REPLICATE_DEFAULT_MODEL = "google/nano-banana-pro";

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

const TANGLED_1 = `Use the reference image as a composition, pose, and stylized 3D animation template.

Remove the original characters completely and recreate them using the uploaded reference people.

CHARACTERS:
— left character → exact appearance of the man from the uploaded male photo
— right character → exact appearance of the woman from the uploaded female photo

Preserve their real appearance as accurately as possible:
— facial structure
— hairstyle
— hair color
— skin tone
— clothing style
— recognizable proportions
— overall likeness

IMPORTANT:
Do NOT create generic animated characters.

The reconstructed characters must clearly and immediately resemble the uploaded people while being converted into stylized cinematic 3D animated characters.

Do NOT:
— paste faces onto existing characters
— keep original heads or anatomy
— blend original characters with the new people
— create face-swap artifacts
— generate random hairstyles or clothing

FULL CHARACTER RECONSTRUCTION:
Rebuild each person entirely:
— full body
— face
— head shape
— hairstyle
— clothing
— silhouette
— posture
— body anatomy
— hands and proportions

The original characters must be completely removed.

CLOTHING:
Transfer and adapt the uploaded people’s clothing into the fantasy animated world while preserving:
— recognizable outfit colors
— clothing shapes
— layered clothing details
— overall fashion identity

Clothing should feel naturally stylized for a cinematic fantasy animation but still clearly belong to the uploaded people.

STYLE:
High-quality stylized 3D animated movie aesthetic:
— cinematic rendering
— expressive stylized eyes
— soft skin shading
— realistic animated hair
— stylized but believable anatomy
— polished animated-film quality
— warm fantasy atmosphere

INTERACTION:
Preserve:
— eye contact
— embrace
— emotional connection
— body orientation
— hand placement

The two reconstructed characters must naturally look at each other and feel emotionally connected.

POSE & COMPOSITION:
Keep:
— camera angle
— framing
— spacing
— composition
— pose structure

Match pose placement only — not original anatomy.

SCENE:
Preserve:
— floating lanterns
— fantasy castle background
— water reflections
— nighttime magical atmosphere
— warm cinematic lighting

LIGHTING:
Match:
— glowing lantern illumination
— soft cinematic shadows
— atmospheric depth
— warm reflections
— cinematic color grading

Faces, hair, skin, and clothing must inherit the exact lighting and mood of the environment.

The final result should look like a genuine stylized animated movie frame featuring recognizable animated versions of the uploaded people fully integrated into the fantasy scene — not a face swap or edited original image.`;

const TANGLED_2 = `Use the reference image as a composition, interaction, and stylized 3D animation template.

Preserve the cinematic fantasy atmosphere and the stylized animated movie aesthetic of the original scene.

Remove the original characters completely and recreate them using the uploaded reference people.

CHARACTERS:
— male character sitting on the left → exact appearance of the man from the uploaded male photo
— female character sitting on the right → exact appearance of the woman from the uploaded female photo

Preserve their recognizable real appearance as accurately as possible:
— facial structure
— hairstyle
— hair color
— skin tone
— clothing identity
— body proportions
— overall likeness

IMPORTANT:
Do NOT create generic animated characters.

The reconstructed characters must clearly resemble the uploaded people while being transformed into stylized cinematic 3D animated characters.

Do NOT:
— paste faces onto existing characters
— keep original heads or anatomy
— blend original characters with the uploaded people
— create face-swap artifacts
— morph faces onto existing bodies
— generate random hairstyles or clothing

FULL CHARACTER RECONSTRUCTION:
Rebuild each person completely:
— full body
— face
— head shape
— hairstyle
— hands
— posture
— body anatomy
— proportions
— silhouette
— clothing adaptation

The original characters must be fully removed and replaced.

INTERACTION & EXPRESSIONS:
Preserve:
— eye contact
— emotional connection
— subtle smiling expressions
— relaxed body language
— seated interaction
— natural attention toward each other

The two reconstructed characters must feel naturally present together in the same animated world.

POSE & COMPOSITION:
Preserve:
— sitting positions
— body orientation
— camera angle
— framing
— spacing between characters
— composition balance
— hand placement
— gaze direction

Match pose placement only — not original anatomy.

CLOTHING:
Adapt the uploaded people’s clothing into the fantasy animated world while preserving:
— recognizable outfit colors
— clothing style
— layered outfit details
— overall fashion identity

Clothing should feel naturally stylized for a cinematic fantasy animation while still clearly belonging to the uploaded people.

STYLE:
High-quality stylized cinematic 3D animated movie aesthetic:
— expressive stylized eyes
— soft cinematic skin shading
— realistic animated hair
— stylized but believable anatomy
— cinematic rendering
— polished animated-film quality
— warm fantasy atmosphere

The result should look like a frame from a modern animated fantasy movie.

SCENE PRESERVATION:
Keep unchanged:
— nighttime forest environment
— warm fire/campfire lighting
— dark blue atmosphere
— cinematic shadows
— fantasy environment
— overall composition

LIGHTING & INTEGRATION:
Fully integrate the reconstructed animated characters into the environment:
— warm orange fire lighting
— soft shadows
— glowing skin reflections
— cinematic depth
— atmospheric shading
— warm/cool color contrast
— stylized animated rendering

Faces, hair, skin, and clothing must inherit the exact lighting and atmosphere of the environment.

The final result should look like a genuine stylized animated movie frame featuring recognizable animated versions of the uploaded people naturally integrated into the fantasy scene — not a face swap, pasted composite, or edited original image.`;

const TANGLED_3 = `Use the reference image as a composition, interaction, and stylized 3D animation template.

Preserve the cinematic fantasy atmosphere and the stylized animated movie aesthetic of the original scene.

Remove the original characters completely and recreate them using the uploaded reference people.

CHARACTERS:
— male character on the left holding the crown → exact appearance of the man from the uploaded male photo
— female character on the right receiving the crown → exact appearance of the woman from the uploaded female photo

Preserve their recognizable real appearance as accurately as possible:
— facial structure
— hairstyle
— hair color
— skin tone
— clothing identity
— body proportions
— overall likeness

IMPORTANT:
Do NOT create generic animated characters.

The reconstructed characters must clearly resemble the uploaded people while being transformed into stylized cinematic 3D animated characters.

Do NOT:
— paste faces onto existing characters
— keep original heads or anatomy
— blend original characters with the uploaded people
— create face-swap artifacts
— morph faces onto existing bodies
— generate random hairstyles or clothing

FULL CHARACTER RECONSTRUCTION:
Rebuild each person completely:
— full body
— face
— head shape
— hairstyle
— hands
— posture
— body anatomy
— proportions
— silhouette
— clothing adaptation

The original characters must be fully removed and replaced.

INTERACTION & EXPRESSIONS:
Preserve:
— eye contact
— playful emotional connection
— subtle smiling expressions
— elegant body language
— crown exchange interaction
— natural attention toward each other
— hand positioning
— romantic fantasy interaction

The two reconstructed characters must feel naturally present together in the same animated world.

POSE & COMPOSITION:
Preserve:
— male bowing posture
— female receiving gesture
— body orientation
— camera angle
— framing
— spacing between characters
— composition balance
— crown positioning
— gaze direction
— arm and hand placement

Match pose placement only — not original anatomy.

CLOTHING:
Adapt the uploaded people’s clothing into the fantasy royal animated world while preserving:
— recognizable outfit colors
— clothing style
— layered outfit details
— overall fashion identity

Clothing should feel naturally stylized for a cinematic fantasy animation while still clearly belonging to the uploaded people.

STYLE:
High-quality stylized cinematic 3D animated movie aesthetic:
— expressive stylized eyes
— soft cinematic skin shading
— realistic animated hair
— stylized but believable anatomy
— cinematic rendering
— polished animated-film quality
— warm fantasy atmosphere

The result should look like a frame from a modern animated fantasy movie.

SCENE PRESERVATION:
Keep unchanged:
— royal courtyard
— palace architecture
— crowd in the background
— festive decorations
— fantasy environment
— overall composition
— cinematic atmosphere

LIGHTING & INTEGRATION:
Fully integrate the reconstructed animated characters into the environment:
— warm cinematic daylight lighting
— soft shadows
— glowing skin reflections
— cinematic depth
— atmospheric shading
— warm fantasy color grading
— stylized animated rendering

Faces, hair, skin, and clothing must inherit the exact lighting and atmosphere of the environment.

The final result should look like a genuine stylized animated movie frame featuring recognizable animated versions of the uploaded people naturally integrated into the fantasy royal scene — not a face swap, pasted composite, or edited original image.`;

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

const EUPHORIA_1 = `Replace the two people in the original hallway image with the people from the provided reference photos.

Left side:
Use the girl from the reference image. Preserve her exact facial features, hairstyle, hair color, skin tone, body proportions, expression, clothing, accessories, and overall appearance.

Right side:
Use the boy from the reference image. Preserve his exact facial features, hairstyle, hair texture, skin tone, body proportions, expression, clothing, and overall appearance.

Keep the original hallway environment unchanged:
school corridor, lockers, background students, cinematic composition, camera angle, lighting, depth of field, shadows, and realistic atmosphere.

The new people must naturally match the original poses and positions from the base image. Maintain realistic anatomy, realistic skin texture, photorealistic details, natural lighting, accurate proportions, and seamless blending into the scene.

High detail, ultra realistic photo, cinematic photography, shallow depth of field, natural colors, realistic shadows, no filters.

All characters are adults over 18 years old.

Negative prompt:
cartoon, anime, illustration, painting, CGI, 3d render, fake skin, blurry face, distorted anatomy, extra fingers, bad hands, low quality, overexposed, oversaturated, watermark, text, logo, duplicate person, deformed face, unrealistic proportions`;

const EUPHORIA_2 = `Use the reference image ONLY for:

exact composition
exact body positioning
exact head tilt
exact torso rotation
exact shoulder angle
exact couch placement
exact eye-line direction
exact framing
exact camera angle
exact perspective
exact lighting
exact depth of field
exact cinematic atmosphere

Completely remove the original man and woman from the reference scene.

Replace them with TWO entirely new people using ONLY the uploaded male and uploaded female as identity references.

CRITICAL PRIORITY:
Identity preservation and pose accuracy are MORE IMPORTANT than cinematic stylization.

The generated people must look almost identical to the uploaded references and must keep their real-world appearance.

Do NOT:

beautify
stylize
reinterpret
age up/down
sharpen features
glamorize
change proportions
make them look like actors/models

Preserve EXACTLY:

facial bone structure
eye shape
eye spacing
eyelids
eyebrows
nose shape
lips
jawline
cheekbones
chin
hairline
hairstyle
hair density
hair texture
skin tone
facial proportions
body proportions
silhouette
age appearance

DO NOT inherit ANY facial or body traits from the original people in the cinematic reference image.

The uploaded people must fully replace the original subjects across the ENTIRE body.

Replacement mapping:

uploaded male → left person on couch
uploaded female → right person facing him

POSE ACCURACY IS CRITICAL:

The uploaded male must replicate the original male pose EXACTLY:

same leaning angle into the couch
same neck bend
same head tilt
same eye direction toward the girl
same shoulder posture
same torso orientation
same relaxed body language
same distance from camera
same crop framing
same arm placement perspective
same seated depth into the couch

The uploaded female must replicate the original female pose EXACTLY:

same partial side-profile visibility
same shoulder angle
same head positioning
same seated orientation
same proximity to the male
same framing crop
same eye-line interaction

The final result must feel like the uploaded people were naturally photographed in the original cinematic scene.

NO face swap look.
NO morphing.
NO blended identities.
NO partial replacement.

Generate:

complete realistic anatomy
coherent neck attachment
natural shoulders
realistic arms
realistic hands
accurate body mass
natural posture
believable clothing folds

Lighting must perfectly match the environment:

warm cinematic indoor lighting
soft practical lamp glow
realistic skin shading
subtle shadow falloff
shallow depth of field
realistic environmental reflections
slight film grain

Preserve:

couch texture
room composition
background blur
environmental depth
warm cinematic grading

The image must look like a real in-camera cinematic photograph, not AI-generated or composited.

Strictly avoid:

pose drift
identity drift
generic faces
beautification
plastic skin
anatomy distortion
warped hands
incorrect perspective
incorrect body angle
inconsistent lighting
remnants of original people
face swap artifacts
altered facial structure
exaggerated emotions`;

const EUPHORIA_3 = `Use the reference scene ONLY for:
— composition
— framing
— lens perspective
— camera angle
— blocking
— pose logic
— emotional interaction
— lighting direction

Completely remove the original actors.

Rebuild both characters entirely from the uploaded identity photos.

DO NOT:
— face swap
— morph with original actors
— average faces
— stylize
— beautify
— reinterpret anatomy
— generate “similar-looking” people

IDENTITY TRANSFER PRIORITY:
The final result must preserve the uploaded people with near-photographic identity accuracy.

For BOTH characters preserve exactly:
— facial bone structure
— eye shape, size, spacing, and eyelids
— nose bridge, nostrils, and tip anatomy
— lip contour and natural asymmetry
— jawline geometry
— cheek volume
— forehead proportions
— chin shape
— ear placement
— skin tone and undertones
— hair density
— hairline shape
— hairstyle texture
— neck thickness and proportions
— body proportions
— apparent age

The generated people must look unmistakably identical to the uploaded photos under cinematic lighting conditions.

CRITICAL:
Identity consistency is more important than cinematic stylization.

Use the uploaded photos as the ONLY source of facial identity and anatomy.

Do not inherit:
— facial proportions
— facial lighting
— skin texture
— eye shape
— expressions
from the original actors.

EXPRESSION TRANSFER:
Recreate ONLY the emotional behavior from the reference scene:
— same eye direction
— same conversational focus
— same subtle smirk intensity
— same eyelid openness
— same eyebrow tension
— same relaxed intimacy
— same natural mouth tension

Expressions must feel candid and unposed.

BODY & POSE:
Preserve:
— exact body positioning
— distance between characters
— head tilt
— shoulder angles
— arm placement
— torso orientation
— framing on the bed

But rebuild anatomy using ONLY the uploaded people.

CLOTHING:
Use realistic casual bedroom clothing inspired by each uploaded person’s style and silhouette.
Avoid costume-like adaptation.

LIGHTING FIX — VERY IMPORTANT:
The generated faces must be fully integrated into the scene lighting naturally.

Avoid:
— blown highlights
— overexposed skin
— glowing foreheads
— white patches
— beauty-light skin
— HDR look
— artificial skin smoothing
— waxy skin
— hot spots from tungsten lighting
— mismatched color temperature
— pasted-on faces

Lighting must follow:
— soft warm tungsten practical lighting
— smooth cinematic shadow gradients
— physically realistic exposure
— low-light indoor contrast
— subtle ambient bounce light
— natural skin reflectivity only
— soft rolloff in highlights
— preserved shadow detail
— realistic occlusion around eyes, nose, jaw, and hair

SKIN TEXTURE:
Preserve:
— pores
— small asymmetries
— natural under-eye texture
— realistic teenage skin
— subtle imperfections

Do NOT retouch faces.

IMAGE STYLE:
Photorealistic cinematic still frame.
Natural indie-drama aesthetic.
Shallow depth of field.
Authentic film-grain feel.
No AI glamour look.
No hyper-detailing.
No uncanny symmetry.
No synthetic beauty filtering.

The final image must look like a real frame captured on a cinema camera with the uploaded people physically present in the room.`;

const TITANIC_1 = `Replace the two people in the original Titanic-style scene with the people from the provided reference photos.

CRITICAL:
Transfer the people completely from the reference images — not only the faces. Preserve the full upper body, shoulder width, torso proportions, posture, neck shape, arm proportions, clothing shape, clothing folds, hairstyle, body structure, and overall silhouette exactly from the references.

Do NOT morph the reference faces onto the original bodies.
Do NOT keep the original clothing or original body proportions.
The final characters must fully resemble the reference people physically and proportionally.

Male character:
Use the exact male reference appearance including realistic body proportions, torso structure, hairstyle, clothing style, posture, and facial features. Preserve natural shoulder width and realistic anatomy while adapting him to the Titanic pose from behind the girl.

Female character:
Use the exact female reference appearance including realistic body proportions, torso shape, hairstyle, clothing style, posture, and facial features. Preserve accurate body scaling and natural anatomy while adapting her to the iconic open-arm pose.

Keep the original Titanic cinematic composition:
golden sunset lighting, romantic atmosphere, warm shadows, dramatic movie framing, elegant pose, ship deck environment, cinematic perspective.

The new people must integrate naturally into the scene with:
matching perspective, realistic body scaling, realistic interaction between bodies, natural arm positioning, accurate anatomy, realistic skin texture, consistent lighting, realistic clothing physics, and seamless photorealistic blending.

Ultra realistic cinematic photography, movie still quality, natural proportions, DSLR detail, realistic shadows, warm golden tones, emotionally cinematic atmosphere.

All characters are adults over 18 years old.

Negative prompt:
face swap only, mismatched body, incorrect proportions, oversized head, tiny body, warped anatomy, distorted limbs, bad hands, extra fingers, unrealistic torso, fake skin, cartoon, anime, CGI, 3d render, blurry, low quality, oversaturated, watermark, logo, text, duplicate people, childlike appearance, underage`;

const TITANIC_2 = `Replace the two original characters in the cinematic scene with the exact two people from the provided reference photos.

CRITICAL REQUIREMENT:
Do NOT reinterpret, stylize, beautify, age-shift, or approximate the reference people. Reconstruct their identities faithfully and photorealistically using the exact facial structure and physical appearance from the references.

The result must preserve:

exact face shape
exact eye shape and spacing
exact nose structure
exact lips and mouth shape
exact jawline and chin
exact eyebrow shape
exact skin tone and texture
exact hairstyle, hairline, and hair volume
exact proportions of head, neck, shoulders, torso, and body silhouette
exact natural asymmetry and facial uniqueness

Avoid generic “pretty face” generation. The final characters must clearly look like the same real people from the reference photos.

Male character:
Use the exact male reference identity and appearance.
Preserve:

facial proportions
tired soft eyes
slim jawline
messy medium-length dark hair
realistic neck thickness
narrow shoulders
natural expression
youthful but fully adult anatomy
exact facial likeness

Keep the original seated pose and interaction with the object in his hands.
Do not change his body type or make him broader, older, or more masculine than in the reference.

Female character:
Use the exact female reference identity and appearance.
Preserve:

facial anatomy
soft rounded facial structure
exact eyes and lips
long straight brown hair
slim natural physique
delicate shoulders and neck
realistic facial proportions
exact likeness to the reference

Keep her gentle leaning pose over the male character’s shoulder with natural physical interaction and accurate body positioning.

IMPORTANT:
This is NOT a face swap.
The entire people must be reconstructed from the references:
identity, anatomy, posture, proportions, silhouette, hairstyle, and physical presence.

Maintain the original cinematic environment:

warm amber indoor lighting
elegant vintage room
dark background
soft shadows
shallow depth of field
intimate composition
movie still framing
realistic optical lens behavior
photorealistic skin rendering

Ensure:

realistic anatomy
correct body scaling
natural shoulder width
realistic hand structure
seamless lighting integration
physically correct interaction between characters
natural clothing folds
realistic skin pores and texture
DSLR cinematic detail
ultra realistic movie still quality

The final image should look like a real photographed scene from a high-budget romantic drama film.

All characters are adults over 18 years old.

Negative prompt:
generic face, inaccurate likeness, weak resemblance, face swap only, different facial structure, altered identity, beautified face, unrealistic anatomy, oversized head, mismatched body, warped limbs, distorted proportions, bad hands, extra fingers, fake skin, smooth plastic skin, cartoon, anime, CGI, 3d render, doll face, blurry, low quality, oversaturated, watermark, logo, duplicate people, childlike appearance, underage`;

const TITANIC_3 = `Create a cinematic romantic scene inspired by the original reference ship-deck atmosphere at sunset. Keep the environment composition, camera angle, lighting direction, framing, ship structure, deck details, ropes, railings, mast placement, background perspective, and overall visual atmosphere very close to the original reference image. Do not significantly alter the background or environment design.

Replace the original couple with two adult people based on the provided reference photos.

Use the reference individuals consistently and naturally throughout the image while preserving their exact recognizable facial structure, eye shape, nose, lips, jawline, hairstyle, hair texture, proportions, silhouette, and overall appearance. Maintain very high facial identity accuracy and realistic resemblance to both reference individuals.

Scene composition:

Adult male standing behind the adult female
His arms gently wrapped around her waist
Both leaning slightly toward each other in a calm emotional moment
Elegant, natural posture and realistic body contact
Medium close-up cinematic framing identical or very similar to the original reference composition
Preserve the original ship deck layout and cinematic sunset atmosphere
Ocean background with warm golden-hour lighting matching the reference image
Shallow depth of field
Dramatic romantic cinematic atmosphere

IMPORTANT BACKGROUND REQUIREMENTS:

Keep the background highly consistent with the original reference image
Do not redesign the ship or environment
Maintain similar deck proportions, railing placement, ropes, mast structure, horizon line, and sunset composition
Preserve the same cinematic color palette and lighting mood
Background should feel like the same scene as the original reference, only with the new people replacing the original couple

Male:

Match the male reference precisely and naturally
Realistic proportions, shoulder width, neck anatomy, and posture
Natural hairstyle, facial structure, and expression matching the reference
Accurate hand anatomy with realistic wrists, palms, knuckles, fingernails, and exactly five fingers on each hand
Believable arm placement and natural interaction with the female character
Clothing adapted subtly and naturally to the original cinematic setting

Female:

Match the female reference precisely and naturally
Preserve realistic proportions, hairstyle, facial features, expression, and posture
Elegant pose with believable interaction and physically accurate anatomy
Accurate hand anatomy with realistic finger spacing, fingernails, joints, and exactly five fingers on each hand
Natural lighting and realistic skin texture
Clothing adapted subtly and naturally to the original cinematic setting

Critical anatomy requirements:

Perfect human hand anatomy
Exactly five fingers per hand
No fused fingers
No extra fingers
No missing fingers
Correct finger length and proportions
Natural thumb placement
Realistic joints, tendons, fingernails, and palm structure
Anatomically correct wrists and arm positioning
Symmetrical believable hands
Natural body proportions and realistic skeletal structure

Visual style:

ultra realistic cinematic photography, movie still aesthetic, preserve original Titanic-like cinematic composition, photorealistic skin texture, DSLR-quality detail, natural cinematic color grading, subtle film grain, realistic shadows, shallow depth of field, emotionally cinematic atmosphere, highly detailed, physically accurate anatomy, realistic human proportions

Negative prompt:

changed background, different ship design, altered environment, incorrect deck structure, unrealistic scenery, low quality, blurry face, distorted anatomy, malformed hands, bad hands, deformed fingers, fused fingers, extra fingers, missing fingers, six fingers, duplicate fingers, warped limbs, broken anatomy, unrealistic proportions, asymmetrical hands, plastic skin, cartoon, anime, CGI, 3D render, oversaturated colors, watermark, logo, text, poorly drawn hands, mutated hands, distorted wrists, unnatural pose`;

const TERABITHIA_1 = `Replace the two original characters in the forest photo with the exact people from the provided reference images using complete identity transfer and seamless cinematic integration. The final result must preserve the same emotions, smile intensity, facial mood, eye expression, and natural human warmth from the reference photos. Both people must have the same authentic emotional feeling as in the references — including subtle smiling eyes, relaxed facial muscles, natural mouth shape, and realistic emotional presence. Left side — female replacement: Completely replace the original girl with the woman from the female reference image. Transfer exactly: face structure eyes and eye expression natural soft smile / neutral emotion from the reference lips and mouth shape hairstyle and hair flow hair color skin texture and tone body proportions posture energy clothing jewelry and accessories overall identity and presence Keep the original pose from the forest photo: she must naturally hold the fluffy white dog in the same position and interaction. Adapt her naturally into the forest scene with: matching shoulder angle natural neck rotation realistic head tilt correct torso perspective physically accurate arm placement realistic body balance and weight distribution Right side — male replacement: Completely replace the original boy with the man from the male reference image. Transfer exactly: face structure hairstyle and hair texture eyes and eye direction authentic smile and expression from the reference relaxed facial emotion skin tone clothing posture vibe proportions natural body language overall identity Keep the original standing position from the forest scene while adapting his posture naturally to the environment and camera angle. Critical realism requirements: The two new people must look naturally photographed together inside the forest scene. Perfectly match: lighting direction shadow softness outdoor daylight color ambient forest bounce light camera perspective depth of field cinematic grading lens characteristics realistic scale and proportions Faces must preserve the exact emotional realism from the references: natural smile, realistic cheeks, authentic eyes, relaxed mouth tension, believable human expression. Extremely important anatomy requirements: correct number of fingers anatomically correct hands no extra fingers no fused fingers no duplicated arms no malformed hands no distorted limbs realistic wrist anatomy physically correct arm positioning natural finger bending and grip on the dog Ensure: seamless compositing realistic contact shadows accurate head perspective realistic neck connection proper shoulder anatomy realistic fabric folds natural skin pores invisible edit quality natural integration into the forest atmosphere Preserve completely: forest environment tree trunk green foliage fluffy white dog cinematic framing shallow depth of field natural outdoor atmosphere Ultra photorealistic DSLR photo, cinematic realism, highly detailed skin texture, natural outdoor lighting, realistic anatomy, seamless environmental integration, invisible compositing quality. Negative prompt: extra fingers, extra hands, duplicated limbs, malformed hands, broken anatomy, distorted fingers, fused fingers, warped arms, unnatural pose, stiff body, fake smile, artificial emotion, mismatched expression, incorrect gaze, pasted subject, floating body parts, bad anatomy, CGI, 3D render, cartoon, anime, painting, illustration, blurry details, oversaturated colors, poor compositing, distorted perspective, unrealistic lighting, low quality, watermark, text, logo`;

const TERABITHIA_2 = `Replace the two original people in the provided indoor photo with the exact people from the supplied reference images using complete identity transfer and seamless cinematic integration. Preserve the original intimate emotional atmosphere, soft eye contact, relaxed body language, subtle smiles, and warm human connection between the two subjects. The final image must look like a naturally photographed candid movie still. Left side — female replacement: Completely replace the original woman with the woman from the female reference image. Transfer exactly: face structure eyes and natural eye expression subtle authentic smile from the reference lips and mouth shape hairstyle and hair texture hair color skin tone and realistic skin texture body proportions posture and natural feminine body language clothing style adaptation overall identity and emotional presence Keep the exact original seated pose: sitting against the wall holding food/snack naturally in her hand relaxed shoulders realistic neck angle accurate torso perspective natural leg positioning believable interaction and eye contact with the male character Right side — male replacement: Completely replace the original man with the man from the male reference image. Transfer exactly: face structure hairstyle and hair texture eyes and gaze direction authentic relaxed smile from the reference natural facial emotion skin tone and texture posture proportions casual body language clothing adaptation overall identity and cinematic presence Keep the exact original seated position: sitting against the wall with knees raised hands naturally resting on knees with realistic finger placement relaxed shoulders and neck natural eye contact toward the female character physically accurate posture matching the camera angle Critical realism requirements: The two new people must look naturally photographed together inside the original indoor environment. Perfectly preserve: warm indoor tungsten lighting soft wall shadows cinematic evening atmosphere realistic ambient bounce light original room perspective depth of field natural skin reflections realistic facial shading cinematic color grading authentic lens characteristics Preserve emotional realism from the references: realistic eyes natural eyelid tension believable cheeks subtle relaxed smiles authentic human warmth realistic mouth shape natural facial muscle behavior Extremely important anatomy requirements: correct number of fingers anatomically correct hands no extra fingers no fused fingers no duplicated limbs no malformed hands realistic wrist anatomy physically accurate arm positioning natural finger bending correct shoulder structure realistic neck connection believable seated body balance Ensure: seamless compositing invisible editing quality accurate scale and proportions natural interaction between both subjects realistic contact shadows correct head perspective natural fabric folds realistic skin pores cinematic realism physically plausible body positioning Preserve completely: original indoor room environment beige wall background seated composition dog in foreground warm cinematic atmosphere framing and camera angle shallow depth of field emotional intimacy of the scene Ultra photorealistic DSLR movie still, cinematic realism, highly detailed skin texture, realistic indoor lighting, natural anatomy, seamless environmental integration, invisible compositing quality. Negative prompt: extra fingers, extra hands, duplicated limbs, malformed hands, broken anatomy, distorted fingers, fused fingers, warped arms, unnatural pose, stiff body, fake smile, artificial emotion, mismatched expression, incorrect gaze, pasted subject, floating body parts, bad anatomy, CGI, 3D render, cartoon, anime, painting, illustration, blurry details, oversaturated colors, poor compositing, distorted perspective, unrealistic lighting, low quality, watermark, text, logo`;

const TERABITHIA_3 = `Replace the two original people in the cinematic car scene with the two real people from the uploaded reference photos while preserving the original composition, framing, lighting, mood, and camera perspective. Use the uploaded reference photos as the primary visual reference for both individuals: * preserve recognizable facial features * preserve hairstyle and natural hair texture * preserve approximate body proportions * preserve clothing style and accessories * maintain natural expressions and realistic eye contact LEFT PERSON: Replace the person on the left with the male from the uploaded reference image. * preserve recognizable hairstyle and facial structure * preserve the dark hoodie outfit style * maintain a relaxed seated posture * naturally integrate him into the seat position and camera perspective RIGHT PERSON: Replace the person on the right with the female from the uploaded reference image. * preserve recognizable hairstyle, facial features, and jewelry * preserve the white fitted shirt outfit style * maintain the leaning pose toward the other person * naturally integrate her posture and arm placement with the car seat Scene requirements: * photorealistic cinematic integration * realistic skin texture and natural daylight lighting * matching warm window light and shadows * shallow depth of field * believable perspective and proportions * seamless compositing * natural interaction between both people * preserve the nostalgic cinematic atmosphere Keep the original: * car interior * blurred outdoor background * composition and framing * emotional tone * cinematic lighting Quality requirements: * realistic anatomy * correct hands and fingers * no duplicated limbs * natural posture * realistic clothing folds * accurate neck and shoulder alignment * invisible editing quality * DSLR cinematic realism Negative prompt: low quality, blurry face, distorted anatomy, extra fingers, duplicated limbs, malformed hands, incorrect perspective, warped body, unrealistic skin, overprocessed face, CGI look, cartoon, anime, painting, artificial facial features, floating body parts, bad lighting, mismatched proportions, poor compositing, text, watermark, logo`

const WORLD_1 = `Replace the two original characters in the indoor cinematic scene with the exact people from the provided reference images using complete identity transfer and seamless photorealistic integration. Preserve the exact composition, framing, emotional tension, body positioning, and intimate face-to-face interaction from the original image. The final result must look like a real cinematic movie still captured naturally in-camera. Left side — male replacement: Completely replace the original young man with the man from the male reference image. Transfer exactly: face structure jawline and cheekbones nose shape lips and mouth structure authentic neutral / emotionally tense expression from the reference eyes and natural eye intensity hairstyle and hair texture hair color skin tone and realistic skin texture neck proportions body proportions posture and subtle body tension clothing style adaptation overall masculine identity and realistic human presence Keep the exact original pose: standing face-to-face with the girl same shoulder angle same head tilt same eye-line direction same body distance and emotional tension same cinematic side profile orientation Right side — female replacement: Completely replace the original young woman with the woman from the female reference image. Transfer exactly: facial structure eyes and authentic emotional gaze eyebrows lips and natural mouth tension realistic neutral cinematic expression from the reference hairstyle and natural hair flow hair color skin tone and skin pores body proportions posture clothing adaptation overall identity and feminine presence Keep the exact original pose: standing directly in front of the male character same body angle same head position same eye contact intensity same relaxed arm placement same cinematic side-profile orientation Critical emotional realism requirements: Both characters must preserve authentic human emotional realism from the reference photos: natural eyes believable facial muscles realistic micro-expressions subtle emotional tension relaxed mouth anatomy authentic cinematic mood natural human presence Scene preservation requirements: Preserve completely: indoor room environment large window background dark forest outside warm cinematic lamp lighting evening atmosphere shallow depth of field cinematic framing realistic indoor reflections ambient warm shadows realistic room perspective moody natural color grading Lighting and integration requirements: Perfectly match: warm indoor tungsten lighting soft cinematic shadows window backlight realistic skin shading facial shadow transitions room ambient bounce light camera perspective focal length compression realistic depth of field film-like cinematic grading natural exposure balance Extremely important anatomy requirements: anatomically correct hands correct number of fingers no extra fingers no fused fingers no duplicated limbs realistic shoulders realistic neck connection natural torso proportions physically correct posture realistic arm placement accurate body balance natural head perspective proper facial symmetry realistic ears and jaw anatomy Ensure: invisible edit quality seamless compositing natural interaction between both people physically believable proximity realistic skin pores natural fabric folds cinematic realism realistic eye reflections natural human anatomy perfect environmental integration Ultra photorealistic cinematic DSLR movie still, highly detailed skin texture, realistic anatomy, emotionally authentic expressions, moody cinematic lighting, natural indoor atmosphere, shallow depth of field, seamless identity replacement, invisible compositing quality. Negative prompt: extra fingers, extra hands, fused fingers, duplicated limbs, malformed anatomy, broken arms, distorted face, asymmetrical eyes, warped jaw, unrealistic expression, fake emotion, artificial smile, dead eyes, incorrect gaze, floating body parts, bad anatomy, stiff posture, unnatural neck, distorted shoulders, bad perspective, mismatched lighting, poor compositing, pasted subject, CGI, 3D render, cartoon, anime, illustration, painting, wax skin, plastic texture, blurry details, low quality, oversaturated colors, unrealistic shadows, distorted proportions, watermark, text, logo`;

const WORLD_2 = `Replace the two original characters in the cinematic car interior scene with the exact real people from the provided reference photos using highly accurate identity transfer and seamless photorealistic compositing. Female on the left: Replace the original blonde girl with the woman from the female reference image. Preserve her exact facial identity: face shape, jawline, cheekbones, eyes, eyebrows, nose, lips, natural expression, skin tone, skin texture, hairline, hairstyle, brunette hair texture, neck proportions, and realistic feminine features. Keep her exact original pose, side-profile angle, head tilt, shoulder position, eye-line, seated posture, and intimate emotional tension. Male on the right: Replace the original male character with the man from the male reference image. Preserve his exact identity: facial structure, jawline, eyes, eyebrows, nose, lips, realistic neutral expression, skin texture, messy dark hairstyle, masculine proportions, and natural facial asymmetry. Keep the exact original pose, leaning posture, arm placement, profile angle, eye contact direction, and cinematic tension. Identity fidelity is the highest priority. The characters must look unmistakably like the real people from the references, not generic AI approximations. Preserve natural asymmetry, realistic facial muscles, authentic eyes, subtle imperfections, and human emotional realism. Avoid beautification or “AI-face” appearance. Preserve the original cinematic composition completely: old car interior, dashboard, rear-view mirror, windshield background, daylight environment, shallow depth of field, realistic reflections, film-like cinematic color grading, soft natural lighting, realistic perspective, and authentic movie still atmosphere. Perfect lighting integration: natural daylight through windows, realistic skin shading, ambient bounce light, soft shadows, accurate exposure, realistic reflections, physically believable compositing. Ultra photorealistic cinematic DSLR movie still, realistic skin pores, natural anatomy, invisible edit quality, seamless integration, emotionally authentic expressions. Negative prompt: generic AI face, weak likeness, low identity accuracy, beautified face, uncanny valley, fake skin, plastic texture, distorted anatomy, extra fingers, fused fingers, duplicated limbs, warped face, asymmetrical eyes, unrealistic expression, bad perspective, mismatched lighting, CGI render, cartoon, blurry details, overprocessed image, unrealistic shadows, deformed hands, stretched anatomy, bad compositing, low quality.`;

const WORLD_3 = `Use the original diner frame as the immutable master shot. Perform only a precise photorealistic identity replacement of the two seated characters using the provided real-person references. The final image must look like a real DSLR cinematic still from an indie coming-of-age film. Keep the diner scene completely unchanged: same framing same camera angle same lens perspective same table geometry same background same warm diner lighting same depth of field same cinematic atmosphere The transferred people must look like they physically performed the exact original scene themselves, not pasted into it. IDENTITY PRESERVATION: Preserve accurate real facial identity and anatomy: facial structure eye shape and spacing jawline lips skin texture pores asymmetry natural imperfections Do not stylize, beautify, smooth skin, or make faces generic. MALE CHARACTER: Match the original diner pose exactly: same seated posture same head angle same shoulder position same torso orientation same hand placement same awkward stillness Preserve the emotional tone from the male reference: tired introspective eyes subtle sadness withdrawn energy natural mouth tension Use the oversized black hoodie from the reference with realistic fabric folds and weight. FEMALE CHARACTER: Match the original diner pose exactly: same posture same head tilt same eye direction same restrained body language Preserve the emotional tone from the female reference: restrained vulnerability detached observational gaze quiet melancholy natural candid realism Use the fitted white short-sleeve shirt and layered silver necklaces from the reference with realistic fabric tension and folds. HANDS — CRITICAL: Show exactly TWO visible hands on the table. Each visible hand must have: exactly FIVE anatomically correct fingers one correct thumb realistic knuckles and tendons natural wrist anatomy believable finger overlap physically correct contact pressure The touching interaction must feel subtle and real. Absolutely no: extra fingers missing fingers fused fingers duplicated fingers warped palms broken wrists malformed anatomy AI-looking hands REALISM: photorealistic skin shading invisible compositing natural film grain coherent warm lighting realistic DSLR texture subtle cinematic grading no CGI appearance NEGATIVE PROMPT: generic AI face, weak resemblance, identity drift, glamour face, plastic skin, overprocessed grading, CGI, synthetic lighting, extra fingers, missing fingers, fused fingers, duplicated hands, broken wrists, malformed anatomy, emotionless expression, uncanny valley, artificial posing`;

const STRANGER_1 = `Use the original frame as an immutable master plate. Perform an ultra-precise photorealistic identity transfer of the two standing characters using the provided real-person references. The result must preserve the exact cinematic shot while replacing ONLY the human identities with maximum facial fidelity and anatomical realism. The final frame must look indistinguishable from a real on-set DSLR still captured during production of a grounded indie sci-fi drama.

CRITICAL PRIORITY:
The generated people MUST strongly and unmistakably resemble the supplied reference individuals with near face-swap-level identity accuracy. Identity fidelity is more important than beauty, stylization, or aesthetic enhancement.

DO NOT reinterpret the characters.
DO NOT create “inspired by” faces.
DO NOT average or generalize facial traits.
The result must look like the actual real people physically acted in the original scene.

LOCK ALL ORIGINAL CINEMATIC ELEMENTS:

exact framing
exact composition
exact camera position
exact focal length and lens distortion
exact body proportions
exact room geometry
exact background objects
exact warm tungsten practical lighting
exact shadows and falloff
exact cinematic grading
exact depth of field
exact emotional atmosphere
exact pose geometry
exact body language

Only replace the identities of the two characters.

LEFT CHARACTER — STRICT IDENTITY MATCH:
Replace the left character with the young male from the provided carousel reference.

MANDATORY FACIAL FEATURES:

narrow elongated face
soft angular jawline
thin pale lips
sleepy hooded eyes
large dark eyes with melancholic expression
delicate nose bridge
youthful and slightly gaunt facial structure
pale natural skin texture
subtle under-eye shadows
messy medium-length dark brown hair with soft layered volume
realistic uneven fringe placement
no beautification
no model-like glamour enhancements

Expression must remain emotionally restrained, detached, introspective, slightly distant.

Preserve EXACT original pose:

identical shoulder angle
identical neck rotation
identical gaze direction
identical arm crossing position
identical torso orientation
identical posture tension

Maintain the oversized pale blue collared sweatshirt exactly as in the master shot:

realistic heavy fabric weight
natural cloth compression
accurate sleeve folds
soft cotton texture
physically believable draping

RIGHT CHARACTER — STRICT IDENTITY MATCH:
Replace the right character with the young girl from the provided outdoor reference.

MANDATORY FACIAL FEATURES:

youthful round facial structure
soft cheeks
large expressive eyes
subtle vulnerable gaze
natural pale skin with realistic pores
small natural lips
delicate jawline
realistic teenage proportions
long light brown hair
naturally thin eyebrows
authentic candid appearance
absolutely no glamorization or adultification

Hair must preserve:

natural long flowing texture
realistic strand separation
subtle waviness
physically correct shadowing in warm indoor light

Expression must remain:

cautious
emotionally vulnerable
quietly tense
intimate and protective

Preserve EXACT original pose:

same leaning posture
same head placement
same eye direction
same shoulder compression
same physical closeness
same hand placement on arm

HANDS — HIGHEST PRIORITY:
Hands must be anatomically perfect and photorealistic.

Requirements:

exactly five fingers per hand
correct thumb placement
realistic knuckles
natural tendons
proper nail anatomy
believable skin compression
physically accurate wrist joints
correct finger lengths
natural relaxed curvature
accurate interaction with clothing fabric

NO:

extra fingers
fused fingers
duplicated hands
warped anatomy
melted palms
floating wrists
malformed joints
AI hand artifacts

PHOTOREALISM REQUIREMENTS:

invisible compositing
true DSLR texture
realistic optical softness
subtle sensor grain
organic skin detail
accurate pore structure
physically correct subsurface scattering
coherent warm indoor lighting
realistic shadow integration
natural fabric behavior
cinematic tungsten color response
authentic filmic contrast
no CGI appearance
no digital painting look
no overprocessing
no beauty retouching
no artificial sharpening

NEGATIVE PROMPT:
weak resemblance, identity drift, generic AI face, face averaging, beautified face, fashion model appearance, glamour skin, plastic skin, porcelain skin, symmetry correction, CGI, fake cinematic look, synthetic rendering, overprocessed texture, uncanny valley, inaccurate facial structure, incorrect eye shape, wrong jawline, wrong nose, emotionless face, pose mismatch, incorrect body proportions, compositing artifacts, bad lighting integration, extra fingers, fused fingers, missing fingers, duplicated limbs, malformed wrists, floating hands, distorted anatomy, cartoon texture, fake shadows, over-sharpened skin, stylized face, anime influence, de-aged appearance, artificial perfection`;

const STRANGER_2 = `Use the reference image ONLY as a cinematography, composition, pose, and interaction template.

DO NOT use the original actors as appearance references in ANY way.

The original people are ONLY placeholders for:
— body positioning
— pose
— interaction
— framing
— camera angle
— lighting
— scene composition

Completely remove all original identities from the final result.

ABSOLUTELY NO blending between uploaded people and original actors.

Do NOT inherit from the reference actors:
— face shape
— facial proportions
— jawline
— eyes
— eyebrows
— nose
— lips
— hairstyle
— skin texture
— skin color
— body type
— physique
— silhouette
— hand shape
— arm shape
— ethnicity
— age appearance

CRITICAL:
This is NOT a face swap.

Do NOT paste uploaded faces onto the original bodies.

Instead:
fully replace the original actors with the uploaded people as COMPLETE REAL HUMANS naturally existing in the scene.

CRITICAL FULL HUMAN TRANSFER:

Transfer the uploaded people as COMPLETE FULL HUMANS.

NOT just faces.
NOT just heads.
NOT facial identity only.

The ENTIRE PERSON must be transferred together as ONE connected human identity.

This includes:
— head
— face
— hair
— neck
— shoulders
— torso
— arms
— hands
— fingers
— legs
— body proportions
— physique
— silhouette
— clothing
— sleeves
— posture
— body language

The uploaded person's FULL BODY must replace the original actor's FULL BODY.

Do NOT keep:
— original hands
— original arms
— original body
— original skin color
— original physique
— original clothing fit
— original body proportions

Do NOT attach the uploaded face onto the original actor’s body.

This is NOT a face swap.

This is a COMPLETE PERSON REPLACEMENT.

The uploaded people must remain physically consistent from head to toe.

Face, hands, arms, neck, and body MUST belong to the SAME uploaded person.

If the uploaded person has:
— light skin → hands and body must also be light
— slim physique → body must remain slim
— specific clothing proportions → preserve them naturally

Do NOT create hybrid humans.

Do NOT mix:
— uploaded face + original body
— uploaded face + original hands
— uploaded face + original skin tone

ZERO identity mixing allowed.

The uploaded person’s:
— anatomy
— proportions
— skin tone
— body type
— clothing behavior
— silhouette

must remain intact across the ENTIRE body.

The uploaded people must remain IDENTICAL to their source photos.

Preserve EXACTLY:
— facial bone structure
— jawline
— eye shape
— eyelids
— eyebrows
— nose shape
— lip shape
— cheek structure
— forehead proportions
— chin structure
— ears
— natural asymmetry
— hairstyle
— hairline
— hair density
— skin texture
— skin undertone
— body proportions
— shoulder width
— arm proportions
— physique
— silhouette

SKIN CONSISTENCY IS CRITICAL:

If the uploaded person has light skin on the face:
— hands must also be light
— arms must also be light
— neck must also be light
— all visible skin must perfectly match

There must be ZERO mismatch between:
— face and hands
— face and arms
— face and neck
— face and body

Do NOT preserve the original actor’s dark hands, arms, or body skin.

The uploaded body must FULLY replace the original body.

Do NOT create:
— face/body color mismatch
— different undertones
— disconnected body parts
— hybrid identities
— face-swapped appearance
— pasted faces

Do NOT:
— beautify faces
— smooth anatomy unnaturally
— sharpen jawlines
— enlarge eyes
— slim the body
— glamorize appearance
— make them prettier
— make them model-like
— stylize skin
— alter ethnicity
— alter age appearance

The uploaded people must look like authentic photographed humans physically present in the room.

They must NOT look:
— pasted
— composited
— blended with original actors
— face-swapped
— AI-generated
— uncanny
— plastic
— over-retouched

IMPORTANT SCENE STRUCTURE:

Maintain the exact interaction and body positioning:
— left person remains seated on the left side of the couch
— right person remains seated on the right side
— preserve exact handshake position
— preserve exact hand contact
— preserve exact eye-lines
— preserve exact body spacing
— preserve exact leg positions
— preserve exact emotional tone and friendliness

Do NOT alter interaction dynamics.
Do NOT move hands.
Do NOT rotate bodies differently.

Keep:
— exact camera angle
— exact framing
— exact crop
— exact perspective
— exact lens feel
— exact scene geometry
— exact subject spacing

Camera position is LOCKED.
Perspective is LOCKED.
Composition is LOCKED.

NATURAL SCENE ADAPTATION:

Adapt the uploaded people naturally to the scene WITHOUT changing identity.

Scene adaptation may affect ONLY:
— lighting integration
— environmental shadows
— color grading
— atmospheric depth
— depth of field
— film grain
— ambient indoor light response

Identity and anatomy must remain untouched.

LIGHTING:
Match the original warm indoor daylight lighting, soft environmental shadows, realistic skin shading, depth of field, cinematic color grading, and film grain.

Faces, bodies, hands, arms, necks, clothes, and hair must inherit identical scene lighting naturally.

Blend the uploaded people seamlessly into the environment so they appear originally photographed in this exact shot without any identity mixing from the original actors.`;

const STRANGER_3 = `Use the reference image ONLY as a cinematography, composition, pose, and interaction template.

DO NOT use the original actors as appearance references in ANY way.

The original people are ONLY placeholders for:
— body positioning
— pose
— interaction
— framing
— camera angle
— lighting
— scene composition

Completely remove all original identities from the final result.

ABSOLUTELY NO blending between uploaded people and original actors.

Do NOT inherit from the reference actors:
— face shape
— facial proportions
— jawline
— eyes
— eyebrows
— nose
— lips
— hairstyle
— skin texture
— skin color
— body type
— physique
— silhouette
— hand shape
— arm shape
— ethnicity
— age appearance

CRITICAL:
This is NOT a face swap.

Do NOT paste uploaded faces onto the original bodies.

Instead:
fully replace the original actors with the uploaded people as COMPLETE REAL HUMANS naturally existing in the scene.

CRITICAL FULL HUMAN TRANSFER:

Transfer the uploaded people as COMPLETE FULL HUMANS.

NOT just faces.
NOT just heads.
NOT facial identity only.

The ENTIRE PERSON must be transferred together as ONE connected human identity.

This includes:
— head
— face
— hair
— neck
— shoulders
— torso
— arms
— hands
— fingers
— body proportions
— physique
— silhouette
— clothing
— jackets
— sleeves
— posture
— body language

The uploaded person's FULL BODY must replace the original actor's FULL BODY.

Do NOT keep:
— original hands
— original arms
— original body
— original skin color
— original physique
— original clothing fit
— original body proportions

Do NOT attach the uploaded face onto the original actor’s body.

This is NOT a face swap.

This is a COMPLETE PERSON REPLACEMENT.

The uploaded people must remain physically consistent from head to toe.

Face, hands, arms, neck, and body MUST belong to the SAME uploaded person.

If the uploaded person has:
— light skin → hands and body must also be light
— slim physique → body must remain slim
— specific clothing proportions → preserve them naturally

Do NOT create hybrid humans.

Do NOT mix:
— uploaded face + original body
— uploaded face + original hands
— uploaded face + original skin tone

ZERO identity mixing allowed.

The uploaded person’s:
— anatomy
— proportions
— skin tone
— body type
— clothing behavior
— silhouette

must remain intact across the ENTIRE body.

The uploaded people must remain IDENTICAL to their source photos.

Preserve EXACTLY:
— facial bone structure
— jawline
— eye shape
— eyelids
— eyebrows
— nose shape
— lip shape
— cheek structure
— forehead proportions
— chin structure
— ears
— natural asymmetry
— hairstyle
— hairline
— hair density
— skin texture
— skin undertone
— body proportions
— shoulder width
— arm proportions
— physique
— silhouette

SKIN CONSISTENCY IS CRITICAL:

If the uploaded person has light skin on the face:
— hands must also be light
— arms must also be light
— neck must also be light
— all visible skin must perfectly match

There must be ZERO mismatch between:
— face and hands
— face and arms
— face and neck
— face and body

Do NOT preserve the original actor’s skin tone or body identity.

The uploaded body must FULLY replace the original body.

Do NOT create:
— face/body color mismatch
— different undertones
— disconnected body parts
— hybrid identities
— face-swapped appearance
— pasted faces

Do NOT:
— beautify faces
— smooth anatomy unnaturally
— sharpen jawlines
— enlarge eyes
— slim the body
— glamorize appearance
— make them prettier
— make them model-like
— stylize skin
— alter ethnicity
— alter age appearance

The uploaded people must look like authentic photographed humans physically present in the scene.

They must NOT look:
— pasted
— composited
— blended with original actors
— face-swapped
— AI-generated
— uncanny
— plastic
— over-retouched

IMPORTANT SCENE STRUCTURE:

Maintain the exact interaction and body positioning:
— left person remains on the left side looking right
— right person remains on the right side looking left
— preserve exact eye-lines
— preserve exact head angles
— preserve exact body spacing
— preserve exact emotional tension
— preserve exact side-profile orientation

Do NOT rotate faces toward the viewer.
Do NOT alter pose dynamics.
Do NOT move the characters.

Keep:
— exact camera angle
— exact framing
— exact crop
— exact perspective
— exact lens feel
— exact scene geometry
— exact subject spacing

Camera position is LOCKED.
Perspective is LOCKED.
Composition is LOCKED.

NATURAL SCENE ADAPTATION:

Adapt the uploaded people naturally to the scene WITHOUT changing identity.

Scene adaptation may affect ONLY:
— lighting integration
— sunset light response
— environmental shadows
— color grading
— atmospheric depth
— depth of field
— film grain
— warm sky reflections

Identity and anatomy must remain untouched.

NATURAL INTEGRATION IS CRITICAL:

The uploaded people must look physically present in the scene as if they were originally filmed there in-camera.

They must NOT look:
— pasted
— composited
— overlaid
— cut out
— artificially inserted
— disconnected from the environment
— too sharp compared to the scene
— too clean compared to the scene
— relit separately from the scene

Blend the uploaded people naturally into the cinematography and atmosphere of the shot.

Environmental integration must be realistic:
— natural shadow interaction
— natural ambient light bounce
— realistic skin shading
— realistic atmospheric depth
— realistic color contamination from the environment
— realistic scene grain
— realistic softness matching the camera lens

The uploaded people must inherit:
— the exact scene contrast
— the exact scene softness
— the exact scene dynamic range
— the exact scene color grading
— the exact scene noise/grain
— the exact scene depth of field

Do NOT make the transferred people cleaner, sharper, or higher quality than the original scene.

Match the imperfections of the original footage naturally.

Skin must react naturally to scene lighting:
— sunset light
— ambient bounce light
— environmental reflections
— shadow softness
— atmospheric haze

Clothing must integrate naturally into the lighting and environment:
— realistic fabric shadows
— realistic folds
— realistic texture softness
— realistic contact shadows

Hands and faces must have identical lighting behavior and texture quality.

The final image must feel like a real untouched movie frame, not an edited composite.

LIGHTING:
Match the original sunset cinematic lighting, soft warm shadows, realistic skin shading, atmospheric depth, pink sky reflections, depth of field, cinematic color grading, and film grain.

Faces, bodies, hands, arms, necks, clothes, and hair must inherit identical sunset lighting naturally.

Blend the uploaded people seamlessly into the environment so they appear originally photographed in this exact shot without any identity mixing from the original actors.`;

// ── All styles. locked: true → use config.prompt. locked: false → use UNIVERSAL_PROMPT. ──
// provider: "replicate" | "openai"  — controls which API is called for this reference.
// model: the version/model string passed to the chosen provider.
const STYLE_CONFIG: Record<string, { provider: "replicate" | "openai"; model: string; locked: boolean; prompt?: string }> = {
  // ── Zootopia ──
  "zootopia-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: ZOOTOPIA_1 },
  "zootopia-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: ZOOTOPIA_2 },
  "zootopia-3": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: ZOOTOPIA_3 },
  // ── Tangled ──
  "tangled-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: TANGLED_1 },
  "tangled-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: TANGLED_2 },
  "tangled-3": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: TANGLED_3 },
  // ── Cinderella ──
  "cinderella-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: CINDERELLA_PROMPT },
  "cinderella-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: CINDERELLA_PROMPT },
  "cinderella-3": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: CINDERELLA_PROMPT },
  // ── Euphoria ──
  "euphoria-1": { provider: "openai", model: "gpt-image-2", locked: true, prompt: EUPHORIA_1 },
  "euphoria-2": { provider: "openai", model: "gpt-image-2", locked: true, prompt: EUPHORIA_2 },
  "euphoria-3": { provider: "openai", model: "gpt-image-2", locked: true, prompt: EUPHORIA_3 },
  // ── Titanic ──
  "titanic-1": { provider: "openai", model: "gpt-image-2", locked: true, prompt: TITANIC_1 },
  "titanic-2": { provider: "openai", model: "gpt-image-2", locked: true, prompt: TITANIC_2 },
  "titanic-3": { provider: "openai", model: "gpt-image-2", locked: true, prompt: TITANIC_3 },
  // ── Terabithia ──
  "terabithia-1": { provider: "openai", model: "gpt-image-2", locked: true, prompt: TERABITHIA_1 },
  "terabithia-2": { provider: "openai", model: "gpt-image-2", locked: true, prompt: TERABITHIA_2 },
  "terabithia-3": { provider: "openai", model: "gpt-image-2", locked: true, prompt: TERABITHIA_3 },
  // ── Stranger Things ──
  "stranger-things-1": { provider: "openai", model: "gpt-image-2", locked: true, prompt: STRANGER_1 },
  "stranger-things-2": { provider: "openai", model: "gpt-image-2", locked: true, prompt: STRANGER_2 },
  "stranger-things-3": { provider: "openai", model: "gpt-image-2", locked: true, prompt: STRANGER_3 },
  // ── The End of the F***ing World ──
  "end-of-the-fucking-world-1": { provider: "openai", model: "gpt-image-2", locked: true, prompt: WORLD_1 },
  "end-of-the-fucking-world-2": { provider: "openai", model: "gpt-image-2", locked: true, prompt: WORLD_2 },
  "end-of-the-fucking-world-3": { provider: "openai", model: "gpt-image-2", locked: true, prompt: WORLD_3 },
};

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + chunkSize)
    );
  }

  return btoa(binary);
}

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const b64 = uint8ToBase64(bytes);

  // Use the real MIME type as-is. We do NOT remap HEIC→JPEG here because
  // changing the MIME header without converting the binary data causes silent
  // corruption. Provider-specific validation (e.g. OpenAI HEIC rejection) is
  // handled in each provider branch, not here.
  const mime = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";

  console.log(`[FILE] name=${file.name} size=${file.size} mime=${file.type} b64len=${b64.length}`);
  return `data:${mime};base64,${b64}`;
}

// OpenAI only: HEIC/HEIF images cannot be server-converted in Deno without a
// native codec, and fake MIME remapping causes silent binary corruption. We
// reject them early with a clear user-facing message so the frontend can
// prompt the user to re-shoot or convert before uploading.
const HEIC_MIMES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

// OpenAI /v1/images/edits accepts only these formats.
const OPENAI_ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);



function detectImageMime(bytes: Uint8Array): string {
  if (
    bytes[0] === 0xff &&
    bytes[1] === 0xd8
  ) {
    return "image/jpeg";
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46
  ) {
    return "image/webp";
  }

  return "image/png";
}

function validateOpenAIImages(images: string[]): void {
  for (let i = 0; i < images.length; i++) {
    const dataUrl = images[i];
    const mime = dataUrl.startsWith("data:") ? dataUrl.substring(5, dataUrl.indexOf(";")) : "";

    if (HEIC_MIMES.has(mime)) {
      throw new Error(
        `Image ${i + 1} is in HEIC/HEIF format, which is not supported by OpenAI. ` +
        `Please convert your photo to JPEG or PNG before uploading. ` +
        `On iPhone, you can enable "Most Compatible" format in Settings → Camera → Formats.`
      );
    }

    if (mime && !OPENAI_ALLOWED_MIMES.has(mime)) {
      throw new Error(
        `Image ${i + 1} has unsupported format "${mime}". ` +
        `OpenAI requires JPEG, PNG, or WebP images.`
      );
    }
  }
}

const IMAGE_SIZE_LIMIT_BYTES = 6 * 1024 * 1024; // 6MB hard limit

function base64ByteSize(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(",");
  const b64 = commaIdx >= 0 ? dataUrl.length - commaIdx - 1 : dataUrl.length;
  return Math.floor(b64 * 3 / 4);
}

function extractOutputUrl(output: unknown): string | undefined {
  if (typeof output === "string") {
    return output;
  }

  if (Array.isArray(output)) {
    const first = output[0];

    if (typeof first === "string") {
      return first;
    }
  }

  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>;

    const direct =
      obj.url ??
      obj.image ??
      obj.output ??
      obj.uri;

    if (typeof direct === "string") {
      return direct;
    }

    const nestedArrays = [
      obj.images,
      obj.data,
      obj.outputs,
    ];

    for (const arr of nestedArrays) {
      if (
        Array.isArray(arr) &&
        typeof arr[0] === "string"
      ) {
        return arr[0];
      }
    }
  }

  return undefined;
}

const MIN_IMAGE_BYTES = 5_000;

async function proxyImage(proxyUrl: string): Promise<Response> {
  const ALLOWED_PROXY_HOSTS = [
    "https://replicate.delivery/",
    "https://oaidalleapiprodscus.blob.core.windows.net/",
  ];

  if (!ALLOWED_PROXY_HOSTS.some((host) => proxyUrl.startsWith(host))) {
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

// ── Shared helper: upload image bytes to Supabase Storage, return public URL ──
async function uploadToStorage(imageBytes: Uint8Array, mimeType: string): Promise<string> {
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const fileName = `generated/${crypto.randomUUID()}.${ext}`;
  console.log("[STORAGE] uploading fileName:", fileName, "mime:", mimeType, "bytes:", imageBytes.byteLength);

  const { error: uploadError } = await supabase.storage
    .from("generated-images")
    .upload(fileName, imageBytes, {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[STORAGE] upload error:", uploadError.message);
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("generated-images")
    .getPublicUrl(fileName);

  const url = publicUrlData.publicUrl;
  console.log("[STORAGE] public url:", url.substring(0, 100));
  return url;
}

// ── OpenAI generation: called inside waitUntil so it runs after response is sent ──
async function runOpenAIJob(
  jobId: string,
  images: string[],
  finalPrompt: string,
  model: string,
  referenceId: string,
): Promise<void> {
  const markFailed = async (msg: string) => {
    console.error("[OPENAI JOB] failed jobId=" + jobId, msg);
    await supabase.from("generation_jobs").update({
      status: "failed",
      error: msg,
    }).eq("id", jobId);
  };

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      await markFailed("OPENAI_API_KEY not configured");
      return;
    }

    // Mark as processing
    await supabase.from("generation_jobs").update({ status: "processing" }).eq("id", jobId);

    console.log("[OPENAI JOB] building multipart request, images:", images.length, "jobId:", jobId, "referenceId:", referenceId);

    const openaiForm = new FormData();
    openaiForm.append("model", model);
    openaiForm.append("prompt", finalPrompt);
    openaiForm.append("n", "1");
    openaiForm.append("size", "1024x1024");
    openaiForm.append("quality", "medium");
    openaiForm.append("output_format", "jpeg");
    openaiForm.append("output_compression", "85");

    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i];
      const commaIdx = dataUrl.indexOf(",");
      const meta = dataUrl.substring(5, dataUrl.indexOf(";"));
      const b64str = dataUrl.substring(commaIdx + 1);
      const binaryStr = atob(b64str);
      const bytes = new Uint8Array(binaryStr.length);
      for (let j = 0; j < binaryStr.length; j++) {
        bytes[j] = binaryStr.charCodeAt(j);
      }
      const ext = meta.split("/")[1] ?? "jpg";
      openaiForm.append("image[]", new Blob([bytes], { type: meta }), `image_${i}.${ext}`);
    }

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiApiKey}` },
      body: openaiForm,
    });

    const openaiContentType = openaiRes.headers.get("content-type") ?? "";
    console.log("[OPENAI JOB] response status:", openaiRes.status, "content-type:", openaiContentType);

    if (!openaiRes.ok) {
      let errMsg = `OpenAI image generation failed (${openaiRes.status})`;
      try {
        const errData = await openaiRes.json() as Record<string, unknown>;
        console.log("[OPENAI JOB] error body:", JSON.stringify(errData).substring(0, 400));
        errMsg += ": " + (errData?.error ? JSON.stringify(errData.error) : JSON.stringify(errData).substring(0, 300));
      } catch {
        errMsg += ": (non-JSON error body)";
      }
      await markFailed(errMsg);
      return;
    }

    const openaiData = await openaiRes.json() as Record<string, unknown>;
    console.log("[OPENAI JOB] response keys:", Object.keys(openaiData).join(", "));

    const dataArr = openaiData.data as Array<Record<string, unknown>> | undefined;
    const first = dataArr?.[0];
    const outputUrl = first?.url as string | undefined;
    const b64json = first?.b64_json as string | undefined;

    let stableUrl: string;

    if (outputUrl) {
      // Temporary OpenAI/Azure URL — fetch binary and upload to stable Supabase Storage
      console.log("[OPENAI JOB] URL response, fetching binary:", outputUrl.substring(0, 80));
      const imgFetch = await fetch(outputUrl, { headers: { "Accept": "image/*" } });
      if (!imgFetch.ok) {
        await markFailed(`Failed to fetch OpenAI image (${imgFetch.status})`);
        return;
      }
      const imgContentType = (imgFetch.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
      console.log("[OPENAI JOB] fetched content-type:", imgContentType);
      const imgBytes = new Uint8Array(await imgFetch.arrayBuffer());
      stableUrl = await uploadToStorage(imgBytes, imgContentType);
    } else if (b64json) {
      console.log("[OPENAI JOB] b64_json response, decoding...");
      const binaryStr = atob(b64json);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      stableUrl = await uploadToStorage(bytes, "image/jpeg");
    } else {
      await markFailed(`OpenAI response missing output image: ${JSON.stringify(openaiData).substring(0, 200)}`);
      return;
    }

    console.log("[OPENAI JOB] succeeded, stableUrl:", stableUrl.substring(0, 100));
    await supabase.from("generation_jobs").update({
      status: "succeeded",
      output: stableUrl,
    }).eq("id", jobId);

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await markFailed(msg);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const reqUrl = new URL(req.url);

  // ── GET ?jobId=  — poll an async OpenAI job from generation_jobs table ──
  if (req.method === "GET" && reqUrl.searchParams.has("jobId")) {
    const jobId = reqUrl.searchParams.get("jobId")!;
    console.log("[JOB POLL] jobId:", jobId);

    try {
      const { data: job, error: dbErr } = await supabase
        .from("generation_jobs")
        .select("status, output, error")
        .eq("id", jobId)
        .maybeSingle();

      if (dbErr) {
        console.error("[JOB POLL] db error:", dbErr.message);
        return jsonResponse({ provider: "openai", status: "processing" });
      }
      if (!job) {
        return jsonResponse({ provider: "openai", status: "failed", error: "Job not found" });
      }

      console.log("[JOB POLL] status:", job.status, "output:", String(job.output ?? "").substring(0, 80));

      if (job.status === "succeeded") {
        return jsonResponse({ provider: "openai", status: "succeeded", output: job.output, functionVersion: FUNCTION_VERSION });
      }
      if (job.status === "failed") {
        return jsonResponse({ provider: "openai", status: "failed", error: job.error ?? "Unknown error" });
      }
      // pending or processing
      return jsonResponse({ provider: "openai", status: "processing" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[JOB POLL ERROR]", msg);
      return jsonResponse({ provider: "openai", status: "processing" });
    }
  }

  // ── GET ?id=  — poll a Replicate prediction ──
  if (req.method === "GET" && reqUrl.searchParams.has("id")) {
    const predictionId = reqUrl.searchParams.get("id")!;
    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateApiKey) {
      return jsonResponse({ provider: "replicate", status: "failed", error: "REPLICATE_API_KEY not configured" });
    }

    try {
      const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { "Authorization": `Bearer ${replicateApiKey}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("[REPLICATE POLL] error status:", res.status, text.substring(0, 200));
        return jsonResponse({ provider: "replicate", status: "processing" });
      }

      const prediction = await res.json() as Record<string, unknown>;
      const status = prediction.status as string;
      console.log("[REPLICATE POLL] id:", predictionId, "status:", status);

      if (status === "succeeded") {
        const outputUrl = extractOutputUrl(prediction.output);
        console.log("[REPLICATE POLL] outputUrl:", outputUrl?.substring(0, 100) ?? "(none)");
        if (!outputUrl) {
          return jsonResponse({ provider: "replicate", status: "failed", error: "Output URL could not be extracted" });
        }
        return jsonResponse({ provider: "replicate", status: "succeeded", output: outputUrl, functionVersion: FUNCTION_VERSION });
      }

      if (status === "failed" || status === "canceled") {
        const errDetail = JSON.stringify(prediction.error ?? prediction.logs ?? status);
        console.error("[REPLICATE POLL] prediction", status, errDetail);
        return jsonResponse({ provider: "replicate", status: "failed", error: errDetail });
      }

      return jsonResponse({ provider: "replicate", status: "processing" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[REPLICATE POLL ERROR]", msg);
      return jsonResponse({ provider: "replicate", status: "processing" });
    }
  }

  // ── POST /generate ── validate, route to provider, return job/prediction ID immediately ──
  if (req.method === "POST") {
    try {
      const formData = await req.formData();

      const referenceId = formData.get("referenceId");
      const reference = formData.get("reference") as File | null;
      const person1 = formData.get("person1") as File | null;
      const person1b = formData.get("person1b") as File | null;
      const person2 = formData.get("person2") as File | null;
      const person2b = formData.get("person2b") as File | null;

      if (!reference || reference.size === 0) {
        return jsonResponse({ error: "Missing or empty reference file" } as unknown as GenerateResponse, 400);
      }
      if (!person1 || person1.size === 0 || !person2 || person2.size === 0) {
        return jsonResponse({ error: "Missing or empty person1/person2 files" } as unknown as GenerateResponse, 400);
      }

      const config = STYLE_CONFIG[referenceId as string];
      if (!config) {
        return jsonResponse({ error: `Unknown referenceId: ${referenceId}` } as unknown as GenerateResponse, 400);
      }

      console.log("[VERSION]", FUNCTION_VERSION);
      console.log("[PROVIDER]", config.provider);
      console.log("[MODEL]", config.model);
      console.log("[REFERENCE_ID]", referenceId);

      const hasMan2 = !!person1b && person1b.size > 0;
      const hasWoman2 = !!person2b && person2b.size > 0;

      // ── IMAGE ROLE MAPPING ──
      const manCount = hasMan2 ? 2 : 1;
      const womanCount = hasWoman2 ? 2 : 1;
      const idxScene = 0;
      const idxManStart = 1;
      const idxManEnd = idxManStart + manCount - 1;
      const idxWomanStart = idxManEnd + 1;
      const totalImages = 1 + manCount + womanCount;

      const manIdxList = manCount === 1
        ? `image_input[${idxManStart}]`
        : `image_input[${idxManStart}] and image_input[${idxManEnd}]`;
      const womanIdxList = womanCount === 1
        ? `image_input[${idxWomanStart}]`
        : `image_input[${idxWomanStart}] and image_input[${idxWomanStart + womanCount - 1}]`;

      const roleMappingBlock = `IMAGE ROLE MAPPING (${totalImages} images total):
- image_input[${idxScene}] = base scene (pose, expression, lighting, composition source)
- ${manIdxList} = MAN identity source${manCount > 1 ? " (same person, merge into one identity)" : ""}
- ${womanIdxList} = WOMAN identity source${womanCount > 1 ? " (same person, merge into one identity)" : ""}

The man in the scene must look like the person in ${manIdxList}.
The woman in the scene must look like the person in ${womanIdxList}.
Do NOT mix man and woman identity sources.
Do NOT use image_input[${idxScene}] as an identity source.`;

      const finalPrompt = config.locked
        ? roleMappingBlock + "\n\n" + config.prompt
        : roleMappingBlock + "\n\n" + UNIVERSAL_PROMPT;

      // ── Build image data URLs ──
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
          throw new Error(
            `Image ${i} is ${(rawBytes / 1024 / 1024).toFixed(2)}MB — exceeds the 6MB per-image limit.`
          );
        }
      }

      const imageSummary = images.map((img, i) => ({
        index: i,
        mime: img.startsWith("data:") ? img.substring(5, img.indexOf(";")) : "unknown",
        bytes: base64ByteSize(img),
      }));
      console.log("[INPUT_IMAGES]", images.length, JSON.stringify(imageSummary));
      console.log("[TOTAL_MB]", (imageSummary.reduce((s, x) => s + x.bytes, 0) / 1024 / 1024).toFixed(2));

      // ── REPLICATE ──
      if (config.provider === "replicate") {
        const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
        if (!replicateApiKey) throw new Error("REPLICATE_API_KEY not configured");

        const createRes = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${replicateApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: config.model,
            input: { prompt: finalPrompt, image_input: images },
          }),
        });

        const createText = await createRes.text();
        console.log("[REPLICATE CREATE] status:", createRes.status, "body:", createText.substring(0, 300));

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

        console.log("[REPLICATE CREATE] prediction started id=" + predictionId);

        return jsonResponse({
          provider: "replicate",
          status: "processing",
          predictionId,
          model: config.model,
          referenceId: referenceId as string,
          functionVersion: FUNCTION_VERSION,
        }, 201);
      }

      // ── OPENAI (async via waitUntil) ──
      if (config.provider === "openai") {
        validateOpenAIImages(images);

        // Insert a pending job row — returns immediately (< 100ms)
        const { data: jobRow, error: insertErr } = await supabase
          .from("generation_jobs")
          .insert({ provider: "openai", status: "pending" })
          .select("id")
          .single();

        if (insertErr || !jobRow) {
          throw new Error(`Failed to create generation job: ${insertErr?.message ?? "no row returned"}`);
        }

        const jobId = jobRow.id as string;
        console.log("[OPENAI] job created jobId:", jobId, "referenceId:", referenceId);

        // Process OpenAI in background — response is already sent when this runs
        EdgeRuntime.waitUntil(
          runOpenAIJob(jobId, images, finalPrompt, config.model, referenceId as string)
        );

        return jsonResponse({
          provider: "openai",
          status: "processing",
          predictionId: jobId,   // reuse predictionId field so frontend poll logic is uniform
          model: config.model,
          referenceId: referenceId as string,
          functionVersion: FUNCTION_VERSION,
        }, 201);
      }

      throw new Error(`Unknown provider: ${(config as { provider: string }).provider}`);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[POST ERROR]", msg);
      return jsonResponse({ error: msg } as unknown as GenerateResponse, 500);
    }
  }

  return jsonResponse({ error: "Method not allowed" } as unknown as GenerateResponse, 405);
});