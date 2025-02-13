const { app, BrowserWindow, ipcMain } = require("electron");
const { quitApp } = require("../helper");

module.exports = function () {
	//canvas window. Will open by clicking pencil icon
	ipcMain.handle("canvasWindow:enterDrawMode", function () {
		recordingWindow.hide(); //hide recording window

		const window = new BrowserWindow({
			frame: false,
			...cnf.displaySize,
			transparent: true,
			fullscreenable: false,
			resizable: false,
			alwaysOnTop: true,
			minimizable: false,
			webPreferences: {
				preload: preloadScriptPath + "/canvasWindowPreload.js",
			},
		});

		window.loadFile(webContentPath + "/html/canvasWindow.html");

		window.on("close", function () {
			canvasWindow.destroy();
			recordingWindow.show();
		});

		window.webContents.send("canvasConfig", cnf.canvasConfig);

		global.canvasWindow = window;
	});

	ipcMain.handle("canvasWindow:exitDrawMode", function (e, canvasConfig) {
		cnf.canvasConfig = canvasConfig;
		canvasWindow.close();
	});
};
