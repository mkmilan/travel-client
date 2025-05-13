// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors"); // Import base colors

module.exports = {
	darkMode: "class",
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// Define our custom palette
				primary: {
					// Example using Tailwind's Sky blue
					DEFAULT: colors.sky[600], // Main blue
					light: colors.sky[500],
					dark: colors.sky[700],
				},
				secondary: {
					// Example using Teal
					DEFAULT: colors.teal[500],
					light: colors.teal[400],
					dark: colors.teal[600],
				},
				accent: {
					// Example using Amber for contrast maybe? Or keep simple
					DEFAULT: colors.amber[500],
				},
				// Keep neutral grays, maybe adjust slightly if needed
				gray: colors.neutral, // Using 'neutral' often feels nicer than default gray
			},
			borderRadius: {
				// Override default rounding
				none: "0",
				sm: "0.125rem", // Keep sm if needed somewhere?
				DEFAULT: "0", // Default to 0
				md: "0",
				lg: "0",
				xl: "0",
				"2xl": "0",
				"3xl": "0",
				full: "9999px", // Keep full for avatars
			},
		},
	},
	plugins: [
		require("tailwind-scrollbar"),
		require("@tailwindcss/typography"),
		// Add other plugins like @tailwindcss/forms if needed later
	],
};
