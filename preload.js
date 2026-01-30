const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  close: () => ipcRenderer.send('close-window'),
  minimize: () => ipcRenderer.send('minimize-window'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen')
});