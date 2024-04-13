const { ipcRenderer, contextBridge } = require("electron");

ipcRenderer.on("config", (event, config) => {
	contextBridge.exposeInMainWorld("app", {
		config: config,
		enterDrawMode: () => ipcRenderer.invoke("canvasWindow:enterDrawMode"),
		stopRecord: (showLoader) => ipcRenderer.invoke("recording:stop", showLoader),
		showVideoUrl: (videoUrl) => ipcRenderer.invoke("recording:showVideoUrl", videoUrl),
	});
});
