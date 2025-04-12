/**
 * Generates a GPX XML string from an array of track points.
 * @param {Array<object>} points - Array of points, e.g., { lat, lon, timestamp, altitude?, speed? }
 * @param {string} tripName - Optional name for the track segment.
 * @returns {string} GPX XML string.
 */

export const generateGpxString = (
	points,
	tripName = "Motorhome Mapper Track"
) => {
	if (!points || points.length === 0) {
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
			points[0].timestamp
		).toISOString()}</time> {/* Use first point's time */}
  </metadata>
  <trk>
    <name>${tripName}</name>
    <trkseg>\n`; // Start track segment

	// Add track points
	points.forEach((point) => {
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
