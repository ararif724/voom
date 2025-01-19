$(function () {
	let videoInDeviceId = app.config.videoInDeviceId;
	let audioInDeviceId = app.config.audioInDeviceId;
	let recordingMode = app.config.recordingMode;

	loadMediaDevices(videoInDeviceId, audioInDeviceId); // load media devices

	$(".app-close").click(() => app.close()); // close app
	$(".app-minimize").click(() => app.minimize()); // minimize app

	// select recording mode
	$(".recording-mode-list li").click(function () {
		$(".recording-mode-list li").removeClass("active");
		$(this).addClass("active");
		recordingMode = $(this).data("recording-mode");
	});

	//select default recording mode
	$(`.recording-mode-list li[data-recording-mode='${recordingMode}']`).click();

	//Show webcam or microphone drop down
	$(".select-box").click(function () {
		$(this).find(".select-options-list").toggleClass("hidden");
		if (!$(this).find(".select-options-list").hasClass("hidden")) {
			loadMediaDevices(videoInDeviceId, audioInDeviceId);
		}
	});

	//select webcam or microphone
	$(".select-options-list ul").on("click", "li", function () {
		$(this).parents(".select-box").data("value", $(this).data("value")).find(".selected-option-label").text($(this).text());
		if ($(this).parents(".select-box").attr("id") === "webcam-selection") {
			videoInDeviceId = $(this).data("value");
		} else {
			audioInDeviceId = $(this).data("value");
		}
	});

	//start recording
	$(".recording-btn").click(async () => {
		app.startRecording(recordingMode, videoInDeviceId, audioInDeviceId);
	});

	//open in browser
	$("a").click(function (e) {
		e.preventDefault();
		app.openInBrowser($(this).attr("href"));
	});

	//sign in
	$("#sign-in-btn").click(function () {
		$("#sign-in").addClass("hidden");
		showLoader();
		app.signIn();
	});

	//close popup
	$(".popup").click(function (e) {
		if (e.target.classList.contains("popup") && !e.target.classList.contains("static-backdrop")) {
			$(this).addClass("hidden");
		}
	});

	//load sponsor text
	axios.get(app.config.atrecWebUrl + "/api/sponsor-text").then((resp) => {
		let sponsorText = resp.data
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/\[(http[^\]]+)\]\(([^\)]+)\)/g, "<a href='$1'>$2</a>");

		$(".sponsor-text").html(sponsorText);
	});

	//show sign in popup if user is not signed in
	if (app.config.notSignedIn) {
		showSignIn();
	}
});

/**
 * load media devices
 * @param {*} videoInDeviceId - selected video input media device
 * @param {*} audioInDeviceId - selected audio input media device
 */
async function loadMediaDevices(videoInDeviceId, audioInDeviceId) {
	const mediaDevices = await navigator.mediaDevices.enumerateDevices(); // get media devices

	$("#webcam-selection .select-options-list ul").html(""); // clear camera list
	$("#microphone-selection .select-options-list ul").html("<li data-value=''>No Microphone</li>"); // clear microphone list

	//load audio and video input media devices list on mainWindow
	for (const mediaDevice of mediaDevices) {
		if (mediaDevice.kind == "videoinput") {
			$("#webcam-selection .select-options-list ul").append(`<li data-value='${mediaDevice.deviceId}'>${mediaDevice.label}</li>`); // append camera
		} else if (mediaDevice.kind == "audioinput") {
			$("#microphone-selection .select-options-list ul").append(`<li data-value='${mediaDevice.deviceId}'>${mediaDevice.label}</li>`); // append microphone
		}
	}

	let selectedWebcam = $(`#webcam-selection .select-options-list ul li[data-value='${videoInDeviceId}']`); // select previously selected camera
	let selectedMicrophone = $(`#microphone-selection .select-options-list ul li[data-value='${audioInDeviceId}']`); // select previously selected microphone

	if (selectedWebcam.length == 0) {
		// select first camera if previously selected camera is not found
		selectedWebcam = $("#webcam-selection .select-options-list ul li").first();
	}

	if (selectedMicrophone.length == 0) {
		// select first microphone if previously selected microphone is not found
		selectedMicrophone = $("#microphone-selection .select-options-list ul li").first();
	}

	//Update Webcam and Microphone labels using selected camera and microphone name
	selectedWebcam.parents(".select-box").data("value", selectedWebcam.data("value")).find(".selected-option-label").text(selectedWebcam.text());
	selectedMicrophone
		.parents(".select-box")
		.data("value", selectedMicrophone.data("value"))
		.find(".selected-option-label")
		.text(selectedMicrophone.text());
}

// show loader
function showLoader() {
	$("#processing").removeClass("hidden");
}

// hide loader
function hideLoader() {
	$("#processing").addClass("hidden");
}

// show video url
function showVideoUrl(url) {
	$("#video-url").addClass("show");
	$("#video-url textarea").val(url).select();
	navigator.clipboard.writeText(url);
}

// show errors
function showError(message, title = "Oops! something went wrong") {
	if (message == "") {
		message = "We encountered an error while trying to process your request.";
	}
	$("#error .error-title").html(title);
	$("#error .error-message").html(message);
	$("#error").removeClass("hidden");
}

// show sign in
function showSignIn() {
	$("#sign-in").removeClass("hidden");
}
