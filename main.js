// ═══════════════════════════════════════════════
// NAMIFY — Professional File Renamer Controller
// Ultra-Optimized Architecture with Virtual Scrolling
// ═══════════════════════════════════════════════

import './style.css';
import { t, setLang, getLang, applyTranslations } from './modules/i18n.js';
import { VirtualScroller } from './modules/virtual-scroller.js';
import { compileActiveRules, RULE_TEMPLATES } from './modules/rules-engine.js';

// ── Application State ──
let rawEntries = [];
let processedFiles = [];
let filteredFiles = [];
let selectedFilePaths = new Set();
let lastSelectedIndex = -1;
let listHistory = []; // For Ctrl+Z

let currentPreviewFiles = [];
let filteredPreviewFiles = [];
let activeCollisions = [];

let isResizingCol = false;
let wasResizingCol = false;
let currentSort = { col: null, asc: true };

// ── DOM References ──
const dropZone = document.getElementById('drop-zone');
const listPanel = document.getElementById('list-panel');
const renamePanel = document.getElementById('rename-panel');
const historyPanel = document.getElementById('history-panel');
const settingsPanel = document.getElementById('settings-panel');

const fileCountEl = document.getElementById('file-count');
const sidebarFileCount = document.getElementById('sidebar-file-count');
const sidebarRuleCount = document.getElementById('sidebar-rule-count');
const selectionBadge = document.getElementById('selection-count-badge');
const selectedCountEl = document.getElementById('selected-count');

const statTotal = document.getElementById('stat-total');
const statRenamed = document.getElementById('stat-renamed');

const fileSearchInput = document.getElementById('file-search-input');
const fileSearchClear = document.getElementById('file-search-clear');
const previewSearchInput = document.getElementById('preview-search-input');

const optionsModal = document.getElementById('options-modal');
const ruleSelectorModal = document.getElementById('rule-selector-modal');
const customConfirmModal = document.getElementById('custom-confirm-modal');
const customPromptModal = document.getElementById('custom-prompt');
const progressModal = document.getElementById('progress-modal');
const historyPreviewModal = document.getElementById('history-preview-modal');

// ── Theme Setup ──
let savedTheme = localStorage.getItem('namifyTheme');
if (!savedTheme) {
  savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : 'light';
  localStorage.setItem('namifyTheme', savedTheme);
}
document.body.className = `theme-${savedTheme}`;

document.querySelectorAll('input[name="appTheme"]').forEach((radio) => {
  if (radio.value === savedTheme) radio.checked = true;
  radio.addEventListener('change', (e) => {
    document.body.className = `theme-${e.target.value}`;
    localStorage.setItem('namifyTheme', e.target.value);
  });
});

// ── Toast Notification ──
let toastTimer = null;
function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.querySelector('.toast-msg').textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 3200);
}

// ── Column Definitions ──
const columnDefinitions = [
  { id: 'idx', sort: 'index', title: '#', width: '44px', render: (_file, index) => `<span class="row-idx">${index + 1}</span>` },
  { id: 'icon', sort: null, title: 'Tür', width: '34px', render: (file, _index, isDir, ext) => `<span class="row-icon-badge">${isDir ? '📁' : getFileIcon(ext)}</span>` },
  { id: 'name', sort: 'name', title: 'Dosya Adı', width: '1.5fr', render: (_file, _index, _isDir, _ext, nameWithoutExt) => `<span class="row-name" title="${escapeHtml(_file.name)}">${escapeHtml(nameWithoutExt)}</span>` },
  { id: 'ext', sort: 'ext', title: 'Uzantı', width: '74px', render: (_file, _index, isDir, ext) => `<span class="row-ext">${isDir ? 'DIR' : (ext || '-')}</span>` },
  { id: 'size', sort: 'size', title: 'Boyut', width: '84px', render: (file) => `<span class="row-size">${formatBytes(file.size)}</span>` },
  { id: 'path', sort: 'path', title: 'Konum', width: '1.5fr', render: (file, _index, _isDir, _ext, _n, dir) => `<span class="row-path" title="${escapeHtml(dir)}">${escapeHtml(dir)}</span>` }
];

const allFileListCols = ['idx', 'icon', 'name', 'ext', 'size', 'path'];

function getStoredCols(key, defaultCols) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [...defaultCols];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultCols];
  } catch (e) {
    return [...defaultCols];
  }
}

let visibleFileListCols = getStoredCols('namify-file-cols', allFileListCols);
let columnOrder = visibleFileListCols.filter(c => allFileListCols.includes(c));

// History columns
const historyColumnDefs = [
  { id: 'check', title: 'Seç', alwaysVisible: true },
  { id: 'oldName', title: 'Orijinal Ad' },
  { id: 'newName', title: 'Yeni Ad' },
  { id: 'status', title: 'Durum' },
  { id: 'folder', title: 'Klasör' },
  { id: 'newPath', title: 'Yeni Konum' }
];
const allHistoryCols = historyColumnDefs.filter(c => !c.alwaysVisible).map(c => c.id);
let visibleHistoryCols = getStoredCols('namify-history-cols', allHistoryCols);

// ── Virtual Scroller Instances ──
let fileVirtualScroller = null;
let previewVirtualScroller = null;

function initVirtualScrollers() {
  const fileContainer = document.getElementById('file-list-virtual');
  if (fileContainer) {
    fileVirtualScroller = new VirtualScroller({
      container: fileContainer,
      rowHeight: 38,
      overscan: 10,
      renderRow: (file, index) => {
        const isDir = file.isFile === false;
        const ext = isDir ? '' : getExtension(file.name);
        const nameWithoutExt = isDir ? file.name : file.name.replace(/\.[^.]+$/, '');
        const dir = file.path ? file.path.replace(/[/\\][^/\\]+$/, '') : '-';
        const isSelected = selectedFilePaths.has(file.path);

        const row = document.createElement('div');
        row.className = `file-row ${isSelected ? 'selected' : ''}`;
        row.dataset.index = index;
        row.dataset.path = file.path;

        row.innerHTML = columnOrder.map((colId) => {
          const colDef = columnDefinitions.find(c => c.id === colId);
          return colDef ? colDef.render(file, index, isDir, ext, nameWithoutExt, dir) : '';
        }).join('');

        return row;
      }
    });

    // Delegated click & range selection on virtual scroller container
    fileContainer.addEventListener('click', (e) => {
      const row = e.target.closest('.file-row');
      if (!row) return;

      const clickedIndex = parseInt(row.dataset.index, 10);
      const clickedPath = row.dataset.path;
      if (isNaN(clickedIndex) || !clickedPath) return;

      if (e.ctrlKey || e.metaKey) {
        if (selectedFilePaths.has(clickedPath)) {
          selectedFilePaths.delete(clickedPath);
        } else {
          selectedFilePaths.add(clickedPath);
        }
        lastSelectedIndex = clickedIndex;
      } else if (e.shiftKey && lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, clickedIndex);
        const end = Math.max(lastSelectedIndex, clickedIndex);
        selectedFilePaths.clear();
        for (let i = start; i <= end; i++) {
          if (filteredFiles[i]) selectedFilePaths.add(filteredFiles[i].path);
        }
      } else {
        selectedFilePaths.clear();
        selectedFilePaths.add(clickedPath);
        lastSelectedIndex = clickedIndex;
      }

      updateSelectionUI();
      fileVirtualScroller.refresh();
    });
  }

  const previewContainer = document.getElementById('preview-virtual');
  if (previewContainer) {
    previewVirtualScroller = new VirtualScroller({
      container: previewContainer,
      rowHeight: 34,
      overscan: 10,
      renderRow: (item, index) => {
        const isSame = item.file.name === item.newName;
        const isCollision = activeCollisions.includes(item.newName);

        let statusClass = '';
        if (isCollision) statusClass = 'error';
        else if (isSame) statusClass = 'same';

        const row = document.createElement('div');
        row.className = 'preview-row';
        row.innerHTML = `
          <span class="preview-idx">${index + 1}</span>
          <span class="preview-old" title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</span>
          <span class="preview-arrow">→</span>
          <span class="preview-new ${statusClass}" title="${escapeHtml(item.newName)}">${escapeHtml(item.newName)}</span>
        `;
        return row;
      }
    });
  }
}

// ── Header Rendering with Resizers & Drag-Drop ──
function renderHeader() {
  const headerContainer = document.getElementById('list-header');
  if (!headerContainer) return;
  headerContainer.innerHTML = '';

  const savedWidths = JSON.parse(localStorage.getItem('namify-col-widths') || '{}');
  columnDefinitions.forEach((c) => {
    if (savedWidths[c.id]) c.width = savedWidths[c.id];
  });

  const gridCols = columnOrder.map((colId) => {
    const colDef = columnDefinitions.find(c => c.id === colId);
    return colDef ? colDef.width : '1fr';
  });

  document.documentElement.style.setProperty('--list-grid-cols', gridCols.join(' '));

  columnOrder.forEach((colId) => {
    const colDef = columnDefinitions.find(c => c.id === colId);
    if (!colDef) return;

    const span = document.createElement('span');
    span.className = `col-${colId}`;
    span.textContent = colDef.title;

    if (colDef.sort) {
      span.classList.add('sortable');
      if (currentSort.col === colDef.sort) {
        span.classList.add(currentSort.asc ? 'sort-asc' : 'sort-desc');
      }
      span.addEventListener('click', () => {
        if (isResizingCol || wasResizingCol) return;
        handleSort(colDef.sort);
      });
    }

    // Column Resizer
    const resizer = document.createElement('div');
    resizer.className = 'col-resizer';
    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingCol = true;
      const startX = e.pageX;
      const startWidth = span.offsetWidth;

      function onMouseMove(moveEvent) {
        const delta = moveEvent.pageX - startX;
        const newWidth = Math.max(34, startWidth + delta);
        colDef.width = `${newWidth}px`;

        const newGridCols = columnOrder.map(c => columnDefinitions.find(def => def.id === c).width).join(' ');
        document.documentElement.style.setProperty('--list-grid-cols', newGridCols);
      }

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        resizer.classList.remove('resizing');
        document.body.style.cursor = 'default';

        const widthsMap = Object.fromEntries(columnDefinitions.map(c => [c.id, c.width]));
        localStorage.setItem('namify-col-widths', JSON.stringify(widthsMap));
        isResizingCol = false;
        wasResizingCol = true;
        setTimeout(() => (wasResizingCol = false), 200);
      }

      resizer.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    span.appendChild(resizer);
    headerContainer.appendChild(span);
  });
}

function handleSort(sortKey) {
  if (!sortKey || processedFiles.length === 0) return;

  if (currentSort.col === sortKey) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort.col = sortKey;
    currentSort.asc = true;
  }

  saveListState();

  if (sortKey === 'index') {
    processedFiles.reverse();
  } else {
    processedFiles.sort((a, b) => {
      let valA, valB;
      const isDirA = a.isFile === false;
      const isDirB = b.isFile === false;

      switch (sortKey) {
        case 'name':
          valA = a.name;
          valB = b.name;
          break;
        case 'ext':
          valA = isDirA ? '' : getExtension(a.name);
          valB = isDirB ? '' : getExtension(b.name);
          break;
        case 'size':
          valA = a.size || 0;
          valB = b.size || 0;
          return currentSort.asc ? valA - valB : valB - valA;
        case 'path':
          valA = a.path ? a.path.replace(/[/\\][^/\\]+$/, '') : '';
          valB = b.path ? b.path.replace(/[/\\][^/\\]+$/, '') : '';
          break;
      }

      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
      return currentSort.asc ? cmp : -cmp;
    });
  }

  renderHeader();
  applyFileFilter();
}

// ── State Management for Undo (Ctrl+Z) ──
function saveListState() {
  listHistory.push([...processedFiles]);
  if (listHistory.length > 30) listHistory.shift();
}

function updateSelectionUI() {
  const count = selectedFilePaths.size;
  if (count > 0) {
    selectionBadge.classList.remove('hidden');
    selectedCountEl.textContent = count;
  } else {
    selectionBadge.classList.add('hidden');
  }
}

// ── File Filtering / Searching ──
function applyFileFilter() {
  const query = fileSearchInput?.value.trim().toLowerCase() || '';
  if (!query) {
    filteredFiles = processedFiles;
    fileSearchClear.classList.add('hidden');
  } else {
    fileSearchClear.classList.remove('hidden');
    filteredFiles = processedFiles.filter(f =>
      f.name.toLowerCase().includes(query) || (f.path && f.path.toLowerCase().includes(query))
    );
  }

  fileCountEl.textContent = filteredFiles.length;
  statTotal.textContent = processedFiles.length;
  sidebarFileCount.textContent = processedFiles.length;
  sidebarFileCount.style.display = processedFiles.length > 0 ? 'inline-block' : 'none';

  if (fileVirtualScroller) {
    fileVirtualScroller.setItems(filteredFiles);
  }
}

fileSearchInput?.addEventListener('input', applyFileFilter);
fileSearchClear?.addEventListener('click', () => {
  fileSearchInput.value = '';
  applyFileFilter();
  fileSearchInput.focus();
});

// ── Selection Toolbar Actions ──
document.getElementById('btn-select-all')?.addEventListener('click', () => {
  filteredFiles.forEach(f => selectedFilePaths.add(f.path));
  updateSelectionUI();
  fileVirtualScroller?.refresh();
});

document.getElementById('btn-invert-selection')?.addEventListener('click', () => {
  const newSet = new Set();
  filteredFiles.forEach(f => {
    if (!selectedFilePaths.has(f.path)) newSet.add(f.path);
  });
  selectedFilePaths = newSet;
  updateSelectionUI();
  fileVirtualScroller?.refresh();
});

document.getElementById('btn-remove-selected')?.addEventListener('click', () => {
  if (selectedFilePaths.size === 0) return;
  saveListState();
  const count = selectedFilePaths.size;
  processedFiles = processedFiles.filter(f => !selectedFilePaths.has(f.path));
  selectedFilePaths.clear();
  updateSelectionUI();
  applyFileFilter();
  toast(`${count} ${t('toast_files_added', 'dosya listeden çıkarıldı.')}`, 'info');

  if (processedFiles.length === 0) {
    switchView('home');
  }
});

// ── Drag & Drop Files ──
dropZone.addEventListener('mousemove', (e) => {
  const rect = dropZone.getBoundingClientRect();
  dropZone.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  dropZone.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  if (e.dataTransfer.types.includes('Files')) {
    dropZone.classList.add('drag-over');
  }
});

document.addEventListener('dragleave', (e) => {
  if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
    dropZone.classList.remove('drag-over');
  }
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');

  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) {
    if (window.electronAPI && window.electronAPI.getFilePath) {
      rawEntries = files.map(f => window.electronAPI.getFilePath(f)).filter(Boolean);
    } else {
      rawEntries = files.map(f => f.path).filter(Boolean);
    }

    if (rawEntries.length > 0) {
      showOptionsModal();
    } else {
      toast('Dosya yolları alınamadı.', 'error');
    }
  }
});

document.getElementById('btn-browse-folder')?.addEventListener('click', async () => {
  if (window.electronAPI) {
    const dir = await window.electronAPI.selectDirectory();
    if (dir) {
      rawEntries = [dir];
      showOptionsModal();
    }
  } else {
    toast('Bu özellik masaüstü uygulamasında çalışır.', 'error');
  }
});

dropZone.addEventListener('click', async (e) => {
  if (e.target.closest('button')) return;
  if (window.electronAPI) {
    const dir = await window.electronAPI.selectDirectory();
    if (dir) {
      rawEntries = [dir];
      showOptionsModal();
    }
  }
});

// ── Scan Options Modal ──
function showOptionsModal() {
  const lastAction = localStorage.getItem('namify-last-action');
  if (lastAction === 'folders') {
    document.getElementById('action-folders').checked = true;
  } else {
    document.getElementById('action-files').checked = true;
  }
  optionsModal.classList.remove('hidden');
}

function hideOptionsModal() {
  optionsModal.classList.add('hidden');
}

document.getElementById('close-modal')?.addEventListener('click', hideOptionsModal);
document.getElementById('cancel-modal')?.addEventListener('click', hideOptionsModal);
optionsModal?.addEventListener('click', (e) => {
  if (e.target === optionsModal) hideOptionsModal();
});

document.getElementById('process-btn')?.addEventListener('click', async () => {
  if (!window.electronAPI) {
    toast('Bu özellik sadece masaüstü uygulamasında çalışır.', 'error');
    return;
  }

  const isFilesMode = document.getElementById('action-files').checked;
  const fileMask = document.getElementById('file-mask').value.trim();
  const regexMatch = document.getElementById('regex-match').value.trim();
  const includeSubfolders = document.getElementById('include-subfolders').checked;
  const addSubfolders = document.getElementById('add-subfolders').checked;
  const addRoot = document.getElementById('add-root').checked;

  const options = {
    mode: isFilesMode ? 'files' : 'folders',
    includeSubfolders,
    fileMask,
    regexMatch,
    addSubfolders,
    addRoot,
  };

  localStorage.setItem('namify-last-action', options.mode);
  toast(t('toast_scanning', 'Dosyalar taranıyor...'), 'info');

  try {
    const scannedFiles = await window.electronAPI.scanPaths({ paths: rawEntries, options });
    hideOptionsModal();

    if (!scannedFiles || scannedFiles.length === 0) {
      toast(t('toast_no_files', 'Kriterlere uyan dosya bulunamadı.'), 'error');
      return;
    }

    const sortedScanned = scannedFiles.sort((a, b) => {
      const dirA = a.path.replace(/[/\\][^/\\]+$/, '');
      const dirB = b.path.replace(/[/\\][^/\\]+$/, '');
      const dirCmp = dirA.localeCompare(dirB, undefined, { numeric: true, sensitivity: 'base' });
      if (dirCmp !== 0) return dirCmp;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    const existingPaths = new Set(processedFiles.map(f => f.path));
    const uniqueNewFiles = sortedScanned.filter(f => !existingPaths.has(f.path));

    if (uniqueNewFiles.length === 0) {
      toast(t('toast_already_exists', 'Eklenen dosyalar zaten listede mevcut.'), 'info');
      return;
    }

    saveListState();
    processedFiles = [...processedFiles, ...uniqueNewFiles];

    switchView('home');
    toast(`${uniqueNewFiles.length} ${t('toast_files_added', 'dosya listeye eklendi.')}`, 'success');
  } catch (err) {
    toast('Tarama hatası: ' + err.message, 'error');
  }
});

// ── View Switching ──
function switchView(view) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  dropZone.classList.add('hidden');
  listPanel.classList.add('hidden');
  renamePanel.classList.add('hidden');
  historyPanel.classList.add('hidden');
  settingsPanel.classList.add('hidden');

  if (view === 'home') {
    document.getElementById('nav-home')?.classList.add('active');
    if (processedFiles.length > 0) {
      listPanel.classList.remove('hidden');
      renderHeader();
      applyFileFilter();
    } else {
      dropZone.classList.remove('hidden');
    }
  } else if (view === 'rename') {
    document.getElementById('nav-rename')?.classList.add('active');
    if (processedFiles.length === 0) {
      toast('Lütfen önce dosya ekleyin.', 'info');
      switchView('home');
      return;
    }
    renamePanel.classList.remove('hidden');
    document.getElementById('rename-file-count').textContent = processedFiles.length;
    schedulePreviewCalculation();
  } else if (view === 'history') {
    document.getElementById('nav-history')?.classList.add('active');
    historyPanel.classList.remove('hidden');
    loadHistoryUI();
  } else if (view === 'settings') {
    document.getElementById('nav-settings')?.classList.add('active');
    settingsPanel.classList.remove('hidden');
  }
}

document.getElementById('nav-home')?.addEventListener('click', () => switchView('home'));
document.getElementById('nav-rename')?.addEventListener('click', () => switchView('rename'));
document.getElementById('nav-history')?.addEventListener('click', () => switchView('history'));
document.getElementById('nav-settings')?.addEventListener('click', () => switchView('settings'));

document.getElementById('rename-btn')?.addEventListener('click', () => switchView('rename'));
document.getElementById('back-to-list')?.addEventListener('click', () => switchView('home'));

document.getElementById('clear-list')?.addEventListener('click', async () => {
  const confirmed = await showCustomConfirm('Listeyi Temizle', 'Eklenen tüm dosyalar listeden kaldırılacak. Devam edilsin mi?');
  if (confirmed) {
    processedFiles = [];
    rawEntries = [];
    selectedFilePaths.clear();
    statTotal.textContent = '0';
    sidebarFileCount.style.display = 'none';
    switchView('home');
    toast(t('toast_cleared', 'Liste temizlendi.'), 'info');
  }
});

// ── Global Keyboard Shortcuts ──
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  // Ctrl + A
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
    if (!listPanel.classList.contains('hidden')) {
      e.preventDefault();
      filteredFiles.forEach(f => selectedFilePaths.add(f.path));
      updateSelectionUI();
      fileVirtualScroller?.refresh();
    }
  }

  // Delete
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (!listPanel.classList.contains('hidden') && selectedFilePaths.size > 0) {
      e.preventDefault();
      document.getElementById('btn-remove-selected')?.click();
    }
  }

  // Ctrl + Z
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    if (listHistory.length > 0) {
      e.preventDefault();
      processedFiles = listHistory.pop();
      applyFileFilter();
      toast('Liste değişikliği geri alındı.', 'info');
    }
  }

  // Ctrl + F
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    if (!listPanel.classList.contains('hidden')) {
      fileSearchInput?.focus();
    } else if (!renamePanel.classList.contains('hidden')) {
      previewSearchInput?.focus();
    }
  }
});

// ═══════════════════════════════════════
// DYNAMIC RULES STUDIO
// ═══════════════════════════════════════

function addRuleCard(type, title = '', fields = {}, ruleId = null, isActive = true) {
  const container = document.getElementById('dynamic-rules-container');
  const id = ruleId || 'rule_' + Date.now() + Math.floor(Math.random() * 1000);
  const template = RULE_TEMPLATES[type];
  if (!template) return;

  const ruleTitle = title || t(template.titleKey, template.defaultTitle);

  const card = document.createElement('div');
  card.className = `rule-card ${isActive ? 'active' : ''}`;
  card.setAttribute('data-rule-id', id);
  card.setAttribute('data-rule-type', type);

  card.innerHTML = `
    <div class="rule-header">
      <div class="rule-toggle-wrap">
        <input type="checkbox" class="rule-toggle" ${isActive ? 'checked' : ''} aria-label="Toggle rule">
        <span class="editable-title" title="İsmi değiştirmek için tıklayın">
          ${template.icon || ''}
          <span class="title-text">${escapeHtml(ruleTitle)}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </span>
      </div>
      <button class="btn btn-sm btn-ghost-danger btn-delete-rule" title="Kuralı Sil">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
    <div class="rule-body">
      ${template.html}
    </div>
  `;

  container.appendChild(card);

  // Set initial field values
  if (fields) {
    Object.keys(fields).forEach((key) => {
      const input = card.querySelector('.' + key);
      if (input) {
        if (input.type === 'checkbox') input.checked = fields[key];
        else input.value = fields[key];
      }
    });
  }

  // Events
  const toggle = card.querySelector('.rule-toggle');
  const titleSpan = card.querySelector('.editable-title');
  const delBtn = card.querySelector('.btn-delete-rule');

  toggle.addEventListener('change', () => {
    card.classList.toggle('active', toggle.checked);
    saveDynamicRules();
    schedulePreviewCalculation();
  });

  titleSpan.addEventListener('click', (e) => {
    e.preventDefault();
    const currentName = titleSpan.querySelector('.title-text').textContent;
    showCustomPrompt('Kural İsmini Düzenle', 'Kural başlığı:', currentName, (newName) => {
      if (newName) {
        titleSpan.querySelector('.title-text').textContent = newName;
        saveDynamicRules();
      }
    });
  });

  delBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const currentName = titleSpan.querySelector('.title-text').textContent;
    const confirmed = await showCustomConfirm(
      'Kuralı Sil',
      `"${escapeHtml(currentName)}" kuralını kaldırmak istediğinize emin misiniz?`
    );
    if (confirmed) {
      card.remove();
      saveDynamicRules();
      schedulePreviewCalculation();
      updateSidebarRuleCount();
    }
  });

  card.querySelectorAll('input:not(.rule-toggle), select, textarea').forEach((el) => {
    el.addEventListener('input', () => {
      saveDynamicRules();
      schedulePreviewCalculation();
    });
    el.addEventListener('change', () => {
      saveDynamicRules();
      schedulePreviewCalculation();
    });
  });

  saveDynamicRules();
  updateSidebarRuleCount();
}

function updateSidebarRuleCount() {
  const count = document.querySelectorAll('#dynamic-rules-container .rule-card.active').length;
  sidebarRuleCount.textContent = count;
  sidebarRuleCount.style.display = count > 0 ? 'inline-block' : 'none';
}

function saveDynamicRules() {
  const dynamicRules = [];
  document.querySelectorAll('#dynamic-rules-container .rule-card').forEach((card) => {
    const id = card.getAttribute('data-rule-id');
    const type = card.getAttribute('data-rule-type');
    const title = card.querySelector('.title-text').textContent;
    const isActive = card.querySelector('.rule-toggle').checked;

    const fields = {};
    card.querySelectorAll('input:not(.rule-toggle), select, textarea').forEach((input) => {
      const fieldClass = Array.from(input.classList).find(c => c.startsWith('r-'));
      if (fieldClass) {
        fields[fieldClass] = input.type === 'checkbox' ? input.checked : input.value;
      }
    });

    dynamicRules.push({ id, type, title, isActive, fields });
  });

  localStorage.setItem('namify-dynamic-rules-v3', JSON.stringify(dynamicRules));
  updateSidebarRuleCount();
}

function loadDynamicRules() {
  const container = document.getElementById('dynamic-rules-container');
  if (!container) return;
  container.innerHTML = '';

  const raw = localStorage.getItem('namify-dynamic-rules-v3') || localStorage.getItem('namify-dynamic-rules-v2');
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length > 0) {
        saved.forEach(r => addRuleCard(r.type, r.title, r.fields, r.id, r.isActive));
        return;
      }
    } catch (e) {}
  }

  // Standard clean defaults
  addRuleCard('findReplace', '1. Bul ve Değiştir', { 'r-find': '', 'r-replace': '' });
  addRuleCard('prefixSuffix', '2. Önek / Sonek Ekle', { 'r-prefix': '', 'r-suffix': '' });
  addRuleCard('numbering', '3. Sıralı Numaralandırma', { 'r-num-start': 1, 'r-num-step': 1, 'r-num-position': 'suffix', 'r-num-separator': '_', 'r-num-padding': '2' });
  addRuleCard('caseChange', '4. Büyük / Küçük Harf', { 'r-case': 'lower' });
}

// Rule Picker Modal
function initRulePicker() {
  const pickerGrid = document.getElementById('rule-picker-list');
  if (!pickerGrid) return;
  pickerGrid.innerHTML = '';

  Object.values(RULE_TEMPLATES).forEach((tmpl) => {
    const card = document.createElement('div');
    card.className = 'rule-picker-card';
    card.innerHTML = `
      <div class="picker-icon">${tmpl.icon || '⚡'}</div>
      <div>
        <div class="picker-title">${t(tmpl.titleKey, tmpl.defaultTitle)}</div>
        <div class="picker-desc">${t(tmpl.titleKey.replace('rule_type_', 'rule_desc_'), '')}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      addRuleCard(tmpl.id);
      ruleSelectorModal.classList.add('hidden');
      schedulePreviewCalculation();
    });
    pickerGrid.appendChild(card);
  });

  document.getElementById('btn-add-rule')?.addEventListener('click', () => {
    ruleSelectorModal.classList.remove('hidden');
  });

  document.querySelectorAll('.btn-close-rule-selector').forEach(b => {
    b.addEventListener('click', () => ruleSelectorModal.classList.add('hidden'));
  });
}

// Export / Import Rules
document.getElementById('btn-export-list')?.addEventListener('click', () => {
  const data = localStorage.getItem('namify-dynamic-rules-v3') || '[]';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'namify_kurallar.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Kurallar başarıyla dışa aktarıldı.', 'success');
});

document.getElementById('btn-import-list')?.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      try {
        const parsed = JSON.parse(re.target.result);
        if (!Array.isArray(parsed)) throw new Error('Geçersiz format');
        localStorage.setItem('namify-dynamic-rules-v3', JSON.stringify(parsed));
        loadDynamicRules();
        schedulePreviewCalculation();
        toast('Kurallar başarıyla içeri aktarıldı!', 'success');
      } catch (err) {
        toast('Seçilen dosya geçerli bir kural dosyası değil!', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

// ═══════════════════════════════════════
// ULTRA-OPTIMIZED LIVE PREVIEW ENGINE
// ═══════════════════════════════════════
let previewDebounceTimer = null;

function schedulePreviewCalculation() {
  clearTimeout(previewDebounceTimer);
  previewDebounceTimer = setTimeout(() => {
    requestAnimationFrame(calculatePreview);
  }, 40);
}

function calculatePreview() {
  if (processedFiles.length === 0) {
    currentPreviewFiles = [];
    filteredPreviewFiles = [];
    previewVirtualScroller?.setItems([]);
    return;
  }

  // 1. Compile active rules ONCE
  const activeCards = Array.from(document.querySelectorAll('#dynamic-rules-container .rule-card.active'));
  const compiledFns = compileActiveRules(activeCards);

  // 2. Transform files in high-performance loop
  const total = processedFiles.length;
  currentPreviewFiles = new Array(total);

  for (let i = 0; i < total; i++) {
    const file = processedFiles[i];
    const isDir = file.isFile === false;
    const originalName = file.name;
    const ext = isDir ? '' : getExtension(originalName);
    const baseName = isDir ? originalName : originalName.substring(0, originalName.length - (ext ? ext.length + 1 : 0));

    const state = {
      file,
      originalName,
      baseName,
      ext
    };

    for (let f = 0; f < compiledFns.length; f++) {
      compiledFns[f](state, i);
    }

    const newExtStr = state.ext ? '.' + state.ext : '';
    currentPreviewFiles[i] = {
      file,
      newName: state.baseName + newExtStr
    };
  }

  // 3. Collision detection
  activeCollisions = [];
  const seenNames = new Set();
  let changedCount = 0;
  let sameCount = 0;

  for (let i = 0; i < total; i++) {
    const item = currentPreviewFiles[i];
    const key = item.newName.toLowerCase();

    if (item.file.name === item.newName) {
      sameCount++;
    } else {
      changedCount++;
    }

    if (seenNames.has(key)) {
      if (!activeCollisions.includes(item.newName)) {
        activeCollisions.push(item.newName);
      }
    } else {
      seenNames.add(key);
    }
  }

  // Update counters
  document.getElementById('count-changed').textContent = changedCount;
  document.getElementById('count-same').textContent = sameCount;

  const collisionWrap = document.getElementById('pill-collision-wrap');
  const collisionCountEl = document.getElementById('count-collision');
  if (activeCollisions.length > 0) {
    collisionWrap.classList.remove('hidden');
    collisionCountEl.textContent = activeCollisions.length;
  } else {
    collisionWrap.classList.add('hidden');
  }

  applyPreviewFilter();
}

function applyPreviewFilter() {
  const query = previewSearchInput?.value.trim().toLowerCase() || '';
  if (!query) {
    filteredPreviewFiles = currentPreviewFiles;
  } else {
    filteredPreviewFiles = currentPreviewFiles.filter(item =>
      item.file.name.toLowerCase().includes(query) || item.newName.toLowerCase().includes(query)
    );
  }

  previewVirtualScroller?.setItems(filteredPreviewFiles);
}

previewSearchInput?.addEventListener('input', applyPreviewFilter);

// ═══════════════════════════════════════
// APPLY RENAME & SAFETY GATES
// ═══════════════════════════════════════

document.getElementById('action-type')?.addEventListener('change', (e) => {
  const texts = {
    rename: 'Bulunduğu Yerde Yeniden Adlandır',
    move: 'Yeni Klasöre Taşı',
    copy: 'Yeni Klasöre Kopyala'
  };
  document.getElementById('apply-rename-text').textContent = texts[e.target.value] || 'İşlemi Uygula';
});

document.getElementById('apply-rename')?.addEventListener('click', async () => {
  if (!window.electronAPI) {
    toast('Bu özellik masaüstü uygulamasında çalışır.', 'error');
    return;
  }

  const actionType = document.getElementById('action-type').value;

  const itemsToProcess = currentPreviewFiles
    .filter(item => {
      if (actionType === 'rename') return item.file.name !== item.newName;
      return true;
    })
    .map(item => ({
      path: item.file.path,
      oldName: item.file.name,
      newName: item.newName
    }));

  if (itemsToProcess.length === 0) {
    toast('İşlem yapılacak dosya bulunamadı veya isimleri zaten aynı.', 'info');
    return;
  }

  let targetFolder = null;
  if (actionType === 'move' || actionType === 'copy') {
    const selected = await window.electronAPI.selectDirectory();
    if (!selected) return;
    targetFolder = selected;
  }

  // Safety confirmation
  let title = 'İşlem Onayı';
  let message = '';
  let isWarning = false;

  if (activeCollisions.length > 0) {
    isWarning = true;
    title = `⚠️ ${activeCollisions.length} İsim Çakışması Mevcut!`;
    message = `
      <div style="background:var(--red-bg); border:1px solid var(--red-border); border-radius:8px; padding:12px; font-size:12.5px; color:var(--text);">
        Aşağıdaki isimler birden fazla dosyaya verilmeye çalışılıyor:<br>
        <strong style="color:var(--red); font-family:monospace;">${escapeHtml(activeCollisions.slice(0, 4).join(', '))}${activeCollisions.length > 4 ? '...' : ''}</strong>
      </div>
      <p style="margin-top:10px; font-size:13px; color:var(--text-secondary);">Aynı isimli dosyalar birbirinin üzerine yazılabilir veya hata verebilir. Devam etmek istiyor musunuz?</p>
    `;
  } else {
    title = '✅ Yeniden Adlandırma Onayı';
    message = `
      <p style="font-size:13.5px; color:var(--text);">
        Toplam <strong>${itemsToProcess.length}</strong> dosya için <strong>${actionType.toUpperCase()}</strong> işlemi başlatılacak.
      </p>
    `;
  }

  const confirmed = await showCustomConfirm(title, message, isWarning);
  if (!confirmed) return;

  // Open Progress Modal
  showProgressModal(itemsToProcess.length);

  try {
    const result = await window.electronAPI.renameFiles({
      folder: processedFiles[0]?.path ? processedFiles[0].path.replace(/[/\\][^/\\]+$/, '') : null,
      files: itemsToProcess,
      actionType,
      targetFolder
    });

    hideProgressModal();

    if (result.errors === 0) {
      toast(`${result.success} dosya başarıyla işlendi!`, 'success');
      const curRenamed = parseInt(statRenamed.textContent, 10) || 0;
      statRenamed.textContent = curRenamed + result.success;

      // Reset
      processedFiles = [];
      rawEntries = [];
      selectedFilePaths.clear();
      statTotal.textContent = '0';
      sidebarFileCount.style.display = 'none';
      switchView('home');
    } else {
      toast(`${result.success} başarılı, ${result.errors} dosyada hata oluştu.`, 'error');
    }
  } catch (err) {
    hideProgressModal();
    toast('İşlem başarısız: ' + err.message, 'error');
  }
});

// ── Progress Modal Logic ──
function showProgressModal(total) {
  document.getElementById('batch-progress-fill').style.width = '0%';
  document.getElementById('batch-progress-percent').textContent = '0%';
  document.getElementById('batch-progress-status').textContent = `0 / ${total} dosya işleniyor...`;
  progressModal.classList.remove('hidden');
}

function hideProgressModal() {
  progressModal.classList.add('hidden');
}

if (window.electronAPI && window.electronAPI.onRenameProgress) {
  window.electronAPI.onRenameProgress((data) => {
    document.getElementById('batch-progress-fill').style.width = `${data.percentage}%`;
    document.getElementById('batch-progress-percent').textContent = `${data.percentage}%`;
    document.getElementById('batch-progress-status').textContent = `${data.current} / ${data.total} • ${data.file}`;
  });
}

// ═══════════════════════════════════════
// HISTORY & ROLLBACK UI
// ═══════════════════════════════════════

async function loadHistoryUI() {
  const container = document.getElementById('history-list');
  if (!container) return;

  if (!window.electronAPI) {
    container.innerHTML = '<div style="padding:30px; text-align:center; color:var(--text-muted)">Masaüstü uygulaması gereklidir.</div>';
    return;
  }

  container.innerHTML = '<div style="padding:30px; text-align:center; color:var(--text-muted)">Geçmiş yükleniyor...</div>';
  const history = await window.electronAPI.getHistory();

  if (!history || history.length === 0) {
    container.innerHTML = `<div style="padding:30px; text-align:center; color:var(--text-muted)">${t('history_empty', 'Henüz hiçbir işlem geçmişi bulunmuyor.')}</div>`;
    return;
  }

  container.innerHTML = '';
  history.forEach((batch) => {
    const date = new Date(batch.timestamp);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

    const row = document.createElement('div');
    row.className = 'history-card';
    row.innerHTML = `
      <div style="width:160px; font-size:12px; font-family:'JetBrains Mono', monospace; color:var(--text-muted);">${dateStr}</div>
      <div style="flex:1; min-width:0; padding-right:12px;">
        <div style="font-weight:600; font-size:13px; color:var(--text);">${batch.count} dosya yeniden adlandırıldı</div>
        <div style="font-size:11px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;">${escapeHtml(batch.folder || '')}</div>
      </div>
      <div style="width:80px; text-align:center;">
        <span class="file-count-badge">${batch.count}</span>
      </div>
      <div style="width:180px; display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-sm btn-outline btn-preview-batch" data-id="${batch.id}">${t('history_btn_preview', 'Önizle & Seç')}</button>
        <button class="btn btn-sm btn-ghost-danger btn-undo-batch" data-id="${batch.id}">${t('history_btn_undo', 'Geri Al')}</button>
      </div>
    `;
    container.appendChild(row);
  });

  // Bind undo buttons
  container.querySelectorAll('.btn-undo-batch').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const batch = history.find(b => b.id === id);
      const confirmed = await showCustomConfirm(
        'Geri Alma Onayı',
        `Bu işlemdeki <strong>${batch ? batch.count : ''}</strong> dosya eski isimlerine geri döndürülecek. Devam edilsin mi?`
      );
      if (confirmed) {
        toast('Geri alma başlatıldı...', 'info');
        const res = await window.electronAPI.undoBatch(id);
        if (res.success) {
          toast(`${res.undone} ${t('toast_undo_success', 'dosya eski haline döndürüldü!')}`, 'success');
          loadHistoryUI();
        } else {
          toast('Hata: ' + (res.error || 'Bilinmeyen hata'), 'error');
        }
      }
    });
  });

  // Bind partial undo preview
  container.querySelectorAll('.btn-preview-batch').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const batch = history.find(b => b.id === id);
      if (batch) openPartialHistoryModal(batch);
    });
  });
}

async function openPartialHistoryModal(batch) {
  const modal = document.getElementById('history-preview-modal');
  const thead = document.getElementById('history-preview-thead');
  const tbody = document.getElementById('history-preview-list');
  const selCountEl = document.getElementById('history-preview-sel-count');
  const undoSelectedBtn = document.getElementById('btn-undo-selected');

  tbody.innerHTML = '';
  thead.innerHTML = `
    <tr>
      <th style="width:40px; text-align:center;"><input type="checkbox" id="hist-check-all" checked></th>
      <th>Orijinal Ad</th>
      <th>Yeniden Adlandırılan Ad</th>
      <th>Durum</th>
      <th>Konum</th>
    </tr>
  `;

  // Check which files currently exist
  const newPaths = batch.operations.map(op => op.newPath);
  let existing = [];
  if (window.electronAPI && window.electronAPI.checkDiskCollisions) {
    existing = await window.electronAPI.checkDiskCollisions(newPaths);
  }

  batch.operations.forEach((op) => {
    const fileExists = existing.includes(op.newPath);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align:center;">
        <input type="checkbox" class="hist-row-check" value="${escapeHtml(op.newPath)}" ${fileExists ? 'checked' : 'disabled'}>
      </td>
      <td><strong>${escapeHtml(op.oldName)}</strong></td>
      <td style="color:var(--accent-light);">${escapeHtml(op.newName)}</td>
      <td>${fileExists ? '<span style="color:var(--green);">Hazır</span>' : '<span style="color:var(--red);">Dosya Yok</span>'}</td>
      <td style="color:var(--text-muted); font-size:11px;">${escapeHtml(op.newPath)}</td>
    `;
    tbody.appendChild(tr);
  });

  function updateHistSelCount() {
    const checked = tbody.querySelectorAll('.hist-row-check:checked').length;
    selCountEl.textContent = checked;
    undoSelectedBtn.disabled = checked === 0;
  }
  updateHistSelCount();

  document.getElementById('hist-check-all')?.addEventListener('change', (e) => {
    tbody.querySelectorAll('.hist-row-check:not(:disabled)').forEach(cb => (cb.checked = e.target.checked));
    updateHistSelCount();
  });

  tbody.querySelectorAll('.hist-row-check').forEach(cb => cb.addEventListener('change', updateHistSelCount));

  undoSelectedBtn.onclick = async () => {
    const checked = Array.from(tbody.querySelectorAll('.hist-row-check:checked')).map(cb => cb.value);
    if (checked.length === 0) return;

    const confirmed = await showCustomConfirm(
      'Kısmi Geri Alma',
      `Seçilen <strong>${checked.length}</strong> dosya eski isimlerine geri döndürülecek. Devam edilsin mi?`
    );
    if (confirmed) {
      modal.classList.add('hidden');
      const res = await window.electronAPI.undoBatch(batch.id, checked);
      if (res.success) {
        toast(`${res.undone} dosya eski haline döndürüldü!`, 'success');
        loadHistoryUI();
      }
    }
  };

  modal.classList.remove('hidden');
}

document.querySelectorAll('.btn-close-history-preview').forEach(b => {
  b.addEventListener('click', () => historyPreviewModal.classList.add('hidden'));
});

// ═══════════════════════════════════════
// DIALOG HELPERS (Confirm & Prompt)
// ═══════════════════════════════════════

function showCustomConfirm(title, message, isWarning = false) {
  return new Promise((resolve) => {
    const titleEl = document.getElementById('custom-confirm-title');
    const msgEl = document.getElementById('custom-confirm-message');
    const okBtn = document.getElementById('custom-confirm-ok');

    titleEl.textContent = title;
    msgEl.innerHTML = message;

    if (isWarning) {
      okBtn.className = 'btn btn-danger';
      okBtn.textContent = 'Yine de Devam Et';
    } else {
      okBtn.className = 'btn btn-primary';
      okBtn.textContent = 'Devam Et';
    }

    customConfirmModal.classList.remove('hidden');

    function close(res) {
      customConfirmModal.classList.add('hidden');
      cleanup();
      resolve(res);
    }

    const onOk = () => close(true);
    const onCancel = () => close(false);

    okBtn.addEventListener('click', onOk);
    customConfirmModal.querySelectorAll('.btn-close-confirm').forEach(b => b.addEventListener('click', onCancel));

    function cleanup() {
      okBtn.removeEventListener('click', onOk);
      customConfirmModal.querySelectorAll('.btn-close-confirm').forEach(b => b.removeEventListener('click', onCancel));
    }
  });
}

function showCustomPrompt(title, msg, defaultValue, callback) {
  document.getElementById('custom-prompt-title').textContent = title;
  document.getElementById('custom-prompt-msg').textContent = msg;
  const input = document.getElementById('custom-prompt-input');
  input.value = defaultValue;
  customPromptModal.classList.remove('hidden');
  input.focus();

  function close() {
    customPromptModal.classList.add('hidden');
    cleanup();
  }

  const onOk = () => {
    callback(input.value.trim());
    close();
  };

  const onKey = (e) => {
    if (e.key === 'Enter') onOk();
    if (e.key === 'Escape') close();
  };

  document.getElementById('custom-prompt-ok').addEventListener('click', onOk);
  customPromptModal.querySelectorAll('.btn-close-prompt').forEach(b => b.addEventListener('click', close));
  input.addEventListener('keydown', onKey);

  function cleanup() {
    document.getElementById('custom-prompt-ok').removeEventListener('click', onOk);
    customPromptModal.querySelectorAll('.btn-close-prompt').forEach(b => b.removeEventListener('click', close));
    input.removeEventListener('keydown', onKey);
  }
}

// ═══════════════════════════════════════
// SETTINGS & LOCALIZATION
// ═══════════════════════════════════════

const langSelect = document.getElementById('app-language-select');
if (langSelect) {
  langSelect.value = getLang();
  langSelect.addEventListener('change', (e) => {
    setLang(e.target.value);
    renderHeader();
    applyFileFilter();
    toast('Dil tercihi güncellendi!', 'success');
  });
}

function initColumnToggles() {
  const container = document.getElementById('file-list-col-toggles');
  if (!container) return;
  container.innerHTML = '';

  columnDefinitions.forEach((colDef) => {
    const isVisible = visibleFileListCols.includes(colDef.id);
    const label = document.createElement('label');
    label.className = 'toggle-row';
    label.innerHTML = `
      <span>${escapeHtml(colDef.title)}</span>
      <div class="toggle-switch">
        <input type="checkbox" data-col-id="${colDef.id}" ${isVisible ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </div>
    `;

    const cb = label.querySelector('input');
    cb.addEventListener('change', () => {
      const colId = cb.dataset.colId;
      if (cb.checked) {
        if (!visibleFileListCols.includes(colId)) visibleFileListCols.push(colId);
      } else {
        visibleFileListCols = visibleFileListCols.filter(c => c !== colId);
      }
      columnOrder = allFileListCols.filter(c => visibleFileListCols.includes(c));
      localStorage.setItem('namify-file-cols', JSON.stringify(visibleFileListCols));
      renderHeader();
      applyFileFilter();
    });

    container.appendChild(label);
  });
}

// ═══════════════════════════════════════
// LAYOUT TOGGLE & RESIZER
// ═══════════════════════════════════════

const layoutContainer = document.getElementById('rename-layout-container');
const btnToggleLayout = document.getElementById('btn-toggle-layout');
const layoutModeLabel = document.getElementById('layout-mode-label');
const layoutResizer = document.getElementById('layout-resizer');
const rulesArea = document.getElementById('rename-rules-area');

let currentLayoutMode = localStorage.getItem('namify-layout-mode') || 'split';
applyLayoutMode(currentLayoutMode);

btnToggleLayout?.addEventListener('click', () => {
  currentLayoutMode = currentLayoutMode === 'split' ? 'stack' : 'split';
  localStorage.setItem('namify-layout-mode', currentLayoutMode);
  applyLayoutMode(currentLayoutMode);
});

function applyLayoutMode(mode) {
  if (mode === 'split') {
    layoutContainer.className = 'layout-split';
    if (layoutModeLabel) layoutModeLabel.textContent = 'Yan Yana';
    const savedWidth = localStorage.getItem('namify-split-width');
    if (savedWidth) rulesArea.style.width = savedWidth + 'px';
  } else {
    layoutContainer.className = 'layout-stack';
    if (layoutModeLabel) layoutModeLabel.textContent = 'Alt Alta';
    rulesArea.style.width = 'auto';
  }
}

let isResizingLayout = false;
layoutResizer?.addEventListener('mousedown', (e) => {
  e.preventDefault();
  isResizingLayout = true;
  layoutResizer.classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!isResizingLayout) return;
  const rect = layoutContainer.getBoundingClientRect();
  let newWidth = e.clientX - rect.left;
  if (newWidth < 300) newWidth = 300;
  if (newWidth > rect.width - 300) newWidth = rect.width - 300;
  rulesArea.style.width = newWidth + 'px';
});

document.addEventListener('mouseup', () => {
  if (isResizingLayout) {
    isResizingLayout = false;
    layoutResizer.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    localStorage.setItem('namify-split-width', rulesArea.offsetWidth);
  }
});

// ═══════════════════════════════════════
// ELECTRON WINDOW CONTROLS
// ═══════════════════════════════════════

document.getElementById('tb-min')?.addEventListener('click', () => {
  window.electronAPI?.minimize();
});

document.getElementById('tb-max')?.addEventListener('click', () => {
  window.electronAPI?.maximize();
});

document.getElementById('tb-close')?.addEventListener('click', () => {
  if (window.electronAPI?.close) window.electronAPI.close();
  else window.close();
});

if (window.electronAPI?.onMaximizeChange) {
  window.electronAPI.onMaximizeChange((isMaximized) => {
    const icon = document.getElementById('tb-max-icon');
    if (icon) {
      if (isMaximized) {
        icon.innerHTML = '<path d="M3 1h8v8H3z M1 3h8v8H1z" fill="none" stroke="currentColor" stroke-width="1.2"/>';
      } else {
        icon.innerHTML = '<rect x="1" y="1" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/>';
      }
    }
  });
}

document.getElementById('btn-check-updates')?.addEventListener('click', () => {
  toast('Güncellemeler denetleniyor...', 'info');
  window.electronAPI?.checkUpdates();
});

document.getElementById('btn-github')?.addEventListener('click', () => {
  window.electronAPI?.openExternal('https://github.com/knutolof06/namify-renamer');
});

if (window.electronAPI?.getAppVersion) {
  window.electronAPI.getAppVersion().then((v) => {
    const el = document.getElementById('app-version-display');
    const tag = document.getElementById('app-version-tag');
    if (el) el.textContent = `Versiyon ${v}`;
    if (tag) tag.textContent = `v${v}`;
  });
}

// ═══════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════

function getExtension(name) {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function getFileIcon(ext) {
  const icons = {
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️', bmp: '🖼️',
    mp4: '🎬', mkv: '🎬', avi: '🎬', mov: '🎬', wmv: '🎬',
    mp3: '🎵', wav: '🎵', flac: '🎵', ogg: '🎵', aac: '🎵',
    pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗', ppt: '📙', pptx: '📙',
    zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦',
    js: '💛', ts: '💙', py: '🐍', html: '🌐', css: '🎨', json: '📋',
    txt: '📝', md: '📝'
  };
  return icons[ext?.toLowerCase()] || '📄';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── App Startup ──
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  initVirtualScrollers();
  initRulePicker();
  loadDynamicRules();
  initColumnToggles();
  switchView('home');
});
