const { BrowserWindow, ipcMain, desktopCapturer } = require("electron");

module.exports = function () {
	const recordingControlPanelSize = { width: 300, height: 60 };

	ipcMain.handle("recording:start", async function (event, recordingMode, videoInDeviceId, audioInDeviceId) {
		if (typeof cnf.googleApiRefreshToken == "undefined" || typeof cnf.atrecWebApiToken == "undefined") {
			return mainWindow.webContents.executeJavaScript("showSignIn();");
		}

		cnf.recordingMode = recordingMode;
		cnf.videoInDeviceId = videoInDeviceId;
		cnf.audioInDeviceId = audioInDeviceId;

		if (cnf.recordingMode != "camera") {
			const screenRecordSource = await desktopCapturer.getSources({
				types: ["screen"],
			});
			cnf.screenRecordSourceId = screenRecordSource[0].id;
		}

		ipcMain.emit("recordingWindow:open");
		mainWindow.destroy();
	});

	ipcMain.handle("recording:stop", function (e, showLoader = false, showSignIn = false) {
		ipcMain.emit("mainWindow:open");
		if (showSignIn) {
			mainWindow.webContents.executeJavaScript("showSignIn();");
		}

		if (typeof camWindow != "undefined") {
			camWindow.destroy();
		}

		if (showLoader) {
			recordingWindow.hide();
			mainWindow.webContents.executeJavaScript("showLoader();");
		} else {
			recordingWindow.destroy();
		}
	});

	ipcMain.handle("recording:showVideoUrl", function (e, videoUrl) {
		mainWindow.focus();
		mainWindow.webContents.executeJavaScript(`hideLoader(); showVideoUrl('${videoUrl}');`);
		recordingWindow.destroy();
	});

	ipcMain.on("recordingWindow:open", function () {
		if (cnf.recordingWindowPosition.x == null) {
			cnf.recordingWindowPosition.x = (cnf.displaySize.width - recordingControlPanelSize.width) / 2;
			cnf.recordingWindowPosition.y = cnf.displaySize.height - 200;
		}

		const window = new BrowserWindow({
			frame: false,
			width: recordingControlPanelSize.width,
			height: recordingControlPanelSize.height,
			x: cnf.recordingWindowPosition.x,
			y: cnf.recordingWindowPosition.y,
			transparent: true,
			fullscreenable: false,
			resizable: false,
			alwaysOnTop: true,
			webPreferences: {
				preload: preloadScriptPath + "/recordingWindowPreload.js",
			},
		});

		window.loadFile(webContentPath + "/html/recordingWindow.html");

		window.webContents.send("config", {
			recordingMode: cnf.recordingMode,
			screenRecordSourceId: cnf.screenRecordSourceId,
			videoInDeviceId: cnf.videoInDeviceId,
			audioInDeviceId: cnf.audioInDeviceId,
			googleApiRefreshToken: cnf.googleApiRefreshToken,
			atrecWebApiToken: cnf.atrecWebApiToken,
			atrecWebUrl,
		});

		window.on("move", function () {
			const bounds = window.getBounds();
			cnf.recordingWindowPosition.x = bounds.x;
			cnf.recordingWindowPosition.y = bounds.y;
		});

		global.recordingWindow = window;
		ipcMain.emit("camWindow:open");
	});
};
