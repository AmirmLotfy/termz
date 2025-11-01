# Termz Testing Guide

This document outlines comprehensive testing procedures for the Termz Chrome extension.

## Prerequisites

Before testing, ensure:
- [ ] Chrome Dev or Canary (version 128+) is installed
- [ ] Gemini Nano is enabled and downloaded (see README.md)
- [ ] Extension is loaded in `chrome://extensions`
- [ ] No console errors on load

## Testing Checklist

### 1. Auto-Detection Testing

**Objective**: Verify legal page detection accuracy

**Test Pages** (Visit each and check for detection):
- ✓ https://policies.google.com/privacy
- ✓ https://www.facebook.com/privacy/policy/
- ✓ https://twitter.com/en/privacy
- ✓ https://www.reddit.com/policies/privacy-policy
- ✓ https://www.apple.com/legal/privacy/
- ✓ https://www.microsoft.com/en-us/privacy/privacystatement
- ✓ https://www.amazon.com/gp/help/customer/display.html?nodeId=468496
- ✓ https://www.linkedin.com/legal/privacy-policy
- ✓ https://www.github.com/site/privacy
- ✓ https://www.netflix.com/legal/privacy

**Expected Results**:
- Visual indicator appears in bottom-right
- Notification shows "Legal document detected"
- No false positives on news articles or documentation

**False Positive Tests** (Should NOT trigger):
- Regular news articles (CNN, BBC, etc.)
- Technical documentation (MDN, React docs)
- Blog posts
- Shopping pages
- Social media feeds

### 2. Side Panel UI Testing

**Test Steps**:
1. Click extension icon → Side panel opens
2. Verify all UI elements render correctly:
   - [ ] Header with logo and buttons
   - [ ] Welcome state shows initially
   - [ ] Manual input section visible
   - [ ] Dark mode respects system preference

**Dark Mode Test**:
1. Change system to dark mode
2. Reload side panel
3. Verify colors adapt correctly

### 3. Manual Text Analysis

**Test Steps**:
1. Copy sample legal text (use Google Privacy Policy excerpt)
2. Paste into text area
3. Click "Analyze Text"
4. Verify:
   - [ ] Loading spinner appears
   - [ ] Analysis completes within 10 seconds
   - [ ] Risk score displays correctly
   - [ ] Risk alerts tab shows issues
   - [ ] Glossary tab has definitions
   - [ ] Summary tab has content
   - [ ] Key points tab has bullet list

**Edge Cases**:
- [ ] Very short text (<50 chars) → Shows error
- [ ] Empty text → Button disabled
- [ ] Very long text (>10k words) → Still works

### 4. File Upload Testing

**Test Files** (Create these for testing):

**test.txt**:
```
Privacy Policy Test Document

We collect your personal information including name, email, and browsing data. 
We may share this information with third parties for marketing purposes. 
By using our service, you agree to binding arbitration and waive your right to class action lawsuits.
```

**Test Steps**:
1. Switch to "Upload File" tab
2. Upload test.txt
3. Click "Analyze Document"
4. Verify analysis runs successfully

**PDF Test** (if PDF.js loads):
1. Create simple PDF with legal text
2. Upload and analyze
3. Check text extraction works

**Error Cases**:
- [ ] Upload non-supported file → Shows error
- [ ] Upload file >10MB → Shows size error
- [ ] Upload empty file → Shows error

### 5. Analysis Results Testing

**Verify Each Tab**:

**Risk Alerts Tab**:
- [ ] Shows risk items with severity badges
- [ ] High/Medium/Low color coding correct
- [ ] Clause names displayed
- [ ] Explanations in plain language

**Glossary Tab**:
- [ ] Legal terms listed
- [ ] Click to expand definitions
- [ ] Definitions are clear

**Summary Tab**:
- [ ] Full summary text displays
- [ ] Properly formatted

**Key Points Tab**:
- [ ] Bullet points display
- [ ] Each point is readable

**Risk Gauge**:
- [ ] Needle rotates to correct position
- [ ] Color matches risk level
- [ ] Label shows Low/Medium/High

### 6. History Feature Testing

**Test Steps**:
1. Perform 3-5 analyses (different sources)
2. Click History button
3. Verify:
   - [ ] All analyses listed
   - [ ] Timestamps correct
   - [ ] Risk levels displayed
   - [ ] Click item → Loads analysis
   - [ ] Search works (type partial URL)
   - [ ] Clear History → Confirms and clears

### 7. Settings Testing

**Test Each Setting**:

**Auto-Detection Toggle**:
1. Turn OFF → Visit legal page → No indicator
2. Turn ON → Visit legal page → Indicator appears

**Notifications Toggle**:
1. Turn OFF → No browser notifications
2. Turn ON → Notifications appear

**Analysis Depth**:
1. Change to "Quick Scan"
2. Verify setting persists after reload

**Site Exclusions**:
1. Add "example.com" → Appears in list
2. Visit legal page on example.com → Not detected
3. Remove exclusion → Detection resumes

**Data Export**:
1. Click "Export All Data"
2. JSON file downloads
3. Verify contains history and settings

**Clear All Data**:
1. Click → Double confirmation
2. All history cleared
3. Settings reset to defaults

### 8. Notifications Testing

**Test Steps**:
1. Enable notifications in settings
2. Visit legal page
3. Verify:
   - [ ] Notification appears
   - [ ] Has "View Analysis" button
   - [ ] Click "View Analysis" → Opens side panel
   - [ ] Click "Dismiss" → Closes notification

### 9. Context Menu Testing

**Test Steps**:
1. Visit any webpage
2. Select some text (doesn't need to be legal)
3. Right-click → "Analyze selected text with Termz"
4. Verify:
   - [ ] Side panel opens
   - [ ] Text appears in manual input
   - [ ] Can click "Analyze"

### 10. Performance Testing

**Page Load Impact**:
1. Open DevTools → Network tab
2. Visit complex page (e.g., news site)
3. Verify:
   - [ ] Page loads in normal time
   - [ ] No visible delay
   - [ ] Content script uses <50ms CPU time

**Memory Usage**:
1. Open Task Manager (Shift+Esc in Chrome)
2. Find "Extension: Termz"
3. Verify memory usage <100MB during idle
4. Analyze 10 documents
5. Memory doesn't grow unbounded

**Long Session Test**:
1. Keep extension open for 30 minutes
2. Perform multiple analyses
3. Check for memory leaks
4. Verify no slowdown

### 11. Edge Cases

**Large Documents**:
1. Copy entire privacy policy (>10k words)
2. Paste and analyze
3. Verify: Works but may take 10-15 seconds

**Malformed HTML**:
1. Visit page with broken HTML
2. Detection should still work or fail gracefully

**Dynamic Content**:
1. Visit SPA with lazy-loaded content
2. Verify detection still works

**Multiple Tabs**:
1. Open 5 tabs with different legal docs
2. Analyze each
3. Verify no cross-contamination

### 12. Browser Console Checks

**No Errors Should Appear In**:

**Background Service Worker** (`chrome://extensions` → Termz → "service worker"):
- [ ] No errors on startup
- [ ] No errors during detection
- [ ] No errors during analysis

**Side Panel** (Right-click side panel → Inspect):
- [ ] No errors on open
- [ ] No errors during interaction

**Content Script** (Page console, F12):
- [ ] No errors on page load
- [ ] Clean `[Termz]` prefixed logs only

## Known Limitations

Document these as expected behavior:

1. **Scanned PDFs**: Cannot extract text from image-based PDFs
2. **DOC files**: Not currently supported (only DOCX, PDF, TXT)
3. **Large files**: May take 10-15 seconds to analyze
4. **AI availability**: Requires Gemini Nano to be downloaded
5. **First analysis**: May be slower while model initializes

## Reporting Issues

When reporting bugs, include:
- Chrome version
- OS version
- Steps to reproduce
- Console errors (from all 3 consoles)
- Screenshots if UI issue

## Performance Benchmarks

Target performance metrics:

- **Page Load**: <50ms additional time
- **Detection**: <1s after page load
- **Analysis**: 3-8 seconds for typical document
- **Memory**: <100MB during normal use
- **CPU**: <5% during idle

## Accessibility Testing

Test with:
- [ ] Keyboard only (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] High contrast mode
- [ ] Zoom to 200%
- [ ] Color blindness simulation tools

## Test Report Template

```markdown
## Test Report - [Date]

**Tester**: [Your Name]
**Chrome Version**: [e.g., 128.0.6545.0]
**OS**: [e.g., macOS 14.2]

### Results

**Auto-Detection**: ✅ PASS / ❌ FAIL
- Notes: [...]

**Analysis Quality**: ✅ PASS / ❌ FAIL
- Notes: [...]

**UI/UX**: ✅ PASS / ❌ FAIL
- Notes: [...]

**Performance**: ✅ PASS / ❌ FAIL
- Notes: [...]

### Issues Found

1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce: [...]

### Overall Assessment

[Summary of testing]
```

---

## Automated Testing (Future Enhancement)

For future development, consider adding:
- Unit tests for detector.js
- Integration tests for AI analyzer
- E2E tests with Puppeteer
- Visual regression tests

---

**Happy Testing! 🧪**

