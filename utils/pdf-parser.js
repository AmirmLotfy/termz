/**
 * Document Parser Utility
 * Extract text from PDF, TXT, DOC, and DOCX files
 */

// ========================================
// Constants
// ========================================
const SUPPORTED_TYPES = {
  'text/plain': extractTextFromPlainText,
  'application/pdf': extractTextFromPDF,
  'application/msword': extractTextFromDOC,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extractTextFromDOCX
};

// ========================================
// Main Export Function
// ========================================

/**
 * Extract text from any supported file type
 * @param {File} file - File object to extract text from
 * @param {Function} progressCallback - Optional progress callback (percent) => {}
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromFile(file, progressCallback = null) {
  if (!file) {
    throw new Error('No file provided');
  }
  
  console.log(`Extracting text from ${file.name} (${file.type})`);
  
  // Get file extension as fallback
  const ext = file.name.split('.').pop().toLowerCase();
  
  // Determine extraction method
  let extractMethod = SUPPORTED_TYPES[file.type];
  
  if (!extractMethod) {
    // Fallback to extension-based detection
    if (ext === 'txt') extractMethod = extractTextFromPlainText;
    else if (ext === 'pdf') extractMethod = extractTextFromPDF;
    else if (ext === 'doc') extractMethod = extractTextFromDOC;
    else if (ext === 'docx') extractMethod = extractTextFromDOCX;
  }
  
  if (!extractMethod) {
    throw new Error(`Unsupported file type: ${file.type || ext}`);
  }
  
  try {
    const text = await extractMethod(file, progressCallback);
    
    if (!text || text.trim().length < 10) {
      throw new Error('Could not extract meaningful text from file. File may be empty or corrupted.');
    }
    
    console.log(`Successfully extracted ${text.length} characters`);
    return text;
    
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

// ========================================
// Text Extraction Functions
// ========================================

/**
 * Extract text from plain text file
 * @param {File} file - Text file
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<string>} File content
 */
async function extractTextFromPlainText(file, progressCallback) {
  try {
    if (progressCallback) progressCallback(50);
    
    const text = await file.text();
    
    if (progressCallback) progressCallback(100);
    
    return text;
  } catch (error) {
    throw new Error(`Failed to read text file: ${error.message}`);
  }
}

/**
 * Extract text from PDF file
 * Uses PDF.js library (loaded from CDN)
 * @param {File} file - PDF file
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(file, progressCallback) {
  // Check if PDF.js is loaded
  if (typeof window.pdfjsLib === 'undefined') {
    try {
      await loadPDFJS();
    } catch (error) {
      throw new Error('PDF support is not available. Please analyze the text after extracting it manually, or use a TXT file instead.');
    }
  }
  
  try {
    if (progressCallback) progressCallback(10);
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    if (progressCallback) progressCallback(20);
    
    // Load PDF document
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    if (progressCallback) progressCallback(30);
    
    const numPages = pdf.numPages;
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
      
      if (progressCallback) {
        const progress = 30 + Math.floor((pageNum / numPages) * 70);
        progressCallback(progress);
      }
    }
    
    if (progressCallback) progressCallback(100);
    
    return fullText.trim();
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}. The PDF may be scanned/image-based or corrupted.`);
  }
}

/**
 * Extract text from DOC file
 * Note: DOC format is binary and complex. This is a placeholder.
 * For production, would need a library like mammoth.js
 * @param {File} file - DOC file
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromDOC(file, progressCallback) {
  throw new Error('DOC file format is not yet supported. Please convert to DOCX or TXT format.');
}

/**
 * Extract text from DOCX file
 * Uses mammoth.js library (would need to be loaded)
 * @param {File} file - DOCX file
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromDOCX(file, progressCallback) {
  // Check if mammoth is loaded
  if (typeof window.mammoth === 'undefined') {
    try {
      await loadMammothJS();
    } catch (error) {
      throw new Error('DOCX support is not available. Please convert to TXT or extract the text manually.');
    }
  }
  
  try {
    if (progressCallback) progressCallback(25);
    
    const arrayBuffer = await file.arrayBuffer();
    
    if (progressCallback) progressCallback(50);
    
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    
    if (progressCallback) progressCallback(100);
    
    return result.value;
    
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

// ========================================
// Library Loading Functions
// ========================================

/**
 * Load PDF.js library from CDN
 * Note: PDF.js support is optional. If CDN is blocked, PDF upload will show error.
 * @returns {Promise<void>}
 */
async function loadPDFJS() {
  return new Promise((resolve, reject) => {
    if (typeof window.pdfjsLib !== 'undefined') {
      resolve();
      return;
    }

    const base = typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('vendor/pdfjs/')
      : 'vendor/pdfjs/';

    const script = document.createElement('script');
    script.src = base + 'pdf.min.js';
    script.onload = () => {
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js';
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => reject(new Error('Failed to load local PDF.js'));
    document.head.appendChild(script);
  });
}

/**
 * Load Mammoth.js library from CDN
 * Note: Mammoth.js support is optional. If CDN is blocked, DOCX upload will show error.
 * @returns {Promise<void>}
 */
async function loadMammothJS() {
  return new Promise((resolve, reject) => {
    if (typeof window.mammoth !== 'undefined') {
      resolve();
      return;
    }

    const url = typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('vendor/mammoth/mammoth.browser.min.js')
      : 'vendor/mammoth/mammoth.browser.min.js';

    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load local Mammoth.js'));
    document.head.appendChild(script);
  });
}

// ========================================
// Validation Functions
// ========================================

/**
 * Validate file before attempting extraction
 * @param {File} file - File to validate
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.` 
    };
  }
  
  // Check file type
  const ext = file.name.split('.').pop().toLowerCase();
  const supportedExtensions = ['txt', 'pdf', 'docx'];
  
  if (!supportedExtensions.includes(ext)) {
    return { 
      valid: false, 
      error: `Unsupported file type (.${ext}). Please upload TXT, PDF, or DOCX files.` 
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Get file info for display
 * @param {File} file - File object
 * @returns {Object} File information
 */
export function getFileInfo(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const sizeKB = (file.size / 1024).toFixed(1);
  const sizeMB = (file.size / 1024 / 1024).toFixed(2);
  
  return {
    name: file.name,
    extension: ext,
    type: file.type,
    size: file.size,
    sizeFormatted: file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`,
    lastModified: new Date(file.lastModified).toLocaleString()
  };
}

// ========================================
// Text Processing Functions
// ========================================

/**
 * Clean extracted text (remove excessive whitespace, etc.)
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export function cleanExtractedText(text) {
  if (!text) return '';
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim();
}

/**
 * Estimate extraction time based on file size and type
 * @param {File} file - File to estimate for
 * @returns {number} Estimated seconds
 */
export function estimateExtractionTime(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const sizeMB = file.size / 1024 / 1024;
  
  // Rough estimates in seconds per MB
  const rates = {
    txt: 0.1,
    pdf: 2,
    docx: 1.5,
    doc: 3
  };
  
  const rate = rates[ext] || 2;
  return Math.max(1, Math.ceil(sizeMB * rate));
}

// ========================================
// Export for window global access (for sidepanel)
// ========================================
if (typeof window !== 'undefined') {
  window.extractTextFromFile = extractTextFromFile;
  window.validateFile = validateFile;
  window.getFileInfo = getFileInfo;
  window.cleanExtractedText = cleanExtractedText;
  window.estimateExtractionTime = estimateExtractionTime;
}

// ========================================
// Example Usage
// ========================================
/*
// In side panel:
const file = document.getElementById('fileInput').files[0];
const validation = validateFile(file);

if (!validation.valid) {
  alert(validation.error);
  return;
}

const text = await extractTextFromFile(file, (progress) => {
  console.log(`Extraction progress: ${progress}%`);
  // Update progress bar
});

console.log('Extracted text:', text);
*/

