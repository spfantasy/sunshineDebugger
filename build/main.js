import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { fork } from 'child_process';
import fetch from 'node-fetch';

// 获取 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverProcess;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: pathToFileURL(path.join(__dirname, 'preload.js')).href,
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });

    win.loadFile(path.join(__dirname, '../dist/src/index.html'));
    win.webContents.openDevTools();
}

app.whenReady().then(() => {
    console.log('App is ready');
    // 启动后端服务器
    serverProcess = fork(path.join(__dirname, '../backend/server.js'), [], {
        stdio: 'inherit'
    });

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }

    // 关闭后端服务器
    if (serverProcess) {
        serverProcess.kill();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('fetch-data', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/data');
        const data = await response.json();
        console.log('Data fetched from server:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data from server:', error);
        throw error;
    }
});