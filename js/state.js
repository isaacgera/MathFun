// state.js - the ONLY module that touches localStorage.
// Multi-profile model (SPEC R7 + profiles): a top-level store holds many profiles,
// each owning its own settings, per-operation progress, streaks and badges. Theme is
// app-level (store root) so it works on every screen, including before a profile exists.
//
// v1.1: progress is keyed by OPERATION (SPEC R11.8, design sec 12.4).
//   progress.ops = { mul, add, sub, div }
//   - mul keeps { bests, mastery } (A x B facts)
//   - add/sub/div keep { bests, rounds, answered, correct } round-accuracy stats
//   badges + daily streak + longest streak stay profile-level; theme stays app-level.
//
// Migrations (no data loss, SPEC R7.4):
//   v1 flat blob            -> schema 2 (single "Player" profile)
//   schema 2 (per-profile bests/mastery) -> schema 3 (moved into ops.mul)

const PREFIX = 'mathfun_'; // production storage prefix
const STORE_KEY = PREFIX + 'store';
const OLD_STATE_KEY = PREFIX + 'state'; // v1 flat blob (pre-profiles)
const SCHEMA = 3;

export const OP_KEYS = ['mul', 'add', 'sub', 'div'];

// ----- shapes -----
function defaultMulProgress() {
  return {
    bests: { easy: 0, medium: 0, hard: 0, table: 0 },
    mastery: {}, // "AxB" (A<=B) -> { attempts: number[] } last <=5 (1 correct / 0 wrong)
  };
}

// add / sub / div: number-size levels, simple accuracy stats (no A x B grid).
function defaultOpStats() {
  return {
    bests: { easy: 0, medium: 0, hard: 0, superhard: 0 },
    rounds: 0,    // rounds finished for this operation
    answered: 0,  // total questions answered
    correct: 0,   // total answered correctly
  };
}

function defaultOps() {
  return {
    mul: defaultMulProgress(),
    add: defaultOpStats(),
    sub: defaultOpStats(),
    div: defaultOpStats(),
  };
}

function defaultProgress() {
  return {
    settings: {
      operation: null, // 'mul' | 'add' | 'sub' | 'div' - per-session pick
      difficulty: null,
      table: null,
      timed: false,
      sound: true,
      music: false,
    },
    ops: defaultOps(),
    longestStreak: 0,                          // best in-round streak (profile-level)
    streakDays: { count: 0, lastPlayedISO: null },
    badges: [],
  };
}

function newProfile({ name, avatar, age, gender }) {
  return {
    id: 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name || 'Player',
    avatar: avatar || '\uD83E\uDD8A',
    age: age || 8,
    gender: gender || null, // 'boy' | 'girl' | null
    createdISO: new Date().toISOString(),
    progress: defaultProgress(),
  };
}

function defaultStore() {
  // theme is app-level (not per-profile) so it works on every screen, including
  // before any profile exists (setup / who's-playing).
  return { schema: SCHEMA, activeId: null, theme: 'auto', profiles: [] };
}

// ----- helpers -----
function fillDefaults(target, defaults) {
  if (Array.isArray(defaults)) return Array.isArray(target) ? target : defaults;
  const out = { ...defaults };
  if (target && typeof target === 'object') {
    for (const key of Object.keys(defaults)) {
      const dv = defaults[key];
      if (dv && typeof dv === 'object' && !Array.isArray(dv)) {
        out[key] = fillDefaults(target[key] ?? {}, dv);
      } else {
        out[key] = key in target ? target[key] : dv;
      }
    }
  }
  return out;
}

// ----- migration: v1 flat -> profiles (per-operation from the start) -----
function migrateFromV1() {
  try {
    const raw = localStorage.getItem(OLD_STATE_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw);
    if (!old || typeof old !== 'object') return null;
    const store = defaultStore();
    const p = newProfile({ name: 'Player', avatar: '\uD83E\uDD8A', age: 8 });
    // Old v1 held flat bests/mastery -> becomes this profile's multiplication progress.
    if (old.mastery && typeof old.mastery === 'object') p.progress.ops.mul.mastery = old.mastery;
    if (old.bests && typeof old.bests === 'object') {
      p.progress.ops.mul.bests = fillDefaults(old.bests, defaultMulProgress().bests);
      if (typeof old.bests.longestStreak === 'number') p.progress.longestStreak = old.bests.longestStreak;
    }
    if (old.badges) p.progress.badges = Array.isArray(old.badges) ? old.badges : [];
    if (old.streakDays) p.progress.streakDays = fillDefaults(old.streakDays, defaultProgress().streakDays);
    if (old.settings) p.progress.settings = fillDefaults(old.settings, defaultProgress().settings);
    if (old.settings && (old.settings.theme === 'light' || old.settings.theme === 'dark')) {
      store.theme = old.settings.theme;
    }
    store.profiles = [p];
    store.activeId = p.id;
    return store;
  } catch {
    return null;
  }
}

// ----- migration: schema 2 (flat per-profile bests/mastery) -> schema 3 (ops.*) -----
// A v2 profile.progress had { settings, bests, streakDays, badges, mastery }.
// Move bests + mastery into ops.mul; keep longestStreak at profile level.
function migrateProgressV2toV3(oldProgress) {
  const prog = defaultProgress();
  if (!oldProgress || typeof oldProgress !== 'object') return prog;

  // settings: carry over what exists; new 'operation' field defaults to null.
  prog.settings = fillDefaults(oldProgress.settings ?? {}, prog.settings);

  // Old flat bests -> ops.mul.bests (+ longestStreak lifted to profile level).
  const oldBests = oldProgress.bests || {};
  prog.ops.mul.bests = {
    easy: oldBests.easy ?? 0,
    medium: oldBests.medium ?? 0,
    hard: oldBests.hard ?? 0,
    table: oldBests.table ?? 0,
  };
  prog.longestStreak = oldBests.longestStreak ?? oldProgress.longestStreak ?? 0;

  // Old flat mastery -> ops.mul.mastery (unchanged shape).
  if (oldProgress.mastery && typeof oldProgress.mastery === 'object') {
    prog.ops.mul.mastery = oldProgress.mastery;
  }

  // badges + daily streak stay profile-level.
  prog.badges = Array.isArray(oldProgress.badges) ? oldProgress.badges : [];
  prog.streakDays = fillDefaults(oldProgress.streakDays ?? {}, prog.streakDays);

  return prog;
}

// Normalise a stored profile.progress to v3 (migrating old schema-2 shape if needed).
function normaliseProgress(p) {
  const raw = p && p.progress;
  // Old shape has top-level bests/mastery and no `ops`. New shape has `ops`.
  if (raw && !raw.ops && (raw.bests || raw.mastery)) {
    return migrateProgressV2toV3(raw);
  }
  return fillDefaults(raw ?? {}, defaultProgress());
}

// ----- load/save -----
let store = null;

function normalise(s) {
  const base = fillDefaults(s, defaultStore());
  base.profiles = (base.profiles || []).map((p) => {
    const prof = {
      ...newProfile({ name: p.name, avatar: p.avatar, age: p.age, gender: p.gender }),
      ...p,
      gender: p.gender ?? null,
      progress: normaliseProgress(p),
    };
    // Operation/difficulty/table are per-session picks, never restored on reload.
    prof.progress.settings.operation = null;
    prof.progress.settings.difficulty = null;
    prof.progress.settings.table = null;
    return prof;
  });
  if (base.activeId && !base.profiles.some((p) => p.id === base.activeId)) {
    base.activeId = base.profiles[0]?.id ?? null;
  }
  base.schema = SCHEMA;
  return base;
}

export function load() {
  if (store) return store;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') throw new Error('bad shape');
      store = normalise(parsed);
    } else {
      // No stored profiles yet - try to migrate from an old v1 blob, else start fresh.
      const migrated = migrateFromV1();
      store = migrated ? normalise(migrated) : defaultStore();
      if (migrated) { save(); localStorage.removeItem(OLD_STATE_KEY); }
    }
  } catch (err) {
    console.warn('MathFun: could not read saved data, starting fresh.', err);
    store = defaultStore();
  }
  return store;
}

export function save() {
  if (!store) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn('MathFun: could not save data.', err);
  }
}

// ----- profile API -----
export function getStore() { return load(); }

export function listProfiles() { return load().profiles.slice(); }

export function hasProfiles() { return load().profiles.length > 0; }

export function activeProfile() {
  const s = load();
  return s.profiles.find((p) => p.id === s.activeId) || null;
}

export function createProfile(data) {
  const s = load();
  const p = newProfile(data);
  s.profiles.push(p);
  s.activeId = p.id;
  save();
  return p;
}

export function updateProfile(id, patch) {
  const s = load();
  const p = s.profiles.find((x) => x.id === id);
  if (!p) return null;
  if ('name' in patch) p.name = patch.name;
  if ('avatar' in patch) p.avatar = patch.avatar;
  if ('age' in patch) p.age = patch.age;
  if ('gender' in patch) p.gender = patch.gender;
  save();
  return p;
}

export function setActive(id) {
  const s = load();
  const p = s.profiles.find((x) => x.id === id);
  if (p) {
    // Fresh session for this player: no operation/difficulty/table pre-selected.
    p.progress.settings.operation = null;
    p.progress.settings.difficulty = null;
    p.progress.settings.table = null;
    s.activeId = id;
    save();
  }
  return activeProfile();
}

export function deleteProfile(id) {
  const s = load();
  s.profiles = s.profiles.filter((p) => p.id !== id);
  if (s.activeId === id) s.activeId = s.profiles[0]?.id ?? null;
  save();
}

// ----- active-profile progress accessors (used across the app) -----
// getState() returns the ACTIVE profile's progress, so existing callers keep working.
export function getState() {
  const p = activeProfile();
  return p ? p.progress : defaultProgress();
}

export function updateSettings(patch) {
  const p = activeProfile();
  if (!p) return null;
  p.progress.settings = { ...p.progress.settings, ...patch };
  save();
  return p.progress.settings;
}

export function resetActiveProgress() {
  const p = activeProfile();
  if (!p) return;
  const keep = p.progress.settings;
  p.progress = defaultProgress();
  p.progress.settings = { ...p.progress.settings, sound: keep.sound, music: keep.music, timed: keep.timed };
  save();
}

// ----- app-level theme (works with or without an active profile) -----
export function getTheme() {
  return load().theme || 'auto';
}

export function setTheme(theme) {
  const s = load();
  s.theme = theme;
  save();
  return theme;
}

// ----- per-operation progress (v1.1) -----
export function setOperation(opKey) {
  return updateSettings({ operation: opKey, difficulty: null, table: null });
}

// The currently active operation key (defaults to 'mul' if none picked yet).
export function currentOp() {
  const s = getState();
  return s.settings.operation || 'mul';
}

// Return the active profile's progress slice for an operation (defaults to active op).
export function getOpProgress(opKey = currentOp()) {
  const s = getState();
  if (!s.ops[opKey]) s.ops[opKey] = opKey === 'mul' ? defaultMulProgress() : defaultOpStats();
  return s.ops[opKey];
}

// Best score per (operation, difficulty/level). Returns whether a new best was set.
export function recordBest(opKey, levelKey, score) {
  const op = getOpProgress(opKey);
  if (!op.bests) op.bests = {};
  const prev = op.bests[levelKey] ?? 0;
  if (score > prev) { op.bests[levelKey] = score; save(); return true; }
  return false;
}

// Accumulate simple round/accuracy stats for add/sub/div.
export function recordOpRound(opKey, { answered, correct }) {
  const op = getOpProgress(opKey);
  op.rounds = (op.rounds ?? 0) + 1;
  op.answered = (op.answered ?? 0) + (answered ?? 0);
  op.correct = (op.correct ?? 0) + (correct ?? 0);
  save();
}
