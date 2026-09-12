// ui.js - DOM render helpers for each screen (SPEC sec 2). Pure-ish: builds markup and
// wires callbacks passed in from app.js. Keeps app.js focused on flow/state.

import { ROUND_SIZE } from './game.js';
import { BADGES } from './rewards.js';
import { gridData } from './mastery.js';
import { OPERATIONS, OP_ORDER, getOperation, LEVEL_LABELS, LEVEL_EMOJI, levelTitle } from './operations.js';
import { THEMES, THEME_ORDER, getTheme, opEmoji, tabEmoji, themeAvatars } from './themes.js';

const $ = (sel, root = document) => root.querySelector(sel);

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---- Age stepper (v1.2) ---- a single colourful editable box with - / + buttons.
// Range 0-100, defaults to 5. Manual typing or +/- buttons; never out of range.
export const AGE_MIN = 0;
export const AGE_MAX = 100;
export const AGE_DEFAULT = 5;

// Clamp a value to the allowed range. Returns null only when there's genuinely no number
// yet (empty box mid-typing); callers fall back to AGE_DEFAULT when saving.
const clampAge = (n) => {
  if (n === '' || n == null) return null;
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return null;
  return Math.min(AGE_MAX, Math.max(AGE_MIN, v));
};

// Build the stepper markup. `value` defaults to 5 when nothing is provided.
function ageStepperMarkup(value) {
  const v = clampAge(value) ?? AGE_DEFAULT;
  return `
    <div class="age-stepper" role="group" aria-label="Choose your age">
      <button type="button" class="age-step-btn minus" id="ageMinus" aria-label="Younger" title="Younger">\u2212</button>
      <input type="number" class="age-input" id="ageInput" inputmode="numeric"
        min="${AGE_MIN}" max="${AGE_MAX}" step="1" value="${v}"
        aria-label="Age (${AGE_MIN} to ${AGE_MAX})">
      <button type="button" class="age-step-btn plus" id="agePlus" aria-label="Older" title="Older">+</button>
    </div>`;
}

// Wire the stepper's -, +, and manual typing. onChange receives the clamped value.
// Starts at 5 by default; clamps to 0-100 so it can never go negative or past 100.
function wireAgeStepper(root, initial, onChange) {
  const input = $('#ageInput', root);
  const minus = $('#ageMinus', root);
  const plus = $('#agePlus', root);
  if (!input) return;
  let val = clampAge(initial) ?? AGE_DEFAULT;
  const refreshButtons = () => {
    minus.disabled = val <= AGE_MIN;
    plus.disabled = val >= AGE_MAX;
  };
  const setVal = (n) => {
    val = clampAge(n) ?? AGE_DEFAULT;
    input.value = val;
    refreshButtons();
    onChange(val);
  };
  minus.addEventListener('click', () => setVal(val - 1));
  plus.addEventListener('click', () => setVal(val + 1));
  // While typing, allow a temporarily-empty box; clamp live when a number is present.
  input.addEventListener('input', () => {
    const raw = input.value.trim();
    if (raw === '') { refreshButtons(); return; } // let them clear before retyping; don't jump the cursor
    const n = Number(raw);
    if (Number.isFinite(n)) { val = clampAge(n); onChange(val); refreshButtons(); }
  });
  // On blur / Enter, settle to a valid number (empty -> default 5).
  input.addEventListener('blur', () => setVal(input.value));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
  // Seed the draft with the starting value so it's saved even if untouched.
  onChange(val);
  refreshButtons();
}

// Label for the mode tag shown before/during a round (SPEC R1.3), operation-aware.
export function modeLabel(mode) {
  if (mode.op === 'challenge' || mode.challenge) return '\uD83C\uDFC6 Daily Challenge';
  const op = getOperation(mode.op);
  if (op.hasTable && mode.difficulty === 'table') {
    // Multiplication reads "3× table"; division reads just "÷ 3" (no "table").
    return mode.op === 'div'
      ? `${op.symbol} ${mode.table}`
      : `${op.symbol} ${mode.table}\u00D7 table`;
  }
  return `${op.symbol} ${LEVEL_LABELS[mode.difficulty] || ''}`.trim();
}

// Show one screen by id, hide the rest, move focus to its heading for a11y.
export function showScreen(id) {
  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.toggle('is-active', el.id === id);
  });
  const active = document.getElementById(id);
  const h = active && active.querySelector('h1,h2');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); }
}

// ---- Operations picker (v1.1) ----
// Four tiles: Addition / Subtraction / Multiplication / Division. Division is "coming soon".
export function renderOperations(container, handlers, skin = 'math') {
  const tiles = OP_ORDER.map((key) => {
    const op = OPERATIONS[key];
    const soon = !op.playable;
    const emoji = opEmoji(skin, key, op.emoji); // v1.3: skin-flavoured tile emoji
    return `
      <button class="op-card op-${key} ${soon ? 'coming-soon' : ''}" data-op="${key}"
        ${soon ? 'aria-disabled="true"' : ''}
        title="${soon ? op.name + ' - coming soon' : 'Practise ' + op.name.toLowerCase()}">
        <span class="op-symbol" aria-hidden="true">${emoji}</span>
        <span class="op-name">${op.name}</span>
        ${soon ? '<span class="op-soon">Coming soon</span>' : ''}
      </button>`;
  }).join('');

  // Fun Facts + Daily Challenge tiles sit alongside the operations (v1.2), making a 2x3 grid.
  const funFactsTile = `
    <button class="op-card op-facts" data-op="facts" title="Read fun facts about numbers">
      <span class="op-symbol" aria-hidden="true">${tabEmoji(skin, 'facts', '\uD83C\uDF1F')}</span>
      <span class="op-name">Fun Facts</span>
    </button>`;
  const dailyTile = `
    <button class="op-card op-daily" data-op="daily" title="Try a surprise mix of questions!">
      <span class="op-symbol" aria-hidden="true">${tabEmoji(skin, 'daily', '\uD83C\uDFC6')}</span>
      <span class="op-name">Daily Challenge</span>
    </button>`;

  container.innerHTML = `
    <h2 tabindex="-1">Pick an Option...</h2>
    <div class="op-grid" role="group" aria-label="Choose an option">
      ${tiles}
      ${funFactsTile}
      ${dailyTile}
    </div>
  `;

  container.querySelectorAll('.op-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.op;
      if (key === 'facts') { handlers.onFunFacts(); return; }
      if (key === 'daily') { handlers.onDailyChallenge(); return; }
      if (!OPERATIONS[key].playable) return; // coming soon - do nothing
      handlers.onPick(key);
    });
  });
}

// ---- Fun Facts (v1.2) ---- local, offline, no network.
// Shows one fun maths/number fact at a time with a big "Another fact" button.
export function renderFunFacts(container, fact, handlers) {
  container.innerHTML = `
    <div class="play-top">
      <button class="btn btn-ghost btn-back" id="ffBack" aria-label="Back to choose operation" title="Back">\u2190</button>
      <h2 tabindex="-1">\uD83C\uDF1F Fun Facts</h2>
    </div>
    <div class="funfact-card" id="funfactCard" aria-live="polite">
      <div class="funfact-emoji" aria-hidden="true">${fact.emoji}</div>
      <p class="funfact-text">${escapeHtml(fact.text)}</p>
    </div>
    <button class="btn btn-play" id="anotherFactBtn">\uD83D\uDD00 Another fact</button>
    <p class="home-hint muted">Fun facts about numbers and sums \u2014 tap for more!</p>
  `;
  $('#ffBack', container).addEventListener('click', handlers.onBack);
  $('#anotherFactBtn', container).addEventListener('click', handlers.onAnother);
}

// Swap just the fact text/emoji in place (with a little pop), no full re-render.
export function updateFunFact(container, fact) {
  const card = $('#funfactCard', container);
  if (!card) return;
  card.innerHTML = `
    <div class="funfact-emoji" aria-hidden="true">${fact.emoji}</div>
    <p class="funfact-text">${escapeHtml(fact.text)}</p>`;
  card.classList.remove('pop');
  void card.offsetWidth; // restart the animation
  card.classList.add('pop');
}

// ---- Home ("Mode") ---- operation-aware (SPEC R11.2, R11.3)
export function renderHome(container, state, handlers) {
  const s = state.settings;
  const op = getOperation(s.operation);
  const levels = op.levels; // e.g. ['easy','medium','hard','table'] or [...'superhard']
  const tableChosen = op.hasTable && s.difficulty === 'table' && s.table;

  const levelCards = levels.map((d) => {
    if (d === 'table') {
      const chosenLabel = op.key === 'div' ? `\u00F7 ${s.table}` : `${s.table}\u00D7 table`;
      const emptyLabel = op.key === 'div' ? 'Pick a number' : 'Pick a table';
      return `
        <button class="mode-card ${s.difficulty === 'table' ? 'selected' : ''}" data-diff="table"
          aria-pressed="${s.difficulty === 'table'}" title="${levelTitle(op.key, 'table')}">
          <span class="mode-emoji" aria-hidden="true">${LEVEL_EMOJI.table}</span>
          <span class="mode-name">${tableChosen ? chosenLabel : emptyLabel}</span>
        </button>`;
    }
    return `
      <button class="mode-card ${s.difficulty === d ? 'selected' : ''}" data-diff="${d}"
        aria-pressed="${s.difficulty === d}" title="${levelTitle(op.key, d)}">
        <span class="mode-emoji" aria-hidden="true">${LEVEL_EMOJI[d] || '\u2B50'}</span>
        <span class="mode-name">${LEVEL_LABELS[d]}</span>
      </button>`;
  }).join('');

  container.innerHTML = `
    <div class="play-top">
      <button class="btn btn-ghost btn-back" id="opBack" aria-label="Back to choose operation" title="Choose a different operation">\u2190</button>
      <h2 tabindex="-1">${op.symbol} ${op.name}</h2>
    </div>
    <div class="mode-grid mode-grid-${levels.length}" role="group" aria-label="Difficulty">
      ${levelCards}
    </div>

    <button class="btn btn-play" id="playBtn" title="Start a round of 10 questions">\u25B6\uFE0F Play</button>
    <p class="home-msg" id="homeMsg" role="alert"></p>

    <p class="home-hint muted">Timer, Sound &amp; Music, plus progress, rewards and help are in the menu at the top right.</p>
  `;

  $('#opBack', container).addEventListener('click', handlers.onBackToOps);

  container.querySelectorAll('.mode-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.diff === 'table') handlers.onPickTable();
      else handlers.onDifficulty(btn.dataset.diff);
    });
  });

  $('#playBtn', container).addEventListener('click', handlers.onPlay);
}

// ---- Table picker dialog (array of 1-20 tiles) ----
export function renderTableDialog(current, handlers, opKey = 'mul') {
  const host = document.getElementById('modalHost');
  const isDiv = opKey === 'div';
  const tiles = Array.from({ length: 20 }, (_, i) => i + 1).map((n) => `
    <button type="button" class="table-tile ${n === current ? 'selected' : ''}" data-table="${n}"
      aria-label="${isDiv ? `divide by ${n}` : `${n} times table`}" title="${isDiv ? `\u00F7 ${n}` : `${n}\u00D7 table`}">${n}</button>`).join('');
  const dlgTitle = isDiv ? 'Divide by which number?' : 'Which table?';
  const dlgHint = isDiv
    ? 'Pick a number to divide by (1 to 20).'
    : 'Pick a number to practise that times table (1\u00D7 to 20\u00D7).';
  host.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="tableDlgTitle">
        <h2 id="tableDlgTitle" tabindex="-1">${dlgTitle}</h2>
        <p class="muted">${dlgHint}</p>
        <div class="table-grid" role="group" aria-label="${isDiv ? 'Choose a number to divide by' : 'Choose a table'}">${tiles}</div>
        <button class="btn btn-ghost" id="tableDlgClose">Cancel</button>
      </div>
    </div>`;
  const close = () => { host.innerHTML = ''; };
  const title = host.querySelector('#tableDlgTitle');
  if (title) title.focus();
  host.querySelectorAll('.table-tile').forEach((btn) => {
    btn.addEventListener('click', () => { const n = Number(btn.dataset.table); close(); handlers.onChoose(n); });
  });
  $('#tableDlgClose', host).addEventListener('click', () => { close(); handlers.onCancel(); });
  $('#modalBackdrop', host).addEventListener('click', (e) => {
    if (e.target.id === 'modalBackdrop') { close(); handlers.onCancel(); }
  });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); handlers.onCancel(); document.removeEventListener('keydown', esc); }
  });
}

// ---- Theme (skin) picker dialog (v1.3) ----
// A modal grid of the ~10 character themes; picking one fires onChoose(key) immediately.
export function renderThemeDialog(current, handlers) {
  const host = document.getElementById('modalHost');
  const opts = THEME_ORDER.map((key) => {
    const t = THEMES[key];
    return `
      <button type="button" class="theme-opt ${key === current ? 'selected' : ''}" data-skin="${key}"
        aria-pressed="${key === current}" title="${escapeHtml(t.name)} - ${escapeHtml(t.tagline)}">
        <span class="theme-opt-emoji" aria-hidden="true">${t.emoji}</span>
        <span class="theme-opt-meta">
          <span class="theme-opt-name">${escapeHtml(t.name)}</span>
          <span class="theme-opt-tag">${escapeHtml(t.tagline)}</span>
        </span>
      </button>`;
  }).join('');
  host.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="themeDlgTitle">
        <h2 id="themeDlgTitle" tabindex="-1">\uD83C\uDFA8 Choose a theme</h2>
        <p class="muted">Pick a look and sound for your maths adventure.</p>
        <div class="theme-grid" role="group" aria-label="Choose a theme">${opts}</div>
        <button class="btn btn-ghost" id="themeDlgClose">Cancel</button>
      </div>
    </div>`;
  const close = () => { host.innerHTML = ''; };
  const title = host.querySelector('#themeDlgTitle');
  if (title) title.focus();
  host.querySelectorAll('.theme-opt').forEach((btn) => {
    btn.addEventListener('click', () => { const key = btn.dataset.skin; close(); handlers.onChoose(key); });
  });
  $('#themeDlgClose', host).addEventListener('click', () => { close(); handlers.onCancel(); });
  $('#modalBackdrop', host).addEventListener('click', (e) => {
    if (e.target.id === 'modalBackdrop') { close(); handlers.onCancel(); }
  });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); handlers.onCancel(); document.removeEventListener('keydown', esc); }
  });
}

// ---- Play ----
export function renderPlayShell(container, mode) {
  container.innerHTML = `
    <div class="play-top">
      <button class="btn btn-ghost btn-back" id="quitBtn" aria-label="Stop and go back to home" title="Back to home">\u2190</button>
      <div class="mode-tag">${modeLabel(mode)}</div>
    </div>
    <div class="progress" aria-hidden="true"><div class="progress-bar" id="progressBar"></div></div>
    <div class="progress-text" id="progressText"></div>
    <div class="timer-wrap hidden" id="timerWrap"><div class="timer-bar" id="timerBar"></div></div>
    <div class="question" id="questionText" aria-live="off"></div>
    <div class="options" id="options" role="group" aria-label="Answer choices"></div>
    <div class="hint-zone" id="hintZone"></div>
    <div class="feedback" id="feedback" aria-live="polite"></div>
  `;
  $('#quitBtn', container).addEventListener('click', () => window.MathFun.goHome());
}

export function renderQuestion(container, round) {
  $('#progressText', container).textContent = `Question ${round.index + 1} of ${ROUND_SIZE}`;
  $('#progressBar', container).style.width = `${(round.index / ROUND_SIZE) * 100}%`;
  $('#questionText', container).textContent = `${round.current.text} = ?`;
  $('#feedback', container).textContent = '';
  $('#feedback', container).className = 'feedback';

  const opts = $('#options', container);
  opts.innerHTML = '';
  round.current.options.forEach((val, i) => {
    const b = document.createElement('button');
    b.className = 'option';
    b.textContent = val;
    b.dataset.value = val;
    b.setAttribute('aria-keyshortcuts', String(i + 1));
    b.addEventListener('click', () => window.MathFun.answer(val, b));
    opts.appendChild(b);
  });
}

export function showFeedback(container, result, correctValue, profile = null) {
  const fb = $('#feedback', container);
  const opts = $('#options', container);
  opts.querySelectorAll('.option').forEach((b) => {
    b.disabled = true;
    const v = Number(b.dataset.value);
    if (v === correctValue) b.classList.add('is-correct');
    if (!result.correct && v === result.chosen) b.classList.add('is-wrong');
  });
  if (result.correct) {
    fb.textContent = pickPraise(profile);
    fb.classList.add('good');
  } else {
    fb.textContent = pickEncourage(profile, correctValue);
    fb.classList.add('bad');
  }
}

// Personalised praise mixing the child's name and a friendly boy/girl term.
function pickPraise(profile) {
  const name = profile && profile.name && profile.name !== 'Player' ? profile.name : '';
  const term = profile && profile.gender === 'girl' ? 'clever girl'
             : profile && profile.gender === 'boy' ? 'clever boy' : 'superstar';
  const withName = name ? [
    `Brilliant, ${name}!`,
    `Awesome work, ${name}!`,
    `Great going, ${name}!`,
    `You nailed it, ${name}!`,
    `Superb, ${name}!`,
    `Nice one, ${name}!`,
  ] : [];
  const withTerm = [
    `Well done, ${term}!`,
    `Great job, ${term}!`,
    `You're on fire, ${term}!`,
  ];
  const generic = ['Brilliant!', 'Awesome!', 'You got it!', 'Superstar!', 'Fantastic!'];
  // Weight toward name-based lines when we have a name.
  const pool = name ? [...withName, ...withName, ...withTerm, ...generic] : [...withTerm, ...generic];
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickEncourage(profile, correctValue) {
  const name = profile && profile.name && profile.name !== 'Player' ? profile.name : '';
  const lines = name ? [
    `So close, ${name} \u2014 it's ${correctValue}!`,
    `Almost, ${name}! The answer is ${correctValue}.`,
    `Good try, ${name} \u2014 it's ${correctValue}.`,
  ] : [
    `Almost \u2014 it's ${correctValue}!`,
    `Good try! The answer is ${correctValue}.`,
    `So close \u2014 it's ${correctValue}.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ---- Hint (v1.2) ---- appears after a pause in untimed mode.
export function clearHint(container) {
  const zone = $('#hintZone', container);
  if (zone) zone.innerHTML = '';
}

// Show the animated "Need a Hint?" button. onReveal is called when tapped.
// icon defaults to a bulb but is skin-flavoured (v1.3).
export function showHintButton(container, onReveal, icon = '\uD83D\uDCA1') {
  const zone = $('#hintZone', container);
  if (!zone) return;
  zone.innerHTML = `
    <button type="button" class="hint-btn" id="hintBtn" title="Show a hint to help you">
      ${icon} Need a Hint?
    </button>`;
  $('#hintBtn', zone).addEventListener('click', onReveal);
}

// Replace the button with the actual hint text (skin-flavoured icon, v1.3).
export function showHintText(container, text, icon = '\uD83D\uDCA1') {
  const zone = $('#hintZone', container);
  if (!zone) return;
  zone.innerHTML = `<div class="hint-text" role="status">${icon} ${escapeHtml(text)}</div>`;
}

export function setTimerVisible(container, visible) {
  $('#timerWrap', container).classList.toggle('hidden', !visible);
}
export function setTimer(container, fraction) {
  $('#timerBar', container).style.width = `${Math.max(0, fraction) * 100}%`;
}

// ---- Results ----
export function renderResults(container, data, handlers) {
  const starRow = [1, 2, 3].map((n) => `<span class="star ${n <= data.stars ? 'on' : ''}">\u2B50</span>`).join('');
  const badgeHtml = data.newBadges.length
    ? `<div class="new-badges"><h3>New badge${data.newBadges.length > 1 ? 's' : ''}!</h3>${
        data.newBadges.map((id) => `<div class="badge-chip">${BADGES[id].icon} ${BADGES[id].name}</div>`).join('')
      }</div>`
    : '';
  container.innerHTML = `
    <h2 tabindex="-1">Round complete!</h2>
    <div class="score-big">${data.score} / ${ROUND_SIZE}</div>
    <div class="stars">${starRow}</div>
    ${data.newBest ? '<div class="new-best">\uD83C\uDF89 New personal best!</div>' : ''}
    <div class="streak-note">Day streak: ${data.dailyStreak} \uD83D\uDD25</div>
    ${badgeHtml}
    <div class="results-actions">
      <button class="btn btn-play" id="againBtn">\uD83D\uDD01 Play again</button>
      <button class="btn btn-secondary" id="homeBtn">\uD83C\uDFE0 Home</button>
    </div>
  `;
  $('#againBtn', container).addEventListener('click', handlers.onAgain);
  $('#homeBtn', container).addEventListener('click', handlers.onHome);
}

// ---- Progress (operation-aware) ----
// Multiplication -> the A x B mastery grid. Addition/Subtraction/Division -> a summary
// of rounds played, best score per level, and accuracy (SPEC R11.9).
// Per-operation label for a level (division's "table" reads "Pick a number").
function levelBestLabel(opKey, lvl) {
  if (lvl === 'table') return opKey === 'div' ? 'Pick a number' : 'Pick a table';
  return LEVEL_LABELS[lvl];
}

// Single operation's progress: the same summary layout for EVERY operation (v1.2),
// plus the A x B mastery grid appended for multiplication.
export function renderProgress(container, opKey, opProgress, handlers) {
  const op = getOperation(opKey);
  const bests = opProgress.bests || {};
  const rounds = opProgress.rounds || 0;
  const answered = opProgress.answered || 0;
  const correct = opProgress.correct || 0;
  const acc = answered ? Math.round((correct / answered) * 100) : 0;

  const bestItems = op.levels.map((lvl) => `
    <div class="best-item"><span class="best-num">${bests[lvl] ?? 0}</span>${levelBestLabel(op.key, lvl)} best</div>
  `).join('');

  const gridBlock = op.usesGrid ? `
    <h3 class="summary-sub">Times-table mastery</h3>
    ${masteryGridMarkup()}
  ` : '';

  container.innerHTML = `
    <div class="play-top">
      <button class="btn btn-ghost btn-back" id="mBack" aria-label="Back to home" title="Back to home">\u2190</button>
      <h2 tabindex="-1">${op.symbol} ${op.name} progress</h2>
    </div>
    <div class="op-summary">
      <div class="summary-stats">
        <div class="stat"><span class="stat-num">${rounds}</span><span class="stat-lbl">Rounds played</span></div>
        <div class="stat"><span class="stat-num">${acc}%</span><span class="stat-lbl">Accuracy</span></div>
        <div class="stat"><span class="stat-num">${answered}</span><span class="stat-lbl">Questions answered</span></div>
      </div>
      <h3 class="summary-sub">Best score per level</h3>
      <div class="bests">${bestItems}</div>
      ${gridBlock}
      <p class="grid-hint muted">Keep practising to raise your best score and accuracy!</p>
    </div>
  `;
  $('#mBack', container).addEventListener('click', handlers.onHome);
}

// All-operations overview (v1.2): shown when My Progress is opened before an operation
// is picked this session. One card per playable operation with its key numbers.
export function renderProgressOverview(container, ops, handlers) {
  const cards = OP_ORDER.filter((k) => OPERATIONS[k].playable).map((k) => {
    const op = OPERATIONS[k];
    const p = ops[k] || {};
    const rounds = p.rounds || 0;
    const answered = p.answered || 0;
    const correct = p.correct || 0;
    const acc = answered ? Math.round((correct / answered) * 100) : 0;
    const best = Math.max(0, ...Object.values(p.bests || { _: 0 }));
    return `
      <button class="op-progress-card" data-op="${k}" title="See ${op.name} progress in detail">
        <span class="opc-head"><span class="opc-symbol" aria-hidden="true">${op.emoji}</span>${op.name}</span>
        <span class="opc-stats">
          <span><b>${rounds}</b> rounds</span>
          <span><b>${acc}%</b> accuracy</span>
          <span><b>${best}</b> best</span>
        </span>
      </button>`;
  }).join('');

  container.innerHTML = `
    <div class="play-top">
      <button class="btn btn-ghost btn-back" id="mBack" aria-label="Back to home" title="Back to home">\u2190</button>
      <h2 tabindex="-1">\uD83D\uDCCA My Progress</h2>
    </div>
    <p class="grid-hint muted">Your progress across every operation. Tap one to see the details.</p>
    <div class="op-progress-grid">${cards}</div>
  `;
  $('#mBack', container).addEventListener('click', handlers.onHome);
  container.querySelectorAll('.op-progress-card').forEach((btn) => {
    btn.addEventListener('click', () => handlers.onPickOp(btn.dataset.op));
  });
}

// ---- Mastery grid (multiplication) ----
// The A x B mastery grid markup (legend + scrollable grid). Returned as a string so it can
// be appended under the multiplication summary. Reads live mastery data via gridData().
function masteryGridMarkup() {
  const rows = gridData(20);
  const legend = `
    <div class="legend">
      <span><i class="dot solid"></i> Solid</span>
      <span><i class="dot okay"></i> Okay</span>
      <span><i class="dot needs"></i> Needs work</span>
      <span><i class="dot new"></i> Not tried</span>
    </div>`;
  const stateWord = { solid: 'solid', okay: 'okay', needs: 'needs work', new: 'not tried yet' };
  const headCols = Array.from({ length: 20 }, (_, i) => `<div class="grid-head">${i + 1}</div>`).join('');
  const grid = rows.map((r) => `
    <div class="grid-row" role="row">
      <div class="grid-label" role="rowheader">${r.table}\u00D7</div>
      ${r.cols.map((c) => `<div class="cell ${c.state}" role="cell" title="${c.a} \u00D7 ${c.b} = ${c.a * c.b} (${stateWord[c.state]})" aria-label="${c.a} times ${c.b}: ${stateWord[c.state]}"><span class="cell-txt">${c.b}</span></div>`).join('')}
    </div>`).join('');
  return `
    ${legend}
    <p class="grid-hint muted">Tables 1\u00D7 to 20\u00D7. Scroll sideways to see more. Tap a square for details.</p>
    <div class="grid-scroll">
      <div class="grid" role="table" aria-label="Mastery grid, tables 1 to 20">
        <div class="grid-row grid-header-row" role="row">
          <div class="grid-label" role="columnheader"></div>${headCols}
        </div>
        ${grid}
      </div>
    </div>`;
}

// ---- Rewards ---- badges are profile-level; bests shown across operations (v1.1).
export function renderRewards(container, state, handlers) {
  const earned = new Set(state.badges);
  const chips = Object.entries(BADGES).map(([id, b]) => `
    <div class="badge-card ${earned.has(id) ? 'earned' : 'locked'}">
      <div class="badge-icon">${earned.has(id) ? b.icon : '\uD83D\uDD12'}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
    </div>`).join('');

  // Best score across all levels for each operation (whichever level is highest).
  const opBestRows = OP_ORDER.filter((k) => OPERATIONS[k].playable).map((k) => {
    const op = OPERATIONS[k];
    const bests = (state.ops && state.ops[k] && state.ops[k].bests) || {};
    const best = Math.max(0, ...Object.values(bests));
    return `<div class="best-item"><span class="best-num">${best}</span>${op.symbol} best</div>`;
  }).join('');
  const longest = state.longestStreak ?? 0;

  container.innerHTML = `
    <div class="play-top">
      <button class="btn btn-ghost btn-back" id="rBack" aria-label="Back to home">\u2190</button>
      <h2 tabindex="-1">Rewards</h2>
    </div>
    <div class="bests">
      ${opBestRows}
      <div class="best-item"><span class="best-num">${longest}</span>Longest streak</div>
    </div>
    <div class="badge-grid">${chips}</div>
  `;
  $('#rBack', container).addEventListener('click', handlers.onHome);
}

// ---- Profile setup (create / edit) ----
// CREATE: a stepped wizard, one thing at a time -> Name, Gender, Age, Theme, Avatar (v1.3).
// canCancel: show a Cancel/Back on the first step (when other profiles exist).
export function renderSetup(container, { canCancel = false }, handlers) {
  // v1.3: `skin` defaults to 'math' (Math World) so there's always a valid theme; the
  // child can change it on the Theme step (and any time later from the menu).
  // Theme comes BEFORE avatar so the avatar grid can show the chosen theme's characters (v1.3).
  const draft = { name: '', gender: null, age: null, avatar: null, skin: 'math' };
  const steps = ['name', 'gender', 'age', 'theme', 'avatar'];
  let step = 0;

  const stepDots = () => `<div class="wiz-dots" aria-hidden="true">${
    steps.map((_, i) => `<span class="wiz-dot ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}"></span>`).join('')
  }</div>`;

  function body() {
    if (steps[step] === 'name') {
      return `
        <label class="field">
          <span>What's your name?</span>
          <input type="text" id="nameInput" maxlength="16" placeholder="Type your name"
            value="${escapeHtml(draft.name)}" autocomplete="off" enterkeyhint="next">
        </label>`;
    }
    if (steps[step] === 'gender') {
      return `
        <div class="field">
          <span>Are you a boy or a girl?</span>
          <div class="gender-grid" role="group" aria-label="Choose boy or girl">
            <button type="button" class="gender-opt ${draft.gender === 'boy' ? 'selected' : ''}" data-gender="boy"
              aria-pressed="${draft.gender === 'boy'}" title="Boy">
              <span class="gender-emoji" aria-hidden="true">\uD83D\uDC66</span><span>Boy</span>
            </button>
            <button type="button" class="gender-opt ${draft.gender === 'girl' ? 'selected' : ''}" data-gender="girl"
              aria-pressed="${draft.gender === 'girl'}" title="Girl">
              <span class="gender-emoji" aria-hidden="true">\uD83D\uDC67</span><span>Girl</span>
            </button>
          </div>
        </div>`;
    }
    if (steps[step] === 'age') {
      // No default - the child must enter an age (blank box until they do).
      return `
        <div class="field">
          <span>How old are you?</span>
          ${ageStepperMarkup(draft.age)}
        </div>`;
    }
    if (steps[step] === 'avatar') {
      // v1.3: characters come from the chosen theme (theme step precedes this one).
      const avatarGrid = themeAvatars(draft.skin).map((a) => `
        <button type="button" class="avatar-opt ${a === draft.avatar ? 'selected' : ''}" data-av="${a}"
          aria-pressed="${a === draft.avatar}" aria-label="Avatar ${a}" title="Choose this avatar">${a}</button>`).join('');
      return `
        <div class="field">
          <span>Pick your character</span>
          <div class="avatar-grid" role="group" aria-label="Choose an avatar">${avatarGrid}</div>
        </div>`;
    }
    // Theme (skin) step (v1.3): an inline grid of the ~10 themes; selecting previews it live.
    const themeGrid = THEME_ORDER.map((key) => {
      const t = THEMES[key];
      return `
        <button type="button" class="theme-opt ${key === draft.skin ? 'selected' : ''}" data-skin="${key}"
          aria-pressed="${key === draft.skin}" title="${escapeHtml(t.name)} - ${escapeHtml(t.tagline)}">
          <span class="theme-opt-emoji" aria-hidden="true">${t.emoji}</span>
          <span class="theme-opt-meta">
            <span class="theme-opt-name">${escapeHtml(t.name)}</span>
            <span class="theme-opt-tag">${escapeHtml(t.tagline)}</span>
          </span>
        </button>`;
    }).join('');
    return `
      <div class="field">
        <span>Pick a theme</span>
        <div class="theme-grid" role="group" aria-label="Choose a theme">${themeGrid}</div>
      </div>`;
  }

  function render() {
    const isLast = step === steps.length - 1;
    const backLabel = step === 0 ? (canCancel ? 'Cancel' : '') : '\u2190 Back';
    container.innerHTML = `
      <h2 tabindex="-1">Create your profile</h2>
      ${stepDots()}
      <div class="setup wiz-step">
        ${body()}
        <div class="wiz-actions">
          ${backLabel ? `<button class="btn btn-ghost" id="wizBack">${backLabel}</button>` : ''}
          <button class="btn btn-play" id="wizNext">${isLast ? '\uD83C\uDF89 Let\u2019s go!' : 'Next \u2192'}</button>
        </div>
      </div>
    `;

    if (steps[step] === 'name') {
      const input = $('#nameInput', container);
      input.focus();
      input.addEventListener('input', () => {
        draft.name = input.value;
        const hint = $('#wizHint', container);
        if (hint && input.value.trim()) hint.remove();
      });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); next(); } });
    } else if (steps[step] === 'age') {
      wireAgeStepper(container, draft.age, (v) => { draft.age = v; });
    } else if (steps[step] === 'theme') {
      // Selecting a theme updates the draft and previews it live (via the optional handler).
      container.querySelectorAll('.theme-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          draft.skin = btn.dataset.skin;
          container.querySelectorAll('.theme-opt').forEach((b) => {
            const on = b === btn;
            b.classList.toggle('selected', on);
            b.setAttribute('aria-pressed', on);
          });
          handlers.onPreviewSkin?.(draft.skin);
        });
      });
    } else {
      const map = { gender: ['gender-opt', 'gender', 'gender'], avatar: ['avatar-opt', 'av', 'avatar'] };
      const [cls, dataKey, field] = map[steps[step]];
      container.querySelectorAll('.' + cls).forEach((btn) => {
        btn.addEventListener('click', () => {
          draft[field] = field === 'age' ? Number(btn.dataset[dataKey]) : btn.dataset[dataKey];
          container.querySelectorAll('.' + cls).forEach((b) => {
            const on = b === btn;
            b.classList.toggle('selected', on);
            b.setAttribute('aria-pressed', on);
          });
          const hint = $('#wizHint', container);
          if (hint) hint.remove();
        });
      });
    }

    $('#wizNext', container).addEventListener('click', next);
    $('#wizBack', container)?.addEventListener('click', back);
  }

  function needsChoice() {
    if (steps[step] === 'name' && !(draft.name || '').trim()) return 'Please type your name to carry on.';
    if (steps[step] === 'gender' && !draft.gender) return 'Please pick boy or girl to carry on.';
    // Age always has a value (defaults to 5), so no gate is needed here.
    if (steps[step] === 'avatar' && !draft.avatar) return 'Please pick a character to finish.';
    return null;
  }

  function next() {
    const msg = needsChoice();
    if (msg) { showHint(msg); return; }
    if (step < steps.length - 1) { step++; render(); return; }
    handlers.onSave({
      name: (draft.name || '').trim() || 'Player',
      gender: draft.gender,
      age: Number(draft.age),
      avatar: draft.avatar,
      skin: draft.skin || 'math',
    });
  }

  function showHint(msg) {
    let el = $('#wizHint', container);
    if (!el) {
      el = document.createElement('p');
      el.id = 'wizHint';
      el.className = 'wiz-hint';
      el.setAttribute('role', 'alert');
      $('.wiz-step', container).insertBefore(el, $('.wiz-actions', container));
    }
    el.textContent = msg;
  }

  function back() {
    if (step === 0) { handlers.onCancel(); return; }
    step--; render();
  }

  render();
}

// EDIT: a single summary page showing the profile, with an Edit button that turns the
// summary into all-fields-at-once editing (name, gender, age, avatar) with Save/Cancel.
export function renderProfileSummary(container, profile, handlers) {
  let editing = false;
  // Seed the skin from the profile so the edit avatar grid shows this theme's characters (v1.3).
  const draft = {
    name: profile.name, gender: profile.gender || 'boy', age: profile.age,
    avatar: profile.avatar, skin: (profile.progress && profile.progress.settings && profile.progress.settings.skin) || 'math',
  };

  const genderWord = (g) => (g === 'girl' ? 'Girl' : g === 'boy' ? 'Boy' : '\u2014');
  const genderEmoji = (g) => (g === 'girl' ? '\uD83D\uDC67' : '\uD83D\uDC66');

  function renderView() {
    container.innerHTML = `
      <div class="play-top">
        <button class="btn btn-ghost btn-back" id="pBack" aria-label="Back to home" title="Back to home">\u2190</button>
        <h2 tabindex="-1">Profile</h2>
        <button class="btn btn-secondary" id="editBtn" title="Edit your details">\u270F\uFE0F Edit</button>
      </div>
      <div class="profile-card">
        <div class="profile-avatar-big">${profile.avatar}</div>
        <dl class="profile-details">
          <div><dt>Name</dt><dd>${escapeHtml(profile.name)}</dd></div>
          <div><dt>I am a</dt><dd>${genderEmoji(profile.gender)} ${genderWord(profile.gender)}</dd></div>
          <div><dt>Age</dt><dd>${profile.age}</dd></div>
        </dl>
      </div>
      <button class="btn btn-ghost danger" id="deleteProfileBtn" title="Delete this player and their progress">Delete this player</button>
    `;
    $('#pBack', container).addEventListener('click', handlers.onHome);
    $('#editBtn', container).addEventListener('click', () => { editing = true; renderEdit(); });
    $('#deleteProfileBtn', container).addEventListener('click', handlers.onDelete);
  }

  function renderEdit() {
    const avatarGrid = themeAvatars(draft.skin).map((a) => `
      <button type="button" class="avatar-opt ${a === draft.avatar ? 'selected' : ''}" data-av="${a}"
        aria-pressed="${a === draft.avatar}" aria-label="Avatar ${a}" title="Choose this avatar">${a}</button>`).join('');
    container.innerHTML = `
      <div class="play-top">
        <button class="btn btn-ghost btn-back" id="cancelEdit" aria-label="Cancel editing" title="Cancel">\u2190</button>
        <h2 tabindex="-1">Edit profile</h2>
      </div>
      <div class="setup">
        <label class="field">
          <span>Name</span>
          <input type="text" id="nameInput" maxlength="16" value="${escapeHtml(draft.name)}" autocomplete="off">
        </label>
        <div class="field">
          <span>I am a</span>
          <div class="gender-grid" role="group" aria-label="Boy or girl">
            <button type="button" class="gender-opt ${draft.gender === 'boy' ? 'selected' : ''}" data-gender="boy" aria-pressed="${draft.gender === 'boy'}" title="Boy"><span class="gender-emoji" aria-hidden="true">\uD83D\uDC66</span><span>Boy</span></button>
            <button type="button" class="gender-opt ${draft.gender === 'girl' ? 'selected' : ''}" data-gender="girl" aria-pressed="${draft.gender === 'girl'}" title="Girl"><span class="gender-emoji" aria-hidden="true">\uD83D\uDC67</span><span>Girl</span></button>
          </div>
        </div>
        <div class="field">
          <span>Age</span>
          ${ageStepperMarkup(draft.age)}
        </div>
        <div class="field">
          <span>Character</span>
          <div class="avatar-grid" role="group" aria-label="Avatar">${avatarGrid}</div>
        </div>
        <div class="wiz-actions">
          <button class="btn btn-ghost" id="cancelEdit2">Cancel</button>
          <button class="btn btn-play" id="saveEdit">\uD83D\uDCBE Save</button>
        </div>
      </div>
    `;
    const nameIn = $('#nameInput', container);
    nameIn.addEventListener('input', () => { draft.name = nameIn.value; });
    wireGroup('.gender-opt', 'gender', 'gender', false);
    wireAgeStepper(container, draft.age, (v) => { draft.age = v; });
    wireGroup('.avatar-opt', 'av', 'avatar', false);
    const cancel = () => { editing = false; renderView(); };
    $('#cancelEdit', container).addEventListener('click', cancel);
    $('#cancelEdit2', container).addEventListener('click', cancel);
    $('#saveEdit', container).addEventListener('click', () => {
      handlers.onSave({
        name: (draft.name || '').trim() || 'Player',
        gender: draft.gender || 'boy',
        // If the age box was cleared, keep the existing age rather than saving 0.
        age: draft.age == null ? profile.age : Number(draft.age),
        avatar: draft.avatar,
      });
    });
  }

  function wireGroup(cls, dataKey, field, isNum) {
    container.querySelectorAll(cls).forEach((btn) => {
      btn.addEventListener('click', () => {
        draft[field] = isNum ? Number(btn.dataset[dataKey]) : btn.dataset[dataKey];
        container.querySelectorAll(cls).forEach((b) => {
          const on = b === btn;
          b.classList.toggle('selected', on);
          b.setAttribute('aria-pressed', on);
        });
      });
    });
  }

  renderView();
}

// ---- Who's playing (profile picker) ----
export function renderWhoPlaying(container, profiles, handlers) {
  const cards = profiles.map((p) => `
    <button class="profile-pick" data-id="${p.id}">
      <span class="profile-pick-av">${p.avatar}</span>
      <span class="profile-pick-name">${escapeHtml(p.name)}</span>
      <span class="profile-pick-age">age ${p.age}</span>
    </button>`).join('');
  container.innerHTML = `
    <h2 tabindex="-1">Who\u2019s playing?</h2>
    <div class="profile-picks">
      ${cards}
      <button class="profile-pick add" id="addProfileBtn">
        <span class="profile-pick-av">\u2795</span>
        <span class="profile-pick-name">Add player</span>
      </button>
    </div>
  `;
  container.querySelectorAll('.profile-pick[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => handlers.onPick(btn.dataset.id));
  });
  $('#addProfileBtn', container).addEventListener('click', handlers.onAdd);
}

// ---- Header profile chip + dropdown menu ----
export function renderProfileChip(profile, handlers, settings = {}) {
  const host = document.getElementById('profileChip');
  if (!host) return;
  if (!profile) { host.innerHTML = ''; host.classList.add('hidden'); return; }
  host.classList.remove('hidden');
  // Sound & Music controls now live in this menu (v1.2), just after Profile.
  // Compact: three across, each an icon with its toggle switch below (v1.2 round 3).
  const menuSwitch = (id, label, icon, on) => `
    <div class="menu-toggle" role="menuitemcheckbox" aria-checked="${on}" title="${label}">
      <span class="menu-toggle-icon" aria-hidden="true">${icon}</span>
      <button type="button" class="switch ${on ? 'on' : ''}" id="${id}" role="switch"
        aria-checked="${on}" aria-label="${label}: currently ${on ? 'on' : 'off'}">
        <span class="switch-track"><span class="switch-thumb"></span></span>
        <span class="switch-state">${on ? 'On' : 'Off'}</span>
      </button>
    </div>`;
  host.innerHTML = `
    <button class="chip-btn" id="chipBtn" aria-haspopup="true" aria-expanded="false"
      aria-label="Player menu for ${escapeHtml(profile.name)}">
      <span class="chip-av">${profile.avatar}</span>
      <span class="chip-name">${escapeHtml(profile.name)}</span>
      <span class="chip-caret" aria-hidden="true">\u25BE</span>
    </button>
    <div class="chip-menu" id="chipMenu" role="menu" hidden>
      <button role="menuitem" data-act="profile">\uD83D\uDC64 Profile</button>
      <button role="menuitem" data-act="theme">\uD83C\uDFA8 Theme <span class="menu-theme-current">${escapeHtml(getTheme(settings.skin).name)}</span></button>
      <div class="chip-menu-section" role="group" aria-label="Sound and music">
        ${menuSwitch('timedToggle', 'Timer', '\u23F1\uFE0F', !!settings.timed)}
        ${menuSwitch('soundToggle', 'Sound', '\uD83D\uDD0A', !!settings.sound)}
        ${menuSwitch('musicToggle', 'Music', '\uD83C\uDFB5', !!settings.music)}
      </div>
      <button role="menuitem" data-act="rewards">\uD83C\uDFC6 My Rewards</button>
      <button role="menuitem" data-act="progress">\uD83D\uDCCA My Progress</button>
      <button role="menuitem" data-act="help">\u2753 Help</button>
      <button role="menuitem" data-act="switch">\uD83D\uDD01 Switch player</button>
    </div>
  `;
  const btn = $('#chipBtn', host);
  const menu = $('#chipMenu', host);
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  const toggle = () => {
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  // Menu items that navigate (Profile/Theme/Rewards/etc.) close the menu and fire their handler.
  menu.querySelectorAll('[data-act]').forEach((mi) => {
    mi.addEventListener('click', () => { close(); handlers[mi.dataset.act]?.(); });
  });
  // The Timer/Sound/Music switches toggle in place WITHOUT closing the menu.
  const wireMenuSwitch = (id, cb) => {
    const el = $('#' + id, menu);
    if (!el) return;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const on = !el.classList.contains('on');
      el.classList.toggle('on', on);
      el.setAttribute('aria-checked', on);
      $('.switch-state', el).textContent = on ? 'On' : 'Off';
      el.closest('.menu-toggle')?.setAttribute('aria-checked', String(on));
      cb(on);
    });
  };
  wireMenuSwitch('timedToggle', handlers.onTimed);
  wireMenuSwitch('soundToggle', handlers.onSound);
  wireMenuSwitch('musicToggle', handlers.onMusic);
  // Keep the menu open when interacting inside it (only outside clicks close it).
  menu.addEventListener('click', (e) => e.stopPropagation());

  // Outside-click / Escape closing is bound ONCE at the document level (not per-render), and
  // it looks up the CURRENT chip menu each time. Binding it per render (as before) stacked a
  // new listener on every header re-render - each capturing an OLD, replaced menu element -
  // which on mobile could immediately re-close the freshly opened menu, so nothing was
  // selectable. A single, self-healing global handler avoids that entirely.
  if (!renderProfileChip._globalBound) {
    renderProfileChip._globalBound = true;
    const closeCurrent = (ev) => {
      const m = document.getElementById('chipMenu');
      const b = document.getElementById('chipBtn');
      if (!m || m.hidden) return;
      // Ignore taps inside the menu or on the chip button (those manage themselves).
      if (ev && (m.contains(ev.target) || (b && b.contains(ev.target)))) return;
      m.hidden = true;
      if (b) b.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('click', closeCurrent);
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeCurrent(null); });
  }
}
