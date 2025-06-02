"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	useMapEvents,
	GeoJSON,
	useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const FitBoundsToRoute = ({ geoJsonData }) => {
	const map = useMap();

	useEffect(() => {
		if (
			geoJsonData &&
			geoJsonData.coordinates &&
			geoJsonData.coordinates.length >= 2
		) {
			try {
				// Create a temporary layer just to get bounds
				const routeLayer = L.geoJSON({
					type: "Feature",
					geometry: geoJsonData,
				});
				const bounds = routeLayer.getBounds();
				if (bounds.isValid()) {
					// Use setTimeout to ensure map container size is calculated after render/resize
					const timer = setTimeout(() => {
						map.invalidateSize(); // Ensure map knows its size
						map.fitBounds(bounds.pad(0.1)); // Fit to route bounds with padding
					}, 10); // Small delay
					return () => clearTimeout(timer); // Cleanup timer
				}
			} catch (error) {
				console.error("Error fitting map bounds to route:", error);
			}
		}
	}, [geoJsonData, map]); // Re-run if route data or map instance changes

	return null; // This component doesn't render anything
};

const poiIcon = new L.Icon({
	iconUrl: "/icons/poi-marker.svg", // Ensure this icon exists in public/icons
	iconSize: [30, 42],
	iconAnchor: [12, 35],
	popupAnchor: [1, -34],
});

// --- Marker Placer Component ---
function LocationMarker({ position, setPosition, onLocationSelect }) {
	const [markerPosition, setMarkerPosition] = useState(position);

	// Update internal marker position if the prop changes (e.g., initial load)
	useEffect(() => {
		setMarkerPosition(position);
	}, [position]);

	const map = useMapEvents({
		click(e) {
			const { lat, lng } = e.latlng;
			const newPos = [lat, lng];
			setMarkerPosition(newPos); // Update local marker state immediately
			setPosition(newPos); // Update parent state (for form fields)
			if (onLocationSelect) {
				onLocationSelect(lat, lng);
			}
		},
	});

	// When marker position changes locally, fly map to it smoothly
	useEffect(() => {
		if (markerPosition) {
			map.flyTo(markerPosition, map.getZoom());
		}
	}, [markerPosition, map]);

	return markerPosition === null ? null : (
		<Marker
			position={markerPosition}
			icon={poiIcon}
		></Marker>
	);
}

export default function LocationPickerMap({
	initialCenter = [51.505, -0.09], // Default to London
	initialZoom = 5,
	onLocationSelect,
	tripRouteGeoJson = null,
	className = "h-64 w-full", // Default size
}) {
	const [selectedPosition, setSelectedPosition] = useState(null);
	const routeStyle = {
		color: "#3388ff",
		weight: 3,
		opacity: 0.6,
	};
	// Convert route geometry to Feature object for GeoJSON component
	const routeFeature = tripRouteGeoJson
		? { type: "Feature", geometry: tripRouteGeoJson }
		: null;

	return (
		<div className={`relative ${className}`}>
			<MapContainer
				center={initialCenter}
				zoom={initialZoom}
				scrollWheelZoom={true}
				style={{ height: "100%", width: "100%" }}
				className="z-10"
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{routeFeature && (
					<GeoJSON
						key={JSON.stringify(routeFeature)} // Force re-render if route changes
						data={routeFeature}
						style={routeStyle}
					/>
				)}
				<LocationMarker
					position={selectedPosition}
					setPosition={setSelectedPosition}
					onLocationSelect={onLocationSelect}
				/>
				{tripRouteGeoJson && (
					<FitBoundsToRoute geoJsonData={tripRouteGeoJson} />
				)}
			</MapContainer>
			{!selectedPosition && (
				<div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1] bg-white bg-opacity-80 p-2 text-sm text-gray-700 pointer-events-none shadow rounded">
					Click on the map to select a location
				</div>
			)}
		</div>
	);
}
