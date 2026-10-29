/* ══════════════════════════════════════════════
   forge.js — Token Forge
   A print shop that writes the way a language model does,
   in three stations of three rounds each:
   01 CUT   tokenisation: split slogans into known pieces
   02 FOCUS attention: pour ten drops of ink on what "IT" means
   03 PRESS sampling: set the temperature, pull the lever
   ══════════════════════════════════════════════ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;
const stage = $('#stage');
const T = (en, zh) => `<span class="en" lang="en">${en}</span><span class="zh" lang="zh-CN">${zh}</span>`;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
};

// ── language (shared with the homepage through the same storage key) ──
function setLang(lang) {
  root.dataset.lang = lang;
  root.lang = lang === 'en' ? 'en' : 'zh-CN';
  store.set('lang', lang);
}
$('#langToggle').addEventListener('click', () => setLang(root.dataset.lang === 'en' ? 'zh' : 'en'));

// ── progress: best stars per round ──
const STATIONS = ['cut', 'focus', 'press'];
let best = { cut: [0, 0, 0], focus: [0, 0, 0], press: [0, 0, 0] };
try { best = { ...best, ...JSON.parse(store.get('tf-stars') || '{}') }; } catch (e) { /* fresh start */ }
const sum = a => a.reduce((n, x) => n + x, 0);
function award(station, round, stars) {
  best[station][round] = Math.max(best[station][round], stars);
  store.set('tf-stars', JSON.stringify(best));
}
const starRow = (n, of = 3) => `<span class="stars" aria-label="${n} / ${of}">${'★'.repeat(n)}<span class="off">${'★'.repeat(of - n)}</span></span>`;

// a stable number for each token, like the number cast on a type slug
const tokenId = s => { let h = 17; for (const c of s) h = (h * 131 + c.charCodeAt(0)) % 49999; return h + 100; };

const META = {
  cut:   { no: '01', name: 'CUT',   concept: T('Tokenisation', '分词'),
           blurb: T('Machines read tokens, not letters. Cut slogans into pieces the press knows, using as few as you can.', '机器不认字母，只认词元。把标语切成印刷机认得的块，块数越少越好。') },
  focus: { no: '02', name: 'FOCUS', concept: T('Attention', '注意力'),
           blurb: T('A word finds its meaning by looking at other words. Pour ten drops of ink on what "IT" refers to.', '一个词靠看别的词来确定意思。把十滴墨倒在“IT（它）”指代的词上。') },
  press: { no: '03', name: 'PRESS', concept: T('Sampling', '采样'),
           blurb: T('The next word is a weighted dice roll. Set the temperature, pull the lever, keep the poster.', '下一个词是一次带权重的掷骰。调好温度，拉下拉杆，把海报带走。') },
};

// ══ DATA ══
// every single letter is always in the type case; these are the bigger slugs
const CUT_ROUNDS = [
  { text: 'THE FORGE NEVER SLEEPS',
    vocab: ['THE', 'TH', 'FORGE', 'FOR', 'GE', 'NEVER', 'NE', 'VER', 'SLEEP', 'SL', 'EEP', 'EP'],
    intro: T('Machines don\'t read letters, they read <b>tokens</b>. Tap a letter to cut after it, tap again to join. Every piece must be in the type case below, and every token costs ink, so use as few as you can.',
             '机器不认字母，只认<b>词元</b>。点一个字母就在它后面下刀，再点一次合上。每一块都得在下面的字盘里，而且每个词元都耗墨，越少越好。'),
    after: T('SLEEPS isn\'t in the case, so it becomes <b>SLEEP + S</b>. Common words stay whole; rarer forms are built from parts.',
             '字盘里没有 SLEEPS，所以它成了 <b>SLEEP + S</b>。常用词保持完整，少见的词形用零件拼。') },
  { text: 'UNTHINKABLE IDEAS',
    vocab: ['UN', 'UNT', 'THINK', 'THIN', 'INK', 'ABLE', 'AB', 'LE', 'IDEA', 'ID', 'EA', 'AS'],
    intro: T('Here\'s a word nobody keeps in one piece.', '这个词，没人会整块收着。'),
    after: T('<b>UN + THINK + ABLE</b>: models build rare words from familiar parts. That\'s how they cope with words they have never seen.',
             '<b>UN + THINK + ABLE</b>：模型用熟悉的零件拼出生僻词，这也是它们应付没见过的词的办法。') },
  { text: 'TOKENS ARE EVERYTHING',
    vocab: ['TOKEN', 'TOK', 'EN', 'ENS', 'ARE', 'AR', 'EVERY', 'EVERYTHING', 'THING', 'EV', 'ERY', 'ING'],
    intro: T('Last strip. Some long words are common enough to be cast as a single slug.', '最后一条。有些长词常用到可以铸成一整块。'),
    after: T('<b>EVERYTHING</b> is common enough to earn its own token; <b>TOKENS</b> is not. Models are billed and limited by tokens, so rare words cost more.',
             '<b>EVERYTHING</b> 常用到配得上一个独立词元，<b>TOKENS</b> 却不行。模型按词元计费、按词元限长，所以生僻词更贵。') },
];

const FOCUS_ROUNDS = [
  { tokens: 'THE TROPHY WOULD NOT FIT IN THE SUITCASE BECAUSE IT WAS TOO BIG'.split(' '), query: 9, answer: 1,
    intro: T('<b>Attention</b> is where a word looks for its meaning. You have ten drops of ink: tap the words <b>IT</b> should look at. The red lines show where it is looking.',
             '<b>注意力</b>，就是一个词去哪儿找自己的意思。你有十滴墨：点那些 <b>IT（它）</b>该看的词。红线就是它的视线。'),
    after: T('Too <b>BIG</b> points back to the <b>TROPHY</b>: only the thing going in can be too big.', '太<b>大</b>，指的是<b>奖杯</b>：只有往里装的东西才会太大。') },
  { tokens: 'THE TROPHY WOULD NOT FIT IN THE SUITCASE BECAUSE IT WAS TOO SMALL'.split(' '), query: 9, answer: 7,
    intro: T('Same sentence. One word changed.', '同一句话，只改了一个词。'),
    after: T('One word changed and the attention moved to the <b>SUITCASE</b>. Meaning lives in the context, not in the word.', '只改了一个词，注意力就移到了<b>手提箱</b>上。意思在上下文里，不在词本身。') },
  { tokens: 'THE PRESS PRINTED THE POSTER BEFORE IT RAN OUT OF INK'.split(' '), query: 6, answer: 1,
    intro: T('One more, from our own shop floor.', '再来一句，就发生在咱们车间。'),
    after: T('Only a <b>PRESS</b> runs out of ink. A model learns these links from billions of sentences, not from rules.', '只有<b>印刷机</b>才会没墨。模型从海量句子里学到这种关联，而不是靠规则。') },
];
const INK = 10;

const PROMPT = 'THE FUTURE IS';
const NEXT = [['BRIGHT', 3.0], ['NOW', 2.6], ['OURS', 2.3], ['UNWRITTEN', 1.4], ['HANDMADE', 1.0], ['LATE', 0.5], ['SOUP', -0.3], ['SQUARE', -0.6]];
const PRESS_ROUNDS = [
  { pulls: 3, ok: i => i === 0,
    goal: T('Commission: the client wants the safest word, <b>BRIGHT</b>. Three sheets of paper.', '订单：客户要最稳妥的词 <b>BRIGHT</b>。只有三张纸。'),
    intro: T('Last station. The press guesses the next word by rolling <b>weighted dice</b>. <b>Temperature</b> reshapes the weights. Turn it down, then pull.',
             '最后一站。印刷机靠一把<b>带权重的骰子</b>猜下一个词，<b>温度</b>会改变权重。先把温度调低，再拉杆。'),
    after: T('Low temperature sharpens the odds, so the favourite almost always wins. That\'s how a model sounds steady, and dull.', '温度越低，概率越尖，最热门的词几乎每次都赢。模型就是这样显得稳重，也显得乏味。') },
  { pulls: 4, ok: i => i >= 3,
    goal: T('Commission: the art director is bored. Print anything <b>outside the top three</b>. Four sheets.', '订单：美术总监看腻了。印一个<b>前三名以外</b>的词。四张纸。'),
    intro: T('Now the opposite.', '这回反过来。'),
    after: T('High temperature flattens the odds, so long shots get their turn. More surprise, and more nonsense.', '温度越高，概率越平，冷门词也有机会上场。惊喜更多，胡话也更多。') },
  { pulls: 1, ok: () => true,
    goal: T('Your poster. Any temperature, one sheet. This one you keep.', '你的海报。温度随意，一张纸。这张归你。'),
    intro: T('Your turn. Set the temperature you like and print the poster you want to take home.', '轮到你了。温度随你定，印一张你想带回家的海报。'),
    after: T('Printed. Every reply from a chatbot is made like this, one weighted roll per token.', '印好了。聊天机器人的每一句回答都是这样造出来的：每个词元一次带权重的掷骰。') },
];

// ══ SCREENS ══
let screen = 'title';
const state = {};

function go(name, round = 0) {
  screen = name;
  if (name === 'cut') Object.assign(state, { r: round, cuts: new Set(), done: false, msg: null });
  if (name === 'focus') Object.assign(state, { r: round, drops: Array(FOCUS_ROUNDS[round].tokens.length).fill(0), done: false, msg: null });
  if (name === 'press') Object.assign(state, { r: round, temp: state.temp ?? 1, pulls: 0, word: null, done: false, msg: null });
  render();
  scrollTo({ top: 0 });
}

function render() {
  ({ title: renderTitle, cut: renderCut, focus: renderFocus, press: renderPress, finale: renderFinale })[screen]();
}

function renderTitle() {
  const total = STATIONS.reduce((n, s) => n + sum(best[s]), 0);
  stage.innerHTML = `
    <section class="title">
      <p class="kicker">${T('A five-minute game · three stations', '五分钟小游戏 · 三个工位')}</p>
      <h1 class="banner">TOKEN FORGE</h1>
      <p class="lede">${T('A language model doesn\'t read letters or write sentences. It cuts text into tokens, decides where to look, and rolls weighted dice. This print shop works the same way. Clock in.',
        '语言模型既不认字母，也不写句子：它把文字切成词元，决定该看哪里，再掷一把带权重的骰子。这间印刷厂也是这么干活的。上工吧。')}</p>
      <ol class="stations">
        ${STATIONS.map(id => {
          const m = META[id], got = sum(best[id]);
          return `<li class="st-card">
            <span class="no">${m.no}</span>
            <h2>${m.name}</h2>
            <span class="concept">${m.concept}</span>
            <p>${m.blurb}</p>
            ${starRow(got, 9)}
            <button class="btn ${got ? '' : 'btn--red'}" type="button" data-act="go" data-to="${id}">${got ? T('Play again', '再玩一次') : T('Start', '开工')}</button>
          </li>`;
        }).join('')}
      </ol>
      <p class="title-foot">${T(`Stars so far: ${total} / 27. Made by Dong Yijun with plain HTML, CSS and JavaScript; the slogans are English because English tokenisation is the easiest to see.`,
        `目前星数：${total} / 27。董一均用原生 HTML、CSS、JavaScript 制作；标语用英文，因为英文的词元切分最直观。`)}</p>
    </section>`;
}

function shell(id, round, board, controls, say) {
  const m = META[id];
  const pips = [0, 1, 2].map(i => `<span class="pip ${i < round ? 'done' : i === round ? 'now' : ''}"></span>`).join('');
  return `
    <section class="station">
      <div class="station-head">
        <div>
          <p class="kicker">${T(`Station ${m.no}`, `工位 ${m.no}`)}</p>
          <h1>${m.name}</h1>
          <span class="concept">${m.concept}</span>
        </div>
        <div class="pips" aria-label="Round ${round + 1} / 3">${pips}</div>
      </div>
      <div class="foreman">
        <span class="face" aria-hidden="true"></span>
        <p class="say" aria-live="polite"><span class="who">${T('Foreman', '工头')}</span>${say}</p>
      </div>
      ${board}
      <div class="controls">${controls}</div>
    </section>`;
}

// what comes after a round: the next round, the next station, or the finale
function nextButton(id, round) {
  if (round < 2) return `<button class="btn btn--red" type="button" data-act="go" data-to="${id}" data-round="${round + 1}">${T('Next round', '下一轮')} →</button>`;
  const i = STATIONS.indexOf(id);
  if (i < 2) return `<button class="btn btn--red" type="button" data-act="go" data-to="${STATIONS[i + 1]}">${T('Next station', '下一个工位')} →</button>`;
  return `<button class="btn btn--red" type="button" data-act="go" data-to="finale">${T('Collect your poster', '领取海报')} →</button>`;
}
const resultRow = (id, round, stars) => `<div class="result">${starRow(stars)}${nextButton(id, round)}<button class="btn" type="button" data-act="go" data-to="${id}" data-round="${round}">${T('Retry', '重来')}</button></div>`;

// ══ 01 CUT ══
const wordsOf = r => r.text.split(' ');
function piecesOf(word, w, cuts) {
  const out = [];
  let start = 0;
  for (let i = 0; i < word.length; i++) {
    if (i === word.length - 1 || cuts.has(`${w}:${i}`)) {
      out.push({ text: word.slice(start, i + 1), start });
      start = i + 1;
    }
  }
  return out;
}
const known = (V, p) => p.length === 1 || V.has(p);
function fewest(word, V) {   // fewest pieces a word can be cut into
  const f = [0];
  for (let j = 1; j <= word.length; j++) {
    f[j] = Infinity;
    for (let i = 0; i < j; i++) if (known(V, word.slice(i, j))) f[j] = Math.min(f[j], f[i] + 1);
  }
  return f[word.length];
}

function renderCut() {
  const r = CUT_ROUNDS[state.r], V = new Set(r.vocab), words = wordsOf(r);
  const pieces = words.map((word, w) => piecesOf(word, w, state.cuts));
  const count = pieces.flat().length;
  const target = words.reduce((n, word) => n + fewest(word, V), 0);
  const strip = words.map((word, w) => `<div class="word">${pieces[w].map(p => {
    const ok = known(V, p.text);
    const slugs = [...p.text].map((ch, k) => {
      const i = p.start + k;
      return `<button class="slug" type="button" data-act="cut" data-key="${w}:${i}" aria-label="${ch}, cut after" ${i === word.length - 1 || state.done ? 'disabled' : ''}>${ch}</button>`;
    }).join('');
    return `<span class="piece${ok ? '' : ' bad'}">${slugs}<small>${ok ? '#' + tokenId(p.text) : '?'}</small></span>`;
  }).join('')}</div>`).join('');
  const board = `<div class="board">
      <div class="strip">${strip}</div>
      <div class="case"><span class="lbl">${T('TYPE CASE', '字盘')}</span>${[...r.vocab].sort().map(v => `<span>${v}<small>#${tokenId(v)}</small></span>`).join('')}<span class="all">${T('+ every single letter', '+ 所有单个字母')}</span></div>
    </div>`;
  const controls = state.done
    ? resultRow('cut', state.r, state.stars)
    : `<span class="meter">${T('Tokens', '词元')} <b>${count}</b> · ${T('fewest possible', '最少可能')} <b>${target}</b></span>
       <button class="btn" type="button" data-act="cut-reset">${T('Join all', '全部合上')}</button>
       <button class="btn btn--red" type="button" data-act="cut-stamp">${T('Stamp', '盖章')}</button>`;
  stage.innerHTML = shell('cut', state.r, board, controls, state.msg || r.intro);
}

function stampCut() {
  const r = CUT_ROUNDS[state.r], V = new Set(r.vocab), words = wordsOf(r);
  const pieces = words.flatMap((word, w) => piecesOf(word, w, state.cuts));
  const bad = pieces.find(p => !known(V, p.text));
  if (bad) {
    state.msg = T(`The press has no slug for <b>${bad.text}</b>. Cut it into pieces from the type case.`, `印刷机没有 <b>${bad.text}</b> 这块铅字。把它切成字盘里有的块。`);
    return render();
  }
  const target = words.reduce((n, word) => n + fewest(word, V), 0);
  const extra = pieces.length - target;
  state.stars = extra <= 0 ? 3 : extra === 1 ? 2 : 1;
  state.done = true;
  state.msg = (extra > 0 ? T(`Valid, but ${extra} token${extra > 1 ? 's' : ''} more than needed. `, `能印，但比最少多了 ${extra} 个词元。`) : '') + r.after;
  award('cut', state.r, state.stars);
  render();
}

// ══ 02 FOCUS ══
function renderFocus() {
  const r = FOCUS_ROUNDS[state.r];
  const used = sum(state.drops);
  const toks = r.tokens.map((tok, i) => {
    if (i === r.query) return `<button class="tok query" type="button" disabled data-i="${i}">${tok}<small>${T('query', '查询')}</small></button>`;
    const d = state.drops[i], share = used ? Math.round(d / used * 100) : 0;
    const cls = ['tok', d ? 'lit' : '', state.done && i === r.answer ? 'answer' : ''].join(' ');
    return `<button class="${cls}" type="button" data-act="drop" data-i="${i}" ${state.done ? 'disabled' : ''} aria-label="${tok}, ${d} drops">
      <span class="drops" aria-hidden="true">${'●'.repeat(d)}</span>${tok}<small>${d ? share + '%' : ''}</small></button>`;
  }).join('');
  const board = `<div class="board"><div class="sentence"><svg class="arcs" aria-hidden="true"></svg>${toks}</div>
    <p class="board-note">${T('Tap a word to pour one drop on it. The share of ink is the attention weight.', '点一个词就倒一滴墨。墨的占比就是注意力权重。')}</p></div>`;
  const controls = state.done
    ? resultRow('focus', state.r, state.stars)
    : `<span class="meter">${T('Ink left', '剩余墨水')} <b>${INK - used}</b> / ${INK}</span>
       <button class="btn" type="button" data-act="drop-wipe">${T('Wipe', '擦掉')}</button>
       <button class="btn btn--red" type="button" data-act="drop-print" ${used ? '' : 'disabled'}>${T('Print', '开印')}</button>`;
  stage.innerHTML = shell('focus', state.r, board, controls, state.msg || r.intro);
  drawArcs();
}

// red lines from the query word to every word holding ink, as thick as its share
function drawArcs() {
  const box = $('.sentence'), svg = $('.arcs');
  if (!box || !svg) return;
  const r = FOCUS_ROUNDS[state.r], used = sum(state.drops);
  const at = el => { const a = el.getBoundingClientRect(), b = box.getBoundingClientRect(); return [a.left - b.left + a.width / 2, a.top - b.top]; };
  const q = $(`.tok[data-i="${r.query}"]`, box);
  const [x1, y1] = at(q);
  svg.innerHTML = state.drops.map((d, i) => {
    if (!d) return '';
    const [x2, y2] = at($(`.tok[data-i="${i}"]`, box));
    const lift = 34 + Math.min(110, Math.abs(x2 - x1) * 0.18);
    const cy = Math.min(y1, y2) - lift;
    return `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${cy} ${x2} ${y2}" stroke-width="${(2 + 12 * d / used).toFixed(1)}" opacity="${(0.45 + 0.55 * d / used).toFixed(2)}"/>`;
  }).join('');
}
addEventListener('resize', () => { if (screen === 'focus') drawArcs(); });

function printFocus() {
  const r = FOCUS_ROUNDS[state.r], used = sum(state.drops);
  const share = state.drops[r.answer] / used;
  if (share < 0.5) {
    state.msg = T('The press printed nonsense. Which word does <b>IT</b> really point to? Wipe and try again.', '印出来一团糟。<b>IT（它）</b>到底指的是哪个词？擦掉再试。');
    return render();
  }
  state.stars = share >= 0.8 ? 3 : share >= 0.65 ? 2 : 1;
  state.done = true;
  state.msg = r.after;
  award('focus', state.r, state.stars);
  render();
}

// ══ 03 PRESS ══
function probs(temp) {
  const z = NEXT.map(([, l]) => Math.exp(l / temp));
  const s = sum(z);
  return z.map(v => v / s);
}

function renderPress() {
  const R = PRESS_ROUNDS[state.r];
  const sheetWord = state.word === null ? `<span class="word blank">·</span>` : `<span class="word stamped">${NEXT[state.word][0]}</span>`;
  const board = `<div class="press-grid">
      <div class="sheet"><p class="line">${PROMPT}</p>${sheetWord}</div>
      <div>
        <p class="goal">${R.goal}</p>
        <div class="bars" id="bars"></div>
        <div class="temp">
          <label for="temp">${T('Temperature', '温度')} <output id="tempOut">${state.temp.toFixed(2)}</output></label>
          <input id="temp" type="range" min="0.1" max="2.5" step="0.05" value="${state.temp}" ${state.done ? 'disabled' : ''} />
          <div class="ends"><span>${T('steady', '稳')}</span><span>${T('wild', '野')}</span></div>
        </div>
      </div>
    </div>`;
  const left = R.pulls - state.pulls;
  let controls;
  if (state.done) controls = state.r === 2
    ? `<div class="result">${nextButton('press', 2)}<button class="btn" type="button" data-act="go" data-to="press" data-round="2">${T('Print another', '再印一张')}</button></div>`
    : resultRow('press', state.r, state.stars);
  else if (left <= 0) controls = `<button class="btn btn--red" type="button" data-act="go" data-to="press" data-round="${state.r}">${T('New paper', '换一叠纸')}</button>`;
  else controls = `<span class="meter">${T('Paper left', '剩余纸张')} <b>${left}</b></span>
      <button class="btn btn--red lever" type="button" data-act="pull">${T('PULL THE LEVER', '拉下拉杆')}</button>`;
  stage.innerHTML = shell('press', state.r, `<div class="board">${board}</div>`, controls, state.msg || R.intro);
  updateBars();
  $('#temp').addEventListener('input', e => {
    state.temp = +e.target.value;
    $('#tempOut').textContent = state.temp.toFixed(2);
    updateBars();
  });
}

function updateBars() {
  const p = probs(state.temp);
  $('#bars').innerHTML = NEXT.map(([w], i) => `
    <div class="bar-row${i < 3 ? ' top' : ''}${state.word === i ? ' hit' : ''}">
      <span class="w">${w}</span><i style="width:${(p[i] * 100).toFixed(1)}%"></i><span>${(p[i] * 100).toFixed(p[i] < 0.1 ? 1 : 0)}%</span>
    </div>`).join('');
}

function pull() {
  const R = PRESS_ROUNDS[state.r], p = probs(state.temp);
  let x = Math.random(), i = 0;
  while (i < p.length - 1 && (x -= p[i]) > 0) i++;
  state.word = i;
  state.pulls++;
  const w = NEXT[i][0];
  if (R.ok(i)) {
    state.done = true;
    state.stars = state.pulls === 1 ? 3 : state.pulls === 2 ? 2 : 1;
    if (state.r === 2) { state.stars = 3; state.final = { word: w, temp: state.temp, p: p[i] }; }
    state.msg = T(`<b>${w}</b>, with a ${(p[i] * 100).toFixed(1)}% chance. `, `<b>${w}</b>，概率 ${(p[i] * 100).toFixed(1)}%。`) + R.after;
    award('press', state.r, state.stars);
  } else {
    const left = R.pulls - state.pulls;
    state.msg = T(`<b>${w}</b>. Not what the client ordered. `, `<b>${w}</b>。不是客户要的。`)
      + (left ? T(`${left} sheet${left > 1 ? 's' : ''} left. Check the temperature.`, `还剩 ${left} 张纸，看看温度对不对。`) : T('Out of paper. Try another temperature.', '纸用完了，换个温度再试。'));
  }
  render();
}

// ══ FINALE ══
function posterCanvas({ word, temp, p }) {
  const W = 1080, H = 1350, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const C = { ink: '#1d1916', red: '#b23a25', cream: '#eadcc2', sand: '#dccbab', tan: '#c7a57f' };
  x.fillStyle = C.cream; x.fillRect(0, 0, W, H);
  const cx = W * 0.78, cy = H * 0.74;
  for (let i = 0; i < 28; i++) {   // sunburst
    const a = (i / 28) * Math.PI * 2, b = ((i + 0.5) / 28) * Math.PI * 2;
    x.fillStyle = C.sand;
    x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * 2000, cy + Math.sin(a) * 2000); x.lineTo(cx + Math.cos(b) * 2000, cy + Math.sin(b) * 2000); x.fill();
  }
  x.fillStyle = C.red; x.beginPath(); x.arc(cx, cy, 250, 0, Math.PI * 2); x.fill();
  x.fillStyle = C.ink; x.fillRect(0, H - 120, W, 120);
  // the prompt on a tilted ink band
  x.save(); x.translate(70, 250); x.rotate(-0.06);
  x.font = '150px "Bebas Neue", "Arial Narrow", sans-serif';
  const pw = x.measureText(PROMPT).width;
  x.fillStyle = C.ink; x.beginPath(); x.moveTo(-30, -150); x.lineTo(pw + 60, -150); x.lineTo(pw + 30, 30); x.lineTo(-30, 30); x.fill();
  x.fillStyle = C.cream; x.fillText(PROMPT, 0, 0);
  x.restore();
  // the sampled word, as big as it fits
  let size = 330;
  x.font = `${size}px "Bebas Neue", "Arial Narrow", sans-serif`;
  const ww = x.measureText(word).width;
  if (ww > W - 140) size = Math.floor(size * (W - 140) / ww);
  x.font = `${size}px "Bebas Neue", "Arial Narrow", sans-serif`;
  x.fillStyle = C.red; x.fillText(word, 78, 330 + size * 0.95);
  x.fillStyle = C.ink; x.fillText(word, 70, 322 + size * 0.95);
  x.font = '30px "Special Elite", "Courier New", monospace';
  x.fillStyle = C.ink;
  x.fillText(`TEMPERATURE ${temp.toFixed(2)}  ·  CHANCE ${(p * 100).toFixed(1)}%`, 70, 330 + size * 0.95 + 70);
  x.fillStyle = C.cream;
  x.fillText('PRINTED AT THE TOKEN FORGE', 70, H - 66);
  x.fillText('white048.github.io/games/token-forge', 70, H - 26);
  for (let i = 0; i < 2600; i++) {   // paper grain
    x.fillStyle = `rgba(29,25,22,${(Math.random() * 0.06).toFixed(3)})`;
    x.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  return c;
}

function renderFinale() {
  const fin = state.final || { word: NEXT[0][0], temp: 1, p: probs(1)[0] };
  const total = STATIONS.reduce((n, s) => n + sum(best[s]), 0);
  stage.innerHTML = `
    <section>
      <p class="kicker">${T('End of shift', '下班')}</p>
      <h1 class="banner">YOUR POSTER</h1>
      <div class="finale">
        <div id="posterSlot"></div>
        <div>
          <p class="lede">${T('That is the whole trick: cut text into tokens, let every token look at the others, then roll weighted dice for the next one. Do it a few thousand times a second and it starts to sound like someone.',
            '整个把戏就这些：把文字切成词元，让每个词元去看其他词元，再为下一个词元掷一把带权重的骰子。每秒做上几千次，它听起来就像个人了。')}</p>
          <ul class="tally">
            ${STATIONS.map(s => `<li><span>${META[s].no} ${META[s].name} · ${META[s].concept}</span>${starRow(sum(best[s]), 9)}</li>`).join('')}
            <li><span>${T('Total', '合计')}</span><b>${total} / 27</b></li>
          </ul>
          <div class="controls">
            <button class="btn btn--red" type="button" data-act="save">${T('Save poster', '保存海报')}</button>
            <button class="btn" type="button" data-act="go" data-to="title">${T('Back to the shop', '回到车间')}</button>
            <a class="btn" href="../../">${T('Dong Yijun\'s portfolio', '董一均的作品集')}</a>
          </div>
        </div>
      </div>
    </section>`;
  const draw = () => {
    const c = posterCanvas(fin);
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', `${PROMPT} ${fin.word}`);
    $('#posterSlot').replaceChildren(c);
  };
  Promise.all([document.fonts.load('150px "Bebas Neue"'), document.fonts.load('30px "Special Elite"')]).catch(() => {}).finally(draw);
}

function savePoster() {
  const c = $('#posterSlot canvas');
  if (!c) return;
  c.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `token-forge-${(state.final?.word || 'poster').toLowerCase()}.png`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, 'image/png');
}

// ══ INPUT ══
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'home') { e.preventDefault(); go('title'); return; }
  if (act === 'go') { go(b.dataset.to, +(b.dataset.round || 0)); return; }
  if (act === 'cut') {
    const k = b.dataset.key;
    state.cuts.has(k) ? state.cuts.delete(k) : state.cuts.add(k);
    state.msg = null;
    renderCut();
    $(`.slug[data-key="${k}"]`)?.focus();
  }
  if (act === 'cut-reset') { state.cuts.clear(); state.msg = null; renderCut(); }
  if (act === 'cut-stamp') stampCut();
  if (act === 'drop') {
    if (sum(state.drops) >= INK) {
      state.msg = T('Out of ink. <b>Wipe</b> to start over, or <b>Print</b>.', '墨倒完了。点<b>擦掉</b>重来，或者直接<b>开印</b>。');
    } else {
      state.drops[+b.dataset.i]++;
      state.msg = null;
    }
    const i = b.dataset.i;
    renderFocus();
    $(`.tok[data-i="${i}"]`)?.focus();
  }
  if (act === 'drop-wipe') { state.drops.fill(0); state.msg = null; renderFocus(); }
  if (act === 'drop-print') printFocus();
  if (act === 'pull') pull();
  if (act === 'save') savePoster();
});

go('title');
