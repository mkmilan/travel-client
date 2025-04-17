// filepath: /home/mkmilan/Documents/my/travel-2/client/src/app/search/page.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import { FaSearch, FaUserPlus, FaUserCheck, FaUserMinus } from "react-icons/fa"; // Add follow icons

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
			className={`flex items-center px-3 py-1 rounded text-xs text-white disabled:opacity-50 ${
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

export default function SearchPage() {
	const { user: loggedInUser, token } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [followingMap, setFollowingMap] = useState({}); // Track following status for search results
	const [followLoadingMap, setFollowLoadingMap] = useState({}); // Track loading state per user button

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
					`${API_URL}/users/search?q=${encodeURIComponent(searchTerm)}`,
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
				// Filter out the logged-in user from the results
				const filteredResults = data.filter((u) => u._id !== loggedInUser?._id);
				setResults(filteredResults);
			} catch (err) {
				console.error("Search error:", err);
				setError(err.message);
				setResults([]); // Clear results on error
			} finally {
				setLoading(false);
			}
		}, 500); // Delay API call by 500ms after user stops typing

		return () => clearTimeout(delayDebounceFn); // Cleanup timeout on unmount or searchTerm change
	}, [searchTerm, token, loggedInUser]);

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

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Find Users</h1>
			<div className="relative mb-4">
				<input
					type="text"
					placeholder="Search by username..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
			</div>

			{loading && <p className="text-center text-gray-500">Searching...</p>}
			{error && <p className="text-center text-red-500">{error}</p>}

			<div className="mt-4 bg-white rounded-md shadow border border-gray-200">
				{results.length > 0
					? results.map((user) => (
							<UserResultItem
								key={user._id}
								user={user}
								onFollowToggle={handleFollowToggle}
								isFollowing={!!followingMap[user._id]} // Check if user ID is in the map
								followLoading={!!followLoadingMap[user._id]} // Check loading state for this user
							/>
					  ))
					: !loading &&
					  searchTerm.trim().length >= 2 && (
							<p className="p-4 text-center text-gray-500">
								No users found matching "{searchTerm}".
							</p>
					  )}
				{!loading && searchTerm.trim().length < 2 && results.length === 0 && (
					<p className="p-4 text-center text-gray-400">
						Enter at least 2 characters to search.
					</p>
				)}
			</div>
		</div>
	);
}
