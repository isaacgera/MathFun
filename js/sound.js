// sound.js - WebAudio synthesized tones only, no asset files (SPEC R3, sec 8).
// All playback is gated by the caller checking the sound setting.

let ctx = null;

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

// Play a short tone. freq in Hz, dur in seconds, type oscillator shape.
function tone(freq, dur, type = 'sine', when = 0, gain = 0.12) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Some browsers suspend the context until a user gesture; resume on demand.
export function unlock() {
  const ac = audio();
  if (ac && ac.state === 'suspended') ac.resume();
}

export function correct() {
  unlock();
  tone(660, 0.12, 'sine', 0);
  tone(880, 0.14, 'sine', 0.1);
}

export function wrong() {
  unlock();
  tone(200, 0.22, 'triangle', 0);
}

export function reward() {
  unlock();
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'sine', i * 0.09));
}

export function tick() {
  unlock();
  tone(440, 0.05, 'square', 0, 0.05);
}

// ---- Background music: a bouncy, upbeat loop, synthesized (no files) ----
// A cheerful 16-step melody with a plucky lead, a soft bass on the beat, and a light
// off-beat hi-hat tick for groove. Still low-volume so it sits behind the game.
let musicTimer = null;
let musicOn = false;
let musicStep = 0;

const STEP_MS = 200; // ~150 bpm feel; one melody note per step

// Lead melody in C major (cheerful, kid-friendly). null = a rest for bounce.
const LEAD = [
  523.25, 659.25, 783.99, 659.25,  // C E G E
  698.46, 587.33, 523.25, null,    // F D C -
  587.33, 698.46, 880.00, 698.46,  // D F A F
  783.99, 659.25, 523.25, null,    // G E C -
];
// Bass note per beat (every 4 steps): C, F, G, C - a simple happy progression.
const BASS = [130.81, 174.61, 196.00, 130.81];

function playTone(freq, dur, type, gain, when = 0) {
  const ac = audio();
  if (!ac || !freq) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// A short noise-based tick for a light percussive groove.
function playTick(gain, when = 0) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const dur = 0.03;
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ac.createBufferSource();
  const g = ac.createGain();
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 6000;
  g.gain.value = gain;
  src.buffer = buf;
  src.connect(hp).connect(g).connect(ac.destination);
  src.start(t0);
  src.stop(t0 + dur);
}

function musicTickStep() {
  if (!musicOn) return;
  const ac = audio();
  if (!ac) return;
  const i = musicStep % LEAD.length;

  // Lead (plucky triangle).
  playTone(LEAD[i], 0.18, 'triangle', 0.045);
  // Bass on each beat (every 4 steps).
  if (i % 4 === 0) playTone(BASS[(i / 4) % BASS.length], 0.34, 'sine', 0.05);
  // Light hi-hat on the off-beats for groove.
  if (i % 2 === 1) playTick(0.015);

  musicStep++;
}

export function startMusic() {
  if (musicOn) return;
  unlock();
  if (!audio()) return;
  musicOn = true;
  musicStep = 0;
  musicTickStep();
  musicTimer = setInterval(musicTickStep, STEP_MS);
}

export function stopMusic() {
  musicOn = false;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

export function isMusicOn() { return musicOn; }
