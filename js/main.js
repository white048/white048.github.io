/* ══════════════════════════════════════════════
   main.js — Game Dev Portfolio
   ══════════════════════════════════════════════ */

// ── Translations ──
let docLoaded = false;
const translations = {
  en: {
    'nav.about':   'About',
    'nav.skills':  'Skills',
    'nav.works':   'Works',
    'nav.art':     'Art',
    'nav.docs':    'Docs',
    'nav.contact': 'Contact',

    'hero.eyebrow': "Hello, I'm",
    'hero.role':    'Game Designer & Developer — System Design · C++ Programming',
    'hero.cta':     'View Works',
    'hero.contact': 'Get in Touch',

    'about.title':    'About Me',
    'about.bio':      "MSc Computer Game Engineering student at Newcastle University, graduating September 2026. I combine game system design thinking with hands-on C++ programming ability. I've independently built 3D game prototypes with physics interaction, AI behavior systems, and networked multiplayer, as well as real-time PBR/IBL rendering pipelines. I also draw anime-style illustrations in Photoshop and do beginner-level 3D modeling in Blender.",
    'about.location': 'Newcastle & Chengdu',

    'skills.title':   'Skills',
    'skills.gamedev': 'Game Development',
    'skills.engine':  'Engine Systems',
    'skills.arch':    'Architecture & Tools',

    'sk.cpp':     'Primary language — all coursework projects built solo',
    'sk.unity':   'Used in undergraduate thesis, familiar with core workflow',
    'sk.physics': 'Broad/Narrow Phase Collision Detection, Jolt Physics',
    'sk.ai':      'FSM, Behavior Tree, A* Pathfinding',
    'sk.net':     'Server-authoritative sync, Snapshot interpolation (ENet/UDP)',
    'sk.gfx':     'PBR (Cook-Torrance), IBL, HDR, Water Rendering, Post-processing',
    'sk.ecs':     'Data-driven entity architecture, engine–logic decoupling',
    'sk.ps':      'Anime-style illustration',
    'sk.blender': '3D modeling, beginner level',

    'works.title': 'Works',
    'role.solo':   'Solo Developer',
    'role.arch':   'Architecture & Programming',
    'team.size':   '4 Members',

    'p1.type':  '3D Action Game',
    'p1.title': 'Real-time Game Prototype',
    'p2.type':  '3D Rendering Pipeline',
    'p2.title': 'Real-time Graphics Rendering',
    'p3.type':  'Team Game Project',
    'p3.title': 'Team Game Development',
    'p4.type':  'Game Theory Simulation',
    'p4.title': "Iterated Prisoner's Dilemma Simulator",

    'p1.desc': "A 3D game prototype built with C++/NCL framework featuring package collection gameplay, ray-cast + spring-constraint object interaction, FSM/Behavior Tree/A* enemy AI, and server-authoritative multiplayer with 20Hz snapshot broadcasting and client-side interpolation via ENet/UDP.",
    'p2.desc': "Real-time 3D scene built with NCLGL/OpenGL featuring Cook-Torrance PBR shading, IBL pre-computation (irradiance map, prefiltered cubemap, BRDF LUT), HDR tone mapping, water rendering with Fresnel reflection/refraction and spring-damper buoyancy, and a modular post-processing system.",
    'p3.desc': "Led ECS architecture design with Bridge middleware layer for engine-game logic decoupling. Co-designed JSON + reflection-driven PrefabFactory for data-driven entity configuration. Established team naming conventions and debugging standards.",
    'p4.desc': "C++ IPD simulator supporting multi-strategy tournaments, noise perturbation, evolutionary simulation, and complexity penalty analysis. Features modular strategy interface and unified CLI with text/CSV/JSON output.",

    'art.title':          'Art & Visual',
    'art.illust':         'Illustration',
    'art.illust.caption': 'Personal illustration practice — Photoshop',
    'art.model':          '3D Modeling',
    'art.model.caption':  'Blender learning exercises',

    'docs.title':  'Design Documents',
    'doc1.type':   'Game Design Analysis',
    'doc1.title':  'Xenoblade Chronicles 2 — Combat System Analysis',
    'doc1.desc':   "An in-depth breakdown of Xenoblade Chronicles 2's combat design — Driver / Blade mechanics, Arts rhythm, and Trust system, analyzed through a game design lens.",
    'doc.view':    'View',
    'doc.download':'Download',
    'doc.loading': 'Loading document…',

    'contact.title': 'Contact',
    'contact.intro': 'Feel free to reach out for collaboration or just a chat.',
    'footer.rights': 'All rights reserved.',
  },

  zh: {
    'nav.about':   '关于',
    'nav.skills':  '技能',
    'nav.works':   '作品',
    'nav.art':     '美术',
    'nav.docs':    '文档',
    'nav.contact': '联系',

    'hero.eyebrow': '你好，我是',
    'hero.role':    '游戏设计与开发 — 系统设计 · C++ 程序开发',
    'hero.cta':     '查看作品',
    'hero.contact': '联系我',

    'about.title':    '关于我',
    'about.bio':      '纽卡斯尔大学电脑游戏工程硕士，2026年9月毕业。兼具游戏系统设计思维与 C++ 程序开发能力。独立完成过包含物理交互、AI、网络同步的 3D 游戏原型与实时渲染管线。业余进行 PS 插画创作与 Blender 建模学习。',
    'about.location': '纽卡斯尔 & 成都',

    'skills.title':   '技能',
    'skills.gamedev': '游戏开发',
    'skills.engine':  '引擎系统',
    'skills.arch':    '架构与工具',

    'sk.cpp':     '主力语言，独立完成全部课程项目',
    'sk.unity':   '本科毕设使用，了解基本工作流',
    'sk.physics': '碰撞检测（Broad/Narrow Phase）、Jolt Physics',
    'sk.ai':      '有限状态机、行为树、A* 寻路',
    'sk.net':     '服务器权威同步、快照插值（ENet/UDP）',
    'sk.gfx':     'PBR（Cook-Torrance）、IBL 预计算、HDR、水体渲染、后处理系统',
    'sk.ecs':     '数据驱动实体架构，引擎与游戏逻辑解耦',
    'sk.ps':      '二次元插画创作',
    'sk.blender': '三维建模，初级水平',

    'works.title': '作品',
    'role.solo':   '独立开发',
    'role.arch':   '架构设计 / 编程',
    'team.size':   '4人团队',

    'p1.type':  '3D 动作游戏',
    'p1.title': '实时游戏原型',
    'p2.type':  '3D 渲染管线',
    'p2.title': '实时图形渲染',
    'p3.type':  '团队游戏项目',
    'p3.title': '团队游戏开发',
    'p4.type':  '博弈论模拟',
    'p4.title': '迭代囚徒困境模拟器',

    'p1.desc': '基于 C++/NCL 框架的 3D 游戏原型，包含包裹搬运核心玩法、射线检测+弹簧约束物体交互、状态机/行为树/A*寻路敌人 AI、服务器权威联机同步（20Hz 快照广播+客户端插值，ENet/UDP）。',
    'p2.desc': '基于 NCLGL/OpenGL 的实时 3D 场景，实现 Cook-Torrance PBR、IBL 预计算（辐照度图、预过滤环境图、BRDF LUT）、HDR 色调映射、水体渲染（Fresnel 反射/折射+弹簧阻尼浮力模拟）与模块化后处理系统。',
    'p3.desc': '主导 ECS 分层架构设计，引入 Bridge 中间层解耦引擎与游戏逻辑。参与 JSON+反射驱动的 PrefabFactory 设计，制定团队命名规范与调试标准。',
    'p4.desc': 'C++ 开发的迭代囚徒困境模拟器，支持多策略锦标赛、噪声扰动、演化模拟与复杂度惩罚分析。模块化策略接口 + 统一 CLI + 多格式输出（text/CSV/JSON）。',

    'art.title':          '美术创作',
    'art.illust':         '插画练习',
    'art.illust.caption': '个人插画练习 — Photoshop',
    'art.model':          '三维建模',
    'art.model.caption':  'Blender 练习',

    'docs.title':  '策划案',
    'doc1.type':   '游戏设计分析',
    'doc1.title':  '异度之刃2 — 战斗系统拆解案',
    'doc1.desc':   '对《异度之刃2》战斗设计的深度拆解——分析御刃者/异刃机制、Arts节奏系统与信赖度系统，从游戏设计视角进行专业解读。',
    'doc.view':    '查看',
    'doc.download':'下载',
    'doc.loading': '文档加载中…',

    'contact.title': '联系我',
    'contact.intro': '欢迎交流合作，随时联系我。',
    'footer.rights': '保留所有权利。',
  }
};

// ── Apply language ──
function applyLang(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) {
      el.textContent = translations[lang][key];
    }
  });
  const btn = document.getElementById('langToggle');
  if (btn) {
    btn.querySelector('.lang-en').classList.toggle('lang-active', lang === 'en');
    btn.querySelector('.lang-zh').classList.toggle('lang-active', lang === 'zh');
  }
  localStorage.setItem('lang', lang);
  docLoaded = false;
}

// ── Language toggle init ──
let currentLang = localStorage.getItem('lang') || 'zh';
applyLang(currentLang);
document.getElementById('langToggle').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'zh' : 'en';
  applyLang(currentLang);
});

// ── Auto year ──
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Navbar scroll + active link ──
const navbar  = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const backToTop = document.getElementById('backToTop');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  
  // Back to top visibility
  if (backToTop) {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }

  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 80) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Back to top click
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
const navToggle  = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinksEl.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});
navLinksEl.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ── Scroll reveal (CSS transitionDelay stagger, no setTimeout) ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
    const idx = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = `${idx * 0.1}s`;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Hero entrance: handled by CSS @keyframes fadeUp (see style.css) ──

// ── Hero brush stroke draw-in ──
window.addEventListener('load', () => {
  document.querySelectorAll('.hbrush path').forEach((path, i) => {
    let len;
    try { len = Math.ceil(path.getTotalLength()); } catch (e) { len = 2800; }
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.transition = `stroke-dashoffset ${1.8 + i * 0.45}s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.2}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
    }));
  });
});

// ── Section title underline animate-in ──
const titleObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('title-visible');
      titleObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
document.querySelectorAll('.section-title').forEach(el => titleObserver.observe(el));

// ── Doc Modal (bilingual pre-rendered HTML) ──
(function () {
  const modal    = document.getElementById('docModal');
  const body     = document.getElementById('docModalBody');
  const closeBtn = document.getElementById('docModalClose');
  const cache    = {};   // { zh: '…html…', en: '…html…' }

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const lang = currentLang;
    if (cache[lang]) { body.innerHTML = cache[lang]; return; }
    const t = translations[lang];
    body.innerHTML = `<p class="doc-loading">${t['doc.loading'] || 'Loading…'}</p>`;
    fetch(lang === 'zh' ? 'word/combat_zh.html' : 'word/combat_en.html')
      .then(r => r.text())
      .then(html => { cache[lang] = html; body.innerHTML = html; })
      .catch(() => {
        body.innerHTML = `<p class="doc-loading">${
          lang === 'zh' ? '加载失败，请使用下载功能查看。' : 'Failed to load — please use Download instead.'
        }</p>`;
      });
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.doc-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-doc-dl')) return;
      openModal();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (modal.classList.contains('open') && e.key === 'Escape') closeModal();
  });
})();

// ── Lightbox ──
(function () {
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lbImg');
  const lbCap   = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev  = document.getElementById('lbPrev');
  const lbNext  = document.getElementById('lbNext');

  let items = [];   // all art-item elements in current group
  let current = 0;

  function open(el) {
    const group = el.dataset.group;
    items = Array.from(document.querySelectorAll(`.art-item[data-group="${group}"]`));
    current = items.indexOf(el);
    show(current);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function show(idx) {
    current = (idx + items.length) % items.length;
    const el = items[current];
    lbImg.src = el.dataset.src;
    lbImg.alt = el.dataset.caption || '';
    lbCap.textContent = el.dataset.caption || '';
  }

  document.querySelectorAll('.art-item').forEach(el => {
    el.addEventListener('click', () => open(el));
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(el); });
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => show(current - 1));
  lbNext.addEventListener('click', () => show(current + 1));

  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
