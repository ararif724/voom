let googleAPIAuthToken = null;

async function getStream() {
	let stream = null;

	if (app.config.recordingMode != "camera") {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: "desktop",
					chromeMediaSourceId: app.config.screenRecordSourceId,
				},
			},
		});
	} else {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				deviceId: app.config.videoInDeviceId,
			},
		});
	}

	if (app.config.audioInDeviceId) {
		//attach audio track to the screen stream
		const audioStream = await navigator.mediaDevices.getUserMedia({
			audio: {
				deviceId: app.config.audioInDeviceId,
			},
			video: false,
		});

		stream.addTrack(audioStream.getAudioTracks()[0]);
	}

	return stream;
}

async function getGoogleApiAuthToken() {
	if (googleAPIAuthToken == null) {
		const getAuthTokenResponse = await axios.post(
			app.config.atrecWebUrl + "/api/generate-google-api-auth-token",
			{
				refreshToken: app.config.googleApiRefreshToken,
			},
			{
				headers: {
					apiToken: app.config.atrecWebApiToken,
				},
			}
		);

		if (typeof getAuthTokenResponse.data.data.access_token == "undefined") {
			throw new Error("Unable to generate google api auth token");
		}

		googleAPIAuthToken = getAuthTokenResponse.data.data.access_token;

		setTimeout(() => {
			googleAPIAuthToken = null;
		}, 3000);
	}

	return googleAPIAuthToken;
}

async function getGoogleDriveResumableUploadUrl() {
	const authToken = await getGoogleApiAuthToken();

	const getUploadFolderResponse = await axios.get(
		"https://www.googleapis.com/drive/v3/files?q=name%20%3D%20'atrec'%20and%20mimeType%20%3D%20'application%2Fvnd.google-apps.folder'",
		{
			headers: {
				Authorization: "Bearer " + authToken,
				"Content-Type": "application/json",
			},
		}
	);

	let uploadFolderId = getUploadFolderResponse?.data?.files[0]?.id;

	if (!uploadFolderId) {
		const createUploadFolderResponse = await axios.post(
			"https://www.googleapis.com/drive/v3/files",
			{
				name: "atrec",
				mimeType: "application/vnd.google-apps.folder",
			},
			{
				headers: {
					Authorization: "Bearer " + authToken,
					"Content-Type": "application/json",
				},
			}
		);

		if (typeof createUploadFolderResponse.data.id == "undefined") {
			throw new Error("Unable to generate google drive upload folder");
		}

		uploadFolderId = createUploadFolderResponse.data.id;
	}

	const createResumableUploadResponse = await axios.post(
		"https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
		{
			name: `atrec-${Date.now()}.webm`,
			mimeType: "video/webm; codecs=vp9",
			parents: [uploadFolderId],
		},
		{
			headers: {
				Authorization: "Bearer " + authToken,
				"Content-Type": "application/json",
			},
		}
	);

	if (typeof createResumableUploadResponse.headers.location == "undefined") {
		throw new Error("Unable to generate google drive resumable upload url");
	}

	return createResumableUploadResponse.headers.location;
}

async function sendVideoToWeb(videoId) {
	const authToken = await getGoogleApiAuthToken();

	await axios.post(
		`https://www.googleapis.com/drive/v3/files/${videoId}/permissions`,
		{
			type: "anyone",
			role: "reader",
		},
		{
			headers: {
				Authorization: "Bearer " + authToken,
				"Content-Type": "application/json",
			},
		}
	);

	const sendVideoToWeb = await axios.post(
		app.config.atrecWebUrl + "/api/save-video",
		{
			refreshToken: app.config.googleApiRefreshToken,
			videoId: videoId,
		},
		{
			headers: {
				apiToken: app.config.atrecWebApiToken,
			},
		}
	);

	return sendVideoToWeb;
}

export { getStream, getGoogleDriveResumableUploadUrl, sendVideoToWeb };
