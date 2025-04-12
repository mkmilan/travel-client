// src/utils/formatters.js

/**
 * Formats total seconds into HH:MM:SS string.
 * @param {number} totalSeconds
 * @returns {string} Formatted time string.
 */
export const formatTime = (totalSeconds) => {
	if (typeof totalSeconds !== "number" || totalSeconds < 0) return "00:00:00";
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = Math.floor(totalSeconds % 60);
	return `${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Formats duration in milliseconds to a human-readable string (e.g., Xh Ym).
 * @param {number} millis - Duration in milliseconds.
 * @returns {string} Formatted duration string or 'N/A'.
 */
export const formatDuration = (millis) => {
	if (typeof millis !== "number" || millis < 0) return "N/A";
	const totalSeconds = Math.floor(millis / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	// Optionally add seconds if needed: const seconds = totalSeconds % 60;
	if (hours === 0 && minutes === 0) return "< 1m"; // Handle very short durations
	let result = "";
	if (hours > 0) result += `${hours}h `;
	if (minutes > 0) result += `${minutes}m`;
	return result.trim();
};

/**
 * Formats distance in meters to kilometers with one decimal place.
 * @param {number} meters - Distance in meters.
 * @returns {string} Formatted distance string (e.g., '12.3 km') or 'N/A'.
 */
export const formatDistance = (meters) => {
	if (typeof meters !== "number" || meters < 0) return "N/A";
	const kilometers = meters / 1000;
	return `${kilometers.toFixed(1)} km`;
};
