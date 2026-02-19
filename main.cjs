const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "SeaBits",
    autoHideMenuBar: true, // Üstteki rahatsız edici dosya menüsünü gizler
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Vite kullanıyorsan 'dist', Create React App kullanıyorsan 'build' klasörünü arar.
  // Çoğu modern React projesi 'dist' kullanır.
  win.loadFile(path.join(__dirname, 'dist', 'index.html'))
    .catch(() => {
        // Eğer dist yoksa build klasörünü dener
        win.loadFile(path.join(__dirname, 'build', 'index.html'));
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});