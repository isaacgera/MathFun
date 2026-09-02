// rewards.js - stars, streaks and badges (SPEC R5, sec 6).

import { getState, save } from './state.js';
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
// round = { mode, score, bestInRoundStreak }
export function finishRound(round) {
  const s = getState();
  const stars = starsFor(round.score);
  const modeKey = round.mode.difficulty; // easy|medium|hard|table
  const newBadges = [];

  // Personal best per mode (by score).
  if (round.score > (s.bests[modeKey] ?? 0)) s.bests[modeKey] = round.score;
  if (round.bestInRoundStreak > (s.bests.longestStreak ?? 0)) {
    s.bests.longestStreak = round.bestInRoundStreak;
  }
  save();

  const days = bumpDailyStreak();

  if (round.score >= 10 && award('first_perfect')) newBadges.push('first_perfect');
  if (modeKey === 'hard' && round.score >= 10 && award('hard_hero')) newBadges.push('hard_hero');
  if (days >= 5 && award('streak_5_days')) newBadges.push('streak_5_days');

  // Table mastery badge - check the table just practised (or all in level modes is heavy;
  // keep it to pick-a-table mode where it's meaningful).
  if (modeKey === 'table' && round.mode.table && tableMastered(round.mode.table)) {
    if (award('mastered_table')) newBadges.push('mastered_table');
  }

  return { stars, newBadges, dailyStreak: days };
}

export function earnedBadges() {
  return getState().badges.slice();
}
