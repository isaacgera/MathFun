# MathFun - Requirements

- **Category:** Learning
- **Complexity tier:** Simple
- **Status:** Built & deployed (v1.0.6) - https://isaacgera.github.io/MathFun/
- **Audience:** School-going children aged 5-15 (fun-first, not a dry drill).

## Summary
MathFun is a playful, local-first times-tables game. A child picks how hard they want
to play, answers multiplication questions by tapping one of four choices, and earns
stars, streaks and badges as they go. A mastery grid shows which tables are solid and
which need more work. v1 covers **multiplication only (1x-20x)**; the name is kept broad
so addition/subtraction/division can be added later without a rebrand.

## Build-standards flags (agreed at kickoff)
- **Rigour:** Simple tier - tidy modular vanilla code, design tokens, accessibility built in; no heavy CI/automated tests.
- **Stack:** Vanilla HTML/CSS/JS, no build step (fits the no-build / Live Server workflow).
- **Platform:** Installable PWA, **mobile-first** (phone + tablet are the primary targets); layout scales gracefully up to desktop/TV.
- **Data & privacy:** Local-first. All data stays on the device (localStorage). No accounts, no network calls, no tracking.

## Scope (v1 - as shipped)
**In scope:** multiple child profiles (name, boy/girl, age 5-15, character avatar) each with
their own progress; multiplication tables 1x-20x; three difficulty levels + pick-a-table dialog;
4-option multiple-choice answering; 10-question rounds (untimed default + optional Timer);
encouraging, personalised feedback; rewards (stars, streaks, badges); personal-best tracking;
mastery grid (1x-20x); light/dark theme; sound effects + background music (both optional);
installable offline PWA.

**Out of scope (v1, noted for later):** other operations (+ - x div), typed/number-pad input,
cloud sync, leaderboards, progress export/import. (A separate "Maths Quiz Builder" idea exists
in the Medium backlog - keep MathFun's multi-operation growth aligned with that when the time comes.)

---

## User stories & acceptance criteria

### R0 - Player profiles (added during build)
**As a family, we want each child to have their own player so progress is personal and separate.**
- R0.1 First run shows a step-by-step **create-profile** wizard: name -> boy/girl -> age (5-15) -> avatar; no field pre-selected (a choice is required before continuing).
- R0.2 **Multiple profiles** are supported; a "Who's playing?" screen lists players and offers "Add player".
- R0.3 Each profile owns its own settings, bests, streaks, badges and mastery (kept separate).
- R0.4 A **profile menu** (header avatar chip, top-right) offers Profile, My Rewards, My Progress, Help, Switch player.
- R0.5 **Edit** shows the profile as a summary with an Edit button, then all fields editable at once; a player can be deleted (with confirm).
- R0.6 Age sets a sensible starting difficulty on first play but the child can always change it.

### R1 - Choose how to play (difficulty & table selection)
**As a child (or parent setting it up), I want to pick what to practise so the game matches my level.**
- R1.1 A home/start screen offers three difficulty levels: **Easy** (tables 1-5), **Medium** (tables 1-10), **Hard** (tables 1-20).
- R1.2 A **"Pick a table"** mode lets the child practise one specific table (e.g. just the 7x), selectable from 1 to 20.
- R1.3 The selected mode is shown clearly before and during a round.
- R1.4 The mode is a per-session choice: nothing is pre-selected on load, reload or player switch - the child picks each time (Play prompts if none chosen). Pick-a-table opens a 1-20 dialog.
- R1.5 Selection controls are large, clearly labelled, and usable by touch and keyboard.

### R2 - Answer questions (multiple choice)
**As a child, I want to tap the right answer from a few choices so it's quick and not fiddly.**
- R2.1 Each question shows a multiplication problem (e.g. "7 x 8 = ?") in large, readable text.
- R2.2 Exactly **four** answer options are presented as large tap targets; one is correct.
- R2.3 The three wrong options are **believable near-misses** (e.g. adjacent multiples, off-by-one-times, common slip-ups), never obviously silly, and never duplicated or equal to the correct answer.
- R2.4 Answer options are shuffled so the correct one isn't in a predictable position.
- R2.5 Tapping an option registers the answer once; options lock until the next question to prevent double-tap errors.
- R2.6 A physical keyboard can also select options (e.g. keys 1-4 / arrow + Enter) for desktop use.

### R3 - Feedback (fun, encouraging)
**As a child, I want happy, clear feedback so I know how I did and feel encouraged.**
- R3.1 A correct answer shows immediate positive feedback (colour, a tick/emoji, encouraging words like "Nice one!") and, if sound is on, a cheerful sound.
- R3.2 A wrong answer shows gentle feedback (never harsh), highlights the correct answer, and encourages a retry next time ("Almost - it's 56!").
- R3.3 Feedback never blocks progress for long; the game moves to the next question promptly or on a clear "Next" tap.
- R3.4 Feedback is conveyed **visually as well as by sound** (never sound-only), so it works with sound off.

### R4 - Rounds
**As a child, I want short, clear rounds so a game feels achievable.**
- R4.1 A round is **10 questions** by default.
- R4.2 Rounds are **untimed by default** (no time pressure for younger children).
- R4.3 An optional **Timer** mode (toggle) adds a per-question countdown (~8s); timeout counts as wrong and reveals the answer.
- R4.4 Progress within a round is visible (e.g. "Question 4 of 10" or a progress bar).
- R4.5 At the end of a round, a results screen shows score (e.g. 8/10), stars earned, and any new best or badge, with a clear "Play again" and "Back to home".

### R5 - Rewards & motivation
**As a child, I want stars, streaks and badges so playing feels rewarding.**
- R5.1 **Stars** are awarded per round based on score (e.g. thresholds for 1/2/3 stars).
- R5.2 A **streak** counter tracks consecutive correct answers within a round and/or consecutive days played; a celebratory cue appears at milestones.
- R5.3 **Badges** are awarded for achievements (e.g. "First perfect round", "Mastered the 7s", "5-day streak") and are viewable in a rewards/trophy area.
- R5.4 Reward moments use short celebratory animation (respecting reduced-motion, see R9).

### R6 - Progress tracking (personal best & mastery grid)
**As a child/parent, I want to see progress so I know what's improving and what needs work.**
- R6.1 A **personal best** (e.g. best score per mode, longest streak) is stored and displayed.
- R6.2 A **mastery grid** shows each fact/table with a visual state: solid (mastered), okay (in progress), needs work - based on recent accuracy.
- R6.3 The grid is colourful and legible, and does not rely on colour alone to convey state (also uses labels/icons - see R9).
- R6.4 Mastery updates after rounds so the grid reflects recent performance.
- R6.5 A simple way to reset progress exists (with a confirm step) for a fresh start or a new child.

### R7 - Data & persistence (local-first, data safety)
**As a parent, I want the child's progress kept safely on the device with no data leaving it.**
- R7.1 All state (settings, bests, streaks, badges, mastery) persists in `localStorage` under namespaced keys.
- R7.2 No network requests for app function; the app works fully offline.
- R7.3 Loading handles missing/corrupt stored data gracefully (sensible defaults, never a blank crash).
- R7.4 If a stored-data schema version changes in future, existing data is migrated, not silently discarded.
- R7.5 (Optional, nice-to-have) Export/import or reset of progress so a device change or new child is possible without data loss.

### R8 - PWA / installable & offline
**As a parent, I want to add MathFun to the tablet home screen and use it offline like an app.**
- R8.1 A valid web app manifest (name, short_name, theme/background colour, icons, display: standalone, portrait-friendly).
- R8.2 A service worker caches the app shell and assets so it loads and plays offline after first visit.
- R8.3 The app is installable on Android (and iOS via Add to Home Screen) and launches full-screen without browser chrome.
- R8.4 A cache/version name is bumped on release so updates reach installed users.
- R8.5 The app must work when served over HTTP(S) (Live Server / GitHub Pages), not rely on `file://` behaviour.

### R9 - Accessibility & responsiveness
**As any child, I want the game to be easy to see, tap and use however I play.**
- R9.1 **Mobile-first responsive** layout: comfortable on phone and tablet, scaling up to desktop/TV; portrait and landscape both usable.
- R9.2 **Large tap targets** suitable for young children (min ~44-48px), with generous spacing.
- R9.3 Meaning is **never conveyed by colour alone** (icons/labels back up correct/wrong and mastery states).
- R9.4 Honour **`prefers-reduced-motion`**: tone down or remove animations for users who prefer that.
- R9.5 Keyboard focus is visible and controls are reachable/operable by keyboard.
- R9.6 Semantic HTML and ARIA where it helps (e.g. `aria-live` for feedback, labels on icon-only buttons); adequate colour contrast in both themes.
- R9.7 On/Off toggle switches for **Sound** (effects) and **Music** (background tune); the game is fully playable and understandable with both off.

### R10 - Theming & polish
**As a user, I want a bright, friendly look that's consistent and comfortable in light or dark.**
- R10.1 Colours, spacing, radius, shadows and font sizes are defined as **CSS custom properties (design tokens)** and reused.
- R10.2 **Light and dark themes** via tokens. A two-way **Light <-> Dark** toggle (app-level, works on every screen incl. before a profile exists) that persists; first run follows the device's `prefers-color-scheme`.
- R10.3 Consistent, quick transitions (~120-200ms ease-out) for hover/focus/state changes; clear hover & focus states on interactive elements.
- R10.4 Playful, child-friendly visual identity: friendly typography, rounded shapes, consistent iconography, tasteful (not overwhelming) animation.
- R10.5 Sensible empty/loading/celebration states that match the theme.

---

## Non-functional / delivery
- **Versioning:** single version constant; semantic versioning; short changelog per release; PWA cache name bumped on release.
- **Branding:** consistent app name (MathFun), icon/favicon, PWA identity (name, theme colour, icon set).
- **Docs:** User Guide (in-app style), brief in-app About/Help, README for the repo; keep SESSION-LOG + SPEC files current.
- **Licensing:** to be chosen by Isaac before an explicit LICENSE file is added (no default).
- **Deployment:** static host (GitHub Pages / Netlify); test the hosted PWA, not just local/file://.
- **Verification note:** live browser/HTTP testing can't be run reliably in this Windows shell; verification will include a short manual Live Server check list for Isaac.

## Decisions (resolved during build)
1. **Distractors:** believable near-misses (not random). (R2.3)
2. **Timer:** per-question countdown (~8s). (R4.3)
3. **Star thresholds:** 3 = 10/10, 2 = 8-9, 1 = 6-7. (R5.1)
4. **Mastery basis:** last 5 attempts, mastered at >= 80% (>= 4/5). (R6.2)
5. **Sound/Music:** synthesized WebAudio (no asset files). (R3.1)
6. **Licence:** MIT. (shipped)
