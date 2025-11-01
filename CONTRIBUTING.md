# Contributing to Termz

Thank you for your interest in contributing to Termz! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members
- Accept constructive criticism gracefully

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/termz.git
   cd termz
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- **Chrome Dev** or **Chrome Canary** (version 128+)
- **Git** for version control
- **Text editor** (VS Code, Sublime, etc.)

### Enable Chrome AI APIs

1. Navigate to `chrome://flags`
2. Enable these flags:
   - "Prompt API for Gemini Nano" → Enabled
   - "Optimization Guide on Device Model" → Enabled
3. Restart Chrome
4. Go to `chrome://components`
5. Find "Optimization Guide On Device Model" and click "Check for update"

### Load the Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `Termz` directory

### No Build Step Required

Termz uses vanilla JavaScript with no build process. You can edit files and simply reload the extension in Chrome to see changes.

## Project Structure

```
termz/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Background service worker (ES modules)
├── content.js            # Content script for page detection
├── sidepanel/
│   ├── sidepanel.html    # Side panel UI
│   ├── sidepanel.css     # Styles with dark mode support
│   └── sidepanel.js      # Side panel logic
├── utils/
│   ├── ai-analyzer.js    # AI API integration (Prompt, Summarizer, Rewriter, Writer)
│   ├── detector.js       # Legal page detection algorithms
│   ├── storage.js        # Chrome storage API wrapper
│   └── pdf-parser.js     # Document text extraction
└── icons/                # Extension icons
```

## Coding Standards

### JavaScript

- **ES6+ syntax**: Use modern JavaScript features (async/await, arrow functions, etc.)
- **No frameworks**: Keep dependencies minimal - vanilla JS only
- **JSDoc comments**: Document all functions with JSDoc format
- **Error handling**: Always use try/catch for async operations
- **Console logging**: Use `console.log` for debugging, but remove before committing

### Example Function Documentation

```javascript
/**
 * Analyze a legal document using AI
 * @param {string} text - Document text to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Analysis results
 * @throws {Error} If AI is unavailable or text is invalid
 */
export async function analyzeDocument(text, options = {}) {
  // Implementation
}
```

### Code Style

- **Indentation**: 2 spaces (no tabs)
- **Line length**: Max 100 characters (flexible for readability)
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes
  - `UPPER_SNAKE_CASE` for constants
- **Semicolons**: Use them consistently
- **Quotes**: Single quotes for strings, template literals for interpolation

### CSS

- **Variables**: Use CSS custom properties for theming
- **Dark mode**: Always provide dark mode styles with `prefers-color-scheme`
- **BEM naming**: Use BEM-like naming for classes (`.block__element--modifier`)
- **Mobile-first**: Design for mobile, then add desktop styles

## Making Changes

### Before You Start

1. Check existing [issues](https://github.com/yourusername/termz/issues) and [pull requests](https://github.com/yourusername/termz/pulls)
2. Create or comment on an issue describing what you plan to do
3. Wait for maintainer feedback before starting large changes

### Types of Contributions

#### Bug Fixes

- Reference the issue number in your commit message
- Include steps to reproduce in your PR description
- Add tests if applicable

#### New Features

- Discuss the feature in an issue first
- Keep features focused and atomic
- Update documentation (README, code comments)
- Consider backward compatibility

#### Documentation

- Fix typos, improve clarity, add examples
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(analyzer): add support for DOCX file analysis

Implemented text extraction from DOCX files using mammoth.js
library loaded from CDN.

Closes #45
```

```
fix(detector): improve false positive detection rate

Adjusted confidence scoring algorithm to reduce false positives
on technical documentation pages.

Fixes #38
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test the following:

- [ ] Extension loads without errors
- [ ] Auto-detection works on known legal pages (privacy policies, terms of service)
- [ ] Manual text analysis works
- [ ] File upload and analysis works (TXT, PDF)
- [ ] Risk detection identifies problematic clauses
- [ ] Glossary generation works
- [ ] History saves and loads correctly
- [ ] Settings persist across browser restarts
- [ ] Notifications appear when enabled
- [ ] Context menu "Analyze with Termz" works
- [ ] Dark mode displays correctly
- [ ] No console errors in:
  - Background service worker console
  - Side panel console
  - Content script console (page console)

### Test Pages

Test on these real-world legal documents:

- https://policies.google.com/privacy
- https://www.facebook.com/privacy/policy/
- https://twitter.com/en/privacy
- https://www.reddit.com/policies/privacy-policy
- https://www.apple.com/legal/privacy/

### Browser Console Debugging

1. **Background Service Worker**: 
   - Go to `chrome://extensions`
   - Find Termz, click "service worker" link
   
2. **Side Panel**:
   - Open side panel
   - Right-click → "Inspect"
   
3. **Content Script**:
   - Open page console (F12)
   - Look for `[Termz]` prefixed logs

## Submitting Changes

### Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**:
   - Go to GitHub and create a PR from your fork
   - Fill out the PR template completely
   - Reference any related issues
   - Add screenshots/GIFs for UI changes

4. **PR Review**:
   - Maintainers will review your code
   - Address feedback promptly
   - Be open to suggestions and changes
   - Keep PRs focused and small when possible

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] All files have proper JSDoc comments
- [ ] Manual testing completed
- [ ] No console errors or warnings
- [ ] README updated if needed
- [ ] Commit messages follow conventional format
- [ ] Branch is up-to-date with main

## Reporting Bugs

Use the [GitHub Issues](https://github.com/yourusername/termz/issues) page to report bugs.

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - Browser: [Chrome Dev/Canary]
 - Version: [e.g. 128.0.6545.0]
 - OS: [e.g. macOS, Windows, Linux]
 - Termz version: [e.g. 1.0.0]

**Additional context**
Any other relevant information.

**Console Errors**
```
Paste console errors here
```
```

## Suggesting Features

We love feature suggestions! Please use GitHub Issues with the "enhancement" label.

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature.

**Use Case**
Why is this feature useful? What problem does it solve?

**Proposed Solution**
How would you implement this?

**Alternatives Considered**
Other approaches you've thought about.

**Additional Context**
Screenshots, mockups, related links, etc.
```

## Development Tips

### Debugging

- Use `CONFIG.debugMode = true` in content.js for verbose logging
- Monitor the service worker console for background script issues
- Use Chrome DevTools Network tab to inspect API calls
- Check `chrome://storage` to view extension storage data

### Common Issues

**AI APIs not available:**
- Ensure Gemini Nano is enabled and downloaded
- Check `chrome://components` for model status

**Extension not updating:**
- Click "Update" button in `chrome://extensions`
- Or disable and re-enable the extension

**Side panel not opening:**
- Check manifest.json permissions
- Verify side panel path is correct

### Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/built-in-apis)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

## Questions?

- Open a [Discussion](https://github.com/yourusername/termz/discussions) on GitHub
- Check existing issues and pull requests
- Tag maintainers if you need urgent help

## License

By contributing to Termz, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Termz!** 🎉

