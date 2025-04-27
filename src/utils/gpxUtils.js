// filepath: /home/mkmilan/Documents/my/travel-2/client/src/utils/gpxUtils.js
/**
 * Generates a GPX XML string from an array of track points and points of interest.
 * @param {Array<object>} trackPoints - Array of points, e.g., { lat, lon, timestamp, altitude?, speed? }
 * @param {Array<object>} pointsOfInterest - Array of POIs, e.g., { lat, lon, timestamp, name?, description? }
 * @param {string} tripName - Optional name for the track segment.
 * @returns {string} GPX XML string.
 */
export const generateGpxString = (
	trackPoints,
	pointsOfInterest = [], // Add pointsOfInterest parameter
	tripName = "New Track"
) => {
	if (!trackPoints || trackPoints.length === 0) {
		return "";
	}

	// Start GPX structure
	let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Motorhome Mapper - Web App"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${tripName}</name>
    <time>${new Date(
			trackPoints[0].timestamp
		).toISOString()}</time> {/* Use first point's time */}
  </metadata>`;

	// Add Waypoints (POIs) - BEFORE the track
	pointsOfInterest.forEach((poi) => {
		gpx += `  <wpt lat="${poi.lat}" lon="${poi.lon}">\n`;
		if (poi.timestamp) {
			gpx += `    <time>${new Date(poi.timestamp).toISOString()}</time>\n`;
		}
		if (poi.name && poi.name.trim() !== "") {
			// Basic XML escaping for name
			const escapedName = poi.name
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&apos;");
			gpx += `    <name>${escapedName}</name>\n`;
		}
		if (poi.description && poi.description.trim() !== "") {
			// Basic XML escaping for description
			const escapedDesc = poi.description
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&apos;");
			gpx += `    <desc>${escapedDesc}</desc>\n`;
		}
		gpx += `  </wpt>\n`;
	});
	// Add Track
	gpx += `  <trk>
    <name>${tripName}</name>
    <trkseg>\n`;

	// Add track points
	trackPoints.forEach((point) => {
		gpx += `      <trkpt lat="${point.lat}" lon="${point.lon}">\n`;
		if (typeof point.altitude === "number") {
			gpx += `        <ele>${point.altitude}</ele>\n`;
		}
		const isoTime = new Date(point.timestamp).toISOString();
		gpx += `        <time>${isoTime}</time>\n`;
		// Optional: Add speed if available
		// if (typeof point.speed === 'number' && point.speed >= 0) {
		//   gpx += `        <speed>${point.speed}</speed>\n`;
		// }
		gpx += `      </trkpt>\n`;
	});

	// Close tags
	gpx += `    </trkseg>
  </trk>
</gpx>`;

	return gpx;
};
