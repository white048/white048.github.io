/* ══════════════════════════════════════════════
   scene.js — the Spiral Archive
   A library tower climbed by scrolling. Everything is
   generated here: flat-shaded low poly + a three-band
   toon ramp + one paper post pass. No model files.
   ══════════════════════════════════════════════ */
import * as THREE from 'three';
import { ASSETS } from './floors.js';
import { placeholderCanvas, PALETTE as P } from './placeholders.js';

// ── Tower dimensions ──
const TURNS = 5, STEPS_PER_TURN = 30, RISE = 0.2;
const R_IN = 1.7, R_OUT = 4.4, R_BOOK = 4.75, R_WALL = 5.35;
const RISE_PER_TURN = STEPS_PER_TURN * RISE;
const H = TURNS * RISE_PER_TURN;
const STEP_ARC = (Math.PI * 2) / STEPS_PER_TURN;
const helixY = a => a / (Math.PI * 2) * RISE_PER_TURN;
const START_A = 0.6;
const climbAngle = u => START_A + u * (TURNS - 1.2) * Math.PI * 2;

// camera dwells around each floor's stop for this much climb (u) either side
const DWELL = 0.015;
const CLIMB_FROM = 0.12;   // progress where the climb starts (after the fall)

export function createScene({
  canvas, floors, mobile = false,
  onProgress = () => {},   // every frame, with the smoothed scroll progress
  onPick = () => {},       // a poster was clicked: ({ floor, index })
  onSlow = () => {},       // still struggling at the lowest quality
  onLost = () => {},       // WebGL context lost
}) {
  // seeded random so the layout is stable between visits
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = arr => arr[Math.floor(rand() * arr.length)];

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(P.ink);
  scene.fog = new THREE.Fog(P.ink, 9, 34);
  const camera = new THREE.PerspectiveCamera(82, 1, 0.05, 120);

  // three-band toon ramp → every surface reads as flat cut-paper facets
  const ramp = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 165, 165, 165, 255, 255, 255, 255, 255]), 3, 1);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...extra });
  const facet = g => { const n = g.toNonIndexed(); n.computeVertexNormals(); return n; };

  scene.add(new THREE.HemisphereLight(P.cream, P.dark, 1.35));
  const sun = new THREE.DirectionalLight(P.cream, 2.4);   // light falling from the oculus
  sun.position.set(1.5, 10, 2.5);
  scene.add(sun);
  const rim = new THREE.DirectionalLight('#d4917f', 0.9);
  rim.position.set(-4, -2, -3);
  scene.add(rim);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s1 = new THREE.Vector3(1, 1, 1);
  const Y = new THREE.Vector3(0, 1, 0);

  // ── Spiral steps (one instanced draw call) ──
  const stepCount = TURNS * STEPS_PER_TURN;
  const stepGeo = new THREE.BoxGeometry(R_OUT - R_IN, 0.14, 2 * Math.PI * ((R_IN + R_OUT) / 2) / STEPS_PER_TURN * 1.04);
  const steps = new THREE.InstancedMesh(stepGeo, toon('#ffffff'), stepCount);
  const stepColors = [P.red, P.cream, P.tan, P.cream, P.teal, P.cream, P.tan];
  for (let i = 0; i < stepCount; i++) {
    const a = i * STEP_ARC, rMid = (R_IN + R_OUT) / 2;
    v.set(Math.cos(a) * rMid, helixY(a), Math.sin(a) * rMid);
    q.setFromAxisAngle(Y, -a);
    steps.setMatrixAt(i, m4.compose(v, q, s1));
    steps.setColorAt(i, new THREE.Color(stepColors[i % stepColors.length]));
  }
  scene.add(steps);

  // ── Soffit: the striped helicoid underside you see looking up ──
  {
    const seg = stepCount * 2, pos = [], col = [];
    const colors = [P.dark, P.teal, P.dark, P.red, P.dark, '#5b4a3f'];
    const p = (r, a) => [Math.cos(a) * r, helixY(a) - 0.32, Math.sin(a) * r];
    for (let i = 0; i < seg; i++) {
      const a0 = i / seg * TURNS * Math.PI * 2, a1 = (i + 1) / seg * TURNS * Math.PI * 2;
      pos.push(...p(R_IN, a0), ...p(R_OUT, a0), ...p(R_OUT, a1), ...p(R_IN, a0), ...p(R_OUT, a1), ...p(R_IN, a1));
      const c = new THREE.Color(colors[Math.floor(i / 2) % colors.length]);
      for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, toon('#ffffff', { side: THREE.DoubleSide, vertexColors: true })));
  }

  // ── Red stringer + handrail, dark outer stringer ──
  class Helix extends THREE.Curve {
    constructor(r, dy) { super(); this.r = r; this.dy = dy; }
    getPoint(t, out = new THREE.Vector3()) {
      const a = t * TURNS * Math.PI * 2;
      return out.set(Math.cos(a) * this.r, helixY(a) + this.dy, Math.sin(a) * this.r);
    }
  }
  const tube = (r, dy, thick, color) =>
    scene.add(new THREE.Mesh(facet(new THREE.TubeGeometry(new Helix(r, dy), TURNS * 60, thick, 5, false)), toon(color)));
  tube(R_IN - 0.05, -0.18, 0.16, P.red);
  tube(R_IN - 0.05, 1.05, 0.06, P.red);
  tube(R_OUT + 0.02, -0.2, 0.1, P.ink);

  const bal = new THREE.InstancedMesh(new THREE.BoxGeometry(0.035, 1.2, 0.035), toon(P.ink), stepCount);
  for (let i = 0; i < stepCount; i++) {
    const a = i * STEP_ARC;
    v.set(Math.cos(a) * (R_IN - 0.05), helixY(a) + 0.5, Math.sin(a) * (R_IN - 0.05));
    bal.setMatrixAt(i, m4.compose(v, q.identity(), s1));
  }
  scene.add(bal);

  // ── Outer wall (faceted, low segment count on purpose) ──
  scene.add(new THREE.Mesh(facet(new THREE.CylinderGeometry(R_WALL, R_WALL, H + 14, 22, 1, true)),
    toon(P.tan, { side: THREE.BackSide })));

  // ── Camera poses ──
  const mouse = new THREE.Vector2(), mouseS = new THREE.Vector2();
  const onPointer = e => mouse.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
  addEventListener('pointermove', onPointer);
  function heroPose(spin, pos, tgt, up) {
    pos.set(1.5, 0.25, 0.3);
    tgt.set(mouseS.x * 1.6, H * 0.8, mouseS.y * 1.6);
    up.set(Math.sin(spin), 0, -Math.cos(spin));   // "up" = forward when tilting the head back
  }
  function climbPose(u, pos, tgt, up) {
    const a = climbAngle(u), r = 3.05;
    pos.set(Math.cos(a) * r, helixY(a) + 1.55, Math.sin(a) * r);
    const b = a + 0.95, rt = 3.6;
    tgt.set(Math.cos(b) * rt, helixY(a) + 3.3, Math.sin(b) * rt);
    up.set(0, 1, 0);
  }
  // where the camera's view ray at climb position u meets the wall
  function wallHit(u) {
    const pos = new THREE.Vector3(), tgt = new THREE.Vector3();
    climbPose(u, pos, tgt, new THREE.Vector3());
    const C = new THREE.Vector2(pos.x, pos.z), D = new THREE.Vector2(tgt.x - pos.x, tgt.z - pos.z);
    const run = D.length(); D.normalize();
    const R = R_BOOK - 0.15, cd = C.dot(D);
    const t = -cd + Math.sqrt(cd * cd - (C.lengthSq() - R * R));
    const hit = C.clone().addScaledVector(D, t);
    return { a: Math.atan2(hit.y, hit.x) + 0.1, y: pos.y + t * (tgt.y - pos.y) / run };
  }

  // scroll progress → climb position, slowing to a dwell at each floor
  const pts = [[CLIMB_FROM, 0]];
  floors.filter(f => f.stop != null).forEach(f => {
    pts.push([f.range[0], f.stop - DWELL], [Math.min(f.range[1], 1), Math.min(1, f.stop + DWELL)]);
  });
  if (pts[pts.length - 1][0] < 1) pts.push([1, pts[pts.length - 1][1]]);
  function progToClimb(p) {
    if (p <= pts[0][0]) return 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [p0, u0] = pts[i], [p1, u1] = pts[i + 1];
      if (p <= p1) {
        let t = (p - p0) / (p1 - p0);
        if (i % 2 === 0) t = t * t * (3 - 2 * t);   // travel segments ease, dwell segments are linear
        return u0 + (u1 - u0) * t;
      }
    }
    return pts[pts.length - 1][1];
  }

  // ── Posters / frames on the wall ──
  const posterRects = [];   // keeps books out of the way
  const texLoader = new THREE.TextureLoader();
  const frameMat = toon(P.ink);
  const blankMat = new THREE.MeshBasicMaterial({ color: P.sand });
  const loaders = {};       // floor id → () => void, loads that floor's textures once
  const duotoneMat = map => new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, ink: { value: new THREE.Color(P.ink) }, paper: { value: new THREE.Color(P.cream) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform sampler2D map; uniform vec3 ink, paper; varying vec2 vUv;
      void main(){ float l = dot(texture2D(map, vUv).rgb, vec3(.299,.587,.114));
        gl_FragColor = vec4(mix(ink, paper, smoothstep(.0, .55, pow(l, .7))), 1.); }`,
  });
  function addPoster(a, y, w, h) {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.08), frameMat);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h), blankMat);
    pic.position.z = 0.05;
    g.add(frame, pic);
    const r = R_BOOK - 0.15;
    g.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    g.lookAt(0, y, 0);
    scene.add(g);
    posterRects.push({ a, y, half: Math.asin(Math.min(1, (w / 2 + 0.25) / r)), hh: h / 2 + 0.3 });
    return pic;
  }
  // round floor-number sign, drawn once the display font is ready
  function plateTexture(no, label) {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = P.cream; x.beginPath(); x.arc(256, 256, 250, 0, Math.PI * 2); x.fill();
    x.fillStyle = P.red; x.beginPath(); x.arc(256, 256, 222, 0, Math.PI * 2); x.fill();
    x.fillStyle = P.ink; x.fillRect(40, 330, 432, 70);
    x.fillStyle = P.cream; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.font = '250px "Bebas Neue", "Arial Narrow", sans-serif';
    x.fillText(no, 256, 318);
    x.font = '48px "Special Elite", "Courier New", monospace';
    x.fillText(label, 256, 380);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const pickables = [];
  for (const f of floors) {
    if (!f.posters) continue;
    const base = wallHit(f.stop);
    const pics = f.posters.map((p, index) => {
      const mesh = addPoster(base.a + (p.off || 0), base.y + (p.dy || 0), p.w, p.h);
      mesh.userData = { floor: f.id, index };
      pickables.push(mesh);
      return { p, mesh };
    });
    let plate = null;
    if (f.plate) {
      const a = base.a + f.plate.off, y = base.y + f.plate.dy, r = R_BOOK - 0.12;
      plate = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
      plate.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      plate.lookAt(0, y, 0);
      scene.add(plate);
      posterRects.push({ a, y, half: Math.asin(0.85 / r), hh: 0.85 });
    }
    let loaded = false;
    loaders[f.id] = () => {
      if (loaded) return;
      loaded = true;
      if (plate) {
        document.fonts.load('250px "Bebas Neue"').catch(() => {}).finally(() => {
          plate.material = new THREE.MeshBasicMaterial({ map: plateTexture(f.plate.no, f.plate.label), transparent: true, alphaTest: 0.5 });
        });
      }
      for (const { p, mesh } of pics) {
        const asset = p.asset ? ASSETS[p.asset] : null;
        const src = asset ? asset.src : p.src;
        const apply = tex => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          mesh.material = p.duotone ? duotoneMat(tex) : new THREE.MeshBasicMaterial({ map: tex });
        };
        if (src) texLoader.load(src, apply);
        else apply(new THREE.CanvasTexture(placeholderCanvas(p.asset, asset)));
      }
    };
  }

  // ── Books (one instanced draw call) ──
  seed = 42;
  const bookPalette = [P.ink, P.ink, P.red, P.red, P.teal, P.tan, P.cream, '#d4917f', P.grey, P.dark];
  const bookData = [];
  const ROW = 0.62;
  const shelfRows = Math.ceil((H + 6) / ROW);
  for (let row = 0; row < shelfRows; row++) {
    const y0 = row * ROW - 2;
    let a = 0, runLeft = 0, runCol = P.ink;
    while (a < Math.PI * 2) {
      if (runLeft-- <= 0) { runLeft = 4 + Math.floor(rand() * 14); runCol = pick(bookPalette); }
      const w = 0.09 + rand() * 0.14, h = 0.3 + rand() * 0.22, d = 0.38 + rand() * 0.12;
      const da = w / R_WALL, ac = a + da / 2, yc = y0 + h / 2;
      const blocked = posterRects.some(p => {
        const diff = Math.abs(((ac - p.a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
        return diff < p.half && Math.abs(yc - p.y) < p.hh;
      });
      if (!blocked && rand() > 0.04 && !(mobile && rand() < 0.25)) {
        bookData.push({ a: ac, y: yc, w, h, d, col: rand() < 0.85 ? runCol : pick(bookPalette), lean: rand() < 0.05 ? (rand() - 0.5) * 0.5 : 0 });
      }
      a += da + 0.003;
    }
  }
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon('#ffffff'), bookData.length);
  bookData.forEach((b, i) => {
    const r = R_WALL - b.d / 2 - 0.02;
    v.set(Math.cos(b.a) * r, b.y, Math.sin(b.a) * r);
    q.setFromEuler(new THREE.Euler(0, -b.a, b.lean, 'YXZ'));
    books.setMatrixAt(i, m4.compose(v, q, new THREE.Vector3(b.d, b.h, b.w)));
    books.setColorAt(i, new THREE.Color(b.col));
  });
  scene.add(books);

  // shelf boards (square-section rings), instanced
  const shelves = new THREE.InstancedMesh(facet(new THREE.TorusGeometry(R_WALL - 0.24, 0.035, 4, 44)), toon(P.dark), shelfRows);
  for (let row = 0; row < shelfRows; row++) {
    q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    shelves.setMatrixAt(row, m4.compose(v.set(0, row * ROW - 2, 0), q, s1));
  }
  scene.add(shelves);

  // ── Oculus: the light you climb towards ──
  const oculus = new THREE.Mesh(new THREE.CircleGeometry(R_WALL, 22), new THREE.MeshBasicMaterial({ color: P.cream, fog: false }));
  oculus.rotation.x = Math.PI / 2; oculus.position.y = H + 6;
  scene.add(oculus);
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.4, 2.0, 22), new THREE.MeshBasicMaterial({ color: P.red, fog: false, side: THREE.DoubleSide }));
  halo.rotation.x = Math.PI / 2; halo.position.y = H + 5.9;
  scene.add(halo);

  // ── Chessboard floor ──
  {
    const c = document.createElement('canvas'); c.width = c.height = 2;
    const x = c.getContext('2d');
    x.fillStyle = P.cream; x.fillRect(0, 0, 2, 2); x.fillStyle = P.dark; x.fillRect(0, 0, 1, 1); x.fillRect(1, 1, 1, 1);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 7);
    t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(R_WALL, 22), toon('#ffffff', { map: t }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.02;
    scene.add(floor);
  }

  // ── Wooden chess-head piece (placeholder head until the A01 turnaround arrives) ──
  function woodTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512;
    const x = c.getContext('2d');
    seed = 5;
    x.fillStyle = '#c9a074'; x.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 7; i++) { x.fillStyle = pick(['#b98d62', '#d4b088', '#a87c55']); x.fillRect(rand() * 256, 0, 14 + rand() * 40, 512); }
    x.strokeStyle = '#7d5a3e'; x.lineWidth = 2;
    for (let i = 0; i < 26; i++) {
      const x0 = rand() * 256, amp = 3 + rand() * 9, ph = rand() * 6, f = 0.01 + rand() * 0.02;
      x.globalAlpha = 0.3 + rand() * 0.4;
      x.beginPath();
      for (let yy = 0; yy <= 512; yy += 8) x.lineTo(x0 + Math.sin(yy * f + ph) * amp, yy);
      x.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping;
    return t;
  }
  const wood = woodTexture();
  const woodMat = toon('#ffffff', { map: wood });
  const PIECE_S = 1.25, NECK_TOP = 1.45;
  const profile = [[0, 0], [0.62, 0], [0.63, 0.07], [0.56, 0.12], [0.6, 0.2], [0.47, 0.28], [0.36, 0.42], [0.29, 0.7], [0.24, 1.05],
    [0.38, 1.12], [0.42, 1.18], [0.31, 1.24], [0.2, 1.3], [0.17, NECK_TOP], [0, NECK_TOP]].map(([r, y]) => new THREE.Vector2(r, y));
  const bodyGeo = facet(new THREE.LatheGeometry(profile, 16));
  // carved head: a sphere pushed into a flat face plane with a nose wedge,
  // eye sockets, brow, mouth groove, chin and a narrowing jaw (front = +z)
  function sculptHead() {
    const R = 0.55, g = new THREE.IcosahedronGeometry(R, 3);
    const pos = g.attributes.position, p = new THREE.Vector3();
    const lerp = THREE.MathUtils.lerp;
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).divideScalar(R);
      let x = p.x * 0.8, y = p.y * 1.12, z = p.z * 0.95;
      const nx = Math.abs(x);
      if (z > 0) {
        z = Math.min(z, 0.7 + 0.1 * (1 - nx / 0.8));   // flatten into a face plane
        if (nx < 0.13 && y > -0.3 && y < 0.2) {         // nose: bridge to tip
          const out = y > -0.2 ? lerp(0.26, 0.05, (y + 0.2) / 0.4) : lerp(0.26, 0, (-0.2 - y) / 0.1);
          z += out * (1 - nx / 0.13);
        }
        const eye = Math.hypot(nx - 0.27, y - 0.1);
        if (eye < 0.14) z -= 0.07 * (1 - eye / 0.14);     // eye sockets
        if (y > 0.2 && y < 0.32 && nx < 0.45) z += 0.04;  // brow
        if (Math.abs(y + 0.4) < 0.035 && nx < 0.2) z -= 0.04;   // mouth
        if (y < -0.48 && nx < 0.3) z += 0.07 * (1 - nx / 0.3);  // chin
      } else {
        z *= 1.08;   // fuller back of the skull
      }
      if (y < -0.3) x *= 1 - (-y - 0.3) * 0.5;   // jaw narrows towards the chin
      pos.setXYZ(i, x * R, y * R, z * R);
    }
    return g;
  }
  const headFacets = facet(sculptHead());
  {
    // cubist split face, painted rather than grained so the face plane can be the lightest tone:
    // facets facing forward pale, sides mid wood, back of the skull dark
    const n = headFacets.attributes.normal, cols = [];
    const pale = new THREE.Color('#ecd2a8'), mid = new THREE.Color('#c49a6c'), dark = new THREE.Color('#8f6a4a');
    for (let i = 0; i < n.count; i++) {
      const z = n.getZ(i), c = z > 0.55 ? pale : z < -0.3 ? dark : mid;
      cols.push(c.r, c.g, c.b);
    }
    headFacets.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  }
  const headMat = toon('#ffffff', { vertexColors: true });
  const hairGeo = new THREE.IcosahedronGeometry(0.58, 0); hairGeo.scale(1.0, 0.68, 1.02);
  const hairFacets = facet(hairGeo), hairMat = toon('#6e4f36', { map: wood });
  function makePiece(headRot) {
    const head = new THREE.Mesh(headFacets, headMat);
    head.position.y = NECK_TOP + 0.5;
    head.rotation.copy(headRot);
    const hair = new THREE.Mesh(hairFacets, hairMat);
    hair.position.set(0, 0.36, -0.22); hair.rotation.set(0.5, 0.3, -0.15);   // swept back, clear of the brow
    head.add(hair);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(bodyGeo, woodMat), head);
    g.scale.setScalar(PIECE_S);
    return g;
  }

  // hung upside down from a cord tied to the base; the head is carved tilted back,
  // so hanging it gazes down the stairwell at the visitor
  const HANG_ATTACH = 8.2, HANG_S = 1.35, CENTER = 1.2 * PIECE_S * HANG_S;
  const hanging = makePiece(new THREE.Euler(-1.2, 0.2, 0));
  hanging.rotation.x = Math.PI;
  hanging.scale.multiplyScalar(HANG_S);
  hanging.position.y = CENTER;   // spin around the piece's middle, not its base
  const spinner = new THREE.Group(); spinner.add(hanging);
  const hang = new THREE.Group(); hang.add(spinner);
  scene.add(hang);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 5), toon(P.red));
  scene.add(cord);
  function setCord(bottom) {
    const top = H + 6;
    cord.scale.y = top - bottom;
    cord.position.y = (top + bottom) / 2;
  }
  // scroll-scrubbed (not simulated) so scrolling back hangs the piece up again
  function animatePiece(k, t) {
    const g = k * k;   // gravity: slow start, fast finish
    hang.position.set(-1.9 * g, HANG_ATTACH - CENTER - (HANG_ATTACH - CENTER - 0.7) * g, 1.1 * g);
    spinner.rotation.set(g * 0.9, t * 0.22 * (1 - k), Math.sin(t * 0.9) * 0.035 * (1 - k) + g * 2.3);
    const snap = THREE.MathUtils.smoothstep(k, 0, 0.35);   // the cut cord springs back up
    setCord(HANG_ATTACH + snap * 4.5 + Math.sin(k * 30) * 0.15 * snap * (1 - snap));
    hang.visible = k < 0.999;
  }

  // easter egg: the piece that fell stands again at the top, by the contact floor
  const topPiece = makePiece(new THREE.Euler(0.32, 0.22, 0.03));   // chin down, looking at the visitor below
  scene.add(topPiece);
  const topHalo = new THREE.Group();
  topHalo.add(new THREE.Mesh(new THREE.CircleGeometry(1.0, 22), new THREE.MeshBasicMaterial({ color: P.cream, fog: false })),
    new THREE.Mesh(new THREE.RingGeometry(1.0, 1.14, 22), new THREE.MeshBasicMaterial({ color: P.red, fog: false })));
  scene.add(topHalo);
  {
    const end = new THREE.Vector3(), endT = new THREE.Vector3();
    climbPose(1, end, endT, new THREE.Vector3());
    const i = Math.round((climbAngle(1) + 0.8) / STEP_ARC), a = i * STEP_ARC;
    topPiece.position.set(Math.cos(a) * 3.0, helixY(a) + 0.07, Math.sin(a) * 3.0);
    topPiece.lookAt(end.x, topPiece.position.y, end.z);
    const head = topPiece.position.clone().setY(topPiece.position.y + (NECK_TOP + 0.5) * PIECE_S);
    topHalo.position.copy(head).addScaledVector(head.clone().sub(end).normalize(), 1.6);
    topHalo.lookAt(end);
  }

  // ── Floating paper sheets in the stairwell (the CV pages) ──
  const papers = [];
  // typewritten sheet: header bar, a few lines of "text", a red stamp
  const paperTex = (() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 176;
    const x = c.getContext('2d');
    seed = 314;
    x.fillStyle = P.cream; x.fillRect(0, 0, 128, 176);
    x.fillStyle = P.ink; x.fillRect(12, 14, 70, 10);
    x.fillStyle = P.red; x.fillRect(96, 12, 20, 20);
    x.fillStyle = P.grey;
    for (let i = 0; i < 9; i++) x.fillRect(12, 42 + i * 13, 50 + rand() * 54, 4);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const paperMat = toon('#ffffff', { side: THREE.DoubleSide, map: paperTex });
  const paperGeo = new THREE.PlaneGeometry(0.26, 0.36);
  seed = 99;
  for (let i = 0; i < (mobile ? 40 : 70); i++) {
    const m = new THREE.Mesh(paperGeo, paperMat);
    const r = 0.55 + rand() * (R_IN - 0.95), a = rand() * Math.PI * 2;
    m.position.set(Math.cos(a) * r, 10 + rand() * (H - 8), Math.sin(a) * r);
    m.rotation.set(rand() * 6, rand() * 6, rand() * 6);
    m.userData = { sp: 0.15 + rand() * 0.35, rs: (rand() - 0.5) * 0.8 };
    scene.add(m); papers.push(m);
  }

  // ── Post: linear → sRGB, gouache mottling, paper fibre, cut-paper edges, grain ──
  const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
  const post = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: target.texture }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2() } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
      vec3 toSRGB(vec3 c){ c = clamp(c, 0., 1.); return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
      vec3 tex(vec2 uv){ return toSRGB(texture2D(tDiffuse, uv).rgb); }
      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
      float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= .5; } return v; }
      float lum(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
      void main(){
        vec2 px = vUv * uRes;
        vec2 wob = (vec2(fbm(px / 38.), fbm(px / 38. + 7.3)) - .5) * 2.4 / uRes;   // hand-cut wobble
        vec3 c = tex(vUv + wob);
        vec2 o = 1.2 / uRes;
        float gx = lum(tex(vUv + vec2(o.x, 0.))) - lum(tex(vUv - vec2(o.x, 0.)));
        float gy = lum(tex(vUv + vec2(0., o.y))) - lum(tex(vUv - vec2(0., o.y)));
        c *= 1. - smoothstep(.06, .35, length(vec2(gx, gy))) * .32;               // cut-paper edges
        c *= .86 + .24 * fbm(px / 210.);                                            // gouache mottling
        c *= .95 + .07 * fbm(px * vec2(.9, .14) / 5.);                              // paper fibres
        vec3 ink = vec3(.114, .098, .086), paper = vec3(.93, .87, .77);
        c = ink + clamp(c, 0., 1.) * (paper - ink) * 1.06;                          // print tone
        c += (hash(px + fract(uTime) * 91.) - .5) * .035;                           // grain
        c *= mix(.62, 1., smoothstep(1.05, .3, length((vUv - .5) * vec2(1.1, 1.))));
        gl_FragColor = vec4(c, 1.);
      }`,
    depthTest: false, depthWrite: false,
  });
  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    target.setSize(Math.floor(w * dpr), Math.floor(h * dpr));
    camera.aspect = w / h;
    camera.fov = w < h ? 95 : 82;
    camera.updateProjectionMatrix();
    post.uniforms.uRes.value.set(w * dpr, h * dpr);
  }
  addEventListener('resize', resize);
  resize();

  // ── Picking: posters are clickable once the climb has started ──
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(), pointerPx = new THREE.Vector2();
  let hovered = null, mouseSeen = false, climbing = false, pickTick = 0;
  function pickAt(clientX, clientY) {
    if (!climbing) return null;
    ndc.set(clientX / innerWidth * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    return hit && hit.distance < 16 ? hit.object : null;
  }
  const onCanvasMove = e => { if (e.pointerType === 'mouse') { pointerPx.set(e.clientX, e.clientY); mouseSeen = true; } };
  const onCanvasLeave = () => { mouseSeen = false; };
  const onCanvasClick = e => {
    const hit = pickAt(e.clientX, e.clientY);
    if (hit) onPick({ ...hit.userData });
  };
  canvas.addEventListener('pointermove', onCanvasMove);
  canvas.addEventListener('pointerleave', onCanvasLeave);
  canvas.addEventListener('click', onCanvasClick);
  function updateHover() {
    // the camera keeps moving under a still mouse, so re-pick every few frames
    let next = null;
    if (climbing && mouseSeen && (pickTick++ % 3 === 0)) next = pickAt(pointerPx.x, pointerPx.y);
    else if (climbing && mouseSeen) next = hovered;
    if (next !== hovered) { hovered = next; canvas.style.cursor = next ? 'pointer' : ''; }
    for (const m of pickables) {
      const g = m.parent, s = m === hovered ? 1.04 : 1;
      if (Math.abs(g.scale.x - s) > 0.001) g.scale.setScalar(g.scale.x + (s - g.scale.x) * 0.2);
    }
  }

  // ── Context loss: hand over to the plain page ──
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); running = false; cancelAnimationFrame(raf); onLost(); });

  // ── Adaptive quality: drop resolution, then MSAA, before giving up ──
  const QUALITY = [dpr, Math.min(dpr, 1), 0.75];
  let level = 0, samples = [], slowReported = false;
  function measure(dtMs) {
    if (dtMs > 250) return;   // tab switch or a hitch, not a real frame
    samples.push(dtMs);
    if (samples.length < 90) return;
    const sorted = samples.slice(20).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    samples = [];
    const budget = [24, 30, 34][level];
    if (median <= budget) return;
    if (level < QUALITY.length - 1) {
      level++;
      renderer.setPixelRatio(QUALITY[level]);
      if (target.samples) { target.samples = 0; target.dispose(); }
      resize();
    } else if (!slowReported) {
      slowReported = true;
      onSlow();
    }
  }

  // ── Frame loop ──
  const hp = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const cp = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3(), tmpU = new THREE.Vector3();
  let goal = 0, prog = 0, running = false, raf = 0, first = true, time = 0, last = 0;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dtMs = now - last;
    last = now;
    time += Math.min(dtMs / 1000, 0.1);
    const t = time;
    if (!first) measure(dtMs);
    prog = first ? goal : prog + (goal - prog) * 0.08;
    first = false;

    const fall = THREE.MathUtils.smoothstep(prog, 0, 0.075);
    const blend = THREE.MathUtils.smoothstep(prog, 0.07, 0.15);
    mouseS.lerp(mouse, 0.05);
    animatePiece(fall, t);
    heroPose(fall * 0.5, ...hp);
    climbPose(progToClimb(prog), ...cp);
    tmpP.lerpVectors(hp[0], cp[0], blend);
    tmpT.lerpVectors(hp[1], cp[1], blend);
    tmpU.lerpVectors(hp[2], cp[2], blend).normalize();
    camera.position.copy(tmpP);
    camera.up.copy(tmpU);
    camera.lookAt(tmpT);
    climbing = blend > 0.95;
    updateHover();

    for (const p of papers) {
      p.position.y += p.userData.sp * 0.006;
      if (p.position.y > H + 2) p.position.y = 10;
      p.rotation.y += p.userData.rs * 0.01;
      p.rotation.x += p.userData.rs * 0.006;
    }
    // load a floor's pictures a little before its caption comes up
    for (const f of floors) if (loaders[f.id] && prog > f.range[0] - 0.14) loaders[f.id]();

    post.uniforms.uTime.value = t;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
    onProgress(prog);
  }

  // load everything else in the background once the first frames are out
  setTimeout(() => {
    const queue = floors.filter(f => loaders[f.id]);
    const next = () => { const f = queue.shift(); if (!f) return; loaders[f.id](); setTimeout(next, 400); };
    next();
  }, 1200);

  return {
    setGoal(p) { goal = Math.max(0, Math.min(1, p)); },
    snap(p) { goal = prog = Math.max(0, Math.min(1, p)); },
    get progress() { return prog; },
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      samples = [];
      raf = requestAnimationFrame(frame);
    },
    stop() { running = false; cancelAnimationFrame(raf); },
    get quality() { return level; },
    dispose() {
      this.stop();
      removeEventListener('resize', resize);
      removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('pointermove', onCanvasMove);
      canvas.removeEventListener('pointerleave', onCanvasLeave);
      canvas.removeEventListener('click', onCanvasClick);
      renderer.dispose();
    },
  };
}
