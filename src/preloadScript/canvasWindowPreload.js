const { ipcRenderer, contextBridge } = require("electron");

ipcRenderer.on("canvasConfig", (event, canvasConfig) => {
	contextBridge.exposeInMainWorld("app", {
		canvasConfig: canvasConfig,
		exitDrawMode: (canvasConfig) => ipcRenderer.invoke("canvasWindow:exitDrawMode", canvasConfig),
	});
});