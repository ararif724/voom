/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/webContent/**/*.html"],
	theme: {
		extend: {
			colors: { primary: "#7A3FF6", "primary-hover": "#EDE5FF" },
			fontSize: { md: "17px" },
		},
	},
	plugins: [],
};
