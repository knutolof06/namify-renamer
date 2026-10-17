const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  renameFiles: (data) => ipcRenderer.invoke('rename-files', data),
  scanPaths: (data) => ipcRenderer.invoke('scan-paths', data),
  getFilePath: (file) => (webUtils && webUtils.getPathForFile ? webUtils.getPathForFile(file) : file.path),
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  undoBatch: (batchId, pathsToUndo) => ipcRenderer.invoke('undo-batch', batchId, pathsToUndo),
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  checkUpdates: () => ipcRenderer.invoke('check-updates'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', (_event, msg, type) => callback(msg, type)),
  onRenameProgress: (callback) => ipcRenderer.on('rename-progress', (_event, data) => callback(data)),
  onMaximizeChange: (callback) => ipcRenderer.on('window-maximized-state', (_event, isMaximized) => callback(isMaximized)),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkDiskCollisions: (targetPaths) => ipcRenderer.invoke('check-disk-collisions', targetPaths)
});
