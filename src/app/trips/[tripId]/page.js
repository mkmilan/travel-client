// src/app/trips/[tripId]/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
	FaHeart,
	FaRegHeart,
	FaRegComment,
	FaExpandArrowsAlt,
	FaMap,
	FaEllipsisV,
	FaEdit,
	FaTrash,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext"; // To check ownership for Edit/Delete buttons
import { formatDuration, formatDistance } from "@/utils/formatters";
import { API_URL } from "@/utils/config";
import ProfilePicture from "@/components/ProfilePicture";
import LikersModal from "@/components/trips/LikersModal";
import Modal from "@/components/Modal";
import CommentList from "@/components/comments/CommentList";
import AddCommentForm from "@/components/comments/AddCommentForm";
import {
	Menu,
	MenuButton,
	MenuItems,
	MenuItem,
	Transition,
} from "@headlessui/react";

// --- Dynamically import the Map component ---
// Ensure it only loads on the client side (ssr: false)
const TripMap = dynamic(() => import("@/components/map/TripMap"), {
	ssr: false, // Disable Server-Side Rendering for this component
	loading: () => (
		<div className="bg-gray-200 h-80 md:h-96 flex items-center justify-center text-gray-600">
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

	// State for likes
	const [localLikesCount, setLocalLikesCount] = useState(0);
	const [isLikedByMe, setIsLikedByMe] = useState(false);
	const [likeInProgress, setLikeInProgress] = useState(false);

	// State for Likers Modal
	const [isLikersModalOpen, setIsLikersModalOpen] = useState(false);
	const [likers, setLikers] = useState([]);
	const [likersLoading, setLikersLoading] = useState(false);
	const [likersError, setLikersError] = useState("");
	// State for Map Modal
	const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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
					setLocalLikesCount(data.likes?.length || 0);
					if (loggedInUser && data.likes) {
						setIsLikedByMe(data.likes.includes(loggedInUser._id));
					} else {
						setIsLikedByMe(false);
					}
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
	}, [tripId, authLoading, loggedInUser]); // Re-fetch if tripId changes

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

	// --- Like/Unlike Handler ---
	const handleLikeToggle = async () => {
		if (!loggedInUser || !token) {
			alert("Please log in to like trips.");
			return;
		}
		if (likeInProgress) return;

		setLikeInProgress(true);
		const method = isLikedByMe ? "DELETE" : "POST";
		const url = `${API_URL}/trips/${tripId}/like`;

		try {
			const res = await fetch(url, {
				method: method,
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || `Failed to ${method === "POST" ? "like" : "unlike"}`
				);
			}

			// Update UI optimistically
			setIsLikedByMe(!isLikedByMe);
			setLocalLikesCount(data.likesCount); // Use count from response
		} catch (err) {
			console.error("Like/Unlike error:", err);
			// Optionally revert optimistic update or show error
		} finally {
			setLikeInProgress(false);
		}
	};

	// --- Fetch Likers Handler ---
	const fetchLikers = async () => {
		if (!tripId) return;
		console.log(`Fetching likers for trip ${tripId}`);
		setLikersLoading(true);
		setLikersError("");
		setLikers([]); // Clear previous likers

		try {
			const res = await fetch(`${API_URL}/trips/${tripId}/likers`);
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || "Failed to fetch likers");
			}
			setLikers(data);
			console.log("Likers fetched:", data);
		} catch (err) {
			console.error("Error fetching likers:", err);
			setLikersError(err.message);
		} finally {
			setLikersLoading(false);
		}
	};

	const handleDeleteComment = async (commentId) => {
		if (!token) {
			setCommentsError("Authentication error: Cannot delete comment.");
			return;
		}
		setCommentsError(""); // Clear previous errors
		try {
			const res = await fetch(
				`${API_URL}/trips/${tripId}/comments/${commentId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log("Delete comment response:", res);
			console.log("Delete comment response:", res.comments);
			if (!res.ok) {
				let errorData = {
					message: `Failed to delete comment (${res.status} ${res.statusText})`,
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
					errorData.message = `Failed to delete comment (${res.status} ${res.statusText})`;
				}
				throw new Error(errorData.message);
			} else if (res.status === 200) {
				// Update comments state optimistically
				setComments((prevComments) =>
					prevComments.filter((comment) => comment._id !== commentId)
				);
				// Optionally update comment count in trip state if needed elsewhere
				setTrip((prevTrip) => ({
					...prevTrip,
					commentsCount: (prevTrip.commentsCount || 0) - 1, // Decrement count if available
				}));
			}
		} catch (err) {
			console.error("Error deleting comment:", err);
			setCommentsError(
				`Delete failed: ${err.message || "An unknown error occurred."}`
			);
		}
	};

	// --- Fetch Likers on Modal Open ---
	// --- Open Likers Modal Handler ---
	const handleOpenLikersModal = () => {
		setIsLikersModalOpen(true);
		fetchLikers(); // Fetch likers when modal is opened
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
	// console.log("profilePictureUrl", profilePictureUrl);
	console.log("TripCard trip:", trip);

	return (
		// Remove p-4 to allow cards to touch edges on mobile
		<div className="max-w-6xl mx-auto">
			{/* Header Section */}
			<LikersModal
				likers={likers}
				isOpen={isLikersModalOpen}
				onClose={() => setIsLikersModalOpen(false)}
				isLoading={likersLoading}
				error={likersError}
			/>
			{/* --- Map Modal --- */}
			<Modal
				isOpen={isMapModalOpen}
				onClose={() => setIsMapModalOpen(false)}
				size="screen-h" // Use a large size, but not full screen height initially
				panelClassName="bg-gray-800" // Dark background for map modal panel
			>
				{/* Render the interactive map inside the modal */}
				{trip?.simplifiedRoute ? (
					<TripMap
						simplifiedRouteGeoJson={trip.simplifiedRoute}
						interactive={true} // Explicitly interactive
						className=" overflow-hidden" // Add rounding if panel has padding
					/>
				) : (
					<div className="h-full w-full flex items-center justify-center text-gray-400">
						Route data not available.
					</div>
				)}
			</Modal>
			{/* Card already has internal padding: p-4 */}
			<div className="bg-white p-4 shadow-md border border-gray-200 mb-6">
				<div className="flex flex-row justify-between items-start sm:items-center mb-4">
					<div>
						<h1 className="text-xl text-center font-bold text-gray-900 mb-1">
							{trip.title}
						</h1>
						<div className="flex items-center text-sm text-gray-600">
							<Link
								href={`/profile/${trip.user._id}`}
								className="flex items-center  mr-2"
							>
								<ProfilePicture
									size={30}
									className="mr-2"
									profilePictureUrl={trip.user.profilePictureUrl}
								/>
							</Link>
							<span>{trip.user.username}</span>
							<span className="mx-2">·</span>
							<span>{new Date(trip.startDate).toLocaleDateString()}</span>
						</div>
					</div>
					{/* Edit/Delete Buttons for Owner */}
					{isOwner && (
						<div className="relative mt-2 sm:mt-0 space-x-2">
							{/* <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-1 no-underline">
								<Link
									href={`/trips/${tripId}/edit`}
									// className=" text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 no-underline"
								>
									Edit
								</Link>
							</button>

							<button
								onClick={handleDeleteTrip} // Attach handler
								disabled={isDeleting} // Disable while deleting
								className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1  disabled:opacity-50"
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</button> */}
							<Menu
								as="div"
								className="relative inline-block text-left  "
							>
								<div>
									<MenuButton
										className="cursor-pointer inline-flex justify-center w-full px-2 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
										aria-label="Trip options"
										disabled={isDeleting} // Disable if delete is in progress
									>
										<FaEllipsisV
											className="w-5 h-5"
											aria-hidden="true"
										/>
									</MenuButton>
								</div>
								<Transition
									enter="transition ease-out duration-100"
									enterFrom="transform opacity-0 scale-95"
									enterTo="transform opacity-100 scale-100"
									leave="transition ease-in duration-75"
									leaveFrom="transform opacity-100 scale-100"
									leaveTo="transform opacity-0 scale-95"
								>
									<MenuItems className=" absolute right-0 z-20 mt-2 w-40 origin-top-right bg-white divide-y divide-gray-100 shadow-lg ring-1  ring-opacity-50 focus:outline-none">
										<div className="px-1 py-1">
											<MenuItem>
												{({ active }) => (
													<button
														onClick={() => router.push(`/trips/${tripId}/edit`)}
														className={`${
															active ? "bg-gray-200 " : "text-gray-700"
														} group flex  items-center w-full px-2 py-2 text-sm cursor-pointer`}
													>
														<FaEdit
															className="w-4 h-4 mr-2"
															aria-hidden="true"
														/>
														Edit
													</button>
												)}
											</MenuItem>
										</div>
										<div className="px-1 py-1">
											<MenuItem>
												{({ active }) => (
													<button
														onClick={handleDeleteTrip}
														disabled={isDeleting}
														className={`${
															active ? "bg-gray-200 " : "text-gray-700" // Use red text for delete
														} group flex items-center w-full px-2 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
													>
														<FaTrash
															className="w-4 h-4 mr-2"
															aria-hidden="true"
														/>
														{isDeleting ? "Deleting..." : "Delete"}
													</button>
												)}
											</MenuItem>
										</div>
									</MenuItems>
								</Transition>
							</Menu>
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

			{/* --- Map Preview Section --- */}
			<div
				className="mb-6 h-80 md:h-100 relative cursor-pointer group bg-gray-100 shadow-md border border-gray-200" // Adjusted height, added border/shadow
				onClick={() => trip?.simplifiedRoute && setIsMapModalOpen(true)} // Open modal only if route exists
				title={
					trip?.simplifiedRoute
						? "View interactive map"
						: "Map preview not available"
				}
			>
				{/* Overlay shown on hover */}
				{trip?.simplifiedRoute && (
					<div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-colors duration-200 flex items-center justify-center z-20 pointer-events-none">
						<FaExpandArrowsAlt className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
					</div>
				)}
				{/* Render non-interactive map preview */}
				{trip?.simplifiedRoute ? (
					<TripMap
						simplifiedRouteGeoJson={trip.simplifiedRoute}
						interactive={false} // Render non-interactively
					/>
				) : (
					<div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
						Map preview not available
					</div>
				)}
			</div>

			{/* --- Photos Section --- */}
			<div className="bg-white p-6  shadow-md border border-gray-200 mb-6">
				{/* <h2 className="text-xl font-semibold text-gray-800 mb-4">
					Photos ({trip.photos?.length || 0})
				</h2> */}
				{trip.photos && trip.photos.length > 0 ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{trip.photos.map((photoId) => (
							<div
								key={photoId}
								className="aspect-square overflow-hidden shadow"
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

			{/* --- Like and Comment Counts --- */}
			<div className="flex items-center space-x-6 text-sm text-gray-600 border-t pt-4 px-4 sm:px-6">
				<button
					onClick={handleLikeToggle}
					disabled={likeInProgress || !loggedInUser}
					className={`flex items-center p-1 rounded hover:bg-red-100 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-150 ${
						isLikedByMe ? "text-red-500" : "text-gray-500"
					}`}
					aria-label={isLikedByMe ? "Unlike trip" : "Like trip"}
				>
					{isLikedByMe ? (
						<FaHeart className="mr-1 h-4 w-4" />
					) : (
						<FaRegHeart className="mr-1 h-4 w-4" />
					)}
					<span
						className="font-medium cursor-pointer hover:underline"
						onClick={(e) => {
							e.stopPropagation(); // Prevent like toggle if clicking the number
							handleOpenLikersModal();
						}}
						title="View likes"
					>
						{localLikesCount} {localLikesCount === 1 ? "like" : "likes"}
					</span>
				</button>
				<a // Use an anchor tag to jump to comments section
					href="#comments"
					className="flex items-center hover:underline"
					onClick={(e) => {
						// Smooth scroll if possible
						e.preventDefault();
						document
							.getElementById("comments")
							?.scrollIntoView({ behavior: "smooth" });
					}}
				>
					<FaRegComment className="mr-1 text-blue-500" />
					<span>
						{comments?.length ?? trip.commentsCount ?? 0}{" "}
						{comments?.length === 1 ? "comment" : "comments"}
					</span>
				</a>
			</div>

			{/* Comments Section (Placeholder) */}
			<div
				id="comments"
				className="bg-white p-6 shadow-md border border-gray-200 scroll-mt-20"
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
					<CommentList
						comments={comments}
						loggedInUser={loggedInUser._id}
						tripId={tripId}
						onDeleteComment={handleDeleteComment}
					/>
				)}
			</div>
		</div>
	);
}
