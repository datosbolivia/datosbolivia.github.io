const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('datameshDesktop', {
  isDesktop: true,
  getEngineStatus: () => ipcRenderer.invoke('datamesh:engine-status'),
  executeQuery: (sql) => ipcRenderer.invoke('datamesh:execute-query', sql),
  validateLocalNode: (dirPath) => ipcRenderer.invoke('datamesh:validate-node', dirPath)
});
