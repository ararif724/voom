let literallyCanvas;
$(document).ready(function () {
	let canvasConfig = { ...app.canvasConfig };

	const canvasTools = document.getElementById("canvas-tools");
	const mover = document.getElementById("mover");

	let offsetX,
		offsetY,
		isDragging = false;

	// Calculate initial position of toolbar
	if (canvasConfig.toolbarPosition.top !== null && canvasConfig.toolbarPosition.left !== null) {
		// Apply previous position
		canvasTools.style.top = `${canvasConfig.toolbarPosition.top}px`;
		canvasTools.style.left = `${canvasConfig.toolbarPosition.left}px`;
	} else {
		// Apply default position
		canvasTools.style.top = `${(window.innerHeight - canvasTools.offsetHeight) / 2}px`;
		canvasTools.style.left = "0";
	}

	mover.addEventListener("mousedown", (e) => {
		isDragging = true;
		offsetX = e.clientX - canvasTools.offsetLeft;
		offsetY = e.clientY - canvasTools.offsetTop;
		mover.style.cursor = "grabbing";
	});

	document.addEventListener("mousemove", (e) => {
		if (isDragging) {
			// Calculate new position with boundaries
			let newX = e.clientX - offsetX;
			let newY = e.clientY - offsetY;

			// Prevent going out of bounds
			newX = Math.max(0, Math.min(document.body.clientWidth - canvasTools.offsetWidth, newX));
			// Here we deduct 50px to avoid toolbar going behind the OS bottom panel (start menu bar)
			newY = Math.max(0, Math.min(document.body.clientHeight - canvasTools.offsetHeight - 50, newY));

			// Update config
			canvasConfig.toolbarPosition = { top: newY, left: newX };

			// Apply new position
			canvasTools.style.left = `${newX}px`;
			// if toolbar position is in upper part of the window then position it relatively to the top of the window
			// if toolbar position is in lower part of the window then position it relatively to the bottom of the window
			if (canvasConfig.toolbarPosition.top + canvasTools.offsetHeight / 2 < window.innerHeight / 2) {
				canvasTools.style.top = `${newY}px`;
				canvasTools.style.bottom = "";
			} else {
				canvasTools.style.top = "";
				canvasTools.style.bottom = `${window.innerHeight - canvasTools.offsetHeight - newY}px`;
			}
		}
	});

	document.addEventListener("mouseup", () => {
		isDragging = false;
		mover.style.cursor = "grab";
	});

	literallyCanvas = LC.init(document.querySelector("#canvas"), {
		primaryColor: canvasConfig.strokeColor,
		secondaryColor: canvasConfig.fillColor,
	});

	$("#tool-undo").on("click", function () {
		literallyCanvas.undo();
	});

	$("#tool-redo").on("click", function () {
		literallyCanvas.redo();
	});

	$("#tool-clear").on("click", function () {
		literallyCanvas.clear();
	});

	literallyCanvas.on("drawingChange", function () {
		$("#tool-undo").addClass("disabled");
		$("#tool-redo").addClass("disabled");

		if (literallyCanvas.undoStack.length > 0) {
			$("#tool-undo").removeClass("disabled");
		}

		if (literallyCanvas.redoStack.length > 0) {
			$("#tool-redo").removeClass("disabled");
		}
	});

	$(".tools .tool").on("click", function () {
		const tool = $(this).data("lc-tool");
		if (typeof LC.tools[tool] !== "undefined") {
			$(".tools .tool").removeClass("active");
			$(this).addClass("active");

			const lcTool = new LC.tools[tool](literallyCanvas);

			if ($(this).data("lc-options") !== undefined) {
				console.log($(this).data("lc-options"));
				const options = $(this).data("lc-options");
				for (const [key, value] of Object.entries(options)) {
					lcTool[key] = value;
				}
			}

			literallyCanvas.setTool(lcTool);
		}
	});

	$(".tools .tool:first").trigger("click");

	$(".color-picker").each(function () {
		const pickr = Pickr.create({
			el: $(this).children(".pickr").get(0),
			theme: "nano",
			default: this.id == "fill" ? canvasConfig.fillColor : canvasConfig.strokeColor,
			components: {
				preview: true,
				opacity: true,
				hue: true,
				interaction: {
					input: true,
					save: true,
				},
			},
		});

		pickr.on("save", (color) => {
			if (this.id == "fill") {
				canvasConfig.fillColor = color.toHEXA().toString();
				literallyCanvas.setColor("secondary", canvasConfig.fillColor);
			} else {
				canvasConfig.strokeColor = color.toHEXA().toString();
				literallyCanvas.setColor("primary", canvasConfig.strokeColor);
			}
		});
	});

	$(".app-close").click(() => app.exitDrawMode(canvasConfig)); // exit draw mode
	$(".app-minimize").click(function () {
		$(".tools").slideUp();
		$(this).hide();
		$(".app-maximize").show();
	});

	$(".app-maximize").click(function () {
		$(".tools").slideDown();
		$(this).hide();
		$(".app-minimize").show();
	});
});
