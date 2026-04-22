export interface ReferenceItem {
  id: string;
  image: string;
  prompt: string;
  humanPrompt?: string;
  animalPrompt?: string;
  style: string;
  label: string;
}

export const references: ReferenceItem[] = [
  // ── Zootopia ──
  {
    id: 'zootopia-1',
    style: 'zootopia',
    label: 'Zootopia',
    image: '/styles/zootopia/zootopia1.jpg',
    prompt: "Use the provided reference image AND separately uploaded photos of the man and woman.\nSTRICTLY preserve identity from the uploaded photos — facial structure, proportions, age, skin tone, eye shape, nose, lips, hairstyle, hair color and length must remain highly recognizable.\n\nCRITICAL: transform both into full 3D Pixar/Disney characters — stylized anatomy, smooth skin, large expressive eyes, but with MAXIMUM likeness to real faces (identity fidelity priority over stylization).\n\nCRITICAL POSE LOCK:\nReproduce the pose from the reference image EXACTLY 1:1 — no reinterpretation.\nExact head tilt, exact distance between faces, exact shoulder angles, exact facial proximity, exact camera angle.\nSelfie perspective must match precisely — same focal distortion, same framing, same crop.\nDO NOT change composition, DO NOT shift body alignment.\n\nCRITICAL HANDS:\nHands must be anatomically correct — exactly five fingers per hand, correct proportions, no deformation, no fusion.\n\nCRITICAL CLOTHING:\nClothing must EXACTLY match the reference image — same colors, same design, same shapes, same folds, no simplification or reinterpretation.\n\nScene: close-up selfie. Woman hugs the man tightly from the side, faces pressed together.\nWoman — wide joyful smile.\nMan — slightly annoyed / skeptical expression.\nCamera held in woman's hand.\n\nBackground — EXACT COPY of the reference: clean light studio background, unchanged.\n\nLighting — soft studio lighting, even, no harsh shadows, sharp focus on faces, shallow depth of field.\nHigh-end CGI, ultra clean render, 4K.",
  },
  {
    id: 'zootopia-2',
    style: 'zootopia',
    label: 'Zootopia',
    image: '/styles/zootopia/zootopia2.jpg',
    prompt: "Use the provided reference image AND separately uploaded photos of the man and woman.\nSTRICTLY preserve identity — all facial features must remain максимально узнаваемыми, no distortion.\n\nCRITICAL: convert both into Pixar/Disney-style 3D characters — stylized but clearly the same real people.\n\nCRITICAL POSE LOCK:\nExact 1:1 replication of the reference pose —\nbody angles, head tilt, facial distance, arm placement, hand positions must match EXACTLY.\nSelfie framing must be identical — same crop, same perspective distortion, same camera angle.\nNo deviation allowed.\n\nCRITICAL HANDS:\nFive fingers on each hand, correct anatomy, no artifacts.\n\nCRITICAL CLOTHING:\nOutfits must EXACTLY match the reference — same clothing pieces, same colors, same textures, no redesign.\n\nScene: dynamic selfie.\nWoman presses tightly against the man, smiling widely with open mouth, energetic expression.\nMan leans slightly away with a tense / uncomfortable expression.\nCamera in woman's hand, very close framing.\n\nBackground — EXACT COPY of the reference: clean light background, unchanged.\n\nLighting — soft studio lighting, evenly distributed, high detail on faces and hair, clean Pixar-style rendering, 4K.",
  },
  {
    id: 'zootopia-3',
    style: 'zootopia',
    label: 'Zootopia',
    image: '/styles/zootopia/zootopia3.jpg',
    prompt: "Use the provided reference image AND separately uploaded photos of the man and woman.\nSTRICTLY preserve identity — faces must remain highly recognizable with accurate proportions, skin tone, and hairstyles.\n\nCRITICAL: full transformation into Pixar/Disney 3D characters — stylized but identity-preserving.\n\nCRITICAL POSE LOCK:\nExact 1:1 replication of the reference composition —\nbody positioning, arm placement, posture, camera angle, framing and distance must match EXACTLY.\nNo reinterpretation, no pose drift.\n\nCRITICAL HANDS:\nHands must be correct — five fingers per hand, proper anatomy, no deformation.\n\nCRITICAL OBJECT:\nThe woman MUST hold a carrot in her hand — clearly visible, same position, same scale as in the reference. No replacement or omission.\n\nCRITICAL CLOTHING:\nClothing must EXACTLY match the reference image — same colors, same shapes, same details, no simplification.\n\nScene: club selfie.\nMan holds the phone and takes the selfie.\nWoman is pressed close to him, one arm around him, the other holding the carrot.\nBoth looking into the camera.\n\nBackground — EXACT COPY of the reference: colorful nightclub environment with blurred characters and vibrant lighting, unchanged.\n\nLighting — neon club lighting, colorful highlights, soft glow, cinematic depth, background bokeh, strong subject focus.\nHigh-end Pixar-style CGI, ultra-detailed, 4K.",
  },

  // ── Euphoria ──
  {
    id: 'euphoria-1',
    style: 'euphoria',
    label: 'Euphoria',
    image: '/styles/euphoria/euphoria1.jpg',
    prompt: "Use the provided movie reference image and separately uploaded photos of the man and woman.\nSTRICTLY preserve their identity 1:1 — facial structure, proportions, age, skin tone, eye shape, lips, nose, hairstyle, hair color and length must remain highly recognizable.\n\nCRITICAL: perform seamless face replacement — integrate their faces naturally into the scene, not as a flat overlay. Match original cinematic lighting, shadow direction, skin texture, and warm color grading. Faces must inherit the same amber lighting and soft shadow falloff.\n\nCRITICAL POSE LOCK:\nExact 1:1 replication of the reference —\nthe woman is in sharp focus, slightly turned, looking sideways toward the man;\nthe man is closer to camera but blurred, in partial profile, looking forward/down.\nDO NOT change head angles, gaze direction, depth of field, or composition.\n\nCRITICAL VISIBILITY RULE:\nOnly replace visible facial areas. The man's face is partially out of focus — preserve blur exactly, do not sharpen.\n\nCRITICAL CLOTHING & BACKGROUND:\nKeep clothing, sofa, and background EXACTLY as in the reference. No changes.\n\nCRITICAL HANDS:\nIf visible — anatomically correct, five fingers, no distortion.\n\nCinematic close-up, shallow depth of field, warm indoor lighting, subtle film grain, high realism, 4K.",
  },
  {
    id: 'euphoria-2',
    style: 'euphoria',
    label: 'Euphoria',
    image: '/styles/euphoria/euphoria2.jpg',
    prompt: "Use the provided movie reference image and separately uploaded photos of the man and woman.\nSTRICTLY preserve identity — no changes to facial features, proportions, skin tone, hairstyle, or hair color.\n\nCRITICAL: seamless face integration — match original lighting, shadow direction, highlights, and warm indoor cinematic color grading. Maintain natural skin texture.\n\nCRITICAL POSE LOCK:\nExact 1:1 pose replication —\nman is leaning back on the couch, head slightly tilted toward the woman;\nwoman is turned toward him, mostly seen from behind/side.\nDO NOT alter head orientation or body position.\n\nCRITICAL VISIBILITY RULE:\nThe woman is mostly back/side view — DO NOT generate a full frontal face. Preserve only visible parts: hair, head shape, partial profile if visible.\n\nCRITICAL DEPTH & FOCUS:\nMan is in focus, woman is slightly out of focus — preserve original depth of field exactly.\n\nCRITICAL CLOTHING & BACKGROUND:\nClothing, couch, lighting, and environment remain EXACTLY unchanged.\n\nCRITICAL HANDS:\nIf visible — correct anatomy, five fingers.\n\nWarm cinematic lighting, soft shadows, indoor evening atmosphere, film realism, 4K.",
  },
  {
    id: 'euphoria-3',
    style: 'euphoria',
    label: 'Euphoria',
    image: '/styles/euphoria/euphoria3.jpg',
    prompt: "Use the provided movie reference image and separately uploaded photos of the man and woman.\nSTRICTLY preserve identity 1:1 — all facial features must remain clearly recognizable with correct proportions, skin tone, and hairstyle.\n\nCRITICAL: integrate faces into the scene with full cinematic consistency — match neutral indoor lighting, shadows, and natural color grading. No artificial smoothing or mismatch.\n\nCRITICAL POSE LOCK:\nExact 1:1 replication —\nfull-body walking shot in a school hallway;\nman on the left, woman on the right, holding hands;\nboth walking toward the camera.\nPreserve exact posture, stride, spacing, and proportions.\n\nCRITICAL HEAD ORIENTATION:\nFaces are visible in frontal/3/4 view — replace faces accordingly, matching perspective precisely.\n\nCRITICAL HANDS:\nHands must be correct — exactly five fingers per hand, natural grip while holding hands, no deformation.\n\nCRITICAL CLOTHING & ENVIRONMENT:\nClothing must match EXACTLY — same outfits, colors, and fit.\nBackground (hallway, lockers, students) remains unchanged.\n\nCRITICAL COMPOSITION:\nDo not crop, zoom, or shift framing. Keep original camera position and lens perspective.\n\nClean cinematic realism, natural lighting, high detail, 4K.",
  },

  // ── Titanic ──
  {
    id: 'titanic-1',
    style: 'titanic',
    label: 'Titanic',
    image: '/styles/titanic/titanic1.jpg',
    prompt: "Use the provided movie reference image and the separately uploaded photos of the man and woman.\nSTRICTLY preserve the identity of both people from their photos 1:1 — facial structure, proportions, age, skin tone, eye shape, nose, lips, hairstyle, hair color, and hair length must remain highly recognizable and unchanged.\n\nCRITICAL: perform seamless face replacement only. Do not redraw or reinterpret the scene. Integrate the man's face onto the male character and the woman's face onto the female character naturally inside the original cinematic frame.\n\nCRITICAL SCENE LOCK:\nKeep the ship deck, sunset sky, railing, background blur, camera angle, composition, costume design, and overall framing EXACTLY as in the reference.\nDo not alter the environment, lighting setup, or body positions.\n\nCRITICAL POSE LOCK:\nExact 1:1 replication of the original pose —\nthe woman stands in front with both arms extended outward, eyes closed, head slightly lifted;\nthe man stands directly behind her, close to her back, leaning slightly toward her.\nPreserve exact arm angles, torso orientation, spacing between bodies, and head tilt.\n\nCRITICAL FACE INTEGRATION:\nFaces must inherit the original warm sunset lighting, shadow falloff, film softness, and color grading.\nDo not over-sharpen, beautify, or restyle.\nMatch the exact head orientation and lens perspective.\n\nCRITICAL HANDS:\nIf visible, hands must be anatomically correct with exactly five fingers per hand, natural proportions, no distortion.\n\nRomantic cinematic realism, golden-hour film lighting, soft atmospheric depth, high detail, 4K.",
  },
  {
    id: 'titanic-2',
    style: 'titanic',
    label: 'Titanic',
    image: '/styles/titanic/titanic2.jpg',
    prompt: "Use the provided movie reference image and the separately uploaded photos of the man and woman.\nSTRICTLY preserve the identity of both people 1:1 — facial features, proportions, skin tone, hairstyle, and face shape must remain highly recognizable.\n\nCRITICAL: perform subtle, precise facial integration only where facial areas are actually visible. This is a difficult partial-occlusion scene — do not reconstruct hidden parts of the faces.\n\nCRITICAL VISIBILITY RULE:\nOnly replace the visible portions of each face.\nBoth faces are partially covered by angle, wet hair, hands, and close contact.\nDo NOT invent uncovered facial regions.\nDo NOT force full-face visibility.\nPreserve the original occlusion exactly.\n\nCRITICAL HAIR & WATER LOCK:\nThe woman's wet hair crossing her face must remain exactly as in the reference.\nPreserve wet strands, moisture, skin shine, water reflections, and dark blue night lighting.\nDo not clean up the wet cinematic texture.\n\nCRITICAL POSE LOCK:\nExact 1:1 replication —\nboth characters are leaning toward each other over the water surface, foreheads and faces very close, intimate low-angle contact, hands near the face area.\nKeep exact body placement, contact points, camera angle, and composition.\n\nCRITICAL SCENE LOCK:\nKeep water, reflections, dark background, wet clothing, highlights, and all environment details EXACTLY unchanged.\nNo background regeneration. No costume changes.\n\nCRITICAL HANDS:\nIf fingers are visible, they must be anatomically correct — exactly five fingers per hand, no deformation, no fused fingers.\n\nCinematic realism, wet night scene, cold blue lighting, reflective highlights, emotional intimacy, high detail, 4K.",
  },
  {
    id: 'titanic-3',
    style: 'titanic',
    label: 'Titanic',
    image: '/styles/titanic/titanic3.jpg',
    prompt: "Use the provided movie reference image and the separately uploaded photos of the man and woman.\nSTRICTLY preserve their identity 1:1 — facial structure, age, proportions, skin tone, hairstyle, hair color, and all defining features must remain highly recognizable and unchanged.\n\nCRITICAL: seamless face replacement only. Keep the original romantic cinematic scene intact.\nPlace the man's face on the male character and the woman's face on the female character with exact perspective matching.\n\nCRITICAL SCENE LOCK:\nDo not change the ship setting, warm sunset lighting, background, costume styling, framing, or pose.\nKeep all clothing exactly as in the reference — same dress, shawl, coat, shirt, textures, folds, and colors.\n\nCRITICAL POSE LOCK:\nExact 1:1 replication —\nthe man stands behind the woman with both hands resting gently around her waist and lower torso;\nthe woman leans back toward him, head turned toward his face, both in a near-kiss pose.\nPreserve exact hand placement, arm angles, head tilt, neck angle, body contact, and distance between faces.\n\nCRITICAL SAFE DESCRIPTION OF CONTACT:\nKeep the scene romantic, elegant, and cinematic.\nDo not intensify body contact, do not make the pose more intimate than in the reference, and do not reinterpret the hand placement.\nMaintain the original tasteful film pose exactly as shown.\n\nCRITICAL FACE INTEGRATION:\nFaces must inherit the original warm amber light, soft shadows, and film texture.\nNo face warping, no frontal correction, no expression change.\n\nCRITICAL HANDS:\nThe man's hands must be anatomically correct — exactly five fingers on each hand, natural placement, no distortion.\n\nRomantic cinematic realism, warm golden-hour lighting, soft film texture, elegant period atmosphere, high detail, 4K.",
  },

  // ── Tangled ──
  {
    id: 'tangled-1',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled1.jpg',
    prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
  },
  {
    id: 'tangled-2',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled2.jpg',
    prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
  },
  {
    id: 'tangled-3',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled3.jpg',
    prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
  },

  // ── Spider-Man ──
  {
    id: 'spiderman-1',
    style: 'spiderman',
    label: 'Spider-Man',
    image: '/styles/spiderman/spiderman1.jpg',
    prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
  },
  {
    id: 'spiderman-2',
    style: 'spiderman',
    label: 'Spider-Man',
    image: '/styles/spiderman/spiderman2.jpg',
    prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
  },
  {
    id: 'spiderman-3',
    style: 'spiderman',
    label: 'Spider-Man',
    image: '/styles/spiderman/spiderman3.jpg',
    prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
  },

  // ── Bridge to Terabithia ──
  {
    id: 'terabithia-1',
    style: 'terabithia',
    label: 'Terabithia',
    image: '/styles/terabithia/terabithia1.jpg',
    prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
  },
  {
    id: 'terabithia-2',
    style: 'terabithia',
    label: 'Terabithia',
    image: '/styles/terabithia/terabithia2.jpg',
    prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
  },
  {
    id: 'terabithia-3',
    style: 'terabithia',
    label: 'Terabithia',
    image: '/styles/terabithia/terabithia3.jpg',
    prompt: 'Use reference image as base. Preserve composition and mood. Apply identity from uploaded images naturally.',
  },
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
];

export function getRefsForCategory(categoryId: string): ReferenceItem[] {
  return references.filter((r) => r.style === categoryId);
}

