export interface ReferenceItem {
  id: string;
  image: string;
  style: string;
  label: string;
  prompt?: string;
}

export const references: ReferenceItem[] = [
  // ── Zootopia ──
  {
    id: 'zootopia-1',
    style: 'zootopia',
    label: 'Zootopia',
    image: '/styles/zootopia/zootopia1.jpg',
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

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
Identical selfie composition with stylized human characters, strong identity match, no pose drift.`,
  },
  {
    id: 'zootopia-2',
    style: 'zootopia',
    label: 'Zootopia',
    image: '/styles/zootopia/zootopia2.jpg',
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

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
Same tight, compressed selfie moment, exact pose preserved, stylized human version.`,
  },
  {
    id: 'zootopia-3',
    style: 'zootopia',
    label: 'Zootopia',
    image: '/styles/zootopia/zootopia3.jpg',
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

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
— man on the left holds the phone with his arm extended upward
— selfie angle from slightly above
— woman stands on his right side in the same position as the reference
— both bodies positioned close, maintaining the same spacing and alignment
— woman is NOT being held, NOT lifted, NOT supported
— no arm wrapping around her — she stands independently next to him
— preserve original torso angles, head positions, and framing

Do NOT reinterpret or redesign the pose.
Do NOT introduce new interactions or contact not present in the reference.

CRITICAL PROP LOCK:
— phone MUST remain in the man's hand in the same position and angle
— carrot MUST remain in the woman's hand in the same position

CRITICAL EXPRESSION LOCK:
— preserve the exact expressions from the reference
— same eye direction toward the phone
— same intensity of emotion

CRITICAL STYLE (VERY IMPORTANT):
Full Pixar/Disney 3D look — soft shading, clean stylized skin, expressive eyes.
Use the EXACT rendering style from the reference image, do NOT redesign the scene.

CRITICAL SCENE LOCK (HIGHEST PRIORITY):
Keep background, lighting, crowd, blur, depth, and composition EXACTLY unchanged.
Treat the reference image as a locked base frame.

CRITICAL LIGHTING:
Characters must inherit the exact colored lighting (pink, purple, blue) consistently.

CRITICAL HANDS (VERY IMPORTANT):
All hands must be human — anatomically correct with realistic proportions.
Exactly five fingers on each hand.
Correct grip on phone and carrot, no deformation, no merged or missing fingers.

FINAL:
The output must look like the same original frame with identical composition, lighting, and style, with only the characters replaced by the uploaded man and woman.
No pose drift, no added contact, no background change, seamless integration, 4K.`,
  },

  // ── Euphoria ──
  { id: 'euphoria-1', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria1.jpg' },
  { id: 'euphoria-2', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria2.jpg' },
  { id: 'euphoria-3', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria3.jpg' },

  // ── Titanic ──
  { id: 'titanic-1', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic1.jpg' },
  {
    id: 'titanic-2',
    style: 'titanic',
    label: 'Titanic',
    image: '/styles/titanic/titanic2.jpg',
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the male character on the left with the uploaded man and the female character on the right with the uploaded woman. Recreate both naturally inside the scene, not as pasted faces.

STRICT IDENTITY PRESERVATION (ENHANCED):
Faces must remain clearly recognizable even under occlusion:
— preserve exact facial structure, proportions, bone geometry
— eye shape, eyelids, eyebrows (even if partially hidden)
— nose bridge and tip (visible parts must match precisely)
— lips and mouth structure (even when partially covered)
— jawline and cheek structure
— natural skin texture, pores, wet skin behavior
— hairstyle, hair color, and hair length must match uploaded photos

CRITICAL OCCLUSION HANDLING (VERY IMPORTANT):
Both faces are partially hidden and must be reconstructed correctly:
— man's face is partially hidden by angle and his arm → rebuild only the visible half accurately
— woman's face is partially hidden by her hand and contact → preserve correct facial compression and contact
— do NOT reveal hidden parts of the face
— do NOT "complete" the face artificially
— respect all occlusions exactly as in the reference

CRITICAL POSE LOCK (ABSOLUTE):
— both characters lying horizontally, facing each other
— their foreheads touching
— both leaning on their arms over a wooden floating surface
— woman holding the man's hand and kissing it
— man's head tilted slightly downward toward her
— extremely close distance between faces

Do NOT change pose, angle, or distance.

CRITICAL EXPRESSION LOCK:
— both have closed eyes
— calm, emotional, intimate expressions
— no smile exaggeration, no change in emotion intensity

CRITICAL CONTACT PHYSICS:
— maintain natural pressure where faces and hands touch
— slight skin compression where woman's lips touch the hand
— preserve realism in contact areas

CRITICAL WET DETAILS:
— both characters are wet from water
— hair is soaked, clumped, sticking to face and skin
— skin has wet specular highlights
— clothing is wet and darker in tone
— water droplets visible on skin, hair, and clothes

CRITICAL LIGHTING & COLOR:
— strong cold blue lighting dominates the scene
— faces MUST inherit this lighting fully
— preserve blue highlights and deep shadows
— maintain cinematic contrast and low-key lighting
— DO NOT neutralize or warm skin tones

CRITICAL SKIN INTEGRATION:
— skin tone must remain consistent across face, neck, arms
— but fully adapted to blue lighting
— no mismatch between face and body
— no "cut-out" or pasted look

CRITICAL SCENE LOCK:
— keep water surface, wooden debris, background blur EXACTLY the same
— preserve depth of field and cinematic composition
— no background repaint, no object removal

CRITICAL HANDS:
— hands must be human, anatomically correct
— exactly five fingers per hand
— correct finger proportions and natural positioning
— no deformation, no fused fingers

FINAL:
The result must look like the same cinematic moment with identical lighting, pose, occlusion, and composition, with the uploaded man and woman seamlessly integrated.
Ultra-realistic, wet cinematic look, cold blue lighting, high detail, 4K.`,
  },
  {
    id: 'titanic-3',
    style: 'titanic',
    label: 'Titanic',
    image: '/styles/titanic/titanic3.jpg',
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the male character behind with the uploaded man, and the female character in front with the uploaded woman. Recreate both people naturally inside the scene, not as pasted faces.

STRICTLY preserve identity — facial structure, proportions, age, skin tone, eyes, nose, lips, jawline, hairstyle, hair color and length must remain clearly recognizable.

CRITICAL POSE & EMOTION LOCK:
Keep the exact pose and emotional interaction from the reference —
the man stands closely behind the woman, holding her around the waist;
his head is slightly tilted toward her face;
the woman leans back into him, turning her head toward him;
their faces are very close, almost touching, intimate near-kiss moment.
Match head angles, body contact, hand placement, and distance between faces exactly.
Do NOT change pose, spacing, or expression intensity.
Do NOT intensify the romantic contact.

CRITICAL FACE ANGLES & VISIBILITY:
Faces are slightly turned and partially angled —
preserve exact head rotation and perspective;
do not force frontal view;
do not alter gaze direction.

CRITICAL LIGHTING & SKIN INTEGRATION (VERY IMPORTANT):
The scene has warm golden cinematic lighting (sunset / tungsten tone).
Faces must fully inherit this lighting:
— apply warm amber color cast naturally
— preserve soft highlights on cheeks, nose, and lips
— maintain smooth shadow transitions
— keep natural skin texture under warm light (no smoothing, no plastic effect)

Skin must remain realistic under warm lighting:
— no overly orange or artificial tint
— preserve natural variation in skin tones beneath the light
— face, neck, chest and hands must match perfectly

CRITICAL SHADOW & DEPTH MATCH:
Respect original shadow direction and softness:
— gentle shadows around jawline and neck
— subtle depth between faces and bodies
— no flattening of contrast

CRITICAL HAIR & DETAIL:
Preserve natural hair flow and placement —
loose strands, volume, and direction must remain unchanged;
no cleanup or restyling.

CRITICAL SCENE LOCK:
Keep background, ship structure, color grading, clothing, and composition EXACTLY as in the reference.
Do not redesign costumes (dress, coat, shawl, shirt).

CRITICAL INTEGRATION:
Rebuild faces inside the original head positions with correct perspective and lighting response.
Do NOT paste faces.
Do NOT alter skull orientation.

CRITICAL HANDS:
Hands around the waist must remain exactly in place and anatomically correct —
five fingers, proper placement, no deformation.

FINAL RESULT:
The image must look like the same warm cinematic moment with identical lighting, mood, and composition, but with the uploaded man and woman fully integrated into the scene.
No compositing artifacts, no lighting mismatch, no plastic look.
High detail, cinematic realism, 4K.`,
  },

  // ── Tangled ──
  {
    id: 'tangled-1',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled1.jpg',
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the male character with the uploaded man and the female character with the uploaded woman. Recreate both people naturally inside the scene as full characters, not as pasted faces.

STRICT IDENTITY PRESERVATION:
Keep both people clearly recognizable — facial structure, proportions, age, skin tone, eyes, nose, lips, jawline, hairstyle, hair color and length must match the uploaded photos.

CRITICAL STYLE MATCH (VERY IMPORTANT):
Render both people in the same high-end stylized 3D animated look as the reference image — soft cinematic CGI, smooth shading, expressive eyes, slightly stylized proportions, clean skin rendering, polished feature-film quality.
Do NOT mix photorealism with animation. The result must fully match the 3D animated style of the scene.

CRITICAL HAIR RULE (IMPORTANT):
The woman's hairstyle must follow the uploaded photo.
If her hair is short — keep it short in the final image.
Do NOT extend or stylize it into long fantasy hair.
Hair length, volume, and structure must remain true to her real appearance, only adapted to the animated style.

CRITICAL POSE & EMOTION LOCK:
Keep the exact pose and interaction —
the man gently holding the woman;
the woman looking up at him;
the man looking down at her;
soft romantic expressions, warm emotional connection.
Match head tilt, eye direction, distance between faces, and body positioning exactly.
Do NOT change hand placement or body proportions.

CRITICAL LIGHTING & COLOR:
Warm golden lantern lighting dominates the scene.
Faces must inherit this:
— soft warm highlights on skin
— gentle shadow transitions
— subtle glow from surrounding lanterns
— maintain cinematic depth and softness

Skin must remain natural within this lighting:
— no over-orange tint
— preserve subtle tone variation
— face, neck, and hands must match consistently

CRITICAL SCENE LOCK:
Keep background, lanterns, water reflections, castle silhouettes, clothing, and composition EXACTLY as in the reference.
Do not redesign environment or costumes.

CRITICAL INTEGRATION:
Rebuild faces within original head positions with correct perspective and lighting response.
Do NOT paste faces.
Do NOT alter skull orientation.

CRITICAL HANDS:
Hands must be clean and anatomically correct — five fingers, proper placement, no deformation.

FINAL RESULT:
The image must look like the same animated cinematic moment with identical lighting, mood, and composition, but with the uploaded man and woman fully integrated into the scene in a consistent 3D animated style.
No realism mismatch, no plastic look, no scene drift.
High detail, premium animated CGI, 4K.`,
  },
  { id: 'tangled-2', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled2.jpg' },
  {
    id: 'tangled-3',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled3.jpg',
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Recreate the male character on the left using the uploaded man and the female character on the right using the uploaded woman. They must be naturally rebuilt inside the scene, not as pasted faces.

STRICT IDENTITY PRESERVATION (ENHANCED):
Faces must remain highly recognizable:
- exact facial proportions and bone structure
- eye shape, spacing, eyelids, eyebrows
- nose shape and bridge
- lip shape and mouth width
- jawline and chin
- natural skin tone adapted to scene lighting
- hairstyle, hair color, and hair length must match the uploaded photos

CRITICAL POSE LOCK (ABSOLUTE):
- man stands on the left, leaning slightly forward
- his right arm is extended toward the woman, holding a small crown or tiara
- woman stands on the right, body slightly turned toward him
- her left hand is raised, palm up, positioned under the crown
- her other arm rests naturally near her body
- maintain exact spacing, posture, and gesture alignment
- preserve original camera angle and framing

Do NOT change pose, hand positions, or interaction.

CRITICAL PROP LOCK:
- crown or tiara must remain between them in the same position
- exact hand interaction must be preserved

CRITICAL EXPRESSION LOCK:
- man: gentle, playful, slightly confident expression
- woman: soft, shy, slightly amused expression
- maintain eye direction and emotional tone exactly

CRITICAL STYLE:
Full Pixar/Disney 3D look with soft shading and clean stylized skin.
Use the same rendering style as the reference image, do not redesign the scene.

CRITICAL SCENE LOCK:
Keep background, crowd, architecture, decorations, lighting, depth of field, and composition exactly unchanged.
Treat the reference image as a locked base frame.

CRITICAL LIGHTING:
Maintain warm daylight lighting with soft highlights and natural shadows.

CRITICAL HANDS:
All hands must be human, anatomically correct, with realistic proportions.
Each hand must have exactly five fingers.
Correct finger articulation, no deformation, no merged or missing fingers.

FINAL:
The result must look like the same original frame with identical composition and lighting, with only the characters replaced by the uploaded man and woman.
No pose drift, no background changes, seamless integration, high detail Pixar/Disney CGI.`,
  },

  // ── Spider-Man ──
  {
    id: 'spiderman-1',
    style: 'spiderman',
    label: 'Spider-Man',
    image: '/styles/spiderman/spiderman1.jpg',
    prompt: `Use the uploaded photos of the man and the woman as identity references. Do not change their real appearance, facial structure, hair color, hairstyle, hair length, skin texture, or proportions.

Create an ultra-realistic cinematic scene in a dark interior or night setting filled with many thin white web-like strands crossing the entire frame.

COMPOSITION:
Square cinematic frame, medium close-up. The man is centered with his back facing the camera. His upper back, shoulders, neck, and side profile are visible. The woman stands directly behind him, partly hidden by his body, with her head resting close to his right shoulder. She looks directly toward the camera with a serious, emotional, slightly vulnerable expression.

MAN:
The man wears a tight red-and-blue textured superhero-style suit with a large spider emblem on the back. His head is turned slightly to the right, showing a partial side profile.

WOMAN:
The woman is behind him, very close, hugging him from behind. Her face is visible over his shoulder. One arm is wrapped around him, and one hand rests gently on his shoulder.

CRITICAL IDENTITY:
Both characters must clearly match the uploaded faces, proportions, skin texture, and hair.

CRITICAL POSE:
- man facing away from camera
- woman directly behind him
- her hand on his shoulder
- exact body alignment preserved

CRITICAL FOREGROUND:
Thin web-like strands must remain in front of the camera, partially obscuring the scene.

CRITICAL LIGHTING:
Warm cinematic lighting with soft highlights and shadows.

CRITICAL CAMERA:
Medium close-up, shallow depth of field.

CRITICAL HANDS:
Human hands only, anatomically correct, five fingers.

FINAL:
Ultra-realistic cinematic frame, same composition, no drift, 4K.`,
  },
  {
    id: 'spiderman-2',
    style: 'spiderman',
    label: 'Spider-Man',
    image: '/styles/spiderman/spiderman2.jpg',
    prompt: `Use the uploaded photos of the man and the woman as identity references. Do not change their real appearance.

Create an ultra-realistic cinematic rooftop romantic scene at sunset.

COMPOSITION:
The couple stands very close. Their foreheads gently touch in the center.

CRITICAL POSE:
- both upright
- foreheads touching
- man holding woman's head
- woman leaning in

CRITICAL IDENTITY:
Faces must match uploaded photos.

CRITICAL LIGHTING:
Soft warm sunset lighting.

CRITICAL BACKGROUND:
Blurred city skyline with bokeh.

CRITICAL HANDS:
Human hands only, five fingers.

FINAL:
Same cinematic rooftop moment, ultra-realistic, 4K.`,
  },
  {
    id: 'spiderman-3',
    style: 'spiderman',
    label: 'Spider-Man',
    image: '/styles/spiderman/spiderman3.jpg',
    prompt: `Use the uploaded photos of the man and the woman as identity references.

Create an ultra-realistic cinematic rainy close-up at night.

COMPOSITION:
Man upside down at the top. Woman below, faces very close.

CRITICAL POSE:
- man fully upside down
- woman below
- hand on cheek
- tight framing

CRITICAL RAIN:
Wet skin, water droplets, reflective highlights.

CRITICAL LIGHTING:
Cinematic night lighting with contrast.

CRITICAL HANDS:
Human hands, five fingers.

FINAL:
Same rainy cinematic scene, ultra-realistic, 4K.`,
  },

  // ── Bridge to Terabithia ──
  {
    id: 'terabithia-1',
    style: 'terabithia',
    label: 'Terabithia',
    image: '/styles/terabithia/terabithia1.jpg',
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the female character on the left with the uploaded woman, and replace the character on the right with the uploaded man. Recreate both people naturally inside the scene, not as pasted faces.

STRICTLY preserve their identity — facial structure, proportions, age, skin tone, eye shape, nose, lips, jawline, hairstyle, hair color and length must remain clearly recognizable.

CRITICAL POSE & EXPRESSION LOCK:
Keep the exact pose and interaction from the reference —
the woman on the left is smiling softly, looking slightly downward toward the person in front of her;
the man on the right is turned slightly sideways, head tilted down, with a gentle calm expression.
Enhance expressions NATURALLY:
- The woman must have a clearly visible soft, warm, natural smile (not exaggerated, not artificial)
- The man must have a subtle, relaxed, slight smile (very natural, low intensity, not forced)
IMPORTANT:
- Do NOT exaggerate smiles
- Do NOT change mouth shape beyond natural variation
- Do NOT change emotion tone of the scene
- Do NOT break likeness or facial structure
- Keep expressions consistent with original mood and realism
Match head angles, proximity, and gaze direction exactly.

CRITICAL OCCLUSION & DETAILS:
Preserve all occlusions exactly —
the cap partially covering the woman's forehead must stay;
the man's face is partially turned — keep the same angle;
the fluffy white animal between them must remain in the same position and partially cover their hands.
Do not reveal hidden parts of the face or move objects.

CRITICAL SKIN & LIGHT MATCH:
Lighting is soft natural daylight with slight green outdoor color influence.
Adapt the skin tones of the new faces to match the scene lighting so that face, neck, and hands look consistent and natural.
No mismatch between face and body tone, no mask effect, no plastic skin.

CRITICAL SCENE LOCK:
Keep background, depth of field, blur, clothing, colors, and composition exactly the same as the reference.
Do not redesign outfits (cap, vest, shirt).

CRITICAL INTEGRATION:
Do not paste faces. Rebuild the faces naturally within the original head positions, matching perspective and skull orientation.

CRITICAL HANDS:
If visible, hands must be anatomically correct with five fingers and natural proportions.

Final result must look like the same real-life moment, same lighting and composition, but with the uploaded man and woman naturally present in place of the original characters. High detail, natural realism, clean integration, 4K.`,
  },
  { id: 'terabithia-2', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia2.jpg' },
  { id: 'terabithia-3', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia3.jpg' },

  // ── Cinderella ──
  { id: 'cinderella-1', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella1.jpg' },
  { id: 'cinderella-2', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella2.jpg' },
  { id: 'cinderella-3', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella3.jpg' },

  // ── Stranger Things ──
  { id: 'stranger-things-1', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things1.jpg' },
  {
    id: 'stranger-things-2',
    style: 'stranger-things',
    label: 'Stranger Things',
    image: '/styles/stranger-things/stranger-things2.jpg',
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the female character on the left with the uploaded woman, and the male character on the right with the uploaded man. Recreate both people naturally inside the scene, not as pasted faces.

STRICTLY preserve identity — facial structure, proportions, age, skin tone, eyes, nose, lips, jawline, hairstyle, hair color and length must remain clearly recognizable.

CRITICAL POSE & EMOTION LOCK:
Keep the exact pose and emotional state from the reference —
both characters are leaning forward with their foreheads touching;
eyes are closed;
expressions are soft, calm, intimate and emotional.
Match head angles, distance between faces, and facial tension exactly.
Do NOT open the eyes, do NOT change expression intensity.

CRITICAL LIGHTING & SKIN INTEGRATION (VERY IMPORTANT):
The scene has strong cold blue lighting with deep shadows.
Faces must fully inherit this lighting:
— apply the same blue color cast to skin
— preserve shadow areas on cheeks, nose, eye sockets
— maintain low-key contrast and soft falloff
— keep natural skin texture under low light (no smoothing, no plastic effect)

Skin tone must remain consistent across face, neck, and visible arms, but fully adapted to the blue environment lighting.
No mismatch between face and body. No "cut-out" look.

CRITICAL SHADOW & DEPTH MATCH:
Faces must integrate into existing shadows exactly:
— respect shadow direction and intensity
— do not flatten lighting
— keep subtle darkness between faces where they touch
— preserve cinematic depth and softness

CRITICAL OCCLUSION:
Keep all natural occlusions —
hair overlapping forehead and face must remain in place;
do not remove or shift hair strands;
do not reveal hidden parts of the face.

CRITICAL SCENE LOCK:
Keep background, color grading, clothing, and framing EXACTLY as in the reference.
No changes to environment or composition.

CRITICAL INTEGRATION:
Rebuild faces inside the original head positions with correct perspective.
Do NOT paste faces.
Do NOT rotate or re-angle heads.

CRITICAL HANDS:
If visible — anatomically correct, five fingers, natural proportions.

Final result must look like the same cinematic moment with identical lighting, mood, and composition, but with the uploaded man and woman naturally present.
Cinematic realism, cold blue lighting, deep shadows, soft texture, high detail, 4K.`,
  },
  { id: 'stranger-things-3', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things3.jpg' },

  // ── The End of the F***ing World ──
  { id: 'end-of-the-fucking-world-1', style: 'end-of-the-fucking-world', label: 'The End of the F***ing World', image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world1.jpg' },
  { id: 'end-of-the-fucking-world-2', style: 'end-of-the-fucking-world', label: 'The End of the F***ing World', image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world2.jpg' },
  { id: 'end-of-the-fucking-world-3', style: 'end-of-the-fucking-world', label: 'The End of the F***ing World', image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world3.jpg' },
];

export interface Category {
  id: string;
  name: string;
  tag: string;
  description: string;
  cover: string;
}

export const categories: Category[] = [
  { id: 'zootopia', name: 'Zootopia', tag: 'Animated', description: 'Disney/Pixar style with playful energy', cover: '/styles/zootopia/zootopia1.jpg' },
  { id: 'euphoria', name: 'Euphoria', tag: 'Cinematic', description: 'Bold drama with neon aesthetics', cover: '/styles/euphoria/euphoria1.jpg' },
  { id: 'titanic', name: 'Titanic', tag: 'Romance', description: 'Timeless romance with golden hour warmth', cover: '/styles/titanic/titanic1.jpg' },
  { id: 'tangled', name: 'Tangled', tag: 'Fantasy', description: 'Fairy-tale adventure with lantern-lit warmth', cover: '/styles/tangled/tangled1.jpg' },
  { id: 'spiderman', name: 'Spider-Man', tag: 'Action', description: 'Superhero story full of action and heart', cover: '/styles/spiderman/spiderman1.jpg' },
  { id: 'terabithia', name: 'Terabithia', tag: 'Adventure', description: 'Coming-of-age tale in an enchanted world', cover: '/styles/terabithia/terabithia1.jpg' },
  { id: 'cinderella', name: 'Cinderella', tag: 'Fantasy', description: 'A timeless fairy tale of magic and love', cover: '/styles/cinderella/cinderella1.jpg' },
  { id: 'stranger-things', name: 'Stranger Things', tag: 'Sci-Fi', description: 'Supernatural mystery with 80s nostalgia', cover: '/styles/stranger-things/stranger-things1.jpg' },
  { id: 'end-of-the-fucking-world', name: 'The End of the F***ing World', tag: 'Drama', description: 'Dark, quirky teen road trip with raw emotion', cover: '/styles/end-of-the-fucking-world/end-of-the-fucking-world1.jpg' },
];

export function getRefsForCategory(categoryId: string): ReferenceItem[] {
  return references.filter((r) => r.style === categoryId);
}
