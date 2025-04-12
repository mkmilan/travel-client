// src/app/trips/[tripId]/edit/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

// Loading/Error components
const LoadingComponent = () => <p>Loading trip data for editing...</p>;
const ErrorComponent = ({ message }) => (
	<p className="text-red-500">Error: {message}</p>
);

export default function EditTripPage() {
	const params = useParams();
	const router = useRouter();
	const { tripId } = params;
	const { user: loggedInUser, token, loading: authLoading } = useAuth();

	// Form state
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [startLocationName, setStartLocationName] = useState("");
	const [endLocationName, setEndLocationName] = useState("");

	// Operation state
	const [loading, setLoading] = useState(true); // For initial fetch
	const [isSaving, setIsSaving] = useState(false); // For PUT request
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Fetch existing trip data to pre-fill form
	const fetchTripData = useCallback(async () => {
		if (!tripId || !token) return; // Need ID and token

		setLoading(true);
		setError("");
		try {
			// Fetch the specific trip
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}`,
				{
					headers: { Authorization: `Bearer ${token}` }, // Send token even for GET for consistency maybe? Or make GET public
				}
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to fetch trip data");

			// --- Authorization Check ---
			if (loggedInUser && data.user._id !== loggedInUser._id) {
				setError("You are not authorized to edit this trip.");
				// Redirect back to trip detail page
				setTimeout(() => router.push(`/trips/${tripId}`), 2000);
				return; // Stop further processing
			}

			// Pre-fill form state
			setTitle(data.title || "");
			setDescription(data.description || "");
			setStartLocationName(data.startLocationName || "");
			setEndLocationName(data.endLocationName || "");
		} catch (err) {
			console.error("Error fetching trip for edit:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [tripId, token, loggedInUser, router]); // Dependencies for fetching

	// Fetch data on mount or when dependencies change
	useEffect(() => {
		// Wait for auth loading to finish before fetching
		if (!authLoading) {
			fetchTripData();
		}
	}, [authLoading, fetchTripData]); // Depend on authLoading and the fetch function

	// --- Handle Form Submit ---
	const handleUpdateTrip = async (e) => {
		e.preventDefault();
		setSaveError(""); // Renamed state for clarity
		setSuccess("");
		setIsSaving(true);

		if (!title.trim()) {
			setSaveError("Title is required.");
			setIsSaving(false);
			return;
		}

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}`,
				{
					// Correct endpoint
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						// Send only updatable fields
						title: title.trim(),
						description: description.trim(),
						startLocationName: startLocationName.trim(),
						endLocationName: endLocationName.trim(),
					}),
				}
			);

			const updatedTripData = await res.json();

			if (!res.ok) {
				throw new Error(
					updatedTripData.message || `Failed to update trip (${res.status})`
				);
			}

			// --- Handle Success ---
			console.log("Trip updated successfully:", updatedTripData);
			setSuccess("Trip details updated successfully!");
			// Redirect back to trip detail page after delay
			setTimeout(() => {
				router.push(`/trips/${tripId}`);
			}, 1500);
		} catch (err) {
			console.error("Error updating trip:", err);
			setSaveError(err.message || "An unexpected error occurred.");
		} finally {
			setIsSaving(false);
		}
	};

	// Rename state variable for save error message display
	const [saveError, setSaveError] = useState("");

	// --- Render Logic ---
	if (loading || authLoading) return <LoadingComponent />;
	// Show general error first if it occurred during fetch/auth check
	if (error) return <ErrorComponent message={error} />;

	return (
		<ProtectedRoute>
			<div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">
					Edit Trip Details
				</h1>

				{/* Success Message */}
				{success && (
					<p className="text-green-600 mb-4 p-3 bg-green-100 rounded">
						{success}
					</p>
				)}

				{/* Edit Form */}
				<form
					onSubmit={handleUpdateTrip}
					className="space-y-4"
				>
					{/* Title */}
					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Title <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							maxLength={100}
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>
					{/* Description */}
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Description
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={4}
							maxLength={2000}
							placeholder="Update notes about your journey..."
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>
					{/* Start/End Location */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="startLocationName"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Start Location
							</label>
							<input
								type="text"
								id="startLocationName"
								value={startLocationName}
								onChange={(e) => setStartLocationName(e.target.value)}
								maxLength={100}
								placeholder="City, State/Region"
								className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>
						<div>
							<label
								htmlFor="endLocationName"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								End Location
							</label>
							<input
								type="text"
								id="endLocationName"
								value={endLocationName}
								onChange={(e) => setEndLocationName(e.target.value)}
								maxLength={100}
								placeholder="City, State/Region"
								className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>
					</div>

					{/* Save Error Display */}
					{saveError && (
						<p className="text-red-600 p-3 bg-red-100 rounded border border-red-400">
							{saveError}
						</p>
					)}

					{/* Form Actions */}
					<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
						<button
							type="button"
							onClick={() => router.push(`/trips/${tripId}`)} // Go back to detail page
							className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
							disabled={isSaving}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
							disabled={isSaving || loading} // Disable if initially loading too
						>
							{isSaving ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</ProtectedRoute>
	);
}
