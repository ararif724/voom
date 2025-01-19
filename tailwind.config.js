/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/webContent/**/*.{html,js}"],
	theme: {
		extend: {
			colors: { primary: "#7A3FF6", "primary-hover": "#EDE5FF", "btn-primary": "#541bcd", "btn-primary-hover": "#7A3FF6" },
			fontSize: { md: "17px" },
		},
	},
	plugins: [],
};
