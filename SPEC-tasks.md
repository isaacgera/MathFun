# MathFun - Tasks

- **Tier:** Simple | **Status:** Built (v1.0.0) | **Workflow:** prototype-first, ported to v1.0.0.
- Shipping app at `Learning/MathFun/` root; the sandbox it was built in is kept at `Learning/MathFun/prototypes/`.

## Phase 0 - Kickoff (done)
- [x] Rename idea + folder to MathFun; retitle docs
- [x] Ideas.md row -> In Progress
- [x] Agree build-standards flags (stack, platform, rigour)
- [x] SPEC-requirements.md drafted & approved
- [x] SPEC-design.md written
- [x] Resolve open questions (distractors, timer, stars, mastery, sound, licence=MIT)

## Phase 1 - Prototype scaffold
- [x] Create `prototypes/` structure (index.html, styles.css, js/, manifest, sw.js, icons/)
- [x] App shell with visible PROTOTYPE banner + version `1.0.0-proto`
- [x] Design tokens + light/dark theme + responsive mobile-first layout skeleton
- [x] Screen-swap routing (Home / Play / Results / Mastery / Rewards / Help)

## Phase 2 - Core game
- [x] `state.js` - load/save namespaced state, defaults, schema version, corrupt-data safety (R7)
- [x] `questions.js` - fact pools per mode + near-miss distractor generation + shuffle (R1, R2)
- [x] `game.js` - 10-question round lifecycle, scoring, answer locking, next flow (R4)
- [x] `ui.js` - render Home + Play screens, 4 answer tiles, progress, feedback region (R2, R3)
- [x] Correct/wrong feedback: visual + aria-live, gentle wrong-answer reveal (R3, R9)

## Phase 3 - Modes & rewards
- [x] Difficulty levels (Easy/Medium/Hard) + pick-a-table mode wired to pools (R1)
- [x] Timer (optional per-question countdown, renamed from "Beat the clock") (R4.3)
- [x] `rewards.js` - stars (3/2/1), in-round streak cue, daily streak, badge set (R5)
- [x] `mastery.js` + Mastery grid screen 1x-20x (last-5 >=80% rule, colour+icon+label) (R6)
- [x] Rewards screen (badges, streaks, personal bests) (R5, R6)
- [x] `sound.js` - synthesized tones, gated by sound toggle (R3)

## Phase 4 - PWA & polish
- [x] manifest.webmanifest + icon (R8)
- [x] sw.js app-shell caching, versioned cache name, http(s)-only register (R8)
- [x] Accessibility pass: tap targets, focus, keyboard answering, reduced-motion, contrast both themes (R9)
- [x] Theme toggle persistence + prefers-color-scheme (R10)
- [x] Emboss/shrink buttons + tooltips/ARIA; hover transient (touch-safe); On/Off toggle switches (R10)

## Phase 4b - Profiles & personalisation (added during iteration)
- [x] Multi-profile model with per-profile progress + migration (no data loss)
- [x] Create wizard, one step at a time: Name -> Boy/Girl -> Age (5-15) -> Avatar; no pre-selected defaults
- [x] Header profile chip + menu (Profile / My Rewards / My Progress / Help / Switch player)
- [x] Edit = summary view + all-fields-at-once edit; "Who's playing?" picker
- [x] Pick-a-table opens a 1-20 dialog; difficulty not pre-selected (fresh each session)
- [x] Personalised praise using name + boy/girl term
- [x] Background Music toggle (synthesized loop), separate from Sound
- [x] Avatars trimmed to 10; full question range 1x1..20x20

## Phase 5 - Verify prototype (Isaac)
- [x] Manual Live Server check across modes, timer, rewards, mastery, dark mode, keyboard, sound off
- [x] Isaac sign-off on prototype

## Phase 6 - Port to v1.0.0 & ship
- [x] Copy finalized files from prototypes/ to Learning/MathFun/ root
- [x] Version `1.0.0-proto` -> `1.0.0`; storage prefix `mathfunproto_` -> `mathfun_`; remove PROTOTYPE banner
- [x] Versioned PWA cache name (mathfun-v1.0.0); production manifest name
- [x] Add LICENSE (MIT) + README (with changelog)
- [x] Fill userguide.html (real content, app style) + in-app Help
- [x] Update SESSION-LOG.md; tick SPEC-tasks; set Ideas.md -> Built (MathFun v1.0.0)
- [ ] Deploy to static host (GitHub Pages / Netlify) + verify hosted PWA  *(Isaac)*

## Nice-to-have / later
- [ ] Store-quality raster icons (192 / 512 / maskable PNGs) - currently a single SVG
- [ ] Other operations (+, -, x) - keep aligned with the "Maths Quiz Builder" backlog idea
- [ ] Optional export/import of a child's progress
