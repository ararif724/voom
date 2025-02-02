$(document).ready(function () {
	$(".color-picker").each(function () {
		Pickr.create({
			el: this,
			theme: "nano",
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
	});

	const canvasTools = document.getElementById("canvas-tools");
	const mover = document.getElementById("mover");

	let offsetX,
		offsetY,
		isDragging = false;

	// Calculate initial position to vertically center the page
	const bodyHeight = window.innerHeight;
	const elemHeight = canvasTools.offsetHeight;
	const top = (bodyHeight - elemHeight) / 2;
	canvasTools.style.top = `${top}px`;
	canvasTools.style.right = "0";

	mover.addEventListener("mousedown", (e) => {
		isDragging = true;
		offsetX = e.clientX - canvasTools.offsetLeft;
		offsetY = e.clientY - canvasTools.offsetTop;
		mover.style.cursor = "grabbing";
	});

	document.addEventListener("mousemove", (e) => {
		if (isDragging) {
			const bodyWidth = document.body.clientWidth;
			const bodyHeight = document.body.clientHeight;
			const elemWidth = canvasTools.offsetWidth;
			const elemHeight = canvasTools.offsetHeight;

			// Calculate new position with boundaries
			let newX = e.clientX - offsetX;
			let newY = e.clientY - offsetY;

			// Prevent going out of bounds
			newX = Math.max(0, Math.min(bodyWidth - elemWidth, newX));
			newY = Math.max(0, Math.min(bodyHeight - elemHeight, newY));

			// Apply new position
			canvasTools.style.left = `${newX}px`;
			canvasTools.style.top = `${newY}px`;
		}
	});

	document.addEventListener("mouseup", () => {
		isDragging = false;
		mover.style.cursor = "grab";
	});

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
