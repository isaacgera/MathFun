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

// ---- Background music: a gentle looping arpeggio, synthesized (no files) ----
let musicTimer = null;
let musicOn = false;

// A simple, cheerful pentatonic loop (C major pentatonic) - easy on the ears.
const MELODY = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 880.00, 783.99];
let melodyStep = 0;

function musicNote() {
  if (!musicOn) return;
  const ac = audio();
  if (!ac) return;
  const freq = MELODY[melodyStep % MELODY.length];
  melodyStep++;
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  // low volume so it sits behind the game
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.035, t0 + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + 0.45);
}

export function startMusic() {
  if (musicOn) return;
  unlock();
  if (!audio()) return;
  musicOn = true;
  melodyStep = 0;
  musicNote();
  musicTimer = setInterval(musicNote, 480); // ~125 bpm, one note per beat
}

export function stopMusic() {
  musicOn = false;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

export function isMusicOn() { return musicOn; }
