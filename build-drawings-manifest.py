#!/usr/bin/env python3
"""
Match the line drawings in drawings/ to artworks and write drawings/manifest.json
— a map of  artwork-id -> drawings/<actual filename>  that the site reads to show
gallery thumbnails and the player's ghost image.

Drop drawings in with any reasonable filename (the line-drawing tool's
"<title>-<artist>-<year>_line.png" names work great); this figures out which
artwork each one belongs to. Run it before deploy (Claude / deploy-prep /
the GitHub Action all call it).

Usage:
  python3 3_Website/build-drawings-manifest.py            # write manifest
  python3 3_Website/build-drawings-manifest.py --report   # show matches, write nothing
"""
import json, os, re, sys, unicodedata, difflib, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
IMG_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif")
FUZZY_THRESHOLD = 0.80

# Locate the site root (folder containing both artworks.json and drawings/).
_ROOTS = [HERE, os.path.join(HERE, "current"), os.getcwd()]
ROOT = next((r for r in _ROOTS
             if os.path.isfile(os.path.join(r, "artworks.json"))
             and os.path.isdir(os.path.join(r, "drawings"))), None)
if ROOT is None:
    print("Couldn't find artworks.json + drawings/ — nothing to do.")
    raise SystemExit(0)
DRAW_DIR = os.path.join(ROOT, "drawings")
MANIFEST = os.path.join(DRAW_DIR, "manifest.json")

# Terse legacy filenames that can't be matched by similarity. Value = a substring
# that appears in the target artwork's audio path (artist or title slug).
ALIASES = {
    "bather.png": "the-bather",
    "starry night.png": "starry-night",
    "seurat.png": "seurat",      # Evening, Honfleur
    "signac.png": "signac",      # Opus 217 (Fénéon)
}

def strip_acc(s):
    return "".join(c for c in unicodedata.normalize("NFD", s)
                   if unicodedata.category(c) != "Mn")

def norm(s):
    s = strip_acc(s.lower())
    s = re.sub(r"_line\b", "", s)
    s = re.sub(r"\s*\(\d+\)", "", s)     # drop " (1)" duplicate markers
    s = re.sub(r"[^a-z0-9]", "", s)
    return s

arts = [a for a in json.load(open(os.path.join(ROOT, "artworks.json")))
        if not a.get("isAbout")]
records = []   # (norm_key, id, audio_base, title_norm, artist_norm, year)
for a in arts:
    base = a["audioUrl"].replace("audio/", "").rsplit(".", 1)[0]
    records.append((norm(base), a["id"], base,
                    norm(a.get("title", "")), norm(a.get("artist", "")),
                    re.sub(r"\D", "", str(a.get("year", "")))))
exact = {k: i for k, i, b, *_ in records}

files = sorted(f for f in os.listdir(DRAW_DIR)
               if f.lower().endswith(IMG_EXT) and not f.startswith("."))

assigned = {}     # artwork id -> filename
how = {}          # filename -> ("exact"|"fuzzy 0.xx"|"alias")
leftover = []

# 1) exact normalized match
remaining = []
for f in files:
    k = norm(f.rsplit(".", 1)[0])
    if k in exact and exact[k] not in assigned:
        assigned[exact[k]] = f; how[f] = "exact"
    else:
        remaining.append(f)

# 2) fuzzy match
mid = []
for f in remaining:
    k = norm(f.rsplit(".", 1)[0])
    best_id, best_base, best_r = None, None, 0.0
    for nk, i, b, tn, an, yr in records:
        if i in assigned:
            continue
        r = difflib.SequenceMatcher(None, k, nk).ratio()
        if r > best_r:
            best_id, best_base, best_r = i, b, r
    if best_id and best_r >= FUZZY_THRESHOLD:
        assigned[best_id] = f; how[f] = f"fuzzy {best_r:.2f} -> {best_base}"
    else:
        mid.append(f)

# 2.5) descriptive/long filenames: title-slug prefix + artist + year all present
still = []
for f in mid:
    fk = norm(f.rsplit(".", 1)[0])
    hit = next((i for nk, i, b, tn, an, yr in records
                if i not in assigned and len(tn) >= 5 and fk.startswith(tn)
                and an and an in fk and (yr == "" or yr in fk)), None)
    if hit:
        assigned[hit] = f; how[f] = "title+artist match"
    else:
        still.append(f)

# 3) explicit aliases (terse legacy names)
for f in still:
    sub = ALIASES.get(f)
    if not sub:
        leftover.append(f); continue
    hit = next((i for nk, i, b, *_ in records if sub in b and i not in assigned), None)
    if hit:
        assigned[hit] = f; how[f] = f"alias ('{sub}')"
    else:
        leftover.append(f)

manifest = {i: "drawings/" + urllib.parse.quote(assigned[i]) for i in assigned}

report = "--report" in sys.argv
print(f"drawings in folder : {len(files)}")
print(f"matched to artworks: {len(assigned)}")
print(f"artworks w/ drawing: {len(assigned)} / {len(arts)}")
print(f"unmatched drawings : {len(leftover)}")
if report:
    print("\n--- matches ---")
    for i in sorted(assigned):
        print(f"  {i}\n     {assigned[i]}   [{how[assigned[i]]}]")
if leftover:
    print("\n--- unmatched (no confident artwork — left out, shown as color swatch) ---")
    for f in leftover:
        print("  " + f)

if not report:
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=1, ensure_ascii=False)
        fh.write("\n")
    print(f"\nWrote {MANIFEST}")
