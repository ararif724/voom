const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("app", {
	signIn: () => ipcRenderer.invoke("app:signIn"),
	close: () => ipcRenderer.invoke("app:close"),
	openInBrowser: (url) => ipcRenderer.invoke("app:openInBrowser", url),
	getRecordingMode: () => ipcRenderer.invoke("app:getRecordingMode"),
	getVideoInDeviceId: () => ipcRenderer.invoke("app:getVideoInDeviceId"),
	getAudioInDeviceId: () => ipcRenderer.invoke("app:getAudioInDeviceId"),
	startRecording: (recordingMode, videoInDeviceId, audioInDeviceId) =>
		ipcRenderer.invoke(
			"recording:start",
			recordingMode,
			videoInDeviceId,
			audioInDeviceId
		),
});
