const { contextBridge, ipcRenderer } = require('electron');
// Electron preload.js use CommonJS syntax as default
contextBridge.exposeInMainWorld('electron', {
    fetchData: () => ipcRenderer.invoke('fetch-data')
});