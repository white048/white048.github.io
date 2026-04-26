/* ══════════════════════════════════════════════
   main.js — Interactions for 焦茶风格主页
   ══════════════════════════════════════════════ */

// ── Translations ──
const translations = {
  en: {
    'nav.about':       'About',
    'nav.skills':      'Skills',
    'nav.works':       'Works',
    'nav.contact':     'Contact',
    'hero.eyebrow':    "Hello, I'm",
    'hero.cta':        'View Works ↓',
    'about.title':     'About Me',
    'about.bio1':      '[YOUR BIO — Introduce yourself in 2–4 sentences: who you are, what you do, what you\'re passionate about.]',
    'about.bio2':      '[Continue with your background, experience, or interests.]',
    'skills.title':    'Skills',
    'skills.frontend': 'Frontend',
    'skills.backend':  'Backend',
    'skills.tools':    'Tools',
    'works.title':     'Works',
    'works.p1.desc':   '[Brief description of this project — what it does, what problem it solves, what tech it uses.]',
    'works.p2.desc':   '[Project description.]',
    'works.p3.desc':   '[Project description.]',
    'contact.title':   'Contact',
    'contact.intro':   'Feel free to reach out for collaboration or just a chat.',
    'footer.rights':   'All rights reserved.',
  },
  zh: {
    'nav.about':       '关于',
    'nav.skills':      '技能',
    'nav.works':       '作品',
    'nav.contact':     '联系',
    'hero.eyebrow':    '你好，我是',
    'hero.cta':        '查看作品 ↓',
    'about.title':     '关于我',
    'about.bio1':      '[个人简介 — 用 2-4 句话介绍自己：你是谁、做什么、擅长什么、对什么有热情。]',
    'about.bio2':      '[继续介绍你的学习经历、工作经历或兴趣爱好。]',
    'skills.title':    '技能',
    'skills.frontend': '前端',
    'skills.backend':  '后端',
    'skills.tools':    '工具',
    'works.title':     '作品',
    'works.p1.desc':   '[简短描述这个项目：是什么、解决了什么问题、用了什么技术。]',
    'works.p2.desc':   '[项目描述。]',
    'works.p3.desc':   '[项目描述。]',
    'contact.title':   '联系我',
    'contact.intro':   '欢迎交流合作，随时联系我。',
    'footer.rights':   '保留所有权利。',
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

  // Highlight active lang in toggle button
  const btn = document.getElementById('langToggle');
  if (btn) {
    btn.querySelector('.lang-en').classList.toggle('lang-active', lang === 'en');
    btn.querySelector('.lang-zh').classList.toggle('lang-active', lang === 'zh');
  }

  localStorage.setItem('lang', lang);
}

// ── Language toggle ──
const langToggle = document.getElementById('langToggle');
let currentLang = localStorage.getItem('lang') || 'en';
applyLang(currentLang);

langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'zh' : 'en';
  applyLang(currentLang);
});

// ── Auto year in footer ──
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Navbar: scroll shadow + active link ──
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 90) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Mobile hamburger menu ──
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinksEl.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let delay = 0;
        siblings.forEach((el, idx) => { if (el === entry.target) delay = idx * 80; });
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

// ── Hero entrance animation ──
document.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    heroContent.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
    requestAnimationFrame(() => {
      setTimeout(() => {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
      }, 100);
    });
  }
});
