// src/components/map/TripMap.jsx
"use client"; // This component uses Leaflet which interacts with the DOM

import React, { useEffect } from "react";
import {
	MapContainer,
	TileLayer,
	GeoJSON,
	Marker,
	Popup,
	useMap,
} from "react-leaflet";
import L from "leaflet"; // Import Leaflet library itself

// --- Custom POI Icon (Optional) ---
const poiIcon = new L.Icon({
	iconUrl: "/icons/poi-marker.svg", // Create an SVG icon in public/icons
	iconSize: [25, 35], // Size of the icon
	iconAnchor: [12, 35], // Point of the icon which will correspond to marker's location
	popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
});

// --- Helper Component to Fit Bounds ---
// react-leaflet v3+ hooks like useMap must be used inside children of MapContainer
const FitBounds = ({ geoJsonData, pointsOfInterest }) => {
	const map = useMap();

	useEffect(() => {
		// Invalidate size shortly after map is available, crucial for modals/tabs
		// Use setTimeout to ensure it runs after the current render cycle and modal transition
		const timer = setTimeout(() => {
			map.invalidateSize(); // Tell Leaflet to re-check container size

			// Now attempt to fit bounds after ensuring size is correct
			if (
				geoJsonData &&
				geoJsonData.features &&
				geoJsonData.features.length > 0 &&
				geoJsonData.features[0].geometry?.coordinates?.length >= 2
			) {
				try {
					const geoJsonLayer = L.geoJSON(geoJsonData); // Create temporary layer
					map.fitBounds(geoJsonLayer.getBounds().pad(0.1)); // Fit map to bounds with padding
				} catch (error) {
					console.error("Error fitting map bounds:", error);
				}
			} else if (geoJsonData && geoJsonData.geometry) {
				// Handle case where geoJsonData is just the LineString geometry
				try {
					const simpleLayer = L.geoJSON(geoJsonData); // Create layer from geometry
					map.fitBounds(simpleLayer.getBounds().pad(0.1));
				} catch (error) {
					console.error("Error fitting map bounds from geometry:", error);
				}
			}
			// Extend bounds to include POIs
			if (pointsOfInterest && pointsOfInterest.length > 0) {
				const poiLatLngs = pointsOfInterest.map((poi) => [poi.lat, poi.lon]);
				const poiBounds = L.latLngBounds(poiLatLngs);
				if (bounds) {
					bounds.extend(poiBounds); // Combine route bounds and POI bounds
				} else {
					bounds = poiBounds; // If no route, just use POI bounds
				}
			}
			// // Fit map to combined bounds if they exist
			// if (bounds && bounds.isValid()) {
			// 	map.fitBounds(bounds.pad(0.1));
			// }
			// If no valid data, map might default to initial center/zoom
		}, 10); // Small delay (e.g., 10ms) is often enough

		return () => clearTimeout(timer); // Cleanup timeout if component unmounts or effect re-runs
	}, [geoJsonData, pointsOfInterest, map]); // Re-run when data or map instance changes

	return null; // This component doesn't render anything itself
};

// --- Main Map Component ---
export default function TripMap({
	simplifiedRouteGeoJson,
	pointsOfInterest = [],
	interactive = true,
	className,
}) {
	// Define some default map center/zoom if needed
	const defaultCenter = [51.505, -0.09]; // Example: London
	const defaultZoom = 6;

	// Convert simplifiedRoute (LineString geometry) into a full GeoJSON FeatureCollection
	// This makes it easier for react-leaflet's GeoJSON component
	const geoJsonFeatureCollection =
		simplifiedRouteGeoJson?.coordinates?.length > 0
			? {
					type: "FeatureCollection",
					features: [
						{
							type: "Feature",
							properties: {}, // Add properties if needed later
							geometry: simplifiedRouteGeoJson, // Assumes simplifiedRouteGeoJson IS the geometry object { type: 'LineString', coordinates: [...] }
						},
					],
			  }
			: null; // Set to null if no valid coordinates

	// Style for the GeoJSON route line
	const routeStyle = {
		color: "#3388ff", // Default Leaflet blue
		weight: interactive ? 5 : 4,
		opacity: 0.7,
	};

	// Determine map interaction options based on the 'interactive' prop
	const mapOptions = interactive
		? {
				scrollWheelZoom: true,
				dragging: true,
				zoomControl: true,
				doubleClickZoom: true,
				attributionControl: true,
				tap: true,
		  }
		: {
				scrollWheelZoom: false,
				dragging: false,
				zoomControl: false,
				doubleClickZoom: false,
				attributionControl: false, // Hide attribution on non-interactive maps
				tap: false, // Disable tap interactions on mobile for preview
		  };

	// Unique key forces re-initialization when interactivity changes, preventing state issues
	const mapKey = interactive ? "interactive-map" : "static-map";
	return (
		<MapContainer
			key={mapKey}
			center={defaultCenter} // Centering will be adjusted by FitBounds
			zoom={defaultZoom}
			scrollWheelZoom={true} // Allow scroll wheel zoom
			// style={{ height: "400px", width: "100%" }} // Set map dimensions explicitly
			style={{ height: "100%", width: "100%" }}
			className={`${className} ${
				!interactive ? "pointer-events-none" : ""
			} shadow-md z-10`}
			{...mapOptions}
		>
			{/* Base Map Layer */}
			<TileLayer
				attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{/* Display the Trip Route */}
			{geoJsonFeatureCollection && (
				<GeoJSON
					key={JSON.stringify(geoJsonFeatureCollection)} // Force re-render if data changes
					data={geoJsonFeatureCollection}
					style={routeStyle}
				/>
			)}

			{pointsOfInterest.map((poi) => (
				<Marker
					key={poi._id || poi.timestamp} // Use _id if available (after schema change), fallback to timestamp
					position={[poi.lat, poi.lon]}
					icon={poiIcon} // Use custom icon
				>
					{interactive && ( // Only render Popup if map is interactive
						<Popup>
							<div className="text-sm">
								<p className="font-semibold mb-1">
									{poi.name ||
										`POI @ ${new Date(poi.timestamp).toLocaleTimeString()}`}
								</p>
								{poi.description && (
									<p className="text-gray-600 mb-1">{poi.description}</p>
								)}
								<p className="text-xs text-gray-500">
									{poi.lat.toFixed(5)}, {poi.lon.toFixed(5)}
								</p>
							</div>
						</Popup>
					)}
				</Marker>
			))}

			{/* Component to automatically adjust map bounds */}
			{geoJsonFeatureCollection && (
				<FitBounds geoJsonData={geoJsonFeatureCollection} />
			)}
		</MapContainer>
	);
}
