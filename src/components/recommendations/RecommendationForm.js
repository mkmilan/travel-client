// filepath: /home/mkmilan/Documents/my/travel-2/client/src/components/recommendations/RecommendationForm.js
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
	RECOMMENDATION_CATEGORIES,
	RECOMMENDATION_TAGS,
} from "@/utils/constants";
import { API_URL } from "@/utils/config";
import { FaStar, FaRegStar, FaCheck, FaChevronDown } from "react-icons/fa";
import { Listbox, Transition } from "@headlessui/react";

// Simple Star Rating Component
const StarRating = ({ rating, setRating }) => {
	return (
		<div className="flex space-x-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button" // Prevent form submission
					onClick={() => setRating(star)}
					className="text-yellow-500 focus:outline-none"
					aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
				>
					{rating >= star ? (
						<FaStar className="w-6 h-6" />
					) : (
						<FaRegStar className="w-6 h-6" />
					)}
				</button>
			))}
		</div>
	);
};

export default function RecommendationForm({
	initialData = {}, // For potential editing later
	isEditing = false,
}) {
	const router = useRouter();
	const { token } = useAuth();
	const [formData, setFormData] = useState({
		name: initialData.name || "",
		description: initialData.description || "",
		rating: initialData.rating || 0,
		primaryCategory: initialData.primaryCategory || "",
		attributeTags: initialData.attributeTags || [],
		latitude: initialData.location?.coordinates?.[1] || "", // Lat is index 1
		longitude: initialData.location?.coordinates?.[0] || "", // Lon is index 0
	});
	const [photos, setPhotos] = useState([]); // Array of File objects
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

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

		// Append photos
		photos.forEach((photo) => {
			submissionData.append("photos", photo); // Match the field name used in multerConfig
		});

		try {
			const response = await fetch(`${API_URL}/recommendations`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					// 'Content-Type': 'multipart/form-data' is set automatically by browser with FormData
				},
				body: submissionData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || "Failed to create recommendation");
			}

			console.log("Recommendation created:", result);
			// Redirect to the new recommendation's detail page (or a list page)
			// For now, let's redirect to a general recommendations list page (we'll create this later)
			router.push("/recommendations"); // Or router.push(`/recommendations/${result._id}`);
		} catch (err) {
			console.error("Submission error:", err);
			setError(err.message || "An error occurred during submission.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedCategoryLabel =
		RECOMMENDATION_CATEGORIES.find(
			(cat) => cat.value === formData.primaryCategory
		)?.label || "-- Select a Category --";

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			{error && (
				<p className="text-red-600 p-3 bg-red-100 border border-red-400">
					{error}
				</p>
			)}

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
					className="mt-1 block w-full px-3 py-2 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
					className="mt-1 block w-full px-3 py-2 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			{/* Location (Lat/Lon Inputs) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
						className="mt-1 block w-full px-3 py-2 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
						className="mt-1 block w-full px-3 py-2 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
					/>
				</div>
			</div>
			<p className="text-xs text-gray-500">
				Enter coordinates manually for now. Map input will be added later.
			</p>

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

			{/* Primary Category */}
			{/* <div>
				<label
					htmlFor="primaryCategory"
					className="block text-sm font-medium text-gray-700"
				>
					Primary Category
				</label>
				<select
					id="primaryCategory"
					name="primaryCategory"
					value={formData.primaryCategory}
					onChange={handleInputChange}
					required
					className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
				>
					<option
						value=""
						disabled
					>
						-- Select a Category --
					</option>
					{RECOMMENDATION_CATEGORIES.map((cat) => (
						<option
							key={cat.value}
							value={cat.value}
						>
							{cat.label}
						</option>
					))}
				</select>
			</div> */}
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
						<Listbox.Button className="relative w-full cursor-default  border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
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
											`relative cursor-default select-none py-2 pl-10 pr-4 ${
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
					className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file: file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
				/>
				{/* Optional: Preview selected photos */}
				{photos.length > 0 && (
					<div className="mt-2 text-xs text-gray-600">
						Selected: {photos.map((f) => f.name).join(", ")}
					</div>
				)}
			</div>

			{/* Submit Button */}
			<div className="pt-4">
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full flex justify-center py-3 px-4 border border-transparent  shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
				>
					{isSubmitting
						? "Submitting..."
						: isEditing
						? "Update Recommendation"
						: "Create Recommendation"}
				</button>
			</div>
		</form>
	);
}
