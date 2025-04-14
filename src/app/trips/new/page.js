// src/app/trips/new/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useGpsTracker } from "@/hooks/useGpsTracker"; // Import the custom hook
import { generateGpxString } from "@/utils/gpxUtils"; // Import the utility
import TrackingStatusDisplay from "@/components/tracking/TrackingStatusDisplay"; // Import UI components
import UserNotice from "@/components/tracking/UserNotice";
import SaveTripForm from "@/components/tracking/SaveTripForm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NewTripPage() {
	const { token } = useAuth();
	const router = useRouter();
	const tracker = useGpsTracker(); // Use the tracker hook

	// State for the save operation itself
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState("");
	const [gpxData, setGpxData] = useState(null); // Store generated GPX data

	// Generate GPX when tracking stops and data needs saving
	useEffect(() => {
		if (
			tracker.needsSaving &&
			tracker.trackedPoints.length > 1 &&
			!tracker.isTracking
		) {
			console.log("Generating GPX data...");
			const generatedGpx = generateGpxString(tracker.trackedPoints);
			setGpxData(generatedGpx);
		} else {
			// Clear GPX data if state doesn't warrant it
			setGpxData(null);
		}
	}, [tracker.needsSaving, tracker.trackedPoints, tracker.isTracking]); // Dependencies trigger GPX generation

	// --- Save Trip API Call Handler ---
	const handleSaveTrip = async (formData) => {
		setSaveError("");
		setIsSaving(true);

		if (!gpxData) {
			/* ... validation ... */ return;
		}

		try {
			const res = await fetch(`${API_BASE_URL}/trips`, {
				// Relative URL should work if backend proxying is set up, otherwise use full URL
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...formData, // title, description, start/end names
					gpxString: gpxData,
				}),
			});
			const savedTripData = await res.json();
			if (!res.ok) {
				throw new Error(savedTripData.message || "Failed to save trip");
			}

			console.log("Trip saved successfully:", savedTripData);
			alert("Trip saved successfully!");
			tracker.clearSavedTrack(); // Clear localStorage via hook method
			// Reset component state related to save form visibility/data maybe?
			tracker.setNeedsSaving(false);
			tracker.setTrackedPoints([]);
			tracker.setElapsedTime(0);

			router.push("/feed"); // Redirect
		} catch (err) {
			console.error("Error saving trip:", err);
			setSaveError(err.message || "An unexpected error occurred.");
		} finally {
			setIsSaving(false);
		}
	};

	// --- Cancel Save Handler ---
	const handleCancelSave = () => {
		tracker.clearSavedTrack(); // Clear localStorage
		tracker.setTrackedPoints([]); // Reset points
		tracker.setElapsedTime(0); // Reset timer
		tracker.setNeedsSaving(false); // Reset flag
		setGpxData(null); // Clear generated GPX
		setSaveError(""); // Clear save error
	};

	// Determine initial title for the form
	const initialFormTitle =
		tracker.trackedPoints.length > 0
			? `Trip on ${new Date(
					tracker.trackedPoints[0].timestamp
			  ).toLocaleDateString()}`
			: "";

	// --- Render Logic ---
	if (tracker.isInitializing) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p>Loading tracker...</p>
			</div>
		);
	}

	// Determine whether to show the Save Form or the Tracking UI
	const showSaveForm = tracker.needsSaving && gpxData && !tracker.isTracking;

	return (
		<ProtectedRoute>
			<div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 mb-8">
				{!showSaveForm ? (
					// --- Tracking View ---
					<>
						<h1 className="text-3xl font-bold mb-6 text-gray-900">
							Track New Trip
						</h1>
						<UserNotice />
						<TrackingStatusDisplay
							isTracking={tracker.isTracking}
							elapsedTime={tracker.elapsedTime}
							pointsCount={tracker.trackedPoints.length}
						/>
						{/* Current Position Display */}
						{tracker.currentPosition && (
							<div className="mb-4 text-sm text-gray-600 text-center md:text-left">
								Current: Lat: {tracker.currentPosition.lat.toFixed(5)}, Lon:{" "}
								{tracker.currentPosition.lon.toFixed(5)} (Accuracy:{" "}
								{tracker.currentPosition.accuracy?.toFixed(0)}m)
							</div>
						)}
						{/* Tracking Error Display */}
						{tracker.trackingError && (
							<p className="text-red-600 mb-4 p-3 bg-red-100 rounded border border-red-400">
								{tracker.trackingError}
							</p>
						)}
						{/* Action Buttons */}
						<div className="mt-6 flex flex-wrap justify-center items-center gap-4">
							{!tracker.isTracking ? (
								<button
									onClick={tracker.startTracking}
									className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-lg"
								>
									Start Tracking
								</button>
							) : (
								<button
									onClick={tracker.stopTracking}
									className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-lg"
								>
									Stop Tracking
								</button>
							)}
							{/* Show Stop button also if needsSaving is true (restored data) */}
							{tracker.needsSaving && !tracker.isTracking && (
								<button
									onClick={tracker.stopTracking}
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
								>
									Process Restored Data
								</button>
							)}
							{/* Dummy Data Button */}
							{process.env.NODE_ENV === "development" &&
								!tracker.isTracking && (
									<button
										onClick={tracker.addDummyPoints}
										className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
									>
										Add Dummy Points (Dev)
									</button>
								)}
						</div>
					</>
				) : (
					// --- Save Form View ---
					<>
						<SaveTripForm
							initialTitle={initialFormTitle}
							pointsCount={tracker.trackedPoints.length}
							onSave={handleSaveTrip} // Pass the save handler
							onCancel={handleCancelSave} // Pass the cancel handler (form doesn't need it directly, parent handles actions)
							isSaving={isSaving}
							saveError={saveError}
						/>
						{/* Form Actions (Buttons outside the form component) */}
						<div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
							{" "}
							{/* Added top border */}
							<button
								type="button"
								onClick={handleCancelSave} // Use the cancel handler
								className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
								disabled={isSaving}
							>
								Cancel & Discard Route
							</button>
							<button
								type="submit"
								form="saveTripForm" // Associate button with the form inside SaveTripForm component
								className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
								disabled={isSaving}
							>
								{isSaving ? "Saving..." : "Save Trip"}
							</button>
						</div>
						{/* Optional GPX Preview */}
						<details className="mt-4 cursor-pointer">
							<summary className="text-sm text-gray-600 hover:text-gray-800">
								Show GPX Preview
							</summary>
							<pre className="mt-2 p-2 bg-gray-100 text-xs text-gray-600 rounded overflow-auto max-h-40 border border-gray-200">
								{gpxData}
							</pre>
						</details>
					</>
				)}
			</div>
		</ProtectedRoute>
	);
}
