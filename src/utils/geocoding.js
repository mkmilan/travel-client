// filepath: /home/mkmilan/Documents/my/travel-2/client/src/utils/geocoding.js

/**
 * Fetches a human-readable address for given latitude and longitude using Nominatim.
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {Promise<string|null>} A formatted address string or null if an error occurs.
 */
export async function reverseGeocode(lat, lon) {
	if (lat === undefined || lon === undefined) {
		console.error("Invalid coordinates for reverse geocoding:", lat, lon);
		return null;
	}
	// Be mindful of Nominatim's usage policy: https://operations.osmfoundation.org/policies/nominatim/
	const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`; // Zoom level 10 often gives city/town level

	try {
		const response = await fetch(url, {
			headers: {
				"Accept-Language": "en", // Optional: Request results in English
			},
		});

		if (!response.ok) {
			console.warn(
				"Failed to fetch address for coordinates:",
				lat,
				lon,
				response.status
			);
			return "Unknown Location";
		}

		const data = await response.json();

		if (data && data.address) {
			const { city, town, village, county, state, country } = data.address;
			// Construct a meaningful name - prioritize more specific names
			const locationName =
				city || town || village || county || "Unknown Location";
			// const region = state || country || "";
			// return region ? `${locationName}, ${region}` : locationName;
			return locationName;
		} else {
			console.warn("No address found for coordinates:", lat, lon, data);
			return "Unknown Location";
		}
	} catch (error) {
		console.error("Error during reverse geocoding:", error.message);
		// Avoid failing the whole save process, return null or a default
		return null;
	}
}
