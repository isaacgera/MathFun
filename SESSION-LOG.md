# MathFun - Session Log

- **Category:** Learning
- **Complexity tier:** Simple
- **Status:** Built (v1.0.0) - not yet deployed
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
