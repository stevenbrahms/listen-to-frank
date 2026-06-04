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

const CACHE_VERSION = 'frank-v29';
const SHELL_CACHE = CACHE_VERSION + '-shell';
const AUDIO_CACHE = CACHE_VERSION + '-audio';
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
  '/drawings/manifest.json'
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
  self.skipWaiting();
});

// ---------------- activate ----------------
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Delete any caches from older versions.
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => !n.startsWith(CACHE_VERSION))
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
    // Don't await this — let it run in the background.
    cacheAllAudio();
  })());
});

// ---------------- audio pre-cache ----------------
let audioCachingInProgress = false;

async function cacheAllAudio() {
  if (audioCachingInProgress) return;
  audioCachingInProgress = true;
  try {
    // Pull the list from artworks.json so we never have to hand-maintain it.
    let artworks = [];
    try {
      const res = await fetch('/artworks.json', { cache: 'reload' });
      if (res && res.ok) artworks = await res.json();
    } catch (e) {
      // No artworks list (probably offline). Nothing to pre-cache; existing
      // cached entries are still served from the fetch handler.
      postProgress(0, 0);
      return;
    }

    const audioUrls = artworks
      .map((a) => a && a.audioUrl ? '/' + a.audioUrl.replace(/^\/+/, '') : null)
      .filter(Boolean);

    const cache = await caches.open(AUDIO_CACHE);

    // Figure out what's already cached so progress is meaningful when the
    // page is reopened mid-download.
    let done = 0;
    const todo = [];
    for (const url of audioUrls) {
      const hit = await cache.match(url);
      if (hit) done++; else todo.push(url);
    }
    const total = audioUrls.length;
    postProgress(done, total);

    if (todo.length === 0) return;

    // Download in small batches so we don't try to open 158 sockets at once.
    const BATCH = 4;
    for (let i = 0; i < todo.length; i += BATCH) {
      const batch = todo.slice(i, i + BATCH);
      await Promise.allSettled(batch.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'reload' });
          if (res && res.ok) {
            await cache.put(url, res.clone());
          }
        } catch (e) {
          // skip — we'll retry next visit
        } finally {
          done++;
          postProgress(Math.min(done, total), total);
        }
      }));
    }
  } catch (e) {
    // swallow — we'll try again on the next page load
  } finally {
    audioCachingInProgress = false;
  }
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
  if (event.data.type === 'precache-audio') {
    cacheAllAudio();
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
    // Try to fetch the full file (no Range) so we can cache a complete copy.
    try {
      const fullRes = await fetch(cacheKey);
      if (fullRes && fullRes.ok && fullRes.status === 200) {
        try { await cache.put(cacheKey, fullRes.clone()); } catch (e) { /* quota */ }
        cached = fullRes;
      } else if (fullRes) {
        return fullRes;
      }
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
