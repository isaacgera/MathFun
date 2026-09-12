// sound.js - WebAudio synthesized tones only, no asset files (SPEC R3, sec 8).
// All playback is gated by the caller checking the sound setting.

let ctx = null;
let musicBus = null; // dedicated, louder output bus for background music (via a limiter)

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

// A dedicated output chain for the background music: a gain stage feeding a compressor
// (limiter) into the destination. This lets us push the music LOUD without clipping/
// distortion - the compressor tames peaks while the gain lifts the overall level.
// SFX (correct/wrong/reward) bypass this and go straight to the destination.
function music() {
  const ac = audio();
  if (!ac) return null;
  if (musicBus) return musicBus;
  const gain = ac.createGain();
  gain.gain.value = 1.0;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14; // start limiting above this
  comp.knee.value = 24;
  comp.ratio.value = 12;      // hard-ish limiting to catch peaks
  comp.attack.value = 0.003;
  comp.release.value = 0.25;
  gain.connect(comp).connect(ac.destination);
  musicBus = gain;
  return musicBus;
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

// ---- Background music: ONE distinct tune PER THEME (v1.3) ----
// Simpler + more distinct than before: each character theme has its own composed melody
// (its own notes, bass line, waveform and tempo), and that single tune plays across ALL
// operations/options while that theme is active. The tune no longer depends on the
// operation/context - only on the selected theme. Still fully synthesized (no audio files).
let musicTimer = null;
let musicOn = false;
let musicStep = 0;
let currentTune = null;    // the tune object currently playing
let currentThemeKey = null; // which theme's tune is playing

// Master volume for the music bed. Pushed high (v1.3) and fed through the music()
// compressor/limiter so it's clearly audible without distortion. Multiplies the per-voice
// gains below.
const MASTER = 6.0;

// ---- Note frequencies (Hz), spanning a few octaves so tunes can sit high or low ----
const N = {
  C2: 65.41, E2: 82.41, G2: 98.00, A2: 110.00,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
};

// Each THEME gets ONE tune: a lead melody, a per-beat bass, a lead waveform, a tempo (stepMs),
// and a groove flag (hi-hat on the off-beats). Distinct keys/registers/waveforms make them
// clearly different from one another - not just tempo shifts.
const TUNES = {
  // Math World - bright, tidy C-major platformer march (square lead).
  math: {
    stepMs: 150, lead: 'square', hat: true,
    LEAD: [
      N.C5, N.E5, N.G5, N.C6,  N.B5, N.G5, N.A5, null,
      N.F5, N.A5, N.C6, N.A5,  N.G5, N.E5, N.D5, null,
    ],
    BASS: [N.C3, N.G3, N.F3, N.G3],
  },
  // Plumber World - super-bouncy chiptune hop (fast square, punchy bass).
  plumber: {
    stepMs: 130, lead: 'square', hat: true,
    LEAD: [
      N.E5, N.E5, null, N.E5,  null, N.C5, N.E5, null,
      N.G5, null, null, null,  N.G4, null, null, null,
    ],
    BASS: [N.C3, N.C3, N.G2, N.G2],
  },
  // Dino Valley - slow, heavy, low sawtooth stomp (minor, no hat = lumbering).
  dino: {
    stepMs: 240, lead: 'sawtooth', hat: false,
    LEAD: [
      N.C3, null, N.E3, null,  N.G3, null, N.E3, null,
      N.A3, null, N.G3, null,  N.E3, null, N.C3, null,
    ],
    BASS: [N.C2, N.C2, N.A2, N.G2],
  },
  // Speedy Hedgehog - very fast, zippy high square arpeggio.
  hedgehog: {
    stepMs: 95, lead: 'square', hat: true,
    LEAD: [
      N.G5, N.B5, N.D5, N.G5,  N.B5, N.D5, N.G5, N.B5,
      N.A5, N.C6, N.E5, N.A5,  N.C6, N.E5, N.A5, N.C6,
    ],
    BASS: [N.G3, N.G3, N.A3, N.A3],
  },
  // Magic Kingdom - gentle, sparkly high sine waltz (no hat, dreamy).
  magic: {
    stepMs: 200, lead: 'sine', hat: false,
    LEAD: [
      N.C6, N.E5, N.G5,  N.A5, N.G5, N.E5,
      N.F5, N.A5, N.C6,  N.B5, N.G5, N.E5,
    ],
    BASS: [N.C4, N.G3, N.F3],
  },
  // Space Blast - airy, floaty triangle in a wide, open key.
  space: {
    stepMs: 175, lead: 'triangle', hat: true,
    LEAD: [
      N.D5, N.A5, N.D5, N.F5,  N.A5, N.D5, N.A4, null,
      N.C5, N.G5, N.C5, N.E5,  N.G5, N.C5, N.G4, null,
    ],
    BASS: [N.D3, N.D3, N.C3, N.C3],
  },
  // Ocean Deep - slow, smooth, mellow low sine (calm, no hat).
  ocean: {
    stepMs: 260, lead: 'sine', hat: false,
    LEAD: [
      N.A4, null, N.C5, null,  N.E5, null, N.C5, null,
      N.G4, null, N.B4, null,  N.D5, null, N.B4, null,
    ],
    BASS: [N.A2, N.A2, N.G2, N.G2],
  },
  // Jungle Safari - lively, percussive mid triangle with a strong groove.
  jungle: {
    stepMs: 135, lead: 'triangle', hat: true,
    LEAD: [
      N.E5, null, N.E5, N.G5,  N.E5, null, N.D5, null,
      N.C5, null, N.E5, N.G5,  N.A5, null, N.G5, null,
    ],
    BASS: [N.E3, N.E3, N.C3, N.G3],
  },
  // Candy Land - high, fast, sugary-bright square skip.
  candy: {
    stepMs: 120, lead: 'square', hat: true,
    LEAD: [
      N.C6, N.B5, N.C6, N.A5,  N.G5, N.A5, N.G5, N.E5,
      N.F5, N.G5, N.A5, N.C6,  N.B5, N.A5, N.G5, null,
    ],
    BASS: [N.F3, N.C3, N.G3, N.C3],
  },
  // Robot Lab - buzzy, mechanical, low sawtooth ostinato (steady, robotic).
  robot: {
    stepMs: 150, lead: 'sawtooth', hat: true,
    LEAD: [
      N.C4, N.C4, N.E4, N.C4,  N.G4, N.C4, N.E4, N.C4,
      N.A3, N.A3, N.C4, N.A3,  N.E4, N.A3, N.C4, N.A3,
    ],
    BASS: [N.C3, N.C3, N.C3, N.G2],
  },
};

const DEFAULT_THEME_KEY = 'math';

// Remember which theme is selected so startMusic() plays the right tune. Called by
// app.js applySkin(). If music is already playing, switch to the new theme's tune live.
export function setThemeTune(themeKey) {
  const key = TUNES[themeKey] ? themeKey : DEFAULT_THEME_KEY;
  if (key === currentThemeKey) return;
  currentThemeKey = key;
  if (musicOn) restartCurrent();
}

function playTone(freq, dur, type, gain, when = 0) {
  const ac = audio();
  const bus = music();
  if (!ac || !bus || !freq) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain * MASTER, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(bus); // through the music limiter, not straight to destination
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// A short noise-based tick for a light percussive groove.
function playTick(gain, when = 0) {
  const ac = audio();
  const bus = music();
  if (!ac || !bus) return;
  const t0 = ac.currentTime + when;
  const dur = 0.03;
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ac.createBufferSource();
  const g = ac.createGain();
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 6000;
  g.gain.value = gain * MASTER;
  src.buffer = buf;
  src.connect(hp).connect(g).connect(bus);
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
  const lead = LEAD[i] || 0;
  const bass = BASS[Math.floor(i / 4) % BASS.length] || 0; // one bass note per 4 steps

  // Lead uses the theme's waveform. A touch of swing on the off-beats gives bounce.
  const swing = offbeat ? 0.035 : 0;
  playTone(lead, offbeat ? 0.14 : 0.18, currentTune.lead, offbeat ? 0.034 : 0.042, swing);
  // A soft triangle an octave up doubles the lead for a fuller, brighter tone.
  playTone(lead ? lead * 2 : 0, 0.11, 'triangle', 0.014, swing);

  // Walking bass on each beat (every 4 steps).
  if (i % 4 === 0) playTone(bass, 0.30, 'sine', 0.06);
  // Light hi-hat on the off-beats for groove (some themes drop it for a calmer feel).
  if (offbeat && currentTune.hat !== false) playTick(0.018);

  musicStep++;
}

// Start the current theme's tune. The optional argument is accepted for backward
// compatibility (old callers pass an operation/context key) but is IGNORED - the tune is
// chosen by the active theme (set via setThemeTune). No-op if that tune is already playing.
export function startMusic() {
  const key = currentThemeKey && TUNES[currentThemeKey] ? currentThemeKey : DEFAULT_THEME_KEY;
  const tune = TUNES[key];
  unlock();
  if (!audio()) return;
  if (musicOn && currentTune === tune) return; // already playing this theme's tune
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  currentTune = tune;
  musicOn = true;
  musicStep = 0;
  musicTickStep();
  musicTimer = setInterval(musicTickStep, tune.stepMs);
}

// Restart the current theme's tune (used after a theme change so the new tune takes over).
export function restartCurrent() {
  if (!musicOn) return;
  currentTune = null; // force startMusic to rebuild with the current theme's tune
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  startMusic();
}

export function stopMusic() {
  musicOn = false;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

export function isMusicOn() { return musicOn; }
