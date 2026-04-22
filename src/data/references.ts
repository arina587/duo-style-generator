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

