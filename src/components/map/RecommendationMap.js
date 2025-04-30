"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// --- Custom POI Icon (Optional, reuse from TripMap or define here) ---
const poiIcon = new L.Icon({
	iconUrl: "/icons/poi-marker.svg", // Ensure this icon exists in public/icons
	iconSize: [25, 35],
	iconAnchor: [12, 35],
	popupAnchor: [1, -34],
});

// --- Helper Component to Set View ---
const SetView = ({ center, zoom }) => {
	const map = useMap();
	useEffect(() => {
		if (center) {
			map.setView(center, zoom || map.getZoom()); // Set view to center with specified or current zoom
			// Invalidate size shortly after map is available, crucial for modals/tabs
			const timer = setTimeout(() => map.invalidateSize(), 10);
			return () => clearTimeout(timer);
		}
	}, [center, zoom, map]);
	return null;
};

// --- Main Recommendation Map Component ---
export default function RecommendationMap({
	latitude,
	longitude,
	popupText = "Recommendation Location", // Default popup text
	zoomLevel = 13, // Default zoom level for a single point
	interactive = true, // Allow interaction by default
	className = "",
}) {
	if (latitude == null || longitude == null) {
		return (
			<div
				className={`h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm ${className}`}
			>
				Location data not available.
			</div>
		);
	}

	const position = [latitude, longitude];

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
				attributionControl: false,
				tap: false,
		  };

	return (
		<MapContainer
			center={position} // Initial center
			zoom={zoomLevel}
			style={{ height: "100%", width: "100%" }}
			className={`${className} ${
				!interactive ? "pointer-events-none" : ""
			} z-10`} // z-10 might be needed depending on layout
			{...mapOptions}
		>
			{/* Base Map Layer */}
			<TileLayer
				attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{/* Marker for the Recommendation */}
			<Marker
				position={position}
				icon={poiIcon}
			>
				<Popup>{popupText}</Popup>
			</Marker>

			{/* Component to set the map view correctly after initial render */}
			<SetView
				center={position}
				zoom={zoomLevel}
			/>
		</MapContainer>
	);
}
