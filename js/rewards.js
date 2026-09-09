// rewards.js - stars, streaks and badges (SPEC R5, sec 6).
// v1.1: bests are per-operation (state.recordBest); longestStreak, daily streak and
// badges stay profile-level (shared across operations).

import { getState, save, recordBest, recordOpRound } from './state.js';
import { tableMastered } from './mastery.js';

// Stars from a round score out of 10 (confirmed: 3=10, 2=8-9, 1=6-7, else 0).
export function starsFor(score) {
  if (score >= 10) return 3;
  if (score >= 8) return 2;
  if (score >= 6) return 1;
  return 0;
}

// Badge catalogue (v1). Extend freely.
export const BADGES = {
  first_perfect: { name: 'Perfect!', desc: 'Got a full 10 out of 10.', icon: '\u2B50' },
  streak_5_days: { name: '5-Day Streak', desc: 'Played 5 days in a row.', icon: '\uD83D\uDD25' },
  hard_hero:     { name: 'Hard Hero', desc: 'Perfect score on Hard.', icon: '\uD83E\uDD47' },
  mastered_table:{ name: 'Table Master', desc: 'Mastered a whole table.', icon: '\uD83C\uDF93' },
};

function award(id) {
  const s = getState();
  if (!s.badges.includes(id)) { s.badges.push(id); save(); return true; }
  return false;
}

// Update the daily streak. Returns the current day count.
function bumpDailyStreak() {
  const s = getState();
  const todayISO = new Date().toISOString().slice(0, 10);
  const last = s.streakDays.lastPlayedISO;
  if (last === todayISO) return s.streakDays.count; // already counted today
  if (last) {
    const prev = new Date(last + 'T00:00:00');
    const today = new Date(todayISO + 'T00:00:00');
    const diffDays = Math.round((today - prev) / 86400000);
    s.streakDays.count = diffDays === 1 ? s.streakDays.count + 1 : 1;
  } else {
    s.streakDays.count = 1;
  }
  s.streakDays.lastPlayedISO = todayISO;
  save();
  return s.streakDays.count;
}

// Called at end of round. Returns a summary of what was earned this round.
// round = { mode, score, bestInRoundStreak, answered, correct }
// mode = { op, difficulty, table }
export function finishRound(round) {
  const s = getState();
  const stars = starsFor(round.score);
  const isChallenge = round.mode.challenge || round.mode.op === 'challenge';
  const opKey = round.mode.op || 'mul';
  const levelKey = round.mode.difficulty; // easy|medium|hard|superhard|table
  const newBadges = [];

  // Personal best per (operation, level). The Daily Challenge is a mixed fun round and is
  // deliberately NOT recorded against any single operation's bests/mastery.
  const newBest = !isChallenge && round.score > 0 && recordBest(opKey, levelKey, round.score);

  // Longest in-round streak (profile-level, across all operations).
  if (round.bestInRoundStreak > (s.longestStreak ?? 0)) {
    s.longestStreak = round.bestInRoundStreak;
    save();
  }

  // Round/accuracy stats per operation (v1.2: multiplication included so its My Progress
  // matches the others). Skip only the mixed Daily Challenge.
  if (!isChallenge) {
    recordOpRound(opKey, { answered: round.answered ?? 0, correct: round.correct ?? 0 });
  }

  const days = bumpDailyStreak();

  if (round.score >= 10 && award('first_perfect')) newBadges.push('first_perfect');
  if (!isChallenge && levelKey === 'hard' && round.score >= 10 && award('hard_hero')) newBadges.push('hard_hero');
  if (days >= 5 && award('streak_5_days')) newBadges.push('streak_5_days');

  // Table mastery badge - multiplication pick-a-table mode only.
  if (!isChallenge && opKey === 'mul' && levelKey === 'table' && round.mode.table && tableMastered(round.mode.table)) {
    if (award('mastered_table')) newBadges.push('mastered_table');
  }

  return { stars, newBadges, dailyStreak: days, newBest };
}

export function earnedBadges() {
  return getState().badges.slice();
}
