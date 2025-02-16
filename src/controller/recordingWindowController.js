const { BrowserWindow, ipcMain, desktopCapturer } = require("electron");

module.exports = function () {
	const recordingControlPanelSize = { width: 270, height: 58 };

	ipcMain.handle("recording:start", async function (event, recordingMode, videoInDeviceId, audioInDeviceId) {
		cnf.recordingMode = recordingMode;
		cnf.videoInDeviceId = videoInDeviceId;
		cnf.audioInDeviceId = audioInDeviceId;

		if (cnf.recordingMode != "camera") {
			const screenRecordSource = await desktopCapturer.getSources({
				types: ["screen"],
			});
			cnf.screenRecordSourceId = screenRecordSource[0].id;
		}

		// Create recording window
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
			atrecWebUrl: cnf.atrecWebUrl,
		});

		window.on("move", function () {
			// track recording window position.
			// will save it to user config upon close the app.
			// user will got the recording window at the same position next time
			const bounds = window.getBounds();
			cnf.recordingWindowPosition.x = bounds.x;
			cnf.recordingWindowPosition.y = bounds.y;
		});

		global.recordingWindow = window;

		if (cnf.recordingMode != "screen") {
			// open cam window if recording mode is not screen (screen = only screen recording)
			ipcMain.emit("camWindow:open");
		}

		mainWindow.destroy(); // Destroy main window after creating recording window
	});

	ipcMain.handle("recording:stop", function (e, showLoader = false, showSignIn = false) {
		ipcMain.emit("mainWindow:open");
		if (showSignIn) {
			// If google drive API request returns unauthorized error, show sign in popup
			// Triggered from src/webContent/js/recordingWindow.js
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
};
