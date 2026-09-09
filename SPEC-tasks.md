# MathFun - Tasks

- **Tier:** Simple | **Status:** Shipped v1.2.0 (Add/Sub/Mul/Div + Fun Facts + Daily Challenge) | **Workflow:** prototype-first.
- **Live:** https://isaacgera.github.io/MathFun/
- Shipping app at `Learning/MathFun/` root; the sandbox it was built in is kept at `Learning/MathFun/prototypes/` (git-ignored, not published).

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
- [x] Deploy to GitHub Pages + verify hosted PWA over HTTPS -> https://isaacgera.github.io/MathFun/

## Phase 7 - v1.1: operations (SHIPPED v1.1.0)
Built prototype-first in `prototypes/` (`1.1.0-proto`), verified by Isaac, then ported to the app root.
- [x] SPEC updates for v1.1 (requirements R11, design sec 12, this tasks phase)
- [x] `state.js` - per-operation progress; migrate flat bests/mastery -> `ops.mul` (schema 2 -> 3, no data loss); `operation` in settings; `getOpProgress`/`setOperation` (R11.8, R7.4)
- [x] `operations.js` - per-operation config (symbol, level set, ranges, generate + distractors); mul reuses existing logic; add/sub full; div stub (R11.3-R11.7)
- [x] `questions.js`/`game.js` - route generation through the active operation; mastery records mul only; add/sub accumulate round stats
- [x] `ui.js`/`app.js` - Operations picker screen (＋ － ✕ ÷, div "coming soon"); operation-aware Mode screen; nav history stack (back = previous screen); header Home button; per-op progress summary for +/- (R11.1, R11.2, R11.9)
- [x] `index.html`/`styles.css` - `#screen-ops` markup + emoji tile styles; prototype `1.1.0-proto`; sw cache bump
- [x] Prototype Help copy updated for operations + new levels
- [x] Isaac verified via Live Server (operations, +/- ranges, subtraction non-negative, migration, nav, emoji tiles, music, empty-name fix)
- [x] Port to shipped app: `APP_VERSION` 1.1.0, cache `mathfun-v1.1.0`, storage `mathfun_` (schema-3 migration); preserved app-level theme; README changelog + userguide + SPEC status; manifest name/description; Ideas.md -> Built (MathFun v1.1.0)
- [x] Deploy (Isaac pushed via GitHub Desktop) + verified on the hosted site - v1.1.0 live

## Phase 8 - v1.2: Division, Fun Facts, Daily Challenge + polish (PORTED, awaiting deploy)
Built prototype-first in `prototypes/` (`1.2.0-proto`) over several feedback rounds, verified by
Isaac on Live Server, then ported to the app root as **v1.2.0**.
- [x] **Division** built fully in `operations.js` - whole-number division as the inverse of the
      tables (answers always exact); Easy/Medium/Hard (factor caps 5/10/20) + **Pick a number**
      (divide by a chosen 1-20); believable near-miss distractors; `div.playable = true`
- [x] **Fun Facts** - new `funfacts.js` with 100 local, offline facts; `#screen-funfacts` + a
      Fun Facts tile; "Another fact" with a pop animation (fully local, no network)
- [x] **Daily Challenge** - `generateChallengeQuestion` (random playable op + level per question);
      a mixed 10-question round that counts the daily streak but not per-operation bests/mastery
- [x] **Need a Hint?** - untimed mode only; after 7s an animated hint button reveals a
      per-operation tip (`hintFor` in `operations.js`)
- [x] **My Progress reworked** - context-aware: all-operations overview before an operation is
      picked, that operation's detail once in one; multiplication now shows the same
      rounds/accuracy summary as the others, with the A x B mastery grid kept below
- [x] **Per-context music** - `sound.js` holds a distinct tune per operation, Fun Facts and Daily
      Challenge; `playTune`/`lastTune` in `app.js`; **music on by default** for new players
- [x] **Sound controls moved** into the player menu (compact icon row: Timer / Sound / Music)
- [x] **Age selector** - single colourful stepper (default 5, - / + or type), range 0-100
- [x] **Layout/mobile** - fixed 2x3 option tiles (squarish, capped width); single-line mobile
      header with icon-only Theme/Home
- [x] `state.js` - `music:true` default + multiplication `rounds/answered/correct` stats;
      kept `mathfun_` prefix + app-level theme + schema-3 migration (no data loss)
- [x] Port to shipped app: `APP_VERSION` 1.2.0, cache `mathfun-v1.2.0`, precache `funfacts.js`;
      README changelog + userguide + SPEC status; manifest description; Ideas.md -> Built (v1.2.0)
- [x] All 15 live files pass diagnostics (zero errors)
- [ ] Isaac: deploy (GitHub Desktop) + verify on the hosted site
- [ ] (Later) Division fully verified on device; optional fact-flavoured challenge questions

## Nice-to-have / later
- [x] Store-quality raster icons (192 / 512 / maskable PNGs) + iOS apple-touch icon (v1.0.7);
      generated from the SVGs via `icons/generate-icons.html`
- [ ] Optional export/import of a child's progress
