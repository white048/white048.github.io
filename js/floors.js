/* ══════════════════════════════════════════════
   floors.js — what hangs on each floor of the tower
   Shared by the 3D scene and the simple page.
   ══════════════════════════════════════════════ */

// Commissioned art (see the asset brief). `src: null` = not delivered yet,
// so a poster is generated in code from `layout` + `title`. Drop the file
// into assets/posters/ and set `src` to switch.
export const ASSETS = {
  A02: { src: null, layout: 'circle', accent: 'teal', seed: 11, title: 'DIGITAL TWIN',        sub: 'HUAWEI · PREDICTIVE MAINTENANCE' },
  A03: { src: null, layout: 'halo',   accent: 'red',  seed: 23, title: 'SPECIAL DELIVERY',    sub: 'CSC8503 · PHYSICS · AI · NETCODE' },
  A04: { src: null, layout: 'waves',  accent: 'red',  seed: 31, title: 'LIGHT & WATER',       sub: 'CSC8502 · PBR · IBL · HDR' },
  A05: { src: null, layout: 'blocks', accent: 'red',  seed: 47, title: 'BUILT TOGETHER',      sub: 'CSC8507/08 · TEAM OF FOUR' },
  A06: { src: null, layout: 'split',  accent: 'red',  seed: 53, title: 'COOPERATE OR DEFECT', sub: "CSC8501 · PRISONER'S DILEMMA" },
  A08: { src: null, layout: 'chess',  accent: 'teal', seed: 67, title: 'YOUR MOVE',           sub: 'DONG YIJUN · GET IN TOUCH' },
  // not commissioned art: the door to the Token Forge game (clicking it on the wall opens the game)
  A09: { src: null, layout: 'forge',  accent: 'red',  seed: 73, title: 'TOKEN FORGE',         sub: 'A GAME · CLICK TO PLAY', href: 'games/token-forge/' },
};

/* Scroll progress p ∈ [0,1]:
   range — when the floor's caption is on screen
   stop  — camera climb position (u) the floor's wall is laid out around
   Posters: off = angle around the tower from the floor's centre line (rad),
            dy = height offset, w/h = size in world units.
            portrait = { off, dy, w?, h? } — own spot on portrait screens, which
            otherwise shrink the whole layout towards the view line (scene.js).
   plate  — the round floor-number sign on the wall (takes `portrait` too). */
export const FLOORS = [
  { id: 'top', range: [0, 0.07] },

  { id: 'utf', range: [0.15, 0.33], stop: 0.14, plate: { no: '01', label: 'FLAGSHIP', off: -0.82, dy: 1.75 }, posters: [
    { src: 'assets/utf/she-chose-life.webp',               w: 4.0, h: 2.25, off: 0 },
    { src: 'assets/utf/he-fought-for-grace.webp',          w: 3.3, h: 1.86, off: -0.82, dy: 0.15 },
    { src: 'assets/utf/a-mothers-grief.webp',              w: 3.3, h: 1.86, off: 0.82,  dy: 0.15 },
    { src: 'assets/utf/the-doctor-who-never-gave-up.webp', w: 2.9, h: 1.63, off: -1.58, dy: 0.3 },
    { src: 'assets/utf/a-fathers-broken-heart.webp',       w: 2.9, h: 1.63, off: 1.58,  dy: 0.3 },
    { src: 'assets/utf/martyred-by-the-system.webp',       w: 2.6, h: 1.46, off: 0,     dy: 2.55 },
  ] },

  { id: 'huawei', range: [0.39, 0.53], stop: 0.37, plate: { no: '02', label: 'INTERNSHIP', off: 0, dy: 2.35 }, posters: [
    { asset: 'A02',                                 w: 4.2, h: 2.36, off: 0 },
    { src: 'assets/huawei/w6-overview.webp', duotone: true, w: 3.0, h: 1.69, off: 0.92,  dy: 0.2 },
    { src: 'assets/huawei/model-iso.webp',   duotone: true, w: 2.7, h: 1.69, off: -0.92, dy: 0.2 },
  ] },

  { id: 'coursework', range: [0.59, 0.73], stop: 0.59, plate: { no: '03', label: 'COURSEWORK', off: 0, dy: 1.65 }, posters: [
    { asset: 'A03', w: 3.0, h: 1.69, off: -1.12, dy: 0.2 },
    { asset: 'A04', w: 3.0, h: 1.69, off: -0.37 },
    { asset: 'A05', w: 3.0, h: 1.69, off: 0.37 },
    { asset: 'A06', w: 3.0, h: 1.69, off: 1.12,  dy: 0.2 },
  ] },

  { id: 'art', range: [0.78, 0.87], stop: 0.8, plate: { no: '04', label: 'ART', off: 0, dy: 2.75 }, posters: [
    { src: 'images/illust_01.jpg', w: 1.55, h: 1.55, off: -1.08, dy: 1.15 },
    { src: 'images/illust_02.jpg', w: 2.2,  h: 1.55, off: -0.36, dy: 1.15 },
    { src: 'images/illust_03.jpg', w: 1.55, h: 1.55, off: 0.36,  dy: 1.15 },
    { src: 'images/illust_04.jpg', w: 1.55, h: 1.55, off: 1.08,  dy: 1.15 },
    { src: 'images/illust_05.jpg', w: 1.05, h: 1.58, off: -1.08, dy: -0.85 },
    { src: 'images/illust_06.jpg', w: 1.55, h: 1.55, off: -0.36, dy: -0.85 },
    { src: 'images/model_01.jpg',  w: 2.4,  h: 1.35, off: 0.36,  dy: -0.85 },
    { src: 'images/model_02.jpg',  w: 2.4,  h: 1.38, off: 1.08,  dy: -0.85 },
  ] },

  // seen from the very end of the climb, where the standing piece fills the middle of the view
  // and the handrail the lower right: pictures go above and beside its head (above it on a phone)
  { id: 'about', range: [0.92, 1.01], stop: 0.985, plate: { no: '05', label: 'CONTACT', off: -0.3, dy: 0.3, portrait: { off: -0.2, dy: 0.1 } }, posters: [
    { asset: 'A08', w: 3.0, h: 1.69, off: 0.1, dy: 4.6, portrait: { off: 0.97, dy: 5.6, w: 2.2, h: 1.24 } },
    { asset: 'A09', w: 2.8, h: 1.57, off: 1.45, dy: 4.1, portrait: { off: 0.36, dy: 5.2, w: 3.4, h: 1.91 } },
  ] },
];

// where nav links scroll to: the middle of a floor's caption range, or the very end for the last floor
export const floorCentre = f => (f.range[1] >= 1 ? 1 : (f.range[0] + f.range[1]) / 2);
