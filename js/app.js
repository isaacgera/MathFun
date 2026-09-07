// app.js - bootstrap, screen routing, profile flow, and wiring (SPEC sec 1, sec 12).
// Exposes a small window.MathFun bridge so markup-created buttons can call back.
// v1.1: Operations picker between profile-selection and the Mode screen; a nav history
// stack so each screen's back arrow returns to the ACTUAL previous screen; and a header
// Home button that jumps to the Operations picker.

import * as state from './state.js';
import * as game from './game.js';
import * as rewards from './rewards.js';
import * as sound from './sound.js';
import * as ui from './ui.js';
import { getOperation } from './operations.js';

export const APP_VERSION = '1.1.0';

const screens = {
  who: document.getElementById('screen-who'),
  setup: document.getElementById('screen-setup'),
  ops: document.getElementById('screen-ops'),
  home: document.getElementById('screen-home'),
  play: document.getElementById('screen-play'),
  results: document.getElementById('screen-results'),
  mastery: document.getElementById('screen-mastery'),
  rewards: document.getElementById('screen-rewards'),
  help: document.getElementById('screen-help'),
};

let round = null;
let timerId = null;
let timerStart = 0;

// ---------- Navigation history ----------
// Each navigable destination is a named route mapped to its render function. We keep a
// stack of visited routes so a screen's back arrow returns to the actual previous screen,
// not always "home". The Play screen is intentionally NOT a route: its back is a
// deliberate "quit round" that returns to the Mode screen.
const routes = {
  who: () => renderWhoPlaying(),
  ops: () => renderOperationsScreen(),
  home: () => renderHomeScreen(),
  progress: () => renderProgressScreen(),
  rewards: () => renderRewardsScreen(),
  help: () => renderHelpScreen(),
  editProfile: () => renderEditProfile(),
};
let navStack = [];        // history of route names (excludes the current one)
let currentRoute = null;  // route name currently shown

// Go to a route, remembering where we came from (unless replacing the current entry).
function navigate(name, { replace = false } = {}) {
  if (!routes[name]) return;
  if (!replace && currentRoute && currentRoute !== name) navStack.push(currentRoute);
  currentRoute = name;
  routes[name]();
}

// Back to the previous route; fall back to the operations picker (or who-playing).
function goBack() {
  const prev = navStack.pop();
  currentRoute = null; // navigate() replaces the current entry, no re-push
  navigate(prev || (state.activeProfile() ? 'ops' : 'who'), { replace: true });
}

// Reset the history to a single root (used on jumps "home" and after profile changes).
function resetTo(name) {
  navStack = [];
  currentRoute = null;
  navigate(name, { replace: true });
}

// ---------- Theme (app-level, two-way Light <-> Dark) ----------
// Always applies an explicit data-theme so the result never depends on the OS after first use.
function osPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function resolveTheme(theme) {
  if (theme === 'light' || theme === 'dark') return theme;
  return osPrefersDark() ? 'dark' : 'light';
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', resolveTheme(theme));
}
function cycleTheme() {
  const current = resolveTheme(state.getTheme());
  const next = current === 'dark' ? 'light' : 'dark';
  state.setTheme(next);
  applyTheme(next);
  updateThemeButton(next);
}
function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const resolved = resolveTheme(theme);
  const switchTo = resolved === 'dark' ? 'light' : 'dark';
  btn.textContent = resolved === 'dark' ? '\uD83C\uDF19 Dark' : '\u2600\uFE0F Light';
  btn.setAttribute('aria-label', `Switch to ${switchTo} theme`);
  btn.setAttribute('title', `Switch to ${switchTo} theme`);
}

// ---------- Header (Home button + profile chip) ----------
function updateHeader() {
  const p = state.activeProfile();
  const homeBtn = document.getElementById('headerHomeBtn');
  if (homeBtn) homeBtn.classList.toggle('hidden', !p); // only when a profile is active
  ui.renderProfileChip(p, {
    profile: () => navigate('editProfile'),
    rewards: () => navigate('rewards'),
    progress: () => navigate('progress'),
    help: () => navigate('help'),
    switch: showWhoPlaying,
  });
}

// ---------- Profile flow ----------
// The create/setup screen is a modal-like flow, rendered directly (not a history route);
// it returns to a real route on save/cancel.
function boot() {
  navStack = [];
  currentRoute = null;
  if (!state.hasProfiles()) {
    showSetup({ canCancel: false });
  } else if (!state.activeProfile()) {
    resetTo('who');
  } else {
    resetTo('ops');
  }
}

function showWhoPlaying() {
  sound.stopMusic();
  resetTo('who'); // choosing a player is a fresh start; clear history
}

function renderWhoPlaying() {
  sound.stopMusic();
  ui.renderWhoPlaying(screens.who, state.listProfiles(), {
    onPick: (id) => { state.setActive(id); afterProfileChosen(); },
    onAdd: () => showSetup({ canCancel: state.hasProfiles() }),
  });
  ui.showScreen('screen-who');
  updateHeader();
}

// CREATE new profile (stepped wizard) - direct render, not a history route.
function showSetup({ canCancel }) {
  ui.renderSetup(screens.setup, { canCancel }, {
    onSave: (data) => { state.createProfile(data); afterProfileChosen(); },
    onCancel: () => (state.activeProfile() ? resetTo('ops') : resetTo('who')),
  });
  ui.showScreen('screen-setup');
  updateHeader();
}

// EDIT existing profile (summary view + all-fields-at-once edit) - a history route.
function renderEditProfile() {
  const profile = state.activeProfile();
  if (!profile) { goBack(); return; }
  ui.renderProfileSummary(screens.setup, profile, {
    onHome: goBack,
    onSave: (data) => {
      state.updateProfile(profile.id, data);
      const s = state.getState();
      if (s.settings.music) sound.startMusic(); else sound.stopMusic();
      goBack();
    },
    onDelete: () => {
      if (confirm('Delete this player and all their progress?')) {
        state.deleteProfile(profile.id);
        boot();
      }
    },
  });
  ui.showScreen('screen-setup');
  updateHeader();
}

function afterProfileChosen() {
  const s = state.getState();
  applyTheme(state.getTheme());
  updateThemeButton(state.getTheme());
  if (s.settings.music) sound.startMusic(); else sound.stopMusic();
  resetTo('ops');
}

// ---------- Operations picker (v1.1) ----------
function renderOperationsScreen() {
  clearTimer();
  // Reset the per-session operation/difficulty each time we land here.
  state.updateSettings({ operation: null, difficulty: null, table: null });
  ui.renderOperations(screens.ops, {
    onPick: (opKey) => { state.setOperation(opKey); navigate('home'); },
  });
  updateHeader();
  ui.showScreen('screen-ops');
}

// ---------- Home (Mode) ----------
function renderHomeScreen() {
  clearTimer();
  const s = state.getState();
  ui.renderHome(screens.home, s, {
    onBackToOps: goBack,
    onDifficulty: (d) => { state.updateSettings({ difficulty: d }); renderHomeScreen(); },
    onPickTable: () => {
      ui.renderTableDialog(state.getState().settings.table, {
        onChoose: (n) => { state.updateSettings({ difficulty: 'table', table: n }); renderHomeScreen(); },
        onCancel: () => {},
      });
    },
    onTimed: (v) => state.updateSettings({ timed: v }),
    onSound: (v) => { state.updateSettings({ sound: v }); if (v) sound.unlock(); },
    onMusic: (v) => { state.updateSettings({ music: v }); v ? sound.startMusic() : sound.stopMusic(); },
    onPlay: startRound,
  });
  updateHeader();
  ui.showScreen('screen-home');
}

// ---------- Play ----------
function currentMode() {
  const s = state.getState();
  const op = s.settings.operation || 'mul';
  const mode = { op, difficulty: s.settings.difficulty, table: s.settings.table };
  if (op === 'mul' && mode.difficulty === 'table' && !mode.table) mode.table = 2; // sensible default
  return mode;
}

function startRound() {
  const st = state.getState();
  if (!st.settings.operation) { resetTo('ops'); return; }
  if (!st.settings.difficulty) {
    const msg = document.getElementById('homeMsg');
    if (msg) msg.textContent = 'Pick a level first!';
    return;
  }
  if (st.settings.sound) sound.unlock();
  round = game.createRound(currentMode());
  ui.renderPlayShell(screens.play, round.mode);
  ui.showScreen('screen-play');
  ui.setTimerVisible(screens.play, state.getState().settings.timed);
  game.nextQ(round);
  ui.renderQuestion(screens.play, round);
  startTimerIfNeeded();
}

function startTimerIfNeeded() {
  clearTimer();
  if (!state.getState().settings.timed) return;
  timerStart = performance.now();
  ui.setTimer(screens.play, 1);
  const tick = () => {
    const elapsed = (performance.now() - timerStart) / 1000;
    const frac = 1 - elapsed / game.TIMER_SECONDS;
    ui.setTimer(screens.play, frac);
    if (frac <= 0) { onTimeout(); return; }
    timerId = requestAnimationFrame(tick);
  };
  timerId = requestAnimationFrame(tick);
}

function clearTimer() {
  if (timerId) { cancelAnimationFrame(timerId); timerId = null; }
}

function onTimeout() {
  clearTimer();
  if (!round || round.isAnswered) return;
  finishQuestion(game.timeout(round));
}

function answerQuestion(value) {
  if (!round || round.isAnswered) return;
  clearTimer();
  finishQuestion(game.answer(round, value));
}

function finishQuestion(result) {
  const s = state.getState();
  ui.showFeedback(screens.play, result, round.current.correct, state.activeProfile());
  if (s.settings.sound) { result.correct ? sound.correct() : sound.wrong(); }
  setTimeout(() => {
    const hasNext = game.advance(round);
    if (hasNext) { ui.renderQuestion(screens.play, round); startTimerIfNeeded(); }
    else { endRound(); }
  }, result.correct ? 850 : 1500);
}

function endRound() {
  clearTimer();
  const s = state.getState();
  const summary = rewards.finishRound({
    mode: round.mode,
    score: round.score,
    bestInRoundStreak: round.bestInRoundStreak,
    answered: round.answered,
    correct: round.correct,
  });
  if (s.settings.sound && (summary.stars >= 2 || summary.newBadges.length)) sound.reward();
  ui.renderResults(screens.results, {
    score: round.score,
    stars: summary.stars,
    newBadges: summary.newBadges,
    newBest: summary.newBest,
    dailyStreak: summary.dailyStreak,
  }, { onAgain: startRound, onHome: () => resetTo('home') });
  ui.showScreen('screen-results');
}

// ---------- Progress / Rewards / Help (history routes) ----------
function renderProgressScreen() {
  const opKey = state.currentOp();
  ui.renderProgress(screens.mastery, opKey, state.getOpProgress(opKey), { onHome: goBack });
  ui.showScreen('screen-mastery');
  updateHeader();
}
function renderRewardsScreen() {
  ui.renderRewards(screens.rewards, state.getState(), { onHome: goBack });
  ui.showScreen('screen-rewards');
  updateHeader();
}
function renderHelpScreen() {
  ui.showScreen('screen-help');
  updateHeader();
}

// ---------- Keyboard answering (1-4) ----------
document.addEventListener('keydown', (e) => {
  if (!screens.play.classList.contains('is-active') || !round || round.isAnswered) return;
  const n = Number(e.key);
  if (n >= 1 && n <= 4) {
    const btns = screens.play.querySelectorAll('.option');
    const btn = btns[n - 1];
    if (btn) { e.preventDefault(); answerQuestion(Number(btn.dataset.value)); }
  }
});

// ---------- Bridge for markup-created buttons ----------
// Play screen back = deliberate quit to the Mode screen (round abandoned), not a history pop.
window.MathFun = { answer: answerQuestion, goHome: () => { round = null; navigate('home', { replace: true }); } };

// Robust theme toggle via event delegation - fires even if a direct binding is missed,
// and survives any header re-render.
document.addEventListener('click', (e) => {
  const el = e.target instanceof Element ? e.target.closest('#themeToggle') : null;
  if (el) { e.preventDefault(); cycleTheme(); }
});

// ---------- Init ----------
function init() {
  applyTheme(state.getTheme());
  updateThemeButton(state.getTheme());
  // Theme toggle handled by the delegated document click listener above (single binding).
  document.getElementById('headerHomeBtn')?.addEventListener('click', () => resetTo('ops'));
  document.getElementById('helpBack')?.addEventListener('click', goBack);
  document.getElementById('brandHome')?.addEventListener('click', () => location.reload());
  const vEl = document.getElementById('appVersion');
  if (vEl) vEl.textContent = APP_VERSION;

  boot();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => { reg.update?.(); }).catch(() => {});
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    });
  }
}

init();
