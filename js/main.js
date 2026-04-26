/* ══════════════════════════════════════════════
   main.js — Game Dev Portfolio
   ══════════════════════════════════════════════ */

// ── Translations ──
const translations = {
  en: {
    'nav.about':   'About',
    'nav.skills':  'Skills',
    'nav.works':   'Works',
    'nav.art':     'Art',
    'nav.contact': 'Contact',

    'hero.eyebrow': "Hello, I'm",
    'hero.cta':     'View Works',
    'hero.contact': 'Get in Touch',

    'about.title':    'About Me',
    'about.bio':      'MSc Computer Game Engineering student at Newcastle University, graduating September 2026. I combine game system design thinking with hands-on C++ programming ability. Passionate about JRPG combat systems, turn-based numerical design, and gacha/live-service game operations. I\'ve independently built 3D game prototypes with physics interaction, AI behavior systems, and networked multiplayer, as well as real-time PBR/IBL rendering pipelines. I also draw anime-style illustrations in Photoshop and do beginner-level 3D modeling in Blender.',
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

    'p1.desc': "A 3D game prototype built with C++/NCL framework featuring package collection gameplay, ray-cast + spring-constraint object interaction, FSM/Behavior Tree/A* enemy AI, and server-authoritative multiplayer with 20Hz snapshot broadcasting and client-side interpolation via ENet/UDP.",
    'p2.desc': "Real-time 3D scene built with NCLGL/OpenGL featuring Cook-Torrance PBR shading, IBL pre-computation (irradiance map, prefiltered cubemap, BRDF LUT), HDR tone mapping, water rendering with Fresnel reflection/refraction and spring-damper buoyancy, and a modular post-processing system.",
    'p3.desc': "Led ECS architecture design with Bridge middleware layer for engine-game logic decoupling. Co-designed JSON + reflection-driven PrefabFactory for data-driven entity configuration. Established team naming conventions and debugging standards.",
    'p4.desc': "C++ IPD simulator supporting multi-strategy tournaments, noise perturbation, evolutionary simulation, and complexity penalty analysis. Features modular strategy interface and unified CLI with text/CSV/JSON output.",

    'art.title':          'Art & Visual',
    'art.illust':         'Illustration',
    'art.illust.caption': 'Personal illustration practice — Photoshop',
    'art.model':          '3D Modeling',
    'art.model.caption':  'Blender learning exercises',

    'contact.title': 'Contact',
    'contact.intro': 'Feel free to reach out for collaboration or just a chat.',
    'footer.rights': 'All rights reserved.',
  },

  zh: {
    'nav.about':   '关于',
    'nav.skills':  '技能',
    'nav.works':   '作品',
    'nav.art':     '美术',
    'nav.contact': '联系',

    'hero.eyebrow': '你好，我是',
    'hero.cta':     '查看作品',
    'hero.contact': '联系我',

    'about.title':    '关于我',
    'about.bio':      '纽卡斯尔大学电脑游戏工程硕士，2026年9月毕业。兼具游戏系统设计思维与 C++ 程序开发能力。长期深度游玩 JRPG、回合制、二次元等品类（100+ 款），对战斗系统架构与数值体验有持续拆解分析的习惯。独立完成过包含物理交互、AI、网络同步的 3D 游戏原型与实时渲染管线。业余进行 PS 二次元插画创作与 Blender 建模学习。',
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

    'p1.desc': '基于 C++/NCL 框架的 3D 游戏原型，包含包裹搬运核心玩法、射线检测+弹簧约束物体交互、状态机/行为树/A*寻路敌人 AI、服务器权威联机同步（20Hz 快照广播+客户端插值，ENet/UDP）。',
    'p2.desc': '基于 NCLGL/OpenGL 的实时 3D 场景，实现 Cook-Torrance PBR、IBL 预计算（辐照度图、预过滤环境图、BRDF LUT）、HDR 色调映射、水体渲染（Fresnel 反射/折射+弹簧阻尼浮力模拟）与模块化后处理系统。',
    'p3.desc': '主导 ECS 分层架构设计，引入 Bridge 中间层解耦引擎与游戏逻辑。参与 JSON+反射驱动的 PrefabFactory 设计，制定团队命名规范与调试标准。',
    'p4.desc': 'C++ 开发的迭代囚徒困境模拟器，支持多策略锦标赛、噪声扰动、演化模拟与复杂度惩罚分析。模块化策略接口 + 统一 CLI + 多格式输出（text/CSV/JSON）。',

    'art.title':          '美术创作',
    'art.illust':         '插画练习',
    'art.illust.caption': '个人插画练习 — Photoshop',
    'art.model':          '三维建模',
    'art.model.caption':  'Blender 练习',

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
}

// ── Language toggle init ──
let currentLang = localStorage.getItem('lang') || 'en';
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

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
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

// ── Hamburger menu ──
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

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = entry.target.parentElement.querySelectorAll('.reveal');
    let delay = 0;
    siblings.forEach((el, i) => { if (el === entry.target) delay = i * 80; });
    setTimeout(() => entry.target.classList.add('visible'), delay);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Hero entrance ──
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero-content');
  if (!hero) return;
  hero.style.cssText = 'opacity:0;transform:translateY(20px);transition:opacity 0.9s ease,transform 0.9s ease';
  requestAnimationFrame(() => setTimeout(() => {
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0)';
  }, 80));
});

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
