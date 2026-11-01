let ctx, muted = false, clickAudio = null;
export const isMuted = () => muted;
export const setMuted = (v) => { muted = v; };
export function setClickSound(src) { clickAudio = new Audio(src); clickAudio.preload = 'auto'; }
export function click() {
  if (muted || !clickAudio) return;
  const a = clickAudio.cloneNode(); a.volume = 0.7; a.play().catch(() => {});
}
function tone(freq, at, dur, type = 'sine', vol = 0.08) {
  if (muted) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
    o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur);
  } catch (e) { /* audio no disponible */ }
}
export const cheer = () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.07, 0.2, 'triangle'));
export const fanfare = () => [392, 392, 392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.25, 'square', 0.05));
export const giggle = () => [880, 1100, 990, 1320, 1100].forEach((f, i) => tone(f, i * 0.06, 0.1, 'sine', 0.07));
export const sparkle = () => [1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.05, 0.12));
export const oops = () => { tone(220, 0, 0.15, 'sawtooth', 0.05); tone(165, 0.13, 0.22, 'sawtooth', 0.05); };
