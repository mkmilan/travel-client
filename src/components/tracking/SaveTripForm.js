// src/components/tracking/SaveTripForm.jsx
"use client";
import React, { useState, useEffect } from "react";

export default function SaveTripForm({
	initialTitle = "",
	pointsCount,
	onSave,
	onCancel,
	isSaving,
	saveError,
}) {
	const [title, setTitle] = useState(initialTitle);
	const [description, setDescription] = useState("");
	const [startLocationName, setStartLocationName] = useState("");
	const [endLocationName, setEndLocationName] = useState("");

	// Update title if initialTitle prop changes (e.g., after points are loaded)
	useEffect(() => {
		setTitle(initialTitle);
	}, [initialTitle]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!title.trim()) {
			// Basic client validation, hook handles more
			alert("Title is required.");
			return;
		}
		// Pass form data up to the parent to handle API call via hook
		onSave({
			title: title.trim(),
			description: description.trim(),
			startLocationName: startLocationName.trim(),
			endLocationName: endLocationName.trim(),
		});
	};

	return (
		<div className="mt-2">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Save Your Trip</h2>
			<form
				onSubmit={handleSubmit}
				id="saveTripForm"
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
						className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
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
						placeholder="Add notes about your journey..."
						className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
					/>
				</div>
				{/* Start/End Location */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="startLocationName"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Start Location (e.g., City)
						</label>
						<input
							type="text"
							id="startLocationName"
							value={startLocationName}
							onChange={(e) => setStartLocationName(e.target.value)}
							maxLength={100}
							placeholder="City, State/Region"
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
						/>
					</div>
					<div>
						<label
							htmlFor="endLocationName"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							End Location (e.g., City)
						</label>
						<input
							type="text"
							id="endLocationName"
							value={endLocationName}
							onChange={(e) => setEndLocationName(e.target.value)}
							maxLength={100}
							placeholder="City, State/Region"
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
						/>
					</div>
				</div>
				{/* Summary Info */}
				<div className="text-sm text-gray-600 pt-2">
					<p>Points Recorded: {pointsCount}</p>
				</div>
				{/* Save Error Display */}
				{saveError && (
					<p className="text-red-600 p-3 bg-red-100 rounded border border-red-400">
						{saveError}
					</p>
				)}
				{/* Form Actions are rendered in parent */}
			</form>
		</div>
	);
}
