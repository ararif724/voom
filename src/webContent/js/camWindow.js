$(async function () {
	if (app.config.recordingMode == "screen-camera") {
		$("#cam-video").addClass("screen-camera-mode");
	} else {
		$("#cam-video").removeClass("screen-camera-mode");
	}

	const constraints = {
		video: {
			deviceId: app.config.videoInDeviceId,
		},
		audio: false,
	};

	const stream = await navigator.mediaDevices.getUserMedia(constraints);
	const camVideo = $("#cam-video")[0];
	camVideo.srcObject = stream;
	camVideo.play();

	$("#cam-video").addClass("ready");
});
