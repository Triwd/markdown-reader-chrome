// DOM 元素
const elements = {
    advancedToggle: document.getElementById('advancedToggle'),
    advancedSettings: document.getElementById('advancedSettings'),
    advancedArrow: document.getElementById('advancedArrow')
};

// 加载设置
async function loadSettings() {
    const [syncResult, localResult] = await Promise.all([
        chrome.storage.sync.get(['outlineVisible', 'theme']),
        chrome.storage.local.get(['mdReaderConfig'])
    ]);

    const config = localResult.mdReaderConfig || {};

    document.getElementById('outlineToggle').checked = syncResult.outlineVisible !== false;
    document.getElementById('themeToggle').checked = syncResult.theme === 'dark';
    document.getElementById('scrollSyncToggle').checked =
        config.outlineOptions?.scrollSync !== false;

    // 更新模式选择器（从 local 读取）
    const mode = config.mode || 'auto';
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
}

// 保存设置
async function saveSettings(key, value) {
    if (['outlineVisible', 'theme'].includes(key)) {
        await chrome.storage.sync.set({ [key]: value });
    } else {
        const result = await chrome.storage.local.get('mdReaderConfig');
        const config = result.mdReaderConfig || {};

        if (key === 'mode') {
            config.mode = value;
        } else if (key === 'scrollSync') {
            config.outlineOptions = config.outlineOptions || {};
            config.outlineOptions.scrollSync = value;
        }

        await chrome.storage.local.set({ mdReaderConfig: config });
    }
}

// 模式选择器事件
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        await saveSettings('mode', btn.dataset.mode);
    });
});

// 事件监听
document.getElementById('outlineToggle').addEventListener('change', (e) => {
    saveSettings('outlineVisible', e.target.checked);
});

document.getElementById('themeToggle').addEventListener('change', (e) => {
    saveSettings('theme', e.target.checked ? 'dark' : 'light');
});

document.getElementById('scrollSyncToggle').addEventListener('change', (e) => {
    saveSettings('scrollSync', e.target.checked);
});

elements.advancedToggle.addEventListener('click', () => {
    const isVisible = elements.advancedSettings.classList.toggle('visible');
    elements.advancedArrow.textContent = isVisible ? '▲' : '▼';
});

document.getElementById('resetConfigBtn').addEventListener('click', async () => {
    if (confirm('确定要重置所有配置吗？此操作不可撤销。')) {
        await chrome.storage.local.remove(['mdReaderConfig', 'mdReaderVersion']);
        await chrome.storage.sync.remove(['outlineVisible', 'theme']);
        loadSettings();
        alert('配置已重置');
    }
});

// 初始化
loadSettings();
