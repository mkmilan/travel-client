import React from "react";

const LoadingComponent = () => {
	// Basic CSS for a simple spinner
	// For a real application, move this to a .css file and import it
	// or use a CSS-in-JS solution or Tailwind CSS classes.
	const spinnerStyle = {
		border: "4px solid rgba(0, 0, 0, 0.1)",
		width: "36px",
		height: "36px",
		borderRadius: "50%",
		borderLeftColor: "#09f", // Or your theme color
		animation: "spin 1s ease infinite",
	};

	// Keyframes for the animation (would typically be in a CSS file)
	// You might need to inject this globally or use a library if doing it purely in JS
	// For now, this is conceptual for the component file.
	// A better way is to define @keyframes spin in a global CSS file.
	// @keyframes spin { to { transform: rotate(360deg); } }

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100%",
			}}
		>
			<style>
				{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
			</style>
			<div style={spinnerStyle}></div>
		</div>
	);
};

export default LoadingComponent;
