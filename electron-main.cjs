const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// ── History Management ──
function getHistoryPath() {
  return path.join(app.getPath('userData'), 'namify-history.json');
}

function loadHistory() {
  try {
    const data = fs.readFileSync(getHistoryPath(), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveHistory(history) {
  try {
    if (history.length > 50) history = history.slice(0, 50);
    fs.writeFileSync(getHistoryPath(), JSON.stringify(history, null, 2), 'utf-8');
  } catch (e) {
    console.error('Geçmiş kaydedilemedi:', e);
  }
}

// ── Window State Management ──
function getWindowStatePath() {
  return path.join(app.getPath('userData'), 'namify-window-state.json');
}

function loadWindowState() {
  try {
    const data = fs.readFileSync(getWindowStatePath(), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { width: 1180, height: 780 };
  }
}

function saveWindowState(state) {
  try {
    fs.writeFileSync(getWindowStatePath(), JSON.stringify(state), 'utf-8');
  } catch (e) {}
}

function createWindow() {
  const state = loadWindowState();

  mainWindow = new BrowserWindow({
    width: state.width || 1180,
    height: state.height || 780,
    x: state.x,
    y: state.y,
    minWidth: 880,
    minHeight: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#0a0a0f',
    show: false,
  });

  mainWindow.on('close', () => {
    saveWindowState(mainWindow.getBounds());
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized-state', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized-state', false);
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

let autoUpdater;
try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch (e) {}

app.whenReady().then(() => {
  createWindow();

  if (process.env.NODE_ENV !== 'development' && autoUpdater) {
    try {
      autoUpdater.checkForUpdatesAndNotify();

      autoUpdater.on('update-available', () => {
        mainWindow?.webContents.send('update-message', 'Yeni güncelleme bulundu, arka planda indiriliyor...', 'info');
      });

      autoUpdater.on('update-not-available', () => {
        mainWindow?.webContents.send('update-message', 'En güncel sürümü kullanıyorsunuz.', 'success');
      });

      autoUpdater.on('error', (err) => {
        mainWindow?.webContents.send('update-message', 'Güncelleme kontrolü: ' + err.message, 'error');
      });

      autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Güncelleme Hazır',
          message: 'Uygulamanın yeni bir sürümü indirildi. Şimdi yüklenip yeniden başlatılsın mı?',
          buttons: ['Evet', 'Daha Sonra']
        }).then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
      });
    } catch (e) {}
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ── Window Controls ──
ipcMain.handle('window-minimize', () => mainWindow?.minimize());
ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
    return false;
  } else {
    mainWindow?.maximize();
    return true;
  }
});
ipcMain.handle('window-close', () => mainWindow?.close());
ipcMain.handle('check-updates', () => {
  if (autoUpdater && process.env.NODE_ENV !== 'development') {
    return autoUpdater.checkForUpdatesAndNotify();
  }
  return null;
});
ipcMain.handle('open-external', (_e, url) => shell.openExternal(url));
ipcMain.handle('get-app-version', () => app.getVersion());

// ── Non-blocking Disk Collisions Check ──
ipcMain.handle('check-disk-collisions', async (_event, targetPaths) => {
  if (!targetPaths || targetPaths.length === 0) return [];
  const existing = [];
  const batchSize = 64;

  for (let i = 0; i < targetPaths.length; i += batchSize) {
    const chunk = targetPaths.slice(i, i + batchSize);
    await Promise.all(chunk.map(async (p) => {
      try {
        await fs.promises.access(p, fs.constants.F_OK);
        existing.push(p);
      } catch (e) {
        // Does not exist
      }
    }));
  }
  return existing;
});

// ── Directory Picker ──
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

// ── High-Performance Async Scan Paths ──
ipcMain.handle('scan-paths', async (_event, { paths, options }) => {
  const processedFiles = [];
  const { mode, includeSubfolders, fileMask, regexMatch, addSubfolders, addRoot } = options;

  let maskRegex = null;
  if (fileMask) {
    const escaped = fileMask.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    maskRegex = new RegExp('^' + escaped + '$', 'i');
  }

  let customRegex = null;
  if (regexMatch) {
    try { customRegex = new RegExp(regexMatch); } catch (e) {}
  }

  function matches(name) {
    if (maskRegex && !maskRegex.test(name)) return false;
    if (customRegex && !customRegex.test(name)) return false;
    return true;
  }

  async function traverse(currentPath, depth) {
    let stat;
    try {
      stat = await fs.promises.stat(currentPath);
    } catch (e) {
      return;
    }

    const isFile = stat.isFile();
    const isDir = stat.isDirectory();
    const name = path.basename(currentPath);

    if (isFile) {
      if (mode === 'files') {
        if (matches(name)) {
          processedFiles.push({ name, path: currentPath, size: stat.size, isFile: true, mtime: stat.mtimeMs });
        }
      }
    } else if (isDir) {
      if (depth === 0 && mode === 'folders' && addRoot) {
        processedFiles.push({ name, path: currentPath, size: 0, isFile: false, mtime: stat.mtimeMs });
      }

      const shouldRecurse = depth === 0 || (mode === 'files' && includeSubfolders) || (mode === 'folders' && addSubfolders);

      if (shouldRecurse) {
        let entries = [];
        try {
          entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
        } catch (e) {}

        const dirPromises = [];
        for (const entry of entries) {
          const itemPath = path.join(currentPath, entry.name);
          if (entry.isDirectory()) {
            if (mode === 'folders' && addSubfolders) {
              processedFiles.push({ name: entry.name, path: itemPath, size: 0, isFile: false, mtime: Date.now() });
            }
            dirPromises.push(traverse(itemPath, depth + 1));
          } else if (entry.isFile()) {
            if (mode === 'files') {
              if (matches(entry.name)) {
                dirPromises.push(
                  fs.promises.stat(itemPath).then(s => {
                    processedFiles.push({ name: entry.name, path: itemPath, size: s.size, isFile: true, mtime: s.mtimeMs });
                  }).catch(() => {})
                );
              }
            }
          }
        }
        await Promise.all(dirPromises);
      }
    }
  }

  await Promise.all(paths.map(p => traverse(p, 0)));

  // Deduplicate
  const uniqueFiles = [];
  const handled = new Set();
  for (const f of processedFiles) {
    if (!handled.has(f.path)) {
      handled.add(f.path);
      uniqueFiles.push(f);
    }
  }
  return uniqueFiles;
});

// ── Optimized Rename / Move / Copy Files with Live Progress ──
ipcMain.handle('rename-files', async (_event, { folder, files, actionType = 'rename', targetFolder = null }) => {
  const results = { success: 0, errors: 0 };
  const successfulRenames = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const oldPath = file.path;
    const baseFolder = (actionType === 'move' || actionType === 'copy') && targetFolder ? targetFolder : path.dirname(oldPath);
    const newPath = path.join(baseFolder, file.newName);

    // Send progress event to renderer
    mainWindow?.webContents.send('rename-progress', {
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100),
      file: file.oldName
    });

    if (oldPath === newPath || (actionType === 'copy' && oldPath.toLowerCase() === newPath.toLowerCase())) {
      results.success++;
      continue;
    }

    try {
      if (actionType === 'copy') {
        await fs.promises.cp(oldPath, newPath, { recursive: true });
      } else {
        try {
          await fs.promises.rename(oldPath, newPath);
        } catch (renameErr) {
          if (renameErr.code === 'EXDEV') {
            await fs.promises.cp(oldPath, newPath, { recursive: true });
            await fs.promises.rm(oldPath, { recursive: true, force: true });
          } else {
            throw renameErr;
          }
        }
      }
      results.success++;
      successfulRenames.push({ oldPath, newPath, oldName: file.oldName, newName: file.newName, action: actionType });
    } catch (err) {
      console.error(`${actionType} error: ${file.oldName} → ${file.newName}`, err.message);
      results.errors++;
    }
  }

  if (successfulRenames.length > 0) {
    const history = loadHistory();
    history.unshift({
      id: Date.now().toString(),
      timestamp: Date.now(),
      folder: folder || path.dirname(successfulRenames[0]?.oldPath || ''),
      count: successfulRenames.length,
      operations: successfulRenames
    });
    saveHistory(history);
  }

  return results;
});

// ── Get History ──
ipcMain.handle('get-history', async () => loadHistory());

// ── Undo Batch ──
ipcMain.handle('undo-batch', async (_event, batchId, pathsToUndo = null) => {
  const history = loadHistory();
  const batchIndex = history.findIndex(b => b.id === batchId);
  if (batchIndex === -1) return { success: false, error: 'Kayıt bulunamadı.' };

  const batch = history[batchIndex];
  let successCount = 0;
  let errorCount = 0;

  const opsToUndo = pathsToUndo
    ? [...batch.operations].filter(op => pathsToUndo.includes(op.newPath)).reverse()
    : [...batch.operations].reverse();

  if (opsToUndo.length === 0) return { success: false, error: 'Geri alınacak dosya seçilmedi.' };

  for (const op of opsToUndo) {
    try {
      if (fs.existsSync(op.newPath)) {
        if (op.action === 'copy') {
          await fs.promises.rm(op.newPath, { recursive: true, force: true });
        } else {
          try {
            await fs.promises.rename(op.newPath, op.oldPath);
          } catch (renameErr) {
            if (renameErr.code === 'EXDEV') {
              await fs.promises.cp(op.newPath, op.oldPath, { recursive: true });
              await fs.promises.rm(op.newPath, { recursive: true, force: true });
            } else {
              throw renameErr;
            }
          }
        }
        successCount++;
        batch.operations = batch.operations.filter(o => o.newPath !== op.newPath);
      } else {
        errorCount++;
      }
    } catch (e) {
      errorCount++;
    }
  }

  if (batch.operations.length === 0) {
    history.splice(batchIndex, 1);
  } else {
    batch.count = batch.operations.length;
  }
  saveHistory(history);

  return { success: true, undone: successCount, errors: errorCount };
});
