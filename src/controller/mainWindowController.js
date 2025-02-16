const { BrowserWindow, ipcMain } = require("electron");

module.exports = function () {
	ipcMain.on("mainWindow:open", function () {
		const window = new BrowserWindow({
			frame: false,
			transparent: true,
			width: 520,
			height: 600,
			fullscreenable: false,
			resizable: false,
			webPreferences: {
				preload: preloadScriptPath + "/mainWindowPreload.js",
			},
		});

		window.loadFile(webContentPath + "/html/mainWindow.html");

		window.webContents.send("config", {
			recordingMode: cnf.recordingMode,
			videoInDeviceId: cnf.videoInDeviceId,
			audioInDeviceId: cnf.audioInDeviceId,
			atrecWebUrl: cnf.atrecWebUrl,
			notSignedIn: typeof cnf.googleApiRefreshToken == "undefined" || typeof cnf.atrecWebApiToken == "undefined",
		});

		log.info("App main window open");
		global.mainWindow = window;
	});

	ipcMain.handle("mainWindow:showError", function (e, title, message) {
		mainWindow.webContents.executeJavaScript(`hideLoader(); showError('${title}', '${message}');`);
	});
};
