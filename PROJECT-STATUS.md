# Listen to Frank - Project Status

**Last Updated:** January 14, 2026

## Current State

✅ **LIVE SITE with Landing Page**
- Landing page with description
- 8 artworks with audio files included
- Full React-based player
- PWA (works offline)
- Ready to deploy to listentofrank.art

## Site Structure

### Landing Page
- "LISTEN TO FRANK" (centered title)
- 4px white line underneath (full width)
- Description in bordered box (3px border, centered text)
- White "ENTER" button
- Matches main page aesthetic (Vignelli/subway design)

### Main Page (after clicking ENTER)
- "TELL FRANK WHAT YOU'RE LOOKING AT" header
- Search bar for filtering artworks
- Bordered artwork list (3px white borders)

### Player Page
- Full-screen color background (unique per artwork)
- Audio player with progress bar
- Transcript toggle
- Share button
- Back button to return to search

## Current Artworks (8 total)

All with MP3 files included:

1. **Vincent van Gogh** - The Starry Night (1889)
   - File: starry-night-1889.mp3
   - Color: #2563EB (blue)

2. **Andy Warhol** - Campbell's Soup Cans (1962)
   - File: campbells-soup-cans-1962.mp3
   - Color: (in artworks.json)

3. **Pablo Picasso** - Les Demoiselles d'Avignon (1907)
   - File: les-demoiselles-davignon-1907.mp3

4. **Pablo Picasso** - Nude with Joined Hands (1906)
   - File: nude-with-joined-hands-1906.mp3

5. **Claude Monet** - Water Lilies/Agapanthus (1914-26)
   - Files: water-lilies-1914-26.mp3, agapanthus-1914-26.mp3

6. **Diane Arbus** - Child with Toy Hand Grenade (1962)
   - File: child-with-toy-hand-grenade-1962.mp3

7. **Diane Arbus** - Identical Twins (1967)
   - File: identical-twins-1967.mp3

## Notion Database

**URL:** https://www.notion.so/2e74350b65d880f9854df0a3c8ab4811

**Database Name:** Listen to Frank

**Schema:**
- Artist (title field)
- Work Title (text)
- Year (text)
- SCRIPT (text) - Frank's monologue
- AUDIO TAKE (file) - MP3 upload
- Link is Done (status) - "Not started", "In progress", "Done"
- File Name Idea (text) - suggested filename

## How to Add New Artworks

### Step 1: Add to Notion
1. Go to https://www.notion.so/2e74350b65d880f9854df0a3c8ab4811
2. Add new row with:
   - Artist name
   - Work Title
   - Year
   - Script (Frank's take)
   - Upload MP3 to AUDIO TAKE field
   - Set "Link is Done" to "Done"

### Step 2: Tell Claude
Just say: **"Add new artworks to Listen to Frank"** or **"Update Listen to Frank"**

Claude will:
1. Fetch artworks marked "Done" from Notion
2. Ask you to upload the MP3 files
3. Generate updated site with all artworks
4. Give you a zip file ready to deploy

### Step 3: Deploy
1. Extract the zip file
2. Go to app.netlify.com/drop
3. Drag the folder onto the page
4. Done! (Your domain should already be connected)

## File Structure

```
listentofrank-with-landing/
├── index.html                 (Main React app with landing page)
├── artworks.json             (Artwork data backup)
├── audio/                    (MP3 files)
│   ├── starry-night-1889.mp3
│   ├── campbells-soup-cans-1962.mp3
│   └── [other MP3s]
├── manifest.json             (PWA config)
├── sw.js                     (Service worker)
├── icon-192.png             (App icon)
├── icon-512.png             (App icon)
├── _redirects               (Netlify routing)
└── vercel.json              (Vercel config, if needed)
```

## Design System (Vignelli/NYC Subway)

### Typography
- Font: Helvetica Neue, Helvetica, Arial
- Weights: 400 (normal), 700 (bold)
- All caps for titles
- Letter spacing: -0.02em (titles), 0.05em (buttons)

### Colors
- Background: #000 (black)
- Text: #fff (white)
- Borders: #fff (white)
- Player backgrounds: Unique color per artwork

### Borders
- Landing page title divider: 4px solid white
- Description box: 3px solid white
- Artwork items: 3px solid white
- Main header: 4px solid white

### Spacing
- Landing description box: 40px padding
- Main page padding: 48px top, 24px sides
- Artwork items: 20px padding

## Technical Notes

- **React 18** via CDN (unpkg)
- **No build step** - pure HTML/JS
- **Hash-based routing** for artworks (#starry-night-1889)
- **Progressive Web App** - installable, works offline
- **Audio preload** - metadata only for faster loading

## Quick Commands for Claude

When you come back, just say:

- **"Update Listen to Frank"** - Add new artworks
- **"Add [X] to Listen to Frank"** - Add specific artwork
- **"Change the landing page description"** - Update text
- **"Fix [something] on Listen to Frank"** - Bug fixes

## Current Landing Page Text

"Frank is that friend you go to the gallery with—he knows the history, the context, a few rumors—but moves through it all a little sideways. Go ahead. Listen to Frank while you look at the art."

## Deployment Info

- **Primary:** Netlify Drop (app.netlify.com/drop)
- **Domain:** listentofrank.art
- **Files Included:** All audio files in /audio folder
- **Size:** ~14MB (includes all MP3s)

---

## Coming Back Later

When you return, just say:
1. "I want to update Listen to Frank" - Claude will remember everything
2. Upload any new MP3 files when asked
3. Deploy the new zip

Claude will remember:
- The Notion database structure
- The design system
- All current artworks
- How to generate the site
- The landing page design

Everything is saved and ready to continue!
