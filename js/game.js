// game.js - round lifecycle: 10 questions, scoring, optional per-question timer (SPEC R4, sec 5).

import { nextQuestion } from './questions.js';
import { getState } from './state.js';
import * as mastery from './mastery.js';

export const ROUND_SIZE = 10;
export const TIMER_SECONDS = 8; // per-question timer when Beat-the-clock is on

// Create a fresh round object for the given mode.
export function createRound(mode) {
  return {
    mode,
    index: 0,             // 0-based question number
    score: 0,
    inRowStreak: 0,       // current consecutive-correct within round
    bestInRoundStreak: 0,
    current: null,        // current question
    answered: false,
    finished: false,
  };
}

export function nextQ(round) {
  const s = getState();
  round.current = nextQuestion(round.mode, s.mastery);
  round.answered = false;
  return round.current;
}

// Register an answer. Returns { correct, correctValue, chosen }.
export function answer(round, chosenValue) {
  if (round.answered || !round.current) return null;
  round.answered = true;
  const q = round.current;
  const correct = chosenValue === q.correct;

  mastery.record(q.a, q.b, correct);

  if (correct) {
    round.score += 1;
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
  if (round.answered || !round.current) return null;
  return answer(round, null); // null never equals a product, so it's wrong
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
