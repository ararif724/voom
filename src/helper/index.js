const { app, shell } = require("electron");
const { default: axios } = require("axios");
const { setCnfMulti } = require("electron-cnf");

function quitApp() {
	setCnfMulti(cnf);
	app.quit();
}

function openInBrowser(url) {
	log.info("Opening url in browser", url);

	if (["https:", "http:"].includes(new URL(url).protocol)) {
		shell.openExternal(url);
	} else {
		log.info("Unsupported url scheme");
	}
}

function signIn() {
	log.info("Signing in");

	axios
		.get(atrecWebUrl + "/api/get-session-id")
		.then((resp) => {
			if (typeof resp.data.data.sessionId != "undefined") {
				const cookies = resp.headers["set-cookie"].map((item) => item.split(";")[0]);
				const sessionId = resp.data.data.sessionId;

				openInBrowser(atrecWebUrl + "/google-o-auth/" + sessionId);

				let totalCheckForSessionData = 0;
				const intervalId = setInterval(() => {
					if (totalCheckForSessionData++ >= 30) {
						clearInterval(intervalId);
						log.info("Sign-in session timeout");
						mainWindow.webContents.executeJavaScript(
							'hideLoader(); showError("Sign-in session timeout! Please try again.", "Sign-in session timeout!")'
						);
						return;
					}
					axios
						.get(atrecWebUrl + "/api/get-session-data/" + sessionId, {
							headers: {
								Cookie: cookies,
							},
						})
						.then((resp) => {
							log.info("Get session data resp:", resp.data);
							if (resp?.data?.data?.apiToken && resp?.data?.data?.refreshToken) {
								clearInterval(intervalId);

								cnf.atrecWebApiToken = resp.data.data.apiToken;
								cnf.googleApiRefreshToken = resp.data.data.refreshToken;
								setCnfMulti(cnf);

								mainWindow.webContents.executeJavaScript("hideLoader();");
								mainWindow.focus();
							}
						})
						.catch((error) => {
							log.info("Get session data resp:", error?.response?.data || error?.message);
						});
				}, 5000);
			} else {
				log.info("Get session ID resp:", resp.data);
				mainWindow.webContents.executeJavaScript(
					'hideLoader(); showError("Please try again after some time or contact support for help", "Unable to connect sign in server!")'
				);
			}
		})
		.catch((error) => {
			log.info("Get session ID resp:", error?.response?.data || error?.message);
			mainWindow.webContents.executeJavaScript(
				'hideLoader(); showError("Please try again after some time or contact support for help", "Unable to connect sign in server!")'
			);
		});
}

module.exports = { quitApp, openInBrowser, signIn };
