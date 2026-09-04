# MathFun - Design

- **Category:** Learning | **Tier:** Simple | **Status:** Built & deployed (v1.0.6)
- **Stack:** Vanilla HTML/CSS/JS, no build step. **Platform:** mobile-first installable PWA.
- **Licence:** MIT. **Live:** https://isaacgera.github.io/MathFun/

This design is intentionally concise (Simple tier). It reflects the app **as shipped** (built
prototype-first in `prototypes/`, then ported to the app root as v1.0.0 and iterated to v1.0.6).

## 1. Architecture & file layout (as shipped)
No framework, no bundler. ES modules loaded from `index.html`. The shipping app lives at the
`Learning/MathFun/` root; `prototypes/` is kept as the local sandbox (git-ignored, not published).

```
Learning/MathFun/
  index.html            app shell + screens
  styles.css            design tokens + all styling (light/dark)
  js/
    app.js              bootstrap, screen routing, profile flow, theme, wiring
    state.js            profile store + app-level theme; only module touching localStorage
    questions.js        fact pools + near-miss distractor generation; age->difficulty
    game.js             round lifecycle (10 Qs, scoring, Timer)
    rewards.js          stars, streaks, badges logic
    mastery.js          per-fact mastery tracking + grid data (1x-20x)
    sound.js            WebAudio synthesized effects + background music (no files)
    ui.js               DOM render helpers for each screen
    avatars.js          the avatar set (10 characters)
  manifest.webmanifest  PWA manifest
  sw.js                 service worker (network-first; versioned cache)
  icons/                app icons: icon.svg + PNGs (192/512, maskable-512, apple-touch)
  README.md, LICENSE, userguide.html, SPEC-*.md, SESSION-LOG.md
  prototypes/           local sandbox (git-ignored)
```

Module dependency (one direction, no cycles):
`app.js` -> `game.js` -> {`questions.js`, `rewards.js`, `mastery.js`, `state.js`, `sound.js`, `ui.js`}.
`state.js` is the only module that touches `localStorage`.

## 2. Screens (single-page, screen-swap, no router lib)
0. **Who's playing** - profile picker + "Add player". **Setup** - create-profile wizard
   (Name -> Boy/Girl -> Age -> Avatar) / edit summary + all-fields edit.
1. **Home ("Mode")** - difficulty cards (Easy/Medium/Hard) + "Pick a table" (opens a 1-20 dialog),
   Play button, then Timer/Sound/Music On-Off switches in one row. Progress/Rewards/Help live in
   the header profile menu (not on Home).
2. **Play** - progress ("Q4 of 10" + bar), the problem, 4 answer tiles, aria-live feedback,
   optional per-question timer bar.
3. **Results** - score, stars, new best / new badge callouts, Play again / Home.
4. **Mastery grid** - facts 1x-20x coloured + labelled by state (solid / okay / needs work).
5. **Rewards** - badges earned (and locked), streak + personal bests.
6. **Help** - short how-to, version, MIT note.

Persistent header: clickable **logo** (reloads), **theme** toggle, **profile chip** + menu.
Screens are sections toggled via an `.is-active` class; only one visible.

## 3. Data model (localStorage) - as shipped
- **Storage key:** `mathfun_store` (prototype used `mathfunproto_`). Single JSON store blob.
- **Multi-profile** with an app-level theme (theme lives at the store root so it works before any
  profile exists). `schema: 2` (v1 flat blob migrates to a default profile on load).

```jsonc
{
  "schema": 2,
  "theme": "light",              // app-level: 'auto' | 'light' | 'dark' (auto = follow OS on first run)
  "activeId": "p_ab12",
  "profiles": [{
    "id": "p_ab12", "name": "Aarav", "avatar": "\uD83E\uDD8A", "age": 8, "gender": "boy",
    "createdISO": "...",
    "progress": {
      "settings": { "difficulty": null, "table": null, "timed": false, "sound": true, "music": false },
      "bests":    { "easy": 0, "medium": 0, "hard": 0, "table": 0, "longestStreak": 0 },
      "streakDays": { "count": 0, "lastPlayedISO": null },
      "badges":   ["first_perfect"],
      "mastery":  { "7x8": { "attempts": [1,1,0,1,1] } }   // per fact: last <=5 results (1=correct)
    }
  }]
}
```
- `mastery` keyed by canonical fact id `"AxB"` with A<=B (7x8 and 8x7 share one cell).
- `difficulty`/`table` are reset to null on load and on player switch (per-session choice).
- Load path: parse -> fill defaults -> migrate v1 flat blob if present (R7.3, R7.4). No data loss.

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

## 8. Sound & music (sound.js)
- WebAudio API synthesized only (no asset files) - keeps the app tiny and fully offline.
- **Sound effects:** blip for correct, low tone for wrong, arpeggio for reward (gated by Sound toggle).
- **Background music:** a gentle looping pentatonic arpeggio at low volume (gated by Music toggle),
  separate from effects. All feedback is always visual too (R3.4).

## 9. PWA (manifest + sw)
- `manifest.webmanifest`: name "MathFun - Times Tables", short_name "MathFun", `display: standalone`,
  portrait-primary, theme/background from tokens. Icons: raster PNGs (`icon-192.png`,
  `icon-512.png`, a dedicated `icon-maskable-512.png` with safe-zone artwork) declared in the
  manifest, plus `icon.svg` kept as an extra and a 180x180 opaque `apple-touch-icon.png` for iOS
  (v1.0.7). PNGs generated from the SVGs via `icons/generate-icons.html` (a one-time browser helper).
- `sw.js`: **network-first** for same-origin GETs (fresh code online, refresh cache; fall back to
  cache offline) so updates aren't stuck behind a stale cache. Cache name carries the version (R8.4);
  registered only over http(s) (R8.5). `app.js` reloads once on `controllerchange` so new versions apply.

## 10. Accessibility & theming
- Design tokens in `:root`; explicit `[data-theme="light"]` and `[data-theme="dark"]` blocks, with the
  `prefers-color-scheme: dark` media query scoped to auto only (`:root:not([data-theme])`). Theme is a
  two-way Light<->Dark toggle stored app-level (works on every screen); first run follows the OS (R10.1-2).
  Interactive tiles/buttons use an emboss/shrink style with hover behind `@media (hover:hover)` so it
  never "sticks" on touch; the selected state is a flat highlight (not a raised lift).
- Tap targets >=44-48px, visible focus rings, keyboard support (1-4 keys / arrows+Enter to answer), `aria-live="polite"` feedback region, labels on icon buttons, contrast checked both themes (R9).
- Honour `prefers-reduced-motion` - disable/tone-down celebratory animation (R9.4).
- Transitions ~120-200ms ease-out; playful rounded, friendly type (R10.3-4).

## 11. Versioning
- Single `APP_VERSION` constant in `app.js`; `sw.js` VERSION mirrors it and the cache name derives
  from it. Shipped v1.0.0, then patched to **v1.0.6** (theme fix, network-first SW, icon, UI tweaks).
  Changelog in README.

## Deferred to later versions
Other operations (+ - x div), number-pad/typed input, progress export/import, cloud sync,
leaderboards, raster PNG icons. (Keep multi-operation growth aligned with the "Maths Quiz Builder" idea.)
