const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { initEngine } = require('./engine.cjs');

let mainWindow;
let server;
const PORT = 38241;

// Servidor estático local embebido para producción
function startStaticServer(distPath) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
    '.webmanifest': 'application/manifest+json'
  };

  server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    
    let filePath = path.join(distPath, reqUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });

  server.listen(PORT, '127.0.0.1');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 800,
    minHeight: 600,
    title: 'DataMesh Bolivia - Portal de Datos',
    backgroundColor: '#0b243f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Abrir enlaces externos en el navegador nativo
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  const isDev = process.env.ELECTRON_DEV === 'true';
  if (isDev) {
    mainWindow.loadURL('http://localhost:8001');
  } else {
    const distPath = path.join(__dirname, '..', 'dist');
    startStaticServer(distPath);
    mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
  }

  // Inicializar puente de cómputo y motor SDK
  initEngine(ipcMain, mainWindow);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
