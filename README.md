# MathFun

A playful, local-first **times-tables game** for kids aged 5-15. Practise multiplication
from **1x1 to 20x20** by tapping one of four answers, and earn stars, streaks and badges
along the way. Built as an installable, offline-capable PWA.

**Live demo:** https://isaacgera.github.io/MathFun/

> v1 covers multiplication only. The name is kept broad so addition, subtraction and
> division can be added later.

## Features
- **Multiple players** - each child has their own profile (name, boy/girl, age 5-15,
  fun character avatar) with their own progress, bests, badges and mastery.
- **Difficulty levels** - Easy (tables 1-5), Medium (1-10), Hard (1-20), plus a
  **Pick a table** dialog to drill any single table 1x-20x.
- **Multiple-choice answers** - four options with believable near-miss distractors.
- **10-question rounds** - untimed by default, with an optional **Timer** challenge.
- **Encouraging, personalised feedback** - praise uses the child's name and boy/girl term.
- **Rewards** - stars per round, daily streaks, and collectable badges.
- **My Progress** - a colourful mastery grid (1x-20x) showing solid / okay / needs-work facts.
- **Sound & Music** - synthesized effects and a gentle background tune (both optional).
- **Light / dark theme** - follows the device and can be toggled; choice persists.
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
    state.js            localStorage (the only module that touches it)
    questions.js        fact pools + near-miss distractor generation
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
- Add other operations (+, -, x). (Keep aligned with the separate "Maths Quiz Builder" idea.)
- Store-quality raster icons (192 / 512 / maskable PNGs) - currently a single SVG icon.
- Optional export/import of a child's progress.
