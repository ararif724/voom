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
	recordingMode: "screenCamera",
	videoInDeviceId: null,
	audioInDeviceId: null,
	recordingWindowPosition: { x: null, y: null },
	camWindowPosition: { x: null, y: null }, //only used for rounded camera window of screenCamera mode
	...userCnf,
};

global.atrecWebUrl = cnf?.atrecWebUrl ? cnf?.atrecWebUrl : "https://www.atrec.app";
global.preloadScriptPath = path.join(__dirname, "/preloadScript");
global.webContentPath = path.join(__dirname, "/webContent");

//loading controllers
mainWindowController();
camWindowController();
recordingWindowController();
canvasWindowController();

if (!app.requestSingleInstanceLock()) {
	app.exit(0);
}

if (process.platform === "win32") {
	app.disableHardwareAcceleration();
}

//app event handlers
ipcMain.handle("app:close", quitApp);
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
