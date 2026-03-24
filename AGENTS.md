# Markdown Reader - AGENTS.md

> This file is intended for AI coding agents working on the Markdown Reader Chrome extension project.
> 本文档供 AI 编程助手参考，项目主要使用中文注释和文档。

---

## Project Overview

**Markdown Reader** is a Chrome extension (Manifest V3) that provides an elegant way to view Markdown files directly in the browser. It features an outline navigation sidebar, theme switching (light/dark), and persistent settings.

**Key Features:**
- 📝 Markdown rendering using marked.js (GitHub Flavored Markdown)
- 📑 Auto-generated document outline with click-to-navigate
- 🎨 Light/Dark theme switching
- 💾 Persistent settings via Chrome Storage API
- 📱 Responsive design
- 🔄 Auto-update mechanism for marked.js library

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Extension Standard | Chrome Extension Manifest V3 |
| Markdown Parser | marked.js v17.0.4 |
| Frontend | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| Storage | Chrome Storage API (chrome.storage.local / chrome.storage.sync) |
| Styling | CSS Variables for theming, GitHub-like markdown styles |

---

## Project Structure

```
plugin-md-reader/
├── manifest.json              # Extension manifest (Manifest V3)
├── background.js              # Service worker - handles lifecycle & URL interception
├── markdown-viewer.html       # Main viewer page (Markdown rendering UI)
├── popup.html                 # Extension popup/settings panel
├── package.json               # NPM dependencies (marked)
├── test.md                    # Test document for development
│
├── js/                        # JavaScript modules
│   ├── content.js             # Content script - detects Markdown pages
│   ├── marked.min.js          # Bundled marked.js library
│   └── viewer.js              # Main viewer logic (rendering, outline, themes)
│
├── css/                       # Stylesheets
│   ├── styles.css             # Main UI styles (layout, sidebar, toolbar)
│   └── github-markdown.css    # Markdown content styles (GitHub-like)
│
└── icons/                     # Extension icons
    ├── icon.svg               # SVG source
    ├── icon16.png             # 16x16 icon
    ├── icon48.png             # 48x48 icon
    ├── icon128.png            # 128x128 icon
    └── generate-icons.sh      # Icon generation script
```

---

## Architecture

### Extension Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Background │  │   Content   │  │     Popup (UI)      │ │
│  │  (Service   │  │   Script    │  │                     │ │
│  │   Worker)   │  │             │  │  - Settings toggle  │ │
│  │             │  │  Injects at │  │  - Theme control    │ │
│  │ URL         │  │  doc_start  │  │  - Update check     │ │
│  │ interception│  │             │  │  - Config reset     │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘ │
│         │                │                                  │
│         └────────────────┘                                  │
│                          │                                  │
│                   ┌──────┴──────┐                          │
│                   │  Redirect   │                          │
│                   │     to      │                          │
│                   │ markdown-   │                          │
│                   │viewer.html  │                          │
│                   └──────┬──────┘                          │
│                          │                                  │
│  ┌───────────────────────┴──────────────────────────┐     │
│  │              Markdown Viewer Page                │     │
│  │                                                  │     │
│  │  ┌──────────────┐  ┌──────────────────────────┐ │     │
│  │  │   Sidebar    │  │       Main Content       │ │     │
│  │  │  (Outline)   │  │  - Toolbar               │ │     │
│  │  │              │  │  - Markdown rendering    │ │     │
│  │  │ Auto-gen TOC │  │  - Anchor links          │ │     │
│  │  └──────────────┘  └──────────────────────────┘ │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **URL Interception**: `background.js` listens for tab updates and detects Markdown URLs (`.md`, `.markdown`)
2. **Redirection**: Redirects to `markdown-viewer.html?url=<target>`
3. **Content Loading**: `viewer.js` fetches and renders Markdown using `marked.js`
4. **Outline Generation**: Parses headers to generate table of contents
5. **Settings**: Persisted via Chrome Storage API

---

## Key Files Reference

### Core Configuration

**manifest.json**
- Manifest V3 format
- Permissions: `activeTab`, `storage`
- Host permissions: `file://*/*.md`, `*://*/*.md`
- Content script runs at `document_start`

### Scripts

**background.js**
- Service worker (ES module)
- `onInstalled`: Initialize default config
- `onUpdated` (tabs): Intercept Markdown URLs
- Message handler for config get/set

**js/content.js**
- Content script injected on Markdown pages
- Detects Markdown by URL extension or content-type
- Clears page and signals background script

**js/viewer.js**
- Main rendering logic
- Functions:
  - `loadAndRenderMarkdown()` - Fetch & parse Markdown
  - `generateOutline()` - Build TOC from headers
  - `addAnchorLinks()` - Add copy-link buttons to headers
  - `loadSettings()` / `saveSettings()` - Chrome storage
  - `setupEventListeners()` - UI interactions

### Styles

**css/styles.css**
- CSS Variables for theming (`[data-theme="light"]` / `[data-theme="dark"]`)
- Layout: Flexbox-based sidebar + main content
- Responsive design with mobile breakpoints
- Print styles included

**css/github-markdown.css**
- GitHub-flavored Markdown styling
- Supports both light and dark themes
- Includes: typography, code blocks, tables, task lists

---

## Chrome Storage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `mdReaderConfig` | local | User settings (outline visibility, theme, auto-update) |
| `outlineVisible` | sync | Outline sidebar visibility |
| `theme` | sync | Current theme ('light' or 'dark') |

**Default Config Structure:**
```javascript
{
    version: '1.0.0',
    outlineVisible: true,
    theme: 'light',
    autoUpdate: true
}
```

---

## Development Guidelines

### Code Style

- **Comments**: Use Chinese (中文) for inline comments, following existing convention
- **Quotes**: Single quotes for strings in JavaScript
- **Indentation**: 4 spaces
- **Naming**: camelCase for variables/functions, PascalCase for classes

### Adding New Features

1. **New Settings**: Add to `mdReaderConfig` structure, update both `popup.html` and `viewer.js`
2. **Theme Changes**: Update CSS variables in both `styles.css` and `github-markdown.css`
3. **Storage**: Use `chrome.storage.local` for local-only data, `chrome.storage.sync` for syncable preferences

### Testing

- Use `test.md` to verify rendering
- Test both light and dark themes
- Test outline navigation with various header levels
- Verify on both local files (`file://`) and web URLs

---

## Build / Package

No build step required - this is a pure HTML/CSS/JS extension.

### Load Extension for Development

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this project folder

### Update marked.js

```bash
npm install marked --save
cp node_modules/marked/marked.min.js js/marked.min.js
```

---

## Browser Compatibility

- Chrome 88+ (Manifest V3 requirement)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers supporting Manifest V3

---

## Security Considerations

- Extension uses `innerHTML` for Markdown rendering (marked.js output)
- `marked.setOptions({ sanitize: false })` - assumes trusted Markdown sources
- CSP not explicitly defined in manifest (uses default)
- Content script clears page HTML before redirecting

---

## TODOs / Known Limitations

Based on README.md and code review:

- [ ] Code syntax highlighting (mentioned in README but not implemented)
- [ ] Export functionality (PDF, HTML)
- [ ] Internationalization (i18n)
- [ ] Custom CSS themes
- [ ] Auto-updater mechanism referenced in popup.html but not fully implemented in background.js

---

## References

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [marked.js Documentation](https://marked.js.org/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
