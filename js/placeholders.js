/* ══════════════════════════════════════════════
   placeholders.js — stand-in constructivist posters
   Drawn on a canvas until the commissioned art (A02–A08)
   arrives. Text-free apart from the asset tag, like the
   real posters will be.
   ══════════════════════════════════════════════ */

export const PALETTE = {
  ink: '#1d1916', red: '#b23a25', teal: '#4a6a6c', cream: '#eadcc2',
  tan: '#c7a57f', sand: '#d9c6a3', grey: '#7d7468', dark: '#2c2622',
};

const W = 1024, H = 576;

function rng(seed) {
  let s = seed || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function poly(x, col, pts) {
  x.fillStyle = col;
  x.beginPath();
  x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
  x.closePath();
  x.fill();
}

function rays(x, cx, cy, n, a0, span, colA, colB) {
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * span, b = a0 + ((i + 1) / n) * span;
    poly(x, i % 2 ? colA : colB, [[cx, cy], [cx + Math.cos(a) * 2000, cy + Math.sin(a) * 2000], [cx + Math.cos(b) * 2000, cy + Math.sin(b) * 2000]]);
  }
}

function figure(x, cx, base, s, col) {
  x.fillStyle = col;
  x.beginPath(); x.arc(cx, base - 190 * s, 34 * s, 0, Math.PI * 2); x.fill();
  poly(x, col, [[cx - 46 * s, base - 150 * s], [cx + 46 * s, base - 150 * s], [cx + 70 * s, base], [cx - 70 * s, base]]);
}

const LAYOUTS = {
  // halo behind a montage figure, radiating wedges
  halo(x, r, accent) {
    const P = PALETTE;
    rays(x, 300, 230, 10, -Math.PI, Math.PI * 1.2, P.tan, P.sand);
    x.fillStyle = P.cream; x.beginPath(); x.arc(300, 230, 150, 0, Math.PI * 2); x.fill();
    poly(x, P.ink, [[205, 576], [265, 250], [395, 240], [455, 576]]);
    poly(x, accent, [[265, 250], [335, 160], [395, 240]]);
    poly(x, P.dark, [[335, 160], [295, 90], [375, 80], [395, 240]]);
    poly(x, P.teal, [[640, 576], [720 + r() * 60, 180], [1024, 120], [1024, 576]]);
    poly(x, P.ink, [[720, 180], [790, 60], [1024, 0], [1024, 120]]);
  },
  // a big radiating disc (engine / sun) with a pointing figure
  circle(x, r, accent) {
    const P = PALETTE, cx = 690, cy = 270;
    rays(x, cx, cy, 14, 0, Math.PI * 2, P.sand, P.cream);
    x.fillStyle = P.ink; x.beginPath(); x.arc(cx, cy, 220, 0, Math.PI * 2); x.fill();
    x.fillStyle = P.grey; x.beginPath(); x.arc(cx, cy, 180, 0, Math.PI * 2); x.fill();
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      poly(x, P.cream, [[cx + Math.cos(a) * 40, cy + Math.sin(a) * 40], [cx + Math.cos(a + 0.12) * 170, cy + Math.sin(a + 0.12) * 170], [cx + Math.cos(a + 0.2) * 165, cy + Math.sin(a + 0.2) * 165]]);
    }
    x.fillStyle = accent; x.beginPath(); x.arc(cx, cy, 36, 0, Math.PI * 2); x.fill();
    figure(x, 190, 470, 1.15, P.ink);
    x.strokeStyle = P.ink; x.lineWidth = 12; x.beginPath(); x.moveTo(230, 300); x.lineTo(520, 250); x.stroke();
    poly(x, P.red, [[0, 470], [520, 410], [520, 500], [0, 576]]);
  },
  // sharp diagonal split, figures back to back
  split(x, r, accent) {
    const P = PALETTE;
    poly(x, P.grey, [[610, 0], [1024, 0], [1024, 576], [350, 576]]);
    x.fillStyle = P.ink;
    for (let i = 0; i < 4; i++) x.fillRect(740 + i * 62, 50, 18, 260);
    x.fillRect(720, 50, 220, 18); x.fillRect(720, 292, 220, 18);
    figure(x, 330, 540, 1.3, P.ink);
    figure(x, 590, 540, 1.3, P.dark);
    x.fillStyle = P.cream; x.fillRect(395, 380, 60, 60);
    x.fillStyle = accent; x.beginPath(); x.roundRect(480, 370, 70, 66, 12); x.fill();
  },
  // stacked blocks with a gear, one red block being placed
  blocks(x, r, accent) {
    const P = PALETTE;
    rays(x, 512, 0, 8, 0.25, Math.PI - 0.5, P.sand, P.cream);
    x.fillStyle = P.ink; x.fillRect(0, 520, 1024, 56);
    const cols = [P.grey, P.teal, P.ink, P.tan, P.dark];
    let y = 520;
    for (let row = 0; row < 4; row++) {
      const w = 260 - row * 40, h = 70 + r() * 30;
      y -= h;
      x.fillStyle = cols[row % cols.length]; x.fillRect(512 - w / 2 + (r() - 0.5) * 30, y, w, h);
    }
    x.fillStyle = accent; x.fillRect(452, y - 140, 120, 64);
    x.fillStyle = P.ink; x.beginPath(); x.arc(130, 380, 110, 0, Math.PI * 2); x.fill();
    x.fillStyle = P.cream; x.beginPath(); x.arc(130, 380, 38, 0, Math.PI * 2); x.fill();
    figure(x, 300, 520, 0.9, P.ink);
    figure(x, 780, 520, 0.9, P.ink);
    figure(x, 880, 520, 0.8, P.dark);
  },
};

/** Draws a placeholder poster for asset `id` and returns the canvas. */
export function placeholderCanvas(id, spec) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const r = rng(spec.seed);
  x.fillStyle = PALETTE.cream;
  x.fillRect(0, 0, W, H);
  (LAYOUTS[spec.layout] || LAYOUTS.halo)(x, r, PALETTE[spec.accent] || PALETTE.red);
  // paper mottling so it sits with the real posters
  for (let i = 0; i < 900; i++) {
    x.fillStyle = `rgba(29,25,22,${(r() * 0.05).toFixed(3)})`;
    x.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3);
  }
  // asset tag, bottom right
  x.fillStyle = PALETTE.ink;
  x.fillRect(W - 262, H - 52, 246, 36);
  x.fillStyle = PALETTE.cream;
  x.font = '22px "Special Elite", "Courier New", monospace';
  x.textBaseline = 'middle';
  x.fillText(`${id} · PLACEHOLDER`, W - 250, H - 33);
  return c;
}

const urlCache = {};
/** Same poster as a data URL, for <img> tags on the simple page. */
export function placeholderURL(id, spec) {
  if (!urlCache[id]) urlCache[id] = placeholderCanvas(id, spec).toDataURL('image/jpeg', 0.86);
  return urlCache[id];
}
