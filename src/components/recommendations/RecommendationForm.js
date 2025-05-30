// filepath: /home/mkmilan/Documents/my/travel-2/client/src/components/recommendations/RecommendationForm.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
	RECOMMENDATION_CATEGORIES,
	RECOMMENDATION_TAGS,
} from "@/utils/constants";
import { API_URL } from "@/utils/config";
import {
	FaStar,
	FaRegStar,
	FaCheck,
	FaChevronDown,
	FaMapMarkerAlt,
} from "react-icons/fa";
import { Listbox, Transition } from "@headlessui/react";
import dynamic from "next/dynamic";
import { StarRating } from "@/utils/starRating";

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

// Dynamically import RecommendationMap (for displaying existing locations)
const RecommendationMap = dynamic(
	() => import("@/components/map/RecommendationMap"),
	{
		ssr: false,
		loading: () => (
			<div className="h-32 w-full bg-gray-200 flex items-center justify-center text-gray-500">
				Loading Map Preview...
			</div>
		),
	}
);

export default function RecommendationForm({
	initialData = {}, // For potential editing later
	isEditing = false,
	associatedTripId = null,
	associatedPoiId = null,
	source = "MANUAL",
	onSuccess = () => {},
	isModal = false,
}) {
	const router = useRouter();
	const { isAuthenticated, csrfToken } = useAuth();
	const [formData, setFormData] = useState({
		name: initialData.name || "",
		description: initialData.description || "",
		rating: initialData.rating || 0,
		primaryCategory: initialData.primaryCategory || "",
		attributeTags: initialData.attributeTags || [],
		// latitude: initialData.location?.coordinates?.[1] || "", // Lat is index 1
		// longitude: initialData.location?.coordinates?.[0] || "", // Lon is index 0
		latitude: initialData.latitude || "",
		longitude: initialData.longitude || "",
		photos: [],
		associatedTrip: "",
		sourcePoi: null,
	});

	const [photos, setPhotos] = useState([]); // Array of File objects
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [tripRouteGeoJson, setTripRouteGeoJson] = useState(null);
	const [routeLoading, setRouteLoading] = useState(false);
	const [routeError, setRouteError] = useState("");

	// Effect to update form data if initialData changes (e.g., for editing or modal)
	useEffect(() => {
		setFormData({
			name: initialData.name || "",
			description: initialData.description || "",
			rating: initialData.rating || 0,
			primaryCategory: initialData.primaryCategory || "",
			attributeTags: initialData.attributeTags || [],
			latitude: initialData.latitude || "",
			longitude: initialData.longitude || "",
		});
		// Reset photos when initial data changes? Or handle previews if editing?
		// For simplicity now, just reset files.
		setPhotos([]);
	}, []);

	// Determine if location was pre-filled (useful for deciding to show map)
	const locationPreFilled = !!initialData.latitude && !!initialData.longitude;

	// Effect to fetch trip route if needed
	useEffect(() => {
		// Only fetch if we have a trip ID and location wasn't pre-filled
		if (associatedTripId && !locationPreFilled) {
			const fetchTripRoute = async () => {
				setRouteLoading(true);
				setRouteError("");
				setTripRouteGeoJson(null); // Reset previous route
				try {
					const response = await fetch(`${API_URL}/trips/${associatedTripId}`, {
						credentials: "include",
						headers: {
							"X-CSRF-Token": csrfToken,
						},
					});
					if (!response.ok) {
						throw new Error("Failed to fetch trip route data");
					}
					const tripData = await response.json();
					if (tripData.simplifiedRoute) {
						setTripRouteGeoJson(tripData.simplifiedRoute);
					} else {
						console.warn("Trip data fetched but no simplified route found.");
						// Optionally set an error or just show map without route
					}
				} catch (err) {
					console.error("Error fetching trip route:", err);
					setRouteError("Could not load trip route on map.");
				} finally {
					setRouteLoading(false);
				}
			};
			fetchTripRoute();
		} else {
			// Clear route if no tripId or if location is pre-filled
			setTripRouteGeoJson(null);
		}
	}, [associatedTripId, locationPreFilled]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCategoryChange = (value) => {
		setFormData((prev) => ({ ...prev, primaryCategory: value }));
	};

	const handleRatingChange = (newRating) => {
		setFormData((prev) => ({ ...prev, rating: newRating }));
	};

	const handleTagChange = (e) => {
		const { value, checked } = e.target;
		setFormData((prev) => {
			const currentTags = prev.attributeTags;
			if (checked) {
				return { ...prev, attributeTags: [...currentTags, value] };
			} else {
				return {
					...prev,
					attributeTags: currentTags.filter((tag) => tag !== value),
				};
			}
		});
	};

	const handlePhotoChange = (e) => {
		if (e.target.files) {
			// Limit number of photos? e.g., max 5
			const selectedFiles = Array.from(e.target.files).slice(0, 5);
			setPhotos(selectedFiles);
		}
	};

	// Handler for when the map selects a location
	const handleLocationSelect = (lat, lon) => {
		setFormData((prev) => ({
			...prev,
			latitude: lat.toFixed(6), // Store with reasonable precision
			longitude: lon.toFixed(6),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		if (formData.rating === 0) {
			setError("Please provide a rating.");
			setIsSubmitting(false);
			return;
		}
		if (!formData.primaryCategory) {
			setError("Please select a primary category.");
			setIsSubmitting(false);
			return;
		}
		if (formData.latitude === "" || formData.longitude === "") {
			setError("Please provide latitude and longitude.");
			setIsSubmitting(false);
			return;
		}

		// --- Check if in Modal Context (using onSuccess prop) ---
		// const isModalContext =
		// 	onSuccess !== RecommendationForm.defaultProps.onSuccess;

		if (isModal) {
			console.log(
				"RecommendationForm (Modal Context): Calling onSuccess with data and photos:",
				formData,
				photos
			);
			try {
				// Pass data back via onSuccess callback
				onSuccess({ ...formData, photos, timestamp: Date.now() }); // Pass form data, File objects, and timestamp
			} catch (callbackError) {
				console.error("Error in onSuccess callback:", callbackError);
				setError("Failed to add recommendation to list.");
				setIsSubmitting(false); // Reset submitting state on callback error
				return;
			}
			// Reset submitting state *after* successfully calling onSuccess in modal context
			setIsSubmitting(false);
			// The parent component (NewTripPage) is responsible for closing the modal via the onSuccess handler
			return; // Stop here, don't submit to API directly
		}

		// --- Standalone Context: Proceed with API Submission ---
		setIsSubmitting(true);

		const submissionData = new FormData();
		Object.keys(formData).forEach((key) => {
			if (key === "attributeTags") {
				// Send tags as separate entries if backend expects array directly
				// Or stringify if backend expects a JSON string
				formData[key].forEach((tag) =>
					submissionData.append("attributeTags", tag)
				);
			} else {
				submissionData.append(key, formData[key]);
			}
		});
		// --- Add associatedTripId if present ---
		if (associatedTripId) {
			console.log("Appending associatedPoiId:", associatedPoiId);
			submissionData.append("associatedTrip", associatedTripId);
		}

		if (associatedPoiId) {
			console.log("Appending associatedPoiId:", associatedPoiId);
			submissionData.append("associatedPoiId", associatedPoiId);
		}
		submissionData.append("source", source);
		console.log("Appending source:", source);
		// Append photos
		photos.forEach((photo) => {
			submissionData.append("photos", photo); // Match the field name used in multerConfig
		});

		try {
			// Determine API endpoint and method based on isEditing
			const apiUrl = isEditing
				? `${API_URL}/recommendations/${initialData._id}` // Ensure initialData has _id when editing
				: `${API_URL}/recommendations`;
			const method = isEditing ? "PUT" : "POST";

			const response = await fetch(apiUrl, {
				method: method,
				credentials: "include",
				headers: {
					"X-CSRF-Token": csrfToken,
				},
				body: submissionData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || "Failed to create recommendation");
			}
			onSuccess(result);
			console.log("Recommendation created:", result);

			if (associatedTripId) {
				router.push(`/trips/${associatedTripId}`);
			} else if (isEditing) {
				router.push(`/recommendations/${initialData._id}`); // Or wherever edited items go
			} else {
				router.push("/trips/new"); // Default redirect for standalone creation
			}
		} catch (err) {
			console.error("Submission error:", err);
			setError(err.message || "An error occurred during submission.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Add default props for the check above
	// RecommendationForm.defaultProps = {
	// 	onSuccess: () => {},
	// };

	const selectedCategoryLabel =
		RECOMMENDATION_CATEGORIES.find(
			(cat) => cat.value === formData.primaryCategory
		)?.label || "-- Select a Category --";

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			{/* Name */}
			<div>
				<label
					htmlFor="name"
					className="block text-sm font-medium text-gray-700"
				>
					Name / Title
				</label>
				<input
					type="text"
					id="name"
					name="name"
					value={formData.name}
					onChange={handleInputChange}
					required
					maxLength={120}
					className="mt-1 block w-full px-3 py-1 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			{/* Description */}
			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium text-gray-700"
				>
					Description
				</label>
				<textarea
					id="description"
					name="description"
					value={formData.description}
					onChange={handleInputChange}
					required
					rows={4}
					maxLength={2000}
					className="mt-1 block w-full px-3 py-1 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			{/* Location (Lat/Lon Inputs) */}
			<div>
				{/* <label className="block text-sm font-medium text-gray-700 mb-2">
					Location *
				</label> */}
				{/* Conditionally render Map Picker */}
				{!locationPreFilled && (
					<div className="mb-4 border p-2 relative">
						{routeLoading && (
							<div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
								<p>Loading trip route...</p>
							</div>
						)}
						{routeError && (
							<p className="text-xs text-red-500 mb-1 text-center">
								{routeError}
							</p>
						)}
						<div>
							<LocationPicker
								onLocationSelect={handleLocationSelect}
								tripRouteGeoJson={tripRouteGeoJson} // Pass route data
								// Optionally pass initial center based on route later
							/>
						</div>

						{/* <p className="text-xs text-gray-500 mt-1 text-center">
							Click on the map (near your route) to set the location.
						</p> */}
					</div>
				)}
				{/* Show Static Map Preview if location IS pre-filled */}
				{locationPreFilled && (
					<div className="mb-2 border rounded overflow-hidden h-40">
						<RecommendationMap
							latitude={parseFloat(formData.latitude)}
							longitude={parseFloat(formData.longitude)}
							popupText={formData.name || "Selected POI Location"}
							interactive={false} // Make it non-interactive
							zoomLevel={14} // Slightly more zoomed in
						/>
					</div>
				)}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="latitude"
							className="block text-sm font-medium text-gray-700"
						>
							Latitude
						</label>
						<input
							type="number"
							id="latitude"
							name="latitude"
							value={formData.latitude}
							onChange={handleInputChange}
							required
							step="any" // Allow decimals
							placeholder="e.g., 40.7128"
							className="mt-1 block w-full px-3 py-1 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>
					<div>
						<label
							htmlFor="longitude"
							className="block text-sm font-medium text-gray-700"
						>
							Longitude
						</label>
						<input
							type="number"
							id="longitude"
							name="longitude"
							value={formData.longitude}
							onChange={handleInputChange}
							required
							step="any"
							placeholder="e.g., -74.0060"
							className="mt-1 block w-full px-3 py-1 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>
				</div>
				{locationPreFilled && (
					<p className="text-xs text-gray-500 mt-1 flex items-center">
						<FaMapMarkerAlt className="w-3 h-3 mr-1 text-blue-500" />
						Location pre-filled from Point of Interest. You can adjust if
						needed.
					</p>
				)}
			</div>

			{/* <p className="text-xs text-gray-500">
				Enter coordinates manually for now. Map input will be added later.
			</p> */}

			{/* Rating */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Rating
				</label>
				<StarRating
					rating={formData.rating}
					setRating={handleRatingChange}
				/>
			</div>

			<div>
				<Listbox
					value={formData.primaryCategory}
					onChange={handleCategoryChange}
					name="primaryCategory" // Keep name for potential form handling libraries
				>
					<div className="relative mt-1">
						<Listbox.Label className="block text-sm font-medium text-gray-700">
							Primary Category
						</Listbox.Label>
						<Listbox.Button className="relative w-full cursor-default  border border-gray-300 bg-white py-1 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
							<span className="block truncate">{selectedCategoryLabel}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<FaChevronDown
									className="h-5 w-5 text-gray-400"
									aria-hidden="true"
								/>
							</span>
						</Listbox.Button>
						<Transition
							// as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto  bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
								{RECOMMENDATION_CATEGORIES.map((cat) => (
									<Listbox.Option
										key={cat.value}
										className={({ active }) =>
											`relative cursor-default select-none py-1 pl-10 pr-4 ${
												active
													? "bg-indigo-100 text-indigo-900"
													: "text-gray-900"
											}`
										}
										value={cat.value}
									>
										{({ selected }) => (
											<>
												<span
													className={`block truncate ${
														selected ? "font-medium" : "font-normal"
													}`}
												>
													{cat.label}
												</span>
												{selected ? (
													<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
														<FaCheck
															className="h-5 w-5"
															aria-hidden="true"
														/>
													</span>
												) : null}
											</>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</div>
				</Listbox>
				{/* Hidden input might be needed if relying purely on native form submission without JS, but we use JS */}
				{/* <input type="hidden" name="primaryCategory" value={formData.primaryCategory} /> */}
			</div>

			{/* Attribute Tags */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Features / Tags
				</label>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
					{RECOMMENDATION_TAGS.map((tag) => (
						<div
							key={tag.value}
							className="flex items-center"
						>
							<input
								id={`tag-${tag.value}`}
								name="attributeTags"
								type="checkbox"
								value={tag.value}
								checked={formData.attributeTags.includes(tag.value)}
								onChange={handleTagChange}
								className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
							/>
							<label
								htmlFor={`tag-${tag.value}`}
								className="ml-2 block text-sm text-gray-900"
							>
								{tag.label}
							</label>
						</div>
					))}
				</div>
			</div>

			{/* Photos */}
			<div>
				<label
					htmlFor="photos"
					className="block text-sm font-medium text-gray-700"
				>
					Photos (Max 5)
				</label>
				<input
					type="file"
					id="photos"
					name="photos"
					multiple
					accept="image/jpeg, image/png, image/webp, image/gif" // Specify acceptable image types
					onChange={handlePhotoChange}
					className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-4 file: file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
				/>
				{/* Optional: Preview selected photos */}
				{photos.length > 0 && (
					<div className="mt-2 text-xs text-gray-600">
						Selected: {photos.map((f) => f.name).join(", ")}
					</div>
				)}
			</div>

			{/* Submit Button */}
			{error && (
				<p className="text-red-600 p-3 bg-red-100 border border-red-400">
					{error}
				</p>
			)}
			<div className="pt-4">
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full flex justify-center py-3 px-4 border border-transparent  shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
				>
					{/* {isSubmitting
						? "Submitting..."
						: isEditing
						? "Update Recommendation"
						: "Create Recommendation"} */}
					{
						isSubmitting
							? "Saving..."
							: isModal
							? "Add to Pending List" // Text for modal context
							: isEditing
							? "Update Recommendation"
							: "Create Recommendation" // Text for standalone context
					}
				</button>
			</div>
		</form>
	);
}
