// game.js - round lifecycle: 10 questions, scoring, optional per-question timer (SPEC R4, sec 5).
// v1.1: operation-aware. mode = { op, difficulty, table }. Multiplication records A x B mastery;
// all operations accumulate answered/correct for per-operation accuracy stats.

import { generateQuestion, generateChallengeQuestion } from './operations.js';
import { getState } from './state.js';
import * as mastery from './mastery.js';

export const ROUND_SIZE = 10;
export const TIMER_SECONDS = 8; // per-question timer when the Timer is on

// Create a fresh round object for the given mode ({ op, difficulty, table }).
export function createRound(mode) {
  return {
    mode,
    index: 0,             // 0-based question number
    score: 0,
    answered: 0,          // questions answered (for accuracy stats)
    correct: 0,           // answered correctly
    inRowStreak: 0,       // current consecutive-correct within round
    bestInRoundStreak: 0,
    current: null,        // current question
    isAnswered: false,
    finished: false,
  };
}

export function nextQ(round) {
  const s = getState();
  const mastMap = (s.ops && s.ops.mul && s.ops.mul.mastery) || {};
  round.current = round.mode.challenge
    ? generateChallengeQuestion(mastMap)
    : generateQuestion(round.mode, mastMap);
  round.isAnswered = false;
  return round.current;
}

// Register an answer. Returns { correct, correctValue, chosen }.
export function answer(round, chosenValue) {
  if (round.isAnswered || !round.current) return null;
  round.isAnswered = true;
  const q = round.current;
  const correct = chosenValue === q.correct;

  round.answered += 1;

  // Mastery tracking is multiplication-only (A x B facts).
  if (round.mode.op === 'mul' && typeof q.a === 'number' && typeof q.b === 'number') {
    mastery.record(q.a, q.b, correct);
  }

  if (correct) {
    round.score += 1;
    round.correct += 1;
    round.inRowStreak += 1;
    if (round.inRowStreak > round.bestInRoundStreak) {
      round.bestInRoundStreak = round.inRowStreak;
    }
  } else {
    round.inRowStreak = 0;
  }
  return { correct, correctValue: q.correct, chosen: chosenValue };
}

// Called when the per-question timer runs out with no answer: counts as wrong.
export function timeout(round) {
  if (round.isAnswered || !round.current) return null;
  return answer(round, null); // null never equals a numeric answer, so it's wrong
}

// Advance to the next question or finish the round. Returns true if a new question is ready.
export function advance(round) {
  round.index += 1;
  if (round.index >= ROUND_SIZE) {
    round.finished = true;
    return false;
  }
  nextQ(round);
  return true;
}

export function progressText(round) {
  return `Question ${Math.min(round.index + 1, ROUND_SIZE)} of ${ROUND_SIZE}`;
}
