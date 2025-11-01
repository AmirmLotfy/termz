# Origin Trial Token Setup Guide

## 🚨 CRITICAL UPDATE: You Need 3 SEPARATE Tokens

**Based on official Chrome documentation verification (October 2024):**

**Each experimental API requires its own unique Origin Trial token!**

## Overview

Termz uses Chrome's Built-in AI APIs, and **3 out of 4 APIs require separate Origin Trial tokens**:

| API | Status | Token Required? |
|-----|--------|----------------|
| **Prompt API (LanguageModel)** | Origin Trial | ✅ **Token #1** |
| **Summarizer API** | Stable | ❌ No token needed |
| **Writer API** | Origin Trial | ✅ **Token #2** |
| **Rewriter API** | Origin Trial | ✅ **Token #3** |

Without Origin Trial tokens, only the Summarizer API will work, which significantly limits the extension's functionality.

---

## Why 3 Separate Tokens?

According to Chrome's Origin Trials documentation:

> "Each experimental API requires its own unique origin trial token. You must register separately for each API you wish to use."

**Key Points:**
- ❌ You **CANNOT** use one token for all APIs
- ✅ You **MUST** register 3 times (once per API)
- ✅ All 3 tokens go in the **same** `trial_tokens` array
- ✅ Use the **same Extension ID** for all 3 registrations

---

## Step-by-Step Setup Instructions

### Step 1: Get Your Extension ID (Do This First!)

1. **Load the extension in Chrome:**
   - Open `chrome://extensions`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `/Users/frameless/Desktop/Termz` folder

2. **Copy your Extension ID:**
   - It appears under the extension name
   - Format: `abcdefghijklmnopqrstuvwxyz123456` (32 characters)
   - **Save this ID** - you'll need it for all 3 registrations

---

### Step 2: Register for Prompt API Token

1. **Visit:** https://developer.chrome.com/origintrials/

2. **Sign in** with your Google account

3. **Find "Prompt API"** or **"Built-in AI - Prompt API"**
   - Click "Register"

4. **Fill in the registration form:**
   - **Web Origin Type:** Select "Chrome Extension"
   - **Extension ID:** Paste your Extension ID (from Step 1)
   - Acknowledge the policies

5. **Submit** and **copy Token #1**
   - Save it somewhere safe (you'll add it to manifest.json later)

---

### Step 3: Register for Writer API Token

1. **Return to:** https://developer.chrome.com/origintrials/

2. **Find "Writer API"** or **"Built-in AI - Writer API"**
   - Click "Register"

3. **Fill in the registration form:**
   - **Web Origin Type:** Select "Chrome Extension"
   - **Extension ID:** Use the **SAME Extension ID** as Step 2
   - Acknowledge the policies

4. **Submit** and **copy Token #2**
   - Save it alongside Token #1

---

### Step 4: Register for Rewriter API Token

1. **Return to:** https://developer.chrome.com/origintrials/

2. **Find "Rewriter API"** or **"Built-in AI - Rewriter API"**
   - Click "Register"

3. **Fill in the registration form:**
   - **Web Origin Type:** Select "Chrome Extension"
   - **Extension ID:** Use the **SAME Extension ID** as Steps 2 & 3
   - Acknowledge the policies

4. **Submit** and **copy Token #3**
   - You now have all 3 tokens!

---

### Step 5: Add ALL 3 Tokens to manifest.json

1. **Open** `/Users/frameless/Desktop/Termz/manifest.json`

2. **Find the `trial_tokens` array:**
   ```json
   "trial_tokens": [
     "PLACEHOLDER_TOKEN_1_FOR_PROMPT_API",
     "PLACEHOLDER_TOKEN_2_FOR_WRITER_API",
     "PLACEHOLDER_TOKEN_3_FOR_REWRITER_API"
   ]
   ```

3. **Replace each placeholder** with your actual tokens:
   ```json
   "trial_tokens": [
     "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6...",  // Could be any API
     "Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3I2H1G0F9E8D7C6B5A4...",  // Could be any API
     "F1E2D3C4B5A6Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3I2H1G0..."   // Could be any API
   ]
   ```

4. **IMPORTANT:**
   - Keep the tokens as **separate entries** in the array (as shown above)
   - **Order DOESN'T matter!** - Tokens are self-describing (Chrome knows which is which)
   - Each token is a long string (100+ characters)
   - Tokens can be in any order - Chrome automatically identifies which API each token enables
   - **Save the file**

   > 💡 **How it works**: Each token contains encoded metadata that tells Chrome which API it's for. Chrome automatically reads all tokens and enables the correct APIs. See `HOW_TOKENS_WORK.md` for technical details.

---

### Step 6: Reload the Extension

1. Go to `chrome://extensions`
2. Find "Termz"
3. Click the **reload icon** (circular arrow)
4. The extension will now have access to all AI APIs!

---

## Verifying Token Installation

### Method 1: Use the Built-in AI Status Display

1. **Open the Termz side panel** (click the extension icon)
2. **Navigate to Settings**
3. **Scroll to "AI Status" section**
4. **Click "Refresh Status"**

**Expected result with all 3 tokens:**
```
✅ Prompt API (LanguageModel): Ready
✅ Summarizer API: Ready
✅ Writer API: Ready
✅ Rewriter API: Ready
```

**If tokens are missing:**
```
❌ Prompt API (LanguageModel): Not Present (needs token)
✅ Summarizer API: Ready
❌ Writer API: Not Present (needs token)
❌ Rewriter API: Not Present (needs token)
```

---

### Method 2: Check the Console

1. Open the extension's **background service worker console:**
   - Go to `chrome://extensions`
   - Find Termz
   - Click "service worker" (inspect views)

2. **Run this command** in the console:
   ```javascript
   (async () => {
     console.log('Checking AI APIs...');
     console.log('LanguageModel:', 'LanguageModel' in self ? 'PRESENT' : 'MISSING');
     console.log('Summarizer:', 'Summarizer' in self ? 'PRESENT' : 'MISSING');
     console.log('Writer:', 'Writer' in self ? 'PRESENT' : 'MISSING');
     console.log('Rewriter:', 'Rewriter' in self ? 'PRESENT' : 'MISSING');
   })();
   ```

3. **Expected output** (with all 3 tokens):
   ```
   LanguageModel: PRESENT
   Summarizer: PRESENT
   Writer: PRESENT
   Rewriter: PRESENT
   ```

4. **Without tokens** (or invalid/missing tokens):
   ```
   LanguageModel: MISSING
   Summarizer: PRESENT
   Writer: MISSING
   Rewriter: MISSING
   ```

---

## Troubleshooting

### Issue: Some APIs still showing as MISSING

**Possible causes:**
1. ❌ Not all 3 tokens were added to manifest.json
2. ❌ Tokens not copied correctly (check for extra spaces or line breaks)
3. ❌ Extension ID doesn't match the one used during registration
4. ❌ One or more tokens expired
5. ❌ Wrong API name during registration

**Solutions:**
1. ✅ **Double-check manifest.json** - ensure you have **3 tokens** in the array
2. ✅ **Verify each token** is complete (no truncation, no extra characters)
3. ✅ **Check Extension ID** matches across all 3 Origin Trial registrations
4. ✅ **Use the AI Status Display** to see which specific APIs are failing
5. ✅ **Restart Chrome completely**
6. ✅ **Reload the extension**
7. ✅ **Re-register** for tokens if issues persist

---

### Issue: "Origin Trial Token Expired"

Origin Trial tokens have expiration dates (usually 6 weeks to 6 months).

**Solution:**
1. Return to https://developer.chrome.com/origintrials/
2. Find your registrations under "My Registrations"
3. Renew or generate new tokens **for all 3 APIs**
4. Update **all 3 tokens** in manifest.json
5. Reload extension

---

### Issue: Extension ID Changed

If you reload the extension or move it to a different folder, the Extension ID may change.

**Solution:**
1. Get the new Extension ID from `chrome://extensions`
2. Go to Origin Trials dashboard
3. Update **all 3 registrations** with the new Extension ID
4. Get **3 new tokens** (one for each API)
5. Update manifest.json with all 3 new tokens
6. Reload extension

---

### Issue: "I only have 1 token, not 3"

**This is the problem!** According to Chrome documentation (verified Oct 2024):

> Each experimental API needs its own unique token.

**Solution:**
- You must register **3 separate times**
- Follow Steps 2, 3, and 4 above to get all 3 tokens
- Don't try to reuse the same token for multiple APIs

---

## Testing Without Tokens

If you want to test the extension before getting tokens:

1. **Summarizer API** will work (it's stable, no token needed)
2. **Other APIs** will gracefully fail with helpful error messages
3. The extension will still function, but with limited capabilities:
   - ✅ Auto-detection will work
   - ✅ Basic summarization will work
   - ❌ Risk analysis won't work (needs Prompt API)
   - ❌ Glossary generation won't work (needs Writer API)
   - ❌ Plain language translation won't work (needs Rewriter API)

---

## Alternative: Using Flags for Local Development

For **local development only** (not for distribution), you can bypass the token requirement:

1. Open Chrome flags: `chrome://flags`
2. Search for and **enable** these flags:
   ```
   #prompt-api-for-gemini-nano
   #writer-api-for-gemini-nano
   #rewriter-api-for-gemini-nano
   #summarization-api-for-gemini-nano
   ```
3. **Restart Chrome**
4. The APIs will be available without tokens

**Note:** This only works on your local machine and won't work for users who install your extension.

---

## Important Notes

### Token Validity
- Tokens are **API-specific** - you cannot reuse the same token
- Tokens are **valid for a specific Extension ID**
- Tokens **expire** after the trial period (check Origin Trials dashboard)
- You can **renew** tokens before they expire
- **All 3 tokens** must be renewed separately

### Distribution
- Include **all 3 tokens** in your published extension
- Users don't need their own tokens (yours cover everyone)
- Update **all tokens** before they expire to avoid service interruption

### Security
- Tokens are **public** and safe to include in your code
- They're tied to your Extension ID, so others can't reuse them
- Don't worry about committing tokens to Git

### Token Count
- **3 tokens minimum** for full functionality
- **4 tokens** if Summarizer also required a token (it doesn't currently)
- All tokens go in **one** `trial_tokens` array

---

## Getting Help

### Resources
- **Origin Trials Guide**: https://developer.chrome.com/docs/web-platform/origin-trials
- **Built-in AI Documentation**: https://developer.chrome.com/docs/ai/built-in-apis
- **Chrome AI Challenge**: https://googlechromeai2025.devpost.com/

### Community
- **Chrome Extensions Google Group**: https://groups.google.com/a/chromium.org/g/chromium-extensions
- **Stack Overflow**: Tag your questions with `chrome-extension` and `chrome-ai`

### Reporting Issues
If you encounter issues with Origin Trials or the AI APIs:
1. Check the [Chrome Status Dashboard](https://chromestatus.com)
2. Report bugs on [Chromium Issue Tracker](https://bugs.chromium.org)

---

## Summary Checklist

✅ **Required Steps:**
- [ ] Load extension to get Extension ID
- [ ] Register at https://developer.chrome.com/origintrials/ **FOR PROMPT API**
- [ ] Register at https://developer.chrome.com/origintrials/ **FOR WRITER API**
- [ ] Register at https://developer.chrome.com/origintrials/ **FOR REWRITER API**
- [ ] Add **ALL 3 TOKENS** to `manifest.json` in the `trial_tokens` array
- [ ] Reload the extension
- [ ] Verify in Settings → AI Status (all 4 APIs should be "Ready")

✅ **Verification:**
- Check AI Status Display: All 4 APIs should show as "Ready" or "Downloading"
- Check console: All 4 APIs should show as "PRESENT"
- Test analysis: All features should work

✅ **Maintenance:**
- Monitor expiration dates for **all 3 tokens**
- Renew **all tokens** before expiration
- Update **all tokens** in manifest.json when renewed

---

**You're all set!** Once all 3 tokens are added, Termz will have full access to all Chrome Built-in AI APIs and provide comprehensive legal document analysis. 🚀

**Remember: 3 APIs = 3 Tokens = Full Functionality!**
