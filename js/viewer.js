/**
 * Markdown 查看器主逻辑
 */

// 在 DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 设置默认主题
    if (!document.body.getAttribute('data-theme')) {
        document.body.setAttribute('data-theme', 'light');
    }
    
    try {
        await initMarkdownViewer();
    } catch (error) {
        console.error('[MD Reader] 初始化失败:', error);
        showFatalError('初始化失败，请刷新页面重试');
    }
});

/**
 * 初始化 Markdown 查看器
 */
async function initMarkdownViewer() {
    const markdownContent = document.getElementById('markdownContent');
    const outlineContent = document.getElementById('outlineContent');
    const outlineSidebar = document.getElementById('outlineSidebar');
    const toolbarTitle = document.getElementById('toolbarTitle');
    const toggleOutlineBtn = document.getElementById('toggleOutlineBtn');
    const closeOutlineBtn = document.getElementById('closeOutlineBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // 获取 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('url');
    
    if (!targetUrl) {
        markdownContent.innerHTML = '<div class="error-message">没有指定要查看的 Markdown 文件</div>';
        return;
    }
    
    // 设置标题
    const fileName = targetUrl.split('/').pop().split('?')[0];
    toolbarTitle.textContent = decodeURIComponent(fileName);
    document.title = decodeURIComponent(fileName) + ' - Markdown Reader';
    
    // 加载并渲染 Markdown
    try {
        await loadAndRenderMarkdown(targetUrl, markdownContent);
        generateOutline(markdownContent, outlineContent);
        addAnchorLinks(markdownContent);
    } catch (error) {
        console.error('[MD Reader] 渲染失败:', error);
        markdownContent.innerHTML = `
            <div class="error-message">
                <p>无法加载文件: ${error.message}</p>
            </div>
        `;
    }
    
    // 加载设置
    await loadSettings(outlineSidebar);
    
    // 设置事件监听
    setupEventListeners(
        toggleOutlineBtn, closeOutlineBtn, themeToggleBtn,
        outlineSidebar
    );
    
    // 处理 hash 导航
    handleHashNavigation();
}

/**
 * 加载并渲染 Markdown
 */
async function loadAndRenderMarkdown(targetUrl, markdownContent) {
    // 获取 Markdown 内容
    const response = await fetch(targetUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdownText = await response.text();
    
    // 配置 marked
    marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false,
        sanitize: false,
        smartLists: true,
        smartypants: true,
        xhtml: false
    });
    
    // 渲染 Markdown
    const htmlContent = marked.parse(markdownText);
    markdownContent.innerHTML = htmlContent;
}

/**
 * 生成大纲
 */
function generateOutline(markdownContent, outlineContent) {
    const headings = markdownContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
        outlineContent.innerHTML = '<p>文档没有标题</p>';
        return;
    }
    
    let outlineHtml = '<ul class="outline-list">';
    
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        const text = heading.textContent;
        const anchor = heading.id || `heading-${index}`;
        
        if (!heading.id) {
            heading.id = anchor;
        }
        
        outlineHtml += `
            <li class="outline-item level-${level}">
                <a href="#${anchor}" data-anchor="${anchor}">${escapeHtml(text)}</a>
            </li>
        `;
    });
    
    outlineHtml += '</ul>';
    outlineContent.innerHTML = outlineHtml;
    
    // 大纲点击事件
    outlineContent.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const anchor = link.getAttribute('data-anchor');
            document.getElementById(anchor).scrollIntoView({ behavior: 'smooth' });
        });
    });
}

/**
 * 添加锚点链接到标题
 */
function addAnchorLinks(markdownContent) {
    const headings = markdownContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach(heading => {
        if (!heading.id) return;
        
        const anchorLink = document.createElement('a');
        anchorLink.href = `#${heading.id}`;
        anchorLink.className = 'anchor-link';
        anchorLink.innerHTML = '#';
        anchorLink.title = '复制链接';
        
        anchorLink.addEventListener('click', (e) => {
            e.preventDefault();
            const url = window.location.href.split('#')[0] + '#' + heading.id;
            navigator.clipboard.writeText(url);
            anchorLink.textContent = '已复制!';
            setTimeout(() => {
                anchorLink.innerHTML = '#';
            }, 1000);
        });
        
        heading.appendChild(anchorLink);
        heading.style.position = 'relative';
    });
}

/**
 * 加载设置
 */
async function loadSettings(outlineSidebar) {
    try {
        const result = await chrome.storage.local.get('mdReaderConfig');
        const config = result.mdReaderConfig || {};
        
        // 大纲可见性
        if (config.outlineVisible === false) {
            outlineSidebar.classList.add('hidden');
        }
        
        // 主题
        if (config.theme) {
            document.body.setAttribute('data-theme', config.theme);
        }
    } catch (e) {
        console.log('[MD Reader] 加载设置失败:', e);
    }
}

/**
 * 设置事件监听
 */
function setupEventListeners(toggleOutlineBtn, closeOutlineBtn, themeToggleBtn, outlineSidebar) {
    // 切换大纲
    toggleOutlineBtn.addEventListener('click', () => {
        outlineSidebar.classList.toggle('hidden');
        saveSettings({ outlineVisible: !outlineSidebar.classList.contains('hidden') });
    });
    
    // 关闭大纲
    closeOutlineBtn.addEventListener('click', () => {
        outlineSidebar.classList.add('hidden');
        saveSettings({ outlineVisible: false });
    });
    
    // 切换主题
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.setAttribute('data-theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
        }
        saveSettings({ theme: isDark ? 'light' : 'dark' });
    });
}

/**
 * 保存设置
 */
async function saveSettings(updates) {
    try {
        const result = await chrome.storage.local.get('mdReaderConfig');
        const config = result.mdReaderConfig || {};
        Object.assign(config, updates);
        await chrome.storage.local.set({ mdReaderConfig: config });
    } catch (e) {
        console.log('[MD Reader] 保存设置失败:', e);
    }
}

/**
 * 处理 hash 导航
 */
function handleHashNavigation() {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}

/**
 * 显示致命错误
 */
function showFatalError(message) {
    const markdownContent = document.getElementById('markdownContent');
    if (markdownContent) {
        markdownContent.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
