# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chrome Extension (Manifest V3) that intercepts navigation to `.md`/`.markdown` files (local `file://` and remote HTTP/S) and renders them as styled HTML pages. No build step required — the directory is loaded directly as an unpacked extension.

## Development Commands

**Load the extension for testing:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder

**Update the bundled marked.js library** (after changing the version in package.json):
```bash
npm install
cp node_modules/marked/lib/marked.umd.js js/marked.min.js
```

**Regenerate PNG icons** (requires ImageMagick):
```bash
bash icons/generate-icons.sh
```

There is no test suite, linter, or build pipeline configured.

## Architecture

Three cooperating components:

**`background.js`** (service worker, ES module)
- Initializes default config in `chrome.storage.local` on install
- Watches `chrome.tabs.onUpdated`; when a Markdown URL is detected, redirects the tab to `markdown-viewer.html?url=<encoded-original-url>`
- Handles `getConfig`/`setConfig` messages from the popup

**`js/content.js`** (content script, injected at `document_start`)
- Clears the DOM before the raw Markdown text renders
- Sends a `redirectToViewer` message to the background (background also redirects independently)

**`markdown-viewer.html` + `js/viewer.js`** (full extension page)
- Reads `?url=` param, fetches the original Markdown, parses with `marked.parse()` (GFM mode), injects rendered HTML into `#markdownContent`
- Builds a clickable outline/TOC from all heading elements
- Loads/saves `outlineVisible` and `theme` from `chrome.storage.local` (key: `mdReaderConfig`)

**`popup.html`** (inline-scripted, 320px)
- Settings panel for outline, dark theme, auto-update, and scroll-sync toggles
- Reads/writes some settings to `chrome.storage.sync` and others to `chrome.storage.local`

## Known Issues

- **Auto-update is unimplemented**: `popup.html` sends `checkUpdate`/`performUpdate` messages, but `background.js` has no handlers for them.
- **Storage inconsistency**: `viewer.js` uses `chrome.storage.local` (`mdReaderConfig` object), while `popup.html` uses `chrome.storage.sync` for some of the same keys — these can drift out of sync.
- **No XSS sanitization**: `marked` is configured with `sanitize: false`; this is intentional for developer/trusted files but should not be changed to allow user-supplied remote content without adding sanitization.
- Files referenced in README (`js/version-manager.js`, `js/auto-updater.js`, `js/error-handler.js`) do not exist.
