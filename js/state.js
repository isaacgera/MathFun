// state.js - the ONLY module that touches localStorage.
// Multi-profile model (SPEC R7 + profiles): a top-level store holds many profiles,
// each owning its own settings, bests, streaks, badges and mastery. Includes a
// migration from the old flat single-profile schema (v1) so no data is lost.

const PREFIX = 'mathfun_'; // production storage prefix
const STORE_KEY = PREFIX + 'store';
const OLD_STATE_KEY = PREFIX + 'state'; // v1 flat blob (pre-profiles)
const SCHEMA = 2;

// ----- shapes -----
function defaultProgress() {
  return {
    settings: { difficulty: null, table: null, timed: false, sound: true, music: false, theme: 'auto' },
    bests: { easy: 0, medium: 0, hard: 0, table: 0, longestStreak: 0 },
    streakDays: { count: 0, lastPlayedISO: null },
    badges: [],
    mastery: {}, // "AxB" (A<=B) -> { attempts: number[] } last <=5 (1 correct / 0 wrong)
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
  return { schema: SCHEMA, activeId: null, profiles: [] };
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

// ----- migration -----
// v1 (flat) -> v2 (profiles): wrap the old blob as a single "Player" profile.
function migrateFromV1() {
  try {
    const raw = localStorage.getItem(OLD_STATE_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw);
    if (!old || typeof old !== 'object') return null;
    const store = defaultStore();
    const p = newProfile({ name: 'Player', avatar: '\uD83E\uDD8A', age: 8 });
    p.progress = fillDefaults(
      {
        settings: old.settings,
        bests: old.bests,
        streakDays: old.streakDays,
        badges: old.badges,
        mastery: old.mastery,
      },
      defaultProgress()
    );
    store.profiles = [p];
    store.activeId = p.id;
    return store;
  } catch {
    return null;
  }
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
      progress: fillDefaults(p.progress ?? {}, defaultProgress()),
    };
    // Difficulty/table is a per-session pick, never restored on reload -> always start unchosen.
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
      // No v2 store yet - try to migrate from an old v1 blob, else start fresh.
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
    // Fresh session for this player: no difficulty/table pre-selected.
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
  p.progress = defaultProgress();
  save();
}
