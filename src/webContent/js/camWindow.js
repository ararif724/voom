$(async function () {
	if (app.config.recordingMode == "screen-camera") {
		// we use screen-camera-mode class to apply rounded camera window
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

	// add ready class to cam-video to apply css transitions to camera window
	$("#cam-video").addClass("ready");
});
