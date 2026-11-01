let ctx, muted = false, clickAudio = null;
export const isMuted = () => muted;
export const setMuted = (v) => { muted = v; };
let clickSrc = null;
export function setClickSound(src) { clickSrc = src; const a = new Audio(src); a.preload = 'auto'; a.addEventListener('error', () => console.warn('No se encontró el sonido de clic:', src)); }
function drop() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(950, t); o.frequency.exponentialRampToValueAtTime(320, t + 0.12);
    g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.16);
  } catch (e) { /* audio no disponible */ }
}
export function click() {
  if (muted || !clickSrc) return;
  const a = new Audio(clickSrc); a.volume = 0.7;
  a.addEventListener('error', drop, { once: true });
  a.play().catch(drop);
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
