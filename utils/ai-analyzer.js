/**
 * AI Analyzer - Chrome Built-in AI Integration
 * Orchestrates Prompt API, Summarizer API, Rewriter API, and Writer API
 * for comprehensive legal document analysis
 */

// ========================================
// Configuration
// ========================================
const MAX_PROMPT_LENGTH = 10000; // Maximum characters for single prompt
const CHUNK_SIZE = 8000; // Size for document chunking

// Session cache to avoid recreating sessions
const sessionCache = {
  // prompt sessions keyed by outputLanguage
  prompt: {},
  summarizer: null,
  rewriter: null,
  writer: null
};

// ========================================
// API Availability Check
// ========================================

/**
 * Check if Chrome AI APIs are available
 * Uses correct API names: LanguageModel, Summarizer, Writer, Rewriter
 * @returns {Promise<Object>} Object with availability status for each API
 */
export async function checkAIAvailability() {
  const availability = {
    prompt: false,
    promptState: 'unavailable',
    summarizer: false,
    summarizerState: 'unavailable',
    rewriter: false,
    rewriterState: 'unavailable',
    writer: false,
    writerState: 'unavailable',
    overall: false,
    downloadProgress: null
  };
  
  try {
    // Check Prompt API (LanguageModel) - Requires Origin Trial Token
    if ('LanguageModel' in self) {
      try {
        const promptAvailability = await self.LanguageModel.availability();
        availability.promptState = promptAvailability || 'unavailable';
        availability.prompt = promptAvailability === 'readily';
        
        // Check if model is downloading
        if (promptAvailability === 'after-download') {
          availability.downloadProgress = 'Model needs to be downloaded';
        }
      } catch (error) {
        console.warn('Prompt API (LanguageModel) check failed:', error);
      }
    } else {
      console.warn('Prompt API (LanguageModel) not found. Origin Trial token may be missing.');
    }
    
    // Check Summarizer API - Stable, no token needed
    if ('Summarizer' in self) {
      try {
        const summarizerAvailability = await self.Summarizer.availability();
        availability.summarizerState = summarizerAvailability || 'unavailable';
        availability.summarizer = summarizerAvailability === 'readily';
      } catch (error) {
        console.warn('Summarizer API check failed:', error);
      }
    } else {
      console.warn('Summarizer API not found.');
    }
    
    // Check Rewriter API - Requires Origin Trial Token
    if ('Rewriter' in self) {
      try {
        const rewriterAvailability = await self.Rewriter.availability();
        availability.rewriterState = rewriterAvailability || 'unavailable';
        availability.rewriter = rewriterAvailability === 'readily';
      } catch (error) {
        console.warn('Rewriter API check failed:', error);
      }
    } else {
      console.warn('Rewriter API not found. Origin Trial token may be missing.');
    }
    
    // Check Writer API - Requires Origin Trial Token
    if ('Writer' in self) {
      try {
        const writerAvailability = await self.Writer.availability();
        availability.writerState = writerAvailability || 'unavailable';
        availability.writer = writerAvailability === 'readily';
      } catch (error) {
        console.warn('Writer API check failed:', error);
      }
    } else {
      console.warn('Writer API not found. Origin Trial token may be missing.');
    }
    
    // At minimum, we need Prompt API OR Summarizer API
    availability.overall = availability.prompt || availability.summarizer;
    
  } catch (error) {
    console.error('Error checking AI availability:', error);
  }
  
  return availability;
}

/**
 * Get user-friendly error message for unavailable AI
 * @param {Object} availability - Availability check result
 * @returns {string} Error message with instructions
 */
export function getAIUnavailableMessage(availability = null) {
  // Check if model needs to be downloaded
  if (availability && availability.promptState === 'after-download') {
    return `Gemini Nano AI model needs to be downloaded.

Please:
1. Go to chrome://components
2. Find "Optimization Guide On Device Model"
3. Click "Check for update"
4. Wait for download to complete (may take several minutes)
5. Restart Chrome
6. Try analyzing again

The model is approximately 2GB and downloads in the background.`;
  }
  
  // Check if Origin Trial token is missing
  if (availability && !('LanguageModel' in self) && !('Writer' in self) && !('Rewriter' in self)) {
    return `Chrome Built-in AI APIs are not available.

Missing Origin Trial Token:
The Prompt API, Writer API, and Rewriter API require an Origin Trial token.

Please:
1. Go to https://developer.chrome.com/origintrials/
2. Register for "Built-in AI Early Preview Program"
3. Get your token
4. Add it to manifest.json in the "trial_tokens" array
5. Reload the extension

See ORIGIN_TRIAL_SETUP.md for detailed instructions.

Note: Summarizer API (stable) should work without a token.`;
  }
  
  return `Chrome's built-in AI is not available. Please:
    
1. Use Chrome Dev or Canary (version 138+)
2. Enable flags in chrome://flags:
   - "Prompt API for Gemini Nano"
   - "Optimization Guide on Device Model"
3. Restart Chrome
4. Update Gemini Nano in chrome://components
5. Add Origin Trial token to manifest.json (see ORIGIN_TRIAL_SETUP.md)
   
Visit the README for detailed instructions.`;
}

// ========================================
// Main Analysis Function
// ========================================

/**
 * Analyze a legal document using all available AI APIs
 * @param {string} text - Document text to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Comprehensive analysis results
 */
export async function analyzeDocument(text, options = {}) {
  const startTime = Date.now();
  
  try {
    // Check AI availability
    const availability = await checkAIAvailability();
    if (!availability.overall) {
      throw new Error(getAIUnavailableMessage(availability));
    }
    
    // Validate input
    if (!text || text.trim().length < 100) {
      throw new Error('Document text is too short for analysis (minimum 100 characters)');
    }
    
    // Truncate if too long
    const analyzableText = text.length > MAX_PROMPT_LENGTH 
      ? text.substring(0, MAX_PROMPT_LENGTH) + '...'
      : text;
    
    console.log(`Analyzing document (${analyzableText.length} characters)...`);
    
    // Run analyses in parallel where possible
    const [riskAnalysis, summary, glossary] = await Promise.all([
      detectRisks(analyzableText, options),
      generateSummary(analyzableText, options),
      buildGlossary(analyzableText, options)
    ]);
    
    // Calculate overall risk score
    const riskScore = calculateRiskScore(riskAnalysis.risks);
    
    // Calculate additional metadata
    const readingTime = calculateReadingTime(text);
    const complexity = estimateComplexity(text);
    const documentType = options.documentType || detectDocumentType(text);
    
    // Build final analysis object
    const analysis = {
      riskScore,
      riskFactors: riskAnalysis.risks || [],
      summary: {
        executive: summary.executive || '',
        keyPoints: summary.keyPoints || [],
        fullSummary: summary.full || ''
      },
      glossary: glossary || [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentLength: text.length,
        analysisTime: Date.now() - startTime,
        readingTime,
        complexity,
        documentType,
        aiAPIsUsed: {
          prompt: true,
          summarizer: availability.summarizer,
          rewriter: availability.rewriter,
          writer: availability.writer
        }
      }
    };
    
    console.log(`Analysis complete in ${analysis.metadata.analysisTime}ms`);
    return analysis;
    
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
}

// ========================================
// Risk Detection (Prompt API)
// ========================================

/**
 * Detect risks in legal document using Prompt API
 * @param {string} text - Document text
 * @param {Object} options - Options
 * @returns {Promise<Object>} Risk analysis results
 */
export async function detectRisks(text, options = {}) {
  try {
    const session = await getPromptSession(options.outputLanguage || 'en');
    
    const prompt = `Analyze this legal document and identify concerning clauses and risks.
Focus on:
- Data collection and sharing practices
- Liability waivers and disclaimers
- Unusual or unfair terms
- Binding arbitration clauses
- Auto-renewal terms
- Rights you're giving up

Document:
${text}

Respond with JSON only in this exact format:
{
  "risks": [
    {
      "severity": "high|medium|low",
      "clause": "Section name or brief identifier",
      "issue": "What the concerning clause says",
      "explanation": "Why this is a concern in plain language"
    }
  ]
}`;
    
    const response = await session.prompt(prompt);
    const parsed = parseJSONResponse(response);
    
    // Filter out invalid risks
    const validRisks = (parsed.risks || []).filter(isValidRisk);
    
    return {
      risks: validRisks,
      raw: response
    };
    
  } catch (error) {
    console.error('Error detecting risks:', error);
    return { risks: [], error: error.message };
  }
}

/**
 * Calculate overall risk score from individual risks
 * @param {Array} risks - Array of risk objects
 * @returns {string} Risk level: 'low', 'medium', or 'high'
 */
function calculateRiskScore(risks) {
  if (!risks || risks.length === 0) return 'low';
  
  const severityCounts = {
    high: risks.filter(r => r.severity === 'high').length,
    medium: risks.filter(r => r.severity === 'medium').length,
    low: risks.filter(r => r.severity === 'low').length
  };
  
  // Scoring logic
  if (severityCounts.high >= 2) return 'high';
  if (severityCounts.high >= 1 && severityCounts.medium >= 2) return 'high';
  if (severityCounts.high >= 1 || severityCounts.medium >= 3) return 'medium';
  if (severityCounts.medium >= 1) return 'medium';
  
  return 'low';
}

// ========================================
// Summary Generation
// ========================================

/**
 * Generate comprehensive summary using Summarizer and Prompt APIs
 * @param {string} text - Document text
 * @param {Object} options - Options with outputLanguage
 * @returns {Promise<Object>} Summary object
 */
export async function generateSummary(text, options = {}) {
  const outputLanguage = options.outputLanguage || 'en';
  
  try {
    // Try Summarizer API first for executive summary
    let executive = '';
    try {
      const summarizerSession = await getSummarizerSession();
      executive = await summarizerSession.summarize(text);
    } catch (error) {
      console.log('Summarizer API not available, using Prompt API');
      executive = await generateExecutiveSummaryWithPrompt(text, outputLanguage);
    }
    
    // Generate key points and full summary with Prompt API
    const [keyPoints, fullSummary] = await Promise.all([
      generateKeyPoints(text, outputLanguage),
      generateFullSummary(text, outputLanguage)
    ]);
    
    return {
      executive: executive || 'Summary not available',
      keyPoints: keyPoints || [],
      full: fullSummary || executive || 'Detailed summary not available'
    };
    
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      executive: 'Summary generation failed',
      keyPoints: [],
      full: ''
    };
  }
}

/**
 * Generate executive summary using Prompt API
 * @param {string} text - Document text
 * @param {string} outputLanguage - Output language code
 * @returns {Promise<string>} Executive summary
 */
async function generateExecutiveSummaryWithPrompt(text, outputLanguage = 'en') {
  try {
    const session = await getPromptSession(outputLanguage);
    
    const prompt = `Summarize this legal document in 2-3 sentences. Be clear and concise:

${text}

Summary:`;
    
    const response = await session.prompt(prompt);
    return response.trim();
    
  } catch (error) {
    console.error('Error generating executive summary:', error);
    return 'Executive summary not available';
  }
}

/**
 * Generate key points using Prompt API
 * @param {string} text - Document text
 * @param {string} outputLanguage - Output language code
 * @returns {Promise<Array>} Array of key point strings
 */
async function generateKeyPoints(text, outputLanguage = 'en') {
  try {
    const session = await getPromptSession(outputLanguage);
    
    const prompt = `Extract 5-7 key points from this legal document. Each point should be one clear sentence.

Document:
${text}

Respond with JSON only:
{
  "keyPoints": ["point 1", "point 2", ...]
}`;
    
    const response = await session.prompt(prompt);
    const parsed = parseJSONResponse(response);
    
    return parsed.keyPoints || [];
    
  } catch (error) {
    console.error('Error generating key points:', error);
    return [];
  }
}

/**
 * Generate full detailed summary using Prompt API
 * @param {string} text - Document text
 * @param {string} outputLanguage - Output language code
 * @returns {Promise<string>} Full summary
 */
async function generateFullSummary(text, outputLanguage = 'en') {
  try {
    const session = await getPromptSession(outputLanguage);
    
    const prompt = `Provide a comprehensive summary of this legal document. Break it down by sections and explain what each part means:

${text}

Summary:`;
    
    const response = await session.prompt(prompt);
    return response.trim();
    
  } catch (error) {
    console.error('Error generating full summary:', error);
    return '';
  }
}

// ========================================
// Glossary Building
// ========================================

/**
 * Build glossary of legal terms using Prompt/Writer API
 * @param {string} text - Document text
 * @param {Object} options - Options with outputLanguage
 * @returns {Promise<Array>} Array of glossary term objects
 */
export async function buildGlossary(text, options = {}) {
  const outputLanguage = options.outputLanguage || 'en';
  
  try {
    const session = await getPromptSession(outputLanguage);
    
    const prompt = `Identify legal and technical terms in this document and provide simple definitions.

Document:
${text}

Respond with JSON only:
{
  "terms": [
    {
      "term": "Legal term",
      "definition": "Simple explanation in everyday language"
    }
  ]
}`;
    
    const response = await session.prompt(prompt);
    const parsed = parseJSONResponse(response);
    
    // Filter out invalid terms
    const validTerms = (parsed.terms || []).filter(isValidTerm);
    
    return validTerms;
    
  } catch (error) {
    console.error('Error building glossary:', error);
    return [];
  }
}

// ========================================
// Plain Language Translation
// ========================================

/**
 * Simplify legal jargon using Rewriter API
 * @param {string} text - Text with legal jargon
 * @param {string} outputLanguage - Output language code
 * @returns {Promise<string>} Simplified text
 */
export async function simplifyJargon(text, outputLanguage = 'en') {
  try {
    // Try Rewriter API first
    try {
      const rewriterSession = await getRewriterSession();
      return await rewriterSession.rewrite(text, {
        context: "Simplify this legal text to everyday language"
      });
    } catch (error) {
      console.log('Rewriter API not available, using Prompt API');
      return await simplifyWithPrompt(text, outputLanguage);
    }
    
  } catch (error) {
    console.error('Error simplifying jargon:', error);
    return text;
  }
}

/**
 * Simplify text using Prompt API as fallback
 * @param {string} text - Text to simplify
 * @param {string} outputLanguage - Output language code
 * @returns {Promise<string>} Simplified text
 */
async function simplifyWithPrompt(text, outputLanguage = 'en') {
  try {
    const session = await getPromptSession(outputLanguage);
    
    const prompt = `Rewrite this legal text in simple, everyday language that anyone can understand:

${text}

Simplified version:`;
    
    const response = await session.prompt(prompt);
    return response.trim();
    
  } catch (error) {
    console.error('Error simplifying with prompt:', error);
    return text;
  }
}

// ========================================
// Session Management
// ========================================

/**
 * Get or create Prompt API session
 * @returns {Promise<Object>} Prompt session
 */
async function getPromptSession(outputLanguage = 'en') {
  if (sessionCache.prompt[outputLanguage]) {
    return sessionCache.prompt[outputLanguage];
  }
  
  try {
    // Use self.LanguageModel in service worker context, fallback to window.ai for compatibility
    const LanguageModelAPI = ('LanguageModel' in self) ? self.LanguageModel : 
                              (window?.ai?.languageModel) ? window.ai.languageModel : null;
    
    if (!LanguageModelAPI || !LanguageModelAPI.create) {
      throw new Error('LanguageModel API not available');
    }
    
    const session = await LanguageModelAPI.create({
      outputLanguage,
      systemPrompt: `You are a legal document analyzer helping users understand complex legal text. 
      Always respond with valid JSON when requested. Be clear, accurate, and user-focused.
      Identify risks, explain legal terms simply, and help users make informed decisions.`
    });
    
    sessionCache.prompt[outputLanguage] = session;
    return sessionCache.prompt[outputLanguage];
    
  } catch (error) {
    console.error('Error creating Prompt session:', error);
    throw new Error('Failed to initialize AI analysis engine');
  }
}

/**
 * Get or create Summarizer API session
 * @returns {Promise<Object>} Summarizer session
 */
async function getSummarizerSession() {
  if (sessionCache.summarizer) {
    return sessionCache.summarizer;
  }
  
  try {
    const session = await window.ai.summarizer.create({
      type: 'key-points',
      length: 'medium'
    });
    
    sessionCache.summarizer = session;
    return session;
    
  } catch (error) {
    console.error('Error creating Summarizer session:', error);
    throw error;
  }
}

/**
 * Get or create Rewriter API session
 * @returns {Promise<Object>} Rewriter session
 */
async function getRewriterSession() {
  if (sessionCache.rewriter) {
    return sessionCache.rewriter;
  }
  
  try {
    const session = await window.ai.rewriter.create({
      tone: 'neutral',
      length: 'as-is'
    });
    
    sessionCache.rewriter = session;
    return session;
    
  } catch (error) {
    console.error('Error creating Rewriter session:', error);
    throw error;
  }
}

/**
 * Clean up all AI sessions
 */
export async function cleanupSessions() {
  try {
    if (sessionCache.prompt) {
      const keys = Object.keys(sessionCache.prompt);
      for (const k of keys) {
        try { await sessionCache.prompt[k]?.destroy?.(); } catch {}
        delete sessionCache.prompt[k];
      }
    }
    
    if (sessionCache.summarizer) {
      await sessionCache.summarizer.destroy?.();
      sessionCache.summarizer = null;
    }
    
    if (sessionCache.rewriter) {
      await sessionCache.rewriter.destroy?.();
      sessionCache.rewriter = null;
    }
    
    if (sessionCache.writer) {
      await sessionCache.writer.destroy?.();
      sessionCache.writer = null;
    }
    
    console.log('AI sessions cleaned up');
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
}

// ========================================
// Utility Functions
// ========================================

/**
 * Parse JSON from AI response (handles markdown code blocks)
 * @param {string} response - AI response text
 * @param {number} attempt - Retry attempt number
 * @returns {Object} Parsed JSON object
 */
function parseJSONResponse(response, attempt = 1) {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    
    // Remove ```json and ``` markers
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
    
    // Try to extract JSON if it's embedded in text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    // Parse JSON
    const parsed = JSON.parse(cleaned);
    
    // Validate structure
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    
    throw new Error('Parsed result is not a valid object');
    
  } catch (error) {
    console.error(`Error parsing JSON response (attempt ${attempt}):`, error);
    
    if (attempt === 1) {
      console.log('Raw response:', response);
      console.log('Will use fallback structure');
    }
    
    // Return empty structure as fallback
    return { risks: [], terms: [], keyPoints: [] };
  }
}

/**
 * Validate risk object structure
 * @param {Object} risk - Risk object to validate
 * @returns {boolean} True if valid
 */
function isValidRisk(risk) {
  return risk && 
         typeof risk === 'object' &&
         typeof risk.severity === 'string' &&
         typeof risk.clause === 'string' &&
         typeof risk.issue === 'string';
}

/**
 * Validate glossary term structure
 * @param {Object} term - Term object to validate
 * @returns {boolean} True if valid
 */
function isValidTerm(term) {
  return term &&
         typeof term === 'object' &&
         typeof term.term === 'string' &&
         typeof term.definition === 'string';
}

/**
 * Chunk large text into smaller pieces
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Size of each chunk
 * @returns {Array<string>} Array of text chunks
 */
function chunkText(text, chunkSize = CHUNK_SIZE) {
  const chunks = [];
  let currentChunk = '';
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Merge analysis results from multiple chunks
 * @param {Array<Object>} chunkResults - Results from each chunk
 * @returns {Object} Merged results
 */
function mergeChunkResults(chunkResults) {
  const merged = {
    risks: [],
    terms: [],
    keyPoints: []
  };
  
  chunkResults.forEach(result => {
    if (result.risks) merged.risks.push(...result.risks);
    if (result.terms) merged.terms.push(...result.terms);
    if (result.keyPoints) merged.keyPoints.push(...result.keyPoints);
  });
  
  // Remove duplicates
  merged.risks = deduplicateArray(merged.risks, 'clause');
  merged.terms = deduplicateArray(merged.terms, 'term');
  merged.keyPoints = [...new Set(merged.keyPoints)];
  
  return merged;
}

/**
 * Remove duplicate objects from array based on key
 * @param {Array} array - Array to deduplicate
 * @param {string} key - Key to check for duplicates
 * @returns {Array} Deduplicated array
 */
function deduplicateArray(array, key) {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// ========================================
// Utility Functions (imported from detector if needed)
// ========================================

/**
 * Calculate reading time (simple version)
 * @param {string} text - Text to analyze
 * @returns {number} Minutes
 */
function calculateReadingTime(text) {
  if (!text) return 0;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200); // 200 words per minute
}

/**
 * Estimate complexity (simple version)
 * @param {string} text - Text to analyze
 * @returns {string} Complexity level
 */
function estimateComplexity(text) {
  if (!text) return 'simple';
  
  const words = text.split(/\s+/);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Simple heuristic
  if (avgWordLength > 7) return 'very_complex';
  if (avgWordLength > 6) return 'complex';
  if (avgWordLength > 5) return 'moderate';
  return 'simple';
}

/**
 * Detect document type (simple version)
 * @param {string} text - Text to analyze
 * @returns {string} Document type
 */
function detectDocumentType(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('privacy') && lower.includes('policy')) return 'privacy_policy';
  if (lower.includes('terms') && (lower.includes('service') || lower.includes('use'))) return 'terms_of_service';
  if (lower.includes('cookie')) return 'cookie_policy';
  if (lower.includes('eula')) return 'eula';
  
  return 'legal_document';
}

// ========================================
// API Status Utility
// ========================================

/**
 * Get detailed status of all Chrome Built-in AI APIs
 * Useful for debugging and showing users which APIs are available
 * @returns {Promise<Object>} Status object for each API
 */
export async function getAPIStatus() {
  const status = {
    promptAPI: {
      present: 'LanguageModel' in self,
      status: null,
      requiresToken: true,
      name: 'Prompt API (LanguageModel)'
    },
    summarizer: {
      present: 'Summarizer' in self,
      status: null,
      requiresToken: false,
      name: 'Summarizer API'
    },
    writer: {
      present: 'Writer' in self,
      status: null,
      requiresToken: true,
      name: 'Writer API'
    },
    rewriter: {
      present: 'Rewriter' in self,
      status: null,
      requiresToken: true,
      name: 'Rewriter API'
    }
  };
  
  // Check availability for each present API
  try {
    if (status.promptAPI.present) {
      status.promptAPI.status = await self.LanguageModel.availability();
    }
  } catch (error) {
    status.promptAPI.status = 'error';
    status.promptAPI.error = error.message;
  }
  
  try {
    if (status.summarizer.present) {
      status.summarizer.status = await self.Summarizer.availability();
    }
  } catch (error) {
    status.summarizer.status = 'error';
    status.summarizer.error = error.message;
  }
  
  try {
    if (status.writer.present) {
      status.writer.status = await self.Writer.availability();
    }
  } catch (error) {
    status.writer.status = 'error';
    status.writer.error = error.message;
  }
  
  try {
    if (status.rewriter.present) {
      status.rewriter.status = await self.Rewriter.availability();
    }
  } catch (error) {
    status.rewriter.status = 'error';
    status.rewriter.error = error.message;
  }
  
  // Overall assessment
  status.overall = {
    allPresent: status.promptAPI.present && status.summarizer.present && 
                status.writer.present && status.rewriter.present,
    anyReady: (status.promptAPI.status === 'readily') || 
              (status.summarizer.status === 'readily') ||
              (status.writer.status === 'readily') || 
              (status.rewriter.status === 'readily'),
    tokenNeeded: !status.promptAPI.present || !status.writer.present || !status.rewriter.present,
    modelDownloadNeeded: status.promptAPI.status === 'after-download' ||
                         status.summarizer.status === 'after-download' ||
                         status.writer.status === 'after-download' ||
                         status.rewriter.status === 'after-download'
  };
  
  return status;
}

// ========================================
// Model Preparation (Download/Activate)
// ========================================

/**
 * Prepare on-device model for a given API by triggering creation.
 * This follows Chrome guidance: availability() -> if after-download, create()
 * @param {('prompt'|'summarizer'|'writer'|'rewriter')} apiKey
 * @param {(update: { percent?: number, status?: string }) => void} onProgress
 * @param {string} outputLanguage - Output language code (default: 'en')
 */
export async function prepareModel(apiKey, onProgress, outputLanguage = 'en') {
  const api = apiKey.toLowerCase();
  const getAvailability = async () => {
    if (api === 'prompt' && 'LanguageModel' in self) return await self.LanguageModel.availability();
    if (api === 'summarizer' && 'Summarizer' in self) return await self.Summarizer.availability();
    if (api === 'writer' && 'Writer' in self) return await self.Writer.availability();
    if (api === 'rewriter' && 'Rewriter' in self) return await self.Rewriter.availability();
    return 'unavailable';
  };

  const createSession = async () => {
    // Use self APIs in service worker context
    if (api === 'prompt' && 'LanguageModel' in self) {
      return await self.LanguageModel.create({ outputLanguage });
    }
    if (api === 'prompt' && window?.ai?.languageModel?.create) {
      return await window.ai.languageModel.create({ outputLanguage });
    }
    if (api === 'summarizer' && 'Summarizer' in self) {
      return await self.Summarizer.create({});
    }
    if (api === 'summarizer' && window?.ai?.summarizer?.create) {
      return await window.ai.summarizer.create({});
    }
    if (api === 'writer' && 'Writer' in self) {
      return await self.Writer.create({});
    }
    if (api === 'writer' && window?.ai?.writer?.create) {
      return await window.ai.writer.create({});
    }
    if (api === 'rewriter' && 'Rewriter' in self) {
      return await self.Rewriter.create({});
    }
    if (api === 'rewriter' && window?.ai?.rewriter?.create) {
      return await window.ai.rewriter.create({});
    }
    throw new Error('API not available');
  };

  const avail = await getAvailability();
  if (avail === 'readily') {
    onProgress?.({ percent: 100, status: 'ready' });
    return { success: true, status: 'ready' };
  }

  if (avail !== 'after-download') {
    return { success: false, status: avail || 'unavailable', error: 'API not ready and no download state' };
  }

  // Trigger download by creating a session
  try {
    onProgress?.({ percent: 1, status: 'starting' });
    const session = await createSession();
    // Session creation should kick off download; we may not have real progress
    // Poll for readiness with a soft progress ramp
    const start = Date.now();
    const timeoutMs = 3 * 60 * 1000; // 3 minutes
    let lastPercent = 5;
    onProgress?.({ percent: lastPercent, status: 'downloading' });
    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 3000));
      const s = await getAvailability();
      if (s === 'readily') {
        try { await session.destroy?.(); } catch {}
        onProgress?.({ percent: 100, status: 'ready' });
        return { success: true, status: 'ready' };
      }
      // Increase pseudo-progress until 90%
      if (lastPercent < 90) {
        lastPercent = Math.min(90, lastPercent + 5);
        onProgress?.({ percent: lastPercent, status: 'downloading' });
      }
    }
    // Timeout
    try { await session.destroy?.(); } catch {}
    return { success: false, status: 'timeout', error: 'Model download timed out' };
  } catch (error) {
    return { success: false, status: 'error', error: error.message };
  }
}

// ========================================
// Export for testing
// ========================================
export const testUtils = {
  parseJSONResponse,
  chunkText,
  mergeChunkResults,
  calculateRiskScore,
  isValidRisk,
  isValidTerm
};

