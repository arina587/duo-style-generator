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

Replace the male character on the left with the uploaded man, and the female character on the right with the uploaded woman. Recreate both people naturally inside the scene.

STRICT IDENTITY PRESERVATION:
Keep both people clearly recognizable — facial structure, proportions, age, eyes, nose, lips, jawline, hairstyle, hair color and length must remain true to the uploaded photos.

CRITICAL SCENE LOCK (HIGHEST PRIORITY):
The reference image must remain unchanged in structure.
Keep EXACTLY the same:
— background
— water surface and reflections
— lighting setup and color grading
— clothing (same wet fabric, same colors, same folds)
— camera angle and framing
— depth of field and blur

Do not redesign or reinterpret the scene. Only replace the people.

CRITICAL POSE & CONTACT LOCK:
Match the pose exactly —
both leaning forward, faces very close, angled downward;
the woman kissing the man's hand;
tight physical proximity and compression must remain identical.

CRITICAL VISIBILITY & ANGLES:
Faces are partially hidden —
do not reconstruct hidden areas;
do not rotate faces;
preserve exact head angles and perspective compression.

CRITICAL LIGHTING & SKIN RESPONSE (PHYSICALLY CORRECT):
The cold blue lighting is dominant and must remain strong.
Faces must fully inherit the scene lighting and color grading.

However, skin must behave naturally under this light:
— preserve realistic skin depth and subsurface scattering
— avoid flat monochrome blue coloring
— maintain subtle natural variation in skin tones beneath the light

Lighting must affect the skin, not replace it.

CRITICAL SPECULAR & WET EFFECT (VERY IMPORTANT):
Preserve wet skin realism:
— strong specular highlights on forehead, nose, cheeks
— sharp light reflections from moisture
— micro-contrast in wet areas
— visible skin texture under highlights

Do NOT soften or remove these highlights.

CRITICAL SHADOW INTEGRATION:
Maintain true cinematic shadow behavior:
— deep shadows must remain deep
— correct falloff across face curvature
— subtle occlusion shadows between faces must stay
— no flattening or over-brightening

CRITICAL COLOR CONSISTENCY:
Face, neck, ears, and hands must all respond identically to the same lighting.
No mismatch, no "mask effect", no separate color zones.

CRITICAL HAIR & OCCLUSION:
Wet hair must stay exactly as in reference:
— strands stuck to skin
— no cleanup
— no repositioning
— preserve shadowing from hair

CRITICAL INTEGRATION:
Do not paste faces.
Reconstruct them inside the original head geometry, respecting perspective, lighting, and material response.

CRITICAL HANDS:
Hands must remain exactly positioned and anatomically correct — five fingers, no distortion.

FINAL RESULT:
The image must look like the same cold, wet, cinematic scene with identical lighting and mood, with the new people fully embedded into the physical lighting of the environment.
No blue paint effect, no flat skin, no compositing artifacts — only realistic skin reacting to strong blue light.
High detail, cinematic realism, 4K.`,
  },
  { id: 'titanic-3', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic3.jpg' },

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
