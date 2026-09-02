// questions.js - build the fact pool for a mode and generate a question with
// four options: one correct + three believable near-miss distractors (SPEC R1, R2, sec 4).

// Canonical fact id so 7x8 and 8x7 share one mastery cell.
export function factId(a, b) {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return `${lo}x${hi}`;
}

// Cap per difficulty. Both factors range 1..cap. Pick-a-table fixes one factor.
function capFor(mode) {
  if (mode.difficulty === 'easy') return 5;
  if (mode.difficulty === 'hard') return 20;
  return 10; // medium (and default)
}

// Map a child's age (5-15) to a starting difficulty (SPEC: age must influence questions).
// This sets a smart default; the child can still override on the home screen.
export function ageToDifficulty(age) {
  const a = Number(age) || 8;
  if (a <= 6) return 'easy';    // 5-6  -> tables 1-5
  if (a <= 8) return 'medium';  // 7-8  -> tables 1-10
  return 'hard';                // 9-15 -> tables 1-20
}

// Build the list of {a,b} facts available in this mode.
export function buildPool(mode) {
  const pool = [];
  if (mode.difficulty === 'table' && mode.table) {
    const t = mode.table;
    for (let b = 1; b <= 20; b++) pool.push({ a: t, b }); // practise t x 1..20
    return pool;
  }
  const cap = capFor(mode);
  for (let a = 1; a <= cap; a++) {
    for (let b = 1; b <= cap; b++) pool.push({ a, b });
  }
  return pool;
}

function randInt(n) { return Math.floor(Math.random() * n); }

function pick(arr) { return arr[randInt(arr.length)]; }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Weight selection slightly toward weaker facts so practice targets gaps.
// weakScore: higher = practise more. mastery param is state.mastery.
function chooseFact(pool, mastery) {
  const weighted = pool.map((f) => {
    const rec = mastery[factId(f.a, f.b)];
    let weight = 3; // unseen facts get a solid base weight
    if (rec && rec.attempts.length) {
      const correct = rec.attempts.filter((x) => x === 1).length;
      const acc = correct / rec.attempts.length;
      weight = acc >= 0.8 ? 1 : acc >= 0.5 ? 3 : 5; // weaker -> more likely
    }
    return { f, weight };
  });
  const total = weighted.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weighted) { r -= w.weight; if (r <= 0) return w.f; }
  return pick(pool); // fallback: any fact
}

// Generate believable near-miss distractors (SPEC sec 4).
function buildDistractors(a, b, correct) {
  const candidates = [
    a * (b + 1), a * (b - 1),      // off-by-one multiple
    (a + 1) * b, (a - 1) * b,      // off-by-one other factor
    correct + a, correct - a,      // adjacent product step
    correct + b, correct - b,
    correct + 1, correct - 1,      // common slip
  ];
  const seen = new Set([correct]);
  const out = [];
  for (const c of candidates) {
    if (c > 0 && !seen.has(c)) { seen.add(c); out.push(c); }
    if (out.length === 3) break;
  }
  // Top up if we still need more (small tables can run short).
  let step = 2;
  while (out.length < 3) {
    const c = correct + (Math.random() < 0.5 ? step : -step);
    if (c > 0 && !seen.has(c)) { seen.add(c); out.push(c); }
    step++;
  }
  return out;
}

// Returns { a, b, text, correct, options: number[] (shuffled), id }.
export function nextQuestion(mode, mastery = {}) {
  const pool = buildPool(mode);
  const f = chooseFact(pool, mastery);
  const correct = f.a * f.b;
  const options = shuffle([correct, ...buildDistractors(f.a, f.b, correct)]);
  return {
    a: f.a,
    b: f.b,
    id: factId(f.a, f.b),
    text: `${f.a} \u00D7 ${f.b}`,
    correct,
    options,
  };
}
