# PERMANENT AUDIO FIX

## The Problem

Notion's audio URLs expire after 1 hour. That's why your audio stopped working.

## The Permanent Solution

You need to download the MP3 files and host them on your own site.

### Step 1: Download Your Audio Files from Notion

1. Go to your Notion database: https://www.notion.so/2e74350b65d880f9854df0a3c8ab4811
2. Click on Vincent van Gogh row
3. Click the audio file to download → Save as `starry-night-1889.mp3`
4. Click on Andy Warhol row  
5. Click the audio file to download → Save as `campbells-soup-cans-1962.mp3`

### Step 2: Create an Audio Folder

In your `listentofrank-pwa` folder, create a new folder called `audio`:

```
listentofrank-pwa/
├── audio/                          ← NEW FOLDER
│   ├── starry-night-1889.mp3      ← PUT MP3s HERE
│   └── campbells-soup-cans-1962.mp3
├── index.html
├── artworks.json
└── ... other files
```

### Step 3: Update index.html

Open `index.html` and find the two `audioUrl` lines (around line 63 and 73).

**Change from Notion URLs to:**

```javascript
audioUrl: "/audio/starry-night-1889.mp3",  // Line ~63
```

and

```javascript
audioUrl: "/audio/campbells-soup-cans-1962.mp3",  // Line ~73
```

### Step 4: Deploy Everything

Upload your entire folder (including the new `audio` folder) to Netlify.

**Done! Audio will work forever.**

---

## Quick Test (Temporary - 1 Hour)

I've also created a version with fresh Notion URLs that will work for the next hour.

Use this to test that audio playback works, then switch to the permanent solution above.

File: `index-with-fresh-urls.html`
