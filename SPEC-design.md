# MathFun - Design

- **Category:** Learning | **Tier:** Simple | **Status:** Shipped v1.3.0 (Add/Sub/Mul/Div + Fun Facts + Daily Challenge + Character Themes)
- **Stack:** Vanilla HTML/CSS/JS, no build step. **Platform:** mobile-first installable PWA.
- **Licence:** MIT. **Live:** https://isaacgera.github.io/MathFun/

This design is intentionally concise (Simple tier). Sections 1-11 reflect the multiplication app
(v1.0.x). **Section 12 covers v1.1** (operations + Add/Sub, Division stubbed). **Section 13 covers
v1.2** (Division built, Fun Facts, Daily Challenge, hints, context-aware progress, per-context
music, age stepper), built prototype-first and **now ported and shipped as v1.2.0**.

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

## 12. v1.1 - Operations (in progress, prototype)
Extends the game from multiplication-only to a four-operation picker, adding full Addition &
Subtraction and stubbing Division. Built in `prototypes/` (version `1.1.0-proto`,
storage `mathfunproto_`); ported to the shipped app only after Isaac verifies.

### 12.1 New module `operations.js`
A single source of truth for per-operation behaviour, so `questions.js`/`game.js`/`ui.js` stay
generic and just ask the active operation for what they need.

```js
OPERATIONS = {
  mul: { key:'mul', symbol:'\u00D7', name:'Multiplication', playable:true,
         levels:['easy','medium','hard','table'], generate(mode, mastery), ... },
  add: { key:'add', symbol:'+',      name:'Addition',       playable:true,
         levels:['easy','medium','hard','superhard'], generate(mode), ... },
  sub: { key:'sub', symbol:'\u2212', name:'Subtraction',    playable:true,
         levels:['easy','medium','hard','superhard'], generate(mode), ... },
  div: { key:'div', symbol:'\u00F7', name:'Division',       playable:false /* coming soon */ },
}
```
- `mul.generate` reuses the existing `questions.js` pool + near-miss logic unchanged.
- `add`/`sub` generate operands within the level's number range (below) and build four options.
- Difficulty **level sets are operation-specific** (mul keeps `table`; add/sub use `superhard`).

### 12.2 Difficulty ranges for + / - (R11.4, R11.5)
| Level | Digits | Max operand | Notes |
|---|---|---|---|
| Easy | single | 10 | operands 1-9 (sum may reach ~18 for add) |
| Medium | two | 100 | operands up to 99 |
| Hard | three | 1000 | operands up to 999 |
| Super Hard | four | 10000 | operands up to 9999 |

- **Addition:** pick `a`, `b` within the level range; `correct = a + b`.
- **Subtraction:** pick two in range, order so `a >= b`; `correct = a - b` (never negative, R11.5).

### 12.3 Distractors for + / - (R11.7)
Believable near-misses drawn from: `correct +/- 1`, `correct +/- 10`, `correct +/- a-single-digit`,
and a carry/borrow-style slip (e.g. off by 10 or by 2). De-dupe, drop <= 0 and any equal to
`correct`, keep 3, top up with small offsets if short, then shuffle the 4 tiles (mirrors sec 4).

### 12.4 Data model change (schema 2 -> 3, per-operation progress; R11.8)
Progress becomes keyed by operation. Migration wraps the existing flat `bests`/`mastery` into
`ops.mul` so no data is lost; `badges` and `streakDays` stay profile-level (shared across ops).

```jsonc
"progress": {
  "settings": { "operation": null, "difficulty": null, "table": null,
                "timed": false, "sound": true, "music": false },
  "ops": {
    "mul": { "bests": { "easy":0,"medium":0,"hard":0,"table":0 }, "mastery": { "7x8": {"attempts":[1,1,0,1,1]} } },
    "add": { "bests": { "easy":0,"medium":0,"hard":0,"superhard":0 }, "rounds":0, "answered":0, "correct":0 },
    "sub": { "bests": { "easy":0,"medium":0,"hard":0,"superhard":0 }, "rounds":0, "answered":0, "correct":0 },
    "div": { "bests": {}, "rounds":0, "answered":0, "correct":0 }
  },
  "bestsLongestStreak": 0,
  "streakDays": { "count":0, "lastPlayedISO":null },
  "badges": ["first_perfect"]
}
```
- `getState()` stays for compatibility; new helpers `getOpProgress(opKey)` / `setOperation(key)`
  expose the active operation's slice. `operation`/`difficulty`/`table` all reset on load & switch.
- `mastery.js` records **only for `mul`** (A x B facts). `add`/`sub`/`div` accumulate simple
  round/accuracy stats instead.

### 12.5 New screen + routing (R11.1, R11.2)
- **Operations picker** (`#screen-ops`): four tiles (＋ － ✕ ÷). `div` renders a "Coming soon"
  state (disabled, badge). Sits between "profile chosen" and the Mode screen.
- Flow: `Who's playing` -> **Operations** -> `Mode (Home)` -> `Play` -> `Results`.
  The Mode screen gains a back arrow to Operations; the header logo still reloads to the start.
- Mode screen is **operation-aware**: it reads the active operation's `levels` and labels;
  Pick-a-table only shows for `mul`; the mode tag on Play shows the operation symbol.

### 12.6 Progress views (R11.9)
- **Multiplication:** the existing A x B mastery grid, unchanged.
- **Addition/Subtraction:** a compact per-operation **summary** (rounds played, best score per
  level, overall accuracy). Reached from the profile menu; shows the summary for the active
  operation (with a note when a grid isn't applicable).

### 12.7 Versioning (shipped)
Built in the prototype at `1.1.0-proto`, then ported to the app root and shipped as **v1.1.0**
(`APP_VERSION` 1.1.0, `sw.js` cache `mathfun-v1.1.0`, storage stays `mathfun_`; schema-3 migration
runs on first load). The port preserved the shipped app's app-level theme (`state.getTheme/setTheme`
+ delegated toggle) rather than the prototype's per-settings theme, so the v1.0.5 theme fix is not
regressed.

## 13. v1.2 - Division, Fun Facts, Daily Challenge + polish (shipped v1.2.0)
Built prototype-first (`1.2.0-proto`), then ported to the app root. Preserves the shipped
`mathfun_` storage, app-level theme and network-first SW; adds the following.

### 13.1 Division (operations.js)
`div.playable = true`, `levels: ['easy','medium','hard','table']`, `usesGrid:false`. Questions are
built as the **inverse of the tables**: pick a divisor and quotient, multiply for the dividend, so
`dividend / divisor = quotient` is always exact (no remainders). Factor caps: Easy 5, Medium 10,
Hard 20; **Pick a number** divides by the chosen 1-20 (quotient 1-20). Distractors are near-miss
quotients (off-by-one, the divisor, small +/- ), never <=0. `hintFor` frames it as "how many Ns
make M?" and starts the skip-count.

### 13.2 Fun Facts (funfacts.js + #screen-funfacts)
A new module holding **100** `{emoji, text}` facts. `randomFact()` / `anotherFact(prev)` pick a
(different) fact. `ui.renderFunFacts` shows one with an "Another fact" button; `updateFunFact`
swaps it in place with a pop. Fully local/offline (R7.2) - no network. Reached from a picker tile.

### 13.3 Daily Challenge
`generateChallengeQuestion()` picks a random playable operation + non-table level per question and
tags `q.op`. `game.nextQ` routes through it when `round.mode.challenge` is set. `startDailyChallenge`
runs an untimed 10-question mixed round. `rewards.finishRound` **skips** per-operation
bests/mastery/accuracy for a challenge (guarded by `isChallenge`) but still counts the daily streak
and the perfect-round badge. Results "Play again" restarts the challenge; Home returns to the picker.

### 13.4 Need a Hint? (untimed only)
`app.js` schedules a `setTimeout` (7s) on each question when Timer is off; on fire it reveals an
animated hint button (`ui.showHintButton`). Tapping shows `hintFor(question, opKey)` via
`ui.showHintText`. The hint timer is cleared on answer, timeout, round end and quit; it never runs
in Timer mode. Hints give a per-operation method + first step, not the final answer.

### 13.5 Context-aware My Progress
`renderProgressScreen` checks `settings.operation`: if none is set this session it renders
`ui.renderProgressOverview` (a card per playable operation - rounds, accuracy, best - each drills
into detail); if one is set it renders that operation's `ui.renderProgress`. **All operations now
use the same summary layout** (rounds / accuracy / best per level); multiplication additionally
appends the A x B mastery grid. To support this, multiplication now also accumulates
`rounds/answered/correct` (added to `defaultMulProgress`; recorded via `recordOpRound` for every
operation except the challenge).

### 13.6 Per-context music (sound.js)
The single loop is replaced by a `TUNES` registry keyed by context (`mul/add/sub/div/facts/daily`),
each with its own `LEAD`, `BASS`, lead waveform and tempo. `startMusic(tuneKey)` switches tunes
(no-op if already playing that tune). `app.js` `playTune(key)` plays the context tune when Music is
on and remembers `lastTune` so the menu Music toggle resumes the right one. **Music defaults on**
(`settings.music: true`) for new profiles; existing users keep their saved preference.

### 13.7 Sound controls in the player menu
Timer / Sound / Music toggles moved from the Mode screen into the header profile menu as a compact
three-across icon row (`renderProfileChip` takes `settings` + `onTimed/onSound/onMusic`); the
switches toggle in place without closing the menu.

### 13.8 Age stepper (ui.js)
`ageStepperMarkup` + `wireAgeStepper`: a single editable number box (default **5**) flanked by
- / + buttons; typing or the buttons clamp to **0-100** (`AGE_MIN`/`AGE_MAX`), so it can never go
negative or above 100. Replaces the earlier 5-15 tile grid in both create and edit.

### 13.9 Layout / mobile
Option tiles are a fixed **2x3** grid (`.op-grid` = 2 capped columns, centred, width-limited),
squarish and short. The header uses `nowrap`; at <=560px Theme/Home become icon-only and the
brand wordmark hides (the clickable logo mark stays), keeping everything on one line.

### 13.10 Versioning (shipped)
`APP_VERSION` 1.2.0; `sw.js` VERSION 1.2.0 (cache `mathfun-v1.2.0`) with `funfacts.js` added to the
precache; manifest description updated. Storage stays `mathfun_` (schema-3 migration unchanged -
no data loss; multiplication mastery/bests preserved, new counters start at 0).

## 14. v1.3 - Character themes + footer (shipped v1.3.0)
Built prototype-first (`1.3.0-proto`), then ported to the app root. Preserves the shipped
`mathfun_` storage, **app-level light/dark theme** and network-first SW; adds the following.

### 14.1 Themes registry (themes.js)
New module: 10 trademark-safe themes (`math` default + plumber/dino/hedgehog/magic/space/ocean/
jungle/candy/robot). Each declares a display name, emoji, tagline, `tune` key, per-op tile emoji
(`ops`), Fun Facts/Daily Challenge tab emoji (`tabs`), a `hintIcon`, and an on-theme `avatars`
array. Helpers: `getTheme`, `opEmoji`, `tabEmoji`, `hintIcon`, `themeAvatars` (own + neutral
`FALLBACK_AVATARS`, de-duped), `randomThemeAvatar(key, avoid)`.

### 14.2 Skin as a parallel axis (styles.css)
Applied via **`data-skin="<key>"` on `<html>`**, independent of `data-theme="light|dark"`. Each
skin re-points the core palette tokens (`--brand/--brand-2/--accent/--bg/--surface/--surface-2/
--border`) + a `--skin-bg` page background and a `--skin-pattern` (an inline SVG emoji tile,
offline). Because skins only change token VALUES, the light/dark blocks still layer on top - dark
re-darkens surfaces after the skin sets accents, so every theme has a light and a dark form.

### 14.3 Per-profile skin (state.js)
`settings.skin` (default `'math'`), per profile, with `getSkin`/`setSkin`. `newProfile` carries a
chosen skin; `resetActiveProgress` preserves it. `fillDefaults` backfills `skin:'math'` for existing
profiles and through the schema-2->3 migration - **no data loss**. The **app-level light/dark
theme** (`store.theme` + `getTheme`/`setTheme`) is unchanged (v1.0.5 guard preserved).

### 14.4 Apply + change (app.js)
`applySkin(key)` sets `data-skin`, calls `sound.setThemeTune(key)` and updates the PWA theme-color
meta. Applied on **boot** (Math World before any profile, since `getSkin()` returns defaults),
on **profile choose**, and **live** via `openThemePicker` (menu). Picking a theme in-play also
assigns a random on-theme avatar, restarts the theme's music, and calls `refreshCurrentScreen()`
(which is a **no-op while the Play screen is active**, so a live round is never dropped).

### 14.5 Theme picker (ui.js)
Create wizard steps are now **name -> gender -> age -> theme -> avatar** (theme before avatar so
the avatar grid shows that theme's characters; `onPreviewSkin` previews live). A `renderThemeDialog`
modal is opened from the player-menu **Theme** item. Avatar grids (create + edit) use
`themeAvatars(skin)`.

### 14.6 One tune per theme (sound.js)
The per-context `TUNES` + flavour layer is replaced by **one composed tune per theme** (distinct
melody/bass/waveform/tempo), played across all operations while that theme is active. Routed through
a dedicated gain + `DynamicsCompressor` **limiter bus** with a high `MASTER` so it's clearly audible
without clipping. `setThemeTune(key)` switches live; `startMusic()` ignores its arg (theme decides).

### 14.7 Footer + layout
An app-wide `<footer class="app-footer">` ("Powered by Forje" + copyright) sits outside `<main>`,
shown on every screen. Short screens centre in the viewport; tiles scale up on tablet/laptop
(option tiles 3x2 on wide screens); the theme/table(1-20)/avatar pickers are responsive
(`.modal-wide`, auto-fit grids) so all options show without scrolling; `.chip-menu` uses
`overflow: hidden auto` so items never clip.

### 14.8 Versioning (shipped)
`APP_VERSION` 1.3.0; `sw.js` VERSION 1.3.0 (cache `mathfun-v1.3.0`) with `themes.js` added to the
precache; manifest description updated. Storage stays `mathfun_`; the top-right header cluster
(theme toggle + `headerHomeBtn` + profile chip) was ported carefully - `headerHomeBtn` id kept to
avoid the historical clash with the Results screen's `homeBtn`.

## Deferred to later versions
Number-pad/typed input, progress export/import, cloud sync, leaderboards, more fact-flavoured
challenge questions. (Keep multi-operation growth aligned with the "Maths Quiz Builder" idea.)
