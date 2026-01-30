const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1664,
    height: 936,
    frame: false,
    backgroundColor: '#000',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'dist/snake-game/browser/index.html'));

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });

  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('toggle-fullscreen', () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.commandLine.appendSwitch('disable-web-security');
