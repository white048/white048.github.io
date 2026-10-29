/* ══════════════════════════════════════════════
   main.js — Spiral Archive page wiring
   Language, 3D/simple mode, floor captions, side
   panels, nav, video facades and the lightbox.
   ══════════════════════════════════════════════ */
import { FLOORS, ASSETS, floorCentre } from './floors.js';
import { placeholderURL } from './placeholders.js';

const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
};
const isMobile = matchMedia('(max-width: 880px), (pointer: coarse)').matches;
const sections = Object.fromEntries($$('.floor').map(s => [s.dataset.floor, s]));

// ── Language ──
const TITLES = {
  zh: '董一均 Dong Yijun — 游戏设计与开发',
  en: 'Dong Yijun 董一均 — Game Designer & Engineer',
};
function setLang(lang) {
  root.dataset.lang = lang;
  root.lang = lang === 'en' ? 'en' : 'zh-CN';
  document.title = TITLES[lang];
  store.set('lang', lang);
}
setLang(root.dataset.lang === 'en' ? 'en' : 'zh');
$('#langToggle').addEventListener('click', () => setLang(root.dataset.lang === 'en' ? 'zh' : 'en'));

// ── Placeholder posters for <img data-ph> (until the commissioned art lands) ──
document.fonts.load('22px "Special Elite"').catch(() => {}).finally(() => {
  for (const img of $$('img[data-ph]')) {
    const asset = ASSETS[img.dataset.ph];
    img.src = asset.src || placeholderURL(img.dataset.ph, asset);
  }
});

// ── Mobile floor menu ──
const nav = $('#floorNav'), navToggle = $('#navToggle');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
function closeNav() { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }

function markNav(id) {
  for (const a of $$('.floor-nav a')) a.classList.toggle('is-active', a.dataset.floorLink === id);
}

// ══ 3D MODE ══
let scene = null, scenePromise = null, activeId = 'top';
const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
const floorAt = p => FLOORS.find(f => p >= f.range[0] && p < f.range[1]);

function setActive(id) {
  if (id === activeId) return;
  if (activeId && sections[activeId]) sections[activeId].classList.remove('is-active');
  activeId = id;
  if (id && sections[id]) sections[id].classList.add('is-active');
  markNav(id);
}

function onScroll() {
  if (scene && root.classList.contains('mode-3d')) scene.setGoal(scrollY / maxScroll());
}
addEventListener('scroll', onScroll, { passive: true });

async function startScene() {
  if (!scenePromise) {
    scenePromise = import('./scene.js').then(({ createScene }) => {
      scene = createScene({
        canvas: $('#scene'),
        floors: FLOORS,
        mobile: isMobile,
        onProgress: p => { const f = floorAt(p); setActive(f ? f.id : null); },
      });
      if (location.search.includes('debug')) window.__archive = { scene, jump: p => { scrollTo(0, p * maxScroll()); scene.snap(p); } };
      return scene;
    });
  }
  try {
    await scenePromise;
  } catch (err) {
    console.error('[archive] 3D scene failed, falling back to the plain page', err);
    setMode('simple');
    return;
  }
  scene.snap(scrollY / maxScroll());
  scene.start();
  requestAnimationFrame(() => root.classList.add('scene-ready'));
}

function scrollToFloor3D(id, smooth = true) {
  const f = FLOORS.find(x => x.id === id);
  if (!f) return;
  scrollTo({ top: floorCentre(f) * maxScroll(), behavior: smooth ? 'smooth' : 'auto' });
  if (!smooth && scene) scene.snap(scrollY / maxScroll());   // arrive without flying through every floor
}

// ══ SIMPLE MODE: highlight the floor being read ══
const readObserver = new IntersectionObserver(entries => {
  if (!root.classList.contains('mode-simple')) return;
  const seen = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
  if (seen) markNav(seen.target.dataset.floor);
}, { rootMargin: '-40% 0px -55% 0px' });
Object.values(sections).forEach(s => readObserver.observe(s));

// ══ MODE SWITCH ══
function currentFloorSimple() {
  const probe = innerHeight * 0.4;
  let best = 'top';
  for (const s of Object.values(sections)) if (s.getBoundingClientRect().top <= probe) best = s.dataset.floor;
  return best;
}
async function setMode(mode, { remember = true } = {}) {
  const from = root.classList.contains('mode-3d') ? '3d' : 'simple';
  const keep = from === '3d' ? (activeId || 'top') : currentFloorSimple();
  closePanel();
  root.classList.remove('mode-3d', 'mode-simple', 'scene-ready');
  root.classList.add('mode-' + mode);
  if (remember) store.set('mode', mode);
  if (mode === 'simple') {
    if (scene) scene.stop();
    for (const s of Object.values(sections)) s.classList.remove('is-active');
    activeId = null;
    requestAnimationFrame(() => sections[keep]?.scrollIntoView({ block: 'start' }));
  } else {
    activeId = null;
    requestAnimationFrame(() => scrollToFloor3D(keep, false));
    await startScene();
  }
}
$$('[data-mode-toggle]').forEach(b => b.addEventListener('click', () => {
  setMode(root.classList.contains('mode-3d') ? 'simple' : '3d');
}));
$$('[data-mode-set]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  setMode(a.dataset.modeSet);
}));

// ── Floor links (nav, hero buttons) ──
$$('[data-floor-link]').forEach(a => a.addEventListener('click', e => {
  closeNav();
  if (!root.classList.contains('mode-3d')) return;   // plain page: normal anchor jump
  e.preventDefault();
  closePanel();
  scrollToFloor3D(a.dataset.floorLink);
  history.replaceState(null, '', a.dataset.floorLink === 'top' ? location.pathname + location.search : '#' + a.dataset.floorLink);
}));

// ══ SIDE PANELS (3D mode) ══
const scrim = $('#scrim');
let openId = null, opener = null;
function openPanel(id, trigger) {
  if (!root.classList.contains('mode-3d')) return;
  closePanel();
  openId = id; opener = trigger || null;
  sections[id].classList.add('is-open');
  scrim.hidden = false;
  root.style.overflow = 'hidden';
  const body = $('.floor-body', sections[id]);
  body.scrollTop = 0;
  body.focus({ preventScroll: true });
}
function closePanel() {
  if (!openId) return;
  sections[openId].classList.remove('is-open');
  scrim.hidden = true;
  root.style.overflow = '';
  openId = null;
  if (opener) { opener.focus({ preventScroll: true }); opener = null; }
}
$$('[data-open]').forEach(b => b.addEventListener('click', () => openPanel(b.dataset.open, b)));
$$('[data-close]').forEach(b => b.addEventListener('click', closePanel));
scrim.addEventListener('click', closePanel);

// ══ VIDEO FACADES ══
$$('.yt').forEach(box => $('.yt-play', box).addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0`;
  f.title = 'YouTube video';
  f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  f.allowFullscreen = true;
  box.replaceChildren(f);
}));

// ══ LIGHTBOX ══
const lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('.lb-caption', lb);
let lbItems = [], lbIndex = 0, lbOpener = null;
function lbShow(i) {
  lbIndex = (i + lbItems.length) % lbItems.length;
  const img = lbItems[lbIndex];
  lbImg.src = img.currentSrc || img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = img.alt;
}
document.addEventListener('click', e => {
  const img = e.target.closest('img[data-zoom]');
  if (!img) return;
  lbItems = $$('img[data-zoom]', img.closest('.floor-body') || document);
  lbOpener = img;
  lbShow(lbItems.indexOf(img));
  lb.hidden = false;
  $('.lb-close', lb).focus();
});
function lbClose() { lb.hidden = true; lbImg.removeAttribute('src'); lbOpener?.focus({ preventScroll: true }); }
$('.lb-close', lb).addEventListener('click', lbClose);
$('.lb-prev', lb).addEventListener('click', () => lbShow(lbIndex - 1));
$('.lb-next', lb).addEventListener('click', () => lbShow(lbIndex + 1));
lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });

document.addEventListener('keydown', e => {
  if (!lb.hidden) {
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    return;
  }
  if (e.key === 'Escape') { closePanel(); closeNav(); }
});

// ══ BOOT ══
if (root.classList.contains('mode-3d')) {
  sections.top.classList.add('is-active');
  activeId = 'top';
  const hash = location.hash.slice(1);
  startScene().then(() => { if (hash && sections[hash]) scrollToFloor3D(hash, false); });
}
