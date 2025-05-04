// filepath: /home/mkmilan/Documents/my/travel-2/client/src/app/search/page.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import {
	FaSearch,
	FaUserPlus,
	FaUserCheck,
	FaUserMinus,
	FaRegCalendarAlt,
	FaRoute,
	FaMapMarkerAlt,
	FaStar,
	FaTag,
	FaMap,
} from "react-icons/fa"; // Add follow icons

// Placeholder for User Result Item
const UserResultItem = ({
	user,
	onFollowToggle,
	isFollowing,
	followLoading,
}) => (
	<div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50">
		<Link
			href={`/profile/${user._id}`}
			className="flex items-center space-x-3 no-underline text-gray-800 hover:text-blue-600"
		>
			<img
				src={user.profilePictureUrl || "/default-avatar.png"}
				alt={user.username}
				className="w-10 h-10 rounded-full object-cover"
			/>
			<span>{user.username}</span>
		</Link>
		{/* Add Follow/Unfollow Button Here - Logic needs connection */}
		{/* Example Button (needs state management from parent) */}
		<button
			onClick={() => onFollowToggle(user._id, isFollowing)}
			disabled={followLoading}
			className={`flex items-center px-3 py-1  text-xs text-white disabled:opacity-50 ${
				isFollowing
					? "bg-gray-500 hover:bg-gray-600"
					: "bg-green-500 hover:bg-green-600"
			}`}
		>
			{followLoading ? (
				"..."
			) : isFollowing ? (
				<FaUserMinus className="mr-1" />
			) : (
				<FaUserPlus className="mr-1" />
			)}
			{isFollowing ? "Unfollow" : "Follow"}
		</button>
	</div>
);

// --- Trip Result Item ---
const TripResultItem = ({ trip }) => (
	<div className="p-3 border-b border-gray-200 hover:bg-gray-50">
		<Link
			href={`/trips/${trip._id}`}
			className="text-blue-600 hover:underline font-medium block mb-1"
		>
			<FaRoute className="inline mr-1.5 mb-0.5 text-gray-500" />
			{trip.title}
		</Link>
		<div className="text-xs text-gray-600 space-y-1">
			<p>
				by{" "}
				<Link
					href={`/profile/${trip.user?._id}`}
					className="text-gray-700 hover:underline"
				>
					{trip.user?.username || "Unknown User"}
				</Link>
			</p>
			{trip.startDate && (
				<p className="flex items-center">
					<FaRegCalendarAlt className="mr-1.5 text-gray-500" />
					{new Date(trip.startDate).toLocaleDateString()}
				</p>
			)}
			{(trip.startLocationName || trip.endLocationName) && (
				<p className="flex items-center">
					<FaMapMarkerAlt className="mr-1.5 text-gray-500" />
					{trip.startLocationName || "Start"} to {trip.endLocationName || "End"}
				</p>
			)}
		</div>
	</div>
);

// --- Recommendation Result Item ---
const RecommendationResultItem = ({ recommendation }) => (
	<div className="p-3 border-b border-gray-200 hover:bg-gray-50">
		<Link
			href={`/recommendations/${recommendation._id}`} // Assuming a detail page exists or will be created
			className="text-blue-600 hover:underline font-medium block mb-1"
		>
			<FaStar className="inline mr-1.5 mb-0.5 text-yellow-500" />
			{recommendation.name}
		</Link>
		<div className="text-xs text-gray-600 space-y-1">
			<p>
				by{" "}
				<Link
					href={`/profile/${recommendation.user?._id}`}
					className="text-gray-700 hover:underline"
				>
					{recommendation.user?.username || "Unknown User"}
				</Link>
			</p>
			{recommendation.primaryCategory && (
				<p className="flex items-center">
					<FaTag className="mr-1.5 text-gray-500" />
					{recommendation.primaryCategory}
				</p>
			)}
			{/* Optional: Display rating or location if available */}
			{/* {recommendation.rating && <p>Rating: {recommendation.rating}/5</p>} */}
			{/* {recommendation.location?.coordinates && <p>Location: {recommendation.location.coordinates.join(', ')}</p>} */}
		</div>
	</div>
);

export default function SearchPage() {
	const { user: loggedInUser, token } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [followingMap, setFollowingMap] = useState({}); // Track following status for search results
	const [followLoadingMap, setFollowLoadingMap] = useState({}); // Track loading state per user button
	const [searchType, setSearchType] = useState("users");

	// Fetch initial following list for the logged-in user to correctly display button states
	useEffect(() => {
		if (loggedInUser?.following) {
			const initialMap = {};
			loggedInUser.following.forEach((id) => {
				initialMap[id] = true;
			});
			setFollowingMap(initialMap);
		}
	}, [loggedInUser]);

	// Debounced search effect
	useEffect(() => {
		if (searchTerm.trim().length < 2) {
			// Don't search for very short terms
			setResults([]);
			return;
		}

		const delayDebounceFn = setTimeout(async () => {
			setLoading(true);
			setError("");
			try {
				// **Need to create this API endpoint**
				const res = await fetch(
					`${API_URL}/search?q=${encodeURIComponent(
						searchTerm
					)}&type=${searchType}`,
					{
						headers: {
							// Include token if you want to personalize results or check follow status server-side
							Authorization: `Bearer ${token}`,
						},
					}
				);
				const data = await res.json();
				console.log("Search results:", data);

				if (!res.ok) {
					throw new Error(data.message || "Failed to search users");
				}
				// // Filter out the logged-in user from the results
				// const filteredResults = data.filter((u) => u._id !== loggedInUser?._id);
				// setResults(filteredResults);

				// Filter out the logged-in user from the results ONLY if searching users
				if (searchType === "users") {
					const filteredResults = data.filter(
						(u) => u._id !== loggedInUser?._id
					);
					setResults(filteredResults);
				} else {
					setResults(data); // For trips/recommendations, show all results
				}
			} catch (err) {
				console.error("Search error:", err);
				setError(err.message);
				setResults([]); // Clear results on error
			} finally {
				setLoading(false);
			}
		}, 500); // Delay API call by 500ms after user stops typing

		return () => clearTimeout(delayDebounceFn); // Cleanup timeout on unmount or searchTerm change
	}, [searchTerm, searchType, token, loggedInUser]);

	// Follow/Unfollow Handler for Search Results
	const handleFollowToggle = async (userIdToToggle, currentlyFollowing) => {
		if (!loggedInUser || !token) {
			alert("Please log in to follow users.");
			return;
		}
		if (followLoadingMap[userIdToToggle]) return; // Prevent multiple clicks

		setFollowLoadingMap((prev) => ({ ...prev, [userIdToToggle]: true }));
		setError("");

		const url = `${API_URL}/users/${userIdToToggle}/follow`;
		const method = currentlyFollowing ? "DELETE" : "POST";

		try {
			const res = await fetch(url, {
				method: method,
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message ||
						`Failed to ${currentlyFollowing ? "unfollow" : "follow"}`
				);
			}

			// Update the following map state
			setFollowingMap((prev) => ({
				...prev,
				[userIdToToggle]: !currentlyFollowing,
			}));
			console.log(data.message);
		} catch (err) {
			console.error("Follow/Unfollow error:", err);
			setError(`Error: ${err.message}`);
		} finally {
			setFollowLoadingMap((prev) => ({ ...prev, [userIdToToggle]: false }));
		}
	};

	const renderResults = () => {
		if (results.length === 0) {
			if (!loading && searchTerm.trim().length >= 2) {
				return (
					<p className="p-2 text-center text-gray-500">
						No {searchType} found matching "{searchTerm}".
					</p>
				);
			}
			if (!loading && searchTerm.trim().length < 2) {
				return (
					<p className="p-2 text-center text-gray-400">
						Enter at least 2 characters to search.
					</p>
				);
			}
			return null; // Don't show anything while loading or if search term is too short
		}

		switch (searchType) {
			case "users":
				return results.map((user) => (
					<UserResultItem
						key={user._id}
						user={user}
						onFollowToggle={handleFollowToggle}
						isFollowing={!!followingMap[user._id]}
						followLoading={!!followLoadingMap[user._id]}
					/>
				));
			case "trips":
				return results.map((trip) => (
					<TripResultItem
						key={trip._id}
						trip={trip}
					/>
				));
			case "recommendations":
				return results.map((rec) => (
					<RecommendationResultItem
						key={rec._id}
						recommendation={rec}
					/>
				));
			default:
				return <p className="p-4 text-red-500">Unknown search type.</p>;
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4 text-center">Search</h1>
			<div className="relative mb-4">
				<input
					type="text"
					placeholder={`Search for ${
						searchType === "recommendations" ? "category" : searchType
					}...`}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full p-2 pl-10 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
			</div>

			{/* Search Type Selection Buttons */}
			<div className="flex justify-center space-x-2 mb-6">
				{/* <button
					onClick={() => setSearchType("users")}
					className={`px-4 py-1  ${
						searchType === "users"
							? "bg-blue-600 text-white"
							: "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					Users
				</button>
				<button
					onClick={() => setSearchType("trips")}
					className={`px-4 py-1  ${
						searchType === "trips"
							? "bg-blue-600 text-white"
							: "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					Trips
				</button>
				<button
					onClick={() => setSearchType("recommendations")}
					className={`px-4 py-1  ${
						searchType === "recommendations"
							? "bg-blue-600 text-white"
							: "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					Recommendations
				</button> */}
				{["users", "trips", "recommendations"].map((type) => (
					<button
						key={type}
						onClick={() => setSearchType(type)}
						className={`px-4 py-1  capitalize transition-colors cursor-pointer ${
							searchType === type
								? "bg-blue-600 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						{type}
					</button>
				))}
			</div>

			{loading && <p className="text-center text-gray-500">Searching...</p>}
			{error && <p className="text-center text-red-500">{error}</p>}

			<div className="mt-4 bg-white shadow border border-gray-200">
				{renderResults()}
			</div>
		</div>
	);
}
