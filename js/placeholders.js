/* ══════════════════════════════════════════════
   placeholders.js — constructivist posters drawn in code
   Stand in for the commissioned art (A02–A08) until it
   arrives: a cut-paper composition plus a title label in
   the page's banner style. Call after postersReady().
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

// where each composition leaves room for the title label
const LABEL_AT = {
  halo:   { x: 548, y: 392, w: 452 },
  circle: { x: 36,  y: 40,  w: 470 },
  split:  { x: 36,  y: 48,  w: 520 },
  blocks: { x: 36,  y: 40,  w: 396 },
  waves:  { x: 36,  y: 40,  w: 470 },
  chess:  { x: 572, y: 52,  w: 420 },
};

// ink banner with the title, red strip with the subtitle under it
function label(x, at, title, sub) {
  const pad = 22;
  let size = 104;
  x.font = `${size}px "Bebas Neue", "Arial Narrow", sans-serif`;
  const tw = x.measureText(title).width;
  if (tw > at.w - pad * 2) size = Math.floor(size * (at.w - pad * 2) / tw);
  const bandH = Math.round(size * 1.02);
  x.save();
  x.translate(at.x, at.y);
  x.rotate(-0.035);
  poly(x, PALETTE.ink, [[0, 0], [at.w, 0], [at.w - bandH * 0.18, bandH], [0, bandH]]);
  x.fillStyle = PALETTE.cream;
  x.font = `${size}px "Bebas Neue", "Arial Narrow", sans-serif`;
  x.textBaseline = 'alphabetic';
  x.fillText(title, pad, bandH * 0.86);
  if (sub) {
    x.font = '22px "Special Elite", "Courier New", monospace';
    const sw = Math.min(at.w - 20, x.measureText(sub).width + pad * 2);
    poly(x, PALETTE.red, [[0, bandH + 6], [sw, bandH + 6], [sw - 8, bandH + 44], [0, bandH + 44]]);
    x.fillStyle = PALETTE.cream;
    x.textBaseline = 'middle';
    x.fillText(sub, pad, bandH + 26, at.w - pad * 2);
  }
  x.restore();
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

// a sun over water, its reflection broken into bars (light & water)
LAYOUTS.waves = function (x, r, accent) {
  const P = PALETTE, cx = 720, cy = 230;
  rays(x, cx, cy, 18, Math.PI, Math.PI, P.sand, P.cream);
  x.fillStyle = P.cream; x.beginPath(); x.arc(cx, cy, 150, 0, Math.PI * 2); x.fill();
  x.fillStyle = accent; x.beginPath(); x.arc(cx, cy, 112, 0, Math.PI * 2); x.fill();
  x.fillStyle = P.teal; x.fillRect(0, 330, W, H - 330);
  x.fillStyle = P.ink; x.fillRect(0, 324, W, 9);
  const bands = [P.dark, P.grey, P.ink, P.sand];
  for (let k = 0; k < 6; k++) {
    const y = 360 + k * 36, ph = r() * 6;
    x.fillStyle = bands[k % bands.length];
    x.beginPath();
    for (let px = 0; px <= W; px += 16) x.lineTo(px, y + Math.sin(px / 60 + ph) * 7);
    for (let px = W; px >= 0; px -= 16) x.lineTo(px, y + 9 + Math.sin(px / 60 + ph) * 7);
    x.fill();
  }
  for (let k = 0; k < 6; k++) {   // reflection: shorter, broken bars further down
    const w = 220 - k * 30, y = 344 + k * 36;
    x.fillStyle = accent;
    for (let s = -w / 2; s < w / 2; s += 46) x.fillRect(cx + s, y, Math.min(34, w / 2 - s), 10);
  }
  poly(x, P.ink, [[0, 430], [330, 404], [330, 436], [0, 470]]);
  figure(x, 230, 412, 0.75, P.ink);
};

// a pawn on a board in perspective, an arrow for the next move (contact)
LAYOUTS.chess = function (x, r, accent) {
  const P = PALETTE, vx = 512, vy = 150, top = 420;
  rays(x, 330, 300, 16, 0, Math.PI * 2, P.sand, P.cream);
  x.fillStyle = P.red; x.beginPath(); x.arc(330, 270, 168, 0, Math.PI * 2); x.fill();
  const rows = [top, 452, 496, 576];
  const colX = (i, y) => vx + i * 150 * (y - vy) / (H - vy);
  for (let j = 0; j < rows.length - 1; j++) {
    for (let i = -7; i < 7; i++) {
      const y0 = rows[j], y1 = rows[j + 1];
      poly(x, (i + j) % 2 ? P.ink : P.cream, [[colX(i, y0), y0], [colX(i + 1, y0), y0], [colX(i + 1, y1), y1], [colX(i, y1), y1]]);
    }
  }
  x.fillStyle = P.ink; x.fillRect(0, top - 6, W, 8);
  poly(x, P.dark, [[248, 456], [412, 456], [396, 424], [264, 424]]);
  poly(x, P.dark, [[282, 426], [378, 426], [350, 322], [310, 322]]);
  x.fillStyle = P.dark; x.fillRect(292, 306, 76, 20);
  x.beginPath(); x.arc(330, 264, 46, 0, Math.PI * 2); x.fill();
  x.save();
  x.translate(510, 372); x.rotate(-0.55);
  x.fillStyle = accent; x.fillRect(0, -16, 200, 32);
  poly(x, accent, [[196, -44], [262, 0], [196, 44]]);
  x.restore();
};

/** Draws the poster for asset `id` and returns the canvas. */
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
  if (spec.title) label(x, LABEL_AT[spec.layout] || LABEL_AT.halo, spec.title, spec.sub);
  return c;
}

/** Resolves once the poster fonts can be drawn on a canvas. */
let fontsPromise = null;
export function postersReady() {
  fontsPromise ||= Promise.all([
    document.fonts.load('104px "Bebas Neue"'),
    document.fonts.load('22px "Special Elite"'),
  ]).catch(() => {});
  return fontsPromise;
}

const urlCache = {};
/** Same poster as a data URL, for <img> tags on the simple page. */
export function placeholderURL(id, spec) {
  if (!urlCache[id]) urlCache[id] = placeholderCanvas(id, spec).toDataURL('image/jpeg', 0.86);
  return urlCache[id];
}
