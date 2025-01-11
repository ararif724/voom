const { ipcRenderer, contextBridge } = require("electron");

ipcRenderer.on("config", (event, config) => {
	contextBridge.exposeInMainWorld("app", {
		config: config,
		signIn: () => ipcRenderer.invoke("app:signIn"),
		close: () => ipcRenderer.invoke("app:close"),
		minimize: () => ipcRenderer.invoke("app:minimize"),
		openInBrowser: (url) => ipcRenderer.invoke("app:openInBrowser", url),
		startRecording: (recordingMode, videoInDeviceId, audioInDeviceId) =>
			ipcRenderer.invoke("recording:start", recordingMode, videoInDeviceId, audioInDeviceId),
	});
});
