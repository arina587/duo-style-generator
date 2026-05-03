export interface ReferenceItem {
  id: string;
  image: string;
  style: string;
  label: string;
  prompt?: string;
  modifier?: string;
  mode?: "locked";
}

export const references: ReferenceItem[] = [
  // ── Zootopia ──
  {
    id: 'zootopia-1',
    style: 'zootopia',
    label: 'Zootopia',
    image: '/styles/zootopia/zootopia1.jpg',
    mode: "locked",
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the male character (left) with the uploaded man and the female character (right) with the uploaded woman. Recreate them as stylized 3D animated human characters in the same Pixar/Disney-quality CGI style, not as pasted faces.

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
— man (left) holding the woman closely
— woman (right) leaning into the man
— faces very close with strong eye contact
— woman looking up, man looking down
— intimate distance, chest-to-chest positioning

Do NOT change angle, framing, distance, or head positioning.

CRITICAL EXPRESSION LOCK:
— man: soft, affectionate smile
— woman: warm, admiring expression

CRITICAL STYLE:
Full Pixar/Disney 3D look — soft shading, clean stylized skin, expressive eyes.

CRITICAL SCENE LOCK:
Keep lanterns, water reflections, background, framing, and lighting EXACTLY the same.

CRITICAL LIGHTING:
— strong warm lantern glow
— golden/orange highlights
— soft shadows
Faces must inherit warm lighting, not neutral.

CRITICAL HANDS (VERY IMPORTANT):
All hands must be human — anatomically correct, realistic proportions.
Each hand must have exactly five fingers.
Correct grip around the body, no deformation.

FINAL:
Identical romantic lantern scene with stylized human characters, strong identity match, no pose drift.`,
  },
  {
    id: 'zootopia-2',
    style: 'zootopia',
    label: 'Zootopia',
    image: '/styles/zootopia/zootopia2.jpg',
    mode: "locked",
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the male character (left) with the uploaded man and the female character (right) with the uploaded woman. Recreate them as stylized 3D animated human characters in the same Pixar/Disney CGI style, not as pasted faces.

STRICT IDENTITY PRESERVATION:
Faces must remain fully recognizable and consistent with uploaded photos.

CRITICAL POSE LOCK (ABSOLUTE):
— man sitting relaxed, slightly turned toward the woman
— woman leaning forward with elbows on knees
— chin resting on hands
— both looking at each other

Do NOT reposition bodies or change posture.

CRITICAL EXPRESSION LOCK:
— man: calm, slightly amused
— woman: curious, soft admiration

CRITICAL STYLE:
Same high-end Pixar/Disney 3D rendering.

CRITICAL SCENE LOCK:
Keep dark environment, composition, and framing identical.

CRITICAL LIGHTING (VERY IMPORTANT):
— low light scene with warm fire glow
— strong shadows present

IMPORTANT OVERRIDE:
Faces must remain clearly visible:
— reduce shadow intensity on faces only
— preserve identity clarity
— do NOT allow shadows to hide facial features

CRITICAL HANDS:
— woman’s hands under chin must be natural
— exactly five fingers per hand
— correct proportions, no distortion

FINAL:
Same intimate night scene, exact pose preserved, stylized human version with visible identity despite low light.`,
  },
  {
    id: 'zootopia-3',
    style: 'zootopia',
    label: 'Zootopia',
    image: '/styles/zootopia/zootopia3.jpg',
    mode: "locked",
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the male character (left) with the uploaded man and the female character (right) with the uploaded woman. Recreate them as stylized 3D animated human characters in the same Pixar/Disney CGI style, not as pasted faces.

STRICT IDENTITY PRESERVATION:
Faces must remain fully recognizable and consistent with uploaded photos.

CRITICAL POSE LOCK (ABSOLUTE):
— man (left) leading the dance
— holding the woman’s hand
— slightly leaning forward
— woman (right) extending her arm
— delicate hand connection

Do NOT change interaction, spacing, or gesture.

CRITICAL EXPRESSION LOCK:
— both: playful, light, engaged expressions

CRITICAL STYLE:
Same Pixar/Disney 3D rendering.

CRITICAL SCENE LOCK:
Keep crowd, architecture, perspective, and framing identical.

CRITICAL LIGHTING:
— natural daylight
— soft shadows
— consistent color temperature

Faces must match daylight lighting (no artificial tones).

CRITICAL HANDS (VERY IMPORTANT):
— exactly five fingers
— correct anatomy
— proper hand interaction (no fusion, no distortion)

FINAL:
Same dance scene, exact pose preserved, stylized human version with strong identity match.`,
  },

  // ── Euphoria ──
  { 
    id: 'euphoria-1', 
    style: 'euphoria', 
    label: 'Euphoria', 
    image: '/styles/euphoria/euphoria1.jpg', 
    mode: "locked",
    prompt: `Use the reference image as a background plate with no people.

Completely remove all original characters from the scene.

Treat the positions of the original people as empty space.

---

TASK:

Create a new photo by placing the people from the uploaded identity images into this scene.

---

CRITICAL RULE:

The original people from the reference image must NOT be used in any way.

Do NOT use:
— their faces
— their head shapes
— their body shapes
— their proportions
— their skin tones
— any part of their identity

They must be fully ignored.

---

FULL CHARACTER REPLACEMENT:

Insert entirely new people:

— woman from the uploaded female photo → left position  
— man from the uploaded male photo → right position  

Replace them as full characters, not just faces.

---

IDENTITY (VERY IMPORTANT):

The new people must match the uploaded photos:

— facial structure  
— eyes, nose, lips  
— proportions  
— skin tone  
— hairline  

No blending with the original reference characters.

---

POSE MATCH:

Match the original scene:

— body positions  
— head angles  
— distance between people  
— camera angle and crop  

---

LIGHTING:

Match the scene lighting, but adjust the face lighting if needed to keep identity clear.

Do NOT allow shadows to hide facial features.

---

INTEGRATION:

Rebuild the people naturally into the scene:

— correct depth  
— correct perspective  
— correct shadows  
— no pasted look  

---

FINAL:

A new image where the original people are completely gone and replaced by new individuals from the uploaded photos, occupying the same positions in the scene.`,
  },
  { id: 'euphoria-2', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria2.jpg' },
  { id: 'euphoria-3', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria3.jpg', modifier: 'Match warm cinematic low-light precisely. Apply the same color grading, shadow depth, and soft directional lighting from the scene to the faces. Ensure skin tones are affected by the scene lighting and not neutral. Increase shadow contrast on the face to match the original scene. Apply natural film grain, subtle noise, and slight color imperfection to the face. Reduce skin smoothness and avoid clean or studio-like appearance. Ensure the face inherits the same cinematic texture as the scene.' },

  // ── Titanic ──
  { id: 'titanic-1', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic1.jpg' },
  { id: 'titanic-2', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic2.jpg' },
  { id: 'titanic-3', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic3.jpg' },

  // ── Tangled ──
  {
    id: 'tangled-1',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled1.jpg',
    mode: "locked",
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the male character (left) with the uploaded man and the female character (right) with the uploaded woman.

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

Keep natural human anatomy.

— man follows original pose (holding the woman)  
— woman positioned in his arms, looking upward  

Maintain correct proportions and physical interaction.

---

POSE & COMPOSITION (STRICT):

Man (left):
— standing upright  
— holding the woman close with one arm  
— head slightly tilted down toward her  

Woman (right):
— leaning into the man  
— looking up directly at his face  
— very close facial distance  

Preserve:
— intimate distance  
— eye contact  
— camera framing  

Do NOT change pose or spacing.

---

EXPRESSION:

— man: soft, affectionate smile  
— woman: warm, admiring expression  

---

LIGHTING & COLOR:

Match lantern night lighting:

— warm golden/orange glow  
— soft multi-source lighting from lanterns  
— strong rim light and highlights  
— soft shadows  

IMPORTANT:
Faces must inherit warm lighting and glow.
No neutral lighting.

---

HANDS:

— exactly five fingers  
— correct anatomy  
— natural grip on the body  

---

SCENE LOCK:

Do NOT change:
— lanterns  
— background  
— composition  
— camera angle  

---

INTEGRATION:

Rebuild characters fully into the scene:

— correct depth  
— correct lighting  
— no face overlay  
— no mismatch  

---

FINAL:

A romantic lantern-lit scene with fully replaced characters, perfect identity match, and seamless integration.`,
  },
  {
    id: 'tangled-2',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled2.jpg',
    mode: "locked",
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the male character (left) with the uploaded man and the female character (right) with the uploaded woman.

Recreate them as stylized 3D human characters in Pixar/Disney 3D CGI style.

---

PRIORITY ORDER (STRICT):
1) Identity from uploaded photos
2) Original pose and composition
3) Lighting and style

---

IDENTITY (CRITICAL):

Preserve identity with high accuracy:

— facial structure and proportions  
— eyes, nose, lips, jawline  
— skin tone adapted to lighting  
— hair shape and color  

Do NOT:
— mix identities  
— stylize away identity  

---

BODY & PROPORTIONS:

Maintain natural human proportions.

— man sitting relaxed  
— woman leaning forward with chin on hands  

---

POSE & COMPOSITION (STRICT):

Man (left):
— sitting slightly turned toward the woman  
— relaxed posture  

Woman (right):
— leaning forward  
— elbows on knees  
— chin resting on hands  
— looking at the man  

Preserve:
— distance  
— angles  
— framing  

---

EXPRESSION:

— man: calm, slightly amused  
— woman: curious, engaged, soft admiration  

---

LIGHTING & COLOR:

CRITICAL (this is where models fail):

— very low light scene  
— warm fire light from below/side  
— strong shadows  

IMPORTANT OVERRIDE:

Faces MUST remain readable:
— slightly reduce shadow intensity on faces ONLY  
— preserve identity visibility  
— do NOT let shadows hide facial features  

Keep cinematic darkness but preserve identity clarity.

---

HANDS:

— 5 fingers  
— natural placement under chin  

---

SCENE LOCK:

Do NOT change:
— darkness  
— environment  
— composition  

---

INTEGRATION:

— faces must follow fire lighting  
— soft warm highlights  
— no flat lighting  

---

FINAL:

Dark cinematic scene with correct lighting and clearly recognizable faces despite low light.`,
  },
  {
    id: 'tangled-3',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled3.jpg',
    mode: "locked",
    prompt: `Use the provided reference image and separately uploaded photos of the man and the woman.

Replace the male character (left) with the uploaded man and the female character (right) with the uploaded woman.

Recreate them as stylized 3D human characters in Pixar/Disney 3D CGI style.

---

PRIORITY ORDER (STRICT):
1) Identity from uploaded photos
2) Original pose and composition
3) Lighting and style

---

IDENTITY (CRITICAL):

Preserve identity with high accuracy:

— facial structure  
— proportions  
— facial features  
— skin tone  
— hair  

Do NOT:
— mix identities  
— stylize away identity  

---

BODY & PROPORTIONS:

Maintain realistic human anatomy.

— man leading the dance  
— woman following the motion  

---

POSE & COMPOSITION (STRICT):

Man (left):
— slightly bent forward  
— holding woman's hand  
— guiding movement  

Woman (right):
— arm extended  
— holding hand delicately  
— body turned slightly  

Preserve:
— hand connection  
— spacing  
— perspective  

---

EXPRESSION:

— both: playful, light, engaged  

---

LIGHTING & COLOR:

— daylight scene  
— soft natural light  
— clean shadows  

Faces must:
— match daylight tone  
— no artificial lighting  
— consistent color temperature  

---

HANDS (CRITICAL):

— exactly 5 fingers  
— correct anatomy  
— proper grip interaction  
— no deformation  

---

SCENE LOCK:

Do NOT change:
— crowd  
— background  
— architecture  
— camera  

---

INTEGRATION:

— correct perspective  
— depth consistency  
— no pasted look  

---

FINAL:

A lively dance scene with fully replaced characters, accurate identity, and natural interaction.`,
  },

  // ── Spider-Man ──
  { id: 'spiderman-1', style: 'spiderman', label: 'Spider-Man', image: '/styles/spiderman/spiderman1.jpg' },
  { id: 'spiderman-2', style: 'spiderman', label: 'Spider-Man', image: '/styles/spiderman/spiderman2.jpg' },
  { id: 'spiderman-3', style: 'spiderman', label: 'Spider-Man', image: '/styles/spiderman/spiderman3.jpg' },

  // ── Bridge to Terabithia ──
  { id: 'terabithia-1', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia1.jpg' },
  { id: 'terabithia-2', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia2.jpg' },
  { id: 'terabithia-3', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia3.jpg' },

  // ── Cinderella ──
  { id: 'cinderella-1', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella1.jpg', mode: "locked" },
  { id: 'cinderella-2', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella2.jpg', mode: "locked" },
  { id: 'cinderella-3', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella3.jpg', mode: "locked" },

  // ── Stranger Things ──
  { id: 'stranger-things-1', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things1.jpg' },
  { id: 'stranger-things-2', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things2.jpg' },
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
