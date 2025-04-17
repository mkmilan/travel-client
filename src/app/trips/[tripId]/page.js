// src/app/trips/[tripId]/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext"; // To check ownership for Edit/Delete buttons
import { formatDuration, formatDistance } from "@/utils/formatters";
import { API_URL } from "@/utils/config";

import CommentList from "@/components/comments/CommentList";
import AddCommentForm from "@/components/comments/AddCommentForm";

// --- Dynamically import the Map component ---
// Ensure it only loads on the client side (ssr: false)
const TripMap = dynamic(() => import("@/components/map/TripMap"), {
	ssr: false, // Disable Server-Side Rendering for this component
	loading: () => (
		<div className="bg-gray-200 h-80 md:h-96 rounded-lg flex items-center justify-center text-gray-600">
			Loading Map...
		</div>
	), // Optional loading indicator
});

// Simple Loading Component
const LoadingComponent = () => (
	<div className="flex justify-center items-center h-screen">
		<p>Loading trip details...</p>
		{/* Or use a spinner */}
	</div>
);

// Simple Error Component
const ErrorComponent = ({ message }) => (
	<div className="text-center py-10">
		<p className="text-red-600">Error: {message}</p>
		<Link
			href={`/feed`}
			className="text-blue-600 hover:underline mt-4 inline-block"
		>
			Go back to Feed
		</Link>
	</div>
);

export default function TripDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { tripId } = params;
	const { user: loggedInUser, token, loading: authLoading } = useAuth();

	const [trip, setTrip] = useState(null);
	const [comments, setComments] = useState([]);
	const [commentsLoading, setCommentsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [commentsError, setCommentsError] = useState("");

	// Fetch trip data
	useEffect(() => {
		if (tripId) {
			const fetchTrip = async () => {
				setLoading(true);
				setError("");
				try {
					// Use relative URL if proxying is set up, else full URL
					const res = await fetch(`${API_URL}/trips/${tripId}`);
					const data = await res.json();

					if (!res.ok) {
						throw new Error(
							data.message || `Failed to fetch trip (${res.status})`
						);
					}
					setTrip(data);
				} catch (err) {
					console.error("Error fetching trip details:", err);
					setError(err.message);
				} finally {
					setLoading(false);
				}
			};
			fetchTrip();
		} else {
			setError("Trip ID missing."); // Should not happen normally
			setLoading(false);
		}
	}, [tripId, authLoading]); // Re-fetch if tripId changes

	const fetchComments = useCallback(async () => {
		if (!tripId) return;
		console.log(`Fetching comments for trip ${tripId}`);
		setCommentsLoading(true);
		setCommentsError("");
		try {
			const res = await fetch(`${API_URL}/trips/${tripId}/comments`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to fetch comments");
			setComments(data); // Set the fetched comments
			console.log("Comments fetched:", data);
		} catch (err) {
			console.error("Error fetching comments:", err);
			setCommentsError(err.message);
		} finally {
			setCommentsLoading(false);
		}
	}, [tripId]);

	useEffect(() => {
		if (trip) {
			// Only fetch comments if trip data is loaded
			fetchComments();
		}
	}, [trip, fetchComments]);

	const handleCommentAdded = (newComment) => {
		// Add the new comment to the beginning of the list for immediate UI update
		setComments((prevComments) => [newComment, ...prevComments]);
		// Optionally update comment count in trip state if needed elsewhere
		setTrip((prevTrip) => ({
			...prevTrip,
			commentsCount: (prevTrip.commentsCount || 0) + 1, // Increment count if available
		}));
	};

	// Check if the logged-in user owns this trip
	const isOwner =
		!authLoading && loggedInUser && trip && loggedInUser._id === trip.user._id;

	const handleDeleteTrip = async () => {
		// Confirmation dialog
		if (
			!window.confirm(
				`Are you sure you want to permanently delete the trip "${
					trip?.title || "this trip"
				}"? This cannot be undone.`
			)
		) {
			return; // User cancelled
		}

		if (!token) {
			setError("Authentication error: Cannot delete trip.");
			setIsDeleting(false); // Reset state
			return;
		}

		setIsDeleting(true);
		setError(""); // Clear previous errors

		try {
			const res = await fetch(`${API_URL}/trips/${tripId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Check if response is ok OR if it's a 204 No Content
			if (!res.ok && res.status !== 204) {
				let errorData = {
					message: `Failed to delete trip (${res.status} ${res.statusText})`,
				};
				try {
					// Try parsing JSON error message if available
					const potentialErrorData = await res.json();
					if (potentialErrorData.message) {
						errorData.message = potentialErrorData.message;
					}
				} catch (parseError) {
					console.warn("Could not parse error response as JSON:", parseError);
					// Use statusText if JSON parsing fails
					errorData.message = `Failed to delete trip (${res.status} ${res.statusText})`;
				}
				throw new Error(errorData.message);
			}

			// Success
			console.log("Trip deleted successfully");
			// alert("Trip deleted successfully!");
			// Redirect to user's trips page or feed
			router.push(`/my-trips`);
		} catch (err) {
			console.error("Error deleting trip:", err);
			setError(`Delete failed: ${err.message || "An unknown error occurred."}`);
			setIsDeleting(false);
		}
		// No finally needed if redirecting on success
	};

	// --- Render Logic ---
	if (loading || authLoading) {
		// Wait for both trip data and auth check
		return <LoadingComponent />;
	}

	if (error) {
		return <ErrorComponent message={error} />;
	}

	if (!trip) {
		return <ErrorComponent message="Trip not found." />;
	}

	return (
		<div className="max-w-6xl mx-auto p-4">
			{/* Header Section */}
			<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-1">
							{trip.title}
						</h1>
						<div className="flex items-center text-sm text-gray-600">
							<Link
								href={`/profile/${trip.user._id}`}
								className="flex items-center hover:underline"
							>
								<Image
									src={trip.user.profilePictureUrl || `/default-avatar.png`}
									alt={trip.user.username}
									width={24}
									height={24}
									className="rounded-full mr-2 object-cover"
								/>
								<span>{trip.user.username}</span>
							</Link>
							<span className="mx-2">·</span>
							<span>{new Date(trip.startDate).toLocaleDateString()}</span>
						</div>
					</div>
					{/* Edit/Delete Buttons for Owner */}
					{isOwner && (
						<div className="mt-2 sm:mt-0 space-x-2">
							<Link
								href={`/trips/${tripId}/edit`}
								className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded no-underline"
							>
								Edit
							</Link>
							<button
								onClick={handleDeleteTrip} // Attach handler
								disabled={isDeleting} // Disable while deleting
								className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</button>
						</div>
					)}
					{error && (
						<p className="text-red-500 text-sm mt-2 text-center">{error}</p>
					)}
				</div>

				{/* Basic Info */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4 border-t border-b border-gray-200 py-4">
					<div>
						<p className="text-xs text-gray-500 uppercase">From</p>
						<p className="font-medium text-gray-800">
							{trip.startLocationName || "N/A"}
						</p>
					</div>
					<div>
						<p className="text-xs text-gray-500 uppercase">To</p>
						<p className="font-medium text-gray-800">
							{trip.endLocationName || "N/A"}
						</p>
					</div>
					<div>
						<p className="text-xs text-gray-500 uppercase">Duration</p>
						<p className="font-medium text-gray-800">
							{formatDuration(trip.durationMillis)}
						</p>
					</div>
					<div>
						<p className="text-xs text-gray-500 uppercase">Distance</p>
						<p className="font-medium text-gray-800">
							{formatDistance(trip.distanceMeters)}
						</p>
					</div>
				</div>

				{/* Description */}
				{trip.description && (
					<div className="prose max-w-none text-gray-700">
						<p>{trip.description}</p>
					</div>
				)}
			</div>

			{/* Map Section (Placeholder) */}
			<div className=" mb-6">
				{/* bg-gray-200 h-80 md:h-96 rounded-lg shadow-md flex items-center justify-center text-gray-600 */}
				<TripMap simplifiedRouteGeoJson={trip.simplifiedRoute} />
			</div>

			{/* --- Photos Section --- */}
			<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
				<h2 className="text-xl font-semibold text-gray-800 mb-4">
					Photos ({trip.photos?.length || 0})
				</h2>
				{trip.photos && trip.photos.length > 0 ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{trip.photos.map((photoId) => (
							<div
								key={photoId}
								className="aspect-square overflow-hidden rounded-lg shadow"
							>
								<Image
									// Construct URL to the photo serving endpoint
									src={`${API_URL}/photos/${photoId}`}
									alt={`Trip photo ${photoId}`}
									width={300} // Provide initial width hint
									height={300} // Provide initial height hint
									className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
									// Add unoptimized if serving directly without Next.js optimization layer
									// unoptimized
								/>
								{/* TODO: Add delete button for owner later */}
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-600">No photos uploaded for this trip yet.</p>
					// Optionally show upload button here for owner
					// {isOwner && <Link href={`/trips/${tripId}/edit`} className="...">Add Photos</Link>}
				)}
			</div>

			{/* Comments Section (Placeholder) */}
			<div
				id="comments"
				className="bg-white p-6 rounded-lg shadow-md border border-gray-200 scroll-mt-20"
			>
				{" "}
				{/* Added id and scroll margin */}
				<h2 className="text-xl font-semibold text-gray-800 mb-4">
					Comments ({comments?.length || 0})
				</h2>
				{/* Add Comment Form (Show if logged in) */}
				{loggedInUser && (
					<AddCommentForm
						tripId={tripId}
						onCommentAdded={handleCommentAdded} // Pass callback
						token={token} // Pass token
					/>
				)}
				{!loggedInUser && (
					<p className="text-sm text-gray-500 mb-4">
						<Link
							href={`/login`}
							className="text-blue-600 hover:underline"
						>
							Log in
						</Link>{" "}
						to add a comment.
					</p>
				)}
				{/* Divider */}
				<hr className="my-6" />
				{/* Comment List */}
				{commentsLoading ? (
					<p>Loading comments...</p>
				) : commentsError ? (
					<p className="text-red-500">
						Error loading comments: {commentsError}
					</p>
				) : (
					<CommentList comments={comments} />
				)}
			</div>
		</div>
	);
}
