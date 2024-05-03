const { default: axios } = require("axios");
const { BrowserWindow, ipcMain, shell } = require("electron");
const { setCnfMulti } = require("electron-cnf");

module.exports = function () {
	ipcMain.on("mainWindow:open", function () {
		const window = new BrowserWindow({
			frame: false,
			transparent: true,
			width: 770,
			height: 635,
			fullscreenable: false,
			resizable: false,
			webPreferences: {
				preload: preloadScriptPath + "/mainWindowPreload.js",
			},
		});

		window.loadFile(webContentPath + "/html/mainWindow.html");
		window.webContents.openDevTools();
		global.mainWindow = window;
	});

	ipcMain.handle("app:signIn", function () {
		axios
			.get(screenwaveWebUrl + "/get-session-id")
			.then((resp) => {
				if (typeof resp.data.data.sessionId != "undefined") {
					const cookies = resp.headers["set-cookie"].map(
						(item) => item.split(";")[0]
					);
					const sessionId = resp.data.data.sessionId;

					shell.openExternal(screenwaveWebUrl + "/google-o-auth/" + sessionId);

					let totalCheckForSessionData = 0;
					const intervalId = setInterval(() => {
						if (totalCheckForSessionData++ >= 60) {
							clearInterval(intervalId);
							mainWindow.webContents.executeJavaScript(
								'hideLoader(); showError("Sign-in session expired! Please try again.")'
							);
						}
						axios
							.get(screenwaveWebUrl + "/get-session-data/" + sessionId, {
								headers: {
									Cookie: cookies,
								},
							})
							.then((resp) => {
								if (
									resp?.data?.data?.apiToken &&
									resp?.data?.data?.refreshToken
								) {
									clearInterval(intervalId);

									cnf.screenwaveWebApiToken = resp.data.data.apiToken;
									cnf.googleApiRefreshToken = resp.data.data.refreshToken;
									setCnfMulti(cnf);

									mainWindow.webContents.executeJavaScript("hideLoader();");
									mainWindow.focus();
								}
							});
					}, 5000);
				} else {
					//electron-log
					mainWindow.webContents.executeJavaScript(
						'hideLoader(); showError("Unable to connect with sign-in server. Please try again. <br> If you see this message every time please contact support")'
					);
				}
			})
			.catch((err) => {
				//electron-log
				mainWindow.webContents.executeJavaScript(
					'hideLoader(); showError("Unable to connect with sign-in server. Please try again. <br> If you see this message every time please contact support")'
				);
			});
	});
};
