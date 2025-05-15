"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { API_URL } from "@/utils/config";
import { useAuth } from "@/context/AuthContext";

// Dynamically import the LocationPicker
const LocationPicker = dynamic(
	() => import("@/components/map/LocationPicker"),
	{
		ssr: false,
		loading: () => (
			<div className="h-64 w-full bg-gray-200 flex items-center justify-center text-gray-500">
				Loading Map...
			</div>
		),
	}
);

export default function AddPoiForm({
	tripId,
	tripRouteGeoJson, // Pass route for context
	onPoiAdded, // Callback function after successful addition
	onCancel, // Function to close the modal/form
}) {
	const { isAuthenticated } = useAuth();
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		latitude: null,
		longitude: null,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleLocationSelect = (lat, lon) => {
		setFormData((prev) => ({
			...prev,
			latitude: lat,
			longitude: lon,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (formData.latitude === null || formData.longitude === null) {
			setError("Please select a location on the map.");
			return;
		}
		if (!isAuthenticated) {
			setError("Authentication error. Please log in again.");
			return;
		}

		setIsSubmitting(true);

		try {
			const res = await fetch(`${API_URL}/trips/${tripId}/pois`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					description: formData.description,
					latitude: formData.latitude,
					longitude: formData.longitude,
				}),
			});

			const result = await res.json();

			if (!res.ok) {
				throw new Error(result.message || "Failed to add POI");
			}

			// Success! Call the callback function with the new POI data
			if (onPoiAdded) {
				onPoiAdded(result);
			}
		} catch (err) {
			console.error("Error adding POI:", err);
			setError(err.message || "An unknown error occurred.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4"
		>
			{error && <p className="text-red-500 text-sm">{error}</p>}

			{/* Location Picker */}
			<div>
				{/* <label className="block text-sm font-medium text-gray-700 mb-1">
					Location *
				</label> */}
				<div className="border rounded overflow-hidden">
					<LocationPicker
						onLocationSelect={handleLocationSelect}
						tripRouteGeoJson={tripRouteGeoJson} // Show route for context
						className="h-64 w-full"
					/>
				</div>
				{formData.latitude !== null && formData.longitude !== null ? (
					<p className="text-xs text-gray-500 mt-1">
						Selected: {formData.latitude.toFixed(5)},{" "}
						{formData.longitude.toFixed(5)}
					</p>
				) : (
					<p className="text-xs text-gray-500 mt-1">
						Click on the map to mark the POI location.
					</p>
				)}
			</div>

			{/* Name */}
			<div>
				<label
					htmlFor="poi-name"
					className="block text-sm font-medium text-gray-700"
				>
					POI Name (Optional)
				</label>
				<input
					type="text"
					id="poi-name"
					name="name"
					value={formData.name}
					onChange={handleInputChange}
					maxLength={100}
					className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			{/* Description */}
			<div>
				<label
					htmlFor="poi-description"
					className="block text-sm font-medium text-gray-700"
				>
					Description (Optional)
				</label>
				<textarea
					id="poi-description"
					name="description"
					rows={3}
					value={formData.description}
					onChange={handleInputChange}
					maxLength={500}
					className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-end space-x-3 pt-2">
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isSubmitting || !formData.latitude}
					className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
				>
					{isSubmitting ? "Adding..." : "Add POI"}
				</button>
			</div>
		</form>
	);
}
