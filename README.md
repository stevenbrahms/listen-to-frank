# Listen to Frank - PWA Deployment Guide

## 🎯 What You Have

A fully functional Progressive Web App with:
- ✅ Installable on iOS and Android
- ✅ Works offline (service worker)
- ✅ Shareable URLs (listentofrank.art/#79809)
- ✅ Responsive design
- ✅ Clean Vignelli-inspired interface

## 📁 Files Structure

```
listen-to-frank/
├── index.html          # Main app (everything in one file)
├── manifest.json       # PWA manifest for installability
├── sw.js              # Service worker for offline support
├── icon-192.png       # App icon (192x192) - YOU NEED TO CREATE THIS
├── icon-512.png       # App icon (512x512) - YOU NEED TO CREATE THIS
└── README.md          # This file
```

## 🎨 Creating Icons

You need two PNG icons with black background and white "F" or "FRANK":

**Option 1: Use Figma/Canva**
- Create 512x512px black square
- Add bold white "F" or "FRANK" centered
- Export as PNG
- Resize to 192x192 for smaller icon

**Option 2: Use this placeholder generator**
Visit: https://www.favicon-generator.org/
Upload a simple black square with white F

Save as:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Create account**: https://vercel.com
2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```
3. **Deploy**:
   ```bash
   cd listen-to-frank
   vercel
   ```
4. **Add custom domain**:
   - Go to Vercel dashboard
   - Settings → Domains
   - Add: `listentofrank.art`
   - Follow DNS instructions from your domain registrar

### Option 2: Netlify (Also Great)

1. **Create account**: https://www.netlify.com
2. **Deploy via drag-and-drop**:
   - Drag your folder into Netlify
   - Or connect GitHub repo
3. **Add custom domain**:
   - Site settings → Domain management
   - Add: `listentofrank.art`
   - Update DNS records

### Option 3: Cloudflare Pages (Fast & Free)

1. **Create account**: https://pages.cloudflare.com
2. **Connect GitHub** or upload directly
3. **Deploy** - it's automatic
4. **Add domain**: `listentofrank.art`

## 🔧 DNS Setup

Point your domain to your hosting:

**For Vercel/Netlify:**
```
Type: CNAME
Name: @
Value: [provided by host]
```

**For Cloudflare:**
Already managed if you use Cloudflare DNS

## ✅ Testing Your PWA

### Desktop (Chrome)
1. Open: `https://listentofrank.art`
2. Click install icon in address bar
3. App opens in standalone window

### iPhone (Safari)
1. Open: `https://listentofrank.art`
2. Tap Share → Add to Home Screen
3. App appears on home screen

### Android (Chrome)
1. Open: `https://listentofrank.art`
2. Tap "Add to Home Screen" prompt
3. App appears in app drawer

## 🎯 How URLs Work

- Home: `listentofrank.art`
- Specific artwork: `listentofrank.art/#79809`
- Share button copies full URL
- Back button returns to home

## 📝 Next Steps

1. **Create icons** (icon-192.png, icon-512.png)
2. **Choose hosting** (Vercel recommended)
3. **Deploy files**
4. **Point domain** (listentofrank.art)
5. **Test on phone** (install PWA)
6. **Add audio files** (Phase 2)

## 🎵 Adding Real Audio (Future)

When ready:
1. Generate MP3 files: `/audio/79809.mp3`
2. Update `index.html` to use real audio files
3. Remove simulated progress bar
4. Deploy updated files

## 🐛 Troubleshooting

**PWA not installing?**
- Must use HTTPS (not http)
- Check manifest.json is accessible
- Icons must exist

**Offline not working?**
- Check service worker is registered (Dev Tools → Application)
- Clear cache and reload
- Verify sw.js is accessible

**Domain not working?**
- DNS can take 24-48 hours
- Check DNS records are correct
- Try incognito mode

## 📞 Support

Questions? Check:
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- PWA Guide: https://web.dev/progressive-web-apps/

---

**Current Status**: Design locked ✅ | Ready to deploy 🚀
