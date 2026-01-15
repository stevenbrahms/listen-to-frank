# How to Add New Artworks

## Quick Process

1. **In Notion:**
   - Add artist, work title, year
   - Upload audio file to "AUDIO TAKE"
   - Write/paste script in "SCRIPT"
   - Set "Link is Done" to "Done"

2. **Come back to Claude and say:**
   "Update Listen to Frank with latest artworks from Notion"

3. **Claude will:**
   - Fetch all completed artworks
   - Generate new `artworks.json`
   - Give you the download link

4. **Deploy:**
   - Download new `artworks.json`
   - Drag it into Netlify (deploys tab)
   - Done! Live in 30 seconds.

## Current Artworks

Your site currently has:
- Vincent van Gogh - The Starry Night (1889)
- Andy Warhol - Campbell's Soup Cans (1962)

## Files You Just Got

- `index.html` - Main app (updated to load from JSON)
- `artworks.json` - Your 2 completed artworks
- `sw.js` - Updated service worker
- `NOTION-SYNC-GUIDE.md` - Full documentation

## Next Steps

1. Upload these files to Netlify
2. Test the audio playback
3. Add more artworks in Notion
4. Request an update when ready!

---

**Note:** Audio files stay on Notion's servers - no need to download/re-upload them. The URLs in the JSON point directly to Notion's S3 storage.
