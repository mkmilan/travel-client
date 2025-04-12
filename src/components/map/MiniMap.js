// src/components/map/MiniMap.jsx
"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";

// Helper to fit bounds
const FitBounds = ({ geoJsonData }) => {
	const map = useMap();
	useEffect(() => {
		if (geoJsonData?.features?.[0]?.geometry?.coordinates?.length >= 2) {
			try {
				const layer = L.geoJSON(geoJsonData);
				map.fitBounds(layer.getBounds().pad(0.05)); // Less padding for small map
			} catch (error) {
				console.error("MiniMap FitBounds error:", error);
			}
		}
	}, [geoJsonData, map]);
	return null;
};

export default function MiniMap({ simplifiedRouteGeoJson }) {
	const defaultCenter = [51.505, -0.09];
	const defaultZoom = 5;

	const geoJsonFeatureCollection =
		simplifiedRouteGeoJson?.coordinates?.length >= 2
			? {
					type: "FeatureCollection",
					features: [
						{
							type: "Feature",
							properties: {},
							geometry: simplifiedRouteGeoJson,
						},
					],
			  }
			: null;

	const routeStyle = { color: "#3388ff", weight: 3, opacity: 0.8 }; // Thinner line for mini map

	if (!geoJsonFeatureCollection) {
		// Render a placeholder if no valid route data
		return (
			<div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
				No route preview
			</div>
		);
	}

	return (
		<MapContainer
			center={defaultCenter}
			zoom={defaultZoom}
			style={{ height: "100%", width: "100%" }} // Fill container
			className="pointer-events-none" // Disable all interactions
			zoomControl={false}
			scrollWheelZoom={false}
			dragging={false}
			doubleClickZoom={false}
			attributionControl={false} // Hide attribution on mini map
		>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			<GeoJSON
				data={geoJsonFeatureCollection}
				style={routeStyle}
			/>
			<FitBounds geoJsonData={geoJsonFeatureCollection} />
		</MapContainer>
	);
}
