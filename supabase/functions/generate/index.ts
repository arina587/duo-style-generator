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

Recreate them as stylized 3D human characters in Pixar/Disney 3D CGI style — match the exact visual style of the reference image. NOT as pasted faces, but as fully reconstructed human characters integrated into the scene.

---

PRIORITY ORDER (STRICT):
1) Identity from uploaded photos
2) Original pose and composition
3) Lighting and style

---

IDENTITY (CRITICAL):

Preserve identity with high accuracy:

— facial structure and proportions
— eye shape, spacing, eyelids, eyebrows
— nose shape and bridge
— lips, mouth width, jawline, chin
— recognizable skin tone (adapted to scene lighting)
— hairstyle, hair color, and length

Do NOT:
— stylize away identity
— average or genericize faces
— mix identities

---

BODY & PROPORTIONS:

Convert animal characters into realistic human anatomy:

— man follows the fox pose (including raised arm with phone)
— woman replaces the rabbit with natural human proportions
— do NOT compress or scale the woman unnaturally

Maintain spatial relationship while keeping realistic human anatomy.

---

POSE & COMPOSITION (STRICT):

Man (left):
— arm raised holding a phone (selfie position)
— slight head tilt toward the woman
— relaxed, confident posture

Woman (right):
— very close to the man
— slight lean toward him
— upright natural stance

Preserve:
— selfie composition
— camera angle (slightly above, angled down)
— framing and crop

Do NOT reframe or change perspective.

---

EXPRESSION:

— man: confident, playful smirk
— woman: cheerful, slightly mischievous smile

Match emotional tone from the reference.

---

LIGHTING & COLOR:

Match the original scene lighting:

— colorful nightclub lighting (magenta, purple, blue tones)
— mixed ambient light sources
— soft but vivid highlights
— visible color reflections on skin

Preserve:
— light direction
— color spill
— contrast and atmosphere

Faces must fully inherit scene lighting (no neutral or flat lighting).

---

HANDS:

All hands must be human:

— exactly five fingers per hand
— correct anatomy and proportions
— natural finger placement

Man:
— holding a smartphone in selfie position
— correct grip and perspective

No deformation, no extra or missing fingers.

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

Rebuild characters inside the original positions with correct perspective and depth.

Ensure seamless integration with the environment.

No face cutouts. No mismatched lighting.

---

FINAL:

A Pixar/Disney 3D CGI human version of the same cinematic moment, with accurate identity, correct lighting, and stable composition.`;

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

const EUPHORIA_1 = `Use the reference image as a strict composition, crop, pose, lighting, and depth-of-field template.

Do NOT recreate or reinterpret the scene.

Do NOT change:
— camera angle  
— framing  
— crop  
— background people  
— environment  
— lighting setup  

---

SCENE STRUCTURE (CRITICAL):

This is a seated audience scene.

There are two MAIN foreground characters:
— woman on the LEFT  
— man on the RIGHT  

Background contains multiple people and must remain unchanged.

---

CHARACTER MAPPING (ABSOLUTE):

— the woman on the LEFT → replace with the woman from the uploaded female photo  
— the man on the RIGHT → replace with the man from the uploaded male photo  

Do NOT swap.
Do NOT mirror.
Do NOT move them.

---

FOREGROUND-ONLY REPLACEMENT:

Replace ONLY the two main foreground people.

Do NOT modify:
— background people  
— their faces  
— their positions  

Background must remain identical.

---

VISIBLE-PARTS RECONSTRUCTION:

Rebuild only what is visible:

— face  
— head  
— hair  
— upper body  
— hands  

Do NOT invent new body positions.
Do NOT change posture.

---

IDENTITY (CRITICAL):

Faces must clearly match uploaded identity images:

— facial structure  
— eyes  
— nose  
— lips  
— jawline  
— proportions  
— skin tone  
— hair  

Do NOT:
— stylize  
— beautify  
— average  
— replace with generic faces  

---

LOW LIGHT IDENTITY PRESERVATION (CRITICAL):

This scene has dim, warm lighting.

Even in low light:

— identity must remain clearly recognizable  
— facial features must NOT disappear into shadow  
— do NOT over-darken faces  
— do NOT flatten details  

If needed:
— slightly lift face visibility ONLY to preserve identity  

---

POSE & BODY POSITION (STRICT):

Preserve exactly:

Woman (LEFT):
— sitting upright  
— shoulders relaxed  
— head facing forward  
— neutral / calm expression  

Man (RIGHT):
— sitting upright  
— hands together in front  
— head facing forward  
— calm, slightly serious expression  

Do NOT:
— change posture  
— change head direction  
— change spacing  

---

HEAD SCALE & PROPORTION:

— both heads must have natural proportions  
— no scaling distortion  
— no mismatch between face and body  

---

LIGHTING & INTEGRATION:

Match original lighting exactly:

— warm, low-light environment  
— soft shadows  
— subtle highlights  
— cinematic color grading  

Faces must:
— inherit scene lighting  
— match contrast level  
— match noise / grain  

Do NOT:
— apply studio lighting  
— make faces overly bright or clean  
— create cutout look  

---

TEXTURE & REALISM:

Preserve cinematic realism:

— slight noise / grain  
— natural skin texture  
— no over-smoothing  
— no artificial sharpness  

---

ANTI-SCENE-BREAK RULE:

Do NOT:
— modify background people  
— change scene layout  
— move characters  
— alter composition  
— brighten the whole image  
— reduce cinematic darkness  

Only replace the identities of the two foreground people.

---

FINAL:

A realistic cinematic image where only the two foreground characters are replaced with new identities, while the background, lighting, composition, and atmosphere remain unchanged.`;

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

const EUPHORIA_3 = `
Use the reference image as a composition and scene template.

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

const TITANIC_1 = `Use the reference image as a composition and scene template.

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

IDENTITY PRESERVATION UNDER ANGLE & OCCLUSION (CRITICAL):

Identity must be preserved EVEN IF:

— the face is partially turned (profile or semi-profile)  
— the face is partially occluded  
— the face is softly lit or low contrast  
— the eyes are closed  

The model MUST reconstruct the full identity from the uploaded photos, not rely on visible details only.

Do NOT simplify or average facial features due to lighting or angle.

---

FACE RECONSTRUCTION (IMPORTANT):

Do NOT rely only on visible pixels from the reference.

Instead:
— reconstruct full facial structure from identity images  
— then adapt it to the pose and angle of the scene  

Even in profile or soft lighting, identity must remain recognizable.

---

IDENTITY OVERRIDE RULE:

If there is any conflict between:
— scene lighting  
— pose accuracy  
— composition  

AND identity accuracy,

ALWAYS prioritize identity.

Identity must NOT degrade under any condition.

---

EYES & EXPRESSION HANDLING:

If the reference has closed or relaxed eyes:

— preserve the identity of the eye shape anyway  
— do NOT replace with generic closed-eye faces  
— eyelids must match the real person’s anatomy  

Closed eyes do NOT justify identity loss.

---

CLOTHING ADAPTATION (IMPORTANT):

Clothing should be adapted to fit the scene naturally:

— match the overall style of the scene (historical / cinematic)  
— do NOT copy the exact original outfit  
— keep silhouettes and general shapes similar  
— ensure clothing fits lighting and environment  

The result must feel natural and not out of place.

---

POSE & COMPOSITION (STRICT):

Preserve:

— camera angle (slightly from the side)  
— full-body positioning  
— distance between characters  
— framing  

Woman (CRITICAL):

— standing at the front  
— arms fully extended horizontally  
— body leaning slightly forward  
— head tilted slightly upward  
— eyes closed  

Man (CRITICAL):

— standing directly behind the woman  
— positioned slightly to her left  
— leaning toward her  
— face near her ear/neck  
— one arm around her waist  

Do NOT change pose, orientation, or spacing.

Do NOT swap positions.

---

LIGHTING & INTEGRATION (CRITICAL):

Scene lighting is:

— warm sunset / golden hour  
— strong orange glow  
— soft directional light from horizon  
— cinematic low contrast with warm highlights  

Apply to new characters:

— correct light direction  
— warm highlights on skin  
— soft shadow falloff  
— color grading matching scene  
— depth of field  
— film grain / cinematic texture  

Faces must inherit scene lighting completely.

The result must NOT look pasted or artificially inserted.

---

MALE CHARACTER (VERY IMPORTANT):

The man is partially turned and slightly in shadow.

Even though:

— his face is not fully frontal  
— lighting is softer  

You MUST still preserve his identity strongly.

Do NOT generate a generic face.  
Do NOT weaken identity due to angle.  

His face must clearly match the uploaded male photo.

---

FINAL:

A fully reconstructed cinematic scene where:

— original people are completely removed  
— new people are fully rebuilt from uploaded identity images  
— both characters match the exact pose and positions  
— identity is preserved even under angle and lighting  
— lighting and integration are seamless  

The image must look like a real photograph, not a composite.`;

const TITANIC_2 = `Use the reference image as a strict composition, crop, pose, lighting, and depth-of-field template.

Do NOT recreate the scene freely.
Do NOT change framing, camera angle, crop, background, objects, surface, water, lighting, or depth of field.

Completely remove the original identities of both people.
Treat the original people only as empty pose/location placeholders.

---

CHARACTER MAPPING (ABSOLUTE):

— the person on the LEFT → replace with the man from the uploaded male photo
— the person on the RIGHT → replace with the woman from the uploaded female photo

Do NOT swap roles.
Do NOT mirror the image.
The man must stay on the LEFT.
The woman must stay on the RIGHT.

---

VISIBLE-PARTS REPLACEMENT:

This is a close-up scene. Only visible parts of the people should be reconstructed.

Replace only the visible human areas in the same positions:
— visible face
— visible head
— visible hair
— visible neck / shoulders / hands where shown

Do NOT invent full bodies outside the crop.
Do NOT zoom out.
Do NOT change the scene to show more body.

---

IDENTITY REPLACEMENT (CRITICAL):

The original faces and identity must be fully discarded.

Do NOT use:
— original facial features
— original head shape
— original nose / lips / jawline
— original skin tone
— original hair

The uploaded identity photos are the only identity source.

---

MAN ON LEFT (VERY IMPORTANT):

The man is on the LEFT side of the frame.

He is:
— in near-profile / side view
— low in the frame
— close to the wet surface
— softly focused
— partially obscured by angle and shallow depth of field

Even though his face is turned sideways, his identity must still clearly come from the uploaded male photo.

Reconstruct his visible profile using the uploaded male identity:
— nose bridge and nose shape
— jawline
— chin
— lips
— visible eye area
— hairline and hair texture

Do NOT default to the original male face.
Do NOT make him generic.
Do NOT weaken identity because the face is in profile.

Profile view does NOT reduce identity accuracy requirements.

---

WOMAN ON RIGHT:

The woman is on the RIGHT side of the frame.

She is:
— leaning forward over the surface
— head tilted sideways/down toward the man
— face more visible than the man
— sharp and emotionally focused
— looking toward the man

Preserve her intense gaze and head tilt.

---

POSE & GEOMETRY LOCK:

Preserve exactly:
— close horizontal composition
— low camera angle
— faces very close across the surface
— woman leaning down toward the man
— man facing her from the left
— distance between faces
— head heights
— surface contact points
— crop and framing

Do NOT reposition heads.
Do NOT straighten the man’s face.
Do NOT make the man frontal.
Do NOT separate the characters.

---

FOCUS & DEPTH OF FIELD:

Preserve the original focus structure:
— woman on the right is sharper
— man on the left is softer / slightly blurred
— background remains blurred
— foreground surface remains cinematic and wet

Important:
The man may be slightly soft, but his identity must still be recognizable.

---

LIGHTING & INTEGRATION:

Match the original cinematic lighting exactly:
— wet reflective highlights
— warm light on skin
— high contrast between highlights and shadows
— shallow depth of field
— film-like grain and softness

Faces, hair, skin, and hands must inherit the same lighting and wet-scene atmosphere.

No clean studio lighting.
No pasted faces.
No cutout look.
No mismatched sharpness.

---

COLD ENVIRONMENT RESPONSE (SUBTLE):

The scene is cold and wet. The characters are slightly freezing.

Reflect this subtly:

— slight skin tension  
— faint coolness in skin tones where appropriate  
— minimal natural stiffness in posture  
— subtle tightening of lips or jaw  

Do NOT exaggerate:
— no dramatic shaking  
— no extreme facial distortion  
— no change to pose or composition  

This must remain very subtle and cinematic.

---

ANTI-SCENE-BREAK RULE:

This reference is a close-up cinematic crop.

Do NOT:
— generate full standing bodies
— change clothing significantly
— change background
— change the surface
— change camera distance
— change the emotional composition
— over-clean or modernize the scene

---

FINAL:

A realistic cinematic close-up where the original identities are completely removed, the man on the left and woman on the right are replaced by the uploaded identities, the original crop and pose are preserved exactly, and the man’s profile identity is clearly recognizable despite shallow focus and side angle.`;

const TITANIC_3 = `Use the reference image as a composition and scene template.

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

IDENTITY PRESERVATION UNDER ANGLE & OCCLUSION (CRITICAL):

Identity must be preserved EVEN IF:

— the face is partially turned (profile or semi-profile)  
— the face is partially occluded  
— the face is softly lit or low contrast  
— the eyes are closed  

The model MUST reconstruct the full identity from the uploaded photos, not rely on visible details only.

Do NOT simplify or average facial features due to lighting or angle.

---

FACE RECONSTRUCTION (IMPORTANT):

Do NOT rely only on visible pixels from the reference.

Instead:
— reconstruct full facial structure from identity images  
— then adapt it to the pose and angle of the scene  

Even in profile or soft lighting, identity must remain recognizable.

---

IDENTITY OVERRIDE RULE:

If there is any conflict between:
— scene lighting  
— pose accuracy  
— composition  

AND identity accuracy,

ALWAYS prioritize identity.

Identity must NOT degrade under any condition.

---

EYES & EXPRESSION HANDLING:

If the reference has closed or relaxed eyes:

— preserve the identity of the eye shape anyway  
— do NOT replace with generic closed-eye faces  
— eyelids must match the real person’s anatomy  

Closed eyes do NOT justify identity loss.

---

CLOTHING ADAPTATION (IMPORTANT):

Clothing should be adapted to fit the scene naturally:

— match the overall historical/cinematic style  
— do NOT copy the exact original outfit  
— keep silhouette and visual weight similar  
— ensure clothing fits lighting and environment  

The result must feel natural and not out of place.

---

POSE & COMPOSITION (STRICT):

Preserve:

— camera angle (medium close-up, slightly from the side)  
— upper body positioning  
— distance between characters  
— framing  

Woman:

— positioned on the RIGHT side  
— body angled slightly away from the man  
— head turned back toward him  
— chin slightly raised  
— eyes closed  

Man:

— positioned on the LEFT side  
— slightly behind the woman  
— leaning toward her  
— head angled toward her face  
— face very close to hers  

Do NOT change pose, spacing, or orientation.

---

LEFT-RIGHT ORIENTATION LOCK (CRITICAL):

The man MUST remain on the LEFT side of the frame.  
The woman MUST remain on the RIGHT side of the frame.  

This orientation is absolute.

Do NOT:
— swap characters  
— mirror the image  
— flip left/right positions  

If orientation is incorrect, the result is invalid.

---

HEAD ORIENTATION & CONTACT (CRITICAL):

Both characters are extremely close, upper bodies touching.

Head positioning is STRICT:

Woman:
— head turned toward the man  
— chin slightly raised  
— face angled toward his face  
— eyes closed  

Man:
— head turned toward the woman  
— face angled toward her  
— positioned slightly behind  
— very close to her face  

CRITICAL:

— both faces are oriented toward each other  
— noses nearly touching  
— lips almost touching  
— faces aligned on the same interaction line  

Do NOT:

— turn heads away  
— make characters look forward  
— break face-to-face alignment  

---

FACE INTERACTION LOCK:

The scene is defined by face-to-face interaction.

If head orientation is incorrect, the result is invalid.

Faces must remain directed toward each other at all times.

---

HEAD SCALE & PROPORTION CONSISTENCY (CRITICAL):

The heads of both characters must have natural, matching proportions relative to each other.

— head sizes must be consistent with real human proportions  
— no oversized or undersized heads  
— no distortion of skull proportions  
— no mismatch between face size and body  

The relative scale between the man and the woman must match the reference scene.

Do NOT:
— enlarge one face unnaturally  
— shrink one head  
— distort proportions due to identity transfer  

Identity must be preserved WITHOUT breaking anatomical scale.

---

LIGHTING & INTEGRATION (CRITICAL):

Scene lighting is:

— warm golden cinematic light  
— strong orange / amber tones  
— soft directional light from the side  
— gentle shadow falloff  
— low contrast romantic lighting  

Apply to new characters:

— correct light direction  
— warm highlights on skin  
— soft shadows matching scene  
— color grading identical to reference  
— depth of field  
— subtle film grain  

Faces and bodies must fully inherit scene lighting.

The result must NOT look pasted or artificially inserted.

---

FINAL:

A fully reconstructed cinematic scene where:

— original people are completely removed  
— new people are fully rebuilt from uploaded identity images  
— pose, spacing, and interaction are preserved exactly  
— heads are turned toward each other correctly  
— left/right orientation is preserved  
— head proportions are natural and consistent  
— identity is preserved even under angle and lighting  
— lighting and integration are seamless  

The image must look like a real photograph, not a composite.`;

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
