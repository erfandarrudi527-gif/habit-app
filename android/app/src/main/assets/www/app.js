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
  const cl = document.getElementById('chkLight'), cd = document.getElementById('chkDark');
  if (cl) { cl.classList.toggle('hidden', on); cd.classList.toggle('hidden', !on); }
}

// ── home hamburger menu: theme + level box ──
const hambBtn = document.getElementById('hambBtn');
const hambPop = document.getElementById('hambPop');
hambBtn.addEventListener('click', e => {
  e.stopPropagation();
  hambPop.classList.toggle('hidden');
});
document.addEventListener('click', e => {
  if (!hambPop.classList.contains('hidden') && !hambPop.contains(e.target)) hambPop.classList.add('hidden');
});
hambPop.querySelectorAll('[data-theme]').forEach(b =>
  b.addEventListener('click', () => setDark(b.dataset.theme === 'dark')));
const lvBox = document.getElementById('lvBox');
document.getElementById('hambLevelRow').addEventListener('click', e => {
  e.stopPropagation();
  lvBox.classList.toggle('hidden');
});
lvBox.querySelectorAll('.lv-opt').forEach(b => b.addEventListener('click', () => {
  setLevel(b.dataset.level);
  lvBox.querySelectorAll('.lv-opt').forEach(o => o.classList.toggle('sel', o === b));
  document.getElementById('hambLevelVal').textContent = b.dataset.level;
}));

// ── server connection (API key) ──────────────────────────────────────────
const apiBox = document.getElementById('apiBox');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiHint = document.getElementById('apiHint');
document.getElementById('hambApiRow').addEventListener('click', e => {
  e.stopPropagation();
  apiBox.classList.toggle('hidden');
});
function refreshApiBadge() {
  const on = BARGE_API.ready();
  document.getElementById('hambApiVal').textContent = on ? 'on' : 'off';
  if (on) apiKeyInput.value = BARGE_API.getKey();
}
document.getElementById('apiKeySave').addEventListener('click', async () => {
  const k = BARGE_API.setKey(apiKeyInput.value);
  if (!k) { apiHint.textContent = 'Key cleared — running on offline data.'; refreshApiBadge(); return; }
  apiHint.textContent = 'Testing…';
  const ok = await BARGE_API.ping();
  try {
    await BARGE_API.listStories({ level: state.level });
    apiHint.textContent = '✓ Connected — loading stories from the server.';
    refreshApiBadge();
    loadStories();
  } catch (err) {
    apiHint.textContent = `✗ Server said ${err.message} — check the key.`;
  }
});
refreshApiBadge();

// ─── navigation ───────────────────────────────────────────────────────────
function nav(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  if (id === 'scr-home') {
    document.getElementById('homeStat').textContent = `Level ${state.level} · ${savedWords().length} words saved`;
    document.getElementById('reviewDue').textContent = `${savedWords().length} due →`;
  }
}
document.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => nav(b.dataset.nav)));

// ── level onboarding shows ONCE (first launch only) ──
const onboarded = () => localStorage.getItem('barg-onboarded') === '1';
document.getElementById('getStarted').addEventListener('click', () =>
  nav(onboarded() ? 'scr-home' : 'scr-level'));
document.getElementById('levelGo').addEventListener('click', () => {
  localStorage.setItem('barg-onboarded', '1');
  nav('scr-home');
});

// ── back-press handling (native WebView calls bargBack()) ──
function showExitDialog() { document.getElementById('exitBackdrop').classList.remove('hidden'); }
function hideExitDialog() { document.getElementById('exitBackdrop').classList.add('hidden'); }
document.getElementById('exitNo').addEventListener('click', hideExitDialog);
document.getElementById('exitYes').addEventListener('click', () => { location.href = 'barg://exit'; });
function bargBack() {
  const active = document.querySelector('.screen.active');
  if (!active) return;
  if (!document.getElementById('exitBackdrop').classList.contains('hidden')) { hideExitDialog(); return; }
  if (popup.classList.contains('show')) { closePopup(); return; }
  if (active.id === 'scr-reading') { nav('scr-home'); return; }
  if (active.id === 'scr-review') { nav('scr-home'); return; }
  if (active.id === 'scr-level') { nav('scr-welcome'); return; }
  if (active.id === 'scr-home') { showExitDialog(); return; }
  location.href = 'barg://exit';   // welcome: leave straight away
}
window.bargBack = bargBack;

// ─── saved words (persistent) ─────────────────────────────────────────────
function savedWords() {
  try { return JSON.parse(localStorage.getItem('barg-words') || '[]'); }
  catch (e) { return []; }
}
function saveWord(item) {
  const list = savedWords();
  list.unshift(item);
  localStorage.setItem('barg-words', JSON.stringify(list));
}
const savedHas = w => savedWords().some(x => x.w === w);
function updateSaveCount() {
  const n = savedWords().length;
  document.getElementById('homeStat').textContent = `Level ${state.level} · ${n} words saved`;
  document.getElementById('reviewDue').textContent = `${n} due →`;
  document.getElementById('reviewCount').textContent = n;
}

// ─── review: Instagram-style card deck (swipe up for next card) ───────────
function renderDeck() {
  const words = savedWords();
  const deck = document.getElementById('cardDeck');
  document.getElementById('reviewCount').textContent = words.length;
  if (!words.length) {
    deck.innerHTML = `<div class="deck-empty">
      <p>No saved words yet.</p>
      <p>Tap any word while reading and press <b>Save to Words</b>.</p>
    </div>`;
    document.getElementById('deckHint').style.visibility = 'hidden';
    return;
  }
  document.getElementById('deckHint').style.visibility = 'visible';
  // show the top 3 so the next card peeks behind, like Stories
  deck.innerHTML = words.slice(0, 3).map((x, i) => `
    <div class="wcard" data-i="${i}" style="z-index:${10 - i};
         transform:translateY(${i * 14}px) scale(${1 - i * 0.04});
         opacity:${i === 0 ? 1 : 0.85}">
      <div class="wcard-top">
        <span class="wcard-idx">${words.length - i} / ${words.length}</span>
        <button class="wcard-del" data-del="${i}" title="Remove from saved">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.8 9.5h6.4L12 4M6.5 7v4M9.5 7v4"/></svg>
        </button>
      </div>
      <p class="wcard-word fa">${x.v || x.w}</p>
      <p class="wcard-tr">${x.tr}</p>
      <p class="wcard-gloss">${x.gl}</p>
      <p class="wcard-role">${ROLE[x.w] || ''}</p>
    </div>`).join('');
  bindSwipe();
  deck.querySelectorAll('.wcard-del').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    const i = +btn.dataset.del;
    const card = btn.closest('.wcard');
    card.classList.add('drop');                 // fly off to the side
    setTimeout(() => {
      const list = savedWords();
      list.splice(i, 1);                        // deck card i = saved list index i
      localStorage.setItem('barg-words', JSON.stringify(list));
      renderDeck(); updateSaveCount();
    }, 340);
  }));
}
function swipeNext() {
  const top = document.querySelector('#cardDeck .wcard[data-i="0"]');
  if (!top) return;
  top.classList.add('fly');
  setTimeout(() => {
    const list = savedWords();
    if (list.length > 1) { list.push(list.shift()); }   // rotate — nothing is deleted
    localStorage.setItem('barg-words', JSON.stringify(list));
    renderDeck();
  }, 320);
}
function bindSwipe() {
  const deck = document.getElementById('cardDeck');
  let y0 = null;
  const down = y => { y0 = y; };
  const up = y => {
    if (y0 !== null && y0 - y > 60) swipeNext();   // swipe up
    y0 = null;
  };
  deck.onmousedown = e => down(e.clientY);
  deck.onmouseup = e => up(e.clientY);
  deck.ontouchstart = e => down(e.touches[0].clientY);
  deck.ontouchend = e => up(e.changedTouches[0].clientY);
  deck.onclick = e => { if (e.target.closest('.wcard[data-i="0"]')) swipeNext(); };
}
document.getElementById('reviewOpen').addEventListener('click', () => {
  renderDeck(); nav('scr-review');
});

// ─── level (shared by picker + reading stepper) ───────────────────────────
function setLevel(l, opts = {}) {
  state.level = l;
  document.getElementById('lvNow').textContent = l;
  document.getElementById('homeStat').textContent = `Level ${l} · ${savedWords().length} words saved`;
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
  // playback spacing is fixed; the ▶ button is inert until the audio feature lands
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

// offline fallback list (used when the server is unreachable / no key yet)
const STORIES = [
  { t: 'داستانِ موشِ آهن‌خور', img: 'assets/mouse.png',  v: 'داستان موش آهن‌خور' },
  { t: 'گربه روزه دار',        img: 'assets/cat.png',    v: 'گربه روزه‌دار' },
  { t: 'روباه حیله گر',        img: 'assets/fox.png',    v: 'روباه حیله‌گر' },
  { t: 'شکارچی باهوش',         img: 'assets/hunter.png', v: 'شکارچی باهوش' },
];

// story list currently on screen (server list, or the offline fallback)
let storiesNow = STORIES;

const THUMBS = ['assets/mouse.png', 'assets/cat.png', 'assets/fox.png', 'assets/hunter.png'];
function renderStoryList(list) {
  storiesNow = list && list.length ? list : STORIES;
  document.getElementById('storyList').innerHTML = storiesNow.map((s, i) => `
    <button class="story-card" data-story="${i}">
      <span class="txt"><h3>${s.t}</h3><p>${s.snippet || SNIPPET} ...</p></span>
      <img class="story-thumb" src="${s.img || THUMBS[i % THUMBS.length]}" alt="${s.t}" loading="lazy">
    </button>`).join('');
  document.querySelectorAll('.story-card').forEach(c =>
    c.addEventListener('click', () => openReading(+c.dataset.story)));
}

// ── pull the story list from the API; keep the offline list on failure ──
async function loadStories() {
  if (!BARGE_API.ready()) { renderStoryList(STORIES); return; }
  try {
    const rows = await BARGE_API.listStories({ level: state.level });
    renderStoryList(rows.map((r, i) => ({
      id: r.id,
      t: r.titleFa,
      v: stripVowels(r.titleFa || r.titleEn || ''),
      tEn: r.titleEn,
      level: r.level,
      wordCount: r.wordCount,
      snippet: r.titleEn ? `(${r.titleEn})` : '',
      img: THUMBS[i % THUMBS.length],
    })));
  } catch (e) {
    console.warn('stories: falling back to offline list —', e.message);
    renderStoryList(STORIES);
  }
}
renderStoryList(STORIES);
loadStories();

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
  const s = storiesNow[idx] || storiesNow[0] || STORIES[0];
  titleEl.textContent = s.v || s.t;
  titleEnEl.textContent = s.tEn || STORY.titleEn;
  // show the bundled story immediately, then swap in the server text
  renderBody();
  nav('scr-reading');
  if (s.id && BARGE_API.ready()) loadReading(s.id);
}

// ── server version of the reading screen ────────────────────────────────
// StoryTextDto: { titleFa, titleEn, levelFa, levelEn,
//                  lines: [ { order, translationEn,
//                             words: [ { wordId, text, textWithHarakat,
//                                        ezafeSuffix, leadingPunctuation,
//                                        trailingPunctuation, partOfSpeech,
//                                        meaning } ] } ] }
let storyWords = {};   // bareText -> WordDto-ish info for the tap popup

function apiWordToRaw(w) {
  return `${w.leadingPunctuation || ''}${w.text || ''}${w.ezafeSuffix || ''}${w.trailingPunctuation || ''}`;
}

function renderServerBody(dto) {
  bodyEl.innerHTML = (dto.lines || []).map(line => {
    const parts = (line.words || []).map(w => {
      const raw = apiWordToRaw(w);
      const shown = state.vowels ? (w.textWithHarakat || w.text) : w.text;
      // remember this word's server-side grammar for the popup
      const bareKey = bare(shown || raw);
      storyWords[bareKey] = {
        meaning: w.meaning,
        partOfSpeech: w.partOfSpeech,
        translit: w.textWithHarakat ? stripVowels(w.text) : '',
        id: w.wordId,
      };
      const lead = w.leadingPunctuation || '';
      const tail = `${w.ezafeSuffix || ''}${w.trailingPunctuation || ''}`;
      return `${lead}<span class="word" data-w="${shown}">${shown}</span>${tail}`;
    }).join(' ');
    const en = line.translationEn
      ? `<span class="en-line">${line.translationEn}</span>` : '';
    return `<p class="pair">${parts}${en}</p>`;
  }).join('');
  bindWords();
}

async function loadReading(id) {
  try {
    const dto = await BARGE_API.getStoryText(id);
    titleEl.textContent = dto.titleFa || titleEl.textContent;
    titleEnEl.textContent = dto.titleEn || titleEnEl.textContent;
    renderServerBody(dto);
  } catch (e) {
    console.warn('reading: keeping bundled story —', e.message);
  }
}

// word tap → popup
const popup = document.getElementById('wordPopup');
const backdrop = document.getElementById('popupBackdrop');
let hlEl = null;
let popupBare = '', popupRaw = '';

// ── grammatical role of a word in its sentence ──
const ROLE = {
  'قدیم':'صفت (adjective) — describes زمان','زمان':'اسم (noun)','مرد':'اسم (noun)','تاجر':'اسم (noun)',
  'مقدار':'اسم (noun)','زیادی':'صفت (adjective) — modifies مقدار','آهن':'اسم (noun)',
  'خواست':'فعل (verb) — ماضی ساده','سفر':'اسم (noun)','دور':'قید (adverb)','آشنا':'صفت (adjective)',
  'گفت':'فعل (verb)','لطفاً':'قید (adverb)','پیش':'حرف اضافه (preposition)','تو':'ضمیر (pronoun)',
  'بماند':'فعل (verb) — مصدر + ب','بعد':'قید (adverb)','رفت':'فعل (verb)','مدتی':'اسم (noun)',
  'برگشت':'فعل (verb)','خانه':'اسم (noun)','امانت‌دار':'اسم (noun)','خود':'ضمیر (pronoun)',
  'بگیرد':'فعل (verb)','اما':'حرف ربط (conjunction)','خائن':'صفت (adjective)','دوست':'اسم (noun)',
  'داشت':'فعل (verb)','آن‌ها':'ضمیر (pronoun)','برای':'حرف اضافه (preposition)','می‌خواست':'فعل (verb) — استمراری',
  'ای':'حرف ندا (interjection)','موش':'اسم (noun)','آمد':'فعل (verb)','تمام':'صفت (adjective)',
  'سخت':'صفت (adjective)','خورد':'فعل (verb)','مردی':'اسم (noun)','باهوش':'صفت (adjective)',
  'فهمید':'فعل (verb)','حرف':'اسم (noun)','دروغ':'اسم (noun)','است':'فعل (verb) — اسنادی',
  'خواهد':'فعل کمکی (auxiliary)','اموال':'اسم (noun)','بدزدد':'فعل (verb)','چیزی':'ضمیر (pronoun)',
  'نگفت':'فعل (verb)','آرامش':'اسم (noun)','جواب':'اسم (noun)','داد':'فعل (verb)','بله':'حرف (particle)',
  'راست':'اسم (noun)','می‌گویی':'فعل (verb)','دندان‌های':'اسم (noun)','تیزی':'صفت (adjective)',
  'دارد':'فعل (verb)','می‌تواند':'فعل (verb)','هم':'قید (adverb)','بخورد':'فعل (verb)',
  'تعجب':'اسم (noun)','خوش‌حال':'صفت (adjective)','شد':'فعل (verb)','فردا':'قید (adverb)',
  'ناهار':'اسم (noun)','من':'ضمیر (pronoun)','بیا':'فعل (verb)','روز':'اسم (noun)',
  'وقتی':'حرف ربط (conjunction)','خیلی':'قید (adverb)','ناراحت':'صفت (adjective)','فریاد':'اسم (noun)',
  'زد':'فعل (verb)','پسر':'اسم (noun)','کوچک':'صفت (adjective)','گم':'اسم (noun)','شده':'فعل (verb)',
  'پیدا':'اسم (noun)','نمی‌کنم':'فعل (verb)','امروز':'قید (adverb)','پرنده':'اسم (noun)',
  'بزرگ':'صفت (adjective)','شاهین':'اسم (noun)','دیدم':'فعل (verb)','آسمان':'اسم (noun)',
  'پسرت':'اسم + ضمیر (your son)','چنگال‌هایش':'اسم (noun)','گرفت':'فعل (verb)',
  'با':'حرف اضافه (preposition)','برد':'فعل (verb)','عصبانی':'صفت (adjective)','چطور':'قید (adverb)',
  'پسری':'اسم (noun)','ببرد':'فعل (verb)','غیرممکن':'صفت (adjective)','لبخند':'اسم (noun)',
  'چرا':'قید (adverb)','می‌کنی':'فعل (verb)','در':'حرف اضافه (preposition)','شهری':'اسم (noun)',
  'که':'حرف ربط (conjunction)','بتواند':'فعل (verb)','قبول':'اسم (noun)','کرد':'فعل (verb)',
  'پدرش':'اسم + ضمیر (his father)','پس':'قید (adverb)','اشتباه':'اسم (noun)','سالم':'صفت (adjective)',
  'هستند':'فعل (verb)','مکر':'اسم (noun)','فهمیده':'فعل (verb)',
};

function bindWords() {
  bodyEl.querySelectorAll('.word').forEach(w => w.addEventListener('click', () => {
    const raw = w.dataset.w;
    const b = bare(raw);
    const [tr = '—', gl = 'no entry yet'] = LEXICON[b] || [];
    if (hlEl) hlEl.classList.remove('hl');
    hlEl = w; w.classList.add('hl');
    popupBare = b; popupRaw = raw;
    document.getElementById('popupWord').textContent = raw;
    document.getElementById('popupTranslit').textContent = `${b} | ${tr}`;
    document.getElementById('popupGloss').textContent = gl;
    document.getElementById('popupGrammar').classList.add('hidden');
    const save = document.getElementById('popupSave');
    const has = savedHas(b);
    save.textContent = has ? 'Saved ✓' : 'Save to Words';
    save.classList.toggle('saved', has);
    popup.classList.add('show'); backdrop.classList.remove('hidden');
  }));
}
document.getElementById('popupGrammarBtn').addEventListener('click', e => {
  const gr = document.getElementById('popupGrammar');
  const btn = e.currentTarget;
  if (!gr.classList.contains('hidden')) {            // toggle off
    gr.classList.add('hidden');
    btn.textContent = 'Grammar';
    return;
  }
  const b = popupBare, raw = popupRaw;
  const role = ROLE[b] || 'کلمه‌ای در این جمله — a word used in this sentence';
  const [tr = ''] = LEXICON[b] || [];
  gr.innerHTML =
    `<b class="fa">${stripVowels(raw)}</b> — نقش در جمله:<br>` +
    `<span class="g-role">${role}</span>` +
    (tr ? `<br><span class="g-tr">تلفظ: ${tr}</span>` : '');
  gr.classList.remove('hidden');
  btn.textContent = 'Hide';                          // toggle on
});
function closePopup() {
  popup.classList.remove('show'); backdrop.classList.add('hidden');
  if (hlEl) { hlEl.classList.remove('hl'); hlEl = null; }
}
document.getElementById('popupClose').addEventListener('click', closePopup);
backdrop.addEventListener('click', closePopup);
document.getElementById('popupSave').addEventListener('click', e => {
  const b = popupBare, raw = popupRaw;
  const [tr = '—', gl = 'no entry yet'] = LEXICON[b] || [];
  const btn = e.target;
  if (savedHas(b)) {                                 // already saved → remove it
    const list = savedWords().filter(x => x.w !== b);
    localStorage.setItem('barg-words', JSON.stringify(list));
    btn.textContent = 'Save to Words'; btn.classList.remove('saved');
  } else {                                           // save it
    saveWord({ w: b, v: raw, tr, gl, ts: Date.now() });
    btn.textContent = 'Saved ✓'; btn.classList.add('saved');
  }
  updateSaveCount();
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
// ▶ play/speed button — fully inert for now (does nothing at all)
btnS.onclick = null;
btnS.style.pointerEvents = 'none';
btnS.classList.add('inert-btn');
btnS.title = 'Coming soon';

// ── three-dot options menu (mirrors the control bar) ──
const menuBtn = document.getElementById('menuBtn');
const menuPop = document.getElementById('menuPop');
function syncMenu() {
  const t = document.getElementById('miTranslate'), v = document.getElementById('miVowels');
  t.textContent = state.translate ? 'on' : 'off'; t.classList.toggle('on', state.translate);
  v.textContent = state.vowels ? 'on' : 'off'; v.classList.toggle('on', state.vowels);
  document.getElementById('miSpeed').textContent = state.speed.toFixed(1) + '×';
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

// ── boot ──
setDark(state.dark);
if (onboarded()) nav('scr-home');   // welcome screen shows once, ever
