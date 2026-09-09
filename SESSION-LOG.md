# MathFun - Session Log

- **Category:** Learning
- **Complexity tier:** Simple
- **Status:** Shipped & deployed v1.1.0 (Addition, Subtraction & Multiplication; Division "coming soon") - https://isaacgera.github.io/MathFun/
- **Live:** https://isaacgera.github.io/MathFun/
- **Description:** Playful maths game for kids 5-15. Multiplication 1x-20x shipped; v1.1 adds an operation picker (＋ － ✕ ÷) with full Addition & Subtraction (Division coming next). Multi-profile, difficulty levels + pick-a-table, multiple-choice with near-miss distractors, personalised feedback, stars/streaks/badges, mastery grid, sound + music.
- **Scope (v1):** 3 difficulty levels (Easy 1-5, Medium 1-10, Hard 1-20) + pick-a-table (1-20); 10-question rounds (untimed default + optional Timer); 4-option multiple choice; per-profile rewards, personal best, mastery grid 1x-20x; local-first, mobile-first installable PWA.

---

## Scaffold - 31 Aug 2026
Placeholder folder + docs created from the Ideas backlog (as "Times Tables Trainer").
No build work yet.

## Kickoff & rename to MathFun - 02 Sep 2026
Picked up the "Times Tables Trainer" idea and reshaped it into **MathFun**.
- Renamed the idea and the project folder (`Learning/Times Tables Trainer` -> `Learning/MathFun`); retitled all docs.
- `Ideas.md` row renamed to MathFun, description/scope refreshed, status moved Idea -> In Progress.
- **Agreed build-standards flags:**
  - **Scope:** multiplication times tables only for v1 (1x-20x); name kept broad ("MathFun") so +/-/div can be added later. Note: a separate "Maths Quiz Builder" idea already exists in the Medium tier - watch for overlap when extending.
  - **Audience:** school kids 6-10, fun-first (playful theme, encouraging feedback, stars/streaks/badges, animations, optional sound).
  - **Input:** 4-option multiple choice, tap to answer; distractors are believable near-misses (not random).
  - **Rounds:** 10 questions, untimed by default, optional "Beat the clock" timed mode.
  - **Difficulty:** Easy (1-5), Medium (1-10), Hard (1-20) + pick-a-specific-table mode.
  - **Rigour:** Simple tier - tidy modular vanilla code, design tokens, accessibility, no heavy CI/tests.
  - **Stack:** Vanilla HTML/CSS/JS, no build step (fits the no-build / Live Server workflow).
  - **Platform:** Installable PWA, mobile-first (phone + tablet primary); scales up to desktop/TV.
  - Considered **Flutter** for native/app-store reach; decided against for v1 - a PWA delivers the full install/offline/touch experience without the toolchain/app-store overhead. Revisit only if MathFun is ever published for a wide audience.
- **Next:** draft SPEC-requirements.md for review, then design + tasks, then build.

## Full build, iteration & v1.0.0 port - 02 Sep 2026
Built MathFun end to end in one session, prototype-first, then ported to a shipping v1.0.0.

**Specs:** wrote and approved SPEC-requirements.md (R1-R10 + non-functional), then a concise
SPEC-design.md (module layout, localStorage data model, generation/rewards/mastery/sound/PWA/a11y)
and SPEC-tasks.md (phased plan).

**Prototype** (`prototypes/`, `1.0.0-proto`, storage `mathfunproto_`, visible banner): vanilla
HTML/CSS/JS, no build step. Modules: app, state (only localStorage toucher), questions, game,
rewards, mastery, sound, ui, avatars. Iterated with Isaac over several rounds:
- Multi-profile added (name / boy-girl / age 5-15 / avatar), each with its own progress; migration keeps old data.
- Create flow became a one-step-at-a-time wizard (Name -> Gender -> Age -> Avatar) with **no pre-selected defaults** (must choose).
- Edit split from create: a summary card + all-fields-at-once edit.
- Header profile chip + menu (Profile / My Rewards / My Progress / Help / Switch player); redundant home tabs removed.
- Pick-a-table moved to a 1-20 dialog; difficulty is **not** persisted - fresh pick each reload/switch.
- Timer/Sound/Music as On/Off toggle switches in one row, Play button above them.
- Background Music (synthesized loop) added, separate from Sound effects.
- Full range 1x1..20x20; mastery grid extended to 20x20.
- Personalised praise using the child's name + boy/girl term.
- WealthOrah-style embossed/shrink buttons + tooltips/ARIA; hover made transient (touch-safe) so selections don't look "stuck".
- Avatars trimmed to 10.
- Fixed a distractor-generation fallback bug early on.

**Port to v1.0.0** (app root): copied js/, icons/, styles.css verbatim; wrote production
index.html (no banner), sw.js (cache `mathfun-v1.0.0`), manifest ("MathFun - Times Tables");
`APP_VERSION` -> `1.0.0`; storage prefix -> `mathfun_`. Added **LICENSE (MIT)**, **README** (with
changelog), and a real **userguide.html** in the app style. Ticked SPEC-tasks; set `Ideas.md` row
to **Built (MathFun v1.0.0)**. All root files pass diagnostics with zero errors.

**Verification note:** browser/Node testing can't run in this Windows/Kiro shell (node not on PATH;
terminal mangles quoted-path commands). Isaac verified the prototype manually via Live Server and
signed off. The shipping root build is a faithful copy of that prototype with only the documented
production edits.

**Open / next:**
- **Deploy** to GitHub Pages / Netlify and verify the hosted PWA over HTTPS (Isaac).
- **Mobile testing** on hotspot: use the *Wireless LAN adapter WiFi* IPv4 (e.g. 172.20.10.7), not
  the `172.27.x` vEthernet (Hyper-V) address; allow the Live Server port through Windows Firewall.
  Full install/offline needs HTTPS (Port Forwarding or the deployed URL).
- **Icons:** currently a single SVG; generate 192/512/maskable PNGs for best install icon quality.
- Future: other operations (+/-/x) - align with the "Maths Quiz Builder" backlog idea.

## Deployed to GitHub Pages - 02 Sep 2026
Isaac published the app to GitHub via GitHub Desktop and enabled Pages.
- **Live URL:** https://isaacgera.github.io/MathFun/
- Repo excludes `prototypes/` (added to `.gitignore`) so only the shipping app + docs are published.
- Verified the site serves over HTTPS: index.html loads with the real app content; js/app.js
  serves as application/javascript and manifest.webmanifest as application/manifest+json (both 200,
  correct MIME types) - so the PWA installs and runs offline. Version footer fills in via JS at runtime.
- README updated with a "Live demo" link; SPEC-tasks Deploy item ticked.
- **v1.0.0 is complete and live.** Remaining nice-to-haves only: store-quality PNG icons; future
  operations (+/-/x) aligned with the "Maths Quiz Builder" backlog idea; optional progress export/import.

## Bug fix: theme toggle on dark-OS devices - v1.0.1 - 02 Sep 2026
Isaac reported the Light/Dark/Auto switch didn't work on the GitHub Pages site / installed
mobile app, though it was fine on Live Server.
- **Root cause:** the light path had no explicit `[data-theme="light"]` token block, and the
  OS-dark media query used `:root:not([data-theme="light"])` (specificity 0,2,0) which could
  out-rank/interfere with the manual choice on a dark-OS device. On a light-OS PC (Live Server)
  the media query never fired, so the bug was invisible there - hence "works locally, not deployed".
- **Fix (styles.css):** made theme selection explicit and specificity-proof - added a full
  `[data-theme="light"]` block, kept `[data-theme="dark"]`, and scoped the `prefers-color-scheme: dark`
  media query to Auto only via `:root:not([data-theme])`. app.js theme logic already matched
  (auto = remove attribute; light/dark = set it).
- **Release:** bumped `APP_VERSION` and sw.js cache to **1.0.1** so the fix reaches installed
  PWA users (old cache is purged on activate). Updated README changelog and userguide footer.
- Verified deployed styles.css matched local before the fix (ruled out a stale-deploy mismatch);
  all changed files pass diagnostics.
- **To ship:** commit + push via GitHub Desktop; installed users get it on next launch once the
  new service worker activates (may take one reload).

## Theme still not switching - stale-cache fix - v1.0.2 - 02 Sep 2026
Isaac reported the theme toggle still didn't switch after v1.0.1.
- **Investigation:** fetched the live styles.css - it **already contained** the v1.0.1
  `[data-theme="light"]` fix, so the push had landed and the CSS + JS theme logic are correct.
  Concluded the remaining cause is a **stale service-worker cache**: the old cache-first SW
  kept replaying the previous bundle on the hosted/installed PWA, so the device never ran the
  fixed code even though the server had it. (Classic PWA update trap; a cache-first SW only
  updates after the new worker activates, which can need >1 reload.)
- **Fix:**
  - `sw.js` rewritten to **network-first** for same-origin GETs (fetch fresh + refresh cache
    when online; fall back to cache offline, with index.html as navigation fallback). Cross-origin
    requests pass through untouched. Offline still works.
  - `app.js` service-worker registration now calls `reg.update()` on load and reloads once on
    `controllerchange`, so a new version takes over and applies without manual cache clearing.
  - Version bumped to **1.0.2** (APP_VERSION + sw cache `mathfun-v1.0.2`); README changelog +
    userguide footer updated.
- **Diagnostic test suggested to Isaac:** open the live URL in an incognito window (bypasses
  cache/SW) to confirm the code is correct vs a caching issue.
- **To ship:** commit + push via GitHub Desktop. First load after deploy fetches the new SW;
  because the strategy is now network-first, subsequent updates apply on reload. On the installed
  app, close/reopen once so the 1.0.2 worker activates.

## Theme toggle - real root cause & rework - v1.0.3 - 02 Sep 2026
Isaac confirmed the toggle failed **in incognito too** - which ruled out caching (my v1.0.2
theory) and proved it was a code/UX bug. Diagnosed properly this time.
- **Root cause:** the button cycled **auto -> light -> dark**, and the default was `auto`.
  On a light-OS device (Isaac's PC/incognito, and phone in light mode) "auto" and "light" render
  **identically**, so the first tap produced no visible change and read as "broken". The CSS/JS
  were technically correct; the three-way cycle with an OS-dependent "auto" was the problem.
- **Fix (app.js):** reworked to a **two-way Light <-> Dark toggle**. `resolveTheme()` maps any
  legacy/auto/empty value to the current OS preference; `applyTheme` now *always* sets an explicit
  `data-theme` (never relies on the OS after first use); `cycleTheme` flips light<->dark; the button
  shows the theme it will switch TO. First run still follows the device via `matchMedia`.
- **Kept** the v1.0.2 network-first SW + auto-reload (still the right call for future updates).
- Version bumped to **1.0.3** (app.js + sw cache). README changelog, userguide footer + themes
  copy updated (no more "Auto/Light/Dark").
- **Lesson:** "works on Live Server, not deployed" was a red herring driven by light-OS vs dark-OS
  rendering of identical auto/light states, not the environment. The incognito test was the tell.
- **To ship:** commit + push via GitHub Desktop; new network-first SW means it applies on reload.

## Icon refresh + wording - v1.0.4 - 02 Sep 2026
Two pre-push tweaks requested by Isaac:
- **App icon** (`icons/icon.svg`) redesigned to be brighter/funnier: multi-stop gradient
  (purple->pink->amber), a chunky white multiplication cross with a **smiley face** in the centre,
  and confetti dots. Reads as a fun character rather than a plain "X".
- **Setup heading** "Create your player" -> "Create your profile" (ui.js `renderSetup`).
- Version bumped to **1.0.4** (app.js + sw cache) so the new icon refreshes on installed devices
  (icons cache aggressively). README changelog + userguide footer updated.
- Header text brand mark left as the small "x" - separate from the app icon; can revisit if wanted.
- **Not yet pushed:** local is v1.0.4; the live GitHub Pages site is still the original v1.0.0
  bundle. Everything since (theme fix v1.0.1-1.0.3, network-first SW, icon/wording v1.0.4) ships
  on the next GitHub Desktop commit + push.

## Theme toggle - ACTUAL root cause found & fixed - v1.0.5 - 02 Sep 2026
Isaac's sharp observation cracked it: the toggle **works once a profile is created and playing,
but not on the profile-creation / who's-playing screens**.
- **Root cause:** theme was stored **per-profile** (`progress.settings.theme`). On the setup/who
  screens there is **no active profile yet**, so `updateSettings()` early-returned (no save) and
  `getState()` returned a fresh default each call, the toggle couldn't persist or compute a real
  next value, so it appeared dead. Once a profile existed, the per-profile path worked - exactly
  matching the symptom. (All my earlier CSS/cache/cycle theories were wrong; this screen-specific
  clue was the key.)
- **Fix:**
  - state.js: theme is now **app-level** on the store root (`store.theme`), with `getTheme()` /
    `setTheme()`. `defaultStore()` seeds `theme:'auto'`; `fillDefaults` migrates existing stores.
  - app.js: `cycleTheme`, `applyTheme`, `init`, `afterProfileChosen` now use `getTheme/setTheme`
    instead of the per-profile settings. Kept the two-way light<->dark toggle and the delegated
    click binding.
- **Icon on early screens:** the header brand mark now uses `./icons/icon.svg` (was a hardcoded
  text "x"); the old look on setup/who was that stale hardcoded mark + cached paint. Now consistent
  everywhere after a hard refresh.
- Version bumped to **1.0.5** (app.js + sw cache); README changelog + userguide footer updated.
- **Still pending push:** live site is v1.0.0; this + all prior fixes ship on the next
  GitHub Desktop commit + push. Hard-refresh (Ctrl+Shift+R) after deploy.

## UI tweaks - v1.0.6 - 02 Sep 2026
Three small requests from Isaac:
- Home heading "Pick how to play" -> **"Mode"** (ui.js renderHome).
- Theme toggle now has **aria-label + title tooltip** stating the theme a tap switches to
  (updateThemeButton sets both; static button in index.html seeded with title too).
- **Logo is now clickable** - the top-left MathFun icon+name is a `<button id="brandHome">`
  that calls `location.reload()` (acts as a refresh). Styled as a button reset with hover/active/
  focus states; brand-mark uses the icon.svg.
- Version bumped to **1.0.6** (app.js + sw cache); README changelog + userguide footer updated.
- Still pending push (live = v1.0.0).

## Pushed & live - v1.0.6 - 02 Sep 2026
Isaac committed + pushed all pending changes via GitHub Desktop. Verified the live
GitHub Pages CSS now contains the full current build ([data-theme] light/dark theme fix,
.toggles-row, table-tile, emboss styling) - so v1.0.1->1.0.6 are all deployed.
- **Live & current:** https://isaacgera.github.io/MathFun/ (v1.0.6).
- Session end. Everything built, documented and deployed.

## Wrap-up & next-session direction - 02 Sep 2026
Closed out the session with docs fully aligned to shipped v1.0.6:
- Ideas.md version tag corrected to Built (MathFun v1.0.6).
- SPEC-requirements.md + SPEC-design.md updated to match the app as shipped (multi-profile,
  age 5-15, Timer, Sound+Music, two-way app-level theme, network-first SW, SVG icon, "Mode" screen,
  resolved decisions, added R0 profiles requirement).
- Note: these SPEC/Ideas doc edits are local only - not yet pushed to GitHub (docs don't affect the
  running app; push at leisure via GitHub Desktop to keep the repo's docs current).

**Next session:** extend MathFun beyond multiplication to add **Addition, Subtraction and Division**
(the reason the name was kept broad). Likely a v1.1/v2:
- Add an operation picker (x / + / - / div) alongside difficulty.
- Generalise question + near-miss distractor generation per operation (e.g. division as inverse of
  the tables; sensible ranges for +/- by age/difficulty).
- Extend the mastery model + grid to be per-operation (not just AxB facts).
- Update Mode screen, help/userguide, versioning; keep aligned with the separate "Maths Quiz Builder"
  backlog idea to avoid overlap.

## PWA icon gaps fixed - v1.0.7 - 04 Sep 2026
Ran the **PWA Readiness Checker** on the live/shipped app. Verdict: a genuinely solid PWA -
manifest complete and correctly scoped for the GitHub Pages subpath, service worker registered,
versioned and network-first, no `file://` assumptions, offline works. **One real gap: icons.**
The manifest shipped only a single `icon.svg` (`sizes:"any"`, `purpose:"any maskable"`) - no raster
PNGs (Chrome/Android effectively require 192 + 512 PNG for install), no dedicated maskable asset
(reusing one artwork risks Android cropping), and the apple-touch-icon pointed at SVG (iOS ignores
SVG and falls back to a screenshot).

**Fix (Bug Fix / Default mode - shipped-app polish, no scope creep):**
- Added a **maskable-safe SVG** (`icons/icon-maskable.svg`): full-bleed gradient background with the
  cross/smiley/confetti scaled to ~62% into the adaptive-icon safe zone so a circular/squircle mask
  can't crop it.
- Added a one-time **browser generator** (`icons/generate-icons.html`) that renders the two SVGs to
  the four PNGs the manifest needs (canvas + download; nothing uploaded). Needed because this
  Windows/Kiro shell has no working Node/ImageMagick/Inkscape/Python and can't run a browser.
- **Manifest:** icons array now declares `icon-192.png` + `icon-512.png` (`purpose:"any"`),
  `icon-maskable-512.png` (`purpose:"maskable"`), with `icon.svg` kept as an extra.
- **index.html:** apple-touch-icon -> `apple-touch-icon.png` (180x180, opaque).
- **sw.js:** precache the four new PNGs; **hardened install** to cache assets individually
  (`c.add().catch()`) instead of all-or-nothing `addAll()`, so one missing/failed asset can no
  longer break the whole offline precache. Cache bumped to `mathfun-v1.0.7`.
- **Version:** `APP_VERSION` -> `1.0.7`; README changelog + file-layout note, userguide footer,
  SPEC-design PWA section + layout, SPEC-tasks nice-to-have (ticked) all updated.

**Action needed from Isaac before deploy (the one manual step):**
1. Open `Learning/MathFun/icons/generate-icons.html` over **http** (Live Server), click
   *Download all four*, and move `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
   `apple-touch-icon.png` into the `icons/` folder. (Optional: delete `generate-icons.html`
   afterwards - it's a helper, not part of the app.)
2. Commit + push via GitHub Desktop (docs from earlier sessions are still pending push too).
3. Verify: Chrome DevTools -> Application -> Manifest (icons resolve) + Lighthouse PWA/installability;
   on Android confirm the launcher icon isn't cropped; on iOS Add to Home Screen shows the icon,
   not a screenshot.

**Verification note:** code edits all applied and are internally consistent (manifest/SW/HTML/version
aligned); the SW no longer fails install if an icon is missing. Actual PNG rendering + hosted PWA
install can't be exercised in this shell - it needs the browser generator step + a live/Live-Server
check above. `Ideas.md` stays **Built**; bump its tag to `Built (MathFun v1.0.7)` once pushed.

## v1.0.7 verified - Lighthouse all 100 - 04 Sep 2026
Isaac generated the four PNGs via `icons/generate-icons.html` and saved them into `icons/`
(`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) - all now
present and wired into the manifest/index.html/sw.js.

**Verification (Live Server + deployed):**
- Lighthouse on Live Server (http://127.0.0.1:5500): **Performance 100, Accessibility 100,
  Best Practices 96, SEO 100.** The only Best-Practices ding was GENERAL -> "Browser errors were
  logged to the console": *"An unknown error occurred when fetching the script."*
- **Root cause of the 96 = the local dev server, not the app.** The console also showed a failed
  `ws://127.0.0.1:5500/.../ws` connection ("Page entered Back-Forward Cache") - that's **Live
  Server's injected auto-reload WebSocket/script**, which doesn't exist on GitHub Pages. The
  "fetching the script" error was that same injected client, not `sw.js`.
- **Confirmed:** re-ran on the deployed site in **Edge (incognito + normal)** -> **all four
  categories 100.** So the shipped PWA is clean; the 96 was a Live Server artifact only.

**Small SW hardening kept regardless (good practice):**
- `sw.js` fetch handler now only caches complete, cacheable responses (`status === 200 &&
  type === 'basic'`); partial (206, e.g. audio range) / opaque / error responses are skipped so
  they can't throw on `cache.put()` or add console noise. (Complements the earlier individual-`add()`
  install hardening.) No version bump for this - it's a no-behaviour-change safety tweak within v1.0.7.

**Docs synced:** `Ideas.md` row -> **Built (MathFun v1.0.7)**. README changelog, userguide footer,
SPEC-design/-tasks already updated for v1.0.7 earlier this session.

**Status: v1.0.7 complete and verified.** All original PWA-checker report items are done
(SW registration confirmed present, sw.js VERSION rolled, in-app version + changelog + session log
bumped, served+offline verified, raster icons added). Deployed site scores 100 across the board.
Remaining: none required. (Pending routine push of the latest local edits via GitHub Desktop if not
already done.)

## v1.1 operations - Addition & Subtraction (prototype build) - 07 Sep 2026
Started the long-planned multi-operation extension. Built **prototype-first** in `prototypes/`
(version `1.1.0-proto`, storage `mathfunproto_`); **the shipped app at the root is untouched at
v1.0.7** and will only change when Isaac has tested and signed off, then we port in one pass.

**Mode:** Spec (multi-behaviour change on a shipped app - new screen + data-model change + generation).
Build-standards flags unchanged from v1: Simple-tier rigour, vanilla no-build stack, mobile-first PWA.

**Decisions agreed with Isaac:**
- Landing page after profile create/select is now a **4-operation picker**: Addition, Subtraction,
  Multiplication, Division. Picking one leads into that operation's own Mode/Play screens.
- **Addition & Subtraction fully built this session.** **Division stubbed** as a visible
  "Coming soon" tile (may build fully next; will use multiplication-style ranges).
- **Per-operation progress** (separate bests/mastery/stats per operation).
- **+/- difficulty by number size** (adds a 4th level, Super Hard, for +/- only):
  Easy = single-digit (to 10), Medium = two-digit (to 100), Hard = three-digit (to 1000),
  Super Hard = four-digit (to 10000). **Subtraction never goes negative** (bigger - smaller).
- Difficulty sets are **operation-specific**: multiplication keeps Easy/Medium/Hard + Pick-a-table;
  +/- use Easy/Medium/Hard/Super Hard (no table).

**What changed (all in `prototypes/`):**
- **SPEC docs** updated for v1.1: requirements **R11** (operations, ranges, non-negative subtraction,
  division stub, per-op progress), design **section 12** (operations module, schema 2->3 migration,
  new screen + routing, progress views), tasks **Phase 7**.
- **New module `operations.js`** - single source of truth per operation (symbol, level set, ranges,
  question + near-miss distractor generators). Multiplication delegates to the existing `questions.js`
  unchanged; add/sub have full generators; division `generate:null` (coming soon).
- **`state.js`** - progress is now keyed by operation: `ops.{mul:{bests,mastery}, add/sub/div:{bests,
  rounds,answered,correct}}`. Badges + daily streak stay profile-level; longest in-round streak lifted
  to profile level. **Migration schema 2 -> 3** moves the old flat `bests`/`mastery` into `ops.mul`
  (no data loss). New helpers: `setOperation`, `currentOp`, `getOpProgress`, `recordBest`, `recordOpRound`.
- **`game.js`** - operation-aware round: routes generation through the active operation, records A x B
  mastery for multiplication only, and accumulates answered/correct for +/- accuracy stats.
- **`mastery.js`/`rewards.js`** - read/write the per-operation slices; rewards records best per
  (operation, level) and per-op round stats.
- **`ui.js`** - new **Operations picker** screen; **Mode screen is operation-aware** (levels/labels per
  operation, back-arrow to the picker, Pick-a-table only for multiplication); new **progress view**
  (A x B grid for multiplication, a rounds/accuracy/best-per-level **summary** for +/-); Rewards shows
  per-operation bests. Also aligned the create heading to "Create your profile" and made the header
  logo a clickable reload (matching shipped v1.0.6).
- **`index.html`** - added `#screen-ops`, clickable brand logo, updated Help copy for operations + levels.
- **`styles.css`** - operation tiles (`.op-card`/`.op-symbol`/coming-soon), 4-up difficulty grid,
  and the +/- progress summary, all using existing design tokens.
- **`sw.js`** - brought in line with the shipped app: **network-first** same-origin caching (was
  cache-first in the old proto), precaches `operations.js`, cache `mathfun-proto-1.1.0-proto`.

**Flow now:** Who's playing -> (create/select) -> **Operations (+ - x div)** -> Mode -> Play -> Results.
Back arrow on Mode returns to Operations so kids can switch operation freely.

**Verification note:** as before, this Windows/Kiro shell can't run Node or a browser (and
`grep_search` doesn't reach this OneDrive path), so code was cross-checked by reading every consumer
of the changed APIs - module imports/exports line up, no dangling references. **Needs Isaac's manual
Live Server pass** before we port.

**Isaac's Live Server checklist (test the prototype, http not file://):**
1. Serve `Learning/MathFun/prototypes/` via Live Server; open the URL. (First run creates a fresh
   `mathfunproto_` profile - sandbox data, separate from the live app.)
2. **Migration check (data safety):** if you already had prototype data, confirm your old
   multiplication progress/bests still show up under Multiplication (it migrates into `ops.mul`).
3. **Operations picker:** after creating/selecting a profile you land on the 4 tiles. Division shows
   a "Coming soon" badge and does nothing when tapped. The other three open their Mode screen.
4. **Addition & Subtraction:** each shows Easy/Medium/Hard/Super Hard. Play a round of each level and
   sanity-check the number sizes (Easy single-digit ... Super Hard four-digit). Confirm **subtraction
   never shows a negative answer**, and that the 4 options are believable (near-miss, no duplicates,
   never negative).
5. **Multiplication:** unchanged - Easy/Medium/Hard + Pick-a-table (1-20 dialog) still work; the
   mastery grid still fills in.
6. **Per-operation progress:** open "My Progress" from the header menu - multiplication shows the grid;
   addition/subtraction show a rounds/accuracy/best-per-level summary. Best scores are separate per op.
7. **Back arrow** on the Mode screen returns to the operations picker; the top-left logo reloads.
8. **General:** Timer toggle, Sound, Music, keyboard answering (1-4), Light/Dark toggle on every
   screen, and mobile/responsive layout.

**Pending (next steps):** Isaac verifies -> then **port to the live app** (version -> 1.1.0, cache
`mathfun-v1.1.0`, storage stays `mathfun_` with schema-3 migration, README changelog + userguide,
Ideas.md -> Built (MathFun v1.1.0), deploy + verify). Then optionally build **Division** fully.
`Ideas.md` row is currently **In Progress (MathFun v1.1, from v1.0.7)**.

### v1.1 prototype polish (Isaac's first-test feedback) - 07 Sep 2026
Three fixes after Isaac tested the `1.1.0-proto` build via Live Server (still prototype-only):
- **Bug: create-profile skipped past an empty name.** `needsChoice()` in `ui.js renderSetup`
  validated gender/age/avatar but not the name step, so a blank name advanced (silently defaulting
  to "Player"). Added a name check ("Please type your name to carry on.") that blocks Next until a
  non-blank name is entered; the hint now also clears as soon as the child starts typing.
- **Operation tiles made more fun + aligned.** Reworked `.op-card`/`.op-symbol` in `styles.css`:
  bigger chunky rounded "squircle" symbol chips echoing the MathFun app icon (inset highlight +
  soft shadow + text-shadow), a playful tilt/scale on hover, uniform card height/alignment, and a
  distinct bright gradient per operation (add=green, sub=orange, mul=purple, div=pink) with matching
  hover borders. Added an `op-<key>` class per tile to drive the colours.
- **Background music made more engaging.** Replaced the single-oscillator pentatonic loop in
  `sound.js` with a bouncier ~150-bpm loop: a 16-step plucky triangle lead melody (C major, with
  rests for bounce), a soft sine bass on each beat (C-F-G-C), and a light high-passed noise hi-hat on
  the off-beats for groove. Still synthesized WebAudio (no files), low volume behind the game; exports
  (`startMusic`/`stopMusic`/`isMusicOn`) unchanged so nothing else needed touching.

Verified by cross-reading consumers (sound exports unchanged; wizard flow intact). Still needs Isaac's
Live Server recheck of these three, then we continue toward the port. Prototype remains `1.1.0-proto`.

### v1.1 prototype - emoji tiles + real back navigation + header Home - 07 Sep 2026
Second round of Isaac's feedback (still prototype-only, `1.1.0-proto`):
- **Operation tiles now use real emoji** (\u2795 \u2796 \u2716\uFE0F \u2797) instead of CSS-styled glyphs.
  The `.op-symbol` chip became a soft per-operation tinted "squircle" (green/orange/purple/pink)
  with the emoji shown at its natural colour - reads as proper fun emojis, still echoing the app icon.
  (The `emoji` fields already existed in `operations.js`; the tile markup now renders `op.emoji`.
  `op.symbol` is still used for the compact mode tag like "\u00D7 Hard".)
- **Back now returns to the ACTUAL previous screen**, not always Home. Added a small **nav history
  stack** in `app.js`: navigable destinations are named routes (`who/ops/home/progress/rewards/help/
  editProfile`); `navigate(name)` pushes the current route, every back arrow calls `goBack()` which
  pops to where you really came from (floor = Operations picker). The **Play screen is deliberately
  excluded** - its back is still a "quit round -> Mode screen" (round abandoned), not a history pop,
  so a child can't be dropped mid-question by surprise. Difficulty picks re-render Home in place
  without polluting history.
- **New header Home button** (`\uD83C\uDFE0 Home`, icon + text to match the theme toggle and chip on
  either side), sitting between the theme toggle and the profile chip. It jumps to the **Operations
  picker** (our agreed "home") via `resetTo('ops')` and only shows once a profile is active. Renamed
  it `headerHomeBtn` to avoid an id clash with the Results screen's existing `homeBtn`.

Verified by tracing the route flows (ops->home->progress backs to home not ops; home back goes to ops;
header Home resets to ops; play quit returns to Mode). Chip menu now routes through `navigate()` so
Progress/Rewards/Help/Profile all get correct back behaviour. Prototype-only; awaiting Isaac's recheck,
then we continue toward the port.

## v1.1.0 ported to the live app & release chores done - 07 Sep 2026
Isaac signed off the prototype, so I did the one-pass port from `prototypes/` to the app root and
the release chores. **Not yet pushed** - Isaac pushes via GitHub Desktop (as usual).

**Ported to `js/` + root (with production settings, not a blind copy):**
- `operations.js` (new), `game.js`, `mastery.js`, `rewards.js`, `ui.js`, `sound.js` - carried over
  as finalized in the prototype.
- `state.js` - per-operation progress + schema 2->3 migration, but with the **production
  `mathfun_` prefix** and - importantly - the shipped app's **app-level theme**
  (`getTheme`/`setTheme` at store root), NOT the prototype's per-`settings` theme. This avoids
  regressing the v1.0.5 theme fix. Added theme carry-over in the v1 migration too.
- `app.js` - v1.1 nav-history stack + operations flow + header Home, but kept the shipped
  **delegated `#themeToggle` click** + `getTheme/setTheme`. `APP_VERSION` -> **1.1.0**.
- `index.html` - added `#screen-ops` + header `headerHomeBtn` (renamed to avoid clashing with the
  Results screen's `homeBtn`) + operations Help copy + updated meta description. **No prototype
  banner**; kept the production head + `apple-touch-icon.png`.
- `styles.css` - added the v1.1 blocks (emoji operation tiles, per-op progress summary, compact
  header buttons). Kept the shipped production dark-theme setup.
- `sw.js` - `VERSION` -> **1.1.0** (cache `mathfun-v1.1.0`), added `operations.js` to precache;
  kept the v1.0.7 network-first strategy + icon precache + individual-`add()` hardening.
- `manifest.webmanifest` - name -> "MathFun - Maths Practice", description updated; icons unchanged.

**Release chores:**
- **README** - intro/features/layout updated for operations + per-op progress; **v1.1.0 changelog**
  entry added; new `operations.js` in the layout; future-ideas trimmed (Division next).
- **userguide.html** - "choose what to practise" + per-operation levels + per-op progress + nav
  (back/Home) sections; footer -> v1.1.0.
- **SPEC** requirements/design/tasks status -> **Shipped v1.1.0**; Phase 7 ticked (deploy left open);
  design sec 12.7 notes the app-level-theme preservation.
- **Ideas.md** row -> **Built (MathFun v1.1.0)**.

**Data-safety note (the important one):** live users' data is schema 2 (flat per-profile
`bests`/`mastery`). On first load of v1.1.0 the schema-3 migration moves it into `ops.mul` and lifts
`longestStreak` to profile level; `badges`/daily streak/theme are preserved. This is written to be
non-destructive but has NOT been exercised in a browser here.

**Isaac - to ship & verify:**
1. **Push** via GitHub Desktop (review the diff; `prototypes/` is git-ignored so only the app +
   docs go up). Commit message suggestion: `MathFun v1.1.0 - operations (add/sub/mul), per-op
   progress, nav + header Home`.
2. After Pages updates, **hard-refresh** (Ctrl+Shift+R) or reopen the installed app once so the
   `mathfun-v1.1.0` service worker activates.
3. **Verify (deployed, ideally on a profile that already has multiplication history):**
   - Old multiplication progress/bests still show under Multiplication -> My Progress (migration OK).
   - Operation picker shows 4 tiles; Division = "coming soon"; +/- levels play with correct number
     sizes; subtraction never negative.
   - Theme toggle works on every screen incl. before a profile (the v1.0.5 regression guard).
   - Back returns to the previous screen; header Home jumps to the picker.
   - Optional: Lighthouse PWA/installability still green; app installs and runs offline.

**Then:** build **Division** fully (its own session), multiplication-style ranges.

## Pre-push local check - icon files fix - 07 Sep 2026
While verifying the local v1.1.0 build before pushing, DevTools -> Application -> Manifest showed
the four PNG icons (and the SVG) failing to load. Investigation revealed the real cause was
**pre-existing, not a v1.1 regression**: `git ls-files icons/` showed only `icon.svg`,
`icon-maskable.svg` and `generate-icons.html` were ever tracked - **the four generated PNGs
(`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) were never
committed** after being generated in the v1.0.7 session. So the deployed GitHub Pages site has been
missing them since v1.0.7 (the "Lighthouse 100" then was on Isaac's local machine where the PNGs
existed), and this working copy didn't have them either.

**Fix:** Isaac re-generated the four PNGs via `icons/generate-icons.html` and copied them into
`icons/`. Confirmed all four are now present and show as new untracked files in git, so they'll be
committed and pushed this time - closing the icon gap on the deployed site permanently. `.gitignore`
does not exclude PNGs (it never did), so nothing else was needed.

**Remaining Manifest notices (left as-is, not blocking):**
- Two "Richer PWA Install UI won't be available..." lines - informational only; they ask for
  optional install **screenshots** (`form_factor: wide`). Not required for install; deferred (avoid
  scope creep on an operations release).
- One "icon.svg failed to load" line locally - the SVG file is valid and present (and the PNGs beside
  it load), so this is a Live-Server/DevTools artifact for SVG manifest icons, not a real fault. The
  SVG is only an extra in the icons array; the three PNGs satisfy all install requirements. Expected
  to not appear on the deployed HTTPS host (correct `image/svg+xml` MIME). Decision: **leave the
  manifest untouched**; confirm on the deployed Manifest panel after push.

**Net:** the four PNGs are the only real change from this check; everything else is informational.
Isaac to commit + push v1.1.0 (code + docs + the four icons) via GitHub Desktop, then verify the
deployed Manifest panel is clean.

## Next session - direction (Division + FunFacts) - noted 07 Sep 2026
Two things planned for the next MathFun session:

**1. Division - build it fully.** Complete the stubbed Division operation (currently "coming soon").
Use multiplication-style ranges (whole-number division as the inverse of the tables so answers are
exact), per-operation progress like the others, believable near-miss distractors. Straightforward
extension of the existing v1.1 operations engine (`operations.js` + the Mode/Play flow); flip
`div.playable` to true and add its generator + level set. Likely Quick Spec, prototype-first.

**2. New "FunFacts" tab - explore MCP servers / APIs.** Add a FunFacts tab/section that surfaces
fun (maths/number?) facts, sourced by trying out **MCP servers / APIs from
https://app.mcpmarket.com/**. This is an exploration/learning goal as much as a feature.

> **Flag for next session (decide the track FIRST, likely Plan mode):** FunFacts is a departure
> from MathFun's current stance. To date the app is strictly **local-first, offline, no network,
> no accounts, no tracking** (see build rules + data/privacy stance). Pulling facts from an MCP
> server or external API means:
> - **Outbound network calls** and a runtime dependency (breaks the pure-offline guarantee - need a
>   graceful offline fallback, e.g. a small bundled fact set).
> - Possible **API keys/secrets** - must stay out of client-side code / the repo; may need a
>   proxy/serverless bit, which changes the "just static hosting" deployment model.
> - **Privacy** - confirm no personal/child data leaves the device; only fact requests go out.
> - Whether this even belongs inside MathFun (a kids' maths game) or is better as its own app.
> - MCP is normally a Kiro/IDE-side thing; using an MCP server as a *runtime* data source for a
>   shipped web app is a different pattern - clarify what's actually intended (build-time fact fetch
>   vs runtime API vs an MCP-backed agent feature = Bucket B / AgentCore territory per Ideas.md).
> Agree scope, stack, platform, data/privacy and offline behaviour with Isaac before writing code.

Order suggestion: do **Division** first (clean, in-keeping, low-risk), then take **FunFacts** into a
Plan-mode discussion to settle the network/privacy/deployment track before building.

## v1.1.0 pushed & verified live - 07 Sep 2026
Isaac committed + pushed via GitHub Desktop (code + docs + the four PWA icons) and verified the
deployed site. **v1.1.0 is live at https://isaacgera.github.io/MathFun/** - operations picker
(Addition, Subtraction, Multiplication; Division "coming soon"), per-operation progress, nav-history
back + header Home, emoji tiles, upbeat music, and the empty-name fix. The previously-uncommitted PWA
PNG icons are now on the deployed site, closing that gap. Ideas.md = Built (MathFun v1.1.0); SPEC
files shipped-v1.1.0; Phase 7 deploy ticked.

**Session end. v1.1.0 complete and deployed.** Next session (see the "direction" note above): build
Division fully, then take the FunFacts tab (MCP servers / APIs) into a Plan-mode discussion to settle
the network/privacy/offline/deployment track before building.

## v1.2 prototype - Division, Fun Facts, hints, daily challenge + polish - 09 Sep 2026
Built the next batch of features **prototype-first** in `prototypes/` (version `1.2.0-proto`,
storage `mathfunproto_`, banner). **The shipped app at the root is untouched at v1.1.0** and
only changes after Isaac tests, signs off, and we port in one pass.

**Mode:** Spec-ish / Quick Spec (multi-behaviour on a shipped app: new operation + new screen +
data-model-adjacent + generation). Build-standards flags unchanged: Simple-tier rigour, vanilla
no-build stack, mobile-first PWA.

**Flag resolved (Fun Facts):** the earlier "FunFacts = Plan-mode / MCP / network" concern does
NOT apply here - Isaac's ask was random fun facts about numbers/operations, so it's built as a
**bundled, local, offline** fact set (`funfacts.js`, 20 facts). No network, no API, no keys, no
privacy change - fully in keeping with MathFun's local-first stance.

**The eight changes (all in `prototypes/`):**
1. **Division built fully.** `operations.js`: `divQuestion` generates whole-number division as the
   inverse of the tables (divisor x quotient = dividend, so answers are always exact - no
   remainders). Levels Easy/Medium/Hard (caps 5/10/20) + **Pick-a-table** (divide by a chosen
   1-20). `buildDivDistractors` gives believable near-misses. `div.playable` flipped true, so the
   "Coming soon" badge disappears automatically. Div uses the accuracy-summary progress view
   (no A x B grid). `modeLabel`, Home table card and the table dialog are now operation-aware
   (division reads "Divide by which number?", "÷ N").
2. **Fun Facts tab.** New `funfacts.js` (local facts). New `#screen-funfacts` + `renderFunFacts`/
   `updateFunFact` (a card with a big **Another fact** button, pop animation). A **Fun Facts tile**
   (sunny-yellow) sits with the operation tiles on the picker.
3. **Age selector -> stepper.** Replaced the 5-15 tile grid (in both create-wizard and edit) with a
   single **colourful editable box, default 5, with - / + buttons**; manually typeable, clamped
   5-15 (clamps on blur/Enter, buttons disable at the ends). `AGE_MIN/MAX/DEFAULT` + `ageStepperMarkup`
   + `wireAgeStepper` in `ui.js`.
4. **Copy:** operations screen heading is now **"Pick an Option..."** (dropped the "Choose what to
   practise / Pick a kind of sum" lines).
5. **Mobile header on one line.** Theme/Home labels wrapped in icon+text spans; on <=560px the text
   is hidden (**icon-only Theme + Home**), the brand wordmark hides (clickable logo mark stays),
   header set to `nowrap`, chip tightened - so the top-right no longer wraps/misaligns on phones.
   Full labels kept in `aria-label`/`title`.
6. **"Need a Hint?"** In **untimed mode only**, after **7s** with no answer an **animated pulsing
   "💡 Need a Hint?"** button appears below the options; tapping it shows a **per-operation hint**
   (count on / count back / groups of / think of the times table). Resets each question; cleared on
   answer, timeout, round end and quit. `hintFor()` in `operations.js`; timer + wiring in `app.js`.
7. **Daily Challenge.** A **"🏆 Daily Challenge"** button under the operation tiles starts a 10-question
   **mixed** round drawing a random playable operation + level per question (`generateChallengeQuestion`).
   It's a fun mixed quiz: **not recorded** against any single operation's bests/mastery/accuracy, but
   the **daily streak + perfect badge still count**. Always untimed; hints still work. Play-again
   restarts the challenge, Home returns to the picker.
8. **Jollier music.** `sound.js` background loop reworked to a bouncier ~160bpm **platformer-style**
   theme: a chirpy square-wave lead (32-step call-and-response, octave triangle double, swung
   off-beats) over a walking sine bass with off-beat hats. Still synthesized WebAudio (no files);
   exports (`startMusic`/`stopMusic`/`isMusicOn`) unchanged.

**Also:** `APP_VERSION` -> `1.2.0-proto`; `sw.js` VERSION -> `1.2.0-proto` (cache `mathfun-proto-1.2.0-proto`)
and `funfacts.js` added to precache; index.html Help copy updated (division playable, hint button,
Fun Facts + Daily Challenge).

**Verification note:** as usual this Windows/Kiro shell can't run Node or a browser, so code was
cross-checked by reading every consumer of the changed/added APIs - imports/exports line up,
no dangling references, all 11 changed/created files pass diagnostics with zero errors. **Needs
Isaac's manual Live Server pass** of `prototypes/` before we port.

**Isaac's Live Server checklist (test the prototype, http not file://):**
1. Serve `Learning/MathFun/prototypes/`; open the URL. (Sandbox `mathfunproto_` data, separate from live.)
2. **Division:** picker no longer shows "Coming soon" on ÷. Play Easy/Medium/Hard + Pick-a-table;
   confirm every answer is a whole number and the 4 options are believable (no dupes, none <=0).
3. **Fun Facts:** the yellow Fun Facts tile opens the facts screen; "Another fact" swaps the fact
   with a little pop; back arrow returns to the picker.
4. **Age stepper:** create + edit a profile - box defaults to 5, +/- change it, you can type a
   number, and it clamps to 5-15 (buttons grey out at the ends).
5. **Mobile header:** narrow the window / use a phone - Theme + Home show as icons only, everything
   stays on one line, nothing overlaps the player chip.
6. **Need a Hint?:** with the **Timer OFF**, wait ~7s on a question - the pulsing "Need a Hint?"
   button appears; tapping it shows a sensible hint for that operation. With the **Timer ON**, it
   should **never** appear.
7. **Daily Challenge:** the button under the tiles starts a mixed 10-question round (label reads
   "🏆 Daily Challenge"); questions vary across operations; finishing it doesn't change your
   per-operation best scores but does count your day streak.
8. **Music:** turn Music on - confirm the new bouncier tune, and that Sound/Timer still behave.
9. **General:** keyboard answering (1-4), Light/Dark on every screen incl. before a profile,
   back/Home navigation, and that existing Add/Sub/Mul + progress/rewards still work.

**Pending (next steps):** Isaac verifies -> then **port to the live app** (version -> 1.2.0, cache
`mathfun-v1.2.0`, storage stays `mathfun_`, preserve the shipped app-level theme, README changelog +
userguide + SPEC docs, Ideas.md -> Built (MathFun v1.2.0), deploy + verify). `Ideas.md` row should
move to **In Progress (MathFun v1.2, from v1.1.0)** now that a build has begun.

### v1.2 prototype - round 2 tweaks (Isaac's test feedback) - 09 Sep 2026
Six refinements after Isaac's first Live Server pass of the `1.2.0-proto` build. Still
**prototype-only** (`prototypes/`, `1.2.0-proto`); the shipped app stays at v1.1.0 until the port.

1. **Division "Pick a table" -> "Pick a number".** The division difficulty card now reads
   "Pick a number" (multiplication still says "Pick a table"); the picker dialog already read
   "Divide by which number?".
2. **Hint copy trimmed.** Dropped the restating preamble so hints get straight to the help,
   keeping the bulb: e.g. multiplication "Try adding N to itself M times, or use a table you
   know."; division "Think of your N times table: N times what makes M?".
3. **Landing layout -> 2 x 3.** Fun Facts and **Daily Challenge are now both tiles** in the
   operations grid (Add/Sub, Mul/Div, Fun Facts/Daily Challenge). Removed the separate
   bottom "Daily Challenge" button. Tiles are **~25% shorter** (min-height 150 -> 112px, smaller
   emoji chip) so the grid fits better on screen. Daily Challenge tile gets a bright cyan tint.
4. **Sound controls moved into the player menu.** Timer / Sound / Music toggles now live in the
   top-right profile dropdown (just under Profile), toggling in place without closing the menu -
   removed from the Mode screen. **Music now defaults ON** for new players and starts when they
   land on the operations picker (browser autoplay is satisfied by the profile-selection tap).
   The Mode screen hint now points to the menu for Timer/Sound/Music + progress/rewards/help.
5. **Age selector 0-100, default 5.** The stepper pre-fills **5**, and the child can go down to
   **0** or up to **100** by typing or the +/- buttons; values are clamped so they can never go
   negative or above 100. Removed the "we'll pick questions just right for your age" helper line
   and the earlier "must enter age" gate (a default always exists now).
6. **Fun Facts grown to 100** offline facts (kid-friendly maths/number facts), still fully local -
   no network.

**Verification:** all touched files pass diagnostics with zero errors; logic cross-read (chip-menu
switches, age clamp, 2x3 grid handlers, division labels). The Windows/Kiro terminal still can't
reliably run in this OneDrive path, so **needs Isaac's Live Server recheck** of these six, then we
continue toward the port. Prototype remains `1.2.0-proto`.

**Recheck checklist:** (a) Division card says "Pick a number"; (b) hints read cleanly with just the
bulb + advice; (c) landing shows a 2x3 tile grid, tiles shorter, Daily Challenge as a tile; (d) open
the player menu - Timer/Sound/Music toggle there and stay put; music is playing by default after you
pick a player; (e) age box starts at 5, +/- and typing work, won't go below 0 or above 100; (f) Fun
Facts cycles through lots of different facts.

## v1.2.0 ported to the live app + release chores done - 09 Sep 2026
Isaac signed off the prototype, so I did the one-pass port from `prototypes/` to the app root and
the release chores. **Not yet pushed/deployed** - Isaac pushes via GitHub Desktop (as usual).

**What shipped in v1.2.0:** full **Division** (whole-number, inverse of the tables, always exact;
Easy/Medium/Hard + **Pick a number**), a local **Fun Facts** tab (100 offline facts), a mixed
**Daily Challenge**, a **"Need a Hint?"** helper (untimed mode, after 7s, per-operation tips),
a context-aware **My Progress** (all-operations overview before an operation is picked; that
operation's detail once in one; multiplication now uses the same rounds/accuracy summary with its
mastery grid kept below), **per-context music** (a distinct jolly tune per operation, Fun Facts and
Daily Challenge; **music on by default**), Timer/Sound/Music moved into the **player menu** (compact
icon row), an editable **age stepper** (default 5, range 0-100), and layout/mobile polish (fixed
2x3 option tiles, single-line mobile header with icon-only Theme/Home).

**Ported (production settings, not a blind copy):**
- Neutral modules copied as finalized: `operations.js`, `game.js`, `rewards.js`, `mastery.js`,
  `sound.js` (per-context tunes), `ui.js`, plus new `funfacts.js` (100 facts; dead quiz helpers
  removed), and `styles.css` (prototype banner block dropped).
- `state.js` - kept the shipped **`mathfun_` prefix + app-level theme** (getTheme/setTheme) and the
  schema-3 migration; added `music: true` default and multiplication `rounds/answered/correct`
  stats.
- `app.js` - kept the shipped **app-level theme** (delegated `#themeToggle` click, resolveTheme/
  osPrefersDark) and the network-first SW auto-reload; layered on the funfacts screen/route,
  `playTune`/`lastTune` per-context music, Daily Challenge, the hint timer, challenge-aware
  endRound/goHome, the chip-menu Timer/Sound/Music handlers, and the context-aware progress.
  `APP_VERSION` -> **1.2.0**.
- `index.html` - added `#screen-funfacts` + header icon/text spans; updated meta description +
  Help copy. Kept the production head/manifest/icons; no prototype banner.
- `sw.js` - `VERSION` -> **1.2.0** (cache `mathfun-v1.2.0`), added `js/funfacts.js` to precache;
  kept network-first + icon precache + hardened install.
- `manifest.webmanifest` - description updated (no "coming soon").

**Release chores:** README (features/layout + **v1.2.0 changelog**), `userguide.html` (division,
Fun Facts, Daily Challenge, hint, per-op music, progress overview, age stepper; footer -> v1.2.0),
SPEC requirements (status + R11.6 division playable + new **R12**), design (status + new
**section 13**), tasks (**Phase 8**), and `Ideas.md` -> **Built (MathFun v1.2.0)**.

**Data-safety note:** live users are schema 3 (per-operation `ops.*`). v1.2 only **adds** fields
(`ops.mul.rounds/answered/correct` default 0) - `fillDefaults` backfills them, nothing is dropped;
multiplication mastery/bests are preserved. **Music-default caveat:** `fillDefaults` keeps existing
users' saved `music:false`; only **new** profiles get music on.

**Verification:** all **15** live root files pass diagnostics with zero errors; the port was a
deliberate merge (theme/storage/SW kept from the shipped app), cross-read against every consumer.
As always, the Windows/Kiro shell can't run a browser here - needs Isaac's deploy + hosted check.

**Isaac - to ship & verify:**
1. **Push** via GitHub Desktop (review the diff; `prototypes/` is git-ignored, so only the app +
   docs go up). Suggested commit: `MathFun v1.2.0 - division, fun facts, daily challenge, hints, per-op music`.
2. After Pages updates, **hard-refresh** (Ctrl+Shift+R) or reopen the installed app once so the
   `mathfun-v1.2.0` service worker activates.
3. **Verify (deployed, ideally on a profile with existing multiplication history):**
   - Old multiplication progress/bests still show under Multiplication (migration OK).
   - **Division** plays (Easy/Medium/Hard + "Pick a number"); answers are always whole numbers.
   - **Fun Facts** cycles facts; **Daily Challenge** runs a mixed round and counts the day streak.
   - **Need a Hint?** appears after ~7s with Timer OFF, never with Timer ON.
   - **My Progress**: overview before picking an operation; detail once in one; multiplication
     shows the summary + grid.
   - **Music**: different tune per screen; on by default for a new player; Timer/Sound/Music toggle
     in the player menu.
   - **Age stepper** (0-100, default 5); **2x3 tiles** + single-line header on mobile.
   - Theme toggle still works on every screen incl. before a profile (v1.0.5 guard).
   - Optional: Lighthouse PWA/installability still green; installs and runs offline.

**Status: v1.2.0 ported, documented and diagnostics-clean; awaiting Isaac's push + hosted verify.**
