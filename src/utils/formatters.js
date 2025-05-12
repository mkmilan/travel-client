// src/utils/formatters.js
import { format } from "date-fns";
import { convertDistance, convertSpeed } from "./unitConversion";

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
// export const formatDistance = (meters) => {
// 	if (typeof meters !== "number" || meters < 0) return "N/A";
// 	const kilometers = meters / 1000;
// 	return `${kilometers.toFixed(1)} km`;
// };
export const formatDistance = (meters, preferredUnits = "metric") => {
	return convertDistance(meters, preferredUnits);
};

/**
 * Calculates and formats average speed in km/h.
 * @param {number} distanceMeters - Distance in meters.
 * @param {number} durationMillis - Duration in milliseconds.
 * @returns {string} Formatted speed string (e.g., '45.2 km/h') or 'N/A'.
 */
// export const formatSpeed = (distanceMeters, durationMillis) => {
// 	if (
// 		typeof distanceMeters !== "number" ||
// 		distanceMeters < 0 ||
// 		typeof durationMillis !== "number" ||
// 		durationMillis <= 0 // Avoid division by zero or negative duration
// 	) {
// 		return "N/A";
// 	}
// 	const durationSeconds = durationMillis / 1000;
// 	const speedMetersPerSecond = distanceMeters / durationSeconds;
// 	const speedKmPerHour = speedMetersPerSecond * 3.6; // Conversion factor
// 	return `${speedKmPerHour.toFixed(1)} km/h`;
// };
export const formatSpeed = (
	distanceMeters,
	durationMillis,
	preferredUnits = "metric"
) => {
	return convertSpeed(distanceMeters, durationMillis, preferredUnits);
};

/**
 * Formats a date according to user preferences
 * @param {Date|string|number} date - The date to format
 * @param {Object} userSettings - User settings object containing dateFormat and timeFormat
 * @param {boolean} includeTime - Whether to include time in the output
 * @returns {string} Formatted date/time string
 */
export const formatDateTime = (date, userSettings, includeTime = false) => {
	if (!date) return "N/A";

	const dateObj = new Date(date);
	if (!(dateObj instanceof Date) || isNaN(dateObj)) return "Invalid Date";

	const { dateFormat = "YYYY-MM-DD", timeFormat = "24h" } = userSettings || {};

	// Convert date format to date-fns format
	const dateFormatMap = {
		"MM/DD/YYYY": "MM/dd/yyyy",
		"DD/MM/YYYY": "dd/MM/yyyy",
		"YYYY-MM-DD": "yyyy-MM-dd",
	};

	const timeFormatMap = {
		"12h": "h:mm a",
		"24h": "HH:mm",
	};

	const dateFnsFormat = dateFormatMap[dateFormat] || "dd-mm-yyyy";
	const timeFnsFormat = timeFormatMap[timeFormat] || "HH:mm";

	try {
		if (includeTime) {
			return format(dateObj, `${dateFnsFormat} ${timeFnsFormat}`);
		}
		return format(dateObj, dateFnsFormat);
	} catch (error) {
		console.error("Date formatting error:", error);
		return "Invalid Date";
	}
};
