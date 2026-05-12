import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

const TITANIC_1 = `Use the first image only as the base scene.

Keep the scene, background, lighting, framing, perspective, pose, and composition unchanged.

Only replace the original people with the uploaded people.

The uploaded people must keep their real appearance exactly as in their photos.

Do not change:
- facial features
- face shape
- eyes
- nose
- lips
- jawline
- skin texture
- hairstyle
- hair color
- expression
- clothing
- body proportions

Do not beautify, stylize, smooth, enhance, or redesign the faces.

Do not change emotions or facial expression.

Do not make the faces cinematic, artistic, or symmetrical.

Do not modify the background or scene.

The result should look like the uploaded people were photographed in the original scene exactly as they are.

All people shown in uploaded identity photos are adults over 18 years old.`;

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

Erase all original people from the scene completely. Treat them as temporary placeholders only. Their positions become empty slots that must be fully rebuilt using the uploaded identity photos.

CHARACTER REPLACEMENT:
— woman reclining across the chair → woman from the uploaded female photo
— man sitting in the chair → man from the uploaded male photo

Gender must match exactly. Do NOT swap roles.

PLACEMENT:
Place each new person into the exact spatial position of the original:
— same location
— same scale
— same depth
— same perspective
— same body positioning relative to camera and environment

FULL HUMAN RECONSTRUCTION:
Completely replace the original people with entirely new reconstructed humans based only on the uploaded identity photos.

Rebuild:
— full body
— face
— head shape
— body proportions
— silhouette
— shoulders
— neck
— arms
— posture
— physical presence

The original people must not remain underneath the result in any way.

Do NOT:
— face-swap
— preserve original anatomy
— blend identities
— overlay new faces onto old bodies
— reuse original facial structure or body structure

The final people must be entirely new reconstructed subjects derived from the uploaded identity photos only.

IDENTITY:
Preserve from uploaded photos:
— facial structure
— eye shape
— nose
— lips
— jawline
— skin tone
— hair color and hairstyle
— realistic body proportions

Identity must remain clearly recognizable and consistent across the entire body, not only the face.

CLOTHING:
Adapt clothing naturally to the café environment.
Match the cinematic elegant-casual style of the original scene while fitting the reconstructed bodies naturally.

POSE & COMPOSITION:
Preserve:
— camera angle
— tilted framing
— pose structure
— body orientation
— spacing
— physical interaction
— framing and composition

Match pose placement only — NOT original anatomy or body geometry.

LIGHTING & INTEGRATION:
Fully integrate the reconstructed people into the scene:
— match warm indoor flash lighting
— realistic shadows
— reflections
— color grading
— skin shading
— depth of field
— lens softness
— film grain

Faces and bodies must inherit the exact scene lighting and environmental reflections.

The final image must look like a real photograph with completely replaced people, not a face swap, overlay, morph, pasted composite, or edited original.`;

const STRANGER_2 = `Use the reference image as a composition and interaction template.

Erase all original people from the scene completely. Treat them only as placeholders. Replace them entirely with the people from the uploaded identity photos.

CHARACTER REPLACEMENT:
— man sitting on the left side of the couch → man from the uploaded male identity photo
— woman sitting on the right side of the couch → woman from the uploaded female identity photo

Gender and roles must match exactly. Do NOT swap positions.

IMPORTANT:
The people must be fully transferred into the scene as complete reconstructed humans — not just faces or heads.

Do NOT:
— face-swap
— paste faces onto original bodies
— preserve original anatomy underneath
— blend identities with original characters
— morph faces with the originals

The original people must be completely removed and replaced.

FULL HUMAN RECONSTRUCTION:
Rebuild each person entirely from their uploaded identity image:
— full body
— head shape
— face
— neck
— shoulders
— arms
— hands
— posture
— body proportions
— silhouette
— natural anatomy

Identity must come only from the uploaded photos.

INTERACTION & EYE CONTACT:
Preserve the natural interaction between the characters:
— both people are looking directly at each other
— maintain realistic eye-lines
— preserve the handshake interaction
— preserve natural body language and emotional connection

Both reconstructed people must feel naturally present together in the same real environment.

PLACEMENT:
Place each reconstructed person into the exact spatial position of the original:
— same sitting position
— same scale
— same perspective
— same camera distance
— same depth
— same hand placement
— same body orientation

POSE & COMPOSITION:
Preserve:
— camera angle
— couch positioning
— framing
— spacing between characters
— handshake pose
— eye contact direction
— cinematic composition

Match pose placement only — NOT original anatomy.

IDENTITY:
Preserve from uploaded identity photos:
— facial structure
— eye shape
— nose
— lips
— jawline
— skin tone
— hairstyle and hair color
— realistic body proportions

Identity must remain clearly recognizable across the entire reconstructed body.

CLOTHING:
Adapt clothing naturally to the cozy indoor environment.
Outfits must fit naturally on the reconstructed bodies and match the casual cinematic aesthetic of the scene.

SCENE PRESERVATION:
Keep unchanged:
— couch
— curtains
— interior environment
— lighting atmosphere
— props and background
— framing and composition

LIGHTING & INTEGRATION:
Fully integrate the reconstructed people into the environment:
— match soft indoor lighting
— realistic shadows
— skin shading
— environmental reflections
— color grading
— depth of field
— subtle film grain

Faces, hands, clothing, and bodies must inherit the exact lighting and color atmosphere of the scene.

The final image must look like a real photograph with fully replaced people naturally interacting together — not a face swap, pasted composite, overlay, or edited original image.`;

const STRANGER_3 = `Use the reference image as a composition and scene template.

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
  "euphoria-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: EUPHORIA_1 },
  "euphoria-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: EUPHORIA_2 },
  "euphoria-3": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: EUPHORIA_3 },
  // ── Titanic ──
  "titanic-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: TITANIC_1 },
  "titanic-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: TITANIC_2 },
  "titanic-3": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: TITANIC_3 },
  // ── Terabithia ──
  "terabithia-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: TERABITHIA_1 },
  "terabithia-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: false },
  "terabithia-3": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: false },
  // ── Stranger Things ──
  "stranger-things-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: false },
  "stranger-things-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: STRANGER_2 },
  "stranger-things-3": { provider: "openai", model: "gpt-image-1", locked: true, prompt: STRANGER_3 },
  // ── The End of the F***ing World ──
  "end-of-the-fucking-world-1": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: true, prompt: WORLD_1 },
  "end-of-the-fucking-world-2": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: false },
  "end-of-the-fucking-world-3": { provider: "replicate", model: REPLICATE_DEFAULT_MODEL, locked: false },
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
      console.log("[PROVIDER]", config.provider);
      console.log("[MODEL]", config.model);
      console.log("[REFERENCE_ID]", referenceId);
      console.log("[INPUT_IMAGES]", images.length);
      console.log("[PROMPT_SOURCE]", config.locked ? "locked" : "universal");
      console.log("[PROMPT_LENGTH]", finalPrompt.length);
      console.log("[IMAGE_SUMMARY]", JSON.stringify(imageSummary));
      console.log("[TOTAL_MB]", (imageSummary.reduce((s, x) => s + x.bytes, 0) / 1024 / 1024).toFixed(2));

      // ── Provider routing ──
      if (config.provider === "replicate") {
        if (!replicateApiKey) throw new Error("REPLICATE_API_KEY not configured");

        console.log("[REQUEST_BODY_SHAPE]", JSON.stringify({
          version: config.model,
          input: {
            image_input: `[${images.length} base64 data URLs]`,
            prompt: `[${finalPrompt.length} chars]`,
          },
        }));

        const createRes = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${replicateApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: config.model,
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
      }

      if (config.provider === "openai") {
        const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiApiKey) throw new Error("OPENAI_API_KEY not configured");

        console.log("[OPENAI] building multipart request, images:", images.length);

        const openaiForm = new FormData();
        openaiForm.append("model", config.model);
        openaiForm.append("prompt", finalPrompt);
        openaiForm.append("n", "1");


        // Attach each image as a separate file entry
        for (let i = 0; i < images.length; i++) {
          const dataUrl = images[i];
          const commaIdx = dataUrl.indexOf(",");
          const meta = dataUrl.substring(5, dataUrl.indexOf(";"));
          const b64 = dataUrl.substring(commaIdx + 1);
          const binaryStr = atob(b64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let j = 0; j < binaryStr.length; j++) bytes[j] = binaryStr.charCodeAt(j);
          const ext = meta.split("/")[1] ?? "jpg";
          openaiForm.append("image[]", new Blob([bytes], { type: meta }), `image_${i}.${ext}`);
        }

        const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: { "Authorization": `Bearer ${openaiApiKey}` },
          body: openaiForm,
        });

        const openaiText = await openaiRes.text();
        console.log("[OPENAI] status:", openaiRes.status, "body:", openaiText.substring(0, 500));

        if (!openaiRes.ok) {
          throw new Error(`OpenAI image generation failed (${openaiRes.status}): ${openaiText.substring(0, 400)}`);
        }

        let openaiData: Record<string, unknown>;
        try {
          openaiData = JSON.parse(openaiText);
        } catch {
          throw new Error(`OpenAI response non-JSON: ${openaiText.substring(0, 300)}`);
        }

       const dataArr = openaiData.data as Array<Record<string, unknown>> | undefined;
const first = dataArr?.[0];

const outputUrl = first?.url as string | undefined;
const b64 = first?.b64_json as string | undefined;

let finalOutput: string | undefined;

if (outputUrl) {
  finalOutput = outputUrl;
} else if (b64) {
  finalOutput = `data:image/png;base64,${b64}`;
}

if (!finalOutput) {
  throw new Error(`OpenAI response missing output image: ${JSON.stringify(openaiData).substring(0, 300)}`);
}

console.log("[OPENAI] generation complete");

// Return in the same shape the frontend expects
return new Response(JSON.stringify({
  status: "succeeded",
  output: finalOutput,
}), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unknown provider: ${(config as { provider: string }).provider}`);

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
