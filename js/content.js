// 当页面是 Markdown 文件时，自动重定向到查看器
(function() {
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
    
    if (isMarkdown || isMarkdownContentType) {
        // 阻止页面继续加载
        document.documentElement.innerHTML = '';
        
        // 通知 background script 处理
        chrome.runtime.sendMessage({
            action: 'redirectToViewer',
            url: url
        });
    }
})();