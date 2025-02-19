const { BrowserWindow, ipcMain } = require("electron");

module.exports = function () {
	ipcMain.on("mainWindow:open", function () {
		if (typeof mainWindow != "undefined" && !mainWindow?.isDestroyed()) {
			// Focus main window if it is already open
			// This check required because from recordingWindowController recording:stop event could emit mainWindow:open multiple times
			// Ex: recordingWindowController recording:stop event fires for both show loading popup and show success (video url) popup
			mainWindow.focus();
			return;
		}

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
