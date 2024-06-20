import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import fetch from 'node-fetch';
import fs from 'fs';

// 获取 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../config/env.json"), 'utf8'));

let serverProcess;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    win.loadFile(path.join(__dirname, '../dist/src/index.html'));
    win.webContents.openDevTools();
}

app.whenReady().then(() => {
    console.log('App is ready');
    // 启动后端服务器
    serverProcess = fork(path.join(__dirname, '../backend/server.js'), [], {
        stdio: 'inherit',
        env: { PORT: config.backend.port }
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
        console.log("fetch-data start");
        const response = await fetch(`http://localhost:${config.backend.port}/api/data`);
        const data = await response.json();
        console.log('Data fetched from server:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data from server:', error);
        throw error;
    }
});