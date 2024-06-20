const { contextBridge, ipcRenderer } = require('electron');
// Electron preload.js use CommonJS syntax as default
console.log('Preload script load start');
contextBridge.exposeInMainWorld('electron', {
    fetchData: () => ipcRenderer.invoke('fetch-data')
});
console.log('Preload script load done');