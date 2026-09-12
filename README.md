# MathFun

A playful, local-first **maths game** for kids aged 5-15. Choose an operation, pick how hard
you want to play, tap one of four answers, and earn stars, streaks and badges along the way.
Built as an installable, offline-capable PWA.

**Live demo:** https://isaacgera.github.io/MathFun/

> Covers **Addition, Subtraction, Multiplication and Division**, plus **Fun Facts** and a
> mixed **Daily Challenge**. Multiplication runs 1x1 to 20x20. Now with **10 character themes**.

## Features
- **Choose an option** - a landing page with **Addition, Subtraction, Multiplication** and
  **Division**, plus **Fun Facts** and a **Daily Challenge**. Switch freely with the back
  arrow or the header **Home** button.
- **Division** - whole-number division built as the inverse of the tables, so answers are
  always exact. Easy / Medium / Hard, plus **Pick a number** (divide by a chosen 1-20).
- **Fun Facts** - a tab of 100 kid-friendly facts about numbers and sums; tap for another.
  Fully local, no network.
- **Daily Challenge** - a surprise 10-question round mixing all operations. Counts your daily
  streak but keeps your per-operation best scores separate.
- **Need a Hint?** - in untimed mode, if you pause for a few seconds a friendly hint button
  appears, offering a per-operation tip (count on, count back, groups of, times-table).
- **Multiple players** - each child has their own profile (name, boy/girl, age 0-100,
  fun character avatar) with their own **per-operation** progress, bests, badges and mastery.
- **Difficulty levels**
  - Multiplication: Easy (tables 1-5), Medium (1-10), Hard (1-20), plus a **Pick a table**
    dialog to drill any single table 1x-20x.
  - Division: Easy (up to 5), Medium (up to 10), Hard (up to 20), plus **Pick a number**.
  - Addition & Subtraction: Easy (single digit, to 10), Medium (two digit, to 100),
    Hard (three digit, to 1000), **Super Hard** (four digit, to 10000). Subtraction never
    produces a negative answer.
- **Multiple-choice answers** - four options with believable near-miss distractors.
- **10-question rounds** - untimed by default, with an optional **Timer** challenge.
- **Encouraging, personalised feedback** - praise uses the child's name and boy/girl term.
- **Rewards** - stars per round, daily streaks, and collectable badges.
- **My Progress** - opened before choosing an operation it shows an **all-operations overview**;
  in/after an operation it shows that operation's detail (rounds, accuracy, best per level).
  Multiplication also shows its colourful A x B mastery grid (1x-20x).
- **Sound & Music** - synthesized effects, plus a distinct upbeat background tune **per theme**
  (one tune that plays across all operations while that theme is active). Timer / Sound / Music
  toggles live in the player menu; music is on by default.
- **Character themes** - 10 trademark-safe skins (Math World, Plumber World, Dino Valley,
  Speedy Hedgehog, Magic Kingdom, Space Blast, Ocean Deep, Jungle Safari, Candy Land, Robot Lab).
  Chosen at profile creation and changeable in-play from the player menu; each theme changes the
  palette, background, tile/tab/hint emoji, its on-theme avatar set, and the background music.
  Math World (maths symbols) is the default shown before any profile exists.
- **Light / dark theme** - follows the device and can be toggled; choice persists. Layers on
  top of the character theme, so every theme has a light and a dark form.
- **Accessible & mobile-first** - large tap targets, keyboard answering (keys 1-4),
  visible focus, reduced-motion support, ARIA labels; scales from phone to desktop.
- **Local-first & private** - everything is stored on the device in `localStorage`.
  No accounts, no network calls, no tracking.

## Tech
- Vanilla HTML, CSS and JavaScript (ES modules). **No build step.**
- PWA: web app manifest + service worker (offline app-shell caching).
- Storage keys are namespaced under `mathfun_`.

## Run it locally
The app uses ES modules and a service worker, so serve it over HTTP (not `file://`):
- In VS Code, right-click `index.html` -> **Open with Live Server**.
- Or any static server pointed at this folder.

Then open the served URL (e.g. `http://localhost:5500/`).

### Test on a phone (same network)
1. Find your computer's LAN IP (`ipconfig` -> the Wireless LAN adapter's IPv4, e.g. `192.168.x.x`).
2. On the phone's browser open `http://<that-ip>:5500/`.
3. For full "Add to Home Screen" (install) testing you need HTTPS - use VS Code Port
   Forwarding, a tunnel, or the deployed site.

## Deploy
Any static host works (GitHub Pages, Netlify). Deploy the contents of this folder.
Test the hosted version over HTTPS so the PWA install and offline behaviour work fully.

## Project layout
```
MathFun/
  index.html            app shell + screens
  styles.css            design tokens + all styling (light/dark)
  manifest.webmanifest  PWA manifest
  sw.js                 service worker (offline cache; bump VERSION per release)
  icons/                app icons: icon.svg + PNGs (192/512, maskable-512, apple-touch)
  js/
    app.js              bootstrap, routing, profile flow, wiring
    state.js            localStorage (the only module that touches it); per-operation progress
    themes.js           character-theme registry (palettes, emoji, avatars, tune per theme)
    questions.js        multiplication fact pools + near-miss distractor generation
    operations.js       per-operation config (symbols, levels, ranges, generators, hints)
    funfacts.js         local, offline set of 100 fun maths/number facts
    game.js             round lifecycle, scoring, timer
    rewards.js          stars, streaks, badges
    mastery.js          per-fact mastery + grid data
    sound.js            synthesized effects + background music
    ui.js               DOM render helpers for each screen
    avatars.js          the avatar set
  userguide.html        in-app-style user guide
  SPEC-*.md, SESSION-LOG.md   design/requirements/tasks + session history
  prototypes/           the sandbox the app was iterated in (kept for reference)
```

## Versioning
Single version constant `APP_VERSION` in `js/app.js`. On each release, bump it and the
`VERSION` in `sw.js` (the cache name derives from it) so updates reach installed users.

## Changelog
### v1.3.1 - 12 Sep 2026
- **Bug fix:** the player menu (chip, top-right) and the header **Home** button didn't respond to
  taps/clicks where they overlapped the page content. Root cause was a z-index stacking bug in the
  v1.3 themed-background CSS: the header and the main area were given the **same** `z-index`, so the
  later-in-DOM main area painted over the header's dropdown and swallowed the taps (the theme toggle
  still worked only because it uses a delegated document listener). Fixed by putting the header
  above the main content in the stacking order (header `z-index: 30`, main `1`, modals `50`).
- Also hardened the menu's outside-click/Escape close so it's bound once (not stacked on every
  header re-render) and looks up the current menu each time.
- **Accessibility polish:** the theme toggle now announces its **current** state and what a tap
  switches to (e.g. "Light theme on. Switch to dark theme."); removed the footer copyright's extra
  opacity so its small text keeps a safe contrast ratio on the lighter themed backgrounds.

### v1.3.0 - 12 Sep 2026
- **Character themes!** 10 trademark-safe skins (Math World, Plumber World, Dino Valley, Speedy
  Hedgehog, Magic Kingdom, Space Blast, Ocean Deep, Jungle Safari, Candy Land, Robot Lab). Chosen
  at profile creation (a new Theme step, before the avatar step) and changeable any time from the
  player menu. Each theme changes the palette, a themed background, the operation/tab/hint emoji,
  its on-theme avatar set, and the background music. Math World (maths symbols) is the default
  shown before any profile exists. Themes layer on top of Light/Dark, so each has both forms.
- **Theme-driven avatars** - the avatar grid shows the chosen theme's characters (plus a small
  neutral fallback), and changing theme in-play auto-assigns a random on-theme avatar.
- **One tune per theme** - each theme has its own distinct, louder background tune (routed through
  a limiter) that plays across all operations, replacing the earlier per-operation tunes.
- **App-wide footer** - "Powered by Forje" and the copyright line on every screen.
- **Layout & pickers** - short screens centre in the viewport and tiles scale up on tablet/laptop
  (option tiles go 3x2 on wide screens); the theme, table (1-20) and avatar pickers are responsive
  so every option shows without scrolling.
- Data migrates with no loss: existing profiles gain a `skin` field defaulting to Math World; the
  app-level light/dark theme and all per-operation progress are preserved.

### v1.2.1 - 09 Sep 2026
- Mobile polish: the landing (operation picker) sits lower toward the centre on phones; the
  header logo blends with the background and the "MathFun" wordmark stays visible on mobile.

### v1.2.0 - 09 Sep 2026
- **Division!** Whole-number division built as the inverse of the tables (answers always
  exact), with Easy/Medium/Hard levels and a **Pick a number** dialog (divide by a chosen 1-20).
- **Fun Facts** - a new tab with 100 kid-friendly, fully-local facts about numbers and sums.
- **Daily Challenge** - a surprise mixed round drawing from all operations; counts the daily
  streak without touching per-operation bests.
- **Need a Hint?** - in untimed mode, a friendly animated hint button appears after a short
  pause and gives a per-operation tip.
- **My Progress reworked** - a context-aware screen: an all-operations overview before you pick
  an operation, and that operation's detail once you're in one. Multiplication now shows the same
  rounds/accuracy summary as the others, with its mastery grid kept below.
- **Per-context music** - a different upbeat tune for each operation, Fun Facts and the Daily
  Challenge. **Music is on by default** for new players. Timer / Sound / Music moved into the
  player menu (compact icon row).
- **Age selector** - a single colourful stepper (default 5, - / +, or type), range 0-100.
- **Layout & mobile polish** - 2x3 option tiles that stay tidy on phone and desktop; the header
  (theme / home / player) stays on one line on mobile with icon-only buttons.
- Data migrates with no loss (existing multiplication mastery/bests are preserved).

### v1.1.0 - 07 Sep 2026
- **Operations!** New landing page to choose **Addition, Subtraction, Multiplication** or
  Division (division shown as "coming soon"). Addition & Subtraction are fully playable with
  their own number-size difficulty levels: Easy (to 10), Medium (to 100), Hard (to 1000),
  Super Hard (to 10000). Subtraction never goes negative; +/- answers use believable near-miss
  distractors.
- **Per-operation progress.** Best scores, streaks and stats are tracked separately per
  operation. Multiplication keeps its A x B mastery grid; addition/subtraction show a rounds/
  accuracy/best-per-level summary. Existing multiplication progress is migrated with no data loss.
- **Navigation:** each screen's back arrow now returns to the actual previous screen, and a new
  header **Home** button jumps to the operation picker.
- **Polish:** colourful emoji operation tiles, a more upbeat background tune, and a fix so the
  create-profile wizard no longer skips past an empty name.

### v1.0.7 - 04 Sep 2026
- PWA install polish: added raster PNG icons (192, 512), a dedicated **maskable** 512 icon
  (artwork kept in the adaptive-icon safe zone so Android launchers don't crop it), and a
  180x180 opaque **apple-touch-icon** for iOS home screens. The manifest now declares PNGs
  (with the SVG kept as an extra), and the service worker precaches them for offline installs.
  Closes the icon gaps flagged by the PWA readiness check.

### v1.0.6 - 02 Sep 2026
- Renamed the home heading "Pick how to play" -> "Mode".
- Theme toggle now has an aria-label and a tooltip (title) that state which theme a tap switches to.
- The MathFun logo/name (top left) is now a clickable button that reloads the app.

### v1.0.5 - 02 Sep 2026
- Fixed the theme toggle not working on the profile-creation / who's-playing screens. Theme was
  stored per-profile, so before a profile existed the toggle couldn't persist and appeared stuck.
  Theme is now an app-level setting that works on every screen. Header logo also updated to the
  new icon everywhere.

### v1.0.4 - 02 Sep 2026
- Brighter, friendlier app icon (colourful gradient, smiley multiplication cross, confetti).
- Renamed the setup heading "Create your player" -> "Create your profile".

### v1.0.3 - 02 Sep 2026
- Theme control reworked to a clear two-way **Light <-> Dark** toggle. The old three-way
  Auto/Light/Dark cycle looked broken on a light-OS device because "Auto" and "Light" render
  identically, so the first tap appeared to do nothing. Now every tap visibly flips the palette,
  an explicit theme is always applied (never depends on the OS setting after first use), and the
  button shows the theme it will switch to. First run still follows the device's OS preference.

### v1.0.2 - 02 Sep 2026
- Service worker switched to network-first (fresh code loads when online, cache used offline)
  and the app now auto-reloads when a new version takes over. This fixes updates (incl. the
  theme fix) getting stuck behind a stale cache on the hosted/installed PWA.

### v1.0.1 - 02 Sep 2026
- Fixed the Light/Dark/Auto theme toggle on dark-OS devices (and the installed/hosted PWA):
  theme selection is now explicit and specificity-proof, and the OS-dark media query applies
  in Auto mode only. Bumped the service-worker cache so the fix reaches installed users.

### v1.0.0 - 02 Sep 2026
- First release. Multiplication times tables 1x-20x.
- Multi-profile (name, boy/girl, age, avatar) with per-profile progress.
- Difficulty levels + pick-a-table dialog; 10-question rounds; optional Timer.
- Multiple-choice with near-miss distractors; personalised feedback.
- Stars, streaks, badges; mastery grid 1x-20x.
- Sound effects + optional background music; light/dark theming.
- Installable, offline PWA; local-first storage.

## Licence
MIT - see [LICENSE](./LICENSE).

## Notes / future ideas
- Optional export/import of a child's progress.
- More fun-fact-flavoured challenge questions.
