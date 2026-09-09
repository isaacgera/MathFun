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

// ---- Background music: jolly, bouncy platformer-style loops, synthesized (no files) ----
// Each context (operation / Fun Facts / Daily Challenge) has its own tune: a lead melody,
// a per-beat walking bass, a lead waveform for character, and a tempo. Kept low-volume so
// it sits behind the game. (v1.2)
let musicTimer = null;
let musicOn = false;
let musicStep = 0;
let currentTune = null;

// ---- Note frequencies (Hz) used across the tunes ----
const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
};

const TUNES = {
  // Multiplication - the bright platformer march.
  mul: {
    stepMs: 150, lead: 'square',
    LEAD: [
      N.C5, N.E5, N.G5, N.C6,  N.B5, N.G5, N.A5, null,
      N.F5, N.A5, N.C6, N.A5,  N.G5, N.E5, N.D5, null,
      N.C5, N.E5, N.C5, N.E5,  N.F5, N.G5, N.A5, null,
      N.B5, N.A5, N.G5, N.E5,  N.C5, N.D5, N.C5, null,
    ],
    BASS: [N.C3, N.C3, N.F3, N.G3, N.C3, N.F3, N.G3, N.C3],
  },
  // Addition - a happy, skippy climb (feels like things adding up).
  add: {
    stepMs: 150, lead: 'triangle',
    LEAD: [
      N.C5, N.D5, N.E5, N.G5,  N.E5, N.G5, N.C6, null,
      N.A5, N.G5, N.E5, N.G5,  N.F5, N.E5, N.D5, null,
    ],
    BASS: [N.C3, N.E3, N.F3, N.G3],
  },
  // Subtraction - a bouncy tune that steps back down (mirrors taking away).
  sub: {
    stepMs: 160, lead: 'square',
    LEAD: [
      N.C6, N.B5, N.A5, N.G5,  N.A5, N.G5, N.E5, null,
      N.G5, N.E5, N.D5, N.C5,  N.E5, N.D5, N.C5, null,
    ],
    BASS: [N.A3, N.G3, N.F3, N.C3],
  },
  // Division - a neat, orderly groove (sharing into equal groups).
  div: {
    stepMs: 155, lead: 'triangle',
    LEAD: [
      N.G5, N.C6, N.G5, N.E5,  N.F5, N.A5, N.F5, N.D5,
      N.E5, N.G5, N.E5, N.C5,  N.D5, N.F5, N.D5, null,
    ],
    BASS: [N.C3, N.G3, N.F3, N.G3],
  },
  // Fun Facts - a curious, twinkly little theme.
  facts: {
    stepMs: 170, lead: 'sine',
    LEAD: [
      N.E5, N.G5, N.A5, N.C6,  N.B5, N.A5, N.G5, null,
      N.A5, N.C6, N.B5, N.G5,  N.E5, N.G5, N.E5, null,
    ],
    BASS: [N.A3, N.F3, N.C3, N.G3],
  },
  // Daily Challenge - a punchy, exciting fanfare-style loop.
  daily: {
    stepMs: 140, lead: 'square',
    LEAD: [
      N.C5, N.G5, N.C6, N.G5,  N.C6, N.E5, N.G5, null,
      N.F5, N.A5, N.C6, N.A5,  N.G5, N.C6, N.G5, null,
      N.E5, N.G5, N.C6, N.E5,  N.D5, N.G5, N.B5, null,
      N.C6, N.G5, N.E5, N.C5,  N.G4, N.C5, null, null,
    ],
    BASS: [N.C3, N.C3, N.F3, N.G3, N.E3, N.F3, N.G3, N.C3],
  },
};

const DEFAULT_TUNE = 'mul';

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
  if (!musicOn || !currentTune) return;
  const ac = audio();
  if (!ac) return;
  const LEAD = currentTune.LEAD, BASS = currentTune.BASS;
  const i = musicStep % LEAD.length;
  const offbeat = i % 2 === 1;

  // Lead uses the tune's chosen waveform. A touch of swing on the off-beats gives bounce.
  const swing = offbeat ? 0.035 : 0;
  playTone(LEAD[i], offbeat ? 0.13 : 0.17, currentTune.lead, offbeat ? 0.03 : 0.038, swing);
  // A soft triangle an octave up doubles the lead for a fuller, brighter tone.
  playTone(LEAD[i] ? LEAD[i] * 2 : 0, 0.10, 'triangle', 0.012, swing);

  // Walking bass on each beat (every 4 steps).
  if (i % 4 === 0) playTone(BASS[(i / 4) % BASS.length], 0.28, 'sine', 0.055);
  // Light hi-hat on the off-beats for groove.
  if (offbeat) playTick(0.016);

  musicStep++;
}

// Start (or switch to) a named tune: 'mul' | 'add' | 'sub' | 'div' | 'facts' | 'daily'.
// Calling with a new tune while music is on switches smoothly to the new one.
export function startMusic(tuneKey = DEFAULT_TUNE) {
  const tune = TUNES[tuneKey] || TUNES[DEFAULT_TUNE];
  unlock();
  if (!audio()) return;
  if (musicOn && currentTune === tune) return; // already playing this tune
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  currentTune = tune;
  musicOn = true;
  musicStep = 0;
  musicTickStep();
  musicTimer = setInterval(musicTickStep, tune.stepMs);
}

export function stopMusic() {
  musicOn = false;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

export function isMusicOn() { return musicOn; }
