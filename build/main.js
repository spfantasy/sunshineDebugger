import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'path';
import {spawn} from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverProcess;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });

    win.loadFile(path.join(__dirname, '../dist/src/index.html')); // 加载打包后的HTML文件
}

app.whenReady().then(() => {
    // 启动后端服务器
    serverProcess = spawn('node', [path.join(__dirname, '../backend/server.js')], {
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

ipcMain.handle('fetch-data', async (event, args) => {
    const response = await fetch('http://localhost:3000/api/data');
    return await response.json();
});