const { BrowserWindow, ipcMain } = require("electron");

module.exports = function () {
	ipcMain.on("mainWindow:open", function () {
		if (typeof mainWindow != "undefined" && !mainWindow?.isDestroyed()) {
			mainWindow.focus();
		} else {
			const window = new BrowserWindow({
				frame: false,
				transparent: true,
				width: 770,
				height: 650,
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
				atrecWebUrl,
			});

			log.info("App main window open");

			global.mainWindow = window;
		}
	});

	ipcMain.handle("mainWindow:showError", function (e, message) {
		mainWindow.webContents.executeJavaScript('hideLoader(); showError("' + message + '");');
	});
};
