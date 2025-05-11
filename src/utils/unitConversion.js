/**
 * Converts meters to the user's preferred distance unit
 * @param {number} meters - Distance in meters
 * @param {string} preferredUnits - User's preferred units ('metric' or 'imperial')
 * @returns {string} Formatted distance with unit
 */
export const convertDistance = (meters, preferredUnits = "metric") => {
	if (typeof meters !== "number" || meters < 0) return "N/A";

	if (preferredUnits === "imperial") {
		const miles = meters / 1609.344;
		return `${miles.toFixed(1)} mi`;
	}

	const kilometers = meters / 1000;
	return `${kilometers.toFixed(1)} km`;
};

/**
 * Converts speed (meters/time) to the user's preferred unit
 * @param {number} distanceMeters - Distance in meters
 * @param {number} durationMillis - Duration in milliseconds
 * @param {string} preferredUnits - User's preferred units ('metric' or 'imperial')
 * @returns {string} Formatted speed with unit
 */
export const convertSpeed = (
	distanceMeters,
	durationMillis,
	preferredUnits = "metric"
) => {
	if (
		typeof distanceMeters !== "number" ||
		distanceMeters < 0 ||
		typeof durationMillis !== "number" ||
		durationMillis <= 0
	) {
		return "N/A";
	}

	const durationSeconds = durationMillis / 1000;
	const speedMetersPerSecond = distanceMeters / durationSeconds;

	if (preferredUnits === "imperial") {
		const speedMilesPerHour = speedMetersPerSecond * 2.237; // Convert m/s to mph
		return `${speedMilesPerHour.toFixed(1)} mph`;
	}

	const speedKmPerHour = speedMetersPerSecond * 3.6; // Convert m/s to km/h
	return `${speedKmPerHour.toFixed(1)} km/h`;
};
