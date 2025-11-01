# Privacy Policy for Termz

**Last Updated**: October 30, 2025

## Overview

Termz is committed to protecting your privacy. This privacy policy explains how Termz handles data.

## Data Collection

**Termz collects NO personal data whatsoever.**

- No usage analytics
- No telemetry
- No tracking
- No cookies
- No external API calls
- No data transmission to servers

## Data Processing

All document analysis is performed **100% locally** on your device using Chrome's built-in AI (Gemini Nano).

### What happens to documents you analyze:

1. **Page Content**: When you visit a webpage, Termz reads the page content to detect if it's a legal document. This happens entirely in your browser and is never transmitted anywhere.

2. **Analysis Results**: When you analyze a document, the AI processing happens on your device. The results are stored locally in your browser's storage only.

3. **History**: Your analysis history is stored locally in Chrome's storage API. It never leaves your device and is only accessible to you.

## Data Storage

Termz stores the following data **locally on your device only**:

- **Analysis History**: Results of documents you've analyzed (stored in `chrome.storage.local`)
- **Settings**: Your preferences (auto-detection, notifications, etc.)
- **Exclusions**: List of websites you've chosen to exclude from detection

### You control your data:

- View your data: Check Settings → Analysis History
- Export your data: Settings → Export All Data
- Delete your data: Settings → Clear All Data

## Permissions Explained

Termz requests the following permissions:

### `<all_urls>` (Access your data on all websites)
**Why**: To detect legal documents as you browse. Termz only reads page content to identify privacy policies and terms of service. It never modifies pages or collects your browsing data.

### `storage`
**Why**: To save your analysis history and settings locally on your device.

### `sidePanel`
**Why**: To display the analysis interface in Chrome's side panel.

### `notifications`
**Why**: To alert you when a legal document is detected (you can disable this).

### `contextMenus`
**Why**: To add the "Analyze selected text with Termz" option to your right-click menu.

### `tabs`
**Why**: To detect when you're viewing a legal document and to open the side panel when requested.

## Third-Party Services

### Chrome Built-in AI (Gemini Nano)

Termz uses Chrome's built-in AI APIs for document analysis:
- **Prompt API**: For analyzing legal text
- **Summarizer API**: For generating summaries
- **Rewriter API**: For simplifying legal jargon
- **Writer API**: For creating glossaries

**Important**: These AI models run entirely on your device. Google does not receive your analyzed documents. This is different from cloud-based AI services.

### Optional External Libraries (for file upload)

If you upload PDF or DOCX files, Termz may load these libraries from CDN:
- PDF.js (for PDF text extraction)
- Mammoth.js (for DOCX text extraction)

These libraries run in your browser and do not send your documents anywhere. However, your browser will make a request to the CDN to download the library code (not your documents).

**You can use Termz without ever uploading files**, which avoids loading any external libraries.

## Your Rights

Since Termz stores all data locally on your device, you have complete control:

- **Access**: All data is in your browser's local storage
- **Export**: Use the "Export All Data" feature
- **Delete**: Use the "Clear All Data" feature
- **Opt-out**: Disable auto-detection or uninstall the extension

## Children's Privacy

Termz does not knowingly collect data from anyone, including children under 13. Since no data is collected at all, there are no special provisions needed.

## Changes to This Policy

We may update this privacy policy occasionally. The "Last Updated" date at the top will reflect any changes. Continued use of Termz after changes constitutes acceptance of the updated policy.

## Open Source

Termz is open source software. You can review the entire codebase to verify these privacy claims:

**Website**: [https://termz.it.com](https://termz.it.com)

## Contact

If you have questions about this privacy policy:

- **Support**: [https://termz.it.com](https://termz.it.com)
- **Privacy Policy**: [https://termz.it.com/privacy](https://termz.it.com/privacy)

## Summary

**Termz is privacy-focused by design:**

✅ Zero data collection  
✅ Zero external data transmission  
✅ 100% local AI processing  
✅ You control all your data  
✅ Open source and auditable  

---

*This extension operates in accordance with Chrome Web Store policies and GDPR principles, despite not being technically subject to GDPR (since no personal data is collected).*

