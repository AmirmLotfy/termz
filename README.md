# Termz - Automated Legal Document Analyzer

![Termz Logo](icons/icon128.png)

## ⚠️ IMPORTANT: 3 Origin Trial Tokens Required

**Before installation**, this extension requires **3 separate Origin Trial tokens** to access Chrome's experimental Built-in AI APIs.

### 🎯 Token Requirements:
- **Token #1**: Prompt API (LanguageModel)
- **Token #2**: Writer API
- **Token #3**: Rewriter API
- **✅ Summarizer API**: NO TOKEN NEEDED (stable)

### Quick Setup:
1. **Register 3 times** at: https://developer.chrome.com/origintrials/
   - Register for: Prompt API
   - Register for: Writer API
   - Register for: Rewriter API
2. **Get your 3 tokens** for your extension ID
3. **Replace** all 3 placeholders in `manifest.json` → `trial_tokens` array (any order)
4. **Reload** the extension

📖 **Detailed instructions**: See [`ORIGIN_TRIAL_SETUP.md`](ORIGIN_TRIAL_SETUP.md)  
🔐 **How tokens work**: See [`HOW_TOKENS_WORK.md`](HOW_TOKENS_WORK.md)

> **Note**: Each experimental API needs its own unique token. Tokens are self-describing - Chrome automatically knows which token is for which API. Without tokens, only the Summarizer API will work.

---

## Overview

**Termz** is a Chrome extension that automatically detects when you visit legal document pages (privacy policies, terms of service, legal agreements) and provides instant AI-powered analysis, risk detection, and plain-language explanations using Chrome's built-in AI APIs (Gemini Nano).

## The Problem

Users routinely accept terms and conditions they don't understand, exposing themselves to:
- Privacy risks
- Unfair clauses
- Legal complications
- Hidden auto-renewal traps
- Binding arbitration clauses

Legal documents use complex jargon that's inaccessible to average users, yet we encounter them constantly across the web.

## The Solution

Termz proactively:
- **Auto-detects** legal documents as you browse
- **Analyzes risks** using AI to identify problematic clauses
- **Translates jargon** into plain language you can understand
- **Provides summaries** so you know what you're agreeing to
- **Protects your privacy** - all processing happens locally on your device

## Features

### 🔍 Automatic Detection
- Intelligently detects legal pages using multi-factor analysis
- Works on privacy policies, terms of service, EULAs, and more
- Non-intrusive visual indicator when legal content is found

### 🛡️ Risk Analysis
- Identifies data collection practices
- Flags liability waivers and unfair clauses
- Detects auto-renewal and arbitration terms
- Color-coded risk severity indicators

### 📖 Plain Language Translation
- Converts legal jargon to simple English
- Interactive glossary of legal terms
- Section-by-section breakdown

### 📋 Smart Summaries
- Executive summary (2-3 sentences)
- Key points bullet list
- Comprehensive document overview

### 💾 Analysis History
- Save and review past analyses
- Search through previous documents by title or content
- Click any history item to view its full analysis
- Export all data as JSON
- Clear all history with one click

### 🎯 Manual Analysis
- Paste any legal text for instant analysis (with character counter)
- Upload PDF, TXT, DOC, or DOCX files (drag-and-drop supported)
- Right-click selected text: "Analyze selected text with Termz"
- Right-click context menu: "Open Termz Website" to visit https://termz.it.com

### 🔔 Smart Notifications
- Get alerted when legal documents are detected
- Click notification to instantly analyze or dismiss
- Customizable notification preferences
- Option to auto-open side panel on detection

## Installation

### Prerequisites

#### 1. Chrome Version Requirements

Install **Chrome Dev** or **Chrome Canary** (version 138 or higher):
- Download from: https://www.google.com/chrome/dev/ or https://www.google.com/chrome/canary/

#### 2. Enable Chrome's Built-in AI

Enable the required flags:
- Navigate to `chrome://flags`
- Search for and enable:
  - **"Prompt API for Gemini Nano"** → Enabled
  - **"Optimization Guide on Device Model"** → Enabled
- Click "Relaunch" to restart Chrome

#### 3. Download Gemini Nano Model

Download the AI model:
- Navigate to `chrome://components`
- Find **"Optimization Guide On Device Model"**
- Click "Check for update" and wait for download to complete (~2GB, may take several minutes)
- The status should show "Up to date"

#### 4. Get Origin Trial Token ⚠️ REQUIRED

**This is a critical step:**

1. Visit https://developer.chrome.com/origintrials/
2. Sign in and register for "Built-in AI Early Preview Program"
3. Get your token (you'll need your extension ID first - see step 6 below)
4. See [`ORIGIN_TRIAL_SETUP.md`](ORIGIN_TRIAL_SETUP.md) for detailed instructions

### Install Termz Extension

1. **Clone or download this repository:**
   ```bash
   # Clone the repository
   git clone https://github.com/AmirmLotfy/termz.git
   cd termz
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **"Developer mode"** (toggle in top-right)
   - Click **"Load unpacked"**
   - Select the `Termz` directory

3. **Verify installation:**
   - You should see the Termz icon in your extensions toolbar
   - Visit any privacy policy page (e.g., https://policies.google.com/privacy)
   - The extension should detect the legal content and show a notification

## Usage

### Automatic Mode
1. Simply browse the web normally
2. When you visit a legal document page, Termz will automatically detect it
3. A notification will appear: "Legal document detected - Analyze with Termz?"
4. Click the notification or the Termz icon to open the side panel
5. View the comprehensive analysis with risk indicators

### Manual Analysis
1. Click the Termz extension icon to open the side panel
2. Choose one of three options:
   - **Paste text**: Copy legal text and paste it into the text area (character counter shows input length)
   - **Upload file**: Click "Click to upload or drag file here" or drag and drop a PDF, TXT, DOC, or DOCX file
   - **Right-click**: Select text on any page, right-click, and choose "Analyze selected text with Termz"
3. Click "Analyze" and wait for the AI to process the document
4. Review the results in the side panel

### Understanding the Analysis

**Risk Score Gauge:**
- 🟢 **Low**: Document is relatively fair with minimal concerns
- 🟡 **Medium**: Some concerning clauses that warrant attention
- 🔴 **High**: Multiple problematic clauses that may put you at risk

**Risk Alerts Tab:**
- Lists specific problematic clauses
- Shows severity level (High/Medium/Low)
- Explains why each clause is concerning
- Provides plain-language interpretation

**Glossary Tab:**
- Defines legal terms found in the document
- Simple explanations for complex terminology
- Click terms to expand definitions

**Summary Tab:**
- Executive summary for quick overview
- Key points highlighting critical information
- Full detailed summary with section breakdown

## Privacy & Security

**100% Local Processing:**
- All AI analysis happens on your device using Chrome's built-in Gemini Nano
- No data is sent to external servers
- No cloud APIs or third-party services
- No telemetry or analytics collected

**Your Data:**
- Analyzed documents are stored locally in your browser only
- You can delete history anytime from settings
- No tracking, no data sharing, ever

## Technical Architecture

### Chrome APIs Used
- **Prompt API**: Main analysis engine for legal document processing
- **Summarizer API**: Generates concise summaries
- **Rewriter API**: Translates legal jargon to plain language
- **Writer API**: Creates glossary definitions
- **Side Panel API**: Persistent, non-intrusive UI
- **Notifications API**: Detection alerts
- **Storage API**: Local history and preferences
- **Context Menus API**: Right-click analysis

### Technology Stack
- Vanilla JavaScript (no frameworks)
- Manifest V3 compliant
- No build step required
- Fully modular architecture

### File Structure
```
termz/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content.js            # Page detection script
├── sidepanel/
│   ├── sidepanel.html    # Side panel UI
│   ├── sidepanel.css     # Styling & dark mode
│   └── sidepanel.js      # UI logic
├── utils/
│   ├── ai-analyzer.js    # AI API integration
│   ├── detector.js       # Legal page detection
│   ├── storage.js        # Data persistence
│   └── pdf-parser.js     # Document parsing (PDF/DOCX)
├── vendor/               # Bundled libraries
│   ├── pdfjs/           # PDF.js for PDF parsing
│   └── mammoth/         # Mammoth.js for DOCX parsing
└── icons/                # Extension icons (16, 48, 128, 256, 512)
```

## Settings & Customization

Access settings by clicking the gear icon in the side panel:

### Detection & Notifications
- **Auto-detection**: Toggle automatic legal page detection
- **Notifications**: Enable/disable detection alerts
- **Auto-Open Side Panel**: Automatically open the side panel when legal documents are detected

### Analysis Preferences
- **Analysis Depth**: Choose between Quick Scan, Standard, or Deep Analysis
- **Output Language**: Select AI output language - English (en), Spanish (es), or Japanese (ja)

### Appearance
- **Theme**: Choose Auto (system preference), Light, or Dark mode

### AI Status
- **API Availability**: View real-time status of Chrome's Built-in AI APIs
  - Shows which APIs are ready, require tokens, or need model download
  - **Prepare Model**: If an API shows "Download Needed", click "Prepare" to download the on-device model
  - **Diagnostics**: Expand "Show diagnostics" to see raw API status data for troubleshooting
- **Refresh Status**: Manually refresh API availability

### Site Exclusions
- **Domain Exclusions**: Add domains (e.g., `example.com`) to never analyze automatically

### Data Management
- **Export Data**: Download all settings and analysis history as JSON
- **Clear All Data**: Remove all stored settings, history, and exclusions

### About
- Extension version information
- Link to Privacy Policy: https://termz.it.com/privacy

## Browser Compatibility

- **Supported**: Chrome Dev/Canary 138+
- **Requires**: Gemini Nano enabled (see installation instructions)
- **OS**: Windows, macOS, Linux, ChromeOS

## Troubleshooting

### "AI APIs not available" Error
- Ensure you're using Chrome Dev or Canary version 138+
- Verify flags are enabled in `chrome://flags`
- Check model is downloaded in `chrome://components`
- **Check API Status**: Go to Settings → AI Status to see which APIs are available
- If an API shows "Download Needed", click the "Prepare" button to download the model
- Use the "Show diagnostics" expander to see detailed API status information
- Ensure all 3 Origin Trial tokens are correctly added to `manifest.json`
- Restart Chrome after making changes

### Detection Not Working
- Check that the extension has permission for `<all_urls>`
- Visit `chrome://extensions` and ensure Termz is enabled
- Try manually analyzing text to verify AI is working
- Check browser console for errors (F12)

### Analysis Takes Too Long
- Large documents (>10,000 words) may take 10-15 seconds
- First analysis may be slower while model initializes
- Check your computer's available memory

### Notification Not Appearing
- Verify notifications are enabled in extension settings
- Check browser notification permissions
- Some websites may not trigger detection (low confidence)

## Development

Want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/AmirmLotfy/termz.git
cd termz

# No build step needed! Just load in Chrome
```

### Testing
1. Load extension in Chrome Developer mode
2. Visit test pages (included in `/test/pages/`)
3. Check browser console for errors
4. Verify all features work as expected

## Hackathon Information

**Built for:** Google Chrome Built-in AI Challenge 2025

**APIs Showcased:**
- Prompt API (multimodal text analysis)
- Summarizer API
- Rewriter API  
- Writer API

**Why Termz?**
- Solves universal problem users face daily
- Innovative auto-detection reduces friction
- Showcases multiple AI APIs working together
- Privacy-first design aligned with Chrome's values
- Production-ready with professional UI/UX

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built with Chrome's Built-in AI APIs (Gemini Nano)
- Icons designed with modern web design principles
- Inspired by the need for legal document transparency

## Contact & Support

- **Website**: https://termz.it.com
- **Privacy Policy**: https://termz.it.com/privacy
- **Support**: Contact via https://termz.it.com

---

**Empowering users to make informed decisions, one legal document at a time.** 🛡️

