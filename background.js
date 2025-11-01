/**
 * Termz Background Service Worker
 * Coordinates extension logic, messaging, notifications, and side panel management
 */

// Import utilities (ES modules)
import * as storage from './utils/storage.js';
import * as detector from './utils/detector.js';
import * as analyzer from './utils/ai-analyzer.js';

// ========================================
// State Management
// ========================================
const state = {
  activeAnalyses: new Map(), // tabId -> analysis data
  pendingNotifications: new Set(),
  contextMenuCreated: false
};

// ========================================
// Extension Installation
// ========================================

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Termz] Extension installed/updated:', details.reason);
  
  // Initialize storage
  await storage.initStorage();
  
  // Create context menu
  createContextMenu();
  
  // Show welcome page on first install
  if (details.reason === 'install') {
    // Could open a welcome page here
    console.log('[Termz] First install - welcome!');
  }
});

/**
 * Handle extension startup
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log('[Termz] Extension starting up');
  
  // Ensure context menu exists
  createContextMenu();
  
  // Clean up any old data
  await cleanupOldData();
});

// ========================================
// Context Menu
// ========================================

/**
 * Create context menu for analyzing selected text
 */
function createContextMenu() {
  if (state.contextMenuCreated) return;
  
  try {
    // Remove all existing menus first to prevent duplicates
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'termz-analyze-selection',
        title: 'Analyze selected text with Termz',
        contexts: ['selection']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('[Termz] Context menu error:', chrome.runtime.lastError);
        } else {
          state.contextMenuCreated = true;
          console.log('[Termz] Context menu created');
        }
      });

      // Add website quick link
      chrome.contextMenus.create({
        id: 'termz-open-website',
        title: 'Open Termz Website',
        contexts: ['action']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('[Termz] Context menu error:', chrome.runtime.lastError);
        }
      });
    });
  } catch (error) {
    console.error('[Termz] Error creating context menu:', error);
  }
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'termz-analyze-selection' && info.selectionText) {
    console.log('[Termz] Analyzing selected text');
    
    // Open side panel
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
      
      // Send selected text to side panel
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'SELECTED_TEXT',
          text: info.selectionText,
          url: tab.url,
          title: tab.title
        });
      }, 500);
      
    } catch (error) {
      console.error('[Termz] Error opening side panel:', error);
    }
  }

  if (info.menuItemId === 'termz-open-website') {
    try {
      await chrome.tabs.create({ url: 'https://termz.it.com' });
    } catch (error) {
      console.error('[Termz] Error opening website:', error);
    }
  }
});

// ========================================
// Message Handler
// ========================================

/**
 * Handle messages from content scripts and side panel
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Termz] Background received message:', message.type);
  
  // Handle async messages
  handleMessage(message, sender).then(response => {
    sendResponse(response);
  }).catch(error => {
    console.error('[Termz] Message handler error:', error);
    sendResponse({ success: false, error: error.message });
  });
  
  return true; // Keep message channel open for async response
});

/**
 * Async message handler
 * @param {Object} message - Message object
 * @param {Object} sender - Sender info
 * @returns {Promise<Object>} Response object
 */
async function handleMessage(message, sender) {
  switch (message.type) {
    case 'DETECT_LEGAL_PAGE':
      return await handleDetectLegalPage(message, sender);
      
    case 'LEGAL_PAGE_CONFIRMED':
      return await handleLegalPageConfirmed(message, sender);
      
    case 'ANALYZE_TEXT':
      return await handleAnalyzeText(message, sender);
      
    case 'CHECK_EXCLUSION':
      return await handleCheckExclusion(message);
      
    case 'GET_SETTINGS':
      return await handleGetSettings();
      
    case 'UPDATE_SETTINGS':
      return await handleUpdateSettings(message);
      
    case 'OPEN_SIDE_PANEL_AND_ANALYZE':
      return await handleOpenSidePanelAndAnalyze(message, sender);
      
    case 'CHECK_PAGE':
      return await handleCheckPage(message);
      
    case 'GET_HISTORY':
      return await handleGetHistory();
      
    case 'SEARCH_HISTORY':
      return await handleSearchHistory(message);
      
    case 'CLEAR_HISTORY':
      return await handleClearHistory();
      
    case 'GET_EXCLUSIONS':
      return await handleGetExclusions();
      
    case 'ADD_EXCLUSION':
      return await handleAddExclusion(message);
      
    case 'REMOVE_EXCLUSION':
      return await handleRemoveExclusion(message);
      
    case 'UPDATE_SETTING':
      return await handleUpdateSetting(message);
      
    case 'EXPORT_DATA':
      return await handleExportData();
      
    case 'CLEAR_ALL_DATA':
      return await handleClearAllData();
      
    case 'GET_API_STATUS':
      return await handleGetAPIStatus();
    
    case 'PREPARE_MODEL':
      return await handlePrepareModel(message);
      
    default:
      console.log('[Termz] Unknown message type:', message.type);
      return { success: false, error: 'Unknown message type' };
  }
}

// ========================================
// Message Handlers
// ========================================

/**
 * Handle legal page detection request
 * @param {Object} message - Message data
 * @param {Object} sender - Sender info
 * @returns {Promise<Object>} Detection result
 */
async function handleDetectLegalPage(message, sender) {
  try {
    const { url, title, content } = message;
    
    // Perform detection
    const result = detector.isLegalPage(url, title, content);
    
    console.log('[Termz] Detection result:', result);
    
    return {
      success: true,
      ...result
    };
    
  } catch (error) {
    console.error('[Termz] Detection error:', error);
    return {
      success: false,
      error: error.message,
      isLegal: false,
      confidence: 0
    };
  }
}

/**
 * Handle confirmed legal page detection
 * @param {Object} message - Message data
 * @param {Object} sender - Sender info
 * @returns {Promise<Object>} Response
 */
async function handleLegalPageConfirmed(message, sender) {
  try {
    const { url, title, result } = message;
    const tabId = sender.tab?.id;
    
    // Get user settings
    const settings = await storage.getSettings();
    
    // Auto-open side panel if enabled
    if (settings.autoOpenPanel && tabId) {
      try {
        await chrome.sidePanel.open({ tabId });
        console.log('[Termz] Side panel auto-opened for tab:', tabId);
      } catch (error) {
        console.log('[Termz] Could not auto-open side panel:', error.message);
      }
    }
    
    // Show notification if enabled
    if (settings.notifications && tabId) {
      await showDetectionNotification(tabId, title, result);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('[Termz] Error handling confirmed detection:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle text analysis request
 * @param {Object} message - Message data
 * @param {Object} sender - Sender info
 * @returns {Promise<Object>} Analysis result
 */
async function handleAnalyzeText(message, sender) {
  try {
    const { text, source, fileName } = message;
    
    if (!text || text.length < 50) {
      throw new Error('Text is too short to analyze (minimum 50 characters)');
    }
    
    console.log(`[Termz] Analyzing text (${text.length} characters, source: ${source})`);
    
    // Check AI availability
    const availability = await analyzer.checkAIAvailability();
    if (!availability.overall) {
      throw new Error(analyzer.getAIUnavailableMessage());
    }
    
    // Load settings for language preference
    const settings = await storage.getSettings();
    // Perform analysis
    const analysis = await analyzer.analyzeDocument(text, {
      source,
      fileName,
      outputLanguage: settings.outputLanguage || 'en'
    });
    
    // Add metadata
    analysis.url = source === 'manual_input' ? '' : (sender.tab?.url || '');
    analysis.title = fileName || (sender.tab?.title || 'Manual Analysis');
    analysis.source = source;
    
    // Store in active analyses
    if (sender.tab?.id) {
      state.activeAnalyses.set(sender.tab.id, analysis);
    }
    
    // Save to history
    await storage.saveAnalysis(analysis);
    
    console.log('[Termz] Analysis complete:', analysis.riskScore);
    
    return {
      success: true,
      analysis
    };
    
  } catch (error) {
    console.error('[Termz] Analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle exclusion check
 * @param {Object} message - Message data
 * @returns {Promise<Object>} Exclusion status
 */
async function handleCheckExclusion(message) {
  try {
    const isExcluded = await storage.isExcluded(message.url);
    return { success: true, isExcluded };
  } catch (error) {
    console.error('[Termz] Error checking exclusion:', error);
    return { success: false, isExcluded: false };
  }
}

/**
 * Handle get settings request
 * @returns {Promise<Object>} Settings
 */
async function handleGetSettings() {
  try {
    const settings = await storage.getSettings();
    return { success: true, settings };
  } catch (error) {
    console.error('[Termz] Error getting settings:', error);
    return { success: false, settings: {} };
  }
}

/**
 * Handle update settings request
 * @param {Object} message - Message data
 * @returns {Promise<Object>} Response
 */
async function handleUpdateSettings(message) {
  try {
    const success = await storage.saveSettings(message.settings);
    return { success };
  } catch (error) {
    console.error('[Termz] Error updating settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle open side panel and analyze request
 * @param {Object} message - Message data
 * @param {Object} sender - Sender info
 * @returns {Promise<Object>} Response
 */
async function handleOpenSidePanelAndAnalyze(message, sender) {
  try {
    const tabId = sender.tab?.id;
    if (!tabId) {
      throw new Error('No tab ID available');
    }
    
    // Open side panel
    await chrome.sidePanel.open({ tabId });
    
    // Send message to side panel to start analysis
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'ANALYZE_PAGE',
        url: message.url,
        title: message.title
      });
    }, 500);
    
    return { success: true };
    
  } catch (error) {
    console.error('[Termz] Error opening side panel:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle check page request
 * @param {Object} message - Message data
 * @returns {Promise<Object>} Response
 */
async function handleCheckPage(message) {
  try {
    // Perform quick detection check
    const isLikely = detector.quickCheck(message.url, message.title);
    
    return {
      success: true,
      isLegalPage: isLikely
    };
    
  } catch (error) {
    console.error('[Termz] Error checking page:', error);
    return { success: false, isLegalPage: false };
  }
}

/**
 * Handle get history request
 * @returns {Promise<Object>} History data
 */
async function handleGetHistory() {
  try {
    const history = await storage.getHistory();
    return { success: true, data: history };
  } catch (error) {
    console.error('[Termz] Error getting history:', error);
    return { success: false, data: [] };
  }
}

/**
 * Handle search history request
 * @param {Object} message - Message data
 * @returns {Promise<Object>} Filtered history data
 */
async function handleSearchHistory(message) {
  try {
    const history = await storage.searchHistory(message.query);
    return { success: true, data: history };
  } catch (error) {
    console.error('[Termz] Error searching history:', error);
    return { success: false, data: [] };
  }
}

/**
 * Handle clear history request
 * @returns {Promise<Object>} Response
 */
async function handleClearHistory() {
  try {
    await storage.clearHistory();
    return { success: true };
  } catch (error) {
    console.error('[Termz] Error clearing history:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle get exclusions request
 * @returns {Promise<Object>} Exclusions data
 */
async function handleGetExclusions() {
  try {
    const exclusions = await storage.getExclusions();
    return { success: true, exclusions };
  } catch (error) {
    console.error('[Termz] Error getting exclusions:', error);
    return { success: false, exclusions: [] };
  }
}

/**
 * Handle add exclusion request
 * @param {Object} message - Message data
 * @returns {Promise<Object>} Response
 */
async function handleAddExclusion(message) {
  try {
    await storage.addExclusion(message.domain);
    return { success: true };
  } catch (error) {
    console.error('[Termz] Error adding exclusion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle remove exclusion request
 * @param {Object} message - Message data
 * @returns {Promise<Object>} Response
 */
async function handleRemoveExclusion(message) {
  try {
    await storage.removeExclusion(message.domain);
    return { success: true };
  } catch (error) {
    console.error('[Termz] Error removing exclusion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle update setting request
 * @param {Object} message - Message data
 * @returns {Promise<Object>} Response
 */
async function handleUpdateSetting(message) {
  try {
    await storage.updateSetting(message.key, message.value);
    return { success: true };
  } catch (error) {
    console.error('[Termz] Error updating setting:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle export data request
 * @returns {Promise<Object>} Export data
 */
async function handleExportData() {
  try {
    const data = await storage.exportAllData();
    return { success: true, data };
  } catch (error) {
    console.error('[Termz] Error exporting data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle clear all data request
 * @returns {Promise<Object>} Response
 */
async function handleClearAllData() {
  try {
    await storage.clearAllData();
    return { success: true };
  } catch (error) {
    console.error('[Termz] Error clearing all data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle get API status request
 * @returns {Promise<Object>} API status
 */
async function handleGetAPIStatus() {
  try {
    const status = await analyzer.getAPIStatus();
    console.log('[Termz] API status retrieved:', status);
    return { success: true, status: status };
  } catch (error) {
    console.error('[Termz] Error getting API status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle prepare model request
 * @param {Object} message
 * @returns {Promise<Object>}
 */
async function handlePrepareModel(message) {
  try {
    const { api } = message;
    const settings = await storage.getSettings();
    const outputLanguage = settings.outputLanguage || 'en';
    
    const progress = (u) => {
      try {
        chrome.runtime.sendMessage({ type: 'MODEL_PREP_PROGRESS', api, ...u });
      } catch {}
    };
    const result = await analyzer.prepareModel(api, progress, outputLanguage);
    // After completion, send a final status update
    const status = await analyzer.getAPIStatus();
    chrome.runtime.sendMessage({ type: 'MODEL_PREP_COMPLETE', api, result, status });
    return { success: true, result };
  } catch (error) {
    console.error('[Termz] Prepare model error:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// Notifications
// ========================================

/**
 * Show notification when legal document is detected
 * @param {number} tabId - Tab ID
 * @param {string} title - Page title
 * @param {Object} result - Detection result
 */
async function showDetectionNotification(tabId, title, result) {
  try {
    // Avoid duplicate notifications
    const notificationId = `termz-${tabId}`;
    if (state.pendingNotifications.has(notificationId)) {
      return;
    }
    
    state.pendingNotifications.add(notificationId);
    
    // Create notification
    await chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Legal Document Detected',
      message: `Termz detected a legal document: ${title || 'Untitled'}`,
      buttons: [
        { title: 'Analyze Now' },
        { title: 'Dismiss' }
      ],
      priority: 1
    });
    
    // Auto-clear after 10 seconds
    setTimeout(() => {
      state.pendingNotifications.delete(notificationId);
    }, 10000);
    
  } catch (error) {
    console.error('[Termz] Error showing notification:', error);
  }
}

/**
 * Handle notification button clicks
 */
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (!notificationId.startsWith('termz-')) return;
  
  const tabId = parseInt(notificationId.replace('termz-', ''));
  
  if (buttonIndex === 0) {
    // "Analyze Now" clicked
    try {
      await chrome.sidePanel.open({ tabId });
      
      // Get tab info
      const tab = await chrome.tabs.get(tabId);
      
      // Send message to side panel
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'ANALYZE_PAGE',
          url: tab.url,
          title: tab.title
        });
      }, 500);
      
    } catch (error) {
      console.error('[Termz] Error opening side panel from notification:', error);
    }
  }
  
  // Clear notification
  chrome.notifications.clear(notificationId);
  state.pendingNotifications.delete(notificationId);
});

/**
 * Handle notification clicks
 */
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (!notificationId.startsWith('termz-')) return;
  
  const tabId = parseInt(notificationId.replace('termz-', ''));
  
  try {
    // Switch to tab and open side panel
    await chrome.tabs.update(tabId, { active: true });
    await chrome.sidePanel.open({ tabId });
    
  } catch (error) {
    console.error('[Termz] Error handling notification click:', error);
  }
  
  // Clear notification
  chrome.notifications.clear(notificationId);
  state.pendingNotifications.delete(notificationId);
});

// ========================================
// Tab Management
// ========================================

/**
 * Clean up data when tab is closed
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  // Remove from active analyses
  state.activeAnalyses.delete(tabId);
  
  // Clear any pending notifications
  const notificationId = `termz-${tabId}`;
  if (state.pendingNotifications.has(notificationId)) {
    chrome.notifications.clear(notificationId);
    state.pendingNotifications.delete(notificationId);
  }
});

// ========================================
// Extension Icon Click
// ========================================

/**
 * Handle extension icon click - open side panel
 */
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.error('[Termz] Error opening side panel:', error);
  }
});

// ========================================
// Utility Functions
// ========================================

/**
 * Clean up old data periodically
 */
async function cleanupOldData() {
  try {
    const settings = await storage.getSettings();
    const history = await storage.getHistory();
    
    // Keep only max number of history items
    if (history.length > settings.maxHistoryItems) {
      const toKeep = history.slice(0, settings.maxHistoryItems);
      await chrome.storage.local.set({ termz_history: toKeep });
      console.log('[Termz] Cleaned up old history items');
    }
    
    // Clean up old AI sessions (memory management)
    await analyzer.cleanupSessions();
    
  } catch (error) {
    console.error('[Termz] Error cleaning up data:', error);
  }
}

// Run cleanup periodically (every hour)
setInterval(cleanupOldData, 60 * 60 * 1000);

// ========================================
// Error Handling
// ========================================

/**
 * Global error handler
 */
self.addEventListener('error', (event) => {
  console.error('[Termz] Uncaught error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Termz] Unhandled promise rejection:', event.reason);
});

// ========================================
// Initialization
// ========================================
console.log('[Termz] Background service worker initialized');

