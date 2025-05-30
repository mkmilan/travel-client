// src/app/trips/[tripId]/edit/page.jsx
"use client";

import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	Fragment,
} from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Listbox, Transition } from "@headlessui/react";
import {
	FaUpload,
	FaBus,
	FaTrash,
	FaGlobe,
	FaUserFriends,
	FaLock,
	// FaRv,
	FaCar,
	FaBicycle,
	FaWalking,
	FaCaravan,
	FaMotorcycle,
	FaQuestionCircle, // For 'other'
	FaChevronDown,
} from "react-icons/fa";
import Image from "next/image";
import { API_URL } from "@/utils/config";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

const visibilityOptions = [
	{
		id: "public",
		name: "Public",
		icon: FaGlobe,
		description: "Visible to everyone.",
	},
	{
		id: "followers_only", // Corrected: was "followers"
		name: "Followers",
		icon: FaUserFriends,
		description: "Visible only to your followers.",
	},
	{
		id: "private",
		name: "Private",
		icon: FaLock,
		description: "Visible only to you.",
	},
];

const travelModeOptions = [
	{ id: "motorhome", name: "Motorhome", icon: FaBus },
	{ id: "campervan", name: "Campervan", icon: FaCaravan },
	{ id: "car", name: "Car", icon: FaCar },
	{ id: "motorcycle", name: "Motorcycle", icon: FaMotorcycle },
	{ id: "bicycle", name: "Bicycle", icon: FaBicycle },
	{ id: "walking", name: "Walk/Hike", icon: FaWalking },
];

export default function EditTripPage() {
	const params = useParams();
	const router = useRouter();
	const { tripId } = params;
	const {
		user: loggedInUser,
		isAuthenticated,
		loading: authLoading,
		csrfToken,
	} = useAuth();

	// Form state for details
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [startLocationName, setStartLocationName] = useState("");
	const [endLocationName, setEndLocationName] = useState("");
	const [visibility, setVisibility] = useState(visibilityOptions[0]);
	const [travelMode, setTravelMode] = useState(travelModeOptions[0]);

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
		if (!tripId || authLoading || !loggedInUser || !isAuthenticated) return; // Ensure all prerequisites are met

		setLoading(true);
		setError("");
		try {
			// Fetch the specific trip using the environment variable
			const res = await fetch(`${API_URL}/trips/${tripId}`, {
				credentials: "include",
				headers: {
					"X-CSRF-Token": csrfToken,
				},
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

			const currentVisibility =
				visibilityOptions.find(
					(opt) => opt.id === data.defaultTripVisibility
				) || visibilityOptions[0];
			setVisibility(currentVisibility);

			const currentTravelMode =
				travelModeOptions.find((opt) => opt.id === data.defaultTravelMode) ||
				travelModeOptions[0];
			setTravelMode(currentTravelMode);
		} catch (err) {
			console.error("Error fetching trip for edit:", err);
			setError(err.message || "Could not load trip data.");
		} finally {
			setLoading(false);
		}
	}, [tripId, authLoading, loggedInUser, router, isAuthenticated, API_URL]);

	useEffect(() => {
		// Only fetch when auth isn't loading and we have the necessary info
		if (!authLoading && loggedInUser && isAuthenticated && tripId) {
			fetchTripData();
		} else if (!authLoading && !loggedInUser) {
			// Handle case where user logs out while on the page?
			setLoading(false);
			setError("Please log in to edit.");
		}
	}, [authLoading, loggedInUser, isAuthenticated, tripId, fetchTripData]);

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
		if (!isAuthenticated || !tripId) {
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
				credentials: "include",
				headers: {
					"X-CSRF-Token": csrfToken,
				},
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
		if (!photoIdToDelete || !isAuthenticated || !tripId) return;
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
					credentials: "include",
					headers: {
						"X-CSRF-Token": csrfToken,
					},
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
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken,
				},
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim(),
					startLocationName: startLocationName.trim(),
					endLocationName: endLocationName.trim(),
					defaultTripVisibility: visibility.id,
					defaultTravelMode: travelMode.id,
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
			{/* Remove p-4 md:p-0 to allow cards to touch edges on mobile */}
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="bg-white p-4 sm:p-6 md:p-8 shadow-md border border-gray-200 flex space-y-4 space-x-4 md:flex-row justify-between md:justify-start">
					{/* Visibility Selector */}
					<div className="md:col-span-2 ">
						{" "}
						{/* Make it full width on medium screens if desired, or keep it in the grid flow */}
						<Listbox
							value={visibility}
							onChange={setVisibility}
						>
							<Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
								Trip Visibility
							</Listbox.Label>
							<div className="relative mt-1">
								<Listbox.Button className="relative w-full cursor-default  bg-white py-2 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
									<span className="flex items-center">
										<visibility.icon
											className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0"
											aria-hidden="true"
										/>
										<span className="block truncate">{visibility.name}</span>
									</span>
									<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
										<FaChevronDown
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</span>
								</Listbox.Button>
								<Transition
									as={Fragment}
									leave="transition ease-in duration-100"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto  bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
										{visibilityOptions.map((option) => (
											<Listbox.Option
												key={option.id}
												className={({ active }) =>
													`relative cursor-default select-none py-2 pl-10 pr-4 ${
														active
															? "bg-indigo-100 text-indigo-900"
															: "text-gray-900"
													}`
												}
												value={option}
											>
												{({ selected }) => (
													<>
														<span
															className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
																selected ? "text-indigo-600" : "text-gray-400"
															}`}
														>
															<option.icon
																className="h-5 w-5"
																aria-hidden="true"
															/>
														</span>
														<span
															className={`block truncate ${
																selected ? "font-semibold" : "font-normal"
															}`}
														>
															{option.name}
														</span>
													</>
												)}
											</Listbox.Option>
										))}
									</Listbox.Options>
								</Transition>
							</div>
						</Listbox>
					</div>

					{/* Travel Mode Selector */}
					<div className="md:col-span-2">
						{" "}
						{/* Make it full width on medium screens if desired */}
						<Listbox
							value={travelMode}
							onChange={setTravelMode}
						>
							<Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
								Primary Travel Mode
							</Listbox.Label>
							<div className="relative mt-1">
								<Listbox.Button className="relative w-full cursor-default  bg-white py-2 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
									<span className="flex items-center">
										<travelMode.icon
											className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0"
											aria-hidden="true"
										/>
										<span className="block truncate">{travelMode.name}</span>
									</span>
									<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
										<FaChevronDown
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</span>
								</Listbox.Button>
								<Transition
									as={Fragment}
									leave="transition ease-in duration-100"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto  bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
										{travelModeOptions.map((option) => (
											<Listbox.Option
												key={option.id}
												className={({ active }) =>
													`relative cursor-default select-none py-2 pl-10 pr-4 ${
														active
															? "bg-indigo-100 text-indigo-900"
															: "text-gray-900"
													}`
												}
												value={option}
											>
												{({ selected }) => (
													<>
														<span
															className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
																selected ? "text-indigo-600" : "text-gray-400"
															}`}
														>
															<option.icon
																className="h-5 w-5"
																aria-hidden="true"
															/>
														</span>
														<span
															className={`block truncate ${
																selected ? "font-semibold" : "font-normal"
															}`}
														>
															{option.name}
														</span>
													</>
												)}
											</Listbox.Option>
										))}
									</Listbox.Options>
								</Transition>
							</div>
						</Listbox>
					</div>
				</div>
				{/* --- Manage Photos Section --- */}
				<div className="bg-white p-4 sm:p-6 md:p-8 shadow-md border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">
						Manage Photos
					</h2>
					{deletePhotoError && (
						<p className="text-red-500 text-sm mb-3">{deletePhotoError}</p>
					)}

					{/* Existing Photos Display */}
					{/* <h3 className="text-lg font-medium text-gray-700 mb-3">
						Existing Photos ({existingPhotos.length} / 5)
					</h3> */}
					{existingPhotos.length > 0 ? (
						<div className="flex space-x-1 overflow-x-auto pb-4 mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
							{existingPhotos.map((photoId) => (
								<div
									key={photoId}
									className="relative aspect-square group flex-shrink-0 w-32 h-32 sm:w-36 sm:h-36"
								>
									{/* Use img tag directly for simplicity if Next optimization isn't needed for dynamic src */}
									<img
										src={`${API_URL}/photos/${photoId}`} // Construct full URL
										alt={`Existing trip photo`}
										className="object-cover w-full h-full "
										loading="lazy" // Lazy load images
									/>
									<button
										onClick={() => handleDeletePhoto(photoId)}
										disabled={isDeletingPhoto === photoId}
										className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 text-white p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 disabled:opacity-50 z-10" // Adjusted padding, removed rounded-full
										title="Delete photo"
									>
										{isDeletingPhoto === photoId ? (
											<svg
												className="animate-spin h-4 w-4 text-white" // Adjusted size
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
											<FaTrash className="h-4 w-4" /> // Adjusted size
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
									50MB each)
								</label>
								<input
									ref={fileInputRef}
									id="photo-upload"
									name="photos"
									type="file"
									multiple
									accept="image/jpeg, image/png, image/gif, image/webp"
									onChange={handleFileChange}
									className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4  file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
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
									className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm disabled:opacity-50" // Removed rounded
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
				{/* Card already has internal padding: p-4 sm:p-6 md:p-8 */}
				<div className="bg-white p-4 sm:p-6 md:p-8 shadow-md border border-gray-200">
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
								Title
							</label>
							<input
								type="text"
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								maxLength={100}
								className="block w-full px-3 py-2 border border-gray-300  shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
								className="block w-full px-3 py-2 border border-gray-300  shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
									className="block w-full px-3 py-2 border border-gray-300  shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
									className="block w-full px-3 py-2 border border-gray-300  shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
								className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 text-sm disabled:opacity-50 cursor-pointer" // Removed rounded
								disabled={isSaving}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm disabled:opacity-50 cursor-pointer " // Use theme colors, removed rounded
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
