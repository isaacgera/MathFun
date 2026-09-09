// operations.js - single source of truth for per-operation behaviour (SPEC R11, design sec 12).
// Each operation declares its symbol, its difficulty level set, and how to generate a question
// (one correct answer + three believable near-miss distractors). The rest of the app stays
// generic and just asks the active operation for what it needs.

import { nextQuestion as mulQuestion } from './questions.js';

// ---- shared helpers ----
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build 3 believable near-miss distractors around `correct` for + / - (SPEC R11.7).
// candidateOffsets are typical kid slips: off-by-one, off-by-ten, a single-digit slip,
// a carry/borrow-style miss. We de-dupe, drop <=0 and the correct value, then top up.
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

// ---- Division (whole-number, exact: built as the inverse of the tables) ----
// We generate a divisor and a quotient, multiply to get the dividend, so
// dividend / divisor = quotient is always a whole number (no remainders).
// Difficulty controls the size of the factors, mirroring multiplication:
//   Easy: factors 1-5 | Medium: 1-10 | Hard: 1-20 | Pick-a-table: divide by one number.
const DIV_CAP = { easy: 5, medium: 10, hard: 20 };

// Believable near-miss distractors for a division answer (the quotient).
// Kids' typical slips: off-by-one, adjacent factor, a small +/- wobble. Never <=0.
function buildDivDistractors(correct, divisor) {
  const offsets = [1, -1, 2, -2, 3, -3];
  const seen = new Set([correct]);
  const out = [];
  // A common confusion is answering with the divisor or dividend-ish values.
  const extras = [divisor, correct + 1, correct - 1].filter((v) => v > 0);
  for (const c of extras) { if (!seen.has(c)) { seen.add(c); out.push(c); } if (out.length === 3) break; }
  for (const off of shuffle(offsets)) {
    if (out.length === 3) break;
    const c = correct + off;
    if (c > 0 && !seen.has(c)) { seen.add(c); out.push(c); }
  }
  let step = 4;
  while (out.length < 3) {
    const c = correct + (Math.random() < 0.5 ? step : -step);
    if (c > 0 && !seen.has(c)) { seen.add(c); out.push(c); }
    step++;
  }
  return out;
}

function divQuestion(mode) {
  let divisor, quotient;
  if (mode.difficulty === 'table' && mode.table) {
    // Pick-a-table: always divide BY the chosen number (its "division table").
    divisor = mode.table;
    quotient = randInt(1, 20);
  } else {
    const cap = DIV_CAP[mode.difficulty] || DIV_CAP.easy;
    divisor = randInt(1, cap);
    quotient = randInt(1, cap);
  }
  const dividend = divisor * quotient;   // guarantees an exact whole-number answer
  const correct = quotient;
  const options = shuffle([correct, ...buildDivDistractors(correct, divisor)]);
  // a/b kept for symmetry; div is not tracked in the A x B mastery grid.
  return { a: dividend, b: divisor, id: `${dividend}/${divisor}`, text: `${dividend} \u00F7 ${divisor}`, correct, options };
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
    emoji: '\u2797', playable: true, // v1.2: whole-number division (inverse of the tables)
    levels: ['easy', 'medium', 'hard', 'table'],
    hasTable: true, usesGrid: false, // uses the table picker, but no A x B mastery grid
    generate: divQuestion,
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
  if (opKey === 'div') {
    return {
      easy: 'Easy - divide numbers up to 5',
      medium: 'Medium - divide numbers up to 10',
      hard: 'Hard - divide numbers up to 20',
      table: 'Practise dividing by one number',
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

// A friendly, kid-level hint for a question, tailored to its operation. Nudges toward the
// method (count on, count back, repeated addition, share out) without giving the answer away.
// `opKey` falls back to the question's own tag (challenge questions carry q.op).
export function hintFor(question, opKey) {
  if (!question) return 'Take your time and have a good look at the numbers.';
  const key = opKey || question.op || 'mul';
  const a = question.a, b = question.b;
  switch (key) {
    case 'add':  return addHint(a, b);
    case 'sub':  return subHint(a, b);
    case 'mul':  return mulHint(a, b);
    case 'div':  return divHint(a, b);
    default:     return 'Look for a number pattern you already know.';
  }
}

// Addition: count on from the BIGGER number; for larger sums, add tens then ones,
// and suggest a make-ten jump when it helps. Gives a real first step, not the answer.
function addHint(a, b) {
  const big = Math.max(a, b), small = Math.min(a, b);
  if (small === 0) return `Adding 0 changes nothing \u2014 the answer is just ${big}.`;
  if (big >= 20 || small >= 20) {
    const tens = Math.floor(small / 10) * 10;
    const ones = small - tens;
    if (tens > 0 && ones > 0) {
      return `Add the tens first: ${big} + ${tens} = ${big + tens}. Then add the ${ones} ones on top.`;
    }
    return `Start at ${big} and add ${small}. Try adding the tens, then the ones.`;
  }
  // Small sums: make-ten strategy when the bigger number is close to 10.
  if (big < 10 && big + small > 10) {
    const toTen = 10 - big;
    return `Jump to 10 first: ${big} needs ${toTen} more to reach 10. Then add the other ${small - toTen}.`;
  }
  return `Start at the bigger number, ${big}, and count on ${small} more.`;
}

// Subtraction: count back; for bigger numbers take away the tens first.
function subHint(a, b) {
  if (b === 0) return `Taking away 0 changes nothing \u2014 the answer is ${a}.`;
  if (b === a) return `A number take away itself is always 0.`;
  if (a >= 20 || b >= 20) {
    const tens = Math.floor(b / 10) * 10;
    const ones = b - tens;
    if (tens > 0 && ones > 0) {
      return `Take away the tens first: ${a} \u2212 ${tens} = ${a - tens}. Then take away the ${ones} ones.`;
    }
    return `Start at ${a} and count back ${b}. Try the tens first, then the ones.`;
  }
  return `Start at ${a} and count back ${b} on your fingers. What number do you land on?`;
}

// Multiplication: give a real shortcut anchored to a fact the child likely knows.
function mulHint(a, b) {
  // Order the factors so hints read naturally (anchor off the handier one).
  const hi = Math.max(a, b), lo = Math.min(a, b);
  if (lo === 0) return `Anything times 0 is 0.`;
  if (lo === 1) return `Anything times 1 stays the same \u2014 it's ${hi}.`;
  if (lo === 2) return `Times 2 means double it: ${hi} + ${hi}.`;
  if (lo === 5) return `Times 5: count in fives \u2014 5, 10, 15... ${hi} times. Tip: it's half of ${hi} \u00D7 10 = ${hi * 10}.`;
  if (lo === 10) return `Times 10 just adds a zero to ${hi}.`;
  if (lo === 9) return `Times 9 trick: do ${hi} \u00D7 10 = ${hi * 10}, then take away one ${hi}.`;
  // General: build from the nearest ten-times fact.
  return `Start from ${hi} \u00D7 10 = ${hi * 10}, then take away ${hi} for each step down to \u00D7${lo}. Or count in ${lo}s, ${hi} times.`;
}

// Division: frame as "how many groups", point to the matching times-table fact,
// and start the skip-count so the child can find the quotient.
function divHint(dividend, divisor) {
  if (divisor === 1) return `Dividing by 1 changes nothing \u2014 the answer is ${dividend}.`;
  if (divisor === dividend) return `A number divided by itself is always 1.`;
  const s1 = divisor, s2 = divisor * 2, s3 = divisor * 3;
  return `Ask: how many ${divisor}s make ${dividend}? Count up in ${divisor}s \u2014 ${s1}, ${s2}, ${s3}... \u2014 until you reach ${dividend}, and count how many jumps.`;
}

// Generate the next question for the active operation.
export function generateQuestion(mode, mastery = {}) {
  const op = getOperation(mode.op);
  if (!op.playable || !op.generate) return null;
  return op.generate(mode, mastery);
}

// ---- Daily Challenge: a surprise question from a random playable operation ----
// Picks a random operation (+ - x div) and a sensible level, then generates one question.
// Used by the Daily Challenge round so each question can be a different operation.
export function generateChallengeQuestion(mastery = {}) {
  const playable = OP_ORDER.filter((k) => OPERATIONS[k].playable);
  const opKey = playable[Math.floor(Math.random() * playable.length)];
  const op = OPERATIONS[opKey];
  // Choose a level from the operation's non-"table" levels (keeps it varied but fair).
  const levels = op.levels.filter((l) => l !== 'table');
  const difficulty = levels[Math.floor(Math.random() * levels.length)] || 'easy';
  const mode = { op: opKey, difficulty };
  const q = op.generate(mode, mastery);
  if (q) q.op = opKey; // tag so the UI can show which kind it was
  return q;
}
