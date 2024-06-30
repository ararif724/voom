const { default: axios } = require("axios");
const { BrowserWindow, ipcMain, shell } = require("electron");
const { setCnfMulti } = require("electron-cnf");

module.exports = function () {
	ipcMain.on("mainWindow:open", function () {
		if (typeof mainWindow != "undefined" && !mainWindow?.isDestroyed()) {
			mainWindow.focus();
		} else {
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

			log.info("App main window open");

			global.mainWindow = window;
		}
	});

	ipcMain.handle("mainWindow:showError", function (e, message) {
		mainWindow.webContents.executeJavaScript(
			'hideLoader(); showError("' + message + '");'
		);
	});

	ipcMain.handle("app:signIn", function () {
		log.info("Signing in");

		axios
			.get(atrecWebUrl + "/get-session-id")
			.then((resp) => {
				if (typeof resp.data.data.sessionId != "undefined") {
					const cookies = resp.headers["set-cookie"].map(
						(item) => item.split(";")[0]
					);
					const sessionId = resp.data.data.sessionId;

					shell.openExternal(atrecWebUrl + "/google-o-auth/" + sessionId);

					let totalCheckForSessionData = 0;
					const intervalId = setInterval(() => {
						if (totalCheckForSessionData++ >= 30) {
							clearInterval(intervalId);
							log.info("Sign-in session timeout");
							mainWindow.webContents.executeJavaScript(
								'hideLoader(); showError("Sign-in session timeout! Please try again.")'
							);
							return;
						}
						axios
							.get(atrecWebUrl + "/get-session-data/" + sessionId, {
								headers: {
									Cookie: cookies,
								},
							})
							.then((resp) => {
								log.info("Get session data resp:", resp.data);
								if (
									resp?.data?.data?.apiToken &&
									resp?.data?.data?.refreshToken
								) {
									clearInterval(intervalId);

									cnf.atrecWebApiToken = resp.data.data.apiToken;
									cnf.googleApiRefreshToken = resp.data.data.refreshToken;
									setCnfMulti(cnf);

									mainWindow.webContents.executeJavaScript("hideLoader();");
									mainWindow.focus();
								}
							})
							.catch((error) => {
								log.info(
									"Get session data resp:",
									error?.response?.data || error?.message
								);
							});
					}, 5000);
				} else {
					log.info("Get session ID resp:", resp.data);
					mainWindow.webContents.executeJavaScript(
						'hideLoader(); showError("Unable to connect with sign-in server. Please try again. <br> If you see this message every time please contact support")'
					);
				}
			})
			.catch((error) => {
				log.info(
					"Get session ID resp:",
					error?.response?.data || error?.message
				);
				mainWindow.webContents.executeJavaScript(
					'hideLoader(); showError("Unable to connect with sign-in server. Please check your internet connection and try again. <br> If you see this message every time please contact support")'
				);
			});
	});
};
