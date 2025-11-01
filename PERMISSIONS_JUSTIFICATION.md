# Permissions Justification for Termz Extension

This document explains why each permission requested by the Termz extension is necessary for its core functionality.

## Overview

Termz is a single-purpose extension designed to analyze legal documents (privacy policies, terms of service, legal agreements) using Chrome's built-in AI. All permissions requested are directly related to this singular purpose.

## Permission Breakdown

### `sidePanel`
**Why needed**: Termz displays analysis results in Chrome's side panel, providing a non-intrusive interface that doesn't interfere with the user's browsing experience. The side panel allows users to view detailed analysis results, risk assessments, glossaries, and summaries without leaving the webpage they're analyzing.

**Usage**: Opens automatically when legal documents are detected (if user has enabled auto-open) and can be manually opened via the extension icon.

### `tabs`
**Why needed**: 
- To detect when users navigate to legal document pages
- To extract the URL and title of the current tab for analysis context
- To open the side panel in the context of the active tab
- To provide tab-specific analysis history

**Usage**: Read-only access to tab URLs and titles. No modification of tab content occurs.

### `notifications`
**Why needed**: To alert users when a legal document is detected on the current page. This feature can be disabled in settings, but provides valuable proactive protection by drawing attention to potentially important legal content.

**Usage**: Creates a single notification when legal content is detected, with buttons to analyze or dismiss. Users can disable notifications entirely in extension settings.

### `storage`
**Why needed**: 
- To save analysis history locally on the user's device
- To store user preferences (auto-detection settings, theme, analysis depth)
- To maintain site exclusion lists
- To preserve settings across browser sessions

**Usage**: Uses Chrome's local storage API (`chrome.storage.local`). All data remains on the user's device and is never transmitted externally.

### `contextMenus`
**Why needed**: Allows users to right-click on selected text and choose "Analyze selected text with Termz" from the context menu. This provides quick access to manual analysis without opening the side panel first.

**Usage**: Adds a single menu item to the right-click context menu. Only appears when text is selected.

### `<all_urls>` (host_permissions)
**Why needed**: Termz needs to analyze legal documents across the entire web. Legal documents can appear on any website (e.g., `example.com/privacy`, `company.com/terms`, `service.com/legal`). The extension must be able to:
- Detect legal document pages on any domain
- Read page content to identify if it's a legal document
- Extract text for analysis when legal content is detected

**Usage**: 
- **Read-only access**: The extension only reads page content to detect and analyze legal documents
- **No modification**: The extension never modifies page content, injects scripts into web pages, or changes how websites function
- **Content script**: Runs minimally with `requestIdleCallback` to avoid impacting page performance
- **Detection only**: When not analyzing, the content script performs minimal detection checks

**Privacy considerations**:
- Content is only read when legal documents are detected
- All analysis happens locally using Chrome's built-in AI
- No data is transmitted to external servers
- Users can exclude specific domains from detection

## Single Purpose Compliance

All permissions serve the single, clearly defined purpose of **analyzing legal documents to identify risks and translate jargon into plain language**. Every permission directly supports this core functionality:

- **sidePanel**: Displays analysis results
- **tabs**: Accesses current page for detection and analysis
- **notifications**: Alerts users to detected legal documents
- **storage**: Preserves analysis history and preferences
- **contextMenus**: Provides quick manual analysis access
- **<all_urls>**: Enables detection across all websites where legal documents may appear

## Permission Minimization

Termz follows the principle of requesting only the minimum permissions necessary:

- ✅ No `activeTab` alternative: `<all_urls>` is necessary because detection must happen automatically as users browse, not just when they click the extension icon
- ✅ No `webNavigation` or `webRequest`: We only need to read page content, not monitor navigation or network requests
- ✅ No `scripting`: We use content scripts with minimal impact, not programmatic injection
- ✅ No `downloads`: File uploads are handled via standard HTML file input, no download API needed
- ✅ No `clipboardRead`: Users manually paste text or upload files, no clipboard access required

## User Control

Users maintain full control over permissions through settings:

- **Auto-detection**: Can be disabled (no longer reads page content automatically)
- **Notifications**: Can be disabled (no notification permission used)
- **Site Exclusions**: Can exclude domains from detection (reduces `<all_urls>` usage on those sites)
- **History**: Can be cleared at any time (reduces storage usage)
- **Uninstallation**: All data deleted when extension is removed

## Compliance with Chrome Web Store Policies

This permission set complies with Chrome Web Store policies:

- ✅ **Single Purpose**: All permissions serve the single purpose of legal document analysis
- ✅ **Transparency**: Users understand why each permission is needed (this document + store listing)
- ✅ **Minimization**: Only requests permissions absolutely necessary for core functionality
- ✅ **User Control**: Users can disable features that require permissions
- ✅ **Privacy**: All processing is local, no external data transmission

## Additional Context

Termz operates entirely locally:
- No external API calls
- No data transmission
- No telemetry or analytics
- All AI processing uses Chrome's on-device Gemini Nano

This local-first approach means that while we request `<all_urls>` to detect legal documents across the web, we never transmit any of that content externally. Users can review the entire source code to verify these claims.

