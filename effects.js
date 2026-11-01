const canvas = document.getElementById('fx');
const g = canvas.getContext('2d');
const COLORS = ['#0887F5', '#24B5EF', '#7CB8F0', '#C97BF0', '#9589EB', '#ffd54a'];
let parts = [], running = false;
function resize() { const d = devicePixelRatio || 1; canvas.width = innerWidth * d; canvas.height = innerHeight * d; g.setTransform(d, 0, 0, d, 0, 0); }
addEventListener('resize', resize); resize();
function frame() {
  g.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 20);
  for (const p of parts) {
    p.vy += 0.25; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr; p.life--;
    g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.globalAlpha = Math.min(1, p.life / 25);
    g.fillRect(-p.s / 2, -p.s / 3, p.s, p.s / 1.6); g.restore();
  }
  if (parts.length) requestAnimationFrame(frame); else running = false;
}
export function confetti(x, y, n = 45) {
  if (document.body.classList.contains('calm') || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 7;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, s: 6 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: COLORS[i % COLORS.length], life: 70 + Math.random() * 40 });
  }
  if (!running) { running = true; requestAnimationFrame(frame); }
}
export const confettiFrom = (el, n) => { const b = el.getBoundingClientRect(); confetti(b.left + b.width / 2, b.top + b.height / 2, n); };
export function shake(el) {
  el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
  if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
}
