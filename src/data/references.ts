export interface ReferenceItem {
  id: string;
  image: string;
  style: string;
  label: string;
  prompt?: string;
}

export const references: ReferenceItem[] = [
  // ── Zootopia ──
  { id: 'zootopia-1', style: 'zootopia', label: 'Zootopia', image: '/styles/zootopia/zootopia1.jpg' },
  { id: 'zootopia-2', style: 'zootopia', label: 'Zootopia', image: '/styles/zootopia/zootopia2.jpg' },
  { id: 'zootopia-3', style: 'zootopia', label: 'Zootopia', image: '/styles/zootopia/zootopia3.jpg' },

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

Replace the male character on the left with the uploaded man, and the female character on the right with the uploaded woman. Recreate both people naturally inside the scene, not as pasted faces.

STRICTLY preserve identity — facial structure, proportions, age, skin tone, eyes, nose, lips, jawline, hairstyle, hair color and length must remain clearly recognizable.

CRITICAL POSE & EMOTION LOCK:
Keep the exact pose and emotional state from the reference —
both characters are leaning forward over the surface, very close to each other;
the woman is gently kissing the man's hand;
faces are angled downward and partially hidden;
expressions are soft, emotional, intimate, slightly tense.
Match head angles, compression of faces, distance, and contact points exactly.
Do NOT open the pose, do NOT rotate faces, do NOT change expression intensity.

CRITICAL VISIBILITY & FACE ANGLE:
Faces are partially obscured —
keep the same limited visibility;
do not reveal hidden facial areas;
do not force frontal view;
preserve natural perspective distortion and facial compression from the angle.

CRITICAL LIGHTING & SKIN INTEGRATION (VERY IMPORTANT):
The scene has strong cold blue cinematic lighting with wet reflections.
Faces must fully inherit this lighting:
— maintain dominant blue color cast
— preserve high-contrast lighting and deep shadows
— keep specular highlights from water on skin
— retain wet shine and reflective micro-details

Skin must react naturally to this lighting:
— avoid overly strong blue saturation on skin
— preserve realistic skin tone as a base under the lighting
— keep subtle natural warmth beneath the blue cast
— no flat monochrome blue skin
— face, neck, and hands must match perfectly in tone and lighting

The result should keep the cinematic blue atmosphere, but with more natural and slightly less saturated skin tones.

CRITICAL SHADOW & DEPTH MATCH:
Faces must integrate into shadows exactly:
— correct shadow direction and intensity
— deep shadow areas must remain deep
— preserve soft darkness between faces and around contact areas
— no flattening or over-brightening

CRITICAL HAIR & WET EFFECT:
Hair is wet and sticking to the face —
preserve wet strands across forehead and cheeks;
keep natural clumping and shine;
do not clean, separate, or restyle hair.

CRITICAL SCENE LOCK:
Keep background, water surface, reflections, clothing, and composition EXACTLY as in the reference.
No changes to environment, no redesign of wet clothing or textures.

CRITICAL INTEGRATION:
Rebuild faces inside the original head positions with correct perspective and lighting response.
Do NOT paste faces.
Do NOT alter skull orientation or proportions.

CRITICAL HANDS:
The hand being held and kissed must remain natural and anatomically correct — five fingers, correct proportions, no deformation.

Final result must look like the same cold, wet, cinematic moment with identical lighting, mood, and composition, but with the uploaded man and woman fully integrated into the scene.
No compositing artifacts, no plastic look, no lighting mismatch.
High detail, cinematic realism, 4K.`,
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
  { id: 'tangled-1', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled1.jpg' },
  { id: 'tangled-2', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled2.jpg' },
  { id: 'tangled-3', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled3.jpg' },

  // ── Spider-Man ──
  { id: 'spiderman-1', style: 'spiderman', label: 'Spider-Man', image: '/styles/spiderman/spiderman1.jpg' },
  { id: 'spiderman-2', style: 'spiderman', label: 'Spider-Man', image: '/styles/spiderman/spiderman2.jpg' },
  { id: 'spiderman-3', style: 'spiderman', label: 'Spider-Man', image: '/styles/spiderman/spiderman3.jpg' },

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
