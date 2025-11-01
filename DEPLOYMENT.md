# Termz Deployment Guide

This guide covers how to package and deploy Termz for the Chrome Built-in AI Challenge and beyond.

## Pre-Deployment Checklist

Before packaging, verify:

- [ ] All features work correctly (see TESTING.md)
- [ ] No console errors in any context
- [ ] README.md is complete and accurate
- [ ] CONTRIBUTING.md is up to date
- [ ] LICENSE file is present
- [ ] All TODO items are completed
- [ ] Code is clean and commented
- [ ] manifest.json version is correct

## Creating Distribution Package

### Option 1: ZIP for Hackathon Submission

```bash
cd /Users/frameless/Desktop

# Create zip excluding unnecessary files
zip -r termz-v1.0.0.zip Termz/ \
  -x "*.DS_Store" \
  -x "Termz/.git/*" \
  -x "Termz/node_modules/*" \
  -x "Termz/*.md~" \
  -x "Termz/.plan" \
  -x "Termz/icons/icon_base64.txt"
```

### Option 2: Manual ZIP

1. Open Finder → Navigate to `/Users/frameless/Desktop`
2. Right-click `Termz` folder
3. Select "Compress Termz"
4. Rename to `termz-v1.0.0.zip`

### Files to Include

```
termz-v1.0.0.zip/
├── manifest.json ✓
├── background.js ✓
├── content.js ✓
├── sidepanel/
│   ├── sidepanel.html ✓
│   ├── sidepanel.css ✓
│   └── sidepanel.js ✓
├── utils/
│   ├── ai-analyzer.js ✓
│   ├── detector.js ✓
│   ├── storage.js ✓
│   └── pdf-parser.js ✓
├── icons/
│   ├── icon16.png ✓
│   ├── icon48.png ✓
│   ├── icon128.png ✓
│   └── icon.svg ✓
├── README.md ✓
├── CONTRIBUTING.md ✓
├── LICENSE ✓
├── TESTING.md ✓
└── DEPLOYMENT.md (this file) ✓
```

### Files to EXCLUDE

- `.git/` directory
- `.DS_Store` files
- `node_modules/` (if any)
- `.plan` file
- Development notes
- `icons/icon_base64.txt`
- Any backup files (`*.bak`, `*~`)

## Chrome Web Store Submission (Optional)

If you plan to publish beyond the hackathon:

### 1. Developer Account Setup

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay $5 one-time registration fee
3. Complete developer profile

### 2. Prepare Store Assets

**Required Screenshots** (1280x800 or 640x400):
- [ ] Extension icon in action (detection indicator)
- [ ] Side panel showing analysis results
- [ ] Risk detection example
- [ ] Settings page
- [ ] History view

**Promotional Images** (Optional but recommended):
- Marquee: 1400x560
- Small tile: 440x280

**Demo Video** (Recommended):
- Upload to YouTube
- 2-3 minutes showing key features
- Add link in store listing

### 3. Store Listing Content

**Title** (max 45 chars):
```
Termz - Legal Document Analyzer
```

**Short Description** (max 132 chars):
```
AI-powered analysis of privacy policies and terms of service. Detects risks and explains legal jargon in plain language.
```

**Detailed Description** (max 16,000 chars):
```
Termz automatically detects legal documents and provides instant AI-powered analysis using Chrome's built-in Gemini Nano. All processing happens locally on your device.

FEATURES:
• Auto-detect privacy policies and terms of service
• AI-powered risk analysis
• Plain-language explanations
• Legal term glossary
• Document summaries
• Analysis history
• File upload support (PDF, TXT, DOCX)

PRIVACY-FOCUSED:
• 100% local processing
• No data sent to external servers
• No tracking or analytics
• Open source

Powered by Chrome's Built-in AI APIs for fast, private analysis.
```

**Category**: Productivity

**Language**: English (add more as needed)

### 4. Privacy Policy

Since Termz collects no data, use this template:

```
Privacy Policy for Termz

Last updated: [Date]

Termz does not collect, store, or transmit any personal data or usage information. All document analysis is performed locally on your device using Chrome's built-in AI. 

Data Storage:
- Analysis history is stored locally in your browser only
- Settings are stored locally in your browser only
- No data is ever sent to external servers

For questions, contact: [your-email@example.com]
```

Host this on GitHub Pages or your personal site.

### 5. Submit for Review

1. Upload ZIP file
2. Fill in store listing
3. Add screenshots
4. Set pricing (Free)
5. Select regions
6. Submit for review
7. Wait 1-3 days for approval

## Hackathon Submission (Devpost)

### Required Materials

1. **Project Title**:
   ```
   Termz - Automated Legal Document Analyzer
   ```

2. **Tagline** (max 60 chars):
   ```
   AI-powered legal doc analysis with auto-detection
   ```

3. **Description**:
   - Problem statement (2-3 paragraphs)
   - Solution explanation (2-3 paragraphs)
   - Technical implementation (2-3 paragraphs)
   - Chrome APIs used (list all 4+)
   - Impact statement (1 paragraph)

4. **Demo Video** (< 3 minutes):
   - Screen recording with voiceover
   - Show auto-detection feature
   - Walk through analysis results
   - Highlight multi-API usage
   - Upload to YouTube (Unlisted is fine)

5. **GitHub Repository**:
   - Public repository
   - All source code
   - Complete README
   - Open source license (MIT)

6. **Built With Tags**:
   - Chrome Extensions
   - Chrome Built-in AI
   - Gemini Nano
   - Prompt API
   - Summarizer API
   - JavaScript
   - Manifest V3

7. **Screenshots** (4-6 recommended):
   - Auto-detection in action
   - Side panel overview
   - Risk analysis results
   - Glossary feature
   - History view
   - Settings page

### Devpost Submission Checklist

- [ ] Project title and tagline filled
- [ ] Complete description written
- [ ] Demo video uploaded and linked
- [ ] GitHub repository linked
- [ ] All screenshots uploaded
- [ ] Built With tags added
- [ ] Team members listed
- [ ] Challenge selected (Chrome Built-in AI Challenge)
- [ ] Prize categories selected
- [ ] Submission finalized

### Prize Categories to Target

**Primary**:
- "Most Helpful - Chrome Extension" ($14,000)
  - Emphasize solving universal problem
  - Auto-detection innovation
  - Real-world utility

**Secondary**:
- "Best Multimodal AI Application" ($9,000)
  - If you add image/diagram analysis
  - Multiple AI APIs working together

## Version Management

### Semantic Versioning

Follow [SemVer](https://semver.org/):
- `1.0.0` - Initial hackathon release
- `1.0.1` - Bug fix
- `1.1.0` - New feature
- `2.0.0` - Breaking change

Update version in:
- `manifest.json` → "version"
- `README.md` → Version badge
- `CHANGELOG.md` (if you create one)

## Post-Hackathon Next Steps

After the hackathon, consider:

1. **User Feedback**:
   - Add feedback form
   - Monitor GitHub issues
   - Engage with community

2. **Additional Features**:
   - More document types (EULA, cookie policies)
   - Multi-language support
   - Document comparison tool
   - Browser action popup

3. **Monetization** (Optional):
   - Pro features for businesses
   - White-label licensing
   - API access for developers

4. **Marketing**:
   - Product Hunt launch
   - Reddit posts (r/chrome, r/privacy)
   - Twitter announcement
   - Blog post about building it

## Support & Maintenance

**For Hackathon Period**:
- Monitor GitHub issues
- Respond to judge questions quickly
- Fix critical bugs immediately

**Long-term**:
- Update for Chrome API changes
- Fix reported bugs
- Add community-requested features
- Keep documentation current

## Quick Commands Reference

```bash
# Test locally
# Load unpacked extension from chrome://extensions

# Create package
cd /Users/frameless/Desktop
zip -r termz-v1.0.0.zip Termz/ -x "*.DS_Store" -x "Termz/.git/*"

# Verify package
unzip -l termz-v1.0.0.zip | head -20

# Check file count (should be ~15-20 files)
unzip -l termz-v1.0.0.zip | wc -l

# Check size (should be <5MB)
ls -lh termz-v1.0.0.zip
```

## Final Checks Before Submission

- [ ] Extension loads without errors
- [ ] All features demonstrated in video
- [ ] GitHub repo is public and complete
- [ ] README has clear installation instructions
- [ ] No API keys or secrets in code
- [ ] Screenshots show professional UI
- [ ] Demo video is < 3 minutes
- [ ] Devpost form is complete
- [ ] Team members are added
- [ ] Submitted before deadline!

---

## Questions?

If you encounter issues:
1. Check Chrome version (must be 128+)
2. Verify Gemini Nano is downloaded
3. Look for console errors
4. Review TESTING.md for debugging

---

**Good luck with your submission! 🚀**

