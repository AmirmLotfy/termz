/**
 * Legal Page Detector
 * Intelligently detects legal documents using multi-factor analysis
 */

// ========================================
// Configuration
// ========================================

// URL patterns that indicate legal content
const URL_PATTERNS = [
  /privacy[-_]?policy/i,
  /terms[-_]?of[-_]?(service|use)/i,
  /terms[-_]?and[-_]?conditions/i,
  /user[-_]?agreement/i,
  /legal/i,
  /\btos\b/i,
  /eula/i,
  /end[-_]?user[-_]?license/i,
  /cookie[-_]?policy/i,
  /data[-_]?policy/i,
  /acceptable[-_]?use/i,
  /terms\.html?/i,
  /privacy\.html?/i,
  /legal\.html?/i
];

// Title patterns
const TITLE_PATTERNS = [
  /privacy\s+policy/i,
  /terms\s+(of\s+service|of\s+use|and\s+conditions)/i,
  /user\s+agreement/i,
  /legal\s+(notice|information|terms)/i,
  /cookie\s+policy/i,
  /data\s+policy/i,
  /eula/i,
  /license\s+agreement/i
];

// Legal terminology that commonly appears in legal documents
const LEGAL_KEYWORDS = [
  'hereby',
  'herein',
  'aforementioned',
  'wherefore',
  'notwithstanding',
  'indemnify',
  'indemnification',
  'liability',
  'warranties',
  'disclaim',
  'arbitration',
  'jurisdiction',
  'governing law',
  'force majeure',
  'intellectual property',
  'confidentiality',
  'termination',
  'personal data',
  'data collection',
  'third parties',
  'cookies',
  'user content',
  'acceptable use',
  'prohibited conduct'
];

// Common section headers in legal documents
const LEGAL_HEADERS = [
  /acceptance of terms/i,
  /scope of (service|agreement)/i,
  /user obligations/i,
  /prohibited (activities|uses|conduct)/i,
  /intellectual property rights/i,
  /disclaimer of warranties/i,
  /limitation of liability/i,
  /indemnification/i,
  /termination/i,
  /governing law/i,
  /dispute resolution/i,
  /arbitration/i,
  /data collection/i,
  /information we collect/i,
  /how we use/i,
  /sharing (of|your) information/i,
  /your rights/i,
  /data retention/i,
  /security measures/i,
  /cookies? and tracking/i,
  /changes to (this|these) (terms|policy)/i
];

// Confidence threshold for triggering detection
const DETECTION_THRESHOLD = 0.75;

// ========================================
// Main Detection Functions
// ========================================

/**
 * Analyze if a page contains legal content
 * @param {string} url - Page URL
 * @param {string} title - Page title
 * @param {string} content - Page content (text)
 * @returns {Object} Detection result with confidence score
 */
export function isLegalPage(url, title, content) {
  const factors = {
    url: analyzeUrl(url),
    title: analyzeTitle(title),
    content: analyzeContent(content),
    structure: analyzeStructure(content)
  };
  
  // Calculate weighted confidence score
  const weights = {
    url: 0.3,
    title: 0.25,
    content: 0.30,
    structure: 0.15
  };
  
  const confidence = 
    factors.url.score * weights.url +
    factors.title.score * weights.title +
    factors.content.score * weights.content +
    factors.structure.score * weights.structure;
  
  const isLegal = confidence >= DETECTION_THRESHOLD;
  
  return {
    isLegal,
    confidence: parseFloat(confidence.toFixed(3)),
    factors,
    reasons: buildReasons(factors, isLegal)
  };
}

/**
 * Simplified check for legal page (fast version)
 * @param {string} url - Page URL
 * @param {string} title - Page title  
 * @returns {boolean} True if likely legal page
 */
export function quickCheck(url, title) {
  const urlMatch = URL_PATTERNS.some(pattern => pattern.test(url));
  const titleMatch = TITLE_PATTERNS.some(pattern => pattern.test(title));
  
  return urlMatch || titleMatch;
}

// ========================================
// Analysis Functions
// ========================================

/**
 * Analyze URL for legal indicators
 * @param {string} url - URL to analyze
 * @returns {Object} Analysis result
 */
function analyzeUrl(url) {
  if (!url) return { score: 0, matches: [] };
  
  const matches = [];
  let score = 0;
  
  // Check each URL pattern
  URL_PATTERNS.forEach(pattern => {
    if (pattern.test(url)) {
      matches.push(pattern.toString());
      score += 0.15;
    }
  });
  
  // Special high-confidence patterns
  if (/privacy/i.test(url)) score += 0.1;
  if (/terms/i.test(url)) score += 0.1;
  if (/legal/i.test(url)) score += 0.05;
  
  // Normalize score to 0-1
  score = Math.min(score, 1.0);
  
  return { score, matches };
}

/**
 * Analyze page title for legal indicators
 * @param {string} title - Page title to analyze
 * @returns {Object} Analysis result
 */
function analyzeTitle(title) {
  if (!title) return { score: 0, matches: [] };
  
  const matches = [];
  let score = 0;
  
  // Check each title pattern
  TITLE_PATTERNS.forEach(pattern => {
    if (pattern.test(title)) {
      matches.push(pattern.toString());
      score += 0.2;
    }
  });
  
  // Boost if title is very short and matches (less likely to be false positive)
  if (title.length < 50 && matches.length > 0) {
    score += 0.2;
  }
  
  // Normalize score
  score = Math.min(score, 1.0);
  
  return { score, matches };
}

/**
 * Analyze content for legal terminology
 * @param {string} content - Page content text
 * @returns {Object} Analysis result
 */
function analyzeContent(content) {
  if (!content || content.length < 100) {
    return { score: 0, keywordMatches: 0, density: 0 };
  }
  
  // Normalize content
  const normalized = content.toLowerCase();
  const words = content.split(/\s+/).length;
  
  // Count legal keyword matches
  let keywordMatches = 0;
  LEGAL_KEYWORDS.forEach(keyword => {
    if (normalized.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  });
  
  // Calculate keyword density
  const density = keywordMatches / words * 1000; // Per 1000 words
  
  // Score based on keyword matches
  let score = 0;
  if (keywordMatches >= 15) score = 1.0;
  else if (keywordMatches >= 10) score = 0.8;
  else if (keywordMatches >= 7) score = 0.6;
  else if (keywordMatches >= 5) score = 0.4;
  else if (keywordMatches >= 3) score = 0.2;
  
  return { score, keywordMatches, density: parseFloat(density.toFixed(2)) };
}

/**
 * Analyze document structure for legal headers
 * @param {string} content - Page content or headings
 * @returns {Object} Analysis result
 */
function analyzeStructure(content) {
  if (!content) return { score: 0, headerMatches: [] };
  
  const headerMatches = [];
  let score = 0;
  
  // Check for legal section headers
  LEGAL_HEADERS.forEach(pattern => {
    if (pattern.test(content)) {
      headerMatches.push(pattern.toString());
      score += 0.1;
    }
  });
  
  // Bonus for multiple header matches (indicates structured legal doc)
  if (headerMatches.length >= 5) score += 0.2;
  else if (headerMatches.length >= 3) score += 0.1;
  
  // Normalize score
  score = Math.min(score, 1.0);
  
  return { score, headerMatches };
}

// ========================================
// Content Extraction Helpers
// ========================================

/**
 * Extract text content from page for analysis
 * @param {Document} document - DOM document object
 * @param {number} maxWords - Maximum words to extract
 * @returns {string} Extracted text
 */
export function extractPageContent(document, maxWords = 500) {
  if (!document || !document.body) return '';
  
  // Get all heading elements
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
    .map(h => h.textContent.trim())
    .filter(text => text.length > 0)
    .join(' ');
  
  // Get body text
  const bodyText = document.body.innerText || document.body.textContent || '';
  
  // Combine headings and body text
  const fullText = `${headings} ${bodyText}`;
  
  // Truncate to max words
  const words = fullText.split(/\s+/).slice(0, maxWords);
  
  return words.join(' ');
}

/**
 * Extract headings from page
 * @param {Document} document - DOM document object
 * @returns {Array<string>} Array of heading texts
 */
export function extractHeadings(document) {
  if (!document) return [];
  
  return Array.from(document.querySelectorAll('h1, h2, h3, h4'))
    .map(h => h.textContent.trim())
    .filter(text => text.length > 0);
}

/**
 * Get page metadata
 * @param {Document} document - DOM document object
 * @returns {Object} Page metadata
 */
export function getPageMetadata(document) {
  if (!document) return {};
  
  const meta = {};
  
  // Get meta tags
  const metaTags = document.querySelectorAll('meta');
  metaTags.forEach(tag => {
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    const content = tag.getAttribute('content');
    
    if (name && content) {
      meta[name.toLowerCase()] = content;
    }
  });
  
  return meta;
}

// ========================================
// Utility Functions
// ========================================

/**
 * Build human-readable reasons for detection result
 * @param {Object} factors - Analysis factors
 * @param {boolean} isLegal - Whether page was detected as legal
 * @returns {Array<string>} Array of reason strings
 */
function buildReasons(factors, isLegal) {
  const reasons = [];
  
  if (!isLegal) {
    return ['Page does not appear to contain legal content'];
  }
  
  if (factors.url.score > 0.3) {
    reasons.push('URL contains legal keywords');
  }
  
  if (factors.title.score > 0.3) {
    reasons.push('Page title indicates legal document');
  }
  
  if (factors.content.keywordMatches >= 7) {
    reasons.push(`Found ${factors.content.keywordMatches} legal terms`);
  }
  
  if (factors.structure.headerMatches.length >= 3) {
    reasons.push(`Contains ${factors.structure.headerMatches.length} legal section headers`);
  }
  
  if (reasons.length === 0) {
    reasons.push('Multiple indicators suggest legal content');
  }
  
  return reasons;
}

/**
 * Determine document type based on analysis
 * @param {string} url - Page URL
 * @param {string} title - Page title
 * @param {string} content - Page content
 * @returns {string} Document type ('privacy_policy', 'terms_of_service', 'eula', 'legal')
 */
export function detectDocumentType(url, title, content) {
  const combined = `${url} ${title} ${content}`.toLowerCase();
  
  if (/privacy/i.test(combined) && /policy/i.test(combined)) {
    return 'privacy_policy';
  }
  
  if (/terms/i.test(combined) && /(service|use)/i.test(combined)) {
    return 'terms_of_service';
  }
  
  if (/eula|end[-\s]user[-\s]license/i.test(combined)) {
    return 'eula';
  }
  
  if (/cookie/i.test(combined) && /policy/i.test(combined)) {
    return 'cookie_policy';
  }
  
  if (/user[-\s]agreement/i.test(combined)) {
    return 'user_agreement';
  }
  
  return 'legal_document';
}

/**
 * Calculate reading time for document
 * @param {string} text - Document text
 * @param {number} wordsPerMinute - Average reading speed
 * @returns {number} Estimated reading time in minutes
 */
export function calculateReadingTime(text, wordsPerMinute = 200) {
  if (!text) return 0;
  
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return minutes;
}

/**
 * Estimate document complexity
 * @param {string} text - Document text
 * @returns {string} Complexity level ('simple', 'moderate', 'complex', 'very_complex')
 */
export function estimateComplexity(text) {
  if (!text) return 'simple';
  
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).length;
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  const avgSentenceLength = words.length / sentences;
  
  // Calculate complexity score
  let complexityScore = 0;
  
  // Long words indicate complexity
  if (avgWordLength > 6) complexityScore += 2;
  else if (avgWordLength > 5) complexityScore += 1;
  
  // Long sentences indicate complexity
  if (avgSentenceLength > 25) complexityScore += 2;
  else if (avgSentenceLength > 20) complexityScore += 1;
  
  // Check for legal jargon density
  const legalTermCount = LEGAL_KEYWORDS.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  if (legalTermCount > 15) complexityScore += 2;
  else if (legalTermCount > 10) complexityScore += 1;
  
  // Return complexity level
  if (complexityScore >= 5) return 'very_complex';
  if (complexityScore >= 3) return 'complex';
  if (complexityScore >= 2) return 'moderate';
  return 'simple';
}

// ========================================
// Export for testing
// ========================================
export const testUtils = {
  URL_PATTERNS,
  TITLE_PATTERNS,
  LEGAL_KEYWORDS,
  LEGAL_HEADERS,
  DETECTION_THRESHOLD,
  analyzeUrl,
  analyzeTitle,
  analyzeContent,
  analyzeStructure
};

