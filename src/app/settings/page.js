"use client";

import React, { useState, useEffect, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import Link from "next/link";
import { Listbox, Transition } from "@headlessui/react";
import {
	FaSave,
	FaTimes,
	FaSpinner,
	FaArrowLeft,
	FaCheck,
	FaChevronDown,
} from "react-icons/fa";

const visibilityOptions = [
	{ value: "public", label: "Public (Everyone)" },
	{ value: "followers_only", label: "Followers Only" },
	{ value: "private", label: "Private (Only Me)" },
];

const travelModeOptions = [
	{ value: "motorhome", label: "Motorhome" },
	{ value: "campervan", label: "Campervan" },
	{ value: "car", label: "Car" },
	{ value: "motorcycle", label: "Motorcycle" },
	{ value: "bicycle", label: "Bicycle" },
	{ value: "walking", label: "Walking" },
];

const unitOptions = [
	{ value: "metric", label: "Metric (km, °C)" },
	{ value: "imperial", label: "Imperial (miles, °F)" },
];

const themeOptions = [
	{ value: "light", label: "Light Mode" },
	{ value: "dark", label: "Dark Mode" },
	{ value: "system", label: "System Default" },
];

const dateFormatOptions = [
	{ value: "MM/DD/YYYY", label: "MM/DD/YYYY (e.g., 05/10/2025)" },
	{ value: "DD/MM/YYYY", label: "DD/MM/YYYY (e.g., 10/05/2025)" },
	{ value: "YYYY-MM-DD", label: "YYYY-MM-DD (e.g., 2025-05-10)" },
];

const timeFormatOptions = [
	{ value: "12h", label: "12-hour (e.g., 3:30 PM)" },
	{ value: "24h", label: "24-hour (e.g., 15:30)" },
];

const UserSettingsPage = () => {
	const {
		user,
		loading: authLoading,
		setUser: setAuthUser,
		isAuthenticated,
		csrfToken,
	} = useAuth();
	const router = useRouter();

	const [settings, setSettings] = useState({
		defaultTripVisibility: "public",
		defaultTravelMode: "motorhome",
		preferredUnits: "metric",
		themePreference: "system",
		dateFormat: "YYYY-MM-DD",
		timeFormat: "24h",
	});
	const [initialSettings, setInitialSettings] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const fetchSettings = useCallback(async () => {
		if (!isAuthenticated) return;
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${API_URL}/users/settings`, {
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken,
				},
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || "Failed to fetch settings");
			}
			setSettings(data);
			setInitialSettings(JSON.parse(JSON.stringify(data)));
		} catch (err) {
			setError(err.message);
			console.error("Fetch settings error:", err);
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (authLoading) return;
		if (!user) {
			router.push("/login");
			return;
		}
		fetchSettings();
	}, [user, isAuthenticated, authLoading, router, fetchSettings]);

	const handleSettingChange = (name, value) => {
		setSettings((prev) => ({ ...prev, [name]: value }));
		setSuccess("");
		setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isAuthenticated) return;
		setSaving(true);
		setError("");
		setSuccess("");
		try {
			const res = await fetch(`${API_URL}/users/settings`, {
				method: "PUT",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken,
				},
				body: JSON.stringify(settings),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || "Failed to update settings");
			}
			setSettings(data.settings);
			setInitialSettings(JSON.parse(JSON.stringify(data.settings)));
			if (user && setAuthUser) {
				const updatedUser = {
					...user,
					settings: data.settings,
				};
				setAuthUser(updatedUser);
			}
			setSuccess("Settings updated successfully!");
		} catch (err) {
			setError(err.message);
			console.error("Update settings error:", err);
		} finally {
			setSaving(false);
			router.push(`/profile/${user._id}`);
		}
	};

	const handleReset = () => {
		if (initialSettings) {
			setSettings(JSON.parse(JSON.stringify(initialSettings)));
		}
		setError("");
		setSuccess("");
	};

	if (authLoading || loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<FaSpinner className="animate-spin text-4xl text-blue-500" />
			</div>
		);
	}

	if (!user) {
		return null;
	}

	const formIsUnchanged =
		JSON.stringify(settings) === JSON.stringify(initialSettings);

	const renderListbox = (name, label, currentValue, options) => {
		const selectedOption = options.find((opt) => opt.value === currentValue);
		return (
			<div>
				<Listbox
					value={currentValue}
					onChange={(value) => handleSettingChange(name, value)}
					name={name}
				>
					<div className="relative mt-1">
						<Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
							{label}
						</Listbox.Label>
						<Listbox.Button className="relative w-full cursor-default border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
							<span className="block truncate">
								{selectedOption ? selectedOption.label : "Select..."}
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
								{options.map((option) => (
									<Listbox.Option
										key={option.value}
										className={({ active }) =>
											`relative cursor-default select-none py-2 pl-10 pr-4 ${
												active ? "bg-blue-100 text-blue-900" : "text-gray-900"
											}`
										}
										value={option.value}
									>
										{({ selected }) => (
											<>
												<span
													className={`block truncate ${
														selected ? "font-medium" : "font-normal"
													}`}
												>
													{option.label}
												</span>
												{selected ? (
													<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
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
			</div>
		);
	};

	return (
		<div className="max-w-2xl mx-auto p-4 md:p-8">
			<div className="mb-6">
				<Link
					href={`/profile/${user._id}`}
					className="text-blue-600 hover:underline flex items-center"
				>
					<FaArrowLeft className="mr-2" /> Back to Profile
				</Link>
				<h1 className="text-3xl font-bold text-gray-800 mt-2">
					Account Settings
				</h1>
			</div>

			{error && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300">
					{error}
				</div>
			)}
			{success && (
				<div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300">
					{success}
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-6 bg-white p-6 shadow border border-gray-200"
			>
				{renderListbox(
					"defaultTripVisibility",
					"Default Trip Visibility",
					settings.defaultTripVisibility,
					visibilityOptions
				)}
				{renderListbox(
					"defaultTravelMode",
					"Default Travel Mode",
					settings.defaultTravelMode,
					travelModeOptions
				)}
				{renderListbox(
					"preferredUnits",
					"Preferred Units",
					settings.preferredUnits,
					unitOptions
				)}
				{renderListbox(
					"themePreference",
					"Theme Preference",
					settings.themePreference,
					themeOptions
				)}
				{renderListbox(
					"dateFormat",
					"Date Format",
					settings.dateFormat,
					dateFormatOptions
				)}
				{renderListbox(
					"timeFormat",
					"Time Format",
					settings.timeFormat,
					timeFormatOptions
				)}

				<div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
					<button
						type="button"
						onClick={handleReset}
						disabled={saving || formIsUnchanged}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
					>
						<FaTimes className="inline mr-1" /> Reset
					</button>
					<button
						type="submit"
						disabled={saving || formIsUnchanged}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
					>
						{saving ? (
							<FaSpinner className="animate-spin mr-2" />
						) : (
							<FaSave className="mr-2" />
						)}
						{saving ? "Saving..." : "Save Changes"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default UserSettingsPage;
