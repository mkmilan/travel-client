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
	FaMapMarkerAlt,
	FaPlus,
	FaStar,
	FaChevronUp,
	FaPlusCircle,
	FaLightbulb,
	FaRegStar,
	FaCircle,
	FaImages,
	FaExpand,
	FaShareAlt,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext"; // To check ownership for Edit/Delete buttons
import {
	formatDuration,
	formatDistance,
	formatSpeed,
	formatDateTime,
} from "@/utils/formatters";
import {
	getTravelModeIcon,
	getTravelModeName,
} from "@/utils/getTravelModeIcon";
import { API_URL, SITE_URL } from "@/utils/config";
import { apiClient } from "@/utils/apiClient";
import ProfilePicture from "@/components/ProfilePicture";
import LikersModal from "@/components/trips/LikersModal";
import Modal from "@/components/Modal";
import CommentList from "@/components/comments/CommentList";
import RecommendationList from "@/components/recommendations/RecommendationList";
import AddCommentForm from "@/components/comments/AddCommentForm";
import AddPoiForm from "@/components/pois/AddPoiForm";
import {
	Menu,
	MenuButton,
	MenuItems,
	MenuItem,
	Transition,
	Disclosure,
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

// --- Generate Metadata for SEO and Open Graph ---
// export async function generateMetadata({ params }) {
async function generateMetadata({ params }) {
	const { tripId } = params;
	try {
		// Fetch minimal trip data for meta tags.
		// so it will only succeed for public trips or if the endpoint allows unauthenticated access for public data.
		const res = await fetch(`${API_URL}/trips/${tripId}`, {
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": csrfToken,
			},
		});

		if (!res.ok) {
			console.error(
				`Failed to fetch trip ${tripId} for metadata: ${res.status}`
			);
			// Return default metadata if trip is not found or not public
			return {
				title: "Trip Details | Motorhome Mapper",
				description: "Explore travel itineraries and adventures.",
				openGraph: {
					title: "Trip Details | Motorhome Mapper",
					description: "Explore travel itineraries and adventures.",
					images: [{ url: `${SITE_URL}/default-og-image.png` }],
					url: `${SITE_URL}/trips/${tripId}`,
					type: "article",
				},
			};
		}
		const trip = await res.json();

		const title = trip.title || "A Trip";
		const description = trip.description
			? trip.description.substring(0, 160) +
			  (trip.description.length > 160 ? "..." : "")
			: `Check out this trip: ${title}`;

		let imageUrl = `${SITE_URL}/default-og-image.png`;

		if (trip.photos && trip.photos.length > 0) {
			// Assuming your API serves photos at /photos/:photoId
			// and this endpoint is publicly accessible for crawlers.
			imageUrl = `${API_URL}/photos/${trip.photos[0]}`;
		}
		// Future enhancement: Generate a static map preview for og:image
		// For now, using the first trip photo or a default.

		return {
			title: `${title} | Motorhome Mapper`,
			description: description,
			openGraph: {
				title: `${title} | Motorhome Mapper`,
				description: description,
				images: [
					{
						url: imageUrl,
						width: 1200,
						height: 630,
						alt: `Preview of ${title}`,
					},
				],
				url: `${SITE_URL}/trips/${tripId}`,
				type: "article", // Or 'website' if more appropriate
			},
			twitter: {
				// Optional: Twitter Card tags
				card: "summary_large_image",
				title: `${title} | Motorhome Mapper`,
				description: description,
				images: [imageUrl],
			},
		};
	} catch (error) {
		console.error(`Error in generateMetadata for trip ${tripId}:`, error);
		return {
			title: "Trip Details | Motorhome Mapper",
			description: "Explore travel itineraries and adventures.",
		};
	}
}

export default function TripDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { tripId } = params;
	const {
		user: loggedInUser,
		isAuthenticated,
		loading: authLoading,
		csrfToken,
	} = useAuth();

	const preferredUnits = loggedInUser?.settings?.preferredUnits || "metric";
	const userSettings = loggedInUser?.settings || {
		dateFormat: "YYYY-MM-DD",
		timeFormat: "24h",
	};

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

	// --- Recommendation State ---
	const [recommendations, setRecommendations] = useState([]);
	const [recommendationsLoading, setRecommendationsLoading] = useState(false);
	const [recommendationsError, setRecommendationsError] = useState("");

	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState("");
	const [isAddPoiModalOpen, setIsAddPoiModalOpen] = useState(false);
	const [copiedMessageVisible, setCopiedMessageVisible] = useState(false);

	// Fetch trip data
	useEffect(() => {
		if (authLoading) {
			return;
		}
		if (!isAuthenticated) {
			setLoading(false);
			return;
		}
		if (tripId) {
			const fetchTrip = async () => {
				setLoading(true);
				setError("");
				try {
					// Use relative URL if proxying is set up, else full URL
					const res = await fetch(`${API_URL}/trips/${tripId}`, {
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							"X-CSRF-Token": csrfToken,
						},
					});
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
	}, [tripId, isAuthenticated, authLoading, loggedInUser]); // Re-fetch if tripId changes

	const fetchComments = useCallback(async () => {
		if (!tripId) return;
		console.log(`Fetching comments for trip ${tripId}`);
		setCommentsLoading(true);
		setCommentsError("");
		try {
			const res = await fetch(`${API_URL}/trips/${tripId}/comments`, {
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken,
				},
			});
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

	// --- Fetch Recommendations ---
	useEffect(() => {
		if (!tripId) return;

		const fetchRecommendations = async () => {
			setRecommendationsLoading(true);
			setRecommendationsError("");
			try {
				const response = await fetch(
					`${API_URL}/trips/${tripId}/recommendations`,
					{
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							"X-CSRF-Token": csrfToken,
						},
					}
				);
				if (!response.ok) {
					throw new Error("Failed to fetch recommendations");
				}
				const data = await response.json();
				setRecommendations(data);
			} catch (err) {
				console.error("Error fetching recommendations:", err);
				setRecommendationsError(err.message);
			} finally {
				setRecommendationsLoading(false);
			}
		};

		fetchRecommendations();
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

	const canShare =
		isOwner || (!isOwner && trip?.defaultTripVisibility === "public");

	const handleShare = async () => {
		const shareUrl = window.location.href;
		const shareTitle = trip?.title || "Check out this trip!";
		const shareText = `Take a look at this trip "${
			trip?.title || " Trip"
		}" on Motorhome Mapper! ${shareUrl}`;

		if (navigator.share) {
			try {
				await navigator.share({
					title: shareTitle,
					text: shareText, // Some platforms use text, some use title, url is key
					url: shareUrl,
				});
				console.log("Trip shared successfully via Web Share API");
			} catch (error) {
				// User might have cancelled the share dialog, or other error.
				// Don't automatically fallback to copy unless navigator.share itself is undefined.
				if (error.name !== "AbortError") {
					console.error("Error using Web Share API:", error);
				}
			}
		} else {
			// Fallback for browsers that don't support Web Share API
			try {
				await navigator.clipboard.writeText(shareUrl);
				setCopiedMessageVisible(true);
				setTimeout(() => setCopiedMessageVisible(false), 2500); // Hide after 2.5s
			} catch (err) {
				console.error("Failed to copy link to clipboard:", err);
				alert(
					"Failed to copy link. Please copy it manually from the address bar."
				);
			}
		}
	};

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

		if (!isAuthenticated) {
			setError("Authentication error: Cannot delete trip.");
			setIsDeleting(false); // Reset state
			return;
		}

		setIsDeleting(true);
		setError(""); // Clear previous errors

		try {
			const res = await fetch(`${API_URL}/trips/${tripId}`, {
				method: "DELETE",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken,
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
		if (!loggedInUser || !isAuthenticated) {
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
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken,
				},
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
			const res = await fetch(`${API_URL}/trips/${tripId}/likers`, {
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken,
				},
			});
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
		if (!isAuthenticated) {
			setCommentsError("Authentication error: Cannot delete comment.");
			return;
		}
		setCommentsError(""); // Clear previous errors
		try {
			const res = await fetch(
				`${API_URL}/trips/${tripId}/comments/${commentId}`,
				{
					method: "DELETE",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
						"X-CSRF-Token": csrfToken,
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

	// Callback function when a new POI is added via the modal
	const handlePoiAdded = (newPoi) => {
		// Update the trip state to include the new POI
		setTrip((prevTrip) => ({
			...prevTrip,
			pointsOfInterest: [...(prevTrip.pointsOfInterest || []), newPoi],
		}));
		// Close the modal
		setIsAddPoiModalOpen(false);
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
	const poiCount = trip.pointsOfInterest?.length || 0;
	const TravelModeIcon =
		trip?.defaultTravelMode !== undefined
			? getTravelModeIcon(trip.defaultTravelMode)
			: null;
	const travelModeName =
		trip?.defaultTravelMode !== undefined
			? getTravelModeName(trip.defaultTravelMode)
			: "N/A";

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
			{/* --- Add POI Modal --- */}
			<Modal
				isOpen={isAddPoiModalOpen}
				onClose={() => setIsAddPoiModalOpen(false)}
				title="Add Point of Interest"
				size="xl" // Adjust size as needed
			>
				<AddPoiForm
					tripId={tripId}
					tripRouteGeoJson={trip?.simplifiedRoute} // Pass route for context
					onPoiAdded={handlePoiAdded}
					onCancel={() => setIsAddPoiModalOpen(false)}
				/>
			</Modal>
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
						pointsOfInterest={trip?.pointsOfInterest}
						interactive={true} // Explicitly interactive
						className=" overflow-hidden" // Add rounding if panel has padding
					/>
				) : (
					<div className="h-full w-full flex items-center justify-center text-gray-400">
						Route data not available.
					</div>
				)}
			</Modal>
			{/* --- Image Modal --- */}
			<Modal
				isOpen={isImageModalOpen}
				onClose={() => setIsImageModalOpen(false)}
				size="screen-h" // Use a large size, adjust as needed
				panelClassName="bg-black/80 flex items-center justify-center" // Dark background, center content
			>
				{selectedImageUrl && (
					<div className="relative w-full h-full flex items-center justify-center">
						{/* Image with max height/width to fit modal */}
						<Image
							src={selectedImageUrl}
							alt="Selected trip photo"
							width={1200} // Provide large width/height hints
							height={900}
							className="object-contain max-h-full max-w-full" // Fit within modal bounds
							// unoptimized // Use if images aren't optimized via Next.js
						/>
					</div>
				)}
			</Modal>

			<div className="bg-white p-4 shadow-md border border-gray-200 mb-6">
				<div className="flex flex-row justify-between items-start sm:items-center mb-4">
					<div>
						<h1 className="text-xl  font-bold text-gray-900 mb-1">
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
							<span>
								{/* {new Date(trip.startDate).toLocaleDateString()} at{" "}
								{new Date(trip.startDate).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})} */}
								{formatDateTime(trip.startDate, userSettings, true)}
							</span>
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
										<div className="px-1 py-1">
											<MenuItem>
												{({ active }) => (
													<Link
														href={`/recommendations/new?tripId=${tripId}`}
														title="Add a recommendation related to this trip"
														className={`${
															active ? "bg-gray-200 " : "text-gray-700" // Use red text for delete
														} group flex items-center w-full px-2 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
													>
														<FaPlus className="w-4 h-4 mr-2" />
														Recommendation
														{/* For screen readers */}
													</Link>
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
						<p className="text-xs text-gray-500 ">From</p>
						<p className="font-medium text-gray-800">
							{trip.startLocationName || "N/A"}
						</p>
					</div>
					<div>
						<p className="text-xs text-gray-500 ">To</p>
						<p className="font-medium text-gray-800">
							{trip.endLocationName || "N/A"}
						</p>
					</div>
					<div>
						<p className="text-xs text-gray-500 ">Duration</p>
						<p className="font-medium text-gray-800">
							{formatDuration(trip.durationMillis)}
						</p>
					</div>
					<div>
						<p className="text-xs text-gray-500 ">Distance</p>
						<p className="font-medium text-gray-800">
							{formatDistance(trip.distanceMeters, preferredUnits)}
						</p>
					</div>
					{/* --- Add Travel Mode --- */}
					<div>
						<p className="text-xs text-gray-500  pb-1">Travel Mode</p>
						<div className="flex items-center justify-center font-medium text-gray-800">
							{TravelModeIcon && <TravelModeIcon className="mr-1.5 h-4 w-4" />}
							{/* <span>{travelModeName}</span> */}
						</div>
					</div>
					{/* --- Add Average Speed --- */}
					<div>
						<p className="text-xs text-gray-500 ">Avg Speed</p>
						<p className="font-medium text-gray-800">
							{formatSpeed(
								trip.distanceMeters,
								trip.durationMillis,
								preferredUnits
							)}
						</p>
					</div>
					{/* --- Add POI Count --- */}
					<div>
						<a // Use an anchor tag to jump to comments section
							href="#pois"
							onClick={(e) => {
								// Smooth scroll if possible
								e.preventDefault();
								document
									.getElementById("pois")
									?.scrollIntoView({ behavior: "smooth" });
							}}
						>
							<div>
								<p className="text-xs text-gray-500 ">POIs</p>
								<p className="font-medium text-gray-800">{poiCount}</p>
							</div>
						</a>
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
				onClick={() => trip?.simplifiedRoute && setIsMapModalOpen(true)}
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
						pointsOfInterest={trip?.pointsOfInterest}
						interactive={false} // Render non-interactively
					/>
				) : (
					<div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
						Map preview not available
					</div>
				)}
			</div>

			{/* --- Like and Comment Counts --- */}
			<div className="flex items-center  space-x-6 text-sm text-gray-600 border-t py-3 px-4 sm:px-6">
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
					<FaRegComment className="mr-1 text-blue-500 h-4 w-4" />
					<span>
						{comments?.length ?? trip.commentsCount ?? 0}{" "}
						{comments?.length === 1 ? "comment" : "comments"}
					</span>
				</a>
				{/* Share Button */}
				{canShare && (
					<button
						onClick={handleShare}
						className="cursor-pointer flex items-center p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-150"
						title="Share this trip"
						aria-label="Share this trip"
					>
						<FaShareAlt className="mr-1 h-4 w-4" />
						<span>Share</span>
					</button>
				)}
			</div>
			{copiedMessageVisible && (
				<div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-xl text-sm z-50">
					Link copied to clipboard!
				</div>
			)}
			{/* --- Photos Section (Updated) --- */}
			{trip.photos && trip.photos.length > 0 && (
				<div className="bg-white shadow-md border border-gray-200 mb-6 pt-2 ">
					<h2 className="text-lg font-semibold text-gray-800 mb-3 pl-4 flex items-center">
						<FaImages className="mr-2 text-blue-500" />
						Photo Gallery
					</h2>
					<div className="flex overflow-x-auto space-x-1 pb-2 items-center">
						{trip.photos.map((photoId) => {
							const imageUrl = `${API_URL}/photos/${photoId}`;
							return (
								<div
									key={photoId}
									className="flex-shrink-0 w-48 h-48 sm:w-56 sm:h-56 relative  overflow-hidden cursor-pointer group" //sm:w-58 sm:h-58
									onClick={() => {
										setSelectedImageUrl(imageUrl);
										setIsImageModalOpen(true);
									}}
								>
									<Image
										src={imageUrl}
										alt={`Trip photo ${photoId}`}
										fill
										style={{ objectFit: "cover" }}
										className="group-hover:opacity-80 transition-opacity"
										sizes="(max-width: 640px) 192px, 232px" // Adjust sizes based on w-40/w-48 160px, 192px
										// Add unoptimized if serving directly without Next.js optimization layer
										// unoptimized
									/>
									<div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
										<FaExpand className="text-white text-2xl" />
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* --- Points of Interest Section --- */}
			{/* {poiCount > 0 && ( */}
			<div
				id="pois"
				className="bg-white shadow-md border border-gray-200 mb-6 scroll-mt-20"
			>
				<Disclosure>
					{({ open }) => (
						<div>
							<Disclosure.Button className="flex w-full justify-between items-center p-4 text-left text-lg font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75">
								<div className="flex items-center">
									<span>Points of Interest </span>
									<span className="bg-blue-600 text-white w-7 h-7 ml-2 rounded-full flex items-center justify-center ">
										{poiCount}
									</span>

									{/* Add POI Button for Owner */}
									{isOwner && (
										<div
											onClick={(e) => {
												e.stopPropagation(); // Prevent disclosure toggle
												setIsAddPoiModalOpen(true);
											}}
											title="Add a new Point of Interest to this trip"
											className="ml-4 p-1 text-indigo-600 hover:text-indigo-800 transition-colors rounded-full hover:bg-indigo-100"
										>
											<FaPlus className="w-5 h-5 text-gray-500" />

											<span className="sr-only">Add POI</span>
										</div>
									)}
								</div>
								<FaChevronUp
									className={`${
										open ? "" : "rotate-180 transform"
									} h-5 w-5 text-gray-500 transition-transform`}
								/>
							</Disclosure.Button>
							<Transition
								enter="transition duration-100 ease-out"
								enterFrom="transform scale-95 opacity-0"
								enterTo="transform scale-100 opacity-100"
								leave="transition duration-75 ease-out"
								leaveFrom="transform scale-100 opacity-100"
								leaveTo="transform scale-95 opacity-0"
							>
								<Disclosure.Panel className="px-4 pb-4 pt-2 text-sm text-gray-500 border-t">
									{poiCount > 0 ? (
										<ul className="space-y-4 mt-4">
											{trip.pointsOfInterest.map((poi, index) => (
												<li
													key={poi?._id || poi.timestamp || index}
													className="border-b pb-3 last:border-b-0 last:pb-0"
												>
													<div className="flex items-start justify-between space-x-3">
														<div className="flex items-start space-x-2">
															<FaMapMarkerAlt className="text-blue-500 mt-1 h-4 w-4 flex-shrink-0" />
															<div>
																<p className="font-semibold text-gray-800">
																	{poi.name || `POI ${index + 1}`}
																</p>
																{poi.description && (
																	<p className="text-sm text-gray-600 mt-1">
																		{poi.description}
																	</p>
																)}
																<p className="text-xs text-gray-500 mt-1">
																	Marked at:{" "}
																	{new Date(poi.timestamp).toLocaleString()} (
																	{poi.lat.toFixed(4)}, {poi.lon.toFixed(4)})
																</p>
															</div>
														</div>

														{isOwner && ( // Link to create recommendation
															<Link
																href={`/recommendations/new?tripId=${tripId}&poiId=${
																	poi._id
																}&lat=${poi.lat}&lon=${
																	poi.lon
																}&poiName=${encodeURIComponent(
																	poi.name || ""
																)}&poiDesc=${encodeURIComponent(
																	poi.description || ""
																)}`}
																title="Create recommendation from this POI"
																className="flex-shrink-0 p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
															>
																<FaPlus className="w-4 h-4 text-gray-500" />
																<span className="sr-only">
																	Create Recommendation
																</span>
															</Link>
														)}
													</div>
												</li>
											))}
										</ul>
									) : (
										<p className="mt-4 text-center text-gray-500">
											No points of interest added yet.
											{isOwner && " You can add one using the '+' button."}
										</p>
									)}
								</Disclosure.Panel>
							</Transition>
						</div>
					)}
				</Disclosure>
			</div>

			{/* --- Recommendations Section (Disclosure) --- */}
			<div className="bg-white shadow-md border border-gray-200 mb-6">
				<Disclosure>
					{({ open }) => (
						<div>
							<Disclosure.Button className="flex w-full justify-between items-center p-4 text-left text-lg font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75">
								<div className="flex items-center">
									<span>Recommendations</span>
									<span className="bg-blue-600 text-white w-7 h-7 ml-2 rounded-full flex items-center justify-center ">
										{recommendationsLoading ? "..." : recommendations.length}
									</span>
								</div>
								<FaChevronUp
									className={`${
										open ? "" : "rotate-180 transform"
									} h-5 w-5 text-gray-500 transition-transform`}
								/>
							</Disclosure.Button>
							<Transition
								enter="transition duration-100 ease-out"
								enterFrom="transform scale-95 opacity-0"
								enterTo="transform scale-100 opacity-100"
								leave="transition duration-75 ease-out"
								leaveFrom="transform scale-100 opacity-100"
								leaveTo="transform scale-95 opacity-0"
							>
								<Disclosure.Panel className="px-4 pb-4 pt-2 text-sm text-gray-500 border-t">
									{recommendationsLoading ? (
										<p>Loading recommendations...</p>
									) : recommendationsError ? (
										<p className="text-red-500">
											Error: {recommendationsError}
										</p>
									) : recommendations.length > 0 ? (
										<RecommendationList recommendations={recommendations} />
									) : (
										<p>No recommendations added for this trip yet.</p>
									)}
								</Disclosure.Panel>
							</Transition>
						</div>
					)}
				</Disclosure>
			</div>

			{/* Comments Section (Placeholder) */}
			<div
				id="comments"
				className="bg-white  shadow-md border border-gray-200 scroll-mt-20"
			>
				<Disclosure>
					{({ open }) => (
						<div>
							<Disclosure.Button className="flex w-full justify-between items-center p-4 text-left text-lg font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75">
								<div className="flex items-center">
									<span>Comments </span>
									<span className="bg-blue-600 text-white w-7 h-7 ml-2 rounded-full flex items-center justify-center ">
										{comments?.length || 0}
									</span>
								</div>

								<FaChevronUp
									className={`${
										open ? "" : "rotate-180 transform"
									} h-5 w-5 text-gray-500 transition-transform`}
								/>
							</Disclosure.Button>
							{/* <h2 className="text-xl font-semibold text-gray-800 mb-4">
					Comments ({comments?.length || 0})
				</h2> */}
							<Transition
								enter="transition duration-100 ease-out"
								enterFrom="transform scale-95 opacity-0"
								enterTo="transform scale-100 opacity-100"
								leave="transition duration-75 ease-out"
								leaveFrom="transform scale-100 opacity-100"
								leaveTo="transform scale-95 opacity-0"
							>
								<Disclosure.Panel className="px-4 pb-4 pt-2 text-sm text-gray-500 border-t">
									{loggedInUser && (
										<AddCommentForm
											tripId={tripId}
											onCommentAdded={handleCommentAdded} // Pass callback
											token={isAuthenticated}
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
											loggedInUser={loggedInUser?._id}
											tripId={tripId}
											onDeleteComment={handleDeleteComment}
										/>
									)}
								</Disclosure.Panel>
							</Transition>
						</div>
					)}
				</Disclosure>
			</div>
		</div>
	);
}
