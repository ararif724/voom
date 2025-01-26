const { BrowserWindow, ipcMain } = require("electron");

module.exports = function () {
	ipcMain.on("camWindow:open", () => {
		// default camera window size
		let config = {
			width: 700,
			height: 600,
		};

		if (cnf.recordingMode == "screen-camera") {
			// rounded camera window of screen-camera mode
			const camWindowHeight = 300;

			if (cnf.camWindowPosition.x == null) {
				cnf.camWindowPosition.x = 0;
				cnf.camWindowPosition.y = cnf.displaySize.height - camWindowHeight;
			}

			config = {
				width: 300,
				height: camWindowHeight,
				// user will got the rounded camera window at the same position it was last time
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
		});

		if (cnf.recordingMode == "screen-camera") {
			// track rounded camera window position.
			// will save it to user config upon close the app.
			// user will got the rounded camera window at the same position next time
			window.on("move", function () {
				const bounds = window.getBounds();
				cnf.camWindowPosition.x = bounds.x;
				cnf.camWindowPosition.y = bounds.y;
			});
		}

		global.camWindow = window;
	});
};
