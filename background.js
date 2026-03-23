/**
 * Background Script
 * 处理扩展生命周期和消息通信
 */

// 当扩展安装或更新时
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('[MD Reader] Extension installed/updated:', details.reason);

    if (details.reason === 'install') {
        // 首次安装，初始化配置
        await initializeExtension();
    }
});

/**
 * 初始化扩展
 */
async function initializeExtension() {
    console.log('[MD Reader] 初始化扩展...');

    // 设置默认配置
    const defaultConfig = {
        version: '1.0.0',
        outlineVisible: true,
        theme: 'light'
    };

    await chrome.storage.local.set({
        mdReaderConfig: defaultConfig
    });

    // 设置默认模式
    await chrome.storage.sync.set({ mode: 'auto' });

    console.log('[MD Reader] 初始化完成');
}

// 监听标签页更新 - 拦截 Markdown 文件
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        const url = tab.url.toLowerCase();

        // 检查是否是 Markdown 文件
        if (isMarkdownUrl(url)) {
            const result = await chrome.storage.sync.get('mode');
            const mode = result.mode || 'auto';

            if (mode === 'auto') {
                // 直接重定向到查看器
                const viewerUrl = chrome.runtime.getURL('markdown-viewer.html') +
                                 '?url=' + encodeURIComponent(tab.url);
                chrome.tabs.update(tabId, { url: viewerUrl });
            }
            // 'ask' 和 'off' 模式由 content.js 处理
        }
    }
});

/**
 * 检查 URL 是否是 Markdown 文件
 */
function isMarkdownUrl(url) {
    // 排除已经是查看器的情况
    if (url.includes('markdown-viewer.html')) {
        return false;
    }

    // 检查文件扩展名
    const markdownExtensions = ['.md', '.markdown'];

    return markdownExtensions.some(ext => {
        // 检查各种 URL 格式
        return url.endsWith(ext) ||
               url.includes(ext + '?') ||
               url.includes(ext + '#') ||
               url.includes(ext + '&');
    });
}

// 监听来自 popup 和 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getConfig') {
        chrome.storage.local.get('mdReaderConfig').then(result => {
            sendResponse(result.mdReaderConfig || {});
        });
        return true;
    }

    if (request.action === 'setConfig') {
        chrome.storage.local.set({ mdReaderConfig: request.config }).then(() => {
            sendResponse({ success: true });
        });
        return true;
    }

    // 询问模式下，用户点击"打开"后由 content.js 发来
    if (request.action === 'openInViewer') {
        const viewerUrl = chrome.runtime.getURL('markdown-viewer.html') +
                         '?url=' + encodeURIComponent(request.url);
        chrome.tabs.update(sender.tab.id, { url: viewerUrl });
        sendResponse({ success: true });
        return true;
    }

    sendResponse({ success: false });
});
