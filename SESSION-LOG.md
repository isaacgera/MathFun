# MathFun - Session Log

- **Category:** Learning
- **Complexity tier:** Simple
- **Status:** Built (v1.0.4) - pending push (deployed live is still v1.0.0)
- **Live:** https://isaacgera.github.io/MathFun/
- **Description:** Playful times-tables game for kids 5-15 (multiplication 1x-20x; extendable to +/-/div later). Multi-profile, difficulty levels + pick-a-table, multiple-choice with near-miss distractors, personalised feedback, stars/streaks/badges, mastery grid, sound + music.
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
