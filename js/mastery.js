// mastery.js - per-fact mastery tracking + data for the mastery grid (SPEC R6, sec 7).
// Mastered = >=5 attempts AND >=80% correct (>=4 of last 5). Okay = some attempts below that.
// Needs work = few attempts or low accuracy.

import { getState, save } from './state.js';
import { factId } from './questions.js';

const MAX_ATTEMPTS = 5;

// Record one attempt for a fact. correct = boolean.
export function record(a, b, correct) {
  const s = getState();
  const id = factId(a, b);
  const rec = s.mastery[id] || { attempts: [] };
  rec.attempts.push(correct ? 1 : 0);
  if (rec.attempts.length > MAX_ATTEMPTS) rec.attempts = rec.attempts.slice(-MAX_ATTEMPTS);
  s.mastery[id] = rec;
  save();
}

// Classify a single fact's state: 'solid' | 'okay' | 'needs' | 'new'.
export function stateFor(a, b) {
  const s = getState();
  const rec = s.mastery[factId(a, b)];
  if (!rec || rec.attempts.length === 0) return 'new';
  const correct = rec.attempts.filter((x) => x === 1).length;
  const acc = correct / rec.attempts.length;
  if (rec.attempts.length >= MAX_ATTEMPTS && acc >= 0.8) return 'solid';
  if (acc >= 0.5) return 'okay';
  return 'needs';
}

// Is an entire table (t x 1..20) mastered? Used for the "mastered a table" badge.
export function tableMastered(t) {
  for (let b = 1; b <= 20; b++) {
    if (stateFor(t, b) !== 'solid') return false;
  }
  return true;
}

// Grid data for the mastery screen: rows 1..maxTable, each with per-column state (b 1..20).
export function gridData(maxTable = 20) {
  const rows = [];
  for (let a = 1; a <= maxTable; a++) {
    const cols = [];
    for (let b = 1; b <= 20; b++) cols.push({ a, b, state: stateFor(a, b) });
    rows.push({ table: a, cols });
  }
  return rows;
}
