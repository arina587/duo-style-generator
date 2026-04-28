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
    image: '/styles/euphoria/euphoria3.png',
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
    prompt: "Use the provided movie reference image and the separately uploaded photos of the man and woman.\nSTRICTLY preserve the identity of both people from their photos 1:1 — facial structure, proportions, skin tone, nose shape, lips, eyes, eyebrows, hairline, and overall likeness must remain highly recognizable.\n\nCRITICAL: this is NOT a pasted face swap and NOT a flat overlay.\nPerform deep identity transfer into the original scene geometry.\nThe man and woman must look natively present in the frame, as if they were originally filmed in this exact shot.\nBlend identity into the existing head angle, wet skin, wet hair, shadows, reflections, and low-light cinematic texture.\n\nCRITICAL MALE FACE TRANSFER:\nThe man's identity must transfer clearly and correctly even though only part of his face is visible.\nPreserve his real facial structure inside the available visible area.\nDo NOT leave the original male face.\nDo NOT lose his identity because of angle or occlusion.\nDo NOT generate a generic face.\nDo NOT create a plastic or airbrushed result.\n\nCRITICAL FEMALE FACE TRANSFER:\nThe woman's identity must also transfer naturally while preserving the wet hair strands crossing the face and the partially obscured angle.\nDo not clean or remove hair from her face.\nDo not reveal hidden facial areas.\n\nCRITICAL OCCLUSION RULE:\nOnly the visible facial regions should be replaced.\nDo not reconstruct hidden parts of either face.\nDo not force frontal symmetry.\nKeep all original occlusions exactly as in the reference: wet hair, hand placement, face-to-face contact, shadows, and angle.\n\nCRITICAL SKIN / TEXTURE / LIGHT INTEGRATION:\nPreserve the original cold blue night lighting, water reflections, wet skin texture, wet hair texture, specular highlights, and natural cinematic grain.\nFaces must inherit the same moisture, shine, shadow softness, and low-light contrast as the original frame.\nNo beauty filter, no smoothing, no plastic skin, no studio retouching.\n\nCRITICAL POSE LOCK:\nExact 1:1 replication of the original shot —\nboth characters leaning close over the water, intimate forehead and face proximity, same low angle, same camera position, same composition, same contact points.\nDo not alter head tilt, angle, crop, or distance between faces.\n\nCRITICAL BACKGROUND LOCK:\nDo not change anything except identity transfer in the visible facial areas.\nKeep water, reflections, dark background, wet clothing, blur, highlights, and the full scene EXACTLY unchanged.\nNo repainting, no regenerated environment, no altered costume.\n\nCRITICAL HANDS:\nIf any fingers are visible, they must be anatomically correct — exactly five fingers per hand, no fusion, no deformation.\n\nPhotorealistic cinematic realism, wet night scene, cold blue lighting, natural skin texture, realistic identity transfer, seamless integration, high detail, 4K.",
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
    prompt: "Use the uploaded photos of the man and woman as the exact identity references for the two characters in the reference scene. Strictly preserve their recognizable appearance 1:1 — face shape, proportions, age, skin tone, eye shape, eyebrows, nose, lips, hairstyle, hair color, and hair length must remain clearly identifiable. The man must replace the male character, the woman must replace the female character. Do not add any new people or animals.\n\nStylize both people into the same premium 3D animated fairy-tale movie style as the reference image. Soft polished CGI, romantic animated feature-film look, smooth skin shading, expressive eyes, elegant stylized facial proportions, clean cinematic rendering. The result must look fully animated in the same visual world as the reference, not photorealistic and not like pasted real faces.\n\nRomantic night scene by the water with glowing lanterns floating in the sky and reflected in the water. A magical castle-like background with warm golden lights, dreamy atmosphere, soft cinematic depth. The woman stands in front, looking up at the man with a warm loving expression. The man stands close to her, holding her gently, looking down at her. Preserve the exact pose, body placement, arm positions, distance between them, head tilt, gaze direction, framing, and camera angle from the reference image.\n\nClothing and styling must remain exactly in the same design language as the reference scene: same fantasy-inspired dress, same vest and shirt silhouette, same hair decoration placement, same overall costume shapes, colors, and materials. Background, lanterns, water reflections, lighting, and composition must remain unchanged.\n\nThe faces must be naturally integrated into the animated style, with the same warm lantern glow, soft shadow transitions, and romantic color palette. Hands must be clean and anatomically correct with exactly five fingers on each visible hand, no fused fingers, no extra fingers, no deformations. High detail, cinematic animated rendering, 4K.",
  },
  {
    id: 'tangled-2',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled2.jpg',
    prompt: "Use the uploaded photos of the man and woman as the exact identity references for the two characters in the reference scene. Strictly preserve their recognizable appearance 1:1 — facial structure, proportions, skin tone, eyes, nose, lips, hairstyle, hair color, and hair length must remain clearly recognizable after stylization. The man replaces the male character, the woman replaces the female character.\n\nRender them in the same soft premium 3D animated movie style as the reference. Elegant stylized CGI, warm low-light shading, expressive animated eyes, smooth geometry, polished cartoon realism, feature-film quality. The result must look like the same animated universe as the reference image, not like a face swap and not like realistic people pasted into a cartoon frame.\n\nIntimate quiet night scene in a dark forest setting with warm glowing light coming from below, as if from a lantern or fire. The man is seated slightly forward, relaxed, looking sideways toward the woman with a subtle amused or tender expression. The woman is seated close beside him, leaning toward him with her chin resting on both hands, looking up at him with admiration and affection. Preserve the exact sitting pose, body angles, head tilt, eye direction, spacing between them, hand placement, crop, framing, and camera perspective from the reference image.\n\nKeep the original animated scene composition unchanged: same dark blue night background, same soft warm orange-pink glow on the faces, same costume designs, same hair flow, same body proportions, same environment, same color palette. Clothing must remain in the exact same fantasy-animated style as the reference — same dress silhouette, same vest and shirt shape, same folds, same colors.\n\nFaces must be integrated naturally into the cartoon style with proper light wrapping, soft shadows, and consistent animated materials. No plastic pasted-face effect, no flat overlay, no photorealistic skin. Hands are important: visible fingers must be anatomically correct, exactly five fingers per hand, with clean stylized anatomy and no artifacts. High-end animated CGI, cinematic mood, 4K.",
  },
  {
    id: 'tangled-3',
    style: 'tangled',
    label: 'Tangled',
    image: '/styles/tangled/tangled3.jpg',
    prompt: "Use the uploaded photos of the man and woman as the exact identity references for the two characters in the reference scene. Strictly preserve their recognizable appearance 1:1 — face shape, proportions, age, skin tone, eye shape, eyebrows, nose, lips, hairstyle, hair color, and hair length must remain identifiable even after stylization. The man must replace the male character, the woman must replace the female character.\n\nTransform both into the same stylized 3D animated fairy-tale movie look as the reference image. Premium cartoon CGI, clean smooth rendering, expressive eyes, soft facial shading, polished feature-animation quality. The result must stay fully in the same animated style as the reference, with no photorealistic elements and no pasted-face look.\n\nPlayful tense interaction scene in a castle courtyard. The man is seated and wrapped/restrained by the woman's long hair. The woman leans in toward him from above and to the side, one arm extended, looking directly at him with a firm expressive look. The man looks up at her. Preserve the exact pose, body geometry, head orientation, eye direction, distance between faces, perspective, framing, and camera angle from the reference image.\n\nKeep the entire original scene unchanged: same castle background, same daytime lighting, same pastel fantasy color palette, same rope-like hair wrapping, same dress shape, same vest and shirt design, same environment and composition. Clothing, hair placement, background architecture, and all scene elements must stay in the same animated style and arrangement as the reference.\n\nFace integration must be precise and perspective-correct, matching the original character head angles exactly. No frontal correction, no facial warping, no anatomy drift. Visible hands must be clean and anatomically correct with exactly five fingers, no missing fingers, no extra fingers, no distortion. High-quality stylized 3D animation, cinematic clarity, premium render, 4K.",
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

  // ── Cinderella ──
  {
    id: 'cinderella-1',
    style: 'cinderella',
    label: 'Cinderella',
    image: '/styles/cinderella/cinderella1.jpg',
    prompt: '',
  },
  {
    id: 'cinderella-2',
    style: 'cinderella',
    label: 'Cinderella',
    image: '/styles/cinderella/cinderella2.jpg',
    prompt: '',
  },
  {
    id: 'cinderella-3',
    style: 'cinderella',
    label: 'Cinderella',
    image: '/styles/cinderella/cinderella3.jpg',
    prompt: '',
  },

  // ── Stranger Things ──
  {
    id: 'stranger-things-1',
    style: 'stranger-things',
    label: 'Stranger Things',
    image: '/styles/stranger-things/stranger-things1.png',
    prompt: '',
  },
  {
    id: 'stranger-things-2',
    style: 'stranger-things',
    label: 'Stranger Things',
    image: '/styles/stranger-things/stranger-things2.jpg',
    prompt: '',
  },
  {
    id: 'stranger-things-3',
    style: 'stranger-things',
    label: 'Stranger Things',
    image: '/styles/stranger-things/stranger-things3.jpg',
    prompt: '',
  },

  // ── The End of the F***ing World ──
  {
    id: 'end-of-the-fucking-world-1',
    style: 'end-of-the-fucking-world',
    label: 'The End of the F***ing World',
    image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world1.png',
    prompt: '',
  },
  {
    id: 'end-of-the-fucking-world-2',
    style: 'end-of-the-fucking-world',
    label: 'The End of the F***ing World',
    image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world2.png',
    prompt: '',
  },
  {
    id: 'end-of-the-fucking-world-3',
    style: 'end-of-the-fucking-world',
    label: 'The End of the F***ing World',
    image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world3.png',
    prompt: '',
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
  { id: 'cinderella', name: 'Cinderella', tag: 'Fantasy', description: 'A timeless fairy tale of magic and love', cover: '/styles/cinderella/cinderella1.jpg' },
  { id: 'stranger-things', name: 'Stranger Things', tag: 'Sci-Fi', description: 'Supernatural mystery with 80s nostalgia', cover: '/styles/stranger-things/stranger-things1.png' },
  { id: 'end-of-the-fucking-world', name: 'The End of the F***ing World', tag: 'Drama', description: 'Dark, quirky teen road trip with raw emotion', cover: '/styles/end-of-the-fucking-world/end-of-the-fucking-world1.png' },
];

export function getRefsForCategory(categoryId: string): ReferenceItem[] {
  return references.filter((r) => r.style === categoryId);
}

// ── Diagnostics (runs once on module load) ──
console.log('[REFERENCES] Total loaded:', references.length);
console.log('[REFERENCES] Full table:', references.map(r => ({
  id: r.id,
  image: r.image,
  hasPrompt: !!r.prompt && r.prompt.trim().length > 0,
  promptPreview: r.prompt ? r.prompt.substring(0, 60) + '…' : '(EMPTY)',
})));
references.forEach((r) => {
  if (!r.prompt || r.prompt.trim() === '') {
    console.warn('[REFERENCES] Missing prompt for id:', r.id);
  }
});

