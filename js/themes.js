// themes.js - selectable "character" themes (skins), a parallel axis to the Light/Dark
// theme (SPEC R13, v1.3). A skin is applied via `data-skin="<key>"` on <html>; the
// matching CSS block in styles.css restyles the palette + background, while the existing
// `data-theme="light|dark"` still layers on top (so every skin has a light and a dark form).
//
// Themes are ORIGINAL and trademark-safe: colour palettes, generic emoji and a vibe -
// no copyrighted names, characters, logos or music. Rename freely for personal use.
//
// Each theme declares:
//   key       - stable id stored per profile
//   name      - display label in the picker/menu
//   emoji     - a representative emoji for the picker tile + menu
//   tagline   - one friendly line shown under the name in the picker
//   tune      - which sound "flavour" this skin uses (see sound.js TUNES)
//   ops       - optional emoji overrides for the four operation tiles {add,sub,mul,div}
//   tabs      - optional emoji overrides for the Fun Facts + Daily Challenge tiles
//   hintIcon  - the emoji shown on the "Need a Hint?" button + hint text
//   avatars   - on-theme character emoji offered at the avatar step (v1.3)
//   isDefault - the theme used before any profile exists (Math World)

export const DEFAULT_THEME = 'math';

// A small neutral fallback row appended to every theme's avatar set, so there's always a
// familiar option even if a theme's own set feels thin (child-safe emoji, no photos).
export const FALLBACK_AVATARS = [
  '\uD83D\uDE0A', // smiley
  '\uD83D\uDE0E', // cool (sunglasses)
  '\uD83D\uDC31', // cat
  '\uD83D\uDC36', // dog
  '\u2B50',       // star
];

// Registry. Order here drives the picker order (default first).
export const THEMES = {
  // ---- Default: pure maths symbols & operations. Loads before profile creation. ----
  math: {
    key: 'math', name: 'Math World', emoji: '\u2795', // heavy plus
    tagline: 'Numbers, symbols & sums',
    tune: 'math', isDefault: true,
    ops:  { add: '\u2795', sub: '\u2796', mul: '\u2716\uFE0F', div: '\u2797' }, // + - x div
    tabs: { facts: '\uD83C\uDF1F', daily: '\uD83C\uDFC6' },                      // star, trophy
    hintIcon: '\uD83D\uDCA1',                                                    // bulb
    // Maths-y neutral characters: numbers, abacus, brain, pencil, ruler, 100, dice...
    avatars: ['\uD83D\uDD22', '\uD83E\uDDEE', '\uD83E\uDDE0', '\u270F\uFE0F', '\uD83D\uDCD0', '\uD83D\uDCAF', '\uD83C\uDFB2', '\u2795', '\u2716\uFE0F', '\uD83E\uDD16'],
  },

  // ---- Plumber World (Mario-flavoured, original) ----
  plumber: {
    key: 'plumber', name: 'Plumber World', emoji: '\uD83C\uDF44', // mushroom
    tagline: 'Jump, coins & warp pipes',
    tune: 'plumber',
    ops:  { add: '\uD83C\uDF44', sub: '\uD83D\uDC22', mul: '\u2B50', div: '\uD83E\uDE99' }, // mushroom, turtle, star, coin
    tabs: { facts: '\uD83C\uDF1F', daily: '\uD83C\uDFF0' },                                  // star, castle
    hintIcon: '\uD83C\uDF44',
    // mushroom, turtle, star, coin, castle, flower, cloud, fireball, gem, crown
    avatars: ['\uD83C\uDF44', '\uD83D\uDC22', '\u2B50', '\uD83E\uDE99', '\uD83C\uDFF0', '\uD83C\uDF3C', '\u2601\uFE0F', '\uD83D\uDD25', '\uD83D\uDC8E', '\uD83D\uDC51'],
  },

  // ---- Dino Valley (Jurassic-flavoured, original) ----
  dino: {
    key: 'dino', name: 'Dino Valley', emoji: '\uD83E\uDD96', // T-rex
    tagline: 'Prehistoric adventure',
    tune: 'dino',
    ops:  { add: '\uD83E\uDD95', sub: '\uD83E\uDD96', mul: '\uD83E\uDD5A', div: '\uD83C\uDF3F' }, // sauropod, t-rex, egg, herb
    tabs: { facts: '\uD83E\uDDB4', daily: '\uD83C\uDF0B' },                                        // bone, volcano
    hintIcon: '\uD83E\uDD95',
    // t-rex, sauropod, egg, lizard, dragon, volcano, bone, palm, croc, turtle
    avatars: ['\uD83E\uDD96', '\uD83E\uDD95', '\uD83E\uDD5A', '\uD83E\uDD8E', '\uD83D\uDC09', '\uD83C\uDF0B', '\uD83E\uDDB4', '\uD83C\uDF34', '\uD83D\uDC0A', '\uD83D\uDC22'],
  },

  // ---- Speedy Hedgehog (Sonic-flavoured, original) ----
  hedgehog: {
    key: 'hedgehog', name: 'Speedy Hedgehog', emoji: '\uD83E\uDD94', // hedgehog
    tagline: 'Fast rings & loops',
    tune: 'hedgehog',
    ops:  { add: '\uD83D\uDC8D', sub: '\uD83E\uDD94', mul: '\u26A1', div: '\uD83D\uDD35' }, // ring, hedgehog, zap, blue circle
    tabs: { facts: '\uD83C\uDF1F', daily: '\uD83C\uDFCE\uFE0F' },                            // star, race car
    hintIcon: '\u26A1',
    // hedgehog, ring, zap, race car, running, fox, sparkles, blue circle, comet, chipmunk
    avatars: ['\uD83E\uDD94', '\uD83D\uDC8D', '\u26A1', '\uD83C\uDFCE\uFE0F', '\uD83C\uDFC3', '\uD83E\uDD8A', '\u2728', '\uD83D\uDD35', '\u2604\uFE0F', '\uD83D\uDC3F\uFE0F'],
  },

  // ---- Magic Kingdom (Mickey/fairy-tale-flavoured, original) ----
  magic: {
    key: 'magic', name: 'Magic Kingdom', emoji: '\uD83C\uDFF0', // castle
    tagline: 'Sparkles & happy magic',
    tune: 'magic',
    ops:  { add: '\u2728', sub: '\uD83C\uDF89', mul: '\uD83C\uDF1F', div: '\uD83C\uDF80' }, // sparkles, party, star, ribbon
    tabs: { facts: '\uD83E\uDDDA', daily: '\uD83C\uDFA0' },                                  // fairy, carousel
    hintIcon: '\u2728',
    // fairy, unicorn, castle, mage, princess crown, sparkles, rainbow, star, magic wand, dragon
    avatars: ['\uD83E\uDDDA', '\uD83E\uDD84', '\uD83C\uDFF0', '\uD83E\uDDD9', '\uD83D\uDC78', '\u2728', '\uD83C\uDF08', '\uD83C\uDF1F', '\uD83E\uDE84', '\uD83D\uDC09'],
  },

  // ---- Space Blast (cosmic) ----
  space: {
    key: 'space', name: 'Space Blast', emoji: '\uD83D\uDE80', // rocket
    tagline: 'Rockets, stars & planets',
    tune: 'space',
    ops:  { add: '\uD83D\uDE80', sub: '\uD83C\uDF20', mul: '\uD83E\uDE90', div: '\uD83D\uDEF8' }, // rocket, shooting star, saturn, ufo
    tabs: { facts: '\uD83C\uDF0C', daily: '\uD83D\uDC7D' },                                        // milky way, alien
    hintIcon: '\uD83D\uDE80',
    // rocket, alien, ufo, saturn, astronaut, star, comet, moon, satellite, earth
    avatars: ['\uD83D\uDE80', '\uD83D\uDC7D', '\uD83D\uDEF8', '\uD83E\uDE90', '\uD83D\uDC68\u200D\uD83D\uDE80', '\u2B50', '\u2604\uFE0F', '\uD83C\uDF19', '\uD83D\uDEF0\uFE0F', '\uD83C\uDF0D'],
  },

  // ---- Ocean Deep (underwater) ----
  ocean: {
    key: 'ocean', name: 'Ocean Deep', emoji: '\uD83D\uDC19', // octopus
    tagline: 'Dive with sea friends',
    tune: 'ocean',
    ops:  { add: '\uD83D\uDC20', sub: '\uD83D\uDC19', mul: '\uD83D\uDC33', div: '\uD83E\uDD88' }, // fish, octopus, whale, shark
    tabs: { facts: '\uD83D\uDC1A', daily: '\uD83C\uDF0A' },                                        // shell, wave
    hintIcon: '\uD83D\uDC1F',
    // octopus, tropical fish, whale, shark, dolphin, turtle, crab, shell, blowfish, jellyfish
    avatars: ['\uD83D\uDC19', '\uD83D\uDC20', '\uD83D\uDC33', '\uD83E\uDD88', '\uD83D\uDC2C', '\uD83D\uDC22', '\uD83E\uDD80', '\uD83D\uDC1A', '\uD83D\uDC21', '\uD83E\uDEBC'],
  },

  // ---- Jungle Safari ----
  jungle: {
    key: 'jungle', name: 'Jungle Safari', emoji: '\uD83E\uDD81', // lion
    tagline: 'Wild animals & vines',
    tune: 'jungle',
    ops:  { add: '\uD83D\uDC12', sub: '\uD83E\uDD81', mul: '\uD83D\uDC18', div: '\uD83E\uDD92' }, // monkey, lion, elephant, giraffe
    tabs: { facts: '\uD83C\uDF34', daily: '\uD83E\uDD9C' },                                        // palm, parrot
    hintIcon: '\uD83D\uDC12',
    // lion, monkey, elephant, giraffe, tiger, zebra, parrot, snake, gorilla, leopard
    avatars: ['\uD83E\uDD81', '\uD83D\uDC12', '\uD83D\uDC18', '\uD83E\uDD92', '\uD83D\uDC05', '\uD83E\uDD93', '\uD83E\uDD9C', '\uD83D\uDC0D', '\uD83E\uDD8D', '\uD83D\uDC06'],
  },

  // ---- Candy Land (sweets) ----
  candy: {
    key: 'candy', name: 'Candy Land', emoji: '\uD83C\uDF6D', // lollipop
    tagline: 'Sweet treats & sugar',
    tune: 'candy',
    ops:  { add: '\uD83C\uDF6C', sub: '\uD83C\uDF6D', mul: '\uD83E\uDDC1', div: '\uD83C\uDF69' }, // candy, lollipop, cupcake, doughnut
    tabs: { facts: '\uD83C\uDF6E', daily: '\uD83C\uDF6B' },                                        // custard, chocolate
    hintIcon: '\uD83C\uDF6C',
    // lollipop, candy, cupcake, doughnut, ice cream, chocolate, cookie, cake, honey, shaved ice
    avatars: ['\uD83C\uDF6D', '\uD83C\uDF6C', '\uD83E\uDDC1', '\uD83C\uDF69', '\uD83C\uDF66', '\uD83C\uDF6B', '\uD83C\uDF6A', '\uD83C\uDF82', '\uD83C\uDF6F', '\uD83C\uDF67'],
  },

  // ---- Robot Lab (tech) ----
  robot: {
    key: 'robot', name: 'Robot Lab', emoji: '\uD83E\uDD16', // robot
    tagline: 'Gears, bots & circuits',
    tune: 'robot',
    ops:  { add: '\uD83D\uDD0B', sub: '\uD83E\uDD16', mul: '\u2699\uFE0F', div: '\uD83D\uDCA1' }, // battery, robot, gear, bulb
    tabs: { facts: '\uD83D\uDD2C', daily: '\uD83D\uDEF0\uFE0F' },                                  // microscope, satellite
    hintIcon: '\uD83D\uDD0C',
    // robot, alien monster, gear, battery, bulb, satellite, floppy, magnet, nut+bolt, joystick
    avatars: ['\uD83E\uDD16', '\uD83D\uDC7E', '\u2699\uFE0F', '\uD83D\uDD0B', '\uD83D\uDCA1', '\uD83D\uDEF0\uFE0F', '\uD83D\uDCBE', '\uD83E\uDDF2', '\uD83D\uDD29', '\uD83D\uDD79\uFE0F'],
  },
};

// Picker/menu order (default first, then the fun ones).
export const THEME_ORDER = [
  'math', 'plumber', 'dino', 'hedgehog', 'magic',
  'space', 'ocean', 'jungle', 'candy', 'robot',
];

// Safe lookup - unknown/empty keys fall back to the default Math World theme.
export function getTheme(key) {
  return THEMES[key] || THEMES[DEFAULT_THEME];
}

// Is this a real, known theme key?
export function isThemeKey(key) {
  return typeof key === 'string' && Object.prototype.hasOwnProperty.call(THEMES, key);
}

// The operation-tile emoji for the active skin (falls back to the operation's own emoji).
export function opEmoji(themeKey, opKey, fallback) {
  const t = getTheme(themeKey);
  return (t.ops && t.ops[opKey]) || fallback;
}

// The tab-tile emoji (Fun Facts / Daily Challenge) for the active skin.
export function tabEmoji(themeKey, tabKey, fallback) {
  const t = getTheme(themeKey);
  return (t.tabs && t.tabs[tabKey]) || fallback;
}

// The hint-button icon for the active skin.
export function hintIcon(themeKey) {
  return getTheme(themeKey).hintIcon || '\uD83D\uDCA1';
}

// The avatar set offered for a theme: the theme's own on-theme characters first, then a
// small neutral fallback row - de-duplicated, so there's always a familiar option (v1.3).
export function themeAvatars(themeKey) {
  const own = getTheme(themeKey).avatars || [];
  const seen = new Set();
  const out = [];
  for (const a of [...own, ...FALLBACK_AVATARS]) {
    if (!seen.has(a)) { seen.add(a); out.push(a); }
  }
  return out;
}

// Pick a random on-theme avatar for a theme (v1.3). Used when the theme changes so the
// player's character auto-matches the new theme without them having to re-pick. Prefers
// the theme's OWN characters (not the neutral fallback). `avoid` skips a current value so a
// change is visible; falls back gracefully if the set is tiny.
export function randomThemeAvatar(themeKey, avoid) {
  const own = getTheme(themeKey).avatars || [];
  const pool = own.length ? own : themeAvatars(themeKey);
  const choices = pool.filter((a) => a !== avoid);
  const from = choices.length ? choices : pool;
  return from[Math.floor(Math.random() * from.length)];
}
