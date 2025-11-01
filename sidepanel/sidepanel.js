/**
 * Termz Side Panel - Main UI Controller
 * Handles all user interactions, view management, and communication with background script
 */

// ========================================
// Imports
// ========================================
import { extractTextFromFile, cleanExtractedText } from '../utils/pdf-parser.js';
import { getAPIStatus } from '../utils/ai-analyzer.js';

// ========================================
// State Management
// ========================================
const state = {
  currentView: 'main', // 'main', 'history', 'settings'
  currentAnalysis: null,
  isAnalyzing: false,
  selectedFile: null
};

// ========================================
// DOM Elements
// ========================================
const elements = {
  // Views
  welcomeState: document.getElementById('welcomeState'),
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  analysisView: document.getElementById('analysisView'),
  historyView: document.getElementById('historyView'),
  settingsView: document.getElementById('settingsView'),
  
  // Header buttons
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  historyBtn: document.getElementById('historyBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  
  // Analysis view elements
  pageTitle: document.getElementById('pageTitle'),
  pageUrl: document.getElementById('pageUrl'),
  riskLabel: document.getElementById('riskLabel'),
  riskDescription: document.getElementById('riskDescription'),
  gaugeProgress: document.getElementById('gaugeProgress'),
  gaugeNeedle: document.getElementById('gaugeNeedle'),
  executiveSummary: document.getElementById('executiveSummary'),
  
  // Tab buttons
  tabBtns: document.querySelectorAll('.tab-btn'),
  
  // Tab panels
  risksTab: document.getElementById('risksTab'),
  glossaryTab: document.getElementById('glossaryTab'),
  summaryTab: document.getElementById('summaryTab'),
  keypointsTab: document.getElementById('keypointsTab'),
  
  // Content areas
  risksList: document.getElementById('risksList'),
  noRisks: document.getElementById('noRisks'),
  glossaryList: document.getElementById('glossaryList'),
  noGlossary: document.getElementById('noGlossary'),
  fullSummary: document.getElementById('fullSummary'),
  keyPointsList: document.getElementById('keyPointsList'),
  
  // Manual input
  manualInputSection: document.getElementById('manualInputSection'),
  inputTabBtns: document.querySelectorAll('.input-tab-btn'),
  textInputPanel: document.getElementById('textInputPanel'),
  fileInputPanel: document.getElementById('fileInputPanel'),
  manualTextArea: document.getElementById('manualTextArea'),
  analyzeTextBtn: document.getElementById('analyzeTextBtn'),
  fileInput: document.getElementById('fileInput'),
  fileUploadArea: document.getElementById('fileUploadArea'),
  fileInfo: document.getElementById('fileInfo'),
  fileName: document.getElementById('fileName'),
  removeFileBtn: document.getElementById('removeFileBtn'),
  fileProgress: document.getElementById('fileProgress'),
  fileProgressBar: document.getElementById('fileProgressBar'),
  analyzeFileBtn: document.getElementById('analyzeFileBtn'),
  
  // Error state
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn'),
  
  // History view
  backFromHistory: document.getElementById('backFromHistory'),
  historySearch: document.getElementById('historySearch'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  historyList: document.getElementById('historyList'),
  noHistory: document.getElementById('noHistory'),
  
  // Settings view
  backFromSettings: document.getElementById('backFromSettings'),
  autoDetectionToggle: document.getElementById('autoDetectionToggle'),
  notificationsToggle: document.getElementById('notificationsToggle'),
  analysisDepthSelect: document.getElementById('analysisDepthSelect'),
  outputLanguageSelect: document.getElementById('outputLanguageSelect'),
  themeSelect: document.getElementById('themeSelect'),
  apiStatusContainer: document.getElementById('apiStatusContainer'),
  refreshApiStatusBtn: document.getElementById('refreshApiStatusBtn'),
  exclusionsList: document.getElementById('exclusionsList'),
  exclusionInput: document.getElementById('exclusionInput'),
  addExclusionBtn: document.getElementById('addExclusionBtn'),
  exportDataBtn: document.getElementById('exportDataBtn'),
  clearDataBtn: document.getElementById('clearDataBtn')
};

// ========================================
// Initialization
// ========================================
/**
 * Initialize the side panel
 */
function init() {
  console.log('Termz side panel initializing...');
  
  // Set up event listeners
  setupEventListeners();
  
  // Load settings
  loadSettings();
  
  // Check for pending analysis from background
  checkForPendingAnalysis();
  
  console.log('Termz side panel ready');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Header navigation
  elements.historyBtn?.addEventListener('click', showHistoryView);
  elements.settingsBtn?.addEventListener('click', showSettingsView);
  elements.themeToggleBtn?.addEventListener('click', toggleThemePreference);
  
  // Tab switching
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  // Input tabs
  elements.inputTabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchInputTab(btn.dataset.inputTab));
  });
  
  // Manual text input
  elements.manualTextArea?.addEventListener('input', debounce(handleTextInput, 150));
  elements.analyzeTextBtn?.addEventListener('click', analyzeManualText);
  
  // File upload
  elements.fileInput?.addEventListener('change', handleFileSelect);
  elements.removeFileBtn?.addEventListener('click', removeSelectedFile);
  elements.analyzeFileBtn?.addEventListener('click', analyzeUploadedFile);
  
  // Click on upload area to trigger file input
  if (elements.fileUploadArea && elements.fileInput) {
    elements.fileUploadArea.addEventListener('click', () => {
      elements.fileInput.click();
    });
  }
  
  // Drag & Drop for upload area
  if (elements.fileUploadArea) {
    ['dragenter','dragover'].forEach(evt => {
      elements.fileUploadArea.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        elements.fileUploadArea.classList.add('drag-over');
      });
    });
    ;['dragleave','drop'].forEach(evt => {
      elements.fileUploadArea.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        elements.fileUploadArea.classList.remove('drag-over');
      });
    });
    elements.fileUploadArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;
      if (files && files[0]) {
        const fakeEvent = { target: { files } };
        handleFileSelect(fakeEvent);
      }
    });
  }
  
  // Error retry
  elements.retryBtn?.addEventListener('click', retryAnalysis);
  
  // History view
  elements.backFromHistory?.addEventListener('click', showMainView);
  elements.historySearch?.addEventListener('input', debounce(filterHistory, 300));
  elements.clearHistoryBtn?.addEventListener('click', clearHistory);
  
  // Settings view
  elements.backFromSettings?.addEventListener('click', showMainView);
  elements.autoDetectionToggle?.addEventListener('change', handleSettingChange);
  elements.notificationsToggle?.addEventListener('change', handleSettingChange);
  elements.autoOpenPanelToggle = document.getElementById('autoOpenPanelToggle');
  elements.autoOpenPanelToggle?.addEventListener('change', handleSettingChange);
  elements.analysisDepthSelect?.addEventListener('change', handleSettingChange);
  elements.outputLanguageSelect?.addEventListener('change', handleSettingChange);
  elements.themeSelect?.addEventListener('change', handleSettingChange);
  elements.refreshApiStatusBtn?.addEventListener('click', displayAPIStatus);
  elements.addExclusionBtn?.addEventListener('click', addExclusion);
  elements.exportDataBtn?.addEventListener('click', exportData);
  elements.clearDataBtn?.addEventListener('click', clearAllData);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // Add keyboard shortcuts
  setupKeyboardShortcuts();
}

/**
 * Set up keyboard shortcuts for better accessibility
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // Escape to close side panel (note: can't actually close, but can go back to welcome)
    if (event.key === 'Escape') {
      if (state.currentView !== 'main') {
        showMainView();
        event.preventDefault();
      }
    }
    
    // Enter to analyze when text area is focused
    if (event.key === 'Enter' && event.ctrlKey && elements.manualTextArea === document.activeElement) {
      if (!elements.analyzeTextBtn.disabled) {
        analyzeManualText();
        event.preventDefault();
      }
    }
    
    // Tab navigation is handled by browser naturally
  });
}

/**
 * Check if there's a pending analysis request from the background script
 */
async function checkForPendingAnalysis() {
  try {
    // Get current tab info to see if we should auto-analyze
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      // Send message to background to check if this page needs analysis
      chrome.runtime.sendMessage({ 
        type: 'CHECK_PAGE', 
        url: tab.url,
        title: tab.title 
      });
    }
  } catch (error) {
    console.error('Error checking for pending analysis:', error);
  }
}

// ========================================
// View Management
// ========================================
/**
 * Show main analysis view
 */
function showMainView() {
  state.currentView = 'main';
  elements.historyView?.classList.add('hidden');
  elements.settingsView?.classList.add('hidden');
  elements.manualInputSection?.classList.remove('hidden');
  
  if (state.currentAnalysis) {
    elements.welcomeState?.classList.add('hidden');
    elements.analysisView?.classList.remove('hidden');
  } else {
    elements.welcomeState?.classList.remove('hidden');
    elements.analysisView?.classList.add('hidden');
  }
}

/**
 * Show history view
 */
async function showHistoryView() {
  state.currentView = 'history';
  elements.analysisView?.classList.add('hidden');
  elements.welcomeState?.classList.add('hidden');
  elements.manualInputSection?.classList.add('hidden');
  elements.settingsView?.classList.add('hidden');
  elements.historyView?.classList.remove('hidden');
  
  // Load history
  await loadHistory();
}

/**
 * Show settings view
 */
async function showSettingsView() {
  state.currentView = 'settings';
  elements.analysisView?.classList.add('hidden');
  elements.welcomeState?.classList.add('hidden');
  elements.manualInputSection?.classList.add('hidden');
  elements.historyView?.classList.add('hidden');
  elements.settingsView?.classList.remove('hidden');
  
  // Load current settings
  await loadSettings();
  
  // Load and display API status
  await displayAPIStatus();
}

/**
 * Show loading state
 */
function showLoading(message = 'Analyzing document...') {
  state.isAnalyzing = true;
  elements.loadingState?.classList.remove('hidden');
  elements.welcomeState?.classList.add('hidden');
  elements.analysisView?.classList.add('hidden');
  elements.errorState?.classList.add('hidden');
  
  const loadingText = elements.loadingState?.querySelector('.loading-text');
  if (loadingText) loadingText.textContent = message;
}

/**
 * Hide loading state
 */
function hideLoading() {
  state.isAnalyzing = false;
  elements.loadingState?.classList.add('hidden');
}

/**
 * Show error state
 * @param {string} message - Error message to display
 */
function showError(message) {
  state.isAnalyzing = false;
  elements.errorState?.classList.remove('hidden');
  elements.loadingState?.classList.add('hidden');
  elements.welcomeState?.classList.add('hidden');
  elements.analysisView?.classList.add('hidden');
  
  if (elements.errorMessage) {
    elements.errorMessage.textContent = message;
  }
}

/**
 * Hide error state
 */
function hideError() {
  elements.errorState?.classList.add('hidden');
}

// ========================================
// Tab Management
// ========================================
/**
 * Switch between analysis tabs
 * @param {string} tabName - Name of the tab to switch to
 */
function switchTab(tabName) {
  // Update tab buttons
  elements.tabBtns.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });
  
  // Update tab panels
  const panels = {
    risks: elements.risksTab,
    glossary: elements.glossaryTab,
    summary: elements.summaryTab,
    keypoints: elements.keypointsTab
  };
  
  Object.keys(panels).forEach(key => {
    if (key === tabName) {
      panels[key]?.classList.remove('hidden');
      panels[key]?.classList.add('active');
    } else {
      panels[key]?.classList.add('hidden');
      panels[key]?.classList.remove('active');
    }
  });
}

/**
 * Switch between input tabs
 * @param {string} inputTab - Name of the input tab
 */
function switchInputTab(inputTab) {
  // Update input tab buttons
  elements.inputTabBtns.forEach(btn => {
    if (btn.dataset.inputTab === inputTab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update input panels
  if (inputTab === 'text') {
    elements.textInputPanel?.classList.remove('hidden');
    elements.textInputPanel?.classList.add('active');
    elements.fileInputPanel?.classList.add('hidden');
    elements.fileInputPanel?.classList.remove('active');
  } else {
    elements.fileInputPanel?.classList.remove('hidden');
    elements.fileInputPanel?.classList.add('active');
    elements.textInputPanel?.classList.add('hidden');
    elements.textInputPanel?.classList.remove('active');
  }
}

// ========================================
// Manual Input Handlers
// ========================================
/**
 * Handle text input changes
 */
function handleTextInput() {
  const text = elements.manualTextArea?.value.trim();
  if (elements.analyzeTextBtn) {
    elements.analyzeTextBtn.disabled = !text || text.length < 50;
  }
  const cc = document.getElementById('charCount');
  if (cc) {
    const len = text ? text.length : 0;
    cc.textContent = `${len} characters`;
  }
}

/**
 * Analyze manually entered text
 */
async function analyzeManualText() {
  const text = elements.manualTextArea?.value.trim();
  if (!text) return;
  
  showLoading('Analyzing text...');
  
  try {
    // Send to background for analysis
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_TEXT',
      text: text,
      source: 'manual_input'
    });
    
    if (response.success) {
      displayAnalysis(response.analysis);
    } else {
      showError(response.error || 'Failed to analyze text');
    }
  } catch (error) {
    console.error('Error analyzing text:', error);
    showError('An error occurred while analyzing the text. Please try again.');
  }
}

/**
 * Handle file selection
 * @param {Event} event - Change event from file input
 */
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  const validTypes = ['.pdf', '.txt', '.doc', '.docx'];
  const fileExt = '.' + file.name.split('.').pop().toLowerCase();
  
  if (!validTypes.includes(fileExt)) {
    showError('Invalid file type. Please upload PDF, TXT, DOC, or DOCX files.');
    return;
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showError('File is too large. Maximum size is 10MB.');
    return;
  }
  
  state.selectedFile = file;
  
  // Show file info
  if (elements.fileName) {
    elements.fileName.textContent = file.name;
  }
  elements.fileInfo?.classList.remove('hidden');
  
  // Enable analyze button
  if (elements.analyzeFileBtn) {
    elements.analyzeFileBtn.disabled = false;
  }
}

/**
 * Remove selected file
 */
function removeSelectedFile() {
  state.selectedFile = null;
  if (elements.fileInput) {
    elements.fileInput.value = '';
  }
  elements.fileInfo?.classList.add('hidden');
  if (elements.analyzeFileBtn) {
    elements.analyzeFileBtn.disabled = true;
  }
}

/**
 * Analyze uploaded file
 */
async function analyzeUploadedFile() {
  if (!state.selectedFile) return;
  
  showLoading('Extracting text from document...');
  elements.fileProgress?.classList.remove('hidden');
  
  try {
    // Read file and extract text with progress callback
    let text = await extractTextFromFile(state.selectedFile, (progress) => {
      if (elements.fileProgressBar) {
        elements.fileProgressBar.style.width = `${progress}%`;
      }
    });
    text = cleanExtractedText(text);
    
    if (!text || text.length < 50) {
      showError('Could not extract enough text from the file. The file may be empty or corrupted.');
      return;
    }
    
    // Hide file progress, update loading message
    elements.fileProgress?.classList.add('hidden');
    showLoading('Analyzing document...');
    
    // Send to background for analysis
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_TEXT',
      text: text,
      source: 'file_upload',
      fileName: state.selectedFile.name
    });
    
    if (response.success) {
      displayAnalysis(response.analysis);
      removeSelectedFile();
    } else {
      showError(response.error || 'Failed to analyze document');
    }
  } catch (error) {
    console.error('Error analyzing file:', error);
    showError(error.message || 'An error occurred while analyzing the file. Please try again.');
  } finally {
    elements.fileProgress?.classList.add('hidden');
    if (elements.fileProgressBar) {
      elements.fileProgressBar.style.width = '0%';
    }
  }
}

// Note: extractTextFromFile is imported from '../utils/pdf-parser.js'
// It handles PDF, DOCX, and TXT files with progress callbacks

// ========================================
// Analysis Display
// ========================================
/**
 * Display analysis results
 * @param {Object} analysis - Analysis results object
 */
function displayAnalysis(analysis) {
  state.currentAnalysis = analysis;
  
  hideLoading();
  hideError();
  elements.welcomeState?.classList.add('hidden');
  elements.analysisView?.classList.remove('hidden');
  
  // Display page info
  if (elements.pageTitle) {
    elements.pageTitle.textContent = analysis.title || 'Analyzed Document';
  }
  if (elements.pageUrl) {
    let urlText = analysis.url || analysis.source || '';

    // Add metadata badges (text-only)
    if (analysis.metadata) {
      const extras = [];
      if (analysis.metadata.readingTime) {
        extras.push(`${analysis.metadata.readingTime} min read`);
      }
      if (analysis.metadata.complexity) {
        extras.push(`${capitalize(analysis.metadata.complexity.replace('_', ' '))} complexity`);
      }
      if (analysis.metadata.documentType) {
        extras.push(`${formatDocumentType(analysis.metadata.documentType)}`);
      }

      if (extras.length > 0) {
        urlText += ` • ${extras.join(' • ')}`;
      }
    }

    elements.pageUrl.textContent = urlText;
  }
  
  // Display risk score
  displayRiskScore(analysis.riskScore || 'low');
  
  // Display executive summary
  if (elements.executiveSummary) {
    elements.executiveSummary.textContent = analysis.summary?.executive || 'Analysis complete.';
  }
  
  // Display risk alerts
  displayRisks(analysis.riskFactors || []);
  
  // Display glossary
  displayGlossary(analysis.glossary || []);
  
  // Display full summary
  displayFullSummary(analysis.summary?.fullSummary || '');
  
  // Display key points
  displayKeyPoints(analysis.summary?.keyPoints || []);
  
  // Save to history
  saveToHistory(analysis);
}

/**
 * Display risk score gauge
 * @param {string} riskLevel - 'low', 'medium', or 'high'
 */
function displayRiskScore(riskLevel) {
  const riskData = {
    low: { label: 'Low Risk', description: 'This document appears relatively fair', color: '#4CAF50', rotation: -60 },
    medium: { label: 'Medium Risk', description: 'Some concerning clauses warrant attention', color: '#FF9800', rotation: 0 },
    high: { label: 'High Risk', description: 'Multiple problematic clauses detected', color: '#F44336', rotation: 60 }
  };
  
  const data = riskData[riskLevel] || riskData.low;
  
  if (elements.riskLabel) {
    elements.riskLabel.textContent = data.label;
    elements.riskLabel.className = `risk-label ${riskLevel}`;
  }
  
  if (elements.riskDescription) {
    elements.riskDescription.textContent = data.description;
  }
  
  if (elements.gaugeProgress) {
    elements.gaugeProgress.style.stroke = data.color;
  }
  
  if (elements.gaugeNeedle) {
    elements.gaugeNeedle.style.transform = `translateX(-50%) rotate(${data.rotation}deg)`;
  }
}

/**
 * Display risk alerts
 * @param {Array} risks - Array of risk objects
 */
function displayRisks(risks) {
  if (!elements.risksList) return;
  
  elements.risksList.innerHTML = '';
  
  if (!risks || risks.length === 0) {
    elements.noRisks?.classList.remove('hidden');
    elements.risksList.classList.add('hidden');
    return;
  }
  
  elements.noRisks?.classList.add('hidden');
  elements.risksList.classList.remove('hidden');
  
  risks.forEach(risk => {
    const riskItem = document.createElement('div');
    riskItem.className = `risk-item severity-${risk.severity || 'medium'}`;
    riskItem.innerHTML = `
      <div class="risk-header">
        <span class="risk-clause">${escapeHtml(risk.clause || 'Clause')}</span>
        <span class="severity-badge ${risk.severity || 'medium'}">${risk.severity || 'medium'}</span>
      </div>
      <p class="risk-issue">${escapeHtml(risk.issue || '')}</p>
      <p class="risk-explanation">${escapeHtml(risk.explanation || '')}</p>
    `;
    elements.risksList.appendChild(riskItem);
  });
}

/**
 * Display glossary terms
 * @param {Array} glossary - Array of glossary term objects
 */
function displayGlossary(glossary) {
  if (!elements.glossaryList) return;
  
  elements.glossaryList.innerHTML = '';
  
  if (!glossary || glossary.length === 0) {
    elements.noGlossary?.classList.remove('hidden');
    elements.glossaryList.classList.add('hidden');
    return;
  }
  
  elements.noGlossary?.classList.add('hidden');
  elements.glossaryList.classList.remove('hidden');
  
  glossary.forEach(item => {
    const glossaryItem = document.createElement('div');
    glossaryItem.className = 'glossary-item';
    glossaryItem.innerHTML = `
      <div class="glossary-term">
        <span class="term-name">${escapeHtml(item.term || '')}</span>
        <span class="term-arrow">›</span>
      </div>
      <div class="glossary-definition">${escapeHtml(item.definition || '')}</div>
    `;
    
    // Add click handler for expansion
    const termDiv = glossaryItem.querySelector('.glossary-term');
    termDiv.addEventListener('click', () => {
      glossaryItem.classList.toggle('expanded');
    });
    
    elements.glossaryList.appendChild(glossaryItem);
  });
}

/**
 * Display full summary
 * @param {string} summary - Full summary text
 */
function displayFullSummary(summary) {
  if (!elements.fullSummary) return;
  
  elements.fullSummary.innerHTML = `<p>${escapeHtml(summary || 'No detailed summary available.')}</p>`;
}

/**
 * Display key points
 * @param {Array} keyPoints - Array of key point strings
 */
function displayKeyPoints(keyPoints) {
  if (!elements.keyPointsList) return;
  
  elements.keyPointsList.innerHTML = '';
  
  if (!keyPoints || keyPoints.length === 0) {
    elements.keyPointsList.innerHTML = '<li>No key points identified.</li>';
    return;
  }
  
  keyPoints.forEach(point => {
    const li = document.createElement('li');
    li.textContent = point;
    elements.keyPointsList.appendChild(li);
  });
}

// ========================================
// Message Handler
// ========================================
/**
 * Handle messages from background script
 * @param {Object} message - Message object
 * @param {Object} sender - Sender info
 * @param {Function} sendResponse - Response callback
 */
function handleMessage(message, sender, sendResponse) {
  console.log('Side panel received message:', message.type);
  
  switch (message.type) {
    case 'ANALYZE_PAGE':
      if (message.analysis) {
        displayAnalysis(message.analysis);
      } else if (message.url) {
        // Start analysis for this page
        showLoading('Detecting legal content...');
      }
      break;
      
    case 'ANALYSIS_COMPLETE':
      displayAnalysis(message.analysis);
      break;
      
    case 'ANALYSIS_ERROR':
      showError(message.error || 'Analysis failed');
      break;
      
    case 'SELECTED_TEXT':
      // User right-clicked and selected "Analyze with Termz"
      if (message.text) {
        elements.manualTextArea.value = message.text;
        handleTextInput();
        switchInputTab('text');
        showMainView();
      }
      break;
    
    case 'MODEL_PREP_PROGRESS': {
      const api = message.api;
      const bar = elements.apiStatusContainer?.querySelector(`[data-progress="${api}"]`);
      const fill = elements.apiStatusContainer?.querySelector(`[data-progress-fill="${api}"]`);
      if (bar) bar.classList.remove('hidden');
      if (fill && typeof message.percent === 'number') {
        fill.style.width = `${Math.max(5, Math.min(100, message.percent))}%`;
      }
      break;
    }
    case 'MODEL_PREP_COMPLETE': {
      displayAPIStatus();
      break;
    }
      
    default:
      console.log('Unknown message type:', message.type);
  }
  
  return true;
}

// ========================================
// History Management
// ========================================
/**
 * Load analysis history
 */
async function loadHistory() {
  try {
    const history = await chrome.runtime.sendMessage({ type: 'GET_HISTORY' });
    
    if (!history || !history.data || history.data.length === 0) {
      elements.noHistory?.classList.remove('hidden');
      elements.historyList.innerHTML = '';
      return;
    }
    
    elements.noHistory?.classList.add('hidden');
    displayHistoryItems(history.data);
    
  } catch (error) {
    console.error('Error loading history:', error);
    elements.noHistory?.classList.remove('hidden');
  }
}

/**
 * Display history items in the list
 * @param {Array} items - History items
 */
function displayHistoryItems(items) {
  if (!elements.historyList) return;
  
  elements.historyList.innerHTML = '';
  
  items.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.dataset.id = item.id;
    
    const date = new Date(item.timestamp).toLocaleDateString();
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    historyItem.innerHTML = `
      <div class="history-item-title">${escapeHtml(item.title || 'Untitled Analysis')}</div>
      <div class="history-item-url">${escapeHtml(item.url || item.source || 'Manual input')}</div>
      <div class="history-item-meta">
        <span class="history-item-risk ${item.riskScore || 'low'}">${capitalize(item.riskScore || 'low')} Risk</span>
        <span>${date} ${time}</span>
      </div>
    `;
    
    // Click to view
    historyItem.addEventListener('click', () => viewHistoryItem(item));
    
    elements.historyList.appendChild(historyItem);
  });
}

/**
 * View a history item
 * @param {Object} item - History item
 */
function viewHistoryItem(item) {
  displayAnalysis(item);
  showMainView();
}

/**
 * Filter history based on search
 */
async function filterHistory() {
  const searchTerm = elements.historySearch?.value.toLowerCase() || '';
  
  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'SEARCH_HISTORY',
      query: searchTerm
    });
    
    if (response && response.data) {
      displayHistoryItems(response.data);
    }
  } catch (error) {
    console.error('Error filtering history:', error);
  }
}

/**
 * Clear all history
 */
async function clearHistory() {
  if (!confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
    return;
  }
  
  try {
    const response = await chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' });
    
    if (response && response.success) {
      elements.historyList.innerHTML = '';
      elements.noHistory?.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error clearing history:', error);
    alert('Failed to clear history. Please try again.');
  }
}

/**
 * Save analysis to history
 * @param {Object} analysis - Analysis to save
 */
async function saveToHistory(analysis) {
  // History is saved automatically in background.js when analysis completes
  console.log('Analysis saved to history');
}

// ========================================
// Settings Management
// ========================================
/**
 * Load user settings
 */
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    const settings = response?.settings || {};
    
    // Update UI with current settings
    if (elements.autoDetectionToggle) {
      elements.autoDetectionToggle.checked = settings.autoDetection !== false;
    }
    if (elements.notificationsToggle) {
      elements.notificationsToggle.checked = settings.notifications !== false;
    }
    if (elements.autoOpenPanelToggle) {
      elements.autoOpenPanelToggle.checked = settings.autoOpenPanel !== false;
    }
    if (elements.analysisDepthSelect) {
      elements.analysisDepthSelect.value = settings.analysisDepth || 'standard';
    }
    if (elements.outputLanguageSelect) {
      elements.outputLanguageSelect.value = settings.outputLanguage || 'en';
    }
    if (elements.themeSelect) {
      elements.themeSelect.value = settings.theme || 'auto';
      applyTheme(settings.theme || 'auto');
    }
    
    // Load exclusions
    await loadExclusions();
    
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Load exclusions list
 */
async function loadExclusions() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_EXCLUSIONS' });
    const exclusions = response?.exclusions || [];
    
    if (!elements.exclusionsList) return;
    
    elements.exclusionsList.innerHTML = '';
    
    if (exclusions.length === 0) {
      elements.exclusionsList.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">No excluded sites</p>';
      return;
    }
    
    exclusions.forEach(domain => {
      const item = document.createElement('div');
      item.className = 'exclusion-item';
      item.innerHTML = `
        <span class="exclusion-domain">${escapeHtml(domain)}</span>
        <button class="btn-icon" data-domain="${escapeHtml(domain)}" aria-label="Remove ${domain}">×</button>
      `;
      
      item.querySelector('.btn-icon').addEventListener('click', () => removeExclusion(domain));
      elements.exclusionsList.appendChild(item);
    });
    
  } catch (error) {
    console.error('Error loading exclusions:', error);
  }
}

/**
 * Handle setting changes
 */
async function handleSettingChange(event) {
  const settingId = event.target.id;
  const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  
  const settingMap = {
    'autoDetectionToggle': 'autoDetection',
    'notificationsToggle': 'notifications',
    'autoOpenPanelToggle': 'autoOpenPanel',
    'analysisDepthSelect': 'analysisDepth',
    'outputLanguageSelect': 'outputLanguage',
    'themeSelect': 'theme'
  };
  
  const settingKey = settingMap[settingId];
  if (!settingKey) return;
  
  try {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTING',
      key: settingKey,
      value: value
    });
    
    // Apply theme immediately if theme changed
    if (settingKey === 'theme') {
      applyTheme(value);
    }
    
    console.log(`Setting ${settingKey} updated to:`, value);
  } catch (error) {
    console.error('Error updating setting:', error);
  }
}

/**
 * Apply theme to the UI
 * @param {string} theme - Theme preference ('auto', 'light', 'dark')
 */
function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'light') {
    root.classList.remove('dark-mode');
    root.classList.add('light-mode');
  } else if (theme === 'dark') {
    root.classList.remove('light-mode');
    root.classList.add('dark-mode');
  } else {
    // Auto: use system preference
    root.classList.remove('light-mode', 'dark-mode');
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark-mode');
    } else {
      root.classList.add('light-mode');
    }
  }
}

/**
 * Toggle theme preference in order: auto -> light -> dark -> auto
 */
async function toggleThemePreference() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    const current = response?.settings?.theme || 'auto';
    const next = current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto';
    await chrome.runtime.sendMessage({ type: 'UPDATE_SETTING', key: 'theme', value: next });
    applyTheme(next);
  } catch (e) {
    console.error('Error toggling theme:', e);
  }
}

/**
 * Display API Status in settings
 */
async function displayAPIStatus() {
  if (!elements.apiStatusContainer) return;
  
  // Show loading state
  elements.apiStatusContainer.innerHTML = '<div class="api-status-loading">Checking API status...</div>';
  
  try {
    // Get API status directly in side panel context to avoid service worker limitations
    const status = await getAPIStatus();
    
    let html = '';
    
    // Overall summary
    if (status.overall.allPresent && status.overall.anyReady) {
      html += `
        <div class="api-status-summary">
          <div class="api-status-summary-title">All APIs Available</div>
          <div class="api-status-summary-text">Chrome Built-in AI is ready to use.</div>
        </div>
      `;
    } else if (status.overall.tokenNeeded) {
      html += `
        <div class="api-status-summary">
          <div class="api-status-summary-title">Origin Trial Token Required</div>
          <div class="api-status-summary-text">Some APIs need an Origin Trial token. Tokens are included in the extension. See <a href="https://termz.it.com" target="_blank">documentation</a> for details.</div>
        </div>
      `;
    } else if (status.overall.modelDownloadNeeded) {
      html += `
        <div class="api-status-summary">
          <div class="api-status-summary-title">Model Download Needed</div>
      <div class="api-status-summary-text">
        This feature relies on Chrome’s on‑device AI model. If your browser supports it, you’ll see a “Prepare” button below to download the model. If you don’t see it, update Chrome and try again. Learn more in <a href="https://developer.chrome.com/docs/ai/built-in" target="_blank">Chrome Built‑in AI docs</a>.
      </div>
        </div>
      `;
    }
    
    // Individual API status
    for (const [key, apiStatus] of Object.entries(status)) {
      if (key === 'overall') continue;
      
      const badge = getAPIStatusBadge(apiStatus);
      const tokenBadge = apiStatus.requiresToken ? '<span style="font-size: 10px; color: var(--text-secondary);">Token Required</span>' : '<span style="font-size: 10px; color: var(--text-secondary);">Stable</span>';
      const prepareButton = apiStatus.status === 'after-download' ? `<button class="btn btn-secondary btn-sm" data-prepare="${key}">Prepare</button>` : '';
      const progress = `<div class="progress-bar hidden" data-progress="${key}"><div class="progress-fill" data-progress-fill="${key}"></div></div>`;

      html += `
        <div class="api-status-item">
          <div class="api-status-info">
            <div class="api-status-name">${apiStatus.name}</div>
            <div class="api-status-desc">${tokenBadge}</div>
            ${progress}
          </div>
          <div style="display:flex; align-items:center; gap:8px;">${badge}${prepareButton}</div>
        </div>
      `;
    }
    
    // Diagnostics (raw values) and enable guidance
    const diagnostics = {
      prompt: {
        present: status.promptAPI?.present ?? false,
        status: status.promptAPI?.status ?? 'unknown',
        error: status.promptAPI?.error || null
      },
      summarizer: {
        present: status.summarizer?.present ?? false,
        status: status.summarizer?.status ?? 'unknown',
        error: status.summarizer?.error || null
      },
      writer: {
        present: status.writer?.present ?? false,
        status: status.writer?.status ?? 'unknown',
        error: status.writer?.error || null
      },
      rewriter: {
        present: status.rewriter?.present ?? false,
        status: status.rewriter?.status ?? 'unknown',
        error: status.rewriter?.error || null
      }
    };

    html += `
      <details class="api-diagnostics">
        <summary>Show diagnostics</summary>
        <pre class="api-diagnostics-pre">${escapeHtml(JSON.stringify(diagnostics, null, 2))}</pre>
      </details>
    `;

    elements.apiStatusContainer.innerHTML = html;

    // Wire prepare buttons
    elements.apiStatusContainer.querySelectorAll('[data-prepare]')?.forEach(btn => {
      btn.addEventListener('click', async () => {
        const api = btn.getAttribute('data-prepare');
        const bar = elements.apiStatusContainer.querySelector(`[data-progress="${api}"]`);
        const fill = elements.apiStatusContainer.querySelector(`[data-progress-fill="${api}"]`);
        bar?.classList.remove('hidden');
        if (fill) fill.style.width = '5%';
        try {
          await chrome.runtime.sendMessage({ type: 'PREPARE_MODEL', api });
        } catch (e) {
          console.error('Prepare model error:', e);
        }
      });
    });
    
  } catch (error) {
    console.error('Error displaying API status:', error);
    elements.apiStatusContainer.innerHTML = `
      <div class="api-status-loading" style="color: var(--danger-color);">
        Error checking API status. ${error.message}
      </div>
    `;
  }
}

/**
 * Get HTML badge for API status
 * @param {Object} apiStatus - API status object
 * @returns {string} HTML for status badge
 */
function getAPIStatusBadge(apiStatus) {
  if (!apiStatus.present) {
    return '<span class="api-status-badge not-present">Not Present</span>';
  }

  if (apiStatus.status === 'readily') {
    return '<span class="api-status-badge ready">Ready</span>';
  }

  if (apiStatus.status === 'after-download') {
    return '<span class="api-status-badge downloading">Download Needed</span>';
  }

  if (apiStatus.error) {
    return '<span class="api-status-badge error">Error</span>';
  }

  return '<span class="api-status-badge missing">Unavailable</span>';
}

/**
 * Add site to exclusion list
 */
async function addExclusion() {
  const domain = elements.exclusionInput?.value.trim();
  if (!domain) return;
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'ADD_EXCLUSION',
      domain: domain
    });
    
    if (response && response.success) {
      elements.exclusionInput.value = '';
      await loadExclusions();
    }
  } catch (error) {
    console.error('Error adding exclusion:', error);
    alert('Failed to add exclusion. Please try again.');
  }
}

/**
 * Remove site from exclusion list
 * @param {string} domain - Domain to remove
 */
async function removeExclusion(domain) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'REMOVE_EXCLUSION',
      domain: domain
    });
    
    if (response && response.success) {
      await loadExclusions();
    }
  } catch (error) {
    console.error('Error removing exclusion:', error);
  }
}

/**
 * Export all data as JSON
 */
async function exportData() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'EXPORT_DATA' });
    
    if (response && response.data) {
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `termz-export-${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Failed to export data. Please try again.');
  }
}

/**
 * Clear all extension data
 */
async function clearAllData() {
  if (!confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
    return;
  }
  
  if (!confirm('This will delete all history, settings, and exclusions. Are you absolutely sure?')) {
    return;
  }
  
  try {
    const response = await chrome.runtime.sendMessage({ type: 'CLEAR_ALL_DATA' });
    
    if (response && response.success) {
      alert('All data cleared successfully.');
      // Reload settings
      await loadSettings();
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    alert('Failed to clear data. Please try again.');
  }
}

/**
 * Retry last failed analysis
 */
function retryAnalysis() {
  hideError();
  showMainView();
}

// ========================================
// Utility Functions
// ========================================
/**
 * Debounce function to limit rapid calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format document type for display
 * @param {string} type - Document type string
 * @returns {string} Formatted type
 */
function formatDocumentType(type) {
  const typeMap = {
    'privacy_policy': 'Privacy Policy',
    'terms_of_service': 'Terms of Service',
    'cookie_policy': 'Cookie Policy',
    'user_agreement': 'User Agreement',
    'eula': 'EULA',
    'legal_document': 'Legal Document'
  };
  return typeMap[type] || capitalize(type.replace(/_/g, ' '));
}

// ========================================
// Initialize on DOM load
// ========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

