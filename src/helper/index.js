const { app, shell } = require("electron");
const { setCnfMulti } = require("electron-cnf");

function quitApp() {
	setCnfMulti(cnf);
	app.quit();
}

module.exports = { quitApp };
