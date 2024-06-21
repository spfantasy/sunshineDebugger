const { contextBridge, ipcRenderer } = require('electron');
// Electron preload.js use CommonJS syntax as default
console.log('Preload script load start');
contextBridge.exposeInMainWorld('electron', {
    fetchData: () => ipcRenderer.invoke('fetch_data'),
    fetchTargetEnv: () => ipcRenderer.invoke('fetch_target_env'),
    fetchTargetAccount: () => ipcRenderer.invoke('fetch_target_account')
});
console.log('Preload script load done');