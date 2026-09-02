# MathFun - Design

- **Category:** Learning | **Tier:** Simple | **Status:** In Progress (v1)
- **Stack:** Vanilla HTML/CSS/JS, no build step. **Platform:** mobile-first installable PWA.
- **Licence:** MIT (added at v1.0.0 port).

This design is intentionally concise (Simple tier). It guides the prototype build and
becomes the source-of-truth design doc when the prototype is ported to v1.0.0.

## 1. Architecture & file layout
No framework, no bundler. ES modules loaded from `index.html`. Built first in a
prototype sandbox, then ported to the app root.

```
Learning/MathFun/
  SPEC-*.md, SESSION-LOG.md, userguide.html      (docs)
  prototypes/                                     (build here first)
    index.html            app shell + PROTOTYPE banner
    styles.css            design tokens + all styling (light/dark)
    js/
      app.js              bootstrap, screen routing, wiring
      state.js            in-memory state + localStorage load/save (namespaced)
      questions.js        question + near-miss distractor generation
      game.js             round lifecycle (10 Qs, scoring, timed mode)
      rewards.js          stars, streaks, badges logic
      mastery.js          per-fact mastery tracking + grid data
      sound.js            WebAudio synthesized tones (no files)
      ui.js               DOM render helpers for each screen
    manifest.webmanifest  PWA manifest (proto name/scope)
    sw.js                 service worker (cache app shell)
    icons/                app icons (proto)
  (on port to v1.0.0: the above moves to Learning/MathFun/ root, plus README.md, LICENSE)
```

Module dependency (one direction, no cycles):
`app.js` -> `game.js` -> {`questions.js`, `rewards.js`, `mastery.js`, `state.js`, `sound.js`, `ui.js`}.
`state.js` is the only module that touches `localStorage`.

## 2. Screens (single-page, screen-swap, no router lib)
1. **Home** - title, difficulty picker (Easy/Medium/Hard), "Pick a table" selector (1-20),
   Beat-the-clock toggle, sound toggle, theme toggle, buttons: Play, Mastery grid, Rewards, Help.
2. **Play** - progress ("Q4 of 10" + bar), the problem (e.g. "7 x 8 = ?"), 4 answer tiles,
   feedback area (aria-live), optional per-question timer bar.
3. **Results** - score (e.g. 8/10), stars earned, new best / new badge callouts, Play again / Home.
4. **Mastery grid** - grid of facts/tables coloured + labelled by state (solid / okay / needs work).
5. **Rewards** - badges earned (and locked), streak + personal bests.
6. **Help/About** - short how-to, version, MIT note (links to userguide).

Screens are sections toggled via a `data-screen` attribute / `.is-active` class; only one visible.

## 3. Data model (localStorage, namespaced)
- **Prototype prefix:** `mathfunproto_`  | **v1 prefix:** `mathfun_`
- Single JSON blob per key `..._state` plus a `..._schema` version int.

```jsonc
{
  "schema": 1,
  "settings": { "difficulty": "medium", "table": null, "timed": false,
                "sound": true, "theme": "auto" },      // table set only in pick-a-table mode
  "bests":    { "easy": 0, "medium": 0, "hard": 0, "longestStreak": 0 },
  "streakDays": { "count": 0, "lastPlayedISO": null },
  "badges":   ["first_perfect", "mastered_7s"],         // ids of earned badges
  "mastery":  { "7x8": { "attempts": [1,1,0,1,1] } }     // per fact: last <=5 results (1=correct)
}
```
- `mastery` keyed by canonical fact id `"AxB"` with A<=B (so 7x8 and 8x7 share one cell).
- Load path: parse -> validate shape -> fill defaults for anything missing (R7.3).
- Migration hook: if stored `schema` < current, run migration map then save (R7.4).

## 4. Question & distractor generation (questions.js)
- **Fact pool** by mode: Easy = tables 1-5, Medium = 1-10, Hard = 1-20, Pick-a-table = chosen row.
  Each factor ranges 1..maxTable (Easy uses 1-5 x 1-10 style range - keep both factors within level cap; final: factors 1..cap).
- **Question:** pick A, B from the pool (weight slightly toward facts with weak/no mastery so practice targets gaps).
- **Correct answer:** A*B.
- **3 near-miss distractors** (R2.3), drawn from candidates then de-duped and filtered != correct:
  - off-by-one multiple: `A*(B+1)`, `A*(B-1)`
  - adjacent product: `A*B +/- A`, `A*B +/- B`
  - common slip: `(A+1)*B`, `A*(B) +/- 1`
  Pick 3 distinct plausible values > 0; if short, top up with small +/- offsets. Shuffle the 4 tiles.

## 5. Round lifecycle (game.js)
- Round = 10 questions (R4.1). Track index, score, current in-round correct streak.
- **Untimed by default**; if Beat-the-clock on, per-question timer (e.g. 8s) counts down; timeout = wrong, reveal correct, advance (R4.3).
- On answer: lock tiles, mark correct/wrong, show feedback (visual + optional tone), update mastery attempt, then Next (auto after short delay or on tap).
- On round end: compute stars, update bests/streaks/badges, go to Results.

## 6. Rewards (rewards.js)
- **Stars:** 3 = 10/10, 2 = 8-9, 1 = 6-7, else 0 (R5.1, confirmed).
- **Streaks:** in-round consecutive-correct milestone cue (e.g. 5 in a row); daily streak via `streakDays` (consecutive calendar days).
- **Badges (v1 set):** `first_perfect` (first 10/10), `mastered_table_N` (all facts in a table solid), `streak_5_days`, `hard_hero` (perfect Hard round). Extensible list.

## 7. Mastery (mastery.js)
- Store last up to 5 results per fact. **Mastered** = >=5 attempts AND >=80% correct (>=4/5) (R6.2, confirmed).
  **Okay** = some attempts but below mastered. **Needs work** = low accuracy or few attempts.
- Grid cell shows state via colour + icon + label (never colour alone, R9.3). Tables mode aggregates facts per row.

## 8. Sound (sound.js)
- WebAudio API synthesized tones only (no asset files) - keeps the app tiny and fully offline (R3.1, confirmed).
- Short pleasant blip for correct, soft low tone for wrong, little arpeggio for reward. All gated by the sound toggle; feedback also always visual (R3.4).

## 9. PWA (manifest + sw)
- `manifest.webmanifest`: name "MathFun", short_name "MathFun", `display: standalone`, portrait-primary, theme/background from tokens, icon set (192/512 + maskable).
- `sw.js`: cache app shell + assets on install (cache-first for shell); **cache name carries version** so a version bump busts old caches (R8.4). Register only over http(s) (R8.5).
- Prototype uses a `-proto` cache name and proto manifest name so it never clashes with v1.

## 10. Accessibility & theming
- Design tokens in `:root` (colours, spacing, radius, shadow, font sizes); dark theme via `prefers-color-scheme` + `[data-theme]` override persisted in settings (R10.1-2).
- Tap targets >=44-48px, visible focus rings, keyboard support (1-4 keys / arrows+Enter to answer), `aria-live="polite"` feedback region, labels on icon buttons, contrast checked both themes (R9).
- Honour `prefers-reduced-motion` - disable/tone-down celebratory animation (R9.4).
- Transitions ~120-200ms ease-out; playful rounded, friendly type (R10.3-4).

## 11. Versioning
- Single `APP_VERSION` constant in `app.js`; prototype = `"1.0.0-proto"`, port to `"1.0.0"`.
- Cache name derives from APP_VERSION. Changelog kept in README at port time.

## Deferred to later versions
Other operations (+ - x div), number-pad/typed input, multiple child profiles, export/import,
cloud sync, leaderboards. (Keep multi-operation growth aligned with the "Maths Quiz Builder" backlog idea.)
