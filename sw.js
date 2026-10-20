/*
 * Listen to Frank — service worker
 *
 * Purpose: keep the app and all its audio playable on a flaky museum
 * connection. Strategy:
 *   1. On install, cache the app shell (HTML, JSON, icons, manifest).
 *   2. On activate, claim clients and kick off a background download of every
 *      MP3 listed in artworks.json. Progress is reported back to the page.
 *   3. On fetch, audio requests are served from cache. Range requests
 *      (which iOS Safari uses for <audio> elements) are answered from the
 *      cached full file with a proper 206 Partial Content response, since
 *      iOS will refuse to play a cached MP3 that doesn't honor Range.
 */

const CACHE_VERSION = 'frank-v421';
// The audio cache is deliberately NOT tied to CACHE_VERSION. mp3s never change
// content under one filename except when a take is re-recorded — so ordinary
// deploys must not throw away ~340MB of cached audio on every phone. Bump
// AUDIO_VERSION ONLY when an existing mp3 is replaced in place (doctor.py
// --live checks this for you); bump CACHE_VERSION on every deploy as always.
const AUDIO_VERSION = 'frank-audio-v219';
const SHELL_CACHE = CACHE_VERSION + '-shell';
const AUDIO_CACHE = AUDIO_VERSION;
const VENDOR_CACHE = CACHE_VERSION + '-vendor';

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/artworks.json',
  '/icon-192.png',
  '/icon-512.png',
  '/kawaracaps.otf',
  '/entry/manifest.json',
  '/drawings/manifest.json',
  // entry-cover drawings (the first thing every visitor sees — keep offline)
  '/drawings/dance-i-henri-matisse-1909_line.png',
  '/drawings/gold-marilyn-monroe_andy-warhol_1962.png',
  '/drawings/flag_jasper-johns_1954-55.png',
  '/drawings-cover/guitar_pablo-picasso_1914.png',
  // percent-encoded NFD ("e" + combining accent) to byte-match the repo
  // filename — GitHub Pages is unicode-normalization-sensitive
  '/drawings/le-voyage-dans-la-lune_georges-me%CC%81lie%CC%80s_1902.png',
  // (desktop margin drawings are NOT pre-cached since 2026-10-13: phones
  // never show them, and the museum visit is a phone visit)
];

// v3 is plain vanilla JS — no external libraries needed. (Previously this
// pre-cached the React CDN; removed.)
const VENDOR_URLS = [];

// ---------------- install ----------------
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shellCache = await caches.open(SHELL_CACHE);
    // addAll is atomic — if any URL 404s the install would fail, so we add
    // them individually and ignore stragglers.
    await Promise.all(SHELL_URLS.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res && res.ok) await shellCache.put(url, res.clone());
      } catch (e) { /* ignore — the page can still boot */ }
    }));
    // Pre-cache cross-origin vendor libraries (React, ReactDOM). Must use
    // CORS mode and tolerate failure (firewall could block these).
    const vendorCache = await caches.open(VENDOR_CACHE);
    await Promise.all(VENDOR_URLS.map(async (url) => {
      try {
        const req = new Request(url, { mode: 'cors', credentials: 'omit' });
        const res = await fetch(req);
        if (res && res.ok) await vendorCache.put(req, res.clone());
      } catch (e) { /* ignore */ }
    }));
  })());
  // NOTE: no skipWaiting() here — the new worker WAITS until the page's
  // update toast posts {type:'skip-waiting'}, so we never yank a running
  // session (or its audio) out from under the visitor.
});

// ---------------- activate ----------------
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Delete caches from older versions — but keep the audio cache, which has
    // its own lifecycle (see AUDIO_VERSION above).
    const keep = [SHELL_CACHE, AUDIO_CACHE, VENDOR_CACHE];
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => keep.indexOf(n) === -1)
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
    // Don't await this — let it run in the background. (Since 2026-10-13 this
    // only TIDIES the audio cache; it no longer downloads the whole library.)
    tidyAudioCache();
  })());
});

// ---------------- audio cache ----------------
// Until 2026-10-13 cacheAllAudio() downloaded EVERY mp3 (~385 MB) on a
// visitor's first visit — on museum cellular that's their data plan. Now:
//   * a work is cached when it's played (handleAudio, below);
//   * once a listen starts, the page asks for the rest of that gallery's audio
//     ('prefetch-audio'), fetched one file at a time in the background;
//   * on activate we only evict audio of retired works.
// Visitors who already have the full library keep it.
async function tidyAudioCache() {
  try {
    const res = await fetch('/artworks.json', { cache: 'reload' });
    if (!res || !res.ok) return;
    const artworks = await res.json();
    const wanted = {};
    artworks.forEach((a) => { if (a && a.audioUrl) wanted['/' + a.audioUrl.replace(/^\/+/, '')] = true; });
    const cache = await caches.open(AUDIO_CACHE);
    for (const req of await cache.keys()) {
      if (!wanted[new URL(req.url).pathname]) await cache.delete(req);
    }
  } catch (e) { /* offline — try again next activation */ }
}

let prefetchQueue = Promise.resolve();
function prefetchAudio(urls) {
  prefetchQueue = prefetchQueue.then(async () => {
    const cache = await caches.open(AUDIO_CACHE);
    for (const raw of urls || []) {
      try {
        const url = new URL(raw, self.location.origin);
        if (url.origin !== self.location.origin || !url.pathname.startsWith('/audio/')) continue;
        if (await cache.match(url.pathname)) continue;
        const res = await fetch(url.pathname);
        if (res && res.ok && res.status === 200) await cache.put(url.pathname, res);
      } catch (e) { /* skip — it'll be fetched when played */ }
    }
  }).catch(() => {});
  return prefetchQueue;
}

async function postProgress(done, total) {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach((c) => {
      c.postMessage({ type: 'audio-cache-progress', done: done, total: total });
    });
  } catch (e) { /* ignore */ }
}

// ---------------- message handler ----------------
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'prefetch-audio') {
    event.waitUntil(prefetchAudio(event.data.urls));
  } else if (event.data.type === 'precache-audio') {
    // Old pages (pre-2026-10-13) still send this — deliberately ignored now.
  } else if (event.data.type === 'skip-waiting') {
    self.skipWaiting();
  }
});

// ---------------- fetch handler ----------------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Audio: cache-first, with Range support for iOS Safari.
  if (url.origin === self.location.origin &&
      url.pathname.startsWith('/audio/') &&
      url.pathname.toLowerCase().endsWith('.mp3')) {
    event.respondWith(handleAudio(req));
    return;
  }

  // Same-origin shell assets: cache-first, fall back to network, then to
  // the cached index.html for navigation requests.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((netRes) => {
          if (netRes && netRes.status === 200 && netRes.type === 'basic') {
            const copy = netRes.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
          }
          return netRes;
        }).catch(() => {
          if (req.mode === 'navigate') return caches.match('/index.html');
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // Cross-origin (e.g. React CDN scripts): try cache, then network.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))
  );
});

async function handleAudio(request) {
  const url = new URL(request.url);
  const cacheKey = url.pathname; // ignore any query string / range header
  const cache = await caches.open(AUDIO_CACHE);
  const rangeHeader = request.headers.get('range');

  let cached = await cache.match(cacheKey);

  if (!cached) {
    // Not saved yet: STREAM it straight from the network (Range and all) so
    // playback starts on the first bytes instead of after the whole ~2 MB
    // file arrives — on weak museum signal that wait was 10–20 s of silence
    // (2026-10-13). The full copy is saved afterwards, one file at a time,
    // by prefetchAudio(): the page asks for it once a listen is 'playing'.
    try {
      return await fetch(request);
    } catch (e) {
      // Offline and not cached — best we can do is bubble up a 503 so the
      // <audio> element fires an error event the page can react to.
      return new Response('Audio unavailable offline', {
        status: 503,
        statusText: 'Offline'
      });
    }
  }

  if (!cached) {
    return new Response('Audio unavailable offline', {
      status: 503,
      statusText: 'Offline'
    });
  }

  // No range header — return the full cached response.
  if (!rangeHeader) {
    return cached.clone();
  }

  // Range request: slice the cached body and return 206 Partial Content.
  const buffer = await cached.clone().arrayBuffer();
  const total = buffer.byteLength;
  const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
  if (!match) return cached.clone();

  const start = parseInt(match[1], 10);
  const end = match[2] ? Math.min(parseInt(match[2], 10), total - 1) : total - 1;
  if (isNaN(start) || start >= total) {
    return new Response('', {
      status: 416,
      statusText: 'Range Not Satisfiable',
      headers: { 'Content-Range': 'bytes */' + total }
    });
  }
  const sliced = buffer.slice(start, end + 1);
  return new Response(sliced, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(sliced.byteLength),
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes'
    }
  });
}
