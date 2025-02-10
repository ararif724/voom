let literallyCanvas;
$(document).ready(function () {
	let canvasConfig = { ...app.canvasConfig };

	const canvasTools = document.getElementById("canvas-tools");
	const mover = document.getElementById("mover");
	const lcTools = {}; // keeps tools instances
	/**
	 * Text tool font options.
	 * Don't change the order
	 * It will converted to css font rule. Example: "normal normal 16px sans-serif"
	 */
	const lcFont = { fontStyle: "normal", fontWeight: "normal", fontSize: "16px", fontFamily: "sans-serif" };

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

	function setTool(tool, options = {}) {
		if (typeof lcTools[tool] == "undefined") {
			lcTools[tool] = new LC.tools[tool](literallyCanvas);
			if (tool == "Text") {
				setFont();
			}
		}

		for (const [key, value] of Object.entries(options)) {
			lcTools[tool][key] = value; // set tool options. Like dashed for Line tool
		}

		literallyCanvas.setTool(lcTools[tool]);
	}

	function setFont() {
		if (typeof lcTools.Text != "undefined") {
			lcTools.Text.font = Object.values(lcFont).join(" "); // convert font object to css rule like "normal normal 16px sans-serif"
		}
	}

	$("#tool-undo").click(function () {
		literallyCanvas.undo();
	});

	$("#tool-redo").click(function () {
		literallyCanvas.redo();
	});

	$("#tool-clear").click(function () {
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

	literallyCanvas.on("toolChange", function () {
		if (literallyCanvas.tool.name == "Text") {
			$("#stroke-and-text-size").val(parseInt(lcFont.fontSize));
		} else {
			$("#stroke-and-text-size").val(literallyCanvas.tool.strokeWidth);
		}
		$("#stroke-and-text-size").trigger("input");
	});

	$(".tools .tool").click(function () {
		const tool = $(this).data("lc-tool");
		if (typeof LC.tools[tool] !== "undefined") {
			$(".tools .tool").removeClass("active");
			$(this).addClass("active");
			setTool(tool, $(this).data("lc-options") ?? {});
		}
	});

	$(`.sub-tools`).each(function () {
		$(this).css({ width: $(this).prop("offsetWidth") });
		$(this).addClass("inactive");
	});

	$(`.sub-tools`).addClass("duration-300");

	$(document).click(function (e) {
		$(`.sub-tools`).addClass("inactive");
	});

	$(".tools .tool .show-sub-tools").click(function (e) {
		e.stopPropagation();
		const subTools = $(this).data("show-sub-tools");
		if ($(`.sub-tools[data-sub-tools-id="${subTools}"]`).hasClass("inactive")) {
			$(`.sub-tools`).addClass("inactive");
			$(`.sub-tools[data-sub-tools-id="${subTools}"]`).removeClass("inactive");
		} else {
			$(`.sub-tools`).addClass("inactive");
		}
	});

	$(".tools .sub-tools .sub-tool").click(function () {
		$(".tools .tool").removeClass("active");
		$(this).addClass("active").siblings().removeClass("active");
		const subTools = $(this).parents(".sub-tools").data("sub-tools-id");
		const tool = $(`.tools .tool img[data-show-sub-tools="${subTools}"]`).parents(".tool");
		tool.data("lc-tool", $(this).data("lc-tool"));
		tool.data("lc-options", $(this).data("lc-options") ?? {});
		tool.children("img:not(.show-sub-tools)").attr("src", $(this).children("img").attr("src"));
		tool.addClass("active");
		setTool($(this).data("lc-tool"), $(this).data("lc-options") ?? {});
	});

	$(".tools .sub-tools").click(function (e) {
		e.stopPropagation();
	});

	$(".tools .tool:first").trigger("click");

	$("#stroke-and-text-size").on("input", function () {
		if ($(this).val() != "") {
			let size = parseInt($(this).val());

			if (size < 1) {
				size = 1;
			} else if (size > 999) {
				size = 999;
			}

			if (literallyCanvas.tool.name == "Text") {
				lcFont.fontSize = `${size}px`;
				setFont();
			} else {
				literallyCanvas.tool.strokeWidth = size;
			}
			$(".stroke-and-text-size").text(`${size}px`);
			$(this).val(size);
		}
	});

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
		$(this).parents(".rounded-t-lg").addClass("rounded-lg");
		$(this).hide();
		$(".app-maximize").show();
	});

	$(".app-maximize").click(function () {
		$(".tools").slideDown();
		$(this).parents(".rounded-t-lg").removeClass("rounded-lg");
		$(this).hide();
		$(".app-minimize").show();
	});
});
