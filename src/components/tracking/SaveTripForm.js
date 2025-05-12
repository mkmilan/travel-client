// src/components/tracking/SaveTripForm.jsx
"use client";
import React, { useState, useEffect, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
	FaBus,
	FaCaravan,
	FaCar,
	FaMotorcycle,
	FaBicycle,
	FaWalking,
	FaChevronDown,
	FaQuestionCircle,
} from "react-icons/fa";

const travelModeOptionsList = [
	{ id: "motorhome", name: "Motorhome", icon: FaBus },
	{ id: "campervan", name: "Campervan", icon: FaCaravan },
	{ id: "car", name: "Car", icon: FaCar },
	{ id: "motorcycle", name: "Motorcycle", icon: FaMotorcycle },
	{ id: "bicycle", name: "Bicycle", icon: FaBicycle },
	{ id: "walking", name: "Walk/Hike", icon: FaWalking },
];

export default function SaveTripForm({
	initialTitle = "",
	pointsCount,
	poisCount,
	pendingRecommendationsCount = 0,
	onSave,
	// onCancel,
	isSaving,
	saveError,
	initialStartLocationName = "",
	initialEndLocationName = "",
	defaultTravelMode = "motorhome",
}) {
	const [title, setTitle] = useState(initialTitle);
	const [description, setDescription] = useState("");
	const [startLocationName, setStartLocationName] = useState(
		initialStartLocationName
	);
	const [endLocationName, setEndLocationName] = useState(
		initialEndLocationName
	);
	const [selectedTravelMode, setSelectedTravelMode] = useState(
		travelModeOptionsList.find((opt) => opt.id === defaultTravelMode) ||
			travelModeOptionsList.find((opt) => opt.id === "motorhome") || // Fallback
			travelModeOptionsList[0]
	);
	// Update title if initialTitle prop changes (e.g., after points are loaded)
	useEffect(() => {
		setTitle(initialTitle);
	}, [initialTitle]);
	// Update start location if prop changes (e.g., after async fetch)
	useEffect(() => {
		setStartLocationName(initialStartLocationName);
	}, [initialStartLocationName]);

	// Update end location if prop changes (e.g., after async fetch)
	useEffect(() => {
		setEndLocationName(initialEndLocationName);
	}, [initialEndLocationName]);

	// Update travel mode if initialTravelMode prop changes
	useEffect(() => {
		const mode =
			travelModeOptionsList.find((opt) => opt.id === defaultTravelMode) ||
			travelModeOptionsList.find((opt) => opt.id === "motorhome");
		if (mode) {
			setSelectedTravelMode(mode);
		}
	}, [defaultTravelMode]);

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
			defaultTravelMode: selectedTravelMode.id,
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
						className="block w-full px-3 py-2 border border-gray-300  shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
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
						className="block w-full px-3 py-2 border border-gray-300  shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
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
							placeholder={
								initialStartLocationName === "Fetching..."
									? "Fetching..."
									: "City"
							}
							className="block w-full px-3 py-2 border border-gray-300  shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
							disabled={initialStartLocationName === "Fetching..."}
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
							placeholder={
								initialEndLocationName === "Fetching..."
									? "Fetching..."
									: "City"
							}
							className="block w-full px-3 py-2 border border-gray-300  shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
							disabled={initialEndLocationName === "Fetching..."}
						/>
					</div>
				</div>
				{/* Travel Mode Selector */}
				<div>
					<Listbox
						value={selectedTravelMode}
						onChange={setSelectedTravelMode}
					>
						<Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
							Travel Mode
						</Listbox.Label>
						<div className="relative mt-1">
							<Listbox.Button className="relative w-full cursor-default bg-white py-2 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600">
								<span className="flex items-center">
									<selectedTravelMode.icon
										className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0"
										aria-hidden="true"
									/>
									<span className="block truncate">
										{selectedTravelMode.name}
									</span>
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
								<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
									{travelModeOptionsList.map((option) => (
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
				{/* Summary Info */}
				<div className="text-sm text-gray-600 pt-2 space-y-1">
					<p>Points Recorded: {pointsCount}</p>
					<p>Points of Interest Marked: {poisCount}</p>
					{/* Display Pending Recommendations Count */}
					{pendingRecommendationsCount > 0 && (
						<p className="text-purple-700 font-medium">
							{" "}
							{/* Style pending count */}
							Pending Recommendations to Save: {pendingRecommendationsCount}
						</p>
					)}
				</div>
				{/* Save Error Display */}
				{saveError && (
					<p className="text-red-600 p-3 bg-red-100  border border-red-400">
						{saveError}
					</p>
				)}
				{/* Form Actions are rendered in parent */}
			</form>
		</div>
	);
}
