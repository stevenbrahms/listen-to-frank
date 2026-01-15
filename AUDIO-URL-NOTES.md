# Audio Playback - Important Notes

## ✅ Fixed Issues

1. **Updated scripts** - Both artworks now have your latest scripts from Notion
2. **Fixed audio URLs** - Added complete AWS signed URLs with authentication tokens
3. **Better error handling** - Audio element now logs errors for debugging

## ⚠️ Important: URL Expiration

**The Notion audio URLs expire after ~1 hour** due to AWS S3 security tokens.

This means:
- Audio will work for about 1 hour after generating the JSON
- Then URLs will return 403 errors
- You'll need to regenerate `artworks.json` with fresh URLs

## Solutions

### Option 1: Download & Host Audio Files (Recommended)

**Best for production:**

1. Download MP3s from your Notion database
2. Upload them to your Netlify site in an `/audio` folder
3. Update artworks.json to use local paths:
   ```json
   "audioUrl": "/audio/starry-night-1889.mp3"
   ```

**Pros:** URLs never expire, faster loading, full control
**Cons:** Requires manual file management

### Option 2: Auto-Regenerate JSON

**For testing/development:**

Every time URLs expire, come back to Claude and say:
"Regenerate artworks.json with fresh URLs"

**Pros:** Easy, automated
**Cons:** URLs still expire, not ideal for production

### Option 3: Serverless Proxy (Advanced)

Create a Netlify function that fetches from Notion on-demand.

**Pros:** Always works, no expiration
**Cons:** Requires coding, extra complexity

## Recommendation

For your production site (listentofrank.art):

1. **Download the MP3s** from Notion
2. **Upload to Netlify** in `/audio` folder
3. **Update artworks.json** with local paths like `/audio/filename.mp3`
4. **No more expiration issues!**

## Testing Current Setup

The URLs in the current `artworks.json` will work for about 1 hour. Perfect for testing!

1. Upload to Netlify now
2. Test audio playback
3. If it works, great! 
4. Then switch to downloaded files for production

---

**Current artworks.json expires:** ~1 hour from now (2026-01-14 01:49 UTC)
