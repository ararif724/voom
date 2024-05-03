const { BrowserWindow, ipcMain } = require("electron");

module.exports = function () {
	ipcMain.on("camWindow:open", () => {
		if (cnf.recordingMode != "screen") {
			let config = {
				width: 700,
				height: 600,
			};

			if (cnf.recordingMode == "screenCamera") {
				const camWindowHeight = 300;

				if (cnf.camWindowPosition.x == null) {
					cnf.camWindowPosition.x = 0;
					cnf.camWindowPosition.y = cnf.displaySize.height - camWindowHeight;
				}

				config = {
					width: 300,
					height: camWindowHeight,
					x: cnf.camWindowPosition.x,
					y: cnf.camWindowPosition.y,
					alwaysOnTop: true,
				};
			}

			const window = new BrowserWindow({
				...config,
				parent: recordingWindow,
				frame: false,
				transparent: true,
				resizable: false,
				webPreferences: {
					preload: preloadScriptPath + "/camWindowPreload.js",
				},
			});

			window.loadFile(webContentPath + "/html/camWindow.html");

			window.webContents.send("config", {
				recordingMode: cnf.recordingMode,
				videoInDeviceId: cnf.videoInDeviceId,
				audioInDeviceId: cnf.audioInDeviceId,
			});

			if (cnf.recordingMode == "screenCamera") {
				window.on("move", function () {
					const bounds = window.getBounds();
					cnf.camWindowPosition.x = bounds.x;
					cnf.camWindowPosition.y = bounds.y;
				});
			}

			global.camWindow = window;
		}
	});
};
