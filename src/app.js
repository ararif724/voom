const { app, BrowserWindow, ipcMain } = require("electron");
const log = require("electron-log/main");
const path = require("path");
const { getAllCnf } = require("electron-cnf");
const { quitApp, signIn, openInBrowser } = require("./helper");
const mainWindowController = require("./controller/mainWindowController");
const camWindowController = require("./controller/camWindowController");
const recordingWindowController = require("./controller/recordingWindowController");
const canvasWindowController = require("./controller/canvasWindowController");

global.log = log;
log.initialize();
log.info("App running");

//setting variables
userCnf = getAllCnf();

global.cnf = {
	//default config
	recordingMode: "screen-camera",
	videoInDeviceId: null,
	audioInDeviceId: null,
	recordingWindowPosition: { x: null, y: null },
	camWindowPosition: { x: null, y: null }, //only used for rounded camera window of screen-camera mode
	atrecWebUrl: "https://www.atrec.app",
	//user config. default config will be overridden by user config
	...userCnf,
};

global.atrecWebUrl = cnf?.atrecWebUrl;
global.preloadScriptPath = path.join(__dirname, "/preloadScript");
global.webContentPath = path.join(__dirname, "/webContent");

//loading controllers
mainWindowController();
camWindowController();
recordingWindowController();
canvasWindowController();

if (!app.requestSingleInstanceLock()) {
	app.exit(0); //exit if another instance is running
}

if (process.platform === "win32") {
	//disable hardware acceleration on windows
	//window frame: false is not working without this in windows machine
	app.disableHardwareAcceleration();
}

//app event handlers
ipcMain.handle("app:close", quitApp);
ipcMain.handle("app:minimize", () => mainWindow.minimize());
ipcMain.handle("app:signIn", signIn);
ipcMain.handle("app:openInBrowser", (e, url) => openInBrowser(url));

app.whenReady().then(() => {
	const { screen } = require("electron");
	cnf.displaySize = screen.getPrimaryDisplay().bounds;

	log.info("App ready");

	ipcMain.emit("mainWindow:open");
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		quitApp();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		ipcMain.emit("mainWindow:open");
	}
});
