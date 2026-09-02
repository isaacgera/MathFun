// ui.js - DOM render helpers for each screen (SPEC sec 2). Pure-ish: builds markup and
// wires callbacks passed in from app.js. Keeps app.js focused on flow/state.

import { ROUND_SIZE } from './game.js';
import { BADGES } from './rewards.js';
import { gridData } from './mastery.js';
import { AVATARS } from './avatars.js';

const $ = (sel, root = document) => root.querySelector(sel);

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Difficulty labels for display.
// Short names shown on the cards; full labels used for tooltips/aria only.
export const MODE_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard', table: 'Table practice' };
export const MODE_TITLES = {
  easy: 'Easy - tables 1 to 5',
  medium: 'Medium - tables 1 to 10',
  hard: 'Hard - tables 1 to 20',
  table: 'Practise one times table',
};
// Hard covers the full 1x1..20x20 range; Easy/Medium cap lower for younger players.

export function modeLabel(mode) {
  if (mode.difficulty === 'table') return `The ${mode.table}\u00D7 table`;
  return MODE_LABELS[mode.difficulty];
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

// A reusable On/Off toggle switch.
function toggleSwitch(id, label, icon, on, title) {
  return `
    <div class="toggle-row" title="${title}">
      <span class="toggle-label">${icon} ${label}</span>
      <button type="button" class="switch ${on ? 'on' : ''}" id="${id}" role="switch"
        aria-checked="${on}" aria-label="${label}: currently ${on ? 'on' : 'off'}">
        <span class="switch-track"><span class="switch-thumb"></span></span>
        <span class="switch-state">${on ? 'On' : 'Off'}</span>
      </button>
    </div>`;
}

// ---- Home ----
export function renderHome(container, state, handlers) {
  const s = state.settings;
  const tableChosen = s.difficulty === 'table' && s.table;

  container.innerHTML = `
    <h2 tabindex="-1">Pick how to play</h2>
    <div class="mode-grid" role="group" aria-label="Difficulty">
      ${['easy', 'medium', 'hard'].map((d) => `
        <button class="mode-card ${s.difficulty === d ? 'selected' : ''}" data-diff="${d}"
          aria-pressed="${s.difficulty === d}" title="${MODE_TITLES[d]}">
          <span class="mode-emoji" aria-hidden="true">${d === 'easy' ? '\uD83D\uDE0A' : d === 'medium' ? '\uD83D\uDE80' : '\uD83E\uDD16'}</span>
          <span class="mode-name">${MODE_LABELS[d]}</span>
        </button>`).join('')}
      <button class="mode-card ${s.difficulty === 'table' ? 'selected' : ''}" data-diff="table"
        aria-pressed="${s.difficulty === 'table'}" title="Practise one times table">
        <span class="mode-emoji" aria-hidden="true">\uD83C\uDFAF</span>
        <span class="mode-name">${tableChosen ? `${s.table}\u00D7 table` : 'Pick a table'}</span>
      </button>
    </div>

    <button class="btn btn-play" id="playBtn" title="Start a round of 10 questions">\u25B6\uFE0F Play</button>
    <p class="home-msg" id="homeMsg" role="alert"></p>

    <div class="toggles toggles-row">
      ${toggleSwitch('timedToggle', 'Timer', '\u23F1\uFE0F', s.timed, 'Add a countdown timer to each question')}
      ${toggleSwitch('soundToggle', 'Sound', '\uD83D\uDD0A', s.sound, 'Turn game sounds on or off')}
      ${toggleSwitch('musicToggle', 'Music', '\uD83C\uDFB5', s.music, 'Play a gentle tune in the background')}
    </div>

    <p class="home-hint muted">Find your progress, rewards and help in the menu at the top right.</p>
  `;

  container.querySelectorAll('.mode-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.diff === 'table') handlers.onPickTable();
      else handlers.onDifficulty(btn.dataset.diff);
    });
  });

  // Wire the On/Off switches.
  const wireSwitch = (id, cb) => {
    const el = $('#' + id, container);
    el.addEventListener('click', () => {
      const on = !el.classList.contains('on');
      el.classList.toggle('on', on);
      el.setAttribute('aria-checked', on);
      $('.switch-state', el).textContent = on ? 'On' : 'Off';
      cb(on);
    });
  };
  wireSwitch('timedToggle', handlers.onTimed);
  wireSwitch('soundToggle', handlers.onSound);
  wireSwitch('musicToggle', handlers.onMusic);

  $('#playBtn', container).addEventListener('click', handlers.onPlay);
}

// ---- Table picker dialog (array of 1-20 tiles) ----
export function renderTableDialog(current, handlers) {
  const host = document.getElementById('modalHost');
  const tiles = Array.from({ length: 20 }, (_, i) => i + 1).map((n) => `
    <button type="button" class="table-tile ${n === current ? 'selected' : ''}" data-table="${n}"
      aria-label="${n} times table" title="${n}\u00D7 table">${n}</button>`).join('');
  host.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="tableDlgTitle">
        <h2 id="tableDlgTitle" tabindex="-1">Which table?</h2>
        <p class="muted">Pick a number to practise that times table (1\u00D7 to 20\u00D7).</p>
        <div class="table-grid" role="group" aria-label="Choose a table">${tiles}</div>
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

// ---- Mastery grid ----
export function renderMastery(container, handlers) {
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
  container.innerHTML = `
    <div class="play-top">
      <button class="btn btn-ghost btn-back" id="mBack" aria-label="Back to home" title="Back to home">\u2190</button>
      <h2 tabindex="-1">My progress</h2>
    </div>
    ${legend}
    <p class="grid-hint muted">Tables 1\u00D7 to 20\u00D7. Scroll sideways to see more. Tap a square for details.</p>
    <div class="grid-scroll">
      <div class="grid" role="table" aria-label="Mastery grid, tables 1 to 20">
        <div class="grid-row grid-header-row" role="row">
          <div class="grid-label" role="columnheader"></div>${headCols}
        </div>
        ${grid}
      </div>
    </div>
  `;
  $('#mBack', container).addEventListener('click', handlers.onHome);
}

// ---- Rewards ----
export function renderRewards(container, state, handlers) {
  const earned = new Set(state.badges);
  const chips = Object.entries(BADGES).map(([id, b]) => `
    <div class="badge-card ${earned.has(id) ? 'earned' : 'locked'}">
      <div class="badge-icon">${earned.has(id) ? b.icon : '\uD83D\uDD12'}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
    </div>`).join('');
  const b = state.bests;
  container.innerHTML = `
    <div class="play-top">
      <button class="btn btn-ghost btn-back" id="rBack" aria-label="Back to home">\u2190</button>
      <h2 tabindex="-1">Rewards</h2>
    </div>
    <div class="bests">
      <div class="best-item"><span class="best-num">${b.easy}</span>Easy best</div>
      <div class="best-item"><span class="best-num">${b.medium}</span>Medium best</div>
      <div class="best-item"><span class="best-num">${b.hard}</span>Hard best</div>
      <div class="best-item"><span class="best-num">${b.longestStreak}</span>Longest streak</div>
    </div>
    <div class="badge-grid">${chips}</div>
  `;
  $('#rBack', container).addEventListener('click', handlers.onHome);
}

// ---- Profile setup (create / edit) ----
// CREATE: a stepped wizard, one thing at a time -> Name, Gender, Age, Avatar.
// canCancel: show a Cancel/Back on the first step (when other profiles exist).
export function renderSetup(container, { canCancel = false }, handlers) {
  const draft = { name: '', gender: null, age: null, avatar: null }; // no defaults; user must choose
  const steps = ['name', 'gender', 'age', 'avatar'];
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
      const ageTiles = Array.from({ length: 11 }, (_, i) => i + 5).map((n) => `
        <button type="button" class="age-opt ${n === draft.age ? 'selected' : ''}" data-age="${n}"
          aria-pressed="${n === draft.age}" aria-label="Age ${n}" title="Age ${n}">${n}</button>`).join('');
      return `
        <div class="field">
          <span>How old are you?</span>
          <div class="age-grid" role="group" aria-label="Choose your age">${ageTiles}</div>
          <small class="muted">We'll pick questions that are just right for your age.</small>
        </div>`;
    }
    const avatarGrid = AVATARS.map((a) => `
      <button type="button" class="avatar-opt ${a === draft.avatar ? 'selected' : ''}" data-av="${a}"
        aria-pressed="${a === draft.avatar}" aria-label="Avatar ${a}" title="Choose this avatar">${a}</button>`).join('');
    return `
      <div class="field">
        <span>Pick your character</span>
        <div class="avatar-grid" role="group" aria-label="Choose an avatar">${avatarGrid}</div>
      </div>`;
  }

  function render() {
    const isLast = step === steps.length - 1;
    const backLabel = step === 0 ? (canCancel ? 'Cancel' : '') : '\u2190 Back';
    container.innerHTML = `
      <h2 tabindex="-1">Create your player</h2>
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
      input.addEventListener('input', () => { draft.name = input.value; });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); next(); } });
    } else {
      const map = { gender: ['gender-opt', 'gender', 'gender'], age: ['age-opt', 'age', 'age'], avatar: ['avatar-opt', 'av', 'avatar'] };
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
    if (steps[step] === 'gender' && !draft.gender) return 'Please pick boy or girl to carry on.';
    if (steps[step] === 'age' && !draft.age) return 'Please tap your age to carry on.';
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
  const draft = { name: profile.name, gender: profile.gender || 'boy', age: profile.age, avatar: profile.avatar };

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
    const ageTiles = Array.from({ length: 11 }, (_, i) => i + 5).map((n) => `
      <button type="button" class="age-opt ${n === draft.age ? 'selected' : ''}" data-age="${n}"
        aria-pressed="${n === draft.age}" aria-label="Age ${n}" title="Age ${n}">${n}</button>`).join('');
    const avatarGrid = AVATARS.map((a) => `
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
          <div class="age-grid" role="group" aria-label="Age">${ageTiles}</div>
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
    wireGroup('.age-opt', 'age', 'age', true);
    wireGroup('.avatar-opt', 'av', 'avatar', false);
    const cancel = () => { editing = false; renderView(); };
    $('#cancelEdit', container).addEventListener('click', cancel);
    $('#cancelEdit2', container).addEventListener('click', cancel);
    $('#saveEdit', container).addEventListener('click', () => {
      handlers.onSave({
        name: (draft.name || '').trim() || 'Player',
        gender: draft.gender || 'boy',
        age: Number(draft.age),
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
export function renderProfileChip(profile, handlers) {
  const host = document.getElementById('profileChip');
  if (!host) return;
  if (!profile) { host.innerHTML = ''; host.classList.add('hidden'); return; }
  host.classList.remove('hidden');
  host.innerHTML = `
    <button class="chip-btn" id="chipBtn" aria-haspopup="true" aria-expanded="false"
      aria-label="Player menu for ${escapeHtml(profile.name)}">
      <span class="chip-av">${profile.avatar}</span>
      <span class="chip-name">${escapeHtml(profile.name)}</span>
      <span class="chip-caret" aria-hidden="true">\u25BE</span>
    </button>
    <div class="chip-menu" id="chipMenu" role="menu" hidden>
      <button role="menuitem" data-act="profile">\uD83D\uDC64 Profile</button>
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
  menu.querySelectorAll('[data-act]').forEach((mi) => {
    mi.addEventListener('click', () => { close(); handlers[mi.dataset.act]?.(); });
  });
  document.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
