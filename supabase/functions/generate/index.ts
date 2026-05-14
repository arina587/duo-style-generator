import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

const EUPHORIA_1 = `Use the reference image only for hallway environment, framing, camera angle, perspective, lighting, pose layout, and cinematic atmosphere.

IMPORTANT:
Remove BOTH original people completely from the image before generating the new subjects.

Do NOT preserve any part of the original male or female:
- no original face
- no original hair
- no original body
- no original hands
- no original skin
- no original clothing
- no original silhouette

Generate TWO entirely new full-body people using ONLY the uploaded references.

Replacement mapping:
- uploaded female → left side position
- uploaded male → right side position

The generated people must fully replace the original subjects in the scene.

Preserve the uploaded people’s recognizable appearance:

- facial structure
- eyes
- nose
- lips
- jawline
- hairstyle
- hair texture
- skin tone
- body proportions
- silhouette
- natural anatomy

Both people must remain clearly recognizable as the uploaded individuals across the entire body, not only the face.

Preserve the original scene composition:

- exact camera angle
- hallway framing
- body orientation
- relative distance
- eye-line interaction
- perspective
- environmental depth

Create realistic complete bodies with coherent:

- necks
- shoulders
- torso
- arms
- hands
- legs
- posture
- clothing folds
- body proportions

Do NOT morph or blend the uploaded people with the original people from the reference image.

Do NOT perform partial replacement.

The uploaded people must appear as fully reconstructed realistic humans naturally standing in the hallway scene.

Adapt clothing naturally to the cinematic school hallway environment while keeping the uploaded people visually recognizable.

Match the original scene lighting:

- indoor fluorescent lighting
- soft realistic shadows
- cinematic contrast
- realistic skin shading
- shallow depth of field
- subtle film grain

Preserve:
- lockers
- hallway depth
- background students
- blur intensity
- environmental realism

The result should look like a real cinematic photograph captured in-camera, not a face swap, pasted composite, morph, or AI edit.

Avoid:

- partial replacement
- keeping original bodies
- keeping original hairstyles
- blended identities
- distorted anatomy
- unrealistic hands
- disconnected body parts
- warped clothing
- plastic-looking skin
- inconsistent lighting
- overprocessed details

All people in the photo are over 18 years old.`;

const EUPHORIA_2 = `Use the reference image as a STRICT shot blueprint.

Do NOT reinterpret, restage, reframe, rotate, recrop, zoom, or change the camera viewpoint in any way.

The final image must preserve:
— exact camera angle
— exact perspective
— exact framing
— exact crop
— exact lens feel
— exact subject placement
— exact body orientation
— exact scene geometry
— exact distance between subjects
— exact shot orientation

Camera position is LOCKED.
Perspective is LOCKED.
Composition is LOCKED.

Keep the scene from the identical viewpoint as the reference frame.

IMPORTANT:
The woman must remain turned away from the camera exactly like in the reference image.
Do NOT rotate her toward the viewer.
Do NOT reveal more of her face.
Maintain the same head angle, shoulder angle, and back-facing orientation.

Erase all original people. Their positions are empty slots — fill them with the people from the uploaded photos.

REPLACEMENT:
— woman slot → woman from uploaded female photo
— man slot → man from uploaded male photo
Do NOT swap genders or roles.

RECONSTRUCTION:
Rebuild each person completely from scratch.
Do NOT face-swap.
Do NOT blend identities with original actors.
Do NOT preserve original facial features.

IDENTITY:
Preserve facial structure, proportions, skin tone, hair, and recognizability of uploaded people.

SKIN CONSISTENCY:
Hands, arms, neck, shoulders, and visible body skin must perfectly match the facial skin tone and undertone.
No mismatched skin color between face and body.
No different lighting temperature on hands or body.

CLOTHING:
Adapt naturally to the environment and cinematic style of the scene.

POSE:
Match the original pose, body direction, posture, eye-line, interaction, and cinematic blocking precisely.

LIGHTING:
Match original lighting direction, shadows, color grading, depth of field, film grain, and scene atmosphere.

Faces and bodies must inherit identical scene lighting naturally.
The result must not look pasted, composited, or AI-generated.

The uploaded people must look like they were originally filmed in this exact shot.`;

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

const TITANIC_1 = `Use the reference image only as a guide for composition, pose, camera angle, framing, lighting, perspective, and cinematic atmosphere.

Create a realistic cinematic image where the two uploaded people appear naturally in the same scene and pose.

Place the first uploaded person on the left and the second uploaded person on the right.

Preserve the uploaded people’s real visual appearance as accurately as possible, including:

- facial features
- hairstyle
- skin tone
- body proportions
- clothing
- silhouette
- natural anatomy

The people should be shown from face to body as complete, coherent humans, with realistic posture, natural shoulders, arms, hands, torso, and clothing folds.

Keep the scene structure:

- two people standing together
- one person behind the other
- arms extended outward
- warm sunset lighting
- cinematic shadows
- soft film look
- realistic depth of field
- natural color grading
- subtle film grain

Make the people blend naturally into the environment with consistent lighting on face, hair, neck, hands, arms, and clothing.

The final image should look like an authentic cinematic photograph captured in-camera, with realistic anatomy and natural integration.

Avoid:

- distorted faces
- distorted hands
- unnatural body proportions
- disconnected necks or shoulders
- inconsistent lighting
- artificial skin texture
- overly polished or plastic-looking faces
- warped clothing
- unnatural compositing

All people in the photo are over 18 years old.`;

const TITANIC_2 = `Use the reference image only for cinematic composition, camera angle, framing, lighting, perspective, pose, and emotional atmosphere.

Create a realistic cinematic scene where the two uploaded people naturally appear in the same position and interaction.

Keep:

- the seated composition
- the intimate over-shoulder interaction
- one person leaning toward the other
- the sketchbook/book held in the foreground
- warm low-key lighting
- soft cinematic shadows
- film-like depth of field
- warm amber color grading

Place the uploaded male in the front/right position and the uploaded female behind/left, matching the original scene structure.

Preserve the uploaded people’s real appearance as accurately as possible, including:

- facial features
- hairstyle
- skin tone
- body proportions
- natural anatomy
- clothing appearance
- silhouette

The people should appear as complete realistic humans with coherent:

- necks
- shoulders
- arms
- hands
- posture
- clothing folds
- body proportions

Maintain realistic lighting consistency across:

- face
- hair
- neck
- hands
- clothing

The final image should look like an authentic cinematic movie still captured in-camera, with natural human detail and realistic environmental integration.

Avoid:

- distorted faces
- distorted hands
- unnatural anatomy
- disconnected body parts
- unrealistic proportions
- artificial skin texture
- plastic-looking faces
- warped clothing
- inconsistent lighting
- unnatural compositing
- overprocessed details

All people in the photo are over 18 years old.`;

const TITANIC_3 = `Use the reference image only for cinematic composition, pose, framing, camera angle, perspective, lighting, and emotional atmosphere.

Create a realistic cinematic scene where the two uploaded people naturally appear in the same interaction and position.

Keep:

- the romantic close embrace
- one person standing behind the other
- hands around the waist
- intimate face positioning
- sunset ship-deck atmosphere
- warm golden-hour lighting
- cinematic shadows
- soft film-like depth of field
- realistic background perspective
- natural cinematic color grading

Place the uploaded male behind and the uploaded female in front, matching the original composition.

Preserve the uploaded people’s real appearance as accurately as possible, including:

- facial structure
- hairstyle
- skin tone
- body proportions
- silhouette
- clothing appearance
- natural anatomy

The people should appear as complete realistic humans with coherent:

- necks
- shoulders
- torso
- arms
- hands
- posture
- clothing folds
- body proportions

Maintain realistic lighting consistency across:

- face
- hair
- neck
- hands
- arms
- clothing

The uploaded people should blend naturally into the environment as if photographed in-camera during a real cinematic scene.

The final image should look like an authentic romantic movie still with realistic human detail and seamless environmental integration.

Avoid:

- distorted faces
- distorted hands
- unnatural anatomy
- disconnected body parts
- unrealistic proportions
- artificial skin texture
- plastic-looking faces
- warped clothing
- inconsistent lighting
- unnatural compositing
- overprocessed details

All people in the photo are over 18 years old.`;

const TERABITHIA_1 = `Use the reference image ONLY for:
— composition
— camera angle
— pose
— framing
— lighting
— environment
— interaction

DO NOT use the original people as appearance references in ANY way.

The original actors must be treated as empty placeholders only.

Completely remove all original identities, facial traits, bone structure, expressions, skin texture, and anatomy from the final result.

ABSOLUTELY NO blending between the uploaded people and the original actors.

The uploaded people must remain 100% independent identities.

Do NOT inherit from the original actors:
— face shape
— jawline
— eyes
— eyebrows
— nose
— lips
— smile
— cheek structure
— body type
— silhouette
— hairstyle
— skin texture
— age appearance

CRITICAL:
Do NOT face-swap onto the original actors.

Instead:
fully replace the original people with the uploaded people as entirely new humans naturally existing in the same scene.

The uploaded people must preserve EXACTLY:
— their real facial structure
— their real proportions
— their real body shape
— their real silhouette
— their real asymmetry
— their real skin texture
— their real hairstyle
— their real age appearance

Do NOT beautify.
Do NOT stylize.
Do NOT cinematic-glamorize faces.
Do NOT make them look AI-generated.

The uploaded people must look naturally photographed in-camera.

They must NOT look:
— pasted
— composited
— blended with original actors
— face-swapped
— over-smoothed
— plastic
— uncanny
— synthetic

IMPORTANT:
Identity preservation is MORE important than similarity to the original actors.

Use the original image ONLY as a staging and cinematography template.

Keep:
— exact camera angle
— exact pose
— exact framing
— exact interaction
— exact body placement
— exact scene geometry
— exact eye direction
— exact crop

Camera position is LOCKED.
Perspective is LOCKED.
Composition is LOCKED.

Natural scene adaptation should affect ONLY:
— lighting integration
— shadows
— color grading
— depth of field
— atmospheric perspective
— film grain

Identity and anatomy must remain untouched.

SKIN CONSISTENCY:
Hands, neck, arms, ears, and body skin must perfectly match the face skin tone and undertone.

No different body color.
No separate face lighting.
No artificial skin smoothing.

Blend the uploaded people seamlessly into the environment so they appear originally photographed there without any identity mixing from the reference actors.`;

const TERABITHIA_2 = `Use the reference image as a STRICT shot blueprint.

Do NOT reinterpret, redesign, beautify, stylize, age-change, de-age, masculinize, feminize, or alter the uploaded people in any way.

Do NOT generate “inspired by” versions.
Do NOT create approximations.
Do NOT create similar-looking people.

The final image must preserve:
— exact camera angle
— exact framing
— exact crop
— exact perspective
— exact lens feel
— exact subject spacing
— exact body placement
— exact head placement
— exact hand placement
— exact shot orientation
— exact scene geometry

Camera position is LOCKED.
Perspective is LOCKED.
Composition is LOCKED.

Keep the identical viewpoint and framing from the original reference image.

IMPORTANT:
Maintain the exact interaction and intimacy of the scene.

— the male character remains leaning in and kissing the female character on the forehead
— the female character remains relaxed with eyes closed
— preserve the exact head contact point
— preserve the exact arm placement
— preserve the exact body closeness
— preserve the exact emotional tone and tenderness

Do NOT separate the characters.
Do NOT rotate faces toward the viewer.
Do NOT alter the physical interaction.

Maintain exact left/right placement:
— female remains on the left
— male remains on the right

Erase all original people completely and replace them entirely with the uploaded people.

REPLACEMENT:
— left slot → woman/girl from uploaded female photo
— right slot → man/boy from uploaded male photo

Do NOT swap genders, sides, or roles.

CRITICAL IDENTITY LOCK:

The uploaded people must remain IDENTICAL to their source photos.

Preserve EXACTLY:
— facial bone structure
— jawline
— eye shape
— eyelid shape
— eyebrow shape and spacing
— nose shape
— lip shape
— cheek volume
— forehead proportions
— chin structure
— ears
— skin texture
— skin undertone
— hairstyle
— hair density
— hairline
— body proportions
— shoulder width
— neck thickness
— silhouette
— natural asymmetry

Do NOT:
— modify attractiveness
— smooth facial structure
— enlarge eyes
— shrink nose
— sharpen jawline
— alter face proportions
— change ethnicity
— change age appearance
— make skin porcelain/artificial
— stylize facial anatomy

FULL HUMAN TRANSFER:

Transfer the uploaded people holistically into the scene:
— face
— body
— physique
— posture
— proportions
— clothing behavior
— natural imperfections

Do NOT only transfer faces.

The uploaded people must look physically present in the scene as real photographed humans.

They must NOT look:
— pasted
— composited
— face-swapped
— AI-generated
— plastic
— beauty-filtered
— disconnected from environment

NATURAL SCENE ADAPTATION:

Adapt the uploaded people naturally to the scene lighting and cinematography WITHOUT changing identity.

Scene adaptation must affect ONLY:
— lighting response
— shadow integration
— color temperature
— atmospheric grading
— depth of field
— film grain

Identity and anatomy must remain untouched.

SKIN CONSISTENCY:
Hands, fingers, neck, ears, arms, and visible body skin must perfectly match facial skin tone and undertone.

No mismatched body color.
No separate face/body lighting.
No artificial skin smoothing.

POSE:
Match original posture, shoulder angle, neck angle, head tilt, eye direction, and interaction precisely.

LIGHTING:
Match the original warm indoor cinematic lighting, soft shadows, environmental bounce light, depth of field, atmospheric warmth, realistic skin shading, and film grain.

Faces, bodies, hands, clothes, and hair must inherit identical scene lighting naturally.

Blend the uploaded people seamlessly into the cinematography so they appear originally photographed in this exact moment.`;

const WORLD_1 = `Use the reference image ONLY as a cinematography, composition, pose, and interaction template.

DO NOT use the original people as appearance references in ANY way.

The original people are ONLY placeholders for:
— body positioning
— pose
— interaction
— framing
— camera angle
— lighting
— scene composition
— environment

Completely remove all original identities from the final result.

ABSOLUTELY NO blending between uploaded people and original people.

Do NOT inherit from the reference people:
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
fully replace the original people with the uploaded people as COMPLETE REAL HUMANS naturally existing in the scene.

CRITICAL PRIORITY ORDER:

1. Preserve uploaded people's identity EXACTLY
2. Preserve uploaded people's body proportions EXACTLY
3. Preserve uploaded people's pose EXACTLY
4. Preserve uploaded people's clothing/body consistency EXACTLY
5. ONLY AFTER THAT adapt to the scene

DO NOT reinterpret the uploaded people.

DO NOT redesign their pose.
DO NOT modify their anatomy.
DO NOT stylize their body language.

The uploaded people must remain visually IDENTICAL to their source photos.

IDENTITY LOCK IS MORE IMPORTANT than cinematic adaptation.

POSE LOCK IS MORE IMPORTANT than scene reinterpretation.

BODY LOCK IS MORE IMPORTANT than matching the original people.

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

The uploaded person's FULL BODY must replace the original person's FULL BODY.

Do NOT keep:
— original hands
— original arms
— original body
— original skin color
— original physique
— original clothing fit
— original body proportions

Do NOT attach the uploaded face onto the original person’s body.

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

ABSOLUTE POSE REPLICATION REQUIRED.

The uploaded people must replicate the EXACT body pose from the reference image with near pixel-level accuracy.

Do NOT reinterpret the pose in ANY way.

Do NOT create a similar pose.
Do NOT create an approximate pose.
Do NOT generate a “natural variation”.

The final pose must be a DIRECT PHYSICAL REPLACEMENT of the original people.

Treat the reference pose as LOCKED skeletal geometry.

Preserve EXACTLY:
— head rotation
— chin angle
— neck tilt
— shoulder rotation
— torso lean
— spine curve
— body compression/stretch
— hip angle
— arm placement
— elbow bend angle
— wrist rotation
— hand placement
— finger positions
— leg angles
— knee bend
— foot direction
— body overlap
— body contact points
— weight distribution
— leaning direction
— interaction pressure
— distance between bodies

The uploaded people must occupy the EXACT SAME coordinates and silhouette positioning as the reference people.

IMPORTANT SCENE STRUCTURE:

— left person remains standing on the left side facing right
— right person remains standing on the right side facing left
— preserve exact side-profile orientation
— preserve exact eye-lines
— preserve exact distance between faces
— preserve exact shoulder height relationship
— preserve exact body spacing
— preserve exact emotional tension and stillness

Do NOT rotate faces toward the viewer.
Do NOT change body orientation.
Do NOT move the characters closer or farther apart.

Do NOT:
— straighten posture
— improve anatomy
— rebalance the body
— make pose more comfortable
— move limbs
— reposition hands
— alter body energy
— alter interaction geometry
— alter body tension

Even tiny pose deviations are NOT allowed.

The scene should look like:
the original people were physically replaced frame-by-frame by the uploaded people while preserving the exact skeletal positioning and interaction mechanics.

CRITICAL IDENTITY LOCK:

Preserve EXACTLY:
— facial structure
— eye spacing
— nose proportions
— lips
— jawline
— cheeks
— forehead
— hairstyle
— silhouette
— physique
— natural asymmetry

Do NOT:
— beautify
— glamorize
— make more cinematic
— smooth skin
— sharpen features
— enlarge eyes
— slim body

The uploaded people must remain REAL and RAW.

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

Do NOT preserve the original person’s skin tone or body identity.

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

The uploaded people must look like authentic photographed humans physically present in the environment.

They must NOT look:
— pasted
— composited
— blended with original people
— face-swapped
— AI-generated
— uncanny
— plastic
— over-retouched

Keep:
— exact camera angle
— exact framing
— exact crop
— exact perspective
— exact room geometry
— exact subject spacing
— exact side-profile framing

Camera position is LOCKED.
Perspective is LOCKED.
Composition is LOCKED.

NATURAL SCENE ADAPTATION:

Adapt the uploaded people naturally to the scene WITHOUT changing identity.

Scene adaptation may affect ONLY:
— lighting integration
— environmental shadows
— warm lamp reflections
— window reflections
— color grading
— atmospheric depth
— depth of field
— film grain
— ambient room lighting

IMPORTANT:
The uploaded people should feel physically moved into the scene, not recreated by AI.

Almost like:
“cutting the real people out of their original photo and naturally filming them inside the new environment.”

NOT:
“re-generating similar people from scratch.”

Scene adaptation must stay SUBTLE.

Do NOT let:
— lighting adaptation
— cinematic grading
— environment matching
— AI reconstruction

damage identity accuracy or pose accuracy.

NATURAL INTEGRATION IS CRITICAL:

The uploaded people must look physically present in the scene as if they were originally photographed there in-camera.

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
— realistic warm lamp reflections
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

Match the imperfections of the original frame naturally.

Skin must react naturally to scene lighting:
— warm indoor lamp light
— window ambient light
— environmental reflections
— realistic shadow softness
— realistic highlight rolloff

Clothing must integrate naturally into the lighting and environment:
— realistic fabric shadows
— realistic folds
— realistic texture softness
— realistic contact shadows

Hands and faces must have identical lighting behavior and texture quality.

The final image must feel like a real untouched cinematic movie frame, not an edited composite.

LIGHTING:
Match the original warm indoor cinematic lighting, soft environmental shadows, realistic skin shading, atmospheric depth, window reflections, depth of field, cinematic color grading, and film grain.

Faces, bodies, hands, arms, necks, clothes, and hair must inherit identical scene lighting naturally.

Blend the uploaded people seamlessly into the environment so they appear originally photographed in this exact shot without any identity mixing from the original people.`;

const WORLD_2 = `Use the reference image ONLY as a cinematography, composition, pose, and interaction template.

DO NOT use the original people as appearance references in ANY way.

The original people are ONLY placeholders for:
— body positioning
— pose
— interaction
— framing
— camera angle
— lighting
— scene composition
— environment

Completely remove all original identities from the final result.

ABSOLUTELY NO blending between uploaded people and original people.

Do NOT inherit from the reference people:
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
fully replace the original people with the uploaded people as COMPLETE REAL HUMANS naturally existing in the scene.

CRITICAL PRIORITY ORDER:

1. Preserve uploaded people's identity EXACTLY
2. Preserve uploaded people's body proportions EXACTLY
3. Preserve uploaded people's pose EXACTLY
4. Preserve uploaded people's clothing/body consistency EXACTLY
5. ONLY AFTER THAT adapt to the scene

DO NOT reinterpret the uploaded people.

DO NOT redesign their pose.
DO NOT modify their anatomy.
DO NOT stylize their body language.

The uploaded people must remain visually IDENTICAL to their source photos.

IDENTITY LOCK IS MORE IMPORTANT than cinematic adaptation.

POSE LOCK IS MORE IMPORTANT than scene reinterpretation.

BODY LOCK IS MORE IMPORTANT than matching the original people.

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

The uploaded person's FULL BODY must replace the original person's FULL BODY.

Do NOT keep:
— original hands
— original arms
— original body
— original skin color
— original physique
— original clothing fit
— original body proportions

Do NOT attach the uploaded face onto the original person’s body.

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

ABSOLUTE POSE REPLICATION REQUIRED.

The uploaded people must replicate the EXACT body pose from the reference image with near pixel-level accuracy.

Do NOT reinterpret the pose in ANY way.

Do NOT create a similar pose.
Do NOT create an approximate pose.
Do NOT generate a “natural variation”.

The final pose must be a DIRECT PHYSICAL REPLACEMENT of the original people.

Treat the reference pose as LOCKED skeletal geometry.

Preserve EXACTLY:
— head rotation
— chin angle
— neck tilt
— shoulder rotation
— torso lean
— spine curve
— body compression/stretch
— hip angle
— arm placement
— elbow bend angle
— wrist rotation
— hand placement
— finger positions
— leg angles
— knee bend
— foot direction
— body overlap
— body contact points
— weight distribution
— leaning direction
— interaction pressure
— distance between bodies

The uploaded people must occupy the EXACT SAME coordinates and silhouette positioning as the reference people.

IMPORTANT SCENE STRUCTURE:

— left person remains in the front passenger seat facing right
— right person remains in the driver seat facing left
— preserve exact eye-lines between characters
— preserve exact side-profile orientation
— preserve exact shoulder angles
— preserve exact leaning posture
— preserve exact arm placement on the seat
— preserve exact head distance between characters
— preserve exact emotional tension and intimacy

Do NOT rotate faces toward the viewer.
Do NOT change body orientation.
Do NOT reposition hands or shoulders.

Do NOT:
— straighten posture
— improve anatomy
— rebalance the body
— make pose more comfortable
— move limbs
— reposition hands
— alter body energy
— alter interaction geometry
— alter body tension

Even tiny pose deviations are NOT allowed.

The scene should look like:
the original people were physically replaced frame-by-frame by the uploaded people while preserving the exact skeletal positioning and interaction mechanics.

CRITICAL IDENTITY LOCK:

Preserve EXACTLY:
— facial structure
— eye spacing
— nose proportions
— lips
— jawline
— cheeks
— forehead
— hairstyle
— silhouette
— physique
— natural asymmetry

Do NOT:
— beautify
— glamorize
— make more cinematic
— smooth skin
— sharpen features
— enlarge eyes
— slim body

The uploaded people must remain REAL and RAW.

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

Do NOT preserve the original person’s skin tone or body identity.

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

The uploaded people must look like authentic photographed humans physically present in the environment.

They must NOT look:
— pasted
— composited
— blended with original people
— face-swapped
— AI-generated
— uncanny
— plastic
— over-retouched

Keep:
— exact camera angle
— exact framing
— exact crop
— exact perspective
— exact lens distortion
— exact car interior geometry
— exact seat positioning
— exact subject spacing

Camera position is LOCKED.
Perspective is LOCKED.
Composition is LOCKED.

NATURAL SCENE ADAPTATION:

Adapt the uploaded people naturally to the scene WITHOUT changing identity.

Scene adaptation may affect ONLY:
— lighting integration
— environmental shadows
— daylight reflections
— windshield reflections
— color grading
— atmospheric depth
— depth of field
— film grain
— ambient car interior lighting

IMPORTANT:
The uploaded people should feel physically moved into the scene, not recreated by AI.

Almost like:
“cutting the real people out of their original photo and naturally filming them inside the new environment.”

NOT:
“re-generating similar people from scratch.”

Scene adaptation must stay SUBTLE.

Do NOT let:
— lighting adaptation
— cinematic grading
— environment matching
— AI reconstruction

damage identity accuracy or pose accuracy.

NATURAL INTEGRATION IS CRITICAL:

The uploaded people must look physically present in the scene as if they were originally photographed there in-camera.

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
— realistic windshield reflections
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

Match the imperfections of the original photo naturally.

Skin must react naturally to scene lighting:
— daylight through windows
— ambient car interior shadows
— windshield reflections
— environmental reflections
— realistic shadow softness

Clothing must integrate naturally into the lighting and environment:
— realistic fabric shadows
— realistic folds
— realistic texture softness
— realistic contact shadows

Hands and faces must have identical lighting behavior and texture quality.

The final image must feel like a real untouched cinematic movie frame, not an edited composite.

LIGHTING:
Match the original daylight car interior lighting, soft environmental shadows, realistic skin shading, windshield reflections, atmospheric depth, depth of field, cinematic color grading, and film grain.

Faces, bodies, hands, arms, necks, clothes, and hair must inherit identical scene lighting naturally.

Blend the uploaded people seamlessly into the environment so they appear originally photographed in this exact shot without any identity mixing from the original people.`;

const WORLD_3 = `Use the reference image ONLY as a cinematography, composition, pose, and interaction template.

DO NOT use the original people as appearance references in ANY way.

The original people are ONLY placeholders for:
— body positioning
— pose
— interaction
— framing
— camera angle
— lighting
— scene composition
— environment

Completely remove all original identities from the final result.

ABSOLUTELY NO blending between uploaded people and original people.

Do NOT inherit from the reference people:
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
fully replace the original people with the uploaded people as COMPLETE REAL HUMANS naturally existing in the scene.

CRITICAL PRIORITY ORDER:

1. Preserve uploaded people's identity EXACTLY
2. Preserve uploaded people's body proportions EXACTLY
3. Preserve uploaded people's pose EXACTLY
4. Preserve uploaded people's clothing/body consistency EXACTLY
5. ONLY AFTER THAT adapt to the scene

DO NOT reinterpret the uploaded people.

DO NOT redesign their pose.
DO NOT modify their anatomy.
DO NOT stylize their body language.

The uploaded people must remain visually IDENTICAL to their source photos.

IDENTITY LOCK IS MORE IMPORTANT than cinematic adaptation.

POSE LOCK IS MORE IMPORTANT than scene reinterpretation.

BODY LOCK IS MORE IMPORTANT than matching the original people.

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

The uploaded person's FULL BODY must replace the original person's FULL BODY.

Do NOT keep:
— original hands
— original arms
— original body
— original skin color
— original physique
— original clothing fit
— original body proportions

Do NOT attach the uploaded face onto the original person’s body.

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

ABSOLUTE POSE REPLICATION REQUIRED.

The uploaded people must replicate the EXACT body pose from the reference image with near pixel-level accuracy.

Do NOT reinterpret the pose in ANY way.

Do NOT create a similar pose.
Do NOT create an approximate pose.
Do NOT generate a “natural variation”.

The final pose must be a DIRECT PHYSICAL REPLACEMENT of the original people.

Treat the reference pose as LOCKED skeletal geometry.

Preserve EXACTLY:
— head rotation
— chin angle
— neck tilt
— shoulder rotation
— torso lean
— spine curve
— body compression/stretch
— hip angle
— arm placement
— elbow bend angle
— wrist rotation
— hand placement
— finger positions
— leg angles
— knee bend
— foot direction
— body overlap
— body contact points
— weight distribution
— leaning direction
— interaction pressure
— distance between bodies

The uploaded people must occupy the EXACT SAME coordinates and silhouette positioning as the reference people.

IMPORTANT SCENE STRUCTURE:

— left person remains seated on the left side
— right person remains seated on the right side
— preserve exact hand holding position
— preserve exact finger contact
— preserve exact arm angles
— preserve exact body spacing
— preserve exact eye-lines
— preserve exact facial direction
— preserve exact emotional awkwardness and subtle tension

The right person must keep the sideways eye direction.
Do NOT rotate the face toward camera.

Do NOT:
— straighten posture
— improve anatomy
— rebalance the body
— make pose more comfortable
— move limbs
— reposition hands
— alter body energy
— alter interaction geometry
— alter body tension

Even tiny pose deviations are NOT allowed.

The scene should look like:
the original people were physically replaced frame-by-frame by the uploaded people while preserving the exact skeletal positioning and interaction mechanics.

CRITICAL IDENTITY LOCK:

Preserve EXACTLY:
— facial structure
— eye spacing
— nose proportions
— lips
— jawline
— cheeks
— forehead
— hairstyle
— silhouette
— physique
— natural asymmetry

Do NOT:
— beautify
— glamorize
— make more cinematic
— smooth skin
— sharpen features
— enlarge eyes
— slim body

The uploaded people must remain REAL and RAW.

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

Do NOT preserve the original person’s skin tone or body identity.

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

The uploaded people must look like authentic photographed humans physically present in the environment.

They must NOT look:
— pasted
— composited
— blended with original people
— face-swapped
— AI-generated
— uncanny
— plastic
— over-retouched

Keep:
— exact camera angle
— exact framing
— exact crop
— exact perspective
— exact lens distortion
— exact restaurant geometry
— exact table positioning
— exact subject spacing

Camera position is LOCKED.
Perspective is LOCKED.
Composition is LOCKED.

NATURAL SCENE ADAPTATION:

Adapt the uploaded people naturally to the scene WITHOUT changing identity.

Scene adaptation may affect ONLY:
— lighting integration
— environmental shadows
— warm indoor reflections
— color grading
— atmospheric depth
— depth of field
— film grain
— ambient restaurant lighting

IMPORTANT:
The uploaded people should feel physically moved into the scene, not recreated by AI.

Almost like:
“cutting the real people out of their original photo and naturally filming them inside the new environment.”

NOT:
“re-generating similar people from scratch.”

Scene adaptation must stay SUBTLE.

Do NOT let:
— lighting adaptation
— cinematic grading
— environment matching
— AI reconstruction

damage identity accuracy or pose accuracy.

NATURAL INTEGRATION IS CRITICAL:

The uploaded people must look physically present in the scene as if they were originally photographed there in-camera.

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
— realistic warm indoor reflections
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

Match the imperfections of the original photo naturally.

Skin must react naturally to scene lighting:
— warm restaurant lighting
— ambient indoor shadows
— environmental reflections
— realistic shadow softness
— realistic highlight rolloff

Clothing must integrate naturally into the lighting and environment:
— realistic fabric shadows
— realistic folds
— realistic texture softness
— realistic contact shadows

Hands and faces must have identical lighting behavior and texture quality.

The final image must feel like a real untouched cinematic movie frame, not an edited composite.

LIGHTING:
Match the original warm indoor restaurant lighting, soft environmental shadows, realistic skin shading, atmospheric depth, depth of field, cinematic color grading, and film grain.

Faces, bodies, hands, arms, necks, clothes, and hair must inherit identical scene lighting naturally.

Blend the uploaded people seamlessly into the environment so they appear originally photographed in this exact shot without any identity mixing from the original people.`;

const STRANGER_1 = `Use the reference image ONLY as a cinematography and staging template.

DO NOT use the original actors as appearance references in ANY way.

The original people are ONLY placeholders for:
— pose
— framing
— interaction
— body placement
— camera angle
— lighting
— scene composition

Completely remove the original identities from the final result.

ABSOLUTELY NO blending between uploaded people and original actors.

Do NOT inherit from the original actors:
— face shape
— eyes
— jawline
— nose
— lips
— skin texture
— hairstyle
— body type
— silhouette
— facial expressions
— age appearance

CRITICAL:
Do NOT perform face-swapping onto the original actors.

Fully replace the original people with the uploaded people as entirely different real humans naturally existing in the scene.

The uploaded people must remain IDENTICAL to their source photos.

Preserve EXACTLY:
— facial structure
— bone structure
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
— skin texture
— skin undertone
— hairstyle
— hairline
— body proportions
— shoulder width
— silhouette
— physique

Do NOT:
— beautify faces
— stylize anatomy
— smooth skin unnaturally
— sharpen jawlines
— enlarge eyes
— slim the body
— make them prettier
— change ethnicity
— change age appearance
— make them cinematic/glamorous

The uploaded people must look like authentic photographed humans physically present in the room.

They must NOT look:
— pasted
— composited
— face-swapped
— blended with original actors
— AI-generated
— plastic
— uncanny
— over-retouched

IMPORTANT SCENE STRUCTURE:

Maintain the exact composition and interaction:
— taller person remains in front on the left
— second person remains slightly behind on the right
— right person holds onto the left person's arm
— preserve exact body closeness
— preserve exact emotional tension
— preserve exact head positioning and eye-lines

Do NOT separate the characters.
Do NOT rotate faces toward camera differently.
Do NOT alter pose dynamics.

Keep:
— exact camera angle
— exact framing
— exact crop
— exact perspective
— exact lens feel
— exact hand placement
— exact body spacing
— exact scene geometry

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
— ambient warm light response

Identity and anatomy must remain untouched.

SKIN CONSISTENCY:
Hands, neck, arms, ears, and visible body skin must perfectly match facial skin tone and undertone.

No mismatched skin color.
No separate face/body lighting.
No artificial skin smoothing.

LIGHTING:
Match the original warm indoor cinematic lighting, soft shadows, environmental bounce light, realistic skin shading, atmospheric darkness, depth of field, and film grain.

Faces, bodies, clothes, and hair must inherit identical scene lighting naturally.

Blend the uploaded people seamlessly into the environment so they appear originally photographed in this exact shot without any identity mixing from the original actors.`;

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
  "terabithia-3": { provider: "openai", model: "gpt-image-2", locked: false },
  // ── Stranger Things ──
  "stranger-things-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: STRANGER_1 },
  "stranger-things-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: STRANGER_2 },
  "stranger-things-3": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: STRANGER_3 },
  // ── The End of the F***ing World ──
  "end-of-the-fucking-world-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: WORLD_1 },
  "end-of-the-fucking-world-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: WORLD_2 },
  "end-of-the-fucking-world-3": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: WORLD_3 },
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

const images = [
  referenceDataUrl,
  ...personDataUrls,
];

if (images.length !== totalImages) {
  throw new Error(
    `Image count mismatch: expected ${totalImages}, got ${images.length}`
  );
}

// Per-image size guard
for (let i = 0; i < images.length; i++) {

  const rawBytes =
    base64ByteSize(images[i]);

  if (rawBytes > IMAGE_SIZE_LIMIT_BYTES) {

    throw new Error(
      `Image ${i} is ${(rawBytes / 1024 / 1024).toFixed(2)}MB — exceeds the 6MB per-image limit. Please use a smaller or more compressed photo.`
    );
  }
}

const imageSummary = images.map((img, i) => ({
  index: i,

  mime: img.startsWith("data:")
    ? img.substring(5, img.indexOf(";"))
    : "unknown",

  bytes: base64ByteSize(img),
}));

// ── Debug logging ──
console.log("[PROVIDER]", config.provider);
console.log("[MODEL]", config.model);
console.log("[REFERENCE_ID]", referenceId);
console.log("[INPUT_IMAGES]", images.length);

console.log(
  "[PROMPT_SOURCE]",
  config.locked ? "locked" : "universal"
);

console.log(
  "[PROMPT_LENGTH]",
  finalPrompt.length
);

console.log(
  "[IMAGE_SUMMARY]",
  JSON.stringify(imageSummary)
);

console.log(
  "[TOTAL_MB]",
  (
    imageSummary.reduce((s, x) => s + x.bytes, 0) /
    1024 /
    1024
  ).toFixed(2)
);

// ── Provider routing ──
if (config.provider === "replicate") {

  if (!replicateApiKey) {
    throw new Error(
      "REPLICATE_API_KEY not configured"
    );
  }

  console.log(
    "[REQUEST_BODY_SHAPE]",
    JSON.stringify({
      version: config.model,

      input: {
        image_input:
          `[${images.length} base64 data URLs]`,

        prompt:
          `[${finalPrompt.length} chars]`,
      },
    })
  );

  const createRes = await fetch(
    "https://api.replicate.com/v1/predictions",
    {
      method: "POST",

      headers: {
        "Authorization":
          `Bearer ${replicateApiKey}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        version: config.model,

        input: {
          prompt: finalPrompt,
          image_input: images,
        },
      }),
    }
  );

  const createText =
    await createRes.text();

  console.log(
    "[CREATE] status:",
    createRes.status,
    "body:",
    createText.substring(0, 500)
  );

  if (!createRes.ok) {

    throw new Error(
      `Replicate prediction creation failed (${createRes.status}): ${createText.substring(0, 400)}`
    );
  }

  let prediction:
    Record<string, unknown>;

  try {
    prediction =
      JSON.parse(createText);

  } catch {

    throw new Error(
      `Replicate create response non-JSON: ${createText.substring(0, 300)}`
    );
  }

  const predictionId =
    prediction.id as string | undefined;

  if (!predictionId) {

    throw new Error(
      `Replicate prediction has no ID: ${JSON.stringify(prediction).substring(0, 300)}`
    );
  }

  console.log(
    "[CREATE] prediction started id=" +
      predictionId +
      " status=" +
      prediction.status
  );

  return new Response(
    JSON.stringify({
      id: predictionId,
      status: prediction.status,
    }),

    {
      status: 201,

      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
}

if (config.provider === "openai") {

  const openaiApiKey =
    Deno.env.get("OPENAI_API_KEY");

  if (!openaiApiKey) {
    throw new Error(
      "OPENAI_API_KEY not configured"
    );
  }

  // Validate formats
  validateOpenAIImages(images);

  console.log(
    "[OPENAI] building multipart request, images:",
    images.length
  );

  const openaiForm = new FormData();

  openaiForm.append(
    "model",
    config.model
  );

  openaiForm.append(
    "prompt",
    finalPrompt
  );

  openaiForm.append("n", "1");

  openaiForm.append(
    "size",
    "1024x1024"
  );

  openaiForm.append(
    "quality",
    "medium"
  );

  openaiForm.append(
    "output_format",
    "jpeg"
  );

  openaiForm.append(
    "output_compression",
    "85"
  );

  openaiForm.append(
  "response_format",
  "b64_json"
  );

  // Attach images
  for (let i = 0; i < images.length; i++) {

    const dataUrl = images[i];

    const commaIdx =
      dataUrl.indexOf(",");

    const meta =
      dataUrl.substring(
        5,
        dataUrl.indexOf(";")
      );

    const b64 =
      dataUrl.substring(commaIdx + 1);

    const binaryStr = atob(b64);

    const bytes =
      new Uint8Array(binaryStr.length);

    for (
      let j = 0;
      j < binaryStr.length;
      j++
    ) {
      bytes[j] =
        binaryStr.charCodeAt(j);
    }

    const ext =
      meta.split("/")[1] ?? "jpg";

    openaiForm.append(
      "image[]",

      new Blob(
        [bytes],
        { type: meta }
      ),

      `image_${i}.${ext}`
    );
  }

  const openaiRes = await fetch(
    "https://api.openai.com/v1/images/edits",
    {
      method: "POST",

      headers: {
        "Authorization":
          `Bearer ${openaiApiKey}`,
      },

      body: openaiForm,
    }
  );


  // JSON fallback
  const openaiText =
    await openaiRes.text();

  console.log(
    "[OPENAI] status:",
    openaiRes.status,
    "body:",
    openaiText.substring(0, 800)
  );

  if (!openaiRes.ok) {

    let parsedError: unknown;

    try {
      parsedError =
        JSON.parse(openaiText);

    } catch {
      parsedError = null;
    }

    const message =
      (parsedError as Record<string, unknown>)?.error
        ? JSON.stringify(
            (parsedError as Record<string, unknown>).error
          )
        : openaiText.substring(0, 400);

    throw new Error(
      `OpenAI image generation failed (${openaiRes.status}): ${message}`
    );
  }

  let openaiData:
    Record<string, unknown>;

  try {
    openaiData =
      JSON.parse(openaiText);

  } catch {

    throw new Error(
      `OpenAI response non-JSON: ${openaiText.substring(0, 300)}`
    );
  }

  const dataArr =
    openaiData.data as
      Array<Record<string, unknown>>
      | undefined;

  const first = dataArr?.[0];

  const outputUrl =
    first?.url as string | undefined;

  const b64 =
    first?.b64_json as string | undefined;

  // URL response
  if (outputUrl) {

    return new Response(
      JSON.stringify({
        status: "succeeded",
        output: outputUrl,
      }),

      {
        status: 200,

        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }

  // BASE64 response
else if (b64) {

  const binaryStr =
    atob(b64);

  const bytes =
    new Uint8Array(binaryStr.length);

  for (
    let i = 0;
    i < binaryStr.length;
    i++
  ) {
    bytes[i] =
      binaryStr.charCodeAt(i);
  }

  const fileName =
    `generated/${crypto.randomUUID()}.jpg`;

  const { error: uploadError } =
    await supabase.storage
      .from("generated-images")
      .upload(
        fileName,
        bytes,
        {
          contentType: "image/jpeg",
          upsert: false,
        }
      );

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from("generated-images")
    .getPublicUrl(fileName);

  return new Response(
    JSON.stringify({
      status: "succeeded",
      output:
        publicUrlData.publicUrl,
    }),

    {
      status: 200,

      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
}

  throw new Error(
    `OpenAI response missing output image: ${JSON.stringify(openaiData).substring(0, 300)}`
  );
}

throw new Error(
  `Unknown provider: ${(config as { provider: string }).provider}`
);