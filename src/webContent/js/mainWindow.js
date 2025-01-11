document.head.insertAdjacentHTML(
	"beforeend",
	`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; connect-src ${app.config.atrecWebUrl}" />`
);
document.head.insertAdjacentHTML(
	"beforeend",
	`<meta http-equiv="X-Content-Security-Policy" content="default-src 'self'; script-src 'self'; connect-src ${app.config.atrecWebUrl}" />`
);

$(function () {
	let videoInDeviceId = app.config.videoInDeviceId;
	let audioInDeviceId = app.config.audioInDeviceId;
	let recordingMode = app.config.recordingMode;

	loadMediaDevices(true);

	$(".app-close").click(() => app.close());
	$(".app-minimize").click(() => app.minimize());

	$(".recording-mode-list li").click(function () {
		$(".recording-mode-list li").removeClass("active");
		$(this).addClass("active");
		recordingMode = $(this).data("recording-mode");
	});

	$(`.recording-mode-list li[data-recording-mode='${recordingMode}']`).click();

	$(".select-box").click(function () {
		$(this).find(".select-options-list").toggleClass("hidden");
		if (!$(this).find(".select-options-list").hasClass("hidden")) {
			loadMediaDevices();
		}
	});

	$(".select-options-list ul").on("click", "li", function () {
		$(this).parents(".select-box").data("value", $(this).data("value")).find(".selected-option-label").text($(this).text());
		if ($(this).parents(".select-box").attr("id") === "webcam-selection") {
			videoInDeviceId = $(this).data("value");
		} else {
			audioInDeviceId = $(this).data("value");
		}
	});

	$(".recording-btn").click(async () => {
		app.startRecording(recordingMode, videoInDeviceId, audioInDeviceId);
	});

	$(".sponsor-text a").click(function (e) {
		e.preventDefault();
		app.openInBrowser($(this).attr("href"));
	});

	$("#sign-in-btn").click(function () {
		$("#sign-in-promt").removeClass("show");
		showLoader();
		app.signIn();
	});

	async function loadMediaDevices() {
		const mediaDevices = await navigator.mediaDevices.enumerateDevices();

		$("#webcam-selection .select-options-list ul").html("");
		$("#microphone-selection .select-options-list ul").html("<li data-value=''>No Microphone</li>");

		//load audio and video input media devices list on mainWindow
		for (const mediaDevice of mediaDevices) {
			if (mediaDevice.kind == "videoinput") {
				$("#webcam-selection .select-options-list ul").append(`<li data-value='${mediaDevice.deviceId}'>${mediaDevice.label}</li>`);
			} else if (mediaDevice.kind == "audioinput") {
				$("#microphone-selection .select-options-list ul").append(`<li data-value='${mediaDevice.deviceId}'>${mediaDevice.label}</li>`);
			}
		}

		let selectedWebcam = $(`#webcam-selection .select-options-list ul li[data-value='${videoInDeviceId}']`);
		let selectedMicrophone = $(`#microphone-selection .select-options-list ul li[data-value='${audioInDeviceId}']`);

		if (selectedWebcam.length == 0) {
			selectedWebcam = $("#webcam-selection .select-options-list ul li").first();
		}

		if (selectedMicrophone.length == 0) {
			selectedMicrophone = $("#microphone-selection .select-options-list ul li").first();
		}

		selectedWebcam.parents(".select-box").data("value", selectedWebcam.data("value")).find(".selected-option-label").text(selectedWebcam.text());
		selectedMicrophone
			.parents(".select-box")
			.data("value", selectedMicrophone.data("value"))
			.find(".selected-option-label")
			.text(selectedMicrophone.text());
	}

	$(".popup").click(function (e) {
		if (e.target.classList.contains("popup") && !e.target.classList.contains("static-backdrop")) {
			$(this).removeClass("show");
		}
	});

	axios.get(app.config.atrecWebUrl + "/api/sponsor-text").then((resp) => {
		let sponsorText = resp.data
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/\[(http[^\]]+)\]\(([^\)]+)\)/g, "<a href='$1'>$2</a>");

		$(".sponsor-text").html(sponsorText);
	});
});

function showLoader() {
	$("#loader").addClass("show");
}
function hideLoader() {
	$("#loader").removeClass("show");
}
function showVideoUrl(url) {
	$("#video-url").addClass("show");
	$("#video-url textarea").val(url).select();
	navigator.clipboard.writeText(url);
}
function showError(message) {
	$("#error .error-message").html(message);
	$("#error").addClass("show");
}
function showSignIn() {
	$("#sign-in-promt").addClass("show");
}
