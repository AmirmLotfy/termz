# Chrome Built-in AI APIs Complete Developer Guide

## Overview

Chrome's Built-in AI APIs provide powerful on-device artificial intelligence capabilities using Google's Gemini Nano model and specialized expert models. These APIs enable developers to integrate AI features directly into web applications and Chrome extensions without external API calls or cloud dependencies.

## Current API Status (October 2025)

| API | Status | Web | Extensions | Chrome Version | Requirements |
|-----|--------|-----|-----------|----------------|--------------|
| **Prompt API** | Origin Trial | Origin Trial | Chrome 138+ | Chrome 138+ | Origin Trial Token |
| **Summarizer API** | Stable | Chrome 138+ | Chrome 138+ | Chrome 138+ | Feature Detection |
| **Writer API** | Origin Trial | Chrome 137-142 | Chrome 137-142 | Chrome 137+ | Origin Trial Token |
| **Rewriter API** | Origin Trial | Chrome 137-142 | Chrome 137-142 | Chrome 137+ | Origin Trial Token |
| **Proofreader API** | Origin Trial | Chrome 141-145 | Chrome 141-145 | Chrome 141+ | Origin Trial Token |
| **Translator API** | Stable | Chrome 138+ | Chrome 138+ | Chrome 138+ | Feature Detection |
| **Language Detector API** | Stable | Chrome 138+ | Chrome 138+ | Chrome 138+ | Feature Detection |

## Hardware Requirements

### System Requirements
- **Operating System**: Windows 10/11, macOS 13+, Linux, ChromeOS (Chromebook Plus)
- **Storage**: At least 22 GB free space in Chrome profile directory
- **Network**: Unlimited data or unmetered connection for model download

### GPU Requirements
- **GPU**: More than 4 GB VRAM
- **CPU Fallback**: 16 GB RAM + 4+ CPU cores

### Unsupported Platforms
- Chrome for Android
- Chrome for iOS
- ChromeOS on non-Chromebook Plus devices

## Getting Started

### 1. Feature Detection
Always check for API availability before using any built-in AI feature:

```javascript
// Check for stable APIs
if ('Summarizer' in self) {
    console.log('Summarizer API available');
}

if ('Translator' in self) {
    console.log('Translator API available');
}

if ('LanguageDetector' in self) {
    console.log('Language Detector API available');
}

// Check for origin trial APIs
if ('LanguageModel' in self) {
    console.log('Prompt API available');
}

if ('Writer' in self) {
    console.log('Writer API available');
}

if ('Rewriter' in self) {
    console.log('Rewriter API available');
}

if ('Proofreader' in self) {
    console.log('Proofreader API available');
}
```

### 2. Origin Trial Registration

For APIs requiring origin trials (Prompt, Writer, Rewriter, Proofreader):

1. **Acknowledge** Google's Generative AI Prohibited Uses Policy
2. **Register** at the respective origin trial pages:
   - [Prompt API Origin Trial](https://developer.chrome.com/origintrials/#/view_trial/2971804120798437377)
   - [Writer/Rewriter APIs Origin Trial](https://developer.chrome.com/origintrials/#/view_trial/2971804120798437377)
   - [Proofreader API Origin Trial](https://developer.chrome.com/origintrials/#/view_trial/2971804120798437377)
3. **Include token** in your pages or extension manifest

#### Web Implementation
Add to HTML head:
```html
<meta http-equiv="origin-trial" content="YOUR_TOKEN_HERE">
```

Or add HTTP header:
```
Origin-Trial: YOUR_TOKEN_HERE
```

#### Extension Implementation
Add to manifest.json:
```json
{
  "trial_tokens": ["YOUR_TOKEN_HERE"]
}
```

### 3. Enable APIs on Localhost

For local development, enable flags in Chrome:

```
chrome://flags/#prompt-api-for-gemini-nano
chrome://flags/#writer-api-for-gemini-nano
chrome://flags/#rewriter-api-for-gemini-nano
chrome://flags/#proofreader-api-for-gemini-nano
chrome://flags/#language-detection-api
```

---

## API Documentation

## 1. Prompt API

### Overview
The Prompt API provides direct access to Gemini Nano for natural language processing tasks with multimodal support.

### Availability Check
```javascript
const availability = await LanguageModel.availability();
// Returns: 'available', 'downloadable', or 'unavailable'
```

### Basic Usage
```javascript
// Create session
const session = await LanguageModel.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});

// Non-streaming prompt
const result = await session.prompt('Write me a poem about technology');

// Streaming prompt
const stream = session.promptStreaming('Write me a long story');
for await (const chunk of stream) {
  console.log(chunk);
}
```

### Advanced Configuration
```javascript
const session = await LanguageModel.create({
  temperature: 0.8,
  topK: 40,
  initialPrompts: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
    { role: 'assistant', content: 'Hi there!' }
  ],
  expectedInputs: [
    { type: 'text', languages: ['en'] },
    { type: 'image' },
    { type: 'audio' }
  ],
  expectedOutputs: [
    { type: 'text', languages: ['en'] }
  ]
});
```

### Multimodal Capabilities
```javascript
// Image input
await session.prompt([
  { type: 'text', value: 'Describe this image:' },
  { type: 'image', value: imageFile }
]);

// Audio input
await session.prompt([
  { type: 'text', value: 'Transcribe this audio:' },
  { type: 'audio', value: audioFile }
]);
```

### JSON Schema Response
```javascript
const schema = {
  "type": "object",
  "properties": {
    "sentiment": { "type": "string", "enum": ["positive", "negative", "neutral"] },
    "confidence": { "type": "number" }
  }
};

const result = await session.prompt(
  'Analyze the sentiment of: "This product is amazing!"',
  { responseConstraint: schema }
);
```

### Session Management
```javascript
// Check usage
console.log(`${session.inputUsage}/${session.inputQuota}`);

// Clone session
const clonedSession = await session.clone();

// Destroy session
session.destroy();
```

---

## 2. Summarizer API

### Overview
Generate concise summaries from lengthy text in various formats and styles.

### Availability Check
```javascript
const availability = await Summarizer.availability();
```

### Basic Usage
```javascript
const summarizer = await Summarizer.create({
  type: 'key-points',    // 'tldr', 'teaser', 'headline', 'key-points'
  format: 'markdown',    // 'markdown', 'plain-text'
  length: 'medium',      // 'short', 'medium', 'long'
  sharedContext: 'This is a scientific article'
});

// Batch summarization
const summary = await summarizer.summarize(longText, {
  context: 'This article is for beginners'
});

// Streaming summarization
const stream = summarizer.summarizeStreaming(longText);
for await (const chunk of stream) {
  console.log(chunk);
}
```

### Summary Types
- **key-points**: Bullet point format with main ideas
- **tldr**: Quick overview for busy readers
- **teaser**: Engaging preview to encourage full reading
- **headline**: Single sentence capturing main point

### Multi-language Support
```javascript
const summarizer = await Summarizer.create({
  type: 'key-points',
  expectedInputLanguages: ['en', 'ja', 'es'],
  outputLanguage: 'es',
  expectedContextLanguages: ['en'],
  sharedContext: 'Multilingual news articles for Spanish readers'
});
```

---

## 3. Writer API

### Overview
Create new content based on prompts and context with specified tone and formatting.

### Availability Check
```javascript
const availability = await Writer.availability();
```

### Basic Usage
```javascript
const writer = await Writer.create({
  tone: 'casual',        // 'formal', 'neutral', 'casual'
  format: 'markdown',    // 'markdown', 'plain-text'
  length: 'medium',      // 'short', 'medium', 'long'
  sharedContext: 'Email to acquaintances about an event'
});

// Non-streaming writing
const result = await writer.write(
  'An invitation to my birthday party',
  { context: 'Close friends, casual tone' }
);

// Streaming writing
const stream = writer.writeStreaming(
  'A product review for a smartphone',
  { context: 'Tech-savvy audience' }
);
for await (const chunk of stream) {
  console.log(chunk);
}
```

### Multi-language Support
```javascript
const writer = await Writer.create({
  tone: 'formal',
  expectedInputLanguages: ['en', 'ja', 'es'],
  expectedContextLanguages: ['en', 'ja', 'es'],
  outputLanguage: 'es',
  sharedContext: 'Business correspondence in Spanish'
});
```

### Reusable Writer
```javascript
const writer = await Writer.create({ tone: 'formal' });

const articles = await Promise.all([
  writer.write('Blog post about AI trends'),
  writer.write('Product announcement email'),
  writer.write('Technical documentation intro')
]);
```

---

## 4. Rewriter API

### Overview
Revise and restructure existing text to change tone, length, or format.

### Availability Check
```javascript
const availability = await Rewriter.availability();
```

### Basic Usage
```javascript
const rewriter = await Rewriter.create({
  tone: 'more-formal',   // 'more-formal', 'as-is', 'more-casual'
  format: 'plain-text',  // 'as-is', 'markdown', 'plain-text'
  length: 'shorter',     // 'shorter', 'as-is', 'longer'
  sharedContext: 'Customer service responses'
});

// Non-streaming rewriting
const result = await rewriter.rewrite(
  'Thanks for your message. We will get back to you.',
  { context: 'Make it more professional and detailed' }
);

// Streaming rewriting
const stream = rewriter.rewriteStreaming(originalText, {
  context: 'Simplify for general audience'
});
for await (const chunk of stream) {
  console.log(chunk);
}
```

### Batch Rewriting
```javascript
const rewriter = await Rewriter.create({
  tone: 'more-casual',
  sharedContext: 'Product reviews'
});

const rewrittenReviews = await Promise.all(
  reviews.map(review => 
    rewriter.rewrite(review.text, {
      context: 'Remove negativity, stay constructive'
    })
  )
);
```

---

## 5. Proofreader API

### Overview
Detect and correct grammar, spelling, and punctuation errors with explanations.

### Availability Check
```javascript
const availability = await Proofreader.availability();
```

### Basic Usage
```javascript
const proofreader = await Proofreader.create({
  expectedInputLanguages: ['en']
});

const proofreadResult = await proofreader.proofread(
  'I seen him yesterday at the store, and he bought two loafs of bread.'
);

// Access corrected text
console.log(proofreadResult.corrected);

// Process corrections
proofreadResult.corrections.forEach(correction => {
  console.log(`Error at ${correction.startIndex}-${correction.endIndex}`);
  console.log(`Correction: ${correction.correction}`);
  console.log(`Type: ${correction.type}`); // 'spelling', 'grammar', etc.
  console.log(`Explanation: ${correction.explanation}`);
});
```

### Error Types
- **spelling**: Misspelled words
- **grammar**: Grammatical errors
- **punctuation**: Punctuation mistakes
- **capitalization**: Capitalization errors
- **preposition**: Incorrect prepositions
- **missing-words**: Missing words in sentences

---

## 6. Translator API

### Overview
Translate text between languages using on-device expert models.

### Availability Check
```javascript
const translatorCapabilities = await Translator.availability({
  sourceLanguage: 'en',
  targetLanguage: 'fr'
});
```

### Basic Usage
```javascript
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'fr',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});

// Simple translation
const result = await translator.translate('Hello, how are you?');
// Output: "Bonjour, comment allez-vous ?"

// Streaming translation for long text
const stream = translator.translateStreaming(longText);
for await (const chunk of stream) {
  console.log(chunk);
}
```

### Language Codes
Use BCP 47 language codes:
- `'en'` - English
- `'es'` - Spanish
- `'fr'` - French
- `'de'` - German
- `'ja'` - Japanese
- `'zh'` - Chinese
- And many more...

---

## 7. Language Detector API

### Overview
Detect the language of input text with confidence scores.

### Availability Check
```javascript
const availability = await LanguageDetector.availability();
```

### Basic Usage
```javascript
const detector = await LanguageDetector.create({
  expectedInputLanguages: ['en', 'es', 'fr', 'de']
});

const results = await detector.detect('Hallo und herzlich willkommen!');

// Process results (sorted by confidence)
results.forEach(result => {
  console.log(`${result.detectedLanguage}: ${result.confidence}`);
});
// Output:
// de: 0.9993835687637329
// en: 0.00038279531872831285
// nl: 0.00010798392031574622
```

### Integration with Translator
```javascript
// Detect language first
const detector = await LanguageDetector.create();
const detectionResults = await detector.detect(userInput);
const sourceLanguage = detectionResults[0].detectedLanguage;

// Then translate
const translator = await Translator.create({
  sourceLanguage: sourceLanguage,
  targetLanguage: 'en'
});
const translation = await translator.translate(userInput);
```

---

## Chrome Extension Integration

### Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "AI-Powered Extension",
  "version": "1.0",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "trial_tokens": [
    "YOUR_ORIGIN_TRIAL_TOKEN_HERE"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }],
  "action": {
    "default_popup": "popup.html"
  }
}
```

### Service Worker Usage
```javascript
// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    handleSummarize(request.text).then(sendResponse);
    return true; // Keep message channel open
  }
});

async function handleSummarize(text) {
  if ('Summarizer' in self) {
    const summarizer = await Summarizer.create();
    return await summarizer.summarize(text);
  }
  return 'Summarizer not available';
}
```

### Content Script Integration
```javascript
// content.js
// Add origin trial token to page
const metaTag = document.createElement('meta');
metaTag.httpEquiv = 'origin-trial';
metaTag.content = 'YOUR_TOKEN_HERE';
document.head.appendChild(metaTag);

// Use APIs after token is added
setTimeout(async () => {
  if ('LanguageDetector' in self) {
    const detector = await LanguageDetector.create();
    // Use detector...
  }
}, 100);
```

---

## Error Handling

### Common Error Patterns
```javascript
try {
  const availability = await LanguageModel.availability();
  
  if (availability === 'unavailable') {
    throw new Error('AI features not supported on this device');
  }
  
  if (availability === 'downloadable') {
    console.log('Model needs to be downloaded...');
  }
  
  const session = await LanguageModel.create({
    signal: controller.signal, // For cancellation
    monitor(m) {
      m.addEventListener('downloadprogress', handleProgress);
    }
  });
  
  const result = await session.prompt(userInput, {
    signal: controller.signal
  });
  
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Operation cancelled');
  } else if (error.name === 'NotSupportedError') {
    console.log('Feature not supported');
  } else {
    console.error('AI API error:', error);
  }
}
```

### Permission Policy
```html
<!-- Grant iframe access to AI APIs -->
<iframe 
  src="https://example.com" 
  allow="language-model; summarizer; translator; language-detector; writer; rewriter; proofreader">
</iframe>
```

---

## Best Practices

### 1. Performance Optimization
- **Check availability** before creating API instances
- **Reuse sessions** when possible instead of creating new ones
- **Monitor model download** and show progress to users
- **Use streaming** for long-form content
- **Destroy sessions** when no longer needed

### 2. User Experience
- **Show loading states** during model downloads (can take several minutes)
- **Provide fallbacks** for unsupported devices
- **Cache results** when appropriate
- **Handle offline scenarios** gracefully

### 3. Privacy and Security
- **Data stays local** - no cloud transmission
- **User activation required** for model downloads
- **Acknowledge usage policies** for origin trials
- **Handle sensitive content** appropriately

### 4. Development Workflow
```javascript
// Development helper
async function checkAISupport() {
  const apis = {
    prompt: 'LanguageModel' in self,
    summarizer: 'Summarizer' in self,
    translator: 'Translator' in self,
    languageDetector: 'LanguageDetector' in self,
    writer: 'Writer' in self,
    rewriter: 'Rewriter' in self,
    proofreader: 'Proofreader' in self
  };
  
  console.table(apis);
  return apis;
}

// Check model status
async function checkModelStatus() {
  try {
    const status = await LanguageModel.availability();
    console.log('Model status:', status);
    
    if (status === 'available') {
      const params = await LanguageModel.params();
      console.log('Model parameters:', params);
    }
  } catch (error) {
    console.log('Prompt API not available');
  }
}
```

---

## Troubleshooting

### Common Issues

1. **APIs showing as undefined**
   - Verify Chrome version (138+ for stable APIs)
   - Check origin trial token validity
   - Ensure proper feature flags are enabled
   - Confirm hardware requirements are met

2. **Model download fails**
   - Check available storage (22+ GB required)
   - Ensure stable internet connection
   - Verify user activation occurred
   - Try restarting Chrome

3. **Extension APIs not working**
   - Add trial tokens to manifest.json
   - Use correct extension origin in registration
   - Check service worker vs content script usage
   - Verify permissions in manifest

4. **Language detection accuracy**
   - Provide longer text samples when possible
   - Check confidence scores in results
   - Consider context for ambiguous text

### Debug Commands
```javascript
// Check model installation
chrome://on-device-internals

// View origin trial status
chrome://flags/#origin-trials

// Check API availability in console
Object.keys(self).filter(key => 
  ['LanguageModel', 'Summarizer', 'Translator', 'LanguageDetector', 
   'Writer', 'Rewriter', 'Proofreader'].includes(key)
)
```

---

## Resources

### Official Documentation
- [Chrome AI on Chrome Developers](https://developer.chrome.com/docs/ai/)
- [Built-in AI APIs Overview](https://developer.chrome.com/docs/ai/built-in-apis)
- [Origin Trials Guide](https://developer.chrome.com/docs/web-platform/origin-trials)

### Origin Trial Registration
- [Current Active Trials](https://developer.chrome.com/origintrials/)
- [My Registrations](https://developer.chrome.com/origintrials/#/trials/my)

### Community
- [Chrome AI Dev Preview Discussion Group](https://groups.google.com/a/chromium.org/g/chrome-ai-dev-preview-discuss)
- [Early Preview Program Signup](https://developer.chrome.com/docs/ai/built-in#get_an_early_preview)

### Examples and Demos
- [Prompt API Demo Extension](https://github.com/GoogleChrome/ai-demo-extension)
- [API Playgrounds](https://chrome.dev/web-ai-demos/)
- [Chrome AI Challenge 2025](https://googlechromeai2025.devpost.com/)

---

## Conclusion

Chrome's Built-in AI APIs represent a significant step toward bringing powerful AI capabilities directly to the browser. With on-device processing, enhanced privacy, and no external dependencies, these APIs enable developers to create sophisticated AI-powered experiences that work offline and respect user privacy.

As the APIs continue to evolve from origin trials to stable releases, they offer an excellent opportunity to build the next generation of intelligent web applications and Chrome extensions.

**Remember to**:
- Start with stable APIs (Summarizer, Translator, Language Detector) for production use
- Experiment with origin trial APIs for cutting-edge features
- Provide fallbacks for unsupported devices
- Follow best practices for performance and user experience
- Stay updated with the latest API developments and status changes