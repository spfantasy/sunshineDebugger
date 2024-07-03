import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fork } from 'child_process';
import fs from 'fs';
import axios from "axios";
import JSON5 from 'json5';

// 获取 __filename 和 __dirname
const __dirname = app.getAppPath();

let config;
let serverProcess;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: config.frontend.fullscreen,
        webPreferences: {
            preload: path.resolve(__dirname, 'build/preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    win.loadFile(path.resolve(__dirname, 'dist/src/index.html'));
    win.webContents.openDevTools();
}

async function checkBackendStatus() {
    try {
        const response = await axios.get(`http://localhost:${config.backend.port}/health_check`);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

async function waitForBackend() {
    const interval = 1000; // 每 1 秒检查一次
    let backendReady = await checkBackendStatus();

    while (!backendReady) {
        console.log('Waiting for backend to start...');
        await new Promise(resolve => setTimeout(resolve, interval));
        backendReady = await checkBackendStatus();
    }

    console.log('Backend is up!');
}

app.whenReady().then(() => {
    console.log('App is ready');
    console.log('Copy config to user data');
    config = JSON5.parse(fs.readFileSync(path.resolve(__dirname, "config/env.json5"), 'utf8'));
    // 启动后端服务器
    serverProcess = fork(path.resolve(__dirname, 'backend/server.js'), [], {
        stdio: 'inherit',
        env: {
            PORT: config.backend.port,
            CONFIG_DIR: app.getAppPath(),
        }
    });

    waitForBackend().then(() => createWindow());
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

ipcMain.handle('fetch_data', async (event, endpoint, params) => {
    try {
        const response = await axios.post(`http://localhost:${config.backend.port}/api/${endpoint}`, params);
        return response.data;
    } catch (error) {
        console.error('Error fetching data from server:', error);
        throw JSON5.stringify(error.response.data);
    }
});