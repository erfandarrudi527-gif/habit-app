/* ═══════════ Barg — app logic ═══════════
   Flow: Welcome → Level → Home → Reading
   Reading features (from the Figma UI kit + user requests):
   · Vowels toggle  — plain ↔ fully diacritized (َ ُ ِ sukun) text
   · Translate toggle — the English of EACH SENTENCE sits directly under
     that Persian sentence (fa on top, en below — no hunting for meanings)
   · Tap a word → popup with transliteration, gloss, audio, harakat editor,
     Save to Words
   · Level stepper (− A1…C1 +) — raises/lowers difficulty live: font size,
     line-height and default vowel state follow the level
   · Playback-speed cycle + live reading progress bar                    */

// ─── story data: paragraphs → sentence pairs (fa = voweled source, en = its translation)
const STORY = {
  title: 'داستان موش آهن‌خور',
  titleEn: 'The Story of the Iron-Eating Mouse',
  paragraphs: [
    [
      { fa: 'دَر زَمان‌هایِ قَدیم، یِک مَردِ تاجِر بود.', en: 'In ancient times, there was a merchant.' },
      { fa: 'او مِقدارِ زیادی آهَن داشت.', en: 'He owned a large amount of iron.' },
      { fa: 'تاجِر خواست بِه یِک سَفَرِ دور بِرَوَد.', en: 'The merchant wanted to go on a distant journey.' },
      { fa: 'او آهَن‌ها را بِه یِک مَردِ آشنا داد و گُفت: «لُطفاً این آهَن‌ها پیشِ تُو بمانَد.»', en: 'He handed the iron over to an acquaintance and said, "Please keep this iron safe for me."' },
      { fa: 'بَعد تاجِر بِه سَفَر رَفْت.', en: 'Then the merchant set off on his journey.' },
    ],
    [
      { fa: 'بَعد اَز مُدَتی، تاجِر اَز سَفَر بَرگَشت.', en: 'After some time, the merchant returned.' },
      { fa: 'او بِه خانه‌یِ مَردِ اَمانَت‌دار رَفْت تا آهَن‌هایِ خود را بِگیرد.', en: 'He went to the trustee\'s house to reclaim his iron.' },
      { fa: 'اَمّا مَردِ خائِن آهَن‌ها را دوست داشت و آن‌ها را برایِ خُودَش می‌خواست.', en: 'However, the traitorous man had grown fond of the iron and wanted it for himself.' },
      { fa: 'مَرد گُفت: «ای تاجِر، موشِ خانه‌یِ ما آمَد و تَمامِ آهَن‌هایِ سَختِ تُو را خُورد!»', en: 'The man said, "O merchant, a mouse came into our house and ate all of your hard iron!"' },
    ],
    [
      { fa: 'تاجِر مَردی باهوش بود.', en: 'The merchant was a clever man.' },
      { fa: 'او فَهمید که این حَرف دُروغ است و مَرد می‌خواهد اَموالِ او را بِدُزدَد.', en: 'He realized this was a lie and that the man intended to steal his property.' },
      { fa: 'اَمّا تاجِر چیزی نَگُفت و با آرامِش جَواب داد: «بَله، راست می‌گویی! موش دَندان‌هایِ تیزی دارَد و می‌تَوانَد آهَن را هم بِخُورَد.»', en: 'But the merchant said nothing and calmly replied, "Yes, you speak the truth! A mouse has sharp teeth and can indeed eat iron."' },
      { fa: 'مَردِ خائِن اَز حَرفِ تاجِر تَعَجُّب کَرد و خوش‌حال شُد.', en: 'The traitorous man was surprised by the merchant\'s response and felt relieved.' },
      { fa: 'بَعد تاجِر بِه مَرد گُفت: «فَردا برایِ ناهار بِه خانه‌یِ مَن بیا.»', en: 'Then the merchant said to him, "Come to my house for lunch tomorrow."' },
    ],
    [
      { fa: 'روزِ بَعد، وَقتی مَردِ خائِن بِه خانه‌یِ تاجِر آمَد، خِیلی ناراحَت بود.', en: 'The next day, when the traitorous man arrived at the merchant\'s house, he was deeply distressed.' },
      { fa: 'او فَرْیاد زَد: «پِسَرِ کوچکِ مَن گُم شُده اَست! او را پِیدا نِمی‌کُنَم.»', en: 'He cried out, "My young son is missing! I cannot find him anywhere."' },
    ],
    [
      { fa: 'تاجِر با آرامِش گُفت: «اِمروز مَن یِک پَرنده‌یِ بُزُرگ (شاهین) را دیدَم. آن پَرَنده اَز آسمان آمَد، پِسَرَت را با چَنگال‌هایِش گِرِفت و با خود بِه آسمان بُرد!»', en: 'The merchant calmly said, "Today I saw a large bird (a falcon). That bird swooped down from the sky, grabbed your son with its talons, and carried him up into the heavens!"' },
    ],
    [
      { fa: 'مَردِ خائِن عَصَبانی شُد و گُفت: «تُو دُروغ می‌گویی! چِطور یِک پَرنده می‌تَوانَد پِسَری بِه این بُزُرگی را بِبَرَد؟ این غَیْرِمُمکِن اَست!»', en: 'The traitorous man grew angry and said, "You are lying! How could a bird carry away a boy of that size? That is impossible!"' },
    ],
    [
      { fa: 'تاجِر لَبخَند زَد و گُفت: «چِرا تَعَجُّب می‌کُنی؟ دَر شَهری که یِک موش بِتَوانَد آهَن را بِخُورَد، یِک پَرنده هم می‌تَوانَد پِسَرَت را بِبَرَد!»', en: 'The merchant smiled and said, "Why are you surprised? In a city where a mouse can eat iron, a bird can certainly carry off your son!"' },
    ],
    [
      { fa: 'مَردِ خائِن خِیلی شَرمَنده شُد.', en: 'The traitorous man became thoroughly ashamed.' },
      { fa: 'او فَهمید که تاجِر مَکْرِ او را فَهمیده اَست.', en: 'He realized the merchant had seen through his deception.' },
      { fa: 'مَرد گُفت: «مَن اِشْتِباه کَردم. مَن بِه تُو دُروغ گُفتَم. آهَن‌هایِ تُو سالِم هَسْتَند. مَن آهَن‌ها را پَس می‌دَهَم، تُو لُطفاً پِسَرَم را بِه مَن بِدِه.»', en: 'The man said, "I made a mistake. I lied to you. Your iron is safe and intact. I will return your iron, please give me back my son."' },
    ],
    [
      { fa: 'تاجِر قَبول کَرد.', en: 'The merchant agreed.' },
      { fa: 'او آهَن‌ها را گِرِفت و پِسَر را بِه پِدَرِش پَس داد.', en: 'He took back his iron and returned the boy to his father.' },
    ],
  ],
};

// strip harakat (Arabic diacritics) → the design's "vowels OFF" rendering
const DIACRITICS = /[\u064B-\u0652\u0670\u06D6-\u06ED]/g;
const stripVowels = s => s.replace(DIACRITICS, '');

// mini lexicon for the tap-a-word popup (key = bare form, vowels removed)
const LEXICON = {
  'قدیم':   ['qadim',   'ancient'],   'زمان':    ['zaman',    'time'],
  'مرد':    ['mard',    'man'],       'تاجر':    ['tajer',    'merchant'],
  'مقدار':  ['meghdar', 'amount'],    'زیادی':   ['ziyad',    'much, a lot'],
  'آهن':    ['ahan',    'iron'],      'خواست':   ['khast',    'wanted'],
  'سفر':    ['safar',   'journey'],   'دور':     ['dur',      'far'],
  'آشنا':   ['ashna',   'acquainted'], 'گفت':    ['goft',     'said'],
  'لطفاً':  ['lotfan',  'please'],    'پیش':     ['pish',     'with, beside'],
  'تو':     ['to',      'you'],       'بماند':   ['bemanad',  'to stay'],
  'بعد':    ['ba\'d',   'after'],     'رفت':     ['raft',     'went'],
  'مدتی':   ['muddati', 'a while'],   'برگشت':   ['bargasht', 'returned'],
  'خانه':   ['khane',   'house'],     'امانت‌دار': ['amanatdar','trustee'],
  'خود':    ['khod',    'self'],      'بگیرد':   ['begirad',  'to take'],
  'اما':    ['amma',    'but'],       'خائن':    ['kha\'en',  'traitor'],
  'دوست':   ['dust',    'friend, fond'], 'داشت':  ['dasht',    'had'],
  'آن‌ها':  ['anha',    'those'],     'برای':    ['baraye',   'for'],
  'می‌خواست': ['mikhast','wanted'],   'ای':      ['ey',       'O'],
  'موش':    ['mush',    'mouse'],     'آمد':     ['amad',     'came'],
  'تمام':   ['tamam',   'all'],       'سخت':     ['sakht',    'hard'],
  'خورد':   ['khord',   'ate'],       'مردی':    ['mardi',    'a man'],
  'باهوش':  ['bahush',  'clever'],    'فهمید':   ['fahmid',   'realized'],
  'حرف':    ['harf',    'word, talk'],'دروغ':    ['dorugh',   'lie'],
  'است':    ['ast',     'is'],        'خواهد':   ['khahad',   'will'],
  'اموال':  ['amval',   'property'],  'بدزدد':   ['bedozdad', 'to steal'],
  'چیزی':   ['chizi',   'anything'],  'نگفت':    ['nagoft',   'did not say'],
  'آرامش':  ['aramesh', 'calm'],      'جواب':    ['javab',    'answer'],
  'داد':    ['dad',     'gave'],      'بله':     ['bale',     'yes'],
  'راست':   ['rast',    'truth'],     'می‌گویی': ['migooyi',  'you say'],
  'دندان‌های': ['dandanha','teeth'],  'تیزی':    ['tizi',     'sharp'],
  'دارد':   ['darad',   'has'],       'می‌تواند':['mitavanad','can'],
  'هم':     ['ham',     'also'],      'بخورد':   ['bikhord',  'to eat'],
  'تعجب':   ['ta\'ajjob','surprise'], 'خوش‌حال': ['khoshhal', 'pleased'],
  'شد':     ['shod',    'became'],    'فردا':    ['farda',    'tomorrow'],
  'ناهار':  ['nahar',   'lunch'],     'من':      ['man',      'I, my'],
  'بیا':    ['bia',     'come'],      'روز':     ['ruz',      'day'],
  'وقتی':   ['vaqti',   'when'],      'خیلی':    ['khiyali',  'very'],
  'ناراحت': ['narahat', 'upset'],     'فریاد':   ['faryad',   'shout'],
  'زد':     ['zad',     'struck, did'], 'پسر':   ['pesar',    'boy'],
  'کوچک':   ['kuchek',  'small'],     'گم':      ['gam',      'lost'],
  'شده':    ['shode',   'become'],    'پیدا':    ['peyda',    'found'],
  'نمی‌کنم':['nemikonam','I do not'],  'امروز':   ['emruz',    'today'],
  'پرنده':  ['parande', 'bird'],      'بزرگ':    ['bozorg',   'big'],
  'شاهین':  ['shahin',  'falcon'],    'دیدم':    ['didam',    'I saw'],
  'آسمان':  ['aseman',  'sky'],       'پسرت':    ['pesarat',  'your son'],
  'چنگال‌هایش': ['changalha','with its talons'], 'گرفت': ['gereft','grabbed'],
  'با':     ['ba',      'with'],      'برد':     ['bord',     'took away'],
  'عصبانی': ['asabani', 'angry'],     'چطور':    ['chetor',   'how'],
  'پسری':   ['pesari',  'a boy'],     'ببرد':    ['bebord',   'to carry off'],
  'غیرممکن':['gheyremomken','impossible'], 'لبخند':['labkhand','smile'],
  'چرا':    ['chera',   'why'],       'می‌کنی':  ['mikonai',  'you do'],
  'در':     ['dar',     'in'],        'شهری':    ['shahri',   'a city'],
  'که':     ['ke',      'that'],      'بتواند':  ['betavanad','can'],
  'قبول':   ['qabul',   'agreed'],    'کرد':     ['kard',     'did'],
  'پدرش':   ['pedarash', 'his father'],'پس':     ['pas',      'back'],
  'اشتباه': ['eshtebah','mistake'],   'سالم':    ['salem',    'intact'],
  'هستند':  ['hastand', 'are'],       'مکر':     ['makr',     'scheme'],
  'فهمیده': ['fahmide', 'understood'],
};

// ─── state ────────────────────────────────────────────────────────────────
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
// per-level reading defaults: vowels start on for beginners only.
// NOTE: level = the reader's ability, NOT text size — font stays constant.
const LV = {
  A1: { vowels: true  },
  A2: { vowels: true  },
  B1: { vowels: false },
  B2: { vowels: false },
  C1: { vowels: false },
};
const state = { level: 'B1', vowels: false, translate: false, speed: 1.0, saved: 62, dark: false };
const edits = {};   // bare form -> harakat string edited by the learner

// ── dark mode ──
function setDark(on) {
  state.dark = on;
  document.body.classList.toggle('dark', on);
}
document.getElementById('themeHome').addEventListener('click', () => setDark(!state.dark));

// ─── navigation ───────────────────────────────────────────────────────────
function nav(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  if (id === 'scr-home') {
    document.getElementById('homeStat').textContent = `Level ${state.level} · ${state.saved} words saved`;
  }
}
document.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => nav(b.dataset.nav)));

// ─── level (shared by picker + reading stepper) ───────────────────────────
function setLevel(l, opts = {}) {
  state.level = l;
  document.getElementById('lvNow').textContent = l;
  document.getElementById('homeStat').textContent = `Level ${l} · ${state.saved} words saved`;
  // sync the onboarding picker
  document.querySelectorAll('.level-card').forEach(c => {
    const on = c.dataset.level === l;
    c.classList.toggle('selected', on);
    c.querySelector('.lv-check')?.remove();
    if (on) c.insertAdjacentHTML('beforeend', CHECK_SVG);
  });
  // difficulty follows the level: bigger text + vowels for beginners
  if (opts.applyDefaults) {
    state.vowels = LV[l].vowels;
    btnV.classList.toggle('on', state.vowels);
    if (document.getElementById('scr-reading').classList.contains('active')) renderBody();
  }
  applyTypeScale();
}
function applyTypeScale() {
  // font size is fixed (18px from CSS); only playback speed affects line-height
  bodyEl.style.lineHeight = (41.8 / state.speed).toFixed(1) + 'px';
  // pulse the stepper code so the change is visible
  const now = document.getElementById('lvNow');
  now.classList.remove('bump'); void now.offsetWidth; now.classList.add('bump');
}
document.getElementById('lvUp').addEventListener('click', () => {
  const i = LEVELS.indexOf(state.level);
  if (i < LEVELS.length - 1) setLevel(LEVELS[i + 1], { applyDefaults: true });
});
document.getElementById('lvDown').addEventListener('click', () => {
  const i = LEVELS.indexOf(state.level);
  if (i > 0) setLevel(LEVELS[i - 1], { applyDefaults: true });
});

// ─── level picker (onboarding) ────────────────────────────────────────────
const CHECK_SVG = '<svg class="lv-check" viewBox="0 0 12 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5l3.5 3.5L11 1"/></svg>';
document.querySelectorAll('.level-card').forEach(card => {
  card.addEventListener('click', () => setLevel(card.dataset.level));
});

// ─── home story cards ─────────────────────────────────────────────────────
const SNIPPET = stripVowels(STORY.paragraphs[0].map(s => s.fa).join(' '));
const STORIES = [
  { t: 'داستانِ موشِ آهن‌خور', img: 'assets/mouse.png',  v: 'داستان موش آهن‌خور' },
  { t: 'گربه روزه دار',        img: 'assets/cat.png',    v: 'گربه روزه‌دار' },
  { t: 'روباه حیله گر',        img: 'assets/fox.png',    v: 'روباه حیله‌گر' },
  { t: 'شکارچی باهوش',         img: 'assets/hunter.png', v: 'شکارچی باهوش' },
];
document.getElementById('storyList').innerHTML = STORIES.map((s, i) => `
  <button class="story-card" data-story="${i}">
    <span class="txt"><h3>${s.t}</h3><p>${SNIPPET} ...</p></span>
    <img class="story-thumb" src="${s.img}" alt="${s.t}" loading="lazy">
  </button>`).join('');
document.querySelectorAll('.story-card').forEach(c => c.addEventListener('click', () => openReading(+c.dataset.story)));

// ─── reading screen ───────────────────────────────────────────────────────
const bodyEl = document.getElementById('storyBody');
const titleEl = document.getElementById('storyTitle');
const titleEnEl = document.getElementById('storyTitleEn');

function bare(word) {
  return stripVowels(word).replace(/[،.:!?«»()\u200c]/g, '').trim();
}
function wordSpan(raw) {
  return `<span class="word" data-w="${raw}">${raw}</span>`;
}
// one Persian sentence on top, its English directly underneath
function renderBody() {
  bodyEl.innerHTML = STORY.paragraphs.map(par => par.map(s => {
    let text = state.vowels ? s.fa : stripVowels(s.fa);
    // re-apply any harakat the learner added manually (bare-text path)
    if (!state.vowels) Object.entries(edits).forEach(([b, str]) => {
      text = text.replace(new RegExp('(?<=^|[\\s\\u200c])' + b + '(?=$|[\\s\\u200c،.:!?»«()])', 'g'), str);
    });
    return `<p class="pair">${text.split(/\s+/).map(wordSpan).join(' ')}
      <span class="en-line">${s.en}</span>
    </p>`;
  }).join('')).join('');
  applyTypeScale();
  bindWords();
}
function openReading(idx = 0) {
  const s = STORIES[idx] || STORIES[0];
  titleEl.textContent = s.v;
  titleEnEl.textContent = STORY.titleEn;
  const img = document.getElementById('storyHero');
  img.src = s.img; img.alt = s.t;
  renderBody();
  nav('scr-reading');
}

// word tap → popup
const popup = document.getElementById('wordPopup');
const backdrop = document.getElementById('popupBackdrop');
let hlEl = null;

// ── harakat editor state ──
const MARKS = ['\u064E','\u064F','\u0650','\u0652'];           // fatha zamma kasra sukun
let popupChars = [];                                           // [{base, marks:[]}]
let popupSel = null;                                           // selected letter index
let popupWordEl = null;                                        // the .word span in the body

function parseWord(raw) {
  const chars = [];
  for (const ch of raw) {
    if (MARKS.includes(ch) || '\u064B\u064C\u064D'.includes(ch)) {
      if (chars.length) chars[chars.length - 1].marks.push(ch);
    } else chars.push({ base: ch, marks: [] });
  }
  return chars;
}
const rebuild = chars => chars.map(c => c.base + c.marks.join('')).join('');

function renderPopupWord() {
  const el = document.getElementById('popupWord');
  el.innerHTML = '';
  popupChars.forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'pchar' + (i === popupSel ? ' sel' : '');
    s.textContent = c.base + c.marks.join('');
    s.addEventListener('click', () => { popupSel = i; renderPopupWord(); });
    el.appendChild(s);
  });
}
function commitPopupWord() {
  const str = rebuild(popupChars);
  const b = bare(str) || bare(popupWordEl.dataset.w);
  edits[b] = str;
  if (popupWordEl) { popupWordEl.textContent = str; popupWordEl.dataset.w = str; }
  document.getElementById('popupTranslit').textContent =
    `${b} | ${(LEXICON[b] || ['—','no entry yet'])[0]}`;
}
document.querySelectorAll('#popupMarks .mark').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!popupChars.length) return;
    if (popupSel === null) popupSel = popupChars.length - 1;   // default: last letter
    const c = popupChars[popupSel];
    const m = btn.dataset.mark;
    if (m === 'clear') c.marks = [];
    else if (c.marks.includes(m)) c.marks = c.marks.filter(x => x !== m);
    else { c.marks = c.marks.filter(x => !MARKS.includes(x)); c.marks.push(m); }
    renderPopupWord(); commitPopupWord();
  });
});

function bindWords() {
  bodyEl.querySelectorAll('.word').forEach(w => w.addEventListener('click', () => {
    const raw = w.dataset.w;
    const b = bare(raw);
    const [tr = '—', gl = 'no entry yet'] = LEXICON[b] || [];
    if (hlEl) hlEl.classList.remove('hl');
    hlEl = w; w.classList.add('hl');
    popupWordEl = w;
    popupChars = parseWord(raw);
    popupSel = null;
    renderPopupWord();
    document.getElementById('popupTranslit').textContent = `${b} | ${tr}`;
    document.getElementById('popupGloss').textContent = gl;
    const save = document.getElementById('popupSave');
    save.textContent = 'Save to Words'; save.classList.remove('saved');
    popup.classList.add('show'); backdrop.classList.remove('hidden');
  }));
}
function closePopup() {
  popup.classList.remove('show'); backdrop.classList.add('hidden');
  if (hlEl) { hlEl.classList.remove('hl'); hlEl = null; }
}
document.getElementById('popupClose').addEventListener('click', closePopup);
backdrop.addEventListener('click', closePopup);
document.getElementById('popupSave').addEventListener('click', e => {
  state.saved += 1;
  document.getElementById('homeStat').textContent = `Level ${state.level} · ${state.saved} words saved`;
  e.target.textContent = 'Saved ✓'; e.target.classList.add('saved');
});
document.getElementById('popupAudio').addEventListener('click', () => {
  const w = document.getElementById('popupWord').textContent;
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(w); u.lang = 'fa-IR'; u.rate = 0.85;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
});

// control bar
const btnV = document.getElementById('btnVowels');
const btnT = document.getElementById('btnTranslate');
const btnS = document.getElementById('btnSpeed');
btnV.addEventListener('click', () => {
  state.vowels = !state.vowels;
  btnV.classList.toggle('on', state.vowels);
  closePopup(); renderBody();
});
btnT.addEventListener('click', () => {
  state.translate = !state.translate;
  btnT.classList.toggle('on', state.translate);
  bodyEl.classList.toggle('translating', state.translate);
  titleEnEl.classList.toggle('show', state.translate);
});
const SPEEDS = [1.0, 0.75, 1.5];
btnS.addEventListener('click', () => {
  state.speed = SPEEDS[(SPEEDS.indexOf(state.speed) + 1) % SPEEDS.length];
  document.getElementById('speedLabel').textContent = state.speed.toFixed(1) + '×';
  applyTypeScale();
});

// ── three-dot options menu (mirrors the control bar) ──
const menuBtn = document.getElementById('menuBtn');
const menuPop = document.getElementById('menuPop');
function syncMenu() {
  const t = document.getElementById('miTranslate'), v = document.getElementById('miVowels');
  t.textContent = state.translate ? 'on' : 'off'; t.classList.toggle('on', state.translate);
  v.textContent = state.vowels ? 'on' : 'off'; v.classList.toggle('on', state.vowels);
  document.getElementById('miSpeed').textContent = state.speed.toFixed(1) + '×';
  const th = document.getElementById('miTheme');
  th.textContent = state.dark ? 'on' : 'off'; th.classList.toggle('on', state.dark);
}
menuBtn.addEventListener('click', e => {
  e.stopPropagation();
  syncMenu();
  menuPop.classList.toggle('hidden');
});
document.addEventListener('click', e => {
  if (!menuPop.classList.contains('hidden') && !menuPop.contains(e.target)) menuPop.classList.add('hidden');
});
menuPop.querySelectorAll('.menu-item').forEach(item => item.addEventListener('click', () => {
  switch (item.dataset.act) {
    case 'translate': btnT.click(); break;
    case 'vowels':    btnV.click(); break;
    case 'speed':     btnS.click(); break;
    case 'theme':     setDark(!state.dark); break;
    case 'home':      nav('scr-home'); break;
  }
  syncMenu();
}));

// progress bar follows reading scroll
const scroller = document.getElementById('readingScroll');
scroller.addEventListener('scroll', () => {
  const max = scroller.scrollHeight - scroller.clientHeight;
  document.getElementById('progressFill').style.width =
    (max > 0 ? (scroller.scrollTop / max) * 100 : 0).toFixed(1) + '%';
});
