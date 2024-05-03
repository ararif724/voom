const { app, BrowserWindow, ipcMain } = require("electron");
const { quitApp } = require("../helper");

module.exports = function () {
	ipcMain.handle("canvasWindow:enterDrawMode", function () {
		recordingWindow.hide();

		if (typeof canvasWindow != "undefined") {
			canvasWindow.show();
			return true;
		}

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
			quitApp();
		});

		global.canvasWindow = window;
	});

	ipcMain.handle("canvasWindow:exitDrawMode", function () {
		canvasWindow.hide();
		recordingWindow.show();
	});
};
