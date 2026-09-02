// app.js - bootstrap, screen routing, profile flow, and wiring (SPEC sec 1).
// Exposes a small window.MathFun bridge so markup-created buttons can call back.

import * as state from './state.js';
import * as game from './game.js';
import * as rewards from './rewards.js';
import * as sound from './sound.js';
import * as ui from './ui.js';

export const APP_VERSION = '1.0.4';

const screens = {
  who: document.getElementById('screen-who'),
  setup: document.getElementById('screen-setup'),
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

// ---------- Theme ----------
// Simple two-way Light <-> Dark toggle: every tap visibly flips the palette (no
// identical-looking "auto" middle state). Always applies an explicit data-theme so the
// result never depends on the device's OS setting.
function osPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function resolveTheme(theme) {
  // Any legacy/auto/empty value resolves to the current OS preference on first use.
  if (theme === 'light' || theme === 'dark') return theme;
  return osPrefersDark() ? 'dark' : 'light';
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', resolveTheme(theme));
}
function cycleTheme() {
  const current = resolveTheme(state.getState().settings.theme);
  const next = current === 'dark' ? 'light' : 'dark';
  state.updateSettings({ theme: next });
  applyTheme(next);
  updateThemeButton(next);
}
function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const resolved = resolveTheme(theme);
  // Show what a tap will switch TO, so the action is clear.
  btn.textContent = resolved === 'dark' ? '\u2600\uFE0F Light' : '\uD83C\uDF19 Dark';
  btn.setAttribute('aria-label', `Switch to ${resolved === 'dark' ? 'light' : 'dark'} theme`);
}

// ---------- Profile chip (header) ----------
function refreshChip() {
  const p = state.activeProfile();
  ui.renderProfileChip(p, {
    profile: showEditProfile,
    rewards: showRewards,
    progress: showMastery,
    help: () => ui.showScreen('screen-help'),
    switch: showWhoPlaying,
  });
}

// ---------- Profile flow ----------
function boot() {
  if (!state.hasProfiles()) {
    showSetup({ canCancel: false });
  } else if (!state.activeProfile()) {
    showWhoPlaying();
  } else {
    goHome();
  }
}

function showWhoPlaying() {
  sound.stopMusic();
  ui.renderWhoPlaying(screens.who, state.listProfiles(), {
    onPick: (id) => { state.setActive(id); afterProfileChosen(); },
    onAdd: () => showSetup({ canCancel: state.hasProfiles() }),
  });
  ui.showScreen('screen-who');
  refreshChip();
}

// CREATE new profile (stepped wizard).
function showSetup({ canCancel }) {
  ui.renderSetup(screens.setup, { canCancel }, {
    onSave: (data) => {
      state.createProfile(data);
      // No difficulty pre-selected - the child picks it on the play screen each time.
      afterProfileChosen();
    },
    onCancel: () => (state.activeProfile() ? goHome() : showWhoPlaying()),
  });
  ui.showScreen('screen-setup');
  refreshChip();
}

// EDIT existing profile (summary view + all-fields-at-once edit).
function showEditProfile() {
  const profile = state.activeProfile();
  if (!profile) return;
  ui.renderProfileSummary(screens.setup, profile, {
    onHome: goHome,
    onSave: (data) => {
      state.updateProfile(profile.id, data);
      afterProfileChosen();
    },
    onDelete: () => {
      if (confirm('Delete this player and all their progress?')) {
        state.deleteProfile(profile.id);
        boot();
      }
    },
  });
  ui.showScreen('screen-setup');
  refreshChip();
}

function afterProfileChosen() {
  const s = state.getState();
  applyTheme(s.settings.theme);
  updateThemeButton(s.settings.theme);
  // Sync background music with this profile's setting.
  if (s.settings.music) sound.startMusic(); else sound.stopMusic();
  refreshChip();
  goHome();
}

// ---------- Home ----------
function goHome() {
  clearTimer();
  const s = state.getState();
  ui.renderHome(screens.home, s, {
    onDifficulty: (d) => { state.updateSettings({ difficulty: d }); goHome(); },
    onPickTable: () => {
      ui.renderTableDialog(state.getState().settings.table, {
        onChoose: (n) => { state.updateSettings({ difficulty: 'table', table: n }); goHome(); },
        onCancel: () => {},
      });
    },
    onTimed: (v) => state.updateSettings({ timed: v }),
    onSound: (v) => { state.updateSettings({ sound: v }); if (v) sound.unlock(); },
    onMusic: (v) => { state.updateSettings({ music: v }); v ? sound.startMusic() : sound.stopMusic(); },
    onPlay: startRound,
    onMastery: showMastery,
    onRewards: showRewards,
    onHelp: () => ui.showScreen('screen-help'),
  });
  refreshChip();
  ui.showScreen('screen-home');
}

// ---------- Play ----------
function currentMode() {
  const s = state.getState();
  const mode = { difficulty: s.settings.difficulty, table: s.settings.table };
  if (mode.difficulty === 'table' && !mode.table) mode.table = 2; // sensible default
  return mode;
}

function startRound() {
  const st = state.getState();
  if (!st.settings.difficulty) {
    const msg = document.getElementById('homeMsg');
    if (msg) msg.textContent = 'Pick Easy, Medium, Hard or a table first!';
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
  if (!round || round.answered) return;
  finishQuestion(game.timeout(round));
}

function answerQuestion(value) {
  if (!round || round.answered) return;
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
  const prevBest = s.bests[round.mode.difficulty] ?? 0;
  const summary = rewards.finishRound({
    mode: round.mode,
    score: round.score,
    bestInRoundStreak: round.bestInRoundStreak,
  });
  const newBest = round.score > prevBest && round.score > 0;
  if (s.settings.sound && (summary.stars >= 2 || summary.newBadges.length)) sound.reward();
  ui.renderResults(screens.results, {
    score: round.score,
    stars: summary.stars,
    newBadges: summary.newBadges,
    newBest,
    dailyStreak: summary.dailyStreak,
  }, { onAgain: startRound, onHome: goHome });
  ui.showScreen('screen-results');
}

// ---------- Other screens ----------
function showMastery() {
  ui.renderMastery(screens.mastery, { onHome: goHome });
  ui.showScreen('screen-mastery');
}
function showRewards() {
  ui.renderRewards(screens.rewards, state.getState(), { onHome: goHome });
  ui.showScreen('screen-rewards');
}

// ---------- Keyboard answering (1-4) ----------
document.addEventListener('keydown', (e) => {
  if (!screens.play.classList.contains('is-active') || !round || round.answered) return;
  const n = Number(e.key);
  if (n >= 1 && n <= 4) {
    const btns = screens.play.querySelectorAll('.option');
    const btn = btns[n - 1];
    if (btn) { e.preventDefault(); answerQuestion(Number(btn.dataset.value)); }
  }
});

// ---------- Bridge for markup-created buttons ----------
window.MathFun = { answer: answerQuestion, goHome };

// ---------- Init ----------
function init() {
  const s = state.getState();
  applyTheme(s.settings.theme);
  updateThemeButton(s.settings.theme);
  document.getElementById('themeToggle')?.addEventListener('click', cycleTheme);
  document.getElementById('helpBack')?.addEventListener('click', goHome);
  const vEl = document.getElementById('appVersion');
  if (vEl) vEl.textContent = APP_VERSION;

  boot();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        // Check for updates on each load, and reload once a new worker takes control
        // so fixes reach users without manual cache clearing.
        reg.update?.();
      }).catch(() => {});
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
