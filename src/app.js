const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mainWindowController = require('./controller/mainWindowController');
const camWindowController = require('./controller/camWindowController');
const recordingWindowController = require('./controller/recordingWindowController');
const canvasWindowController = require('./controller/canvasWindowController');

//setting variables
userCnf = {
    recordingMode: 'screen'
};

global.cnf = {
    controllerPath: path.join(__dirname, '/controller'),
    preloadScriptPath: path.join(__dirname, '/preloadScript'),
    webContentPath: path.join(__dirname, '/webContent'),
    recordingMode: 'screenCamera',
    videoInDeviceId: null,
    audioInDeviceId: null,
    recordingWindowPosition: { x: null, y: null },
    ...userCnf
};

//loading controllers
mainWindowController();
camWindowController();
recordingWindowController();
canvasWindowController();

//root events
ipcMain.handle('app:close', () => {
    app.quit()
});

ipcMain.handle('app:setRecordingMode', (e, recordingMode) => {
    cnf.recordingMode = recordingMode;
    ipcMain.emit('camWindow:open');
});

ipcMain.handle('app:setVideoInDeviceId', (e, videoInDeviceId) => {
    cnf.videoInDeviceId = videoInDeviceId;
    ipcMain.emit('camWindow:open');
});

ipcMain.handle('app:setAudioInDeviceId', (e, audioInDeviceId) => {
    cnf.audioInDeviceId = audioInDeviceId;
});

ipcMain.handle('app:getRecordingMode', () => cnf.recordingMode);
ipcMain.handle('app:getVideoInDeviceId', () => cnf.videoInDeviceId);
ipcMain.handle('app:getAudioInDeviceId', () => cnf.audioInDeviceId);

app.whenReady().then(() => {
    const { screen } = require('electron');
    cnf.displaySize = screen.getPrimaryDisplay().bounds;

    ipcMain.emit('mainWindow:open');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        ipcMain.emit('mainWindow:open');
    }
});