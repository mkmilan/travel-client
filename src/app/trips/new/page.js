// src/app/trips/new/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useGpsTracker } from "@/hooks/useGpsTracker";
import { generateGpxString } from "@/utils/gpxUtils";
import Modal from "@/components/Modal";
import TrackingStatusDisplay from "@/components/tracking/TrackingStatusDisplay";
import { reverseGeocode } from "@/utils/geocoding";
import UserNotice from "@/components/tracking/UserNotice";
import SaveTripForm from "@/components/tracking/SaveTripForm";
import RecommendationForm from "@/components/recommendations/RecommendationForm";
import { API_URL } from "@/utils/config";
import { FaMapMarkerAlt, FaSpinner, FaPlusCircle } from "react-icons/fa";

export default function NewTripPage() {
	const { token } = useAuth();
	const router = useRouter();
	const tracker = useGpsTracker();

	// State for the save operation itself
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState("");
	const [gpxData, setGpxData] = useState(null);
	const [initialStartLocation, setInitialStartLocation] = useState("");
	const [initialEndLocation, setInitialEndLocation] = useState("");
	const [isFetchingLocations, setIsFetchingLocations] = useState(false);
	const [poiDescription, setPoiDescription] = useState("");
	const [isRecommendationModalOpen, setIsRecommendationModalOpen] =
		useState(false);

	// Generate GPX when tracking stops and data needs saving
	useEffect(() => {
		if (
			tracker.needsSaving &&
			tracker.trackedPoints.length > 1 &&
			!tracker.isTracking &&
			!tracker.isPaused // Ensure not paused
		) {
			console.log("Generating GPX data for saving...");
			// Pass POIs to GPX generator if it supports waypoints
			const generatedGpx = generateGpxString(
				tracker.trackedPoints,
				tracker.pointsOfInterest
			);
			setGpxData(generatedGpx);
			setInitialStartLocation(""); // Reset for fetching
			setInitialEndLocation("");
		} else {
			// Clear GPX data if state doesn't warrant it
			setGpxData(null);
		}
	}, [
		tracker.needsSaving,
		tracker.trackedPoints,
		tracker.pointsOfInterest,
		tracker.isTracking,
		tracker.isPaused,
	]);

	// Fetch Start/End Location Names when GPX is ready
	useEffect(() => {
		const fetchLocations = async () => {
			// Fetch only when GPX is generated and we have points
			if (gpxData && tracker.trackedPoints.length > 1 && !isFetchingLocations) {
				setIsFetchingLocations(true);
				setInitialStartLocation("Fetching...");
				setInitialEndLocation("Fetching...");

				const startPoint = tracker.trackedPoints[0];
				const endPoint =
					tracker.trackedPoints[tracker.trackedPoints.length - 1];

				try {
					const [startName, endName] = await Promise.all([
						reverseGeocode(startPoint.lat, startPoint.lon),
						reverseGeocode(endPoint.lat, endPoint.lon),
					]);
					setInitialStartLocation(startName || "Unknown Location");
					setInitialEndLocation(endName || "Unknown Location");
				} catch (error) {
					console.error("Error fetching locations:", error);
					setInitialStartLocation("Error fetching");
					setInitialEndLocation("Error fetching");
				} finally {
					setIsFetchingLocations(false);
				}
			}
		};

		fetchLocations();
	}, [gpxData, tracker.trackedPoints]);
	console.log("Tracker state:", tracker);

	// --- Save Trip API Call Handler ---
	const handleSaveTrip = async (formDataFromSaveForm) => {
		setSaveError("");
		setIsSaving(true);

		if (!gpxData) {
			setSaveError("Cannot save: GPX data is missing.");
			setIsSaving(false);
			return;
		}
		if (!token) {
			setSaveError("Cannot save: Authentication token is missing.");
			setIsSaving(false);
			return;
		}

		let savedTripData = null;

		try {
			const res = await fetch(`${API_URL}/trips`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...formDataFromSaveForm, // title, description, start/end names
					gpxString: gpxData, // GPX data includes track and POIs (if gpxUtils supports it)
				}),
			});
			savedTripData = await res.json();
			if (!res.ok) {
				throw new Error(
					savedTripData.message || `Failed to save trip (${res.status})`
				);
			}

			console.log("Trip saved successfully:", savedTripData);
			// 2. Save Pending Recommendations (if any)
			if (tracker.pendingRecommendations.length > 0 && savedTripData?._id) {
				console.log(
					`Attempting to save ${tracker.pendingRecommendations.length} pending recommendations...`
				);
				let recommendationErrors = []; // Collect errors

				// Use Promise.allSettled to handle individual recommendation save attempts
				const recommendationPromises = tracker.pendingRecommendations.map(
					async (pendingRec, index) => {
						try {
							const recFormData = new FormData();

							// Append text data (excluding photos, location, timestamp)
							Object.keys(pendingRec).forEach((key) => {
								if (
									key !== "photos" &&
									key !== "location" &&
									key !== "timestamp"
								) {
									if (
										key === "attributeTags" &&
										Array.isArray(pendingRec[key])
									) {
										pendingRec[key].forEach((tag) =>
											recFormData.append("attributeTags", tag)
										);
									} else if (
										pendingRec[key] !== undefined &&
										pendingRec[key] !== null
									) {
										recFormData.append(key, pendingRec[key]);
									}
								}
							});

							// Append location from the stored pendingRec.location
							if (
								pendingRec.location?.latitude !== undefined &&
								pendingRec.location?.longitude !== undefined
							) {
								recFormData.append("latitude", pendingRec.location.latitude);
								recFormData.append("longitude", pendingRec.location.longitude);
							} else {
								console.warn(
									`Pending recommendation ${index} missing location data.`
								);
								// Decide if you want to skip or save without location
							}

							// Append associatedTrip ID
							recFormData.append("associatedTrip", savedTripData._id);

							// Append source (use 'TRACKING' or value from pendingRec if set)
							// recFormData.append("source", pendingRec.source || "MANUAL");

							// --- Link to POI if possible ---
							// Find the POI in the saved trip data that matches the recommendation's timestamp
							// This requires the backend trip save response to include POIs with timestamps and IDs
							const matchingPoi = savedTripData.pointsOfInterest?.find(
								(poi) =>
									Math.abs(
										new Date(poi.timestamp).getTime() - pendingRec.timestamp
									) < 5000 // Match within 5 seconds
							);
							if (matchingPoi?._id) {
								recFormData.append("associatedPoiId", matchingPoi._id);
								console.log(
									`Linked pending recommendation ${index} to POI ${matchingPoi._id}`
								);
							}
							// --- End POI Linking ---

							// Append photos (File objects)
							if (pendingRec.photos && Array.isArray(pendingRec.photos)) {
								pendingRec.photos.forEach((photoFile) => {
									if (photoFile instanceof File) {
										// Ensure it's a File object
										recFormData.append("photos", photoFile);
									} else {
										console.warn(
											`Item in photos array for pending rec ${index} is not a File object.`
										);
									}
								});
							}

							// Make the API call
							const recRes = await fetch(`${API_URL}/recommendations`, {
								method: "POST",
								headers: { Authorization: `Bearer ${token}` },
								body: recFormData,
							});
							const recResult = await recRes.json();
							if (!recRes.ok) {
								throw new Error(
									recResult.message ||
										`Failed to save recommendation ${index + 1}`
								);
							}
							console.log(
								`Pending recommendation ${index + 1} saved successfully:`,
								recResult._id
							);
							return { status: "fulfilled", value: recResult };
						} catch (recError) {
							console.error(
								`Error saving pending recommendation ${index + 1}:`,
								recError
							);
							// Store the error message
							recommendationErrors.push(
								`Rec ${index + 1}: ${recError.message}`
							);
							return { status: "rejected", reason: recError.message };
						}
					}
				);

				// Wait for all recommendation saves to settle
				await Promise.allSettled(recommendationPromises);

				// If there were errors saving recommendations, append them to the main saveError
				if (recommendationErrors.length > 0) {
					setSaveError(
						(prev) =>
							(prev ? prev + "\n" : "") +
							"Some recommendations failed to save: " +
							recommendationErrors.join("; ")
					);
					// Decide if you still want to proceed with clearing and redirecting
					// For now, we proceed but show the error.
				}
			}
			tracker.clearSavedTrack(); // Clear localStorage and reset tracker state
			router.push(`/feed`); // Redirect after successful save
		} catch (err) {
			console.error("Error saving trip:", err);
			setSaveError(err.message || "An unexpected error occurred during save.");
			setIsSaving(false);
		}
		// finally {
		//   setIsSaving(false);
		// }
	};

	// --- Cancel Save Handler ---
	const handleCancelSave = () => {
		// Confirm before discarding
		if (
			window.confirm("Are you sure you want to discard this tracked route?")
		) {
			tracker.clearSavedTrack(); // Clear localStorage and reset tracker state
			// Reset local component state related to the form
			setGpxData(null);
			setSaveError("");
			setInitialStartLocation("");
			setInitialEndLocation("");
			setIsFetchingLocations(false);
		}
	};

	// --- Add POI Handler ---
	const handleAddPoi = () => {
		tracker.addPointOfInterest(poiDescription);
		setPoiDescription("");
	};

	// --- Open Recommendation Modal Handler ---
	const handleOpenRecommendationModal = () => {
		if (tracker.currentPosition) {
			setIsRecommendationModalOpen(true);
		} else {
			// Should not happen if button is disabled, but good practice
			alert("Cannot add recommendation: Current location unknown.");
		}
	};

	// --- Callback for successful recommendation save ---
	const handleRecommendationSaved = (recommendationDataWithPhotos) => {
		// console.log(
		// 	"handleRecommendationSaved: Received data from modal:",
		// 	recommendationDataWithPhotos
		// );
		// Add the data (including File objects) to the tracker's pending list
		tracker.addPendingRecommendation(recommendationDataWithPhotos);
		setIsRecommendationModalOpen(false);
	};

	// Determine initial title for the form
	const initialFormTitle =
		tracker.trackedPoints.length > 0
			? `Trip on ${new Date(
					tracker.trackedPoints[0].timestamp
			  ).toLocaleDateString()}`
			: tracker.startTime
			? `Trip started on ${new Date(tracker.startTime).toLocaleDateString()}`
			: "";

	// --- Render Logic ---
	if (tracker.isInitializing) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p>Loading ...</p>
			</div>
		);
	}
	// Determine whether to show the Save Form or the Tracking UI
	const showSaveForm =
		tracker.needsSaving && gpxData && !tracker.isTracking && !tracker.isPaused;

	// Prepare initial data for recommendation form if modal is open
	const recommendationInitialData =
		isRecommendationModalOpen && tracker.currentPosition
			? {
					latitude: tracker.currentPosition.lat,
					longitude: tracker.currentPosition.lon,
			  }
			: {};

	return (
		<ProtectedRoute>
			<div className="max-w-4xl mx-auto bg-white p-6 md:p-8  shadow-md border border-gray-200 mb-8">
				{!showSaveForm ? (
					// --- Tracking View ---
					<>
						<h1 className="text-xl text-center font-bold mb-6 text-gray-900">
							Track New Trip
						</h1>
						<UserNotice />
						<TrackingStatusDisplay
							isTracking={tracker.isTracking}
							isPaused={tracker.isPaused} // Pass pause state
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
							<p className="text-red-600 mb-4 p-3 bg-red-100  border border-red-400">
								{tracker.trackingError}
							</p>
						)}
						{/* Action Buttons */}
						{/* --- Action Buttons --- */}
						<div className="mt-6 flex flex-wrap justify-center items-center gap-4">
							{/* Start / Resume */}
							{!tracker.isTracking &&
								!tracker.isPaused &&
								tracker.trackedPoints.length === 0 && (
									<button
										onClick={tracker.startTracking}
										className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold text-lg"
									>
										Start Tracking
									</button>
								)}
							{tracker.isPaused && (
								<button
									onClick={tracker.resumeTracking}
									className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold text-lg"
								>
									Resume Tracking
								</button>
							)}

							{/* Pause */}
							{tracker.isTracking && !tracker.isPaused && (
								<button
									onClick={tracker.pauseTracking}
									className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 font-semibold text-lg"
								>
									Pause Tracking
								</button>
							)}

							{/* Stop (Final) */}
							{(tracker.isTracking || tracker.isPaused) && ( // Show Stop if tracking OR paused
								<button
									onClick={tracker.stopTracking}
									className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-semibold text-lg"
								>
									Stop & Finish Trip
								</button>
							)}
							{/* Discard (if paused or stopped with data) */}
							{(tracker.isPaused ||
								(tracker.needsSaving && !tracker.isTracking)) &&
								tracker.trackedPoints.length > 0 && (
									<button
										onClick={handleCancelSave} // Use the discard handler
										className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm"
									>
										Discard Tracked Data
									</button>
								)}

							{/* Dummy Data Button */}
							{process.env.NODE_ENV === "development" &&
								!tracker.isTracking &&
								!tracker.isPaused &&
								tracker.trackedPoints.length === 0 && (
									<button
										onClick={tracker.addDummyPoints}
										className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 text-sm"
									>
										Add Dummy Data (Dev)
									</button>
								)}
						</div>
						{/* --- Add POI Section & Recommendation Section (only when tracking or paused with position) --- */}
						{(tracker.isTracking || tracker.isPaused) &&
							tracker.currentPosition && (
								<div className="mt-8 pt-6 border-t border-gray-200">
									<h3 className="text-lg font-semibold text-gray-800 mb-3">
										Add Point of Interest
									</h3>
									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
										<input
											type="text"
											value={poiDescription}
											onChange={(e) => setPoiDescription(e.target.value)}
											placeholder="Optional description (e.g., 'Nice viewpoint')"
											maxLength={100}
											className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										/>
										<button
											onClick={handleAddPoi}
											disabled={tracker.isAddingPoi}
											className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 flex items-center justify-center w-full sm:w-auto flex-shrink-0"
										>
											{tracker.isAddingPoi ? (
												<FaSpinner className="animate-spin mr-2" />
											) : (
												<FaMapMarkerAlt className="mr-2" />
											)}
											{tracker.isAddingPoi ? "Adding..." : "Mark Location"}
										</button>
									</div>
									{/* Add Recommendation Button */}
									<button
										onClick={handleOpenRecommendationModal}
										className="bg-purple-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center w-full sm:w-auto"
									>
										<FaPlusCircle className="mr-2" />
										Add Recommendation Here
									</button>
								</div>
							)}
						{/* --- Display POIs --- */}
						{tracker.pointsOfInterest.length > 0 && (
							<div className="mt-6">
								<h4 className="text-md font-semibold text-gray-700 mb-2">
									Points of Interest Marked:
								</h4>
								<ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
									{tracker.pointsOfInterest.map((poi, index) => (
										<li key={poi.timestamp || index}>
											<span className="font-medium">
												{poi.name || `POI ${index + 1}`}
											</span>
											{poi.description && (
												<span className="italic"> - {poi.description}</span>
											)}
											<span className="text-xs text-gray-500 ml-2">
												({poi.lat.toFixed(4)}, {poi.lon.toFixed(4)})
											</span>
										</li>
									))}
								</ul>
							</div>
						)}
						{/* --- Display Pending Recommendations --- */}
						{tracker.pendingRecommendations.length > 0 && (
							<div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded">
								<h4 className="text-md font-semibold text-purple-800 mb-2">
									Pending Recommendations:{" "}
									{tracker.pendingRecommendations.length}
								</h4>
								<ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
									{tracker.pendingRecommendations.map((rec, index) => (
										// Use rec.timestamp or index as key, ensure rec.name exists
										<li key={rec.timestamp || index}>
											{rec.name || `Recommendation ${index + 1}`}
										</li>
									))}
								</ul>
								<p className="text-xs text-purple-600 mt-2">
									These will be saved when you finish the trip.
								</p>
							</div>
						)}
					</>
				) : (
					// --- Save Form View ---
					<>
						{isFetchingLocations && (
							<p className="text-center text-gray-600 mb-4">
								Fetching start/end locations...
							</p>
						)}
						<SaveTripForm
							initialTitle={initialFormTitle}
							pointsCount={tracker.trackedPoints.length}
							poisCount={tracker.pointsOfInterest.length}
							pendingRecommendationsCount={
								tracker.pendingRecommendations.length
							}
							onSave={handleSaveTrip}
							// onCancel is handled by buttons below
							isSaving={isSaving}
							saveError={saveError}
							initialStartLocationName={initialStartLocation}
							initialEndLocationName={initialEndLocation}
						/>
						{/* Form Actions (Buttons outside the form component) */}
						<div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
							<button
								type="button"
								onClick={handleCancelSave} // Use the cancel/discard handler
								className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
								disabled={isSaving}
							>
								Cancel & Discard Route
							</button>
							<button
								type="submit"
								form="saveTripForm" // Associate button with the form
								className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
								disabled={isSaving || isFetchingLocations} // Disable if saving or fetching locations
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
			{/* --- Recommendation Modal --- */}
			<Modal
				isOpen={isRecommendationModalOpen}
				onClose={() => setIsRecommendationModalOpen(false)}
				title="Add Recommendation at Current Location"
			>
				<RecommendationForm
					initialData={recommendationInitialData}
					// source="TRACKING" // Indicate it was created during tracking
					source="MANUAL" // Indicate it was created during tracking
					onSuccess={handleRecommendationSaved} // Pass callback
					// We don't pass associatedTripId or associatedPoiId
				/>
			</Modal>
		</ProtectedRoute>
	);
}
