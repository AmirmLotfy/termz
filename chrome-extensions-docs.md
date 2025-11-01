# Chrome Extensions Comprehensive Documentation (.md)

---

## Chrome Extensions Manifest APIs Reference

Chrome extensions rely on a broad set of APIs, accessible through the `chrome` namespace. These include:

- **accessibilityFeatures**: Manage Chrome accessibility features. Requires `accessibilityFeatures.read`/`modify` permission.
- **action**: MV3+; Controls toolbar icon and popup.
- **alarms**: Schedule periodic/code execution.
- **audio** (ChromeOS only): Controls system audio devices.
- **bookmarks**: Create/manipulate bookmarks.
- **browsingData**: Remove user browsing data.
- **certificateProvider** (ChromeOS only): Expose certificates for TLS.
- **commands**: Add keyboard shortcuts.
- **contentSettings**: Set per-site content policies (cookies, JS, etc).
- **contextMenus**: Add custom items to right-click menus.
- **cookies**: Read/modify browser cookies.
- **debugger**: Attach to tabs for remote debugging.
- **declarativeContent**: Trigger actions based on page content.
- **declarativeNetRequest**: MV3+; Block/modify network requests with declarative rules (replaces blocking `webRequest`).
- **desktopCapture**: Capture screenshots of specific content.
- **devtools APIs**: Powerful tools for integrating with Chrome Devtools (panels, performance, recorder, network, inspected window).
- **dns**: DNS resolution.
- **documentScan** (ChromeOS only): Access images from scanners.
- **dom**: MV3+; Special DOM APIs for extensions.
- **downloads**: Programmatic download control.
- **enterprise APIs** (ChromeOS only): Read device/network/platform attributes; policy-based.
- **events**: Listen for events across APIs.
- **extension/extensionTypes**: Core utilities, type declarations, messaging.
- **fileBrowserHandler/fileSystemProvider** (ChromeOS): Integrate with file manager.
- **fontSettings**: Manage Chrome font settings.
- **gcm**: Messaging via Firebase Cloud Messaging.
- **history**: Manage history; override default page.
- **i18n**: Internationalization support.
- **identity**: OAuth2 access tokens.
- **idle**: Detect machine idle state.
- **input.ime** (ChromeOS): Custom input method editors.
- **instanceID**: Read instance ID.
- **loginState** (ChromeOS): Monitor login status.
- **management**: Manage installed apps/extensions.
- **notifications**: Create system notifications.
- **offscreen**: MV3+; work with DOM/background outside user context.
- **omnibox**: Register omnibox (address bar) keyword handlers.
- **pageCapture**: Save pages as MHTML.
- **permissions**: Request/release permissions.
- **platformKeys** (ChromeOS): Certificate/key management.
- **power**: Override power management.
- **printerProvider/printing/printingMetrics** (ChromeOS): Print support, fetch print usage data.
- **privacy**: Control features affecting privacy.
- **processes/proxy**: Experiment/override browser processes; set proxy.
- **readingList**: MV3+; Access/modify reading list items.
- **runtime**: Service worker, lifecycle, manifest info, URL conversions.
- **scripting**: MV3+; Execute scripts in different contexts.
- **search**: MV3+; Integrate search provider.
- **sessions**: Query/restore browsing sessions.
- **sidePanel**: MV3+; Show custom content in side panel.
- **storage**: Store/retrieve/track user data (now supports promises).
- **system.cpu/display/memory/storage**: System metadata.
- **systemLog** (ChromeOS): Record logs.
- **tabCapture/tabGroups/tabs**: Manage tabs and media streams.
- **topSites**: Access most visited sites.
- **tts/ttsEngine**: Text-to-speech; register speech engines.
- **types**: Chrome API type declarations.
- **userScripts**: MV3+; Inject user scripts.
- **vpnProvider** (ChromeOS): Build VPNs.
- **wallpaper** (ChromeOS): Settings.
- **webAuthenticationProxy**: MV3+; WebAuthn handling for remote desktop.
- **webNavigation**: Listen to navigation events.
- **webRequest**: Observe/analyze traffic (blocking version deprecated in MV3).
- **windows**: Manage browser windows.

Most APIs require annotation within `manifest.json` (permissions, actions, background contexts) and are asynchronous (support Promises in MV3)[4].

---

## Chrome Extension Manifest V3 Documentation

Manifest V3 (MV3) introduces sweeping changes for extension security, privacy, and performance:

- **Background pages replaced by Service Workers**: Event-based, limited lifecycle (terminate when idle). No global state—use `chrome.storage` for persistence. No DOM access (use Offscreen API if needed).
- **No remotely hosted code**: All logic must be submitted/reviewed in the package. No `<script>` from remote URLs, no `eval()` of server-fetched strings.
- **Declarative Net Request API**: Replaces blocking `webRequest`. Define static and dynamic filtering rules via manifest, with strong restrictions on request interception/access to sensitive data.
- **Unified Actions**: `browser_action` and `page_action` merge into `action` key.
- **web_accessible_resources**: MV3 uses an object structure (resources, matches, extension IDs).
- **Content Security Policy (CSP)**: Now declared as an object with strict directives; no `unsafe-eval`.
- **API upgrades**: Widespread Promise support, new `sidePanel`, `offscreen`, and improved storage/session APIs.
- **Migration Timeline**: MV2 disables for Dev/Beta in Chrome 127 (June 2024), full phase-out for stable channel follows; enterprises with policy have until June 2025

Key Manifest.json migration steps:

```json
// Old V2
{
  "manifest_version": 2,
  "background": { "scripts": ["bg.js"] },
  "browser_action": { "default_icon": "icon.png" },
  "web_accessible_resources": ["script.js"]
}
// New V3
{
  "manifest_version": 3,
  "background": { "service_worker": "bg.js" },
  "action": { "default_icon": "icon.png" },
  "web_accessible_resources": [{
    "resources": ["script.js"],
    "matches": ["https://example.com/*"],
    "extension_ids": []
  }]
}
```

- Use storage/session for persistent state (no globals)
- Bundle scripts (single service worker per extension)
- Replace imperative network interception with declarative rules
- Plan for tighter extension code packaging and frequent updates when logic changes

See full migration guides and step-by-step details for more advanced scenarios, including handling multi-file service workers (via `importScripts()`), offscreen document creation, and declarative rules strategy[2][1][5].

---

## Troubleshooting Docs and Typical Chrome Extension Errors

### Typical Chrome Extension Issues & Solutions

- **Extension does not load or crashes:**
  - *Restart Chrome*, *reinstall extension*, *verify login status*, *check for conflicting extensions (disable others)*.
  - *Assign all needed permissions in manifest*, *pin extension in toolbar*, *check team/account status*.
- **Persistent logout or missing buttons:**
  - Enable **third-party cookies** (Chrome > Settings > Content > Cookies) for required extension communication.
- **Not showing up or not working after install:**
  - Reinstall from Chrome Web Store, *verify manifest and permissions* are correct, *clear browser cache*, *disable new conflicting extensions*.
  - Diagnose by right-clicking extension UI, *Inspect Element > Console* for visible errors, screenshot and consult support teams.

### Errors with Extension JavaScript

- **chrome-extension:// errors**
  - JavaScript stack traces show paths like `chrome-extension://{id}/content.js`. These are almost always errors in user extensions, *not site/application code*.
  - Most frequent error sources: Ad blockers, content filters, password managers, form fillers, UI/productivity injectors, developer tools, shopping extensions.
  - *Filter out these errors in error monitoring* (ignore `chrome-extension://` patterns).
  - Test site/app in *Chrome Incognito Mode* to ensure extension independence.

### Diagnosing & Filtering Extension Errors

- Focus on fixing application errors, not extension ones (extensions fail independently)
- *Use extension console, content scripts, background script logs* to debug your extension
- *Monitor patterns, trends of extension errors* for insights about user extension conflicts[23][12][9].

---

## Chrome Web Store Policies & Quality Guidelines (2025)

**Key Chrome Web Store Rules for Extensions:**

- **Value and uniqueness:** Extensions must add useful, unique functionality—no spam, no clones
- **Strict user data/privacy:** Collect, use, share data only as described in extension's listing and privacy policy; consent required for sensitive data
- **Security:** No viruses, malware, spyware, or code obfuscation. Use only permitted APIs for intended use case; minification is allowed, but hiding logic is not
- **Explicit permissions:** Only request lowest permissions needed for features; disclose all permissions
- **Prohibited content:** No adult, violent, hateful, illegal, gambling, or regulated content; real-money gambling/extensions explicitly banned
- **Responsible marketing:** Honest listings, no deceptive install flows
- **Listing requirements:** Clear and complete descriptions, icons, screenshots, privacy info; no keyword spam, blank descriptions, or vague listings
- **Single purpose:** Each extension must have a clear, narrow, easily explained purpose. Avoid sprawling toolbars; bundle only closely related features
- **Spam/abuse:** No duplicate extensions from same developer; no fake reviews/ratings
- **Affiliates & ads:** Must disclose affiliate activity and show tangible benefits to user. Ads must not hide or interfere with native site/app ads and must be removable
- **Quality:** Extensions must work as described, not break or mislead, and not interfere with core browsing experience

*Quality Guidelines FAQ updated (2025): clearer rules for new tab extensions and single-purpose compliance. Appeals process streamlined to one appeal per violation. Review product ranking, enforcement, and removal guidance in the official Developer Policy Center[24][21].*

---

## Additional Resources & Migration Tools

- **Chrome Extension Manifest Converter**: Official tool to migrate MV2 manifests to MV3 (not fully automatic, some manual work always required)[10].
- **Migration documentation, API reference, developer communities (Chromium Extensions group):** Best practice for learning new APIs, changes, and migration challenges[1][2].

---

## References
- [1]: The Complete Guide to Migrating Chrome Extensions from Manifest V2 to Manifest V3
- [2]: Extensions / Manifest V3 - Chrome for Developers
- [4]: API reference - Chrome for Developers
- [5]: Overview and timelines for migrating to Manifest V3 - Microsoft Docs
- [9]: How to Add and Install Extensions in Google Chrome
- [10]: GoogleChromeLabs/extension-manifest-converter
- [12]: Chrome extension troubleshooting guide - Interseller
- [21]: Chrome Web Store policy updates: ensuring clarity and consistency
- [23]: How to fix "chrome-extension://" Errors - TrackJS
- [24]: Chrome Web Store Developer Program Policies

---

**For full, up-to-date docs and checklists, always consult the official Chrome Developer documentation and Web Store policy center.**


Business name/contact section omitted for this batch; let me know the branding details if needed for header/footer sections.