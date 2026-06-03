#!/usr/bin/env python3
"""
Regenerate current/entry/manifest.json from whatever image files are in
current/entry/.  Drop in any drawing with any filename, run this, deploy —
the entry screen rotates through all of them. No code editing required.

Usage:  python3 3_Website/build-entry-manifest.py
(Claude runs this automatically as part of deploy/sync.)
"""
import json
import os
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
IMG_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif")

# Find the entry/ folder so the SAME script works both here in Dropbox
# (3_Website/current/entry) and at the GitHub repo root (entry/), where the
# deploy Action runs it.
_CANDIDATES = [
    os.path.join(HERE, "entry"),             # script sits at repo root (GitHub)
    os.path.join(HERE, "current", "entry"),  # script at 3_Website/ (Dropbox)
    os.path.join(os.getcwd(), "entry"),      # run from a folder containing entry/
]
ENTRY_DIR = next((p for p in _CANDIDATES if os.path.isdir(p)), None)
if ENTRY_DIR is None:
    print("No entry/ folder found — nothing to do.")
    raise SystemExit(0)
MANIFEST = os.path.join(ENTRY_DIR, "manifest.json")

files = sorted(
    f for f in os.listdir(ENTRY_DIR)
    if f.lower().endswith(IMG_EXT) and not f.startswith(".")
)

# Store web paths, URL-encoding the filename so spaces / special characters
# in names the user chose still resolve.
paths = ["entry/" + urllib.parse.quote(f) for f in files]

with open(MANIFEST, "w", encoding="utf-8") as fh:
    json.dump(paths, fh, indent=2, ensure_ascii=False)
    fh.write("\n")

print(f"Wrote {len(paths)} drawing(s) to {os.path.relpath(MANIFEST, HERE)}:")
for p in paths:
    print("  " + p)
