import {
	getStream,
	sendVideoToWeb,
	getGoogleDriveResumableUploadUrl,
} from "./recodingWindowHelper.js";
$(function () {
	startRecording();

	$("#pen").removeClass("disabled");
	$("#pen").attr("title", "");
	if (app.config.recordingMode == "camera") {
		$("#pen").attr("title", "Pen not available in camera mode");
		$("#pen").addClass("disabled");
	}

	$("#pen").click(() => {
		if (app.config.recordingMode != "camera") {
			app.enterDrawMode();
		}
	});

	let timeRecorded = 0; //in seconds
	let timeRecordedIntervalId = null;

	function startTimer() {
		timeRecordedIntervalId = setInterval(() => {
			timeRecorded++;
			let minute = parseInt(timeRecorded / 60);
			if (minute < 10) {
				minute = "0" + minute;
			}

			let seconds = parseInt(timeRecorded % 60);
			if (seconds < 10) {
				seconds = "0" + seconds;
			}
			let timeString = `${minute}:${seconds}`;
			$("#timeRecorded").html(timeString);
		}, 1000);
	}

	function stopTimer() {
		clearInterval(timeRecordedIntervalId);
	}

	function stopRecordWithError(
		logData = null,
		showErrorText = null,
		showSignIn = false
	) {
		app.stopRecord(false, showSignIn);
		if (logData !== null) {
			if (typeof logData == "object") {
				__electronLog.info(...logData);
			} else {
				__electronLog.info(logData);
			}
		}
		if (showErrorText !== null && !showSignIn) {
			app.showError(showErrorText);
		}
	}

	async function startRecording() {
		try {
			let recordedBlob = new Blob();
			let retriedUpload = 0;
			const recorderRequestDataInterval = 5000; //in milliseconds
			const googleDriveUploadChunkSize = 262144; //in byte
			const stream = await getStream();
			const recorder = new MediaRecorder(stream, {
				mimeType: "video/webm; codecs=vp9",
			});

			const recorderRequestDataIntervalId = setInterval(() => {
				recorder.requestData();
			}, recorderRequestDataInterval);

			recorder.ondataavailable = (e) => {
				recordedBlob = new Blob([recordedBlob, e.data]);
			};

			recorder.onstop = async (e) => {
				clearInterval(recorderRequestDataIntervalId);
			};

			recorder.start();
			startTimer();

			function stopRecord(showLoader) {
				if (recorder.state === "recording" || recorder.state === "paused") {
					recorder.stop();
					app.stopRecord(showLoader);
				}
			}

			$("#stop").click(() => stopRecord(true));
			$("#delete").click(() => stopRecord());

			$("#pauseResume").click(function () {
				if (recorder.state === "recording") {
					recorder.pause();
					stopTimer();
					$("#pauseResume i")
						.removeClass("fa-circle-pause")
						.addClass("fa-circle-play");
				} else if (recorder.state === "paused") {
					recorder.resume();
					startTimer();
					$("#pauseResume i")
						.removeClass("fa-circle-play")
						.addClass("fa-circle-pause");
				}
			});

			const googleDriveResumableUploadUrl =
				await getGoogleDriveResumableUploadUrl();

			async function uploadToGoogleDrive(fromByte = 0) {
				let toByte = fromByte + googleDriveUploadChunkSize;
				let totalByte = "*";

				if (recorder.state == "inactive") {
					totalByte = recordedBlob.size;
					toByte = recordedBlob.size;
				}

				if (
					recorder.state != "inactive" &&
					recordedBlob.size < fromByte + googleDriveUploadChunkSize
				) {
					setTimeout(() => {
						uploadToGoogleDrive(fromByte);
					}, recorderRequestDataInterval);
					return;
				}

				try {
					const blobChunkToUpload = recordedBlob.slice(fromByte, toByte);

					const resp = await axios.put(
						googleDriveResumableUploadUrl,
						blobChunkToUpload,
						{
							headers: {
								"Content-Range": `bytes ${fromByte}-${toByte - 1}/${totalByte}`,
							},
						}
					);

					if (typeof resp.data.id != "undefined") {
						try {
							const sendVideoToWebResponse = await sendVideoToWeb(resp.data.id);
							if (
								typeof sendVideoToWebResponse.data.data.videoUrl != "undefined"
							) {
								app.showVideoUrl(sendVideoToWebResponse.data.data.videoUrl);
							} else {
								stopRecordWithError(
									["atrec web error:", sendVideoToWebResponse?.data],
									"Video uploaded to google drive successfully but unable to generate web link. <br> You may share the video directly from google drive."
								);
							}
						} catch (err) {
							stopRecordWithError(
								["atrec web error:", err?.response?.data || err?.message],
								"Video uploaded to google drive successfully but unable to generate web link. <br> You may share the video directly from google drive."
							);
						}
					} else {
						stopRecordWithError(
							["Google drive upload finish error:", resp?.data],
							"An unexpected error occurred"
						);
					}
				} catch (resp) {
					if (resp?.response?.status == 308) {
						retriedUpload = 0;
						uploadToGoogleDrive(
							parseInt(resp.response.headers.range.split("-")[1]) + 1
						);
					} else {
						if (retriedUpload <= 5) {
							uploadToGoogleDrive(fromByte);
						} else {
							stopRecordWithError(
								["Google drive error:", resp?.response?.data || resp?.message],
								"An unexpected error occurred"
							);
						}
						retriedUpload++;
					}
				}
			}

			uploadToGoogleDrive();
		} catch (error) {
			stopRecordWithError(
				[
					"Recording window error: ",
					error?.response?.data || error?.message || JSON.stringify(error),
				],
				"An unexpected error occurred",
				error?.response?.status === 401
			);
		}
	}
});
