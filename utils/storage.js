/**
 * Storage Utility - Chrome Storage API Wrapper
 * Provides convenient functions for storing and retrieving extension data
 */

// ========================================
// Constants
// ========================================
const STORAGE_KEYS = {
  SETTINGS: 'termz_settings',
  HISTORY: 'termz_history',
  EXCLUSIONS: 'termz_exclusions'
};

const DEFAULT_SETTINGS = {
  autoDetection: true,
  notifications: true,
  autoOpenPanel: true, // Auto-open side panel when legal page detected
  analysisDepth: 'standard', // 'quick', 'standard', 'deep'
  theme: 'auto', // 'auto', 'light', 'dark'
  outputLanguage: 'en', // 'en', 'es', 'ja'
  maxHistoryItems: 50
};

// ========================================
// Settings Management
// ========================================

/**
 * Get user settings
 * @returns {Promise<Object>} Settings object
 */
export async function getSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) };
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user settings
 * @param {Object} settings - Settings object to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveSettings(settings) {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: { ...DEFAULT_SETTINGS, ...settings }
    });
    console.log('Settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

/**
 * Update a single setting
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @returns {Promise<boolean>} Success status
 */
export async function updateSetting(key, value) {
  try {
    const currentSettings = await getSettings();
    currentSettings[key] = value;
    return await saveSettings(currentSettings);
  } catch (error) {
    console.error('Error updating setting:', error);
    return false;
  }
}

// ========================================
// Analysis History Management
// ========================================

/**
 * Get analysis history
 * @param {number} limit - Maximum number of items to return (optional)
 * @returns {Promise<Array>} Array of analysis objects
 */
export async function getHistory(limit = null) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
    let history = result[STORAGE_KEYS.HISTORY] || [];
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply limit if specified
    if (limit && limit > 0) {
      history = history.slice(0, limit);
    }
    
    return history;
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

/**
 * Save analysis to history
 * @param {Object} analysis - Analysis object to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveAnalysis(analysis) {
  try {
    const settings = await getSettings();
    const history = await getHistory();
    
    // Add timestamp and ID if not present
    const analysisWithMeta = {
      ...analysis,
      id: analysis.id || generateId(),
      timestamp: analysis.timestamp || Date.now()
    };
    
    // Add to beginning of array
    history.unshift(analysisWithMeta);
    
    // Limit history size
    const maxItems = settings.maxHistoryItems || 50;
    const trimmedHistory = history.slice(0, maxItems);
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.HISTORY]: trimmedHistory
    });
    
    console.log('Analysis saved to history');
    return true;
  } catch (error) {
    console.error('Error saving analysis:', error);
    return false;
  }
}

/**
 * Get a specific analysis by ID
 * @param {string} id - Analysis ID
 * @returns {Promise<Object|null>} Analysis object or null if not found
 */
export async function getAnalysisById(id) {
  try {
    const history = await getHistory();
    return history.find(item => item.id === id) || null;
  } catch (error) {
    console.error('Error getting analysis by ID:', error);
    return null;
  }
}

/**
 * Delete a specific analysis from history
 * @param {string} id - Analysis ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteAnalysis(id) {
  try {
    const history = await getHistory();
    const filtered = history.filter(item => item.id !== id);
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.HISTORY]: filtered
    });
    
    console.log('Analysis deleted from history');
    return true;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return false;
  }
}

/**
 * Clear all analysis history
 * @returns {Promise<boolean>} Success status
 */
export async function clearHistory() {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.HISTORY]: []
    });
    console.log('History cleared');
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
}

/**
 * Search history by text
 * @param {string} query - Search query
 * @returns {Promise<Array>} Filtered array of analysis objects
 */
export async function searchHistory(query) {
  try {
    if (!query || query.trim() === '') {
      return await getHistory();
    }
    
    const history = await getHistory();
    const lowerQuery = query.toLowerCase();
    
    return history.filter(item => {
      const title = (item.title || '').toLowerCase();
      const url = (item.url || '').toLowerCase();
      const source = (item.source || '').toLowerCase();
      
      return title.includes(lowerQuery) || 
             url.includes(lowerQuery) || 
             source.includes(lowerQuery);
    });
  } catch (error) {
    console.error('Error searching history:', error);
    return [];
  }
}

// ========================================
// Site Exclusions Management
// ========================================

/**
 * Get list of excluded sites
 * @returns {Promise<Array>} Array of excluded domain strings
 */
export async function getExclusions() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.EXCLUSIONS);
    return result[STORAGE_KEYS.EXCLUSIONS] || [];
  } catch (error) {
    console.error('Error getting exclusions:', error);
    return [];
  }
}

/**
 * Add a site to exclusions list
 * @param {string} domain - Domain to exclude (e.g., "example.com")
 * @returns {Promise<boolean>} Success status
 */
export async function addExclusion(domain) {
  try {
    if (!domain || typeof domain !== 'string') {
      console.error('Invalid domain');
      return false;
    }
    
    // Normalize domain (remove protocol, www, trailing slash)
    const normalized = normalizeDomain(domain);
    
    const exclusions = await getExclusions();
    
    // Check if already excluded
    if (exclusions.includes(normalized)) {
      console.log('Domain already excluded');
      return true;
    }
    
    exclusions.push(normalized);
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.EXCLUSIONS]: exclusions
    });
    
    console.log('Domain added to exclusions:', normalized);
    return true;
  } catch (error) {
    console.error('Error adding exclusion:', error);
    return false;
  }
}

/**
 * Remove a site from exclusions list
 * @param {string} domain - Domain to remove from exclusions
 * @returns {Promise<boolean>} Success status
 */
export async function removeExclusion(domain) {
  try {
    const normalized = normalizeDomain(domain);
    const exclusions = await getExclusions();
    const filtered = exclusions.filter(d => d !== normalized);
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.EXCLUSIONS]: filtered
    });
    
    console.log('Domain removed from exclusions:', normalized);
    return true;
  } catch (error) {
    console.error('Error removing exclusion:', error);
    return false;
  }
}

/**
 * Check if a domain is excluded
 * @param {string} url - URL or domain to check
 * @returns {Promise<boolean>} True if excluded
 */
export async function isExcluded(url) {
  try {
    const domain = extractDomain(url);
    const exclusions = await getExclusions();
    return exclusions.includes(domain);
  } catch (error) {
    console.error('Error checking exclusion:', error);
    return false;
  }
}

// ========================================
// Data Management
// ========================================

/**
 * Export all extension data
 * @returns {Promise<Object>} Object containing all data
 */
export async function exportAllData() {
  try {
    const [settings, history, exclusions] = await Promise.all([
      getSettings(),
      getHistory(),
      getExclusions()
    ]);
    
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      settings,
      history,
      exclusions
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
}

/**
 * Import extension data
 * @param {Object} data - Data object to import
 * @returns {Promise<boolean>} Success status
 */
export async function importData(data) {
  try {
    if (!data || typeof data !== 'object') {
      console.error('Invalid import data');
      return false;
    }
    
    const updates = {};
    
    if (data.settings) {
      updates[STORAGE_KEYS.SETTINGS] = { ...DEFAULT_SETTINGS, ...data.settings };
    }
    
    if (data.history && Array.isArray(data.history)) {
      updates[STORAGE_KEYS.HISTORY] = data.history;
    }
    
    if (data.exclusions && Array.isArray(data.exclusions)) {
      updates[STORAGE_KEYS.EXCLUSIONS] = data.exclusions;
    }
    
    await chrome.storage.local.set(updates);
    console.log('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

/**
 * Clear all extension data
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllData() {
  try {
    await chrome.storage.local.clear();
    console.log('All data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}

/**
 * Get storage usage information
 * @returns {Promise<Object>} Object with bytes used and quota
 */
export async function getStorageInfo() {
  try {
    const bytesInUse = await chrome.storage.local.getBytesInUse();
    const quota = chrome.storage.local.QUOTA_BYTES || 5242880; // 5MB default
    
    return {
      bytesInUse,
      quota,
      percentageUsed: (bytesInUse / quota * 100).toFixed(2)
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { bytesInUse: 0, quota: 0, percentageUsed: 0 };
  }
}

// ========================================
// Utility Functions
// ========================================

/**
 * Generate a unique ID
 * @returns {string} Unique ID string
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Normalize domain for consistency
 * @param {string} domain - Domain to normalize
 * @returns {string} Normalized domain
 */
function normalizeDomain(domain) {
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('/')[0];
}

/**
 * Extract domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Extracted domain
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return normalizeDomain(url);
  }
}

// ========================================
// Storage Change Listener
// ========================================

/**
 * Listen for storage changes
 * @param {Function} callback - Callback function (changes, areaName) => {}
 */
export function onStorageChange(callback) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      callback(changes, areaName);
    }
  });
}

// ========================================
// Initialization
// ========================================

/**
 * Initialize storage with default values if needed
 * @returns {Promise<void>}
 */
export async function initStorage() {
  try {
    const settings = await getSettings();
    
    // If settings don't exist, create them
    if (!settings || Object.keys(settings).length === 0) {
      await saveSettings(DEFAULT_SETTINGS);
      console.log('Storage initialized with default settings');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

