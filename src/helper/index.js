const { app, shell } = require("electron");
const { setCnfMulti } = require("electron-cnf");
const electronAppUniversalProtocolClient =
	require("electron-app-universal-protocol-client").default;
const url = require("url");

function quitApp() {
	setCnfMulti(cnf);
	app.quit();
}

async function connectToGoogleDrive() {
	shell.openExternal(
		screenwaveWebUrl +
			"/google-o-auth/" +
			encodeURIComponent("ararif-screenwave://login")
	);

	electronAppUniversalProtocolClient.on("request", async (requestUrl) => {
		const queryData = url.parse(requestUrl, true).query;
		const apiInfo = JSON.parse(queryData.data);
		cnf = { ...cnf, ...apiInfo };
		setCnfMulti(cnf);
		mainWindow.focus();
	});

	await electronAppUniversalProtocolClient.initialize({
		protocol: "ararif-screenwave",
		mode: "production", // Make sure to use 'production' when script is executed in bundled app
	});
}

module.exports = { quitApp, connectToGoogleDrive };
