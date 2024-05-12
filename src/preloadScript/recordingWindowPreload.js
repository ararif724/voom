const { ipcRenderer, contextBridge } = require("electron");

ipcRenderer.on("config", (event, config) => {
	contextBridge.exposeInMainWorld("app", {
		config: config,
		enterDrawMode: () => ipcRenderer.invoke("canvasWindow:enterDrawMode"),
		stopRecord: (showLoader, showSignIn) => ipcRenderer.invoke("recording:stop", showLoader, showSignIn),
		showError: (message) => ipcRenderer.invoke("mainWindow:showError", message),
		showVideoUrl: (videoUrl) => ipcRenderer.invoke("recording:showVideoUrl", videoUrl),
	});
});
