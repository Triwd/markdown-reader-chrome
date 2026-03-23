// 状态管理
const state = {
    isChecking: false,
    updateAvailable: false,
    markedVersion: null
};

// DOM 元素
const elements = {
    updateStatus: document.getElementById('updateStatus'),
    updateTitle: document.getElementById('updateTitle'),
    updateText: document.getElementById('updateText'),
    updateIcon: document.getElementById('updateIcon'),
    updateActions: document.getElementById('updateActions'),
    updateBtn: document.getElementById('updateBtn'),
    ignoreUpdateBtn: document.getElementById('ignoreUpdateBtn'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    markedVersion: document.getElementById('markedVersion'),
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
    document.getElementById('autoUpdateToggle').checked = config.autoUpdate !== false;
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
        } else if (key === 'autoUpdate') {
            config.autoUpdate = value;
        } else if (key === 'scrollSync') {
            config.outlineOptions = config.outlineOptions || {};
            config.outlineOptions.scrollSync = value;
        }

        await chrome.storage.local.set({ mdReaderConfig: config });
    }
}

// 显示更新状态
function showUpdateStatus(type, title, text, showActions = false) {
    elements.updateStatus.className = 'update-status visible';
    elements.updateStatus.classList.add(type);
    elements.updateTitle.textContent = title;
    elements.updateText.textContent = text;
    elements.updateActions.style.display = showActions ? 'flex' : 'none';

    const icons = {
        info: '⏳',
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    elements.updateIcon.textContent = icons[type] || '📦';
}

// 隐藏更新状态
function hideUpdateStatus() {
    elements.updateStatus.classList.remove('visible');
}

// 更新状态指示器
function updateStatusIndicator(status, text) {
    elements.statusDot.className = 'status-dot';
    if (status) elements.statusDot.classList.add(status);
    elements.statusText.textContent = text;
}

// 检查更新
async function checkForUpdates() {
    if (state.isChecking) return;

    state.isChecking = true;
    updateStatusIndicator('updating', '检查中...');
    showUpdateStatus('info', '检查更新中', '正在检查 marked.js 的最新版本...', false);

    try {
        const response = await chrome.runtime.sendMessage({ action: 'checkUpdate' });

        if (response.success) {
            if (response.updateAvailable) {
                state.updateAvailable = true;
                state.markedVersion = response.currentVersion;

                showUpdateStatus(
                    'warning',
                    '发现新版本',
                    `当前: ${response.currentVersion} → 最新: ${response.latestVersion}`,
                    true
                );
                updateStatusIndicator('', '有更新');
            } else {
                showUpdateStatus('success', '已是最新版本', `marked.js ${response.currentVersion}`);
                updateStatusIndicator('', '正常');

                setTimeout(hideUpdateStatus, 3000);
            }

            elements.markedVersion.textContent = `marked.js: ${response.currentVersion}`;
        } else {
            throw new Error(response.error || '检查失败');
        }
    } catch (error) {
        console.error('检查更新失败:', error);
        showUpdateStatus('error', '检查失败', error.message);
        updateStatusIndicator('error', '错误');
    } finally {
        state.isChecking = false;
    }
}

// 执行更新
async function performUpdate() {
    updateStatusIndicator('updating', '更新中...');
    elements.updateBtn.disabled = true;
    elements.updateBtn.textContent = '更新中...';

    try {
        const response = await chrome.runtime.sendMessage({ action: 'performUpdate' });

        if (response.success) {
            showUpdateStatus(
                'success',
                '更新成功',
                `已更新到 marked.js ${response.version}`
            );
            updateStatusIndicator('', '正常');
            elements.markedVersion.textContent = `marked.js: ${response.version}`;

            setTimeout(hideUpdateStatus, 3000);
        } else {
            throw new Error(response.error || '更新失败');
        }
    } catch (error) {
        console.error('更新失败:', error);
        showUpdateStatus('error', '更新失败', error.message);
        updateStatusIndicator('error', '错误');
    } finally {
        elements.updateBtn.disabled = false;
        elements.updateBtn.textContent = '立即更新';
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

document.getElementById('autoUpdateToggle').addEventListener('change', (e) => {
    saveSettings('autoUpdate', e.target.checked);
});

document.getElementById('scrollSyncToggle').addEventListener('change', (e) => {
    saveSettings('scrollSync', e.target.checked);
});

elements.advancedToggle.addEventListener('click', () => {
    const isVisible = elements.advancedSettings.classList.toggle('visible');
    elements.advancedArrow.textContent = isVisible ? '▲' : '▼';
});

document.getElementById('checkUpdateBtn').addEventListener('click', checkForUpdates);

elements.updateBtn.addEventListener('click', performUpdate);

elements.ignoreUpdateBtn.addEventListener('click', hideUpdateStatus);

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
checkForUpdates();
