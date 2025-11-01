/**
 * Termz Content Script
 * Runs on all pages to detect legal documents automatically
 * Uses requestIdleCallback to avoid impacting page performance
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
  maxContentLength: 500, // Maximum words to extract for analysis
  detectionDelay: 1000, // ms to wait after page load
  indicatorPosition: 'bottom-right',
  debugMode: false
};

// State management
let hasDetected = false;
let detectionResult = null;
let indicatorElement = null;

// ========================================
// Main Detection Logic
// ========================================

/**
 * Initialize content script
 */
function init() {
  if (CONFIG.debugMode) console.log('[Termz] Content script loaded');
  
  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleDetection);
  } else {
    scheduleDetection();
  }
}

/**
 * Schedule detection using requestIdleCallback for better performance
 */
function scheduleDetection() {
  if (hasDetected) return;
  
  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      setTimeout(performDetection, CONFIG.detectionDelay);
    }, { timeout: 3000 });
  } else {
    setTimeout(performDetection, CONFIG.detectionDelay);
  }
}

/**
 * Perform legal page detection
 */
async function performDetection() {
  if (hasDetected) return;
  hasDetected = true;
  
  try {
    const url = window.location.href;
    const title = document.title;
    
    // Quick check first (URL and title only)
    if (!quickCheck(url, title)) {
      if (CONFIG.debugMode) console.log('[Termz] Quick check failed, skipping detailed analysis');
      return;
    }
    
    // Check if user has excluded this domain
    const isExcluded = await checkExclusion(url);
    if (isExcluded) {
      if (CONFIG.debugMode) console.log('[Termz] Domain is excluded');
      return;
    }
    
    // Extract page content for detailed analysis
    const content = extractPageContent();
    
    // Send to background script for detailed analysis
    const result = await chrome.runtime.sendMessage({
      type: 'DETECT_LEGAL_PAGE',
      url,
      title,
      content
    });
    
    if (result && result.isLegal && result.confidence >= 0.75) {
      detectionResult = result;
      await handleLegalPageDetected(result);
    } else {
      if (CONFIG.debugMode) {
        console.log('[Termz] Not detected as legal page', result);
      }
    }
    
  } catch (error) {
    console.error('[Termz] Detection error:', error);
  }
}

/**
 * Quick check for legal indicators (URL and title only)
 * @param {string} url - Page URL
 * @param {string} title - Page title
 * @returns {boolean} True if likely legal page
 */
function quickCheck(url, title) {
  const legalPatterns = [
    /privacy[-_]?policy/i,
    /terms[-_]?of[-_]?(service|use)/i,
    /terms[-_]?and[-_]?conditions/i,
    /user[-_]?agreement/i,
    /legal/i,
    /\btos\b/i,
    /eula/i,
    /cookie[-_]?policy/i
  ];
  
  const combined = `${url} ${title}`.toLowerCase();
  return legalPatterns.some(pattern => pattern.test(combined));
}

/**
 * Check if current domain is in exclusion list
 * @param {string} url - Current URL
 * @returns {Promise<boolean>} True if excluded
 */
async function checkExclusion(url) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_EXCLUSION',
      url
    });
    return response?.isExcluded || false;
  } catch (error) {
    console.error('[Termz] Error checking exclusion:', error);
    return false;
  }
}

/**
 * Extract content from page for analysis
 * @returns {string} Extracted content
 */
function extractPageContent() {
  try {
    // Get headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(h => h.textContent.trim())
      .filter(text => text.length > 0)
      .join(' ');
    
    // Get main content
    let bodyText = '';
    
    // Try to find main content area
    const mainElements = document.querySelectorAll('main, article, [role="main"], .content, #content');
    if (mainElements.length > 0) {
      bodyText = Array.from(mainElements)
        .map(el => el.textContent || el.innerText)
        .join(' ');
    } else {
      bodyText = document.body.textContent || document.body.innerText || '';
    }
    
    // Combine and truncate
    const fullText = `${headings} ${bodyText}`;
    const words = fullText.split(/\s+/).slice(0, CONFIG.maxContentLength);
    
    return words.join(' ').trim();
    
  } catch (error) {
    console.error('[Termz] Error extracting content:', error);
    return '';
  }
}

// ========================================
// Legal Page Detected Handler
// ========================================

/**
 * Handle when legal page is detected
 * @param {Object} result - Detection result
 */
async function handleLegalPageDetected(result) {
  if (CONFIG.debugMode) {
    console.log('[Termz] Legal page detected!', result);
  }
  
  // Check user settings
  const settings = await getUserSettings();
  
  // Show visual indicator
  if (settings.autoDetection) {
    showVisualIndicator();
  }
  
  // Notify background script (will handle notifications)
  chrome.runtime.sendMessage({
    type: 'LEGAL_PAGE_CONFIRMED',
    url: window.location.href,
    title: document.title,
    result
  });
}

/**
 * Get user settings from background
 * @returns {Promise<Object>} User settings
 */
async function getUserSettings() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_SETTINGS'
    });
    return response?.settings || { autoDetection: true, notifications: true };
  } catch (error) {
    console.error('[Termz] Error getting settings:', error);
    return { autoDetection: true, notifications: true };
  }
}

// ========================================
// Visual Indicator
// ========================================

/**
 * Show visual indicator that legal content was detected
 */
function showVisualIndicator() {
  if (indicatorElement) return; // Already showing
  
  const domain = window.location.hostname;
  
  // Create indicator element
  const indicator = document.createElement('div');
  indicator.id = 'termz-indicator';
  indicator.className = 'termz-indicator';
  indicator.innerHTML = `
    <div class="termz-indicator-content">
      <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="Termz" class="termz-indicator-icon">
      <div class="termz-indicator-text-section">
        <span class="termz-indicator-text">Legal document detected</span>
        <label class="termz-indicator-checkbox">
          <input type="checkbox" id="termz-dont-show-again">
          <span>Don't show for ${domain} again</span>
        </label>
      </div>
      <button class="termz-indicator-analyze" id="termz-analyze-btn">Analyze</button>
      <button class="termz-indicator-close" id="termz-close-btn">&times;</button>
    </div>
  `;
  
  // Add styles
  addIndicatorStyles();
  
  // Add to page
  document.body.appendChild(indicator);
  indicatorElement = indicator;
  
  // Add event listeners
  document.getElementById('termz-analyze-btn')?.addEventListener('click', handleAnalyzeClick);
  document.getElementById('termz-close-btn')?.addEventListener('click', handleCloseClick);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (indicatorElement) {
      indicator.classList.add('termz-indicator-fadeout');
      setTimeout(hideVisualIndicator, 500);
    }
  }, 10000);
}

/**
 * Handle close button click (with optional exclusion)
 */
async function handleCloseClick() {
  const dontShowCheckbox = document.getElementById('termz-dont-show-again');
  
  if (dontShowCheckbox && dontShowCheckbox.checked) {
    // Add to exclusions
    const domain = window.location.hostname;
    try {
      await chrome.runtime.sendMessage({
        type: 'ADD_EXCLUSION',
        domain: domain
      });
      console.log('[Termz] Added', domain, 'to exclusions');
    } catch (error) {
      console.error('[Termz] Error adding exclusion:', error);
    }
  }
  
  hideVisualIndicator();
}

/**
 * Hide visual indicator
 */
function hideVisualIndicator() {
  if (indicatorElement) {
    indicatorElement.remove();
    indicatorElement = null;
  }
}

/**
 * Handle analyze button click
 */
async function handleAnalyzeClick() {
  hideVisualIndicator();
  
  // Open side panel and start analysis
  chrome.runtime.sendMessage({
    type: 'OPEN_SIDE_PANEL_AND_ANALYZE',
    url: window.location.href,
    title: document.title
  });
}

/**
 * Add indicator styles to page
 */
function addIndicatorStyles() {
  if (document.getElementById('termz-indicator-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'termz-indicator-styles';
  style.textContent = `
    .termz-indicator {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      animation: termz-slide-in 0.3s ease-out;
    }
    
    .termz-indicator-fadeout {
      animation: termz-fade-out 0.5s ease-out forwards;
    }
    
    .termz-indicator-content {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #ffffff;
      color: #1a1a1a;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.1);
      max-width: 350px;
    }
    
    @media (prefers-color-scheme: dark) {
      .termz-indicator-content {
        background: #2d2d2d;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
      }
    }
    
    .termz-indicator-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
    
    .termz-indicator-text-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .termz-indicator-text {
      font-size: 14px;
      font-weight: 500;
    }
    
    .termz-indicator-checkbox {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #666;
      cursor: pointer;
      user-select: none;
    }
    
    @media (prefers-color-scheme: dark) {
      .termz-indicator-checkbox {
        color: #b0b0b0;
      }
    }
    
    .termz-indicator-checkbox input[type="checkbox"] {
      cursor: pointer;
    }
    
    .termz-indicator-analyze {
      background: #4A90E2;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .termz-indicator-analyze:hover {
      background: #357ABD;
    }
    
    .termz-indicator-close {
      background: none;
      border: none;
      color: #666;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .termz-indicator-close:hover {
      background: rgba(0, 0, 0, 0.1);
    }
    
    @media (prefers-color-scheme: dark) {
      .termz-indicator-close {
        color: #b0b0b0;
      }
      .termz-indicator-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
    
    @keyframes termz-slide-in {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes termz-fade-out {
      to {
        opacity: 0;
        transform: translateY(10px);
      }
    }
    
    @media (max-width: 480px) {
      .termz-indicator {
        bottom: 10px;
        right: 10px;
        left: 10px;
      }
      
      .termz-indicator-content {
        max-width: none;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// ========================================
// Message Listener
// ========================================

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (CONFIG.debugMode) console.log('[Termz] Content script received message:', message.type);
  
  switch (message.type) {
    case 'GET_PAGE_CONTENT':
      sendResponse({
        url: window.location.href,
        title: document.title,
        content: extractPageContent()
      });
      break;
      
    case 'SHOW_INDICATOR':
      showVisualIndicator();
      sendResponse({ success: true });
      break;
      
    case 'HIDE_INDICATOR':
      hideVisualIndicator();
      sendResponse({ success: true });
      break;
      
    default:
      if (CONFIG.debugMode) console.log('[Termz] Unknown message type:', message.type);
  }
  
  return true; // Keep message channel open for async response
});

// ========================================
// Cleanup
// ========================================

/**
 * Clean up when page is unloaded
 */
window.addEventListener('beforeunload', () => {
  hideVisualIndicator();
});

// ========================================
// Initialize
// ========================================
init();

