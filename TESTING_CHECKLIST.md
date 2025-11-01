# Testing Checklist - Termz Extension

This comprehensive testing checklist ensures the Termz extension is production-ready for Chrome Web Store submission.

## Pre-Testing Setup

- [ ] Chrome Dev or Canary 138+ installed
- [ ] Required flags enabled in `chrome://flags`
- [ ] Gemini Nano model downloaded via `chrome://components`
- [ ] Extension loaded in developer mode
- [ ] Browser console open (for error checking)
- [ ] Test legal document pages bookmarked

---

## 1. Installation & Initialization

### Fresh Installation
- [ ] Extension installs without errors
- [ ] Extension icon appears in toolbar
- [ ] Default settings initialize correctly
- [ ] Welcome state displays in side panel on first open
- [ ] No console errors on installation
- [ ] Context menu items created successfully

### Settings Initialization
- [ ] Auto-detection is enabled by default
- [ ] Notifications are enabled by default
- [ ] Auto-open panel is enabled by default
- [ ] Analysis depth defaults to "Standard"
- [ ] Output language defaults to "English"
- [ ] Theme defaults to "Auto"
- [ ] History is empty on fresh install

---

## 2. Auto-Detection

### Detection Accuracy
- [ ] Privacy policy pages are detected (e.g., policies.google.com/privacy)
- [ ] Terms of service pages are detected
- [ ] Legal document URLs trigger detection
- [ ] Non-legal pages are not incorrectly detected
- [ ] Detection confidence scoring works correctly

### Detection Visual Indicator
- [ ] Visual indicator appears on detected pages
- [ ] Indicator is non-intrusive
- [ ] Indicator position is correct (bottom-right)
- [ ] Indicator disappears when navigating away

### Notification Behavior
- [ ] Notification appears when legal document detected
- [ ] Notification has correct title and message
- [ ] "Analyze Now" button opens side panel
- [ ] "Dismiss" button closes notification
- [ ] Notification auto-clears after timeout
- [ ] No duplicate notifications for same page

### Auto-Open Panel
- [ ] Side panel opens automatically when detection occurs (if enabled)
- [ ] Panel shows loading state
- [ ] Analysis begins automatically
- [ ] Works when setting is disabled (no auto-open)

### Exclusion List
- [ ] Excluded domains are not detected
- [ ] Adding exclusion works correctly
- [ ] Removing exclusion works correctly
- [ ] Exclusion persists across browser restarts
- [ ] Wildcard/subdomain exclusions work (if implemented)

---

## 3. Manual Analysis

### Text Input Analysis
- [ ] Text area accepts input
- [ ] Character counter updates correctly
- [ ] Paste works correctly
- [ ] "Analyze Text" button is disabled when empty
- [ ] "Analyze Text" button enables when text entered
- [ ] Analysis starts when button clicked
- [ ] Loading state displays during analysis
- [ ] Results display correctly after analysis
- [ ] Error handling for very short text (<100 chars)
- [ ] Error handling for very long text (>10,000 chars)

### File Upload
- [ ] File input accepts clicks on upload area
- [ ] File picker opens when area is clicked
- [ ] Drag and drop works correctly
- [ ] PDF files upload and parse correctly
- [ ] TXT files upload and parse correctly
- [ ] DOCX files upload and parse correctly
- [ ] File size validation works (10MB limit)
- [ ] Invalid file types show error
- [ ] File progress indicator displays
- [ ] Selected file displays with name and size
- [ ] Remove file button works
- [ ] "Analyze Document" button enables when file selected
- [ ] Analysis starts when button clicked
- [ ] Error handling for corrupted files
- [ ] Error handling for unsupported formats

### Context Menu Analysis
- [ ] Right-click menu item appears when text selected
- [ ] Menu item text is correct: "Analyze selected text with Termz"
- [ ] Clicking menu item opens side panel
- [ ] Selected text appears in analysis interface
- [ ] Analysis begins automatically
- [ ] Works on different websites

---

## 4. AI Features & Analysis

### Risk Detection
- [ ] Risks are detected in legal documents
- [ ] Risk severity levels are assigned (high/medium/low)
- [ ] Risk descriptions are clear and helpful
- [ ] Risk gauge displays correct score
- [ ] Risk gauge needle animates correctly
- [ ] Risk label matches score (Low/Medium/High)
- [ ] Risk description is contextual

### Executive Summary
- [ ] Executive summary is generated
- [ ] Summary is concise (2-3 sentences)
- [ ] Summary is accurate and relevant
- [ ] Summary displays in correct language

### Key Points
- [ ] Key points list is generated
- [ ] 5-7 key points are extracted
- [ ] Points are clear and actionable
- [ ] Points display correctly in list format

### Full Summary
- [ ] Full summary is comprehensive
- [ ] Summary breaks down document by sections
- [ ] Summary is easy to read
- [ ] Summary scrolls correctly if long

### Glossary
- [ ] Legal terms are identified
- [ ] Terms have clear definitions
- [ ] Definitions are in plain language
- [ ] Glossary displays in expandable format
- [ ] Empty glossary handled gracefully (no terms found)

### Output Language
- [ ] English (en) output works correctly
- [ ] Spanish (es) output works correctly
- [ ] Japanese (ja) output works correctly
- [ ] Language setting persists
- [ ] Language changes apply to new analyses

---

## 5. AI Status & Model Management

### API Status Display
- [ ] API status checks run correctly
- [ ] Status displays for each API (Prompt, Summarizer, Writer, Rewriter)
- [ ] Status badges are color-coded correctly
- [ ] Token requirement is shown correctly
- [ ] "Unavailable" status is handled gracefully
- [ ] "After-download" status shows Prepare button
- [ ] "Readily" status shows Available badge

### Model Preparation
- [ ] Prepare button appears when model needs download
- [ ] Prepare button triggers model download
- [ ] Progress bar displays during download
- [ ] Progress updates correctly
- [ ] Model becomes ready after download
- [ ] Error handling for download failures
- [ ] Timeout handling works correctly

### Diagnostics
- [ ] "Show diagnostics" expander works
- [ ] Raw API status data displays correctly
- [ ] JSON formatting is readable

---

## 6. Settings

### Auto-Detection Toggle
- [ ] Toggle enables/disables auto-detection
- [ ] Setting persists across restarts
- [ ] Detection stops when disabled
- [ ] Detection resumes when enabled

### Notifications Toggle
- [ ] Toggle enables/disables notifications
- [ ] Setting persists across restarts
- [ ] Notifications stop when disabled
- [ ] Notifications resume when enabled

### Auto-Open Panel Toggle
- [ ] Toggle enables/disables auto-open
- [ ] Setting persists across restarts
- [ ] Panel doesn't auto-open when disabled
- [ ] Panel auto-opens when enabled

### Analysis Depth
- [ ] Quick Scan option works
- [ ] Standard option works
- [ ] Deep Analysis option works
- [ ] Setting persists across restarts
- [ ] Depth affects analysis quality appropriately

### Output Language
- [ ] Language dropdown works
- [ ] All three languages (en, es, ja) available
- [ ] Setting persists across restarts
- [ ] Language affects AI outputs

### Theme Selection
- [ ] Auto theme follows system preference
- [ ] Light theme applies correctly
- [ ] Dark theme applies correctly
- [ ] Theme persists across restarts
- [ ] Theme toggle button works (in header)

### Site Exclusions
- [ ] Adding exclusion works
- [ ] Exclusion appears in list
- [ ] Removing exclusion works
- [ ] Exclusions persist across restarts
- [ ] Invalid domain format shows error

### Data Management
- [ ] Export Data button works
- [ ] Exported data is valid JSON
- [ ] Export includes all user data
- [ ] Clear All Data button works
- [ ] Clear shows confirmation (if implemented)
- [ ] Clear removes all data correctly

---

## 7. History

### History Display
- [ ] History list displays correctly
- [ ] Past analyses are shown
- [ ] Analysis metadata is correct (date, title, URL)
- [ ] Empty state shows when no history
- [ ] History items are clickable
- [ ] Clicking history item displays analysis

### History Search
- [ ] Search input works
- [ ] Search filters results correctly
- [ ] Search is case-insensitive
- [ ] Search works across titles and URLs
- [ ] Empty search shows all results

### History Management
- [ ] Delete individual item works
- [ ] Clear All button works
- [ ] History limit (50 items) enforced
- [ ] Oldest items removed when limit exceeded

---

## 8. UI/UX

### Navigation
- [ ] Header buttons work (Settings, History, Theme)
- [ ] Back buttons work in Settings and History views
- [ ] Tab navigation works (Risks, Glossary, Summary, Key Points)
- [ ] Active tab is highlighted correctly
- [ ] Tab content displays correctly

### Responsiveness
- [ ] Side panel width is appropriate
- [ ] Content doesn't overflow
- [ ] Text is readable
- [ ] Buttons are properly sized
- [ ] Scrollbars appear when needed

### Dark Mode
- [ ] Dark mode applies correctly
- [ ] All elements are visible in dark mode
- [ ] Text contrast is adequate
- [ ] Colors are appropriate
- [ ] Theme toggle works

### Loading States
- [ ] Loading spinner displays during analysis
- [ ] Loading text is clear
- [ ] Progress indicators work for file uploads
- [ ] Loading states don't block UI unnecessarily

### Error States
- [ ] Error messages are user-friendly
- [ ] Error states don't show stack traces
- [ ] Retry button works on errors
- [ ] Errors are recoverable

---

## 9. Edge Cases

### Very Long Documents
- [ ] Documents >10,000 characters are truncated appropriately
- [ ] Analysis still works on truncated documents
- [ ] User is informed if truncation occurs

### Empty/Short Text
- [ ] Error message for text <100 characters
- [ ] Error is user-friendly
- [ ] Analysis doesn't attempt with too-short text

### Invalid File Types
- [ ] Error message for unsupported file types
- [ ] File input filters work (accept attribute)
- [ ] User can't select invalid files

### Large Files
- [ ] File size limit (10MB) is enforced
- [ ] Error message for oversized files
- [ ] File input prevents selection of large files (if possible)

### Network Offline
- [ ] Extension works offline (all processing is local)
- [ ] No errors when offline
- [ ] Features function normally

### Multiple Tabs
- [ ] Each tab can have independent analysis
- [ ] Side panel shows correct tab's analysis
- [ ] History is shared across tabs (expected behavior)

### API Unavailability
- [ ] Graceful degradation when APIs unavailable
- [ ] Error message is clear and helpful
- [ ] User is informed what to do
- [ ] Diagnostic info helps troubleshooting

### Rapid Actions
- [ ] Multiple rapid clicks don't cause errors
- [ ] Debouncing works on text input
- [ ] Analysis doesn't trigger multiple times
- [ ] UI remains responsive

---

## 10. Performance

### Load Time
- [ ] Side panel opens quickly (<500ms)
- [ ] Initial load doesn't freeze browser
- [ ] Content scripts load without blocking page

### Analysis Speed
- [ ] Analysis completes in reasonable time (<30s for normal docs)
- [ ] Progress indicators show activity
- [ ] Browser remains responsive during analysis

### Memory Usage
- [ ] Memory doesn't leak during multiple analyses
- [ ] Sessions are cleaned up properly
- [ ] Large documents don't cause memory issues

### Resource Usage
- [ ] Content script doesn't impact page performance
- [ ] requestIdleCallback is used appropriately
- [ ] No excessive CPU usage during idle

---

## 11. Accessibility

### ARIA Labels
- [ ] All buttons have aria-label or accessible text
- [ ] Form inputs have labels
- [ ] Interactive elements are properly labeled
- [ ] Screen reader can navigate interface

### Keyboard Navigation
- [ ] Tab key navigates through interactive elements
- [ ] Enter/Space activate buttons
- [ ] Focus indicators are visible
- [ ] No keyboard traps

### Visual Accessibility
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are clear
- [ ] Text is readable (adequate size)
- [ ] Icons have text alternatives

---

## 12. Security

### Content Security Policy
- [ ] CSP is properly configured
- [ ] No inline scripts (except allowed)
- [ ] External scripts are from allowed sources (vendor libs bundled)

### Input Sanitization
- [ ] User input is sanitized before display
- [ ] No XSS vulnerabilities
- [ ] File content is validated

### Data Handling
- [ ] No sensitive data in console logs
- [ ] No data transmitted externally
- [ ] Local storage is properly secured

---

## 13. Cross-Browser/Platform

### Chrome Dev
- [ ] Works on Chrome Dev 138+
- [ ] All features function correctly

### Chrome Canary
- [ ] Works on Chrome Canary 138+
- [ ] All features function correctly

### Operating Systems
- [ ] Works on Windows
- [ ] Works on macOS
- [ ] Works on Linux
- [ ] Works on ChromeOS

---

## 14. Policy Compliance

### Single Purpose
- [ ] Extension has one clear purpose
- [ ] All features support that purpose
- [ ] No unrelated functionality

### Privacy
- [ ] Privacy policy is accessible
- [ ] Privacy policy URL is correct
- [ ] Data collection disclosure is accurate
- [ ] No unexpected data collection

### Permissions
- [ ] All permissions are justified
- [ ] Permissions align with functionality
- [ ] No unnecessary permissions

### Code Quality
- [ ] No code obfuscation (minification OK)
- [ ] Code is readable
- [ ] No malicious code

---

## 15. Final Checks

### Console Errors
- [ ] No errors in browser console during normal use
- [ ] Warnings are acceptable (deprecation warnings OK)
- [ ] No unhandled promise rejections

### Manifest Validation
- [ ] manifest.json is valid JSON
- [ ] All required fields present
- [ ] All file paths are correct
- [ ] Icons exist and are correct sizes

### Package Validation
- [ ] Extension zips correctly
- [ ] Zip extracts to working extension
- [ ] All files included
- [ ] No unnecessary files
- [ ] File size is reasonable

### Documentation
- [ ] README is accurate
- [ ] Privacy policy is accurate
- [ ] All URLs are correct
- [ ] Contact information is correct (or clearly placeholder)

---

## Testing Sign-Off

**Tester**: _________________  
**Date**: _________________  
**Version Tested**: 1.0.0  
**Browser Version**: Chrome Dev/Canary _____  
**Overall Status**: ☐ Pass  ☐ Fail  ☐ Pass with Issues

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

