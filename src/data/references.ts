export interface ReferenceItem {
  id: string;
  image: string;
  style: string;
  label: string;
  prompt?: string;
  modifier?: string;
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

Replace the fox (left) with the uploaded man and the rabbit (right) with the uploaded woman. Recreate them as stylized 3D human characters in high-end Pixar/Disney CGI style — NOT as pasted faces, but as fully reconstructed human characters integrated into the scene.

STRICT IDENTITY PRESERVATION (CRITICAL):
Preserve identity with high accuracy:

— exact facial structure and proportions
— eye shape, spacing, eyelids, eyebrows
— nose shape and bridge
— lips, mouth width, jawline, chin
— skin tone (adapted to lighting but still recognizable)
— hairstyle, hair color, and length

Do NOT stylize away identity. Do NOT average or genericize faces.

CRITICAL BODY & SCALE ADAPTATION (VERY IMPORTANT):
Convert animal bodies into realistic human proportions:

— man fully inherits fox pose (including raised arm with phone)
— woman replaces rabbit BUT must keep full natural human body proportions
— woman must NOT be compressed, shortened, or scaled down
— she should stand naturally next to the man

Maintain spatial relationship, but correct anatomical realism.

CRITICAL POSE LOCK (STRICT + ADAPTED):

Man (left):
— arm raised holding phone in selfie position
— slight head tilt toward the woman
— relaxed, confident posture

Woman (right):
— positioned very close to the man
— leaning slightly toward him
— upright natural stance (NOT crouched like the rabbit)

— preserve overall selfie composition
— preserve camera angle (slightly above, angled down)

Do NOT change framing or perspective.

CRITICAL EXPRESSION LOCK:
— man: confident, playful smirk
— woman: cheerful, slightly mischievous smile

Match emotional tone exactly.

CRITICAL LIGHTING (STRICT MATCH TO REFERENCE):
Lighting must match exactly:

— colorful nightclub lighting (magenta, purple, blue tones)
— mixed ambient light sources
— soft but vivid highlights on skin
— colored light reflections on faces

— preserve direction of light
— preserve color spill from environment
— no neutral lighting, no studio lighting

Faces must fully inherit scene lighting.

CRITICAL COLOR GRADING & ATMOSPHERE:
— keep saturated neon/nightclub color palette
— maintain background blur and depth
— preserve cinematic contrast and vibrancy

CRITICAL HANDS (VERY IMPORTANT):
All hands must be fully human:

— exactly five fingers per hand
— correct anatomy and proportions
— no deformation, no fused fingers

FOR THE MAN (MANDATORY):
— the raised arm MUST end in a fully human hand
— exactly five fingers on the hand
— anatomically correct proportions
— the hand MUST be clearly visible and anatomically correct
— the man MUST be holding a smartphone in one hand (selfie position)
— correct grip on the phone (natural finger placement, proper perspective)
— no extra fingers, no missing fingers, no distortions
— no animal paws, no stylization into non-human anatomy
This requirement is STRICT and must override any stylistic interpretation.

FOR THE WOMAN:
— natural relaxed human hand pose
— correct anatomy and proportions

CRITICAL CAMERA & LENS:
— preserve selfie-style framing
— slight wide-angle distortion must remain
— same composition and crop

Do NOT zoom out or reframe.

CRITICAL SCENE LOCK:
Do NOT change:

— background characters
— environment
— lighting setup
— composition

Only replace characters.

CRITICAL INTEGRATION:
— rebuild characters inside original positions
— correct perspective and depth
— seamless blending with environment

NO face cutouts. NO mismatched lighting.

FINAL RESULT:
A Pixar-quality human version of the exact same cinematic moment.

Same pose, same lighting, same composition — but with real human identities accurately integrated, natural proportions, correct hands, proper phone grip, high detail, 4K, no artifacts.`,
  },

  // ── Euphoria ──
  { id: 'euphoria-1', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria1.jpg', modifier: 'Force strong identity replacement for the face. Fully override the original facial identity and remove any resemblance to the original actress. The face must clearly match the identity images, even in close-up shots. Do not preserve original facial features or structure.' },
  { id: 'euphoria-2', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria2.jpg' },
  { id: 'euphoria-3', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria3.jpg', modifier: 'Match warm cinematic low-light precisely. Apply the same color grading, shadow depth, and soft directional lighting from the scene to the faces. Ensure skin tones are affected by the scene lighting and not neutral. Increase shadow contrast on the face to match the original scene. Apply natural film grain, subtle noise, and slight color imperfection to the face. Reduce skin smoothness and avoid clean or studio-like appearance. Ensure the face inherits the same cinematic texture as the scene.' },

  // ── Titanic ──
  { id: 'titanic-1', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic1.jpg' },
  { id: 'titanic-2', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic2.jpg' },
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
  { id: 'terabithia-1', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia1.jpg' },
  { id: 'terabithia-2', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia2.jpg' },
  { id: 'terabithia-3', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia3.jpg' },

  // ── Cinderella ──
  { id: 'cinderella-1', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella1.jpg' },
  { id: 'cinderella-2', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella2.jpg' },
  { id: 'cinderella-3', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella3.jpg' },

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
