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
			newY = Math.max(0, Math.min(document.body.clientHeight - canvasTools.offsetHeight, newY));

			// Update config
			canvasConfig.toolbarPosition = { top: newY, left: newX };

			// Apply new position
			canvasTools.style.left = `${newX}px`;
			canvasTools.style.top = `${newY}px`;
		}
	});

	document.addEventListener("mouseup", () => {
		isDragging = false;
		mover.style.cursor = "grab";
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

		pickr.on("save", (color, instance) => {
			if (this.id == "fill") {
				canvasConfig.fillColor = color.toHEXA().toString();
			} else {
				canvasConfig.strokeColor = color.toHEXA().toString();
			}
		});
	});

	$(".app-close").click(() => app.exitDrawMode(canvasConfig)); // exit draw mode

	var lc = LC.init(document.querySelector("#canvas"), {
		backgroundColor: "transparent",
	});
	return;
	var tools = [
		{
			name: "pencil",
			el: document.getElementById("tool-pencil"),
			tool: new LC.tools.Pencil(lc),
		},
		{
			name: "eraser",
			el: document.getElementById("tool-eraser"),
			tool: new LC.tools.Eraser(lc),
		},
	];

	var activateTool = function (t) {
		lc.setTool(t.tool);

		tools.forEach(function (t2) {
			if (t == t2) {
				t2.el.style.backgroundColor = "yellow";
			} else {
				t2.el.style.backgroundColor = "transparent";
			}
		});
	};

	tools.forEach(function (t) {
		t.el.style.cursor = "pointer";
		t.el.onclick = function (e) {
			e.preventDefault();
			activateTool(t);
		};
	});
	activateTool(tools[0]);
});
