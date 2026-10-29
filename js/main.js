/* ══════════════════════════════════════════════
   main.js — Spiral Archive page wiring
   Language, 3D/simple mode, floor captions, scroll
   cue and progress rail, side panels, nav, keyboard
   floor jumps, video facades, lightbox and toasts.
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
const is3D = () => root.classList.contains('mode-3d');
const L = (zh, en) => (root.dataset.lang === 'en' ? en : zh);

// ── Language ──
const TITLES = {
  zh: '董一均 Dong Yijun — 游戏设计与开发',
  en: 'Dong Yijun 董一均 — Game Designer & Engineer',
};
const DESCRIPTIONS = {
  zh: '董一均 Dong Yijun：游戏设计师与工程师，纽卡斯尔大学计算机游戏工程硕士（Distinction）。毕业设计《Until They Forget》、华为数字孪生实习、C++ 引擎系统课程项目与插画。',
  en: 'Dong Yijun, game designer and engineer, MSc Computer Game Engineering (Distinction), Newcastle University: Until They Forget, a serious game about cognitive bias; a Huawei digital-twin internship; C++ engine systems; illustration.',
};
function setLang(lang) {
  root.dataset.lang = lang;
  root.lang = lang === 'en' ? 'en' : 'zh-CN';
  document.title = TITLES[lang];
  $('meta[name="description"]').setAttribute('content', DESCRIPTIONS[lang]);
  store.set('lang', lang);
}
setLang(root.dataset.lang === 'en' ? 'en' : 'zh');
$('#langToggle').addEventListener('click', () => setLang(root.dataset.lang === 'en' ? 'zh' : 'en'));

// ── Toast ──
const toastEl = $('#toast');
let toastTimer = 0;
function toast(text, actions = []) {
  clearTimeout(toastTimer);
  toastEl.replaceChildren();
  const msg = document.createElement('span');
  msg.textContent = text;
  toastEl.append(msg);
  for (const a of actions) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = a.label;
    if (a.primary) b.className = 'primary';
    b.addEventListener('click', () => { hideToast(); a.run?.(); });
    toastEl.append(b);
  }
  toastEl.hidden = false;
  toastTimer = setTimeout(hideToast, actions.length ? 12000 : 3200);
}
function hideToast() { toastEl.hidden = true; }

// ── Placeholder posters for <img data-ph> (until the commissioned art lands) ──
const fontsReady = document.fonts.load('22px "Special Elite"').catch(() => {});
const assetURL = id => ASSETS[id].src || placeholderURL(id, ASSETS[id]);
fontsReady.finally(() => {
  for (const img of $$('img[data-ph]')) img.src = assetURL(img.dataset.ph);
});

// ── Mobile floor menu ──
const nav = $('#floorNav'), navToggle = $('#navToggle');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
function closeNav() { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }

// ── Floor progress rail (ticks built from the floor list) ──
const rail = $('#rail'), railFill = $('#railFill');
const railTicks = FLOORS.filter(f => f.id !== 'top').map(f => {
  const src = $(`.floor-nav a[data-floor-link="${f.id}"]`);
  const a = document.createElement('a');
  a.className = 'rail-tick';
  a.href = '#' + f.id;
  a.dataset.floorLink = f.id;
  a.style.setProperty('--at', floorCentre(f).toFixed(3));
  a.innerHTML = `<span class="rail-name">${$$('span', src).map(s => s.outerHTML).join('')}</span><b>${$('b', src).textContent}</b>`;
  rail.append(a);
  return { a, f };
});

function markNav(id) {
  for (const a of $$('.floor-nav a')) a.classList.toggle('is-active', a.dataset.floorLink === id);
}

// ══ 3D MODE ══
let scene = null, scenePromise = null, activeId = 'top', sceneReady = false;
const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
const floorAt = p => FLOORS.find(f => p >= f.range[0] && p < f.range[1]);
const currentProgress = () => (scene ? scene.progress : scrollY / maxScroll());

function setActive(id) {
  if (id === activeId) return;
  if (activeId && sections[activeId]) sections[activeId].classList.remove('is-active');
  activeId = id;
  if (id && sections[id]) sections[id].classList.add('is-active');
  markNav(id);
}

// scroll cue: shown on the top floor, louder if nobody scrolls for a few seconds
const cue = $('#scrollCue');
let nudgeTimer = 0, atTop = null;
function setAtTop(v) {
  if (v === atTop) return;
  atTop = v;
  root.classList.toggle('at-top', v);
  clearTimeout(nudgeTimer);
  cue.classList.remove('nudge');
  if (v) nudgeTimer = setTimeout(() => cue.classList.add('nudge'), 4500);
}

function onProgress(p) {
  const f = floorAt(p);
  setActive(f ? f.id : null);
  setAtTop(p < 0.025);
  railFill.style.transform = `scaleY(${p.toFixed(4)})`;
  for (const { a, f: tf } of railTicks) {
    a.classList.toggle('is-passed', p >= floorCentre(tf) - 0.01);
    a.classList.toggle('is-active', f === tf);
  }
}

function onScroll() {
  if (scene && is3D()) scene.setGoal(scrollY / maxScroll());
  root.classList.toggle('scrolled', scrollY > 700);
}
addEventListener('scroll', onScroll, { passive: true });

async function startScene() {
  if (!scenePromise) {
    scenePromise = import('./scene.js').then(({ createScene }) => {
      scene = createScene({
        canvas: $('#scene'),
        floors: FLOORS,
        mobile: isMobile,
        onProgress,
        onPick: ({ floor, index }) => openPosterLightbox(floor, index),
        onSlow: () => toast(
          L('这台设备跑 3D 有点吃力，要换成简洁模式吗？', 'This device is struggling with the 3D tower. Switch to the plain page?'),
          [{ label: L('切换', 'Switch'), primary: true, run: () => setMode('simple') }, { label: L('继续 3D', 'Keep 3D') }],
        ),
        onLost: () => {
          setMode('simple', { remember: false });
          toast(L('3D 渲染中断了，已切换到简洁模式。', 'The 3D view stopped, so the plain page is shown instead.'));
        },
      });
      if (location.search.includes('debug')) window.__archive = { scene, jump: p => { scrollTo(0, p * maxScroll()); scene.snap(p); } };
      return scene;
    });
  }
  try {
    await scenePromise;
  } catch (err) {
    console.error('[archive] 3D scene failed, falling back to the plain page', err);
    setMode('simple', { remember: false });
    return;
  }
  if (!is3D()) return;
  scene.snap(scrollY / maxScroll());
  sceneReady = true;
  syncRunning();
  requestAnimationFrame(() => root.classList.add('scene-ready'));
}

// render only while the tower is actually visible
function syncRunning() {
  if (!scene || !sceneReady) return;
  if (is3D() && !openId && lb.hidden) scene.start();
  else scene.stop();
}

function scrollToProgress(p, smooth = true) {
  scrollTo({ top: p * maxScroll(), behavior: smooth ? 'smooth' : 'auto' });
  if (!smooth && scene) scene.snap(scrollY / maxScroll());   // arrive without flying through every floor
}
// where a floor sits on the scroll track (the top floor is the very start)
const floorPos = f => (f.id === 'top' ? 0 : floorCentre(f));
function scrollToFloor3D(id, smooth = true) {
  const f = FLOORS.find(x => x.id === id);
  if (f) scrollToProgress(floorPos(f), smooth);
}
function stepFloor(dir) {
  const p = currentProgress();
  const list = dir > 0 ? FLOORS : [...FLOORS].reverse();
  const f = list.find(x => (dir > 0 ? floorPos(x) > p + 0.02 : floorPos(x) < p - 0.02));
  if (f) scrollToFloor3D(f.id);
}

// ══ SIMPLE MODE: highlight the floor being read ══
const readObserver = new IntersectionObserver(entries => {
  if (is3D()) return;
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
  const keep = is3D() ? (activeId || 'top') : currentFloorSimple();
  closePanel();
  root.classList.remove('mode-3d', 'mode-simple', 'scene-ready', 'at-top');
  atTop = null;
  root.classList.add('mode-' + mode);
  if (remember) store.set('mode', mode);
  if (mode === 'simple') {
    syncRunning();
    for (const s of Object.values(sections)) s.classList.remove('is-active');
    activeId = null;
    requestAnimationFrame(() => sections[keep]?.scrollIntoView({ block: 'start' }));
  } else {
    activeId = null;
    requestAnimationFrame(() => scrollToFloor3D(keep, false));
    await startScene();
  }
}
$$('[data-mode-toggle]').forEach(b => b.addEventListener('click', () => setMode(is3D() ? 'simple' : '3d')));
$$('[data-mode-set]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  setMode(a.dataset.modeSet);
}));

// ── Floor links (nav, hero buttons, rail) ──
$$('[data-floor-link]').forEach(a => a.addEventListener('click', e => {
  closeNav();
  if (!is3D()) return;   // plain page: normal anchor jump
  e.preventDefault();
  closePanel();
  scrollToFloor3D(a.dataset.floorLink);
  history.replaceState(null, '', a.dataset.floorLink === 'top' ? location.pathname + location.search : '#' + a.dataset.floorLink);
}));
$$('[data-next]').forEach(b => b.addEventListener('click', () => stepFloor(1)));
addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (is3D() && sections[id]) scrollToFloor3D(id);
});

// ══ SIDE PANELS (3D mode) ══
const scrim = $('#scrim');
let openId = null, opener = null;
function openPanel(id, trigger) {
  if (!is3D()) return;
  closePanel();
  openId = id; opener = trigger || null;
  sections[id].classList.add('is-open');
  trigger?.setAttribute('aria-expanded', 'true');
  scrim.hidden = false;
  root.style.overflow = 'hidden';
  const body = $('.floor-body', sections[id]);
  body.scrollTop = 0;
  body.focus({ preventScroll: true });
  syncRunning();
}
function closePanel() {
  if (!openId) return;
  sections[openId].classList.remove('is-open');
  scrim.hidden = true;
  root.style.overflow = '';
  openId = null;
  if (opener) { opener.setAttribute('aria-expanded', 'false'); opener.focus({ preventScroll: true }); opener = null; }
  syncRunning();
}
$$('[data-open]').forEach(b => {
  b.setAttribute('aria-expanded', 'false');
  b.setAttribute('aria-controls', b.dataset.open + '-body');
  b.addEventListener('click', () => openPanel(b.dataset.open, b));
});
$$('[data-close]').forEach(b => b.addEventListener('click', closePanel));
scrim.addEventListener('click', closePanel);

// ══ COPY EMAIL ══
$$('[data-copy-email]').forEach(b => b.addEventListener('click', () => {
  const addr = b.dataset.copyEmail;
  const ok = () => toast(L(`已复制邮箱：${addr}`, `Email copied: ${addr}`));
  const fail = () => toast(L(`复制失败，邮箱是 ${addr}`, `Could not copy. The address is ${addr}`));
  try { navigator.clipboard.writeText(addr).then(ok, fail); } catch (e) { fail(); }
}));

// ══ BACK TO TOP (plain page) ══
$('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

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
  const item = lbItems[lbIndex];
  lbImg.src = item.src;
  lbImg.alt = item.alt;
  lbCap.textContent = `${item.alt}  ·  ${lbIndex + 1} / ${lbItems.length}`;
}
function lbOpen(items, index, from) {
  lbItems = items;
  lbOpener = from || null;
  lbShow(index);
  lb.hidden = false;
  $('.lb-close', lb).focus();
  syncRunning();
}
function lbClose() {
  lb.hidden = true;
  lbImg.removeAttribute('src');
  lbOpener?.focus({ preventScroll: true });
  syncRunning();
}
document.addEventListener('click', e => {
  const img = e.target.closest('img[data-zoom]');
  if (!img) return;
  const group = $$('img[data-zoom]', img.closest('.floor-body') || document);
  lbOpen(group.map(g => ({ src: g.currentSrc || g.src, alt: g.alt })), group.indexOf(img), img);
});
// a poster clicked on the tower wall
const titleFromFile = src => src.split('/').pop().replace(/\.\w+$/, '').replace(/[-_]/g, ' ').toUpperCase();
function openPosterLightbox(floorId, index) {
  const f = FLOORS.find(x => x.id === floorId);
  const items = f.posters.map(p => p.asset
    ? { src: assetURL(p.asset), alt: L(`${p.asset} · 占位海报`, `${p.asset} · placeholder poster`) }
    : { src: p.src, alt: titleFromFile(p.src) });
  lbOpen(items, index);
}
$('.lb-close', lb).addEventListener('click', lbClose);
$('.lb-prev', lb).addEventListener('click', () => lbShow(lbIndex - 1));
$('.lb-next', lb).addEventListener('click', () => lbShow(lbIndex + 1));
lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });

// ══ KEYBOARD ══
// keep Tab inside whatever dialog is open
function trapFocus(e, box) {
  const items = $$('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])', box).filter(el => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === box)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
document.addEventListener('keydown', e => {
  if (!lb.hidden) {
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    if (e.key === 'Tab') trapFocus(e, lb);
    return;
  }
  if (openId) {
    if (e.key === 'Escape') closePanel();
    if (e.key === 'Tab') trapFocus(e, $('.floor-body', sections[openId]));
    return;
  }
  if (e.key === 'Escape') { closeNav(); return; }
  // in the tower one arrow press is a floor, not 40 pixels of a 760vh track
  if (!is3D() || e.altKey || e.ctrlKey || e.metaKey) return;
  const onPage = e.target === document.body || e.target === root;
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && onPage && !e.shiftKey)) { e.preventDefault(); stepFloor(1); }
  else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && onPage && e.shiftKey)) { e.preventDefault(); stepFloor(-1); }
  else if (e.key === 'Home') { e.preventDefault(); scrollToFloor3D('top'); }
  else if (e.key === 'End') { e.preventDefault(); scrollToFloor3D('about'); }
});

// ══ BOOT ══
onScroll();
if (is3D()) {
  sections.top.classList.add('is-active');
  activeId = 'top';
  const hash = location.hash.slice(1);
  startScene().then(() => { if (hash && sections[hash]) scrollToFloor3D(hash, false); });
}
