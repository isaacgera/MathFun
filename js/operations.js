// operations.js - single source of truth for per-operation behaviour (SPEC R11, design sec 12).
// Each operation declares its symbol, its difficulty level set, and how to generate a question
// (one correct answer + three believable near-miss distractors). The rest of the app stays
// generic and just asks the active operation for what it needs.

import { nextQuestion as mulQuestion } from './questions.js';

// ---- shared helpers ----
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build 3 believable near-miss distractors around `correct` for + / - (SPEC R11.7).
// Offsets are typical kid slips: off-by-one, off-by-ten, a single-digit slip, a
// carry/borrow-style miss. We de-dupe, drop <=0 and the correct value, then top up.
function buildAddSubDistractors(correct) {
  const digitSlip = randInt(2, 9);
  const offsets = [1, -1, 10, -10, digitSlip, -digitSlip, 2, -2, 11, -11, 9, -9];
  const seen = new Set([correct]);
  const out = [];
  for (const off of shuffle(offsets)) {
    const c = correct + off;
    if (c >= 0 && !seen.has(c)) { seen.add(c); out.push(c); }
    if (out.length === 3) break;
  }
  // Top up with widening offsets if we came up short (e.g. correct near 0).
  let step = 3;
  while (out.length < 3) {
    const c = correct + (Math.random() < 0.5 ? step : -step);
    if (c >= 0 && !seen.has(c)) { seen.add(c); out.push(c); }
    step++;
  }
  return out;
}

// Number-size ranges for + / - by level (SPEC R11.4). max = inclusive upper bound per operand.
// Easy: single digit (to 10) | Medium: two digit (to 100) | Hard: three digit (to 1000) |
// Super Hard: four digit (to 10000).
const ADD_SUB_RANGE = {
  easy:      { min: 1, max: 9 },     // single-digit operands (sums stay small)
  medium:    { min: 1, max: 99 },    // two-digit
  hard:      { min: 1, max: 999 },   // three-digit
  superhard: { min: 1, max: 9999 },  // four-digit
};

function rangeFor(level) { return ADD_SUB_RANGE[level] || ADD_SUB_RANGE.easy; }

// ---- Addition ----
function addQuestion(mode) {
  const { min, max } = rangeFor(mode.difficulty);
  const a = randInt(min, max);
  const b = randInt(min, max);
  const correct = a + b;
  const options = shuffle([correct, ...buildAddSubDistractors(correct)]);
  return { a, b, id: `${a}+${b}`, text: `${a} + ${b}`, correct, options };
}

// ---- Subtraction (never negative: bigger - smaller, SPEC R11.5) ----
function subQuestion(mode) {
  const { min, max } = rangeFor(mode.difficulty);
  let a = randInt(min, max);
  let b = randInt(min, max);
  if (b > a) { const t = a; a = b; b = t; } // ensure a >= b so result >= 0
  const correct = a - b;
  const options = shuffle([correct, ...buildAddSubDistractors(correct)]);
  return { a, b, id: `${a}-${b}`, text: `${a} \u2212 ${b}`, correct, options };
}

// ---- Multiplication (delegates to the existing, unchanged engine) ----
function mulGenerate(mode, mastery) {
  // questions.js.nextQuestion expects mode = { difficulty, table } and the mastery map.
  return mulQuestion(mode, mastery);
}

// ---- Operation registry ----
export const OPERATIONS = {
  mul: {
    key: 'mul', symbol: '\u00D7', name: 'Multiplication', short: 'Times',
    emoji: '\u2716\uFE0F', playable: true,
    levels: ['easy', 'medium', 'hard', 'table'],
    hasTable: true, usesGrid: true,
    generate: mulGenerate,
  },
  add: {
    key: 'add', symbol: '+', name: 'Addition', short: 'Add',
    emoji: '\u2795', playable: true,
    levels: ['easy', 'medium', 'hard', 'superhard'],
    hasTable: false, usesGrid: false,
    generate: addQuestion,
  },
  sub: {
    key: 'sub', symbol: '\u2212', name: 'Subtraction', short: 'Subtract',
    emoji: '\u2796', playable: true,
    levels: ['easy', 'medium', 'hard', 'superhard'],
    hasTable: false, usesGrid: false,
    generate: subQuestion,
  },
  div: {
    key: 'div', symbol: '\u00F7', name: 'Division', short: 'Divide',
    emoji: '\u2797', playable: false, // "coming soon" (SPEC R11.6)
    levels: [],
    hasTable: false, usesGrid: false,
    generate: null,
  },
};

export const OP_ORDER = ['add', 'sub', 'mul', 'div'];

export function getOperation(key) {
  return OPERATIONS[key] || OPERATIONS.mul;
}

// Human labels for level cards, per operation.
export const LEVEL_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  superhard: 'Super Hard',
  table: 'Pick a table',
};

// Short descriptive tooltip per (operation, level) - used for card titles/aria.
export function levelTitle(opKey, level) {
  if (opKey === 'mul') {
    return {
      easy: 'Easy - tables 1 to 5',
      medium: 'Medium - tables 1 to 10',
      hard: 'Hard - tables 1 to 20',
      table: 'Practise one times table',
    }[level] || LEVEL_LABELS[level];
  }
  // add / sub share number-size ranges.
  return {
    easy: 'Easy - single-digit numbers (up to 10)',
    medium: 'Medium - two-digit numbers (up to 100)',
    hard: 'Hard - three-digit numbers (up to 1000)',
    superhard: 'Super Hard - four-digit numbers (up to 10000)',
  }[level] || LEVEL_LABELS[level];
}

// Emoji shown on each difficulty card (kept consistent across operations).
export const LEVEL_EMOJI = {
  easy: '\uD83D\uDE0A',       // smiley
  medium: '\uD83D\uDE80',     // rocket
  hard: '\uD83E\uDD16',       // robot
  superhard: '\uD83D\uDD25',  // fire
  table: '\uD83C\uDFAF',      // target
};

// Generate the next question for the active operation.
export function generateQuestion(mode, mastery = {}) {
  const op = getOperation(mode.op);
  if (!op.playable || !op.generate) return null;
  return op.generate(mode, mastery);
}
