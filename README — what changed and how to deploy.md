# Listen to Frank — current state & how to deploy

Updated: 10 June 2026 (Bolaño-cover redesign era, sw `frank-v88`)

## What the site is now

- **Entry** — a rotating "book cover": one of three covers (cream/Starry Night,
  yellow/Demoiselles, pink/Dance) dealt per visit. Built from `COVERS` in
  `index.html`; drawings are white-line PNGs printed black via CSS `invert(1)`.
  Design source: `_entry-bolano-mockup.html`.
- **Interior** (gallery, player, map, now-playing) — **warm palette**: bone
  `#dcd5c6` text on warm near-black `#0f0e0b`. Never use pure `#fff`/`#000` in
  the interior. Drawings get `sepia(.25)` in their filters to match.
- **About** — the "back cover": same paper as the dealt cover, black ink, and
  (desktop) the cover's featured drawing hung on the right.
- **Desktop ≥1100px** — one media query at the END of the stylesheet: gallery
  becomes a full-width 3-column index, player is a left rail + big drawing
  plate, About is a left-justified colophon, map is full-bleed, now-playing is
  a full-width bottom bar. Mobile layout is untouched.
- **Thumbnails** — `drawings-thumbs/` mirrors `drawings/` filenames at 300px.
  Gallery rows + now-playing use them (with fallback to the full file); player
  ghost / About art / entry covers use full size. **New drawing ⇒ also generate
  its thumb** (PIL, max 300px, same filename) — nothing automates this.
- **Update toast** — when a new version deploys, visitors get a "frank got
  better — tap to refresh" pill instead of needing to close/reopen twice. The
  service worker no longer auto-activates (`skipWaiting` only fires on tap).
- Offline audio caching, lock-screen Media Session controls, and the plain-JS
  (no Babel/React-CDN) build from the May handoff all still apply.

## How to deploy

Host: GitHub Pages, repo `stevenbrahms/listen-to-frank`, branch `main`,
repo root == this folder. Two equally fine routes:

1. **Web UI** — drag files/folders into github.com and commit (the original way).
2. **`gh api`** — works from this machine (authenticated as stevenbrahms):
   single files via the contents API (base64 JSON payload, include the current
   file `sha` for updates); bulk uploads via the git trees API (blobs → tree →
   commit → ref; ~200 files ≈ 2 min, one commit).

**Every `index.html` change must bump `CACHE_VERSION` in `sw.js`** (cache-first
shell — clients keep the old page until the SW version changes). Exception:
meta-tag-only changes (og tags) can skip the bump; scrapers don't run the SW.

Pages auto-builds on push (~1 min). Back-to-back commits cancel the first
build — normal. Verify with `curl https://www.listentofrank.art/sw.js`.

## Gotchas (each of these has bitten once)

- **Unicode filenames**: GitHub Pages matches URL bytes exactly. macOS writes
  `é` decomposed (NFD); editors often emit composed (NFC). Any accented
  filename referenced in code must be **percent-encoded NFD** (see the Méliès
  entry in `COVERS` / `sw.js`). Better: give new files ASCII slugs.
- **Drawing manifests**: `drawings/manifest.json` maps artwork-id → file for
  gallery thumbs + player ghost. NEVER hand-edit — run
  `python3 3_Website/build-drawings-manifest.py`. A GitHub Action rebuilds it
  on push when `drawings/**` changes (NOT `drawings-thumbs/**`).
- **The entry/ folder is retired** — the entry screen no longer reads it; the
  covers are hard-coded in `COVERS`.
- **Don't run `jsx_transpile.py`** (see CLAUDE.md — it destroys index.html;
  known-good backup in `_just-the-changed-files/`).
- After editing `index.html`, extract the inline scripts and `node --check`
  them before deploying.

## Stale docs

`PROJECT-STATUS.md` and `QUICK-START.md` predate the v3 rebuild (Netlify era).
This file and `3_Website/CLAUDE.md` are the live references.
