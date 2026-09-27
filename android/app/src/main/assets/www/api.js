/* ═══════════════════════════════════════════════════════════════
   Barg — API client  (persianstories.sliplane.app)
   ---------------------------------------------------------------
   Wraps the PersianStories.API so app.js never touches fetch().
   Every call falls back to the bundled offline data when the
   network (or the key) is unavailable, so the app still works
   on a plane / in a tunnel / before the key is configured.

   Auth:  X-Api-Key header  (see /swagger/v1/swagger.json → ApiKey)
   Key resolution order:
     1. localStorage 'barg-apikey'   ← set from the in-app Auth screen
     2. the API_KEY constant below   ← hard-code here if you prefer
     3. (none) → app runs on offline data only
   ═══════════════════════════════════════════════════════════════ */

const BARGE_API = (() => {
  const BASE = 'https://persianstories.sliplane.app';

  // ── API key (shared with PersianStories.API server) ──────────
  // Generated securely; must match the key configured on the server.
  // Override at runtime via the in-app Auth screen (localStorage).
  const API_KEY = '8ORDqd17Vnw89TPjTkjfIuHjx0Wj0aI8q1IhEfztZnQ';

  const key = () =>
    (localStorage.getItem('barg-apikey') || API_KEY || '').trim();

  const headers = () => ({
    'Accept': 'application/json',
    ...(key() ? { 'X-Api-Key': key() } : {}),
  });

  // ── low-level GET with timeout + graceful failure ─────────────
  async function get(path, { timeout = 8000 } = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(BASE + path, { headers: headers(), signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  // ── tiny TTL cache so re-opening a story is instant ───────────
  const cache = new Map();
  async function cached(key, fn, ttl = 60_000) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < ttl) return hit.val;
    const val = await fn();
    cache.set(key, { val, at: Date.now() });
    return val;
  }

  return {
    ready: () => !!key(),
    setKey: k => {
      const v = (k || '').trim();
      if (v) localStorage.setItem('barg-apikey', v);
      else localStorage.removeItem('barg-apikey');
      cache.clear();
      return v;
    },
    getKey: key,

    /* ── Stories ─────────────────────────────────────────────── */
    // GET /api/Stories?search=&level=   → StoryDto[]
    listStories: (opts = {}) => {
      const q = new URLSearchParams();
      if (opts.search) q.set('search', opts.search);
      if (opts.level)  q.set('level', opts.level);
      const qs = q.toString();
      return cached('stories:' + qs, () => get('/api/Stories' + (qs ? '?' + qs : '')));
    },

    // GET /api/Stories/{id}             → StoryDto
    getStory: id => cached('story:' + id, () => get(`/api/Stories/${id}`)),

    // GET /api/Stories/{id}/text        → StoryTextDto  (lines[] → words[])
    getStoryText: id => cached('storytext:' + id, () => get(`/api/Stories/${id}/text`)),

    // POST /api/Stories                 → StoryDto   (CreateStoryDto)
    createStory: async body => {
      const res = await fetch(BASE + '/api/Stories', {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },

    /* ── Words ───────────────────────────────────────────────── */
    // GET /api/Words                    → WordDto[]
    listWords: () => cached('words', () => get('/api/Words'), 300_000),

    // GET /api/Words/{id}               → WordDto
    getWord: id => cached('word:' + id, () => get(`/api/Words/${id}`)),

    /* ── Users ───────────────────────────────────────────────── */
    // GET /api/Users                    → UserDto[]
    listUsers: () => cached('users', () => get('/api/Users'), 300_000),

    // GET /api/Users/{id}               → UserDto
    getUser: id => cached('user:' + id, () => get(`/api/Users/${id}`)),

    /* ── health ──────────────────────────────────────────────── */
    ping: () => get('/health', { timeout: 4000 }).then(() => true).catch(() => false),
  };
})();
