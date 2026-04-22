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
    prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nbackground MUST come strictly from image 1. Do NOT use background, lighting or environment from uploaded people images.\n\nSTRICTLY preserve:\n- exact camera angle and perspective\n- framing and crop\n- head positions and spacing\n- gaze directions\n- depth of field (woman sharp, man blurred)\n- body alignment\n\nUltra-realistic cinematic close-up. Woman on the left in focus looking sideways at the man. Man on the right closer to camera and softly blurred.\n\nReplace with uploaded woman (left) and man (right).\n\nSTRICTLY preserve identity 1:1 — same face structure, proportions, skin texture. No smoothing, no filters, no distortion.\n\nLighting and color MUST match the reference exactly.\n\nFinal result must look like the original frame with only faces replaced, nothing else changed.',
  },
  {
    id: 'euphoria-2',
    style: 'euphoria',
    label: 'Euphoria',
    image: '/styles/euphoria/euphoria2.jpg',
    prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\ndo NOT use any background, lighting or environment from uploaded images — only from the reference.\n\nSTRICTLY preserve:\n- exact camera angle (slightly above and from the side)\n- pose of the man leaning back\n- head tilt direction toward the woman\n- relative distance between characters\n- perspective and framing\n\nUltra-realistic cinematic scene. Man as main subject, woman closer to camera and partially blurred.\n\nReplace with uploaded man and woman in identical positions.\n\nSTRICTLY preserve identity 1:1 — no smoothing, no distortion.\n\nLighting, shadows and color grading must match the reference exactly.\n\nBackground MUST remain identical — couch, wall, lighting, depth, all unchanged.\n\nFinal result must look identical to the original shot, only with replaced people.',
  },
  {
    id: 'euphoria-3',
    style: 'euphoria',
    label: 'Euphoria',
    image: '/styles/euphoria/euphoria3.jpg',
    prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nbackground and environment must come strictly from the reference. Do NOT transfer anything from uploaded images.\n\nSTRICTLY preserve:\n- exact top/side camera angle\n- body positions on the bed\n- distance between characters\n- head orientation and gaze\n- interaction between bodies\n\nUltra-realistic cinematic bedroom scene. Two people lying facing each other.\n\nReplace with uploaded people, keeping exact pose and proportions.\n\nSTRICTLY preserve identity 1:1 — same faces, proportions, skin texture.\n\nLighting and color must match the reference exactly.\n\nBackground MUST remain identical — bed, objects, clutter, lighting.\n\nFinal result must look like the same original frame with only identities replaced.\n\nGoal:\nForce model to keep background and pose strictly from reference, without pulling anything from uploaded images.',
  },

  // ── Titanic ──
  {
    id: 'titanic-1',
    style: 'titanic',
    label: 'Titanic',
    image: '/styles/titanic/titanic1.jpg',
    prompt: 'Use image 1 as the ONLY source of scene, background, composition and camera.\n\nCRITICAL:\nstrictly preserve the exact pose — the woman standing in front with arms extended sideways, the man behind her holding her at the waist.\n\nPreserve:\n- arm positions (fully extended horizontally)\n- body alignment\n- distance between bodies\n- head tilt and direction\n- railing position and framing\n\nReplace with uploaded man and woman in identical positions.\n\nSTRICTLY preserve identity 1:1 — same face, proportions, skin texture. No smoothing, no distortion.\n\nLighting:\nwarm sunset cinematic lighting. Preserve original color and glow exactly.\n\nBackground:\nSTRICTLY keep the ship deck, sky, horizon and lighting exactly as in the reference.\n\nDo NOT change composition or perspective.\n\nFinal result must look identical to the original scene with only identities replaced.',
  },
  {
    id: 'titanic-2',
    style: 'titanic',
    label: 'Titanic',
    image: '/styles/titanic/titanic2.jpg',
    prompt: "Use image 1 as the exact base reference. Keep the original frame unchanged: same background, same water surface, same reflections, same composition, same crop, same body positions, same distance between the two characters, same head angles, same gaze directions.\n\nDo NOT redraw or reinterpret the scene. Do NOT restage anything.\n\nIntegrate the uploaded man and woman into the exact existing shot.\n\nThis is a difficult low-light close-contact scene. Preserve the original pose and limited visibility exactly:\n- the man's face remains partially visible and angled downward\n- do not rotate his head toward camera\n- do not reveal hidden parts of his face\n- do not reconstruct a more frontal face\n- keep the original proximity between faces\n- keep the original emotional tension\n\nPreserve identity of both people where visible:\nsame recognizable facial structure, eye area, nose shape, lips, proportions, and natural human skin character.\n\nIMPORTANT FOR SKIN:\nkeep natural human skin tones.\nDo NOT turn skin strongly blue.\nUse only a mild cold ambient tint from the scene.\nFace, neck and visible skin must stay naturally matched with no blue cast and no pasted look.\n\nIMPORTANT FOR GAZE AND ANGLES:\nkeep the exact original head angle\nkeep the exact original gaze direction\ndo not correct or stylize the eyes\ndo not change visibility of either face\n\nPreserve natural cinematic softness, darkness, reflections and slight blur from the original frame.\n\nFinal result must look like the same original Titanic frame, with the uploaded man and woman naturally integrated, correct head angles, correct gaze, and natural skin tone.",
  },
  {
    id: 'titanic-3',
    style: 'titanic',
    label: 'Titanic',
    image: '/styles/titanic/titanic3.jpg',
    prompt: "Use image 1 as the exact base reference. Keep the original frame unchanged: same background, same ship, same sky, same sunset lighting, same composition, same crop, same body positions, same hand placement, same distance between the faces.\nDo NOT redraw or reinterpret the scene.\nPreserve the exact pose:\n- the man stands behind the woman, holding her at the waist\n- their bodies lean toward each other\n- the distance between their faces remains extremely close\nCRITICAL GAZE AND HEAD POSITION:\nthe woman's head must remain turned toward the man exactly like in the reference.\nher gaze must stay directed toward him.\ndo NOT turn her head away.\ndo NOT redirect her eyes.\ndo NOT reduce the intimacy of the pose.\nIMPORTANT:\nthis is a close emotional moment — preserve closeness without exaggeration or avoidance.\nFor the man:\nkeep his head angle, position and proximity exactly as in the reference.\nhis face must be recognizable but follow the original angle and lighting.\nIDENTITY:\npreserve both identities naturally — same facial structure, proportions, features.\nSKIN TONE:\nkeep natural human skin tones with warm sunset lighting.\nno mismatch between face, neck and body.\nLIGHTING:\npreserve original warm cinematic sunset tones exactly.\nDo NOT change:\n- pose\n- gaze\n- distance between faces\n- background\n- camera angle\nFinal result must look like the same original Titanic frame, with correct gaze direction, preserved intimacy, and natural identity integration.",
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

