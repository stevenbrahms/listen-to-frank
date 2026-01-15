# Listen to Frank - Notion Sync Workflow

## Current Setup

Your Notion database has the perfect structure:
- **Artist** (title field)
- **Work Title** (text)
- **Year** (text)  
- **SCRIPT** (text with HTML formatting)
- **AUDIO TAKE** (file upload - stores MP3 on Notion's S3)
- **Link is Done** (status: Not started, In progress, Done)

## How the Sync Works

### Option 1: Claude-Assisted (Easiest for You)

**When you want to update the website:**

1. **Add/complete entries in Notion**
   - Upload audio file to "AUDIO TAKE"
   - Write script in "SCRIPT"
   - Set "Link is Done" to "Done"

2. **Come back to this chat and say:**
   "Update Listen to Frank with latest Notion artworks"

3. **Claude will:**
   - Fetch all "Done" artworks from Notion
   - Generate updated `artworks.json` file
   - You download and upload to Netlify

**That's it!** Takes 2 minutes.

### Option 2: Manual JSON Editing (If You Want Control)

Edit the `artworks.json` file directly with this structure:

```json
{
  "id": "unique-id",
  "title": "WORK TITLE IN CAPS",
  "artist": "ARTIST NAME IN CAPS", 
  "year": "1889",
  "color": "#2563EB",
  "audioUrl": "https://notion-audio-url.mp3",
  "transcript": "Full script text here..."
}
```

## File Structure

```
listentofrank-pwa/
├── index.html          # Main app (loads artworks.json)
├── artworks.json       # All artwork data (generated from Notion)
├── manifest.json       # PWA config
├── sw.js              # Service worker
└── icons/             # App icons
```

## Color Assignment

Colors are auto-assigned based on artist name:
- Vincent van Gogh → Blue (#2563EB)
- Andy Warhol → Red (#DC2626)
- Pablo Picasso → Orange (#EA580C)
- etc.

Consistent colors per artist across all their works.

## Audio Files

**Important:** Audio files stay hosted on Notion's S3 servers.
- No need to re-upload anywhere
- Notion URLs work perfectly
- They include security tokens (refresh automatically)

## Updating the Live Site

After getting updated `artworks.json`:

1. Go to Netlify dashboard
2. Go to "Deploys" tab
3. Drag new files into upload area
4. Site updates in ~30 seconds

## Next Steps

1. ✅ You have the Notion database set up
2. ✅ You have audio files uploading
3. ⏳ Claude generates artworks.json (next)
4. ⏳ You deploy to Netlify

---

**Ready to generate your first artworks.json file?**
Just say "generate artworks from Notion" and I'll create it with all your completed works!
