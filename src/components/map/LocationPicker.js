"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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

const poiIcon = new L.Icon({
	iconUrl: "/icons/poi-marker.svg", // Ensure this icon exists in public/icons
	iconSize: [30, 42],
	iconAnchor: [12, 35],
	popupAnchor: [1, -34],
});

function LocationMarker({ position, setPosition, onLocationSelect }) {
	const map = useMapEvents({
		click(e) {
			const { lat, lng } = e.latlng;
			setPosition([lat, lng]);
			if (onLocationSelect) {
				onLocationSelect(lat, lng);
			}
			// Optional: Fly to the new marker location
			map.flyTo(e.latlng, map.getZoom());
		},
		// Optional: Update location on dragend if marker is draggable
		locationfound(e) {
			setPosition(e.latlng);
			map.flyTo(e.latlng, map.getZoom());
		},
	});

	return position === null ? null : (
		<Marker
			position={position}
			icon={poiIcon}
		></Marker>
	);
}

export default function LocationPickerMap({
	initialCenter = [51.505, -0.09], // Default to London
	initialZoom = 5,
	onLocationSelect,
	className = "h-64 w-full", // Default size
}) {
	const [position, setPosition] = useState(null); // [lat, lon]

	return (
		<div className={`relative ${className}`}>
			<MapContainer
				center={initialCenter}
				zoom={initialZoom}
				scrollWheelZoom={true}
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<LocationMarker
					position={position}
					setPosition={setPosition}
					onLocationSelect={onLocationSelect}
					// icon={poiIcon}
				/>
			</MapContainer>
			{!position && (
				<div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000] bg-white bg-opacity-80 p-2 text-sm text-gray-700 pointer-events-none shadow">
					Click on the map to select a location
				</div>
			)}
		</div>
	);
}
