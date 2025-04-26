// src/components/trips/TripCard.jsx
"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { formatDistance, formatDuration } from "@/utils/formatters";

// Import icons (choose appropriate ones)
import {
	FaHeart,
	FaRegHeart,
	FaRegComment,
	FaClock,
	FaRoute,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";

// Dynamically import MiniMap
const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
	ssr: false,
	loading: () => (
		<div className="h-40 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
			Loading Map...
		</div>
	),
});

export default function TripCard({ trip }) {
	const { user: loggedInUser, token } = useAuth();
	const [localLikesCount, setLocalLikesCount] = useState(trip?.likesCount || 0);
	const [isLikedByMe, setIsLikedByMe] = useState(false); // We need a way to determine initial state
	const [likeInProgress, setLikeInProgress] = useState(false);
	const [likeError, setLikeError] = useState("");

	if (!trip) return null;
	// console.log("TripCard trip:", trip);

	const durationStr = formatDuration(trip.durationMillis);
	const distanceStr = formatDistance(trip.distanceMeters);

	const handleLikeToggle = async (e) => {
		e.preventDefault(); // Prevent link navigation when clicking the button
		e.stopPropagation(); // Stop event bubbling up to the Link

		if (!loggedInUser || !token) {
			alert("Please log in to like trips."); // Or redirect
			return;
		}
		if (likeInProgress) return; // Prevent multiple clicks

		setLikeInProgress(true);
		setLikeError("");

		const method = isLikedByMe ? "DELETE" : "POST";
		const url = `${API_URL}/trips/${trip._id}/like`;

		try {
			const res = await fetch(url, {
				method: method,
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json(); // Backend returns new count

			if (!res.ok) {
				throw new Error(
					data.message || `Failed to ${method === "POST" ? "like" : "unlike"}`
				);
			}

			// Update UI optimistically based on the action attempted
			setIsLikedByMe(!isLikedByMe);
			setLocalLikesCount((prevCount) =>
				isLikedByMe ? prevCount - 1 : prevCount + 1
			);
			// Or use the count from the response: setLocalLikesCount(data.likesCount);

			console.log(`Trip ${method === "POST" ? "liked" : "unliked"}`);
		} catch (err) {
			console.error("Like/Unlike error:", err);
			setLikeError(err.message);
			// Revert optimistic update if needed (optional)
			// setIsLikedByMe(isLikedByMe); // Revert state
			// setLocalLikesCount(localLikesCount); // Revert count
			// Show error to user briefly?
			setTimeout(() => setLikeError(""), 3000); // Clear error after 3s
		} finally {
			setLikeInProgress(false);
		}
	};

	// Prevent card navigation when clicking buttons inside
	const stopPropagation = (e) => {
		e.stopPropagation();
	};

	return (
		<Link
			href={`/trips/${trip._id}`}
			className="block bg-white  shadow border border-gray-200 overflow-hidden hover:shadow-lg transition duration-200 ease-in-out"
		>
			<div className="p-4">
				{/* Header */}
				{trip?.user && (
					<div className="mt-2 text-sm text-gray-500">
						Posted by:
						{/* <Link
						href={`/profile/${trip.user._id}`}
						className="ml-1 text-blue-600 hover:underline font-medium"
					> */}
						{trip.user.username}
						{/* </Link> */}
					</div>
				)}

				<div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2">
					<div>
						<h2 className="text-xl font-semibold text-blue-800 mb-0 leading-tight">
							{trip.title}
						</h2>
						<p className="text-sm text-gray-500">
							{trip.startLocationName || "Unknown"} to{" "}
							{trip.endLocationName || "Unknown"}
						</p>
					</div>
					<div className="flex items-center space-x-3 text-sm text-gray-600 mt-1 sm:mt-0 whitespace-nowrap">
						{durationStr !== "N/A" && (
							<span className="flex items-center">
								<FaClock className="mr-1" /> {durationStr}
							</span>
						)}
						{distanceStr !== "N/A" && (
							<span className="flex items-center">
								<FaRoute className="mr-1" /> {distanceStr}
							</span>
						)}
					</div>
				</div>
				{/* Description Snippet */}
				{trip.description && (
					<p className="text-sm text-gray-600 mb-3 italic">
						{trip.description}
						{trip.description.length === 150 ? "..." : ""}
					</p>
				)}
			</div>

			{/* Map Preview */}
			<div className="h-60 md:h-80 w-full bg-gray-100">
				{" "}
				{/* Fixed height container */}
				<MiniMap simplifiedRouteGeoJson={trip.simplifiedRoute} />
			</div>

			{/* Footer Stats/Social */}
			<div className="p-4 border-t border-gray-100 flex justify-between items-center">
				{/* TODO: Add Avg Speed, Max Speed, Elevation when available */}
				<div className="text-xs text-gray-500">
					{/* Placeholders */}
					{/* <span>Avg Speed: N/A</span> | <span>Max Speed: N/A</span> | <span>Elevation: N/A</span> */}
				</div>
				<div className="flex items-center space-x-4 text-sm text-gray-600">
					<button
						onClick={handleLikeToggle}
						disabled={likeInProgress || !loggedInUser} // Disable if loading or not logged in
						className={`flex items-center p-1 rounded hover:bg-red-100 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-150 ${
							isLikedByMe ? "text-red-500" : "text-gray-500"
						}`}
						aria-label={isLikedByMe ? "Unlike trip" : "Like trip"}
						title={isLikedByMe ? "Unlike" : "Like"}
					>
						{isLikedByMe ? (
							<FaHeart className="mr-1 h-4 w-4" />
						) : (
							<FaRegHeart className="mr-1 h-4 w-4" />
						)}
						<span className="font-medium">{localLikesCount}</span>
					</button>
					<span className="flex items-center">
						<FaRegComment className="mr-1 text-blue-500" />{" "}
						{trip.commentsCount || 0}
					</span>
					{/* Share button placeholder/omitted */}
					{/* <button className="flex items-center"><FaShareAlt className="mr-1" /> Share</button> */}
				</div>
			</div>
		</Link>
	);
}
