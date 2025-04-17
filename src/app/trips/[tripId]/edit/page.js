// src/app/trips/[tripId]/edit/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { FaUpload, FaTrash } from "react-icons/fa";
import Image from "next/image";
import { API_URL } from "@/utils/config";

// Loading/Error components
const LoadingComponent = () => (
	<div className="flex justify-center items-center py-10">
		<p>Loading trip data for editing...</p>
		{/* You can add a spinner here */}
	</div>
);
const ErrorComponent = ({ message }) => (
	<div className="text-center py-10">
		<p className="text-red-500 font-medium">Error: {message}</p>
	</div>
);

export default function EditTripPage() {
	const params = useParams();
	const router = useRouter();
	const { tripId } = params;
	const { user: loggedInUser, token, loading: authLoading } = useAuth();

	// Form state for details
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [startLocationName, setStartLocationName] = useState("");
	const [endLocationName, setEndLocationName] = useState("");

	// Photo State
	const [existingPhotos, setExistingPhotos] = useState([]);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState("");
	const [uploadSuccess, setUploadSuccess] = useState("");
	const [isDeletingPhoto, setIsDeletingPhoto] = useState(null); // Store ID of photo being deleted
	const [deletePhotoError, setDeletePhotoError] = useState(""); // Specific error state for delete
	const fileInputRef = useRef(null);

	// Operation state
	const [loading, setLoading] = useState(true); // For initial fetch
	const [isSaving, setIsSaving] = useState(false); // For PUT request (details save)
	const [error, setError] = useState(""); // For fetching details
	const [saveError, setSaveError] = useState(""); // Specific error for saving details
	const [success, setSuccess] = useState(""); // For saving details

	// Fetch existing trip data
	const fetchTripData = useCallback(async () => {
		if (!tripId || authLoading || !loggedInUser || !token) return; // Ensure all prerequisites are met

		setLoading(true);
		setError("");
		try {
			// Fetch the specific trip using the environment variable
			const res = await fetch(`${API_URL}/trips/${tripId}`, {
				// Sending token even for GET might be useful if endpoint becomes protected later
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to fetch trip data");

			// Auth Check (redundant if API protects GET, but good client-side check)
			if (data.user._id !== loggedInUser._id) {
				setError("You are not authorized to edit this trip.");
				setTimeout(() => router.push(`/trips/${tripId}`), 2000);
				return;
			}

			// Pre-fill form state
			setTitle(data.title || "");
			setDescription(data.description || "");
			setStartLocationName(data.startLocationName || "");
			setEndLocationName(data.endLocationName || "");
			setExistingPhotos(data.photos || []);
		} catch (err) {
			console.error("Error fetching trip for edit:", err);
			setError(err.message || "Could not load trip data.");
		} finally {
			setLoading(false);
		}
	}, [tripId, authLoading, loggedInUser, router, token, API_URL]);

	useEffect(() => {
		// Only fetch when auth isn't loading and we have the necessary info
		if (!authLoading && loggedInUser && token && tripId) {
			fetchTripData();
		} else if (!authLoading && !loggedInUser) {
			// Handle case where user logs out while on the page?
			setLoading(false);
			setError("Please log in to edit.");
		}
	}, [authLoading, loggedInUser, token, tripId, fetchTripData]);

	// --- Handle File Selection ---
	const handleFileChange = (e) => {
		setUploadError("");
		setUploadSuccess("");
		if (e.target.files) {
			const maxPhotos = 5;
			const currentCount = existingPhotos.length;
			const newFilesArray = Array.from(e.target.files);

			if (currentCount + newFilesArray.length > maxPhotos) {
				setUploadError(
					`Maximum ${maxPhotos} photos allowed. You have ${currentCount}, selected ${newFilesArray.length}.`
				);
				setSelectedFiles([]);
				if (fileInputRef.current) fileInputRef.current.value = null;
				return;
			}
			// Optional: Add client-side type/size validation here
			setSelectedFiles(newFilesArray);
		}
	};

	// --- Handle Photo Upload ---
	const handlePhotoUpload = async () => {
		const maxPhotos = 5; // Consistent limit definition
		const currentCount = existingPhotos.length;
		const newCount = selectedFiles.length;

		if (newCount === 0) {
			setUploadError("Please select photos.");
			return;
		}
		if (currentCount + newCount > maxPhotos) {
			setUploadError(`Maximum ${maxPhotos} photos allowed.`);
			return;
		}
		if (!token || !tripId) {
			setUploadError("Auth/Trip ID missing.");
			return;
		}

		setIsUploading(true);
		setUploadError("");
		setUploadSuccess("");
		const formData = new FormData();
		selectedFiles.forEach((file) => {
			formData.append("photos", file);
		});

		try {
			// Use environment variable for API URL
			const res = await fetch(`${API_URL}/trips/${tripId}/photos`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.message || `Upload failed (${res.status})`);

			setUploadSuccess(data.message || "Upload successful!");
			setExistingPhotos((prev) => [...prev, ...data.photoIds]); // Update existing photos list
			setSelectedFiles([]);
			if (fileInputRef.current) fileInputRef.current.value = null;
		} catch (err) {
			console.error("Photo upload error:", err);
			setUploadError(err.message || "Upload failed.");
		} finally {
			setIsUploading(false);
		}
	};

	// --- Handle Delete Photo ---
	const handleDeletePhoto = async (photoIdToDelete) => {
		if (!photoIdToDelete || !token || !tripId) return;
		if (!window.confirm("Delete this photo permanently?")) return;

		setIsDeletingPhoto(photoIdToDelete);
		setDeletePhotoError("");

		// Set a timeout to clear the loading state after 15 seconds (failsafe)
		// const timeoutId = setTimeout(() => {
		// 	if (isDeletingPhoto === photoIdToDelete) {
		// 		console.warn("Photo deletion timeout reached, resetting loading state");
		// 		setIsDeletingPhoto(null);
		// 		setDeletePhotoError(
		// 			"The request timed out. The photo may have been deleted, please refresh to confirm."
		// 		);
		// 	}
		// }, 5000);

		try {
			// Use environment variable for API URL
			const res = await fetch(
				`${API_URL}/trips/${tripId}/photos/${photoIdToDelete}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
					// Add a timeout parameter for the fetch request
					// signal: AbortSignal.timeout(5000), // 10 second timeout for the network request
				}
			);
			// Allow 200 or 204, try parse body for potential error message
			let data = {};
			if (res.status !== 204) {
				try {
					data = await res.json();
				} catch {
					/* ignore parse error */
				}
			}
			if (!res.ok && res.status !== 204) {
				throw new Error(data.message || `Failed to delete (${res.status})`);
			}

			console.log("Photo deleted:", photoIdToDelete);
			setExistingPhotos((prevPhotos) =>
				prevPhotos.filter((id) => id !== photoIdToDelete)
			);
		} catch (err) {
			console.error("Error deleting photo:", err);
			setDeletePhotoError(`Error: ${err.message}`);
		} finally {
			// clearTimeout(timeoutId); // Clear the timeout
			setIsDeletingPhoto(null);
		}
	};

	// --- Handle Form Submit (Trip Details Update) ---
	const handleUpdateTrip = async (e) => {
		e.preventDefault();
		setSaveError("");
		setSuccess("");
		setIsSaving(true);

		if (!title.trim()) {
			setSaveError("Title required.");
			setIsSaving(false);
			return;
		}

		try {
			// Use environment variable for API URL
			const res = await fetch(`${API_URL}/trips/${tripId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim(),
					startLocationName: startLocationName.trim(),
					endLocationName: endLocationName.trim(),
				}),
			});
			const updatedTripData = await res.json();
			if (!res.ok)
				throw new Error(
					updatedTripData.message || `Update failed (${res.status})`
				);

			setSuccess("Trip details updated!");
			setTimeout(() => {
				router.push(`/trips/${tripId}`);
			}, 1500);
		} catch (err) {
			console.error("Error updating trip details:", err);
			setSaveError(err.message || "Update failed.");
		} finally {
			setIsSaving(false);
		}
	};

	// --- Render Logic ---
	if (authLoading || loading) return <LoadingComponent />; // Combine loading checks
	// Show general error first if it occurred during fetch/auth check
	if (error) return <ErrorComponent message={error} />;

	return (
		<ProtectedRoute>
			<div className="max-w-4xl mx-auto space-y-8 p-4 md:p-0">
				{" "}
				{/* Added padding for mobile */}
				{/* --- Manage Photos Section --- */}
				<div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">
						Manage Photos
					</h2>
					{deletePhotoError && (
						<p className="text-red-500 text-sm mb-3">{deletePhotoError}</p>
					)}

					{/* Existing Photos Display */}
					<h3 className="text-lg font-medium text-gray-700 mb-3">
						Existing Photos ({existingPhotos.length} / 5)
					</h3>
					{existingPhotos.length > 0 ? (
						<div className="flex space-x-3 overflow-x-auto pb-4 mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
							{existingPhotos.map((photoId) => (
								<div
									key={photoId}
									className="relative aspect-square group flex-shrink-0 w-32 h-32 sm:w-36 sm:h-36"
								>
									{/* Use img tag directly for simplicity if Next optimization isn't needed for dynamic src */}
									<img
										src={`${API_URL}/photos/${photoId}`} // Construct full URL
										alt={`Existing trip photo`}
										className="object-cover w-full h-full rounded-md"
										loading="lazy" // Lazy load images
									/>
									<button
										onClick={() => handleDeletePhoto(photoId)}
										disabled={isDeletingPhoto === photoId}
										className="absolute top-1 right-1 bg-red-600/70 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 disabled:opacity-50 z-10"
										title="Delete photo"
									>
										{isDeletingPhoto === photoId ? (
											<svg
												className="animate-spin h-4 w-4 text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
										) : (
											<FaTrash className="h-3 w-3" />
										)}
									</button>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-gray-500 mb-6">
							No photos uploaded yet.
						</p>
					)}

					{/* Upload New Photos Area */}
					{existingPhotos.length < 5 ? (
						<div className="pt-4 border-t border-gray-200">
							<h3 className="text-lg font-medium text-gray-700 mb-3">
								Upload New Photos
							</h3>
							<div className="mb-4">
								<label
									htmlFor="photo-upload"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Select Photos (up to {5 - existingPhotos.length} more, max
									10MB each)
								</label>
								<input
									ref={fileInputRef}
									id="photo-upload"
									name="photos"
									type="file"
									multiple
									accept="image/jpeg, image/png, image/gif, image/webp"
									onChange={handleFileChange}
									className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
								/>
							</div>
							{/* File Preview List */}
							{selectedFiles.length > 0 && (
								<div className="mb-4 text-sm text-gray-600">
									<p className="font-medium mb-1">Selected files to upload:</p>
									<ul className="list-disc list-inside space-y-1">
										{selectedFiles.map((file, index) => (
											<li key={index}>
												{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
											</li>
										))}
									</ul>
								</div>
							)}
							{/* Upload Button & Status */}
							<div className="flex items-center space-x-4 mt-3">
								<button
									type="button"
									onClick={handlePhotoUpload}
									disabled={isUploading || selectedFiles.length === 0}
									className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
								>
									<FaUpload className="mr-2" />
									{isUploading
										? "Uploading..."
										: `Upload ${selectedFiles.length} Photo(s)`}
								</button>
								{uploadError && (
									<p className="text-red-500 text-sm">{uploadError}</p>
								)}
								{uploadSuccess && (
									<p className="text-green-600 text-sm">{uploadSuccess}</p>
								)}
							</div>
						</div>
					) : (
						<p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
							Maximum number of photos reached (5).
						</p>
					)}
				</div>
				{/* --- End Photos Section --- */}
				{/* --- Edit Details Section --- */}
				<div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-800 mb-6">
						Edit Trip Details
					</h2>
					{success && (
						<p className="text-green-600 mb-4 p-3 bg-green-100 rounded">
							{success}
						</p>
					)}
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
							<p className="text-red-500 p-3 bg-red-100 rounded border border-red-400 text-sm">
								{saveError}
							</p>
						)}

						{/* Form Actions */}
						<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
							<button
								type="button"
								onClick={() => router.push(`/trips/${tripId}`)}
								className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
								disabled={isSaving}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
								disabled={isSaving || loading}
							>
								{isSaving ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</form>
				</div>
				{/* --- End Details Section --- */}
			</div>
		</ProtectedRoute>
	);
}
