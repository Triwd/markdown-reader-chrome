// 当页面是 Markdown 文件时，根据模式决定行为
(async function() {
    // 检查当前 URL 是否是 Markdown 文件
    const url = window.location.href;
    const isMarkdown = url.toLowerCase().endsWith('.md') ||
                       url.toLowerCase().endsWith('.markdown') ||
                       url.toLowerCase().includes('.md?') ||
                       url.toLowerCase().includes('.markdown?') ||
                       url.toLowerCase().includes('.md#') ||
                       url.toLowerCase().includes('.markdown#');

    // 检查 content-type
    const contentType = document.contentType || '';
    const isMarkdownContentType = contentType.includes('markdown') ||
                                   contentType.includes('text/plain');

    if (!isMarkdown && !isMarkdownContentType) return;

    // 读取当前模式
    const result = await chrome.storage.sync.get('mode');
    const mode = result.mode || 'auto';

    if (mode === 'off') {
        // 关闭模式：不做任何处理
        return;
    }

    if (mode === 'auto') {
        // 自动模式：清除页面内容，等待 background.js 重定向
        document.documentElement.innerHTML = '';
        return;
    }

    if (mode === 'ask') {
        // 询问模式：在页面顶部注入提示横幅
        const banner = document.createElement('div');
        banner.id = '__md-reader-banner__';
        banner.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'right:0',
            'z-index:2147483647',
            'display:flex',
            'align-items:center',
            'justify-content:space-between',
            'padding:10px 16px',
            'background:#0969da',
            'color:#fff',
            'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
            'font-size:14px',
            'box-shadow:0 2px 8px rgba(0,0,0,0.25)'
        ].join(';');

        const text = document.createElement('span');
        text.textContent = '📄 检测到 Markdown 文件，是否使用 Markdown Reader 打开？';

        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display:flex;gap:8px;flex-shrink:0;margin-left:16px';

        const btnIgnore = document.createElement('button');
        btnIgnore.textContent = '忽略';
        btnIgnore.style.cssText = [
            'padding:5px 14px',
            'border:1px solid rgba(255,255,255,0.5)',
            'border-radius:6px',
            'background:transparent',
            'color:#fff',
            'font-size:13px',
            'cursor:pointer'
        ].join(';');

        const btnOpen = document.createElement('button');
        btnOpen.textContent = '打开';
        btnOpen.style.cssText = [
            'padding:5px 14px',
            'border:none',
            'border-radius:6px',
            'background:#fff',
            'color:#0969da',
            'font-size:13px',
            'font-weight:600',
            'cursor:pointer'
        ].join(';');

        btnIgnore.addEventListener('click', () => banner.remove());
        btnOpen.addEventListener('click', () => {
            banner.remove();
            chrome.runtime.sendMessage({ action: 'openInViewer', url });
        });

        btnGroup.appendChild(btnIgnore);
        btnGroup.appendChild(btnOpen);
        banner.appendChild(text);
        banner.appendChild(btnGroup);

        // 等待 body 可用再插入
        const insert = () => document.body
            ? document.body.prepend(banner)
            : document.documentElement.prepend(banner);

        if (document.body) {
            insert();
        } else {
            document.addEventListener('DOMContentLoaded', insert);
        }
    }
})();
