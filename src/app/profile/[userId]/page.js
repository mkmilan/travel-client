// src/app/profile/[userId]/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import RecommendationCard from "@/components/recommendations/RecommendationCard";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
	FaUserPlus,
	FaUserMinus,
	FaUserCheck,
	FaUserEdit,
	FaMapMarkerAlt,
	FaStar,
	FaRoute,
	FaRulerCombined,
	FaCalendarAlt,
	FaImages,
	FaExpand,
	FaCog,
} from "react-icons/fa";
import { API_URL } from "@/utils/config";
import ProfilePicture from "@/components/ProfilePicture";
import Modal from "@/components/Modal";
// import PoisModal from "@/components/pois/PoisModal";
import {
	formatDistance,
	formatDuration,
	formatDateTime,
} from "@/utils/formatters";

// Placeholder loading component
const LoadingSpinner = () => (
	<div className="flex justify-center items-center h-64">
		<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
	</div>
);

// --- User Item for the List ---
const UserListItem = ({ user, loggedInUserId, token, onFollowUpdate }) => {
	const [isFollowing, setIsFollowing] = useState(
		user.followers?.includes(loggedInUserId) // Check if logged-in user is in the *listed user's* followers
	);
	const [followLoading, setFollowLoading] = useState(false);
	const isOwnItem = user._id === loggedInUserId;

	const handleFollowToggle = async () => {
		if (!loggedInUserId || !token || isOwnItem) return;
		setFollowLoading(true);
		const url = `${API_URL}/users/${user._id}/follow`;
		const method = isFollowing ? "DELETE" : "POST";

		try {
			const res = await fetch(url, {
				method: method,
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Follow action failed");
			setIsFollowing(!isFollowing);
			// Notify parent component (modal) about the follow status change if needed
			if (onFollowUpdate) {
				onFollowUpdate(user._id, !isFollowing);
			}
		} catch (err) {
			console.error("Follow toggle error in modal:", err);
			// Optionally show an error message to the user
		} finally {
			setFollowLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
			<Link
				href={`/profile/${user._id}`}
				className="flex items-center space-x-3 text-gray-800 hover:text-blue-600"
			>
				<ProfilePicture
					profilePictureUrl={user.profilePictureUrl}
					username={user.username}
					size={30}
				/>
				<span className="font-medium">{user.username}</span>
			</Link>
			{!isOwnItem && loggedInUserId && (
				<button
					onClick={handleFollowToggle}
					disabled={followLoading}
					className={`flex items-center px-3 py-1 text-xs text-white disabled:opacity-50 ${
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
			)}
		</div>
	);
};

// --- Follow List Modal Implementation ---
const FollowListModal = ({ isOpen, onClose, userId, type }) => {
	const { user: loggedInUser, token } = useAuth();
	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	// Add pagination state if needed later
	// const [page, setPage] = useState(1);
	// const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		if (isOpen && userId) {
			const fetchList = async () => {
				setLoading(true);
				setError("");
				setList([]); // Clear previous list
				// Determine the correct endpoint based on type
				const endpoint = type === "followers" ? "followers" : "following";
				try {
					// Assuming the backend endpoints exist as planned:
					// GET /api/users/:userId/followers
					// GET /api/users/:userId/following
					// These endpoints should return an array of user objects with at least _id, username, profilePictureUrl, and followers array
					const res = await fetch(`${API_URL}/users/${userId}/${endpoint}`, {
						headers: {
							// Send token if the endpoint needs it (e.g., to check follow status relative to logged-in user)
							...(token && { Authorization: `Bearer ${token}` }),
						},
					});
					const data = await res.json();

					if (!res.ok) {
						throw new Error(data.message || `Failed to fetch ${type}`);
					}

					// Assuming the API returns the array directly or under a 'data' key
					setList(Array.isArray(data) ? data : data.data || []);
					// Set pagination data if API provides it
					// setPage(data.page || 1);
					// setTotalPages(data.totalPages || 1);
				} catch (err) {
					console.error(`Error fetching ${type}:`, err);
					setError(err.message);
				} finally {
					setLoading(false);
				}
			};
			fetchList();
		}
	}, [isOpen, userId, type, token]); // Refetch when modal opens or type/user changes

	// Optional: Handle follow updates from UserListItem if needed to refresh parent state
	const handleFollowUpdateInModal = (updatedUserId, newFollowState) => {
		console.log(
			`User ${updatedUserId} follow state changed to ${newFollowState} within modal`
		);
		// You might want to update the main profile page's follow count here
		// or trigger a refetch of the profile data, but it might be complex.
		// For now, the button within the modal updates its own state.
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={type === "followers" ? "Followers" : "Following"}
			size="sm" // Small size is usually appropriate for user lists
		>
			{loading && <LoadingSpinner />}
			{error && <p className="text-red-500 p-4 text-center">{error}</p>}
			{!loading && !error && list.length === 0 && (
				<p className="text-gray-500 p-4 text-center">No {type} found.</p>
			)}
			{!loading && !error && list.length > 0 && (
				<div className="flex flex-col">
					{list.map((user) => (
						<UserListItem
							key={user._id}
							user={user}
							loggedInUserId={loggedInUser?._id}
							token={token}
							onFollowUpdate={handleFollowUpdateInModal}
						/>
					))}
					{/* Add pagination controls here if implementing */}
				</div>
			)}
		</Modal>
	);
};

// --- Recommendations Modal Implementation ---
const RecommendationsModal = ({ isOpen, onClose, userId }) => {
	const [recommendations, setRecommendations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const limit = 10; // Number of items per page

	console.log("RecommendationsModal rendered - userId prop:", userId);

	const fetchRecommendations = async (pageNum = 1) => {
		console.log("fetchRecommendations called - userId:", userId);
		if (!userId) return;
		setLoading(true);
		setError("");
		try {
			// Fetch from GET /api/users/:userId/recommendations
			const res = await fetch(
				`${API_URL}/users/${userId}/recommendations?page=${pageNum}&limit=${limit}`
				// `${API_URL}/users/${userId}/recommendations`
			);
			const data = await res.json();
			console.log("Recommendations data:", data.data);
			if (!res.ok) {
				throw new Error(
					data.message || `Failed to fetch recommendations (${res.status})`
				);
			}

			// Append new data if pageNum > 1, otherwise replace
			setRecommendations((prev) =>
				pageNum === 1 ? data.data : [...prev, ...data.data]
			);
			setPage(data.page);
			setTotalPages(data.totalPages);
			setTotalCount(data.totalCount);
		} catch (err) {
			console.error("Error fetching recommendations:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			// Reset and fetch first page when modal opens
			setRecommendations([]);
			setPage(1);
			setTotalPages(1);
			setTotalCount(0);
			fetchRecommendations(1);
		}
	}, [isOpen, userId]); // Rerun effect if modal opens or userId changes

	const handleLoadMore = () => {
		if (page < totalPages && !loading) {
			fetchRecommendations(page + 1);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Recommendations (${totalCount})`} // Show total count in title
			size="lg" // Larger size might be better for cards
		>
			{error && <p className="text-red-500 p-4 text-center">{error}</p>}

			{/* List Area */}
			<div className="space-y-4 px-4 pb-4 max-h-[70vh] overflow-y-auto">
				{recommendations.length > 0 &&
					recommendations.map((rec) => (
						// Use RecommendationCard for display
						<RecommendationCard
							key={rec._id}
							recommendation={rec}
						/>
					))}

				{/* Loading indicator for initial load or load more */}
				{loading && <LoadingSpinner />}

				{/* No results message */}
				{!loading && recommendations.length === 0 && !error && (
					<p className="text-gray-500 text-center py-6">
						No recommendations found for this user.
					</p>
				)}

				{/* Load More Button */}
				{!loading && page < totalPages && (
					<div className="text-center pt-4">
						<button
							onClick={handleLoadMore}
							className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
						>
							Load More
						</button>
					</div>
				)}
			</div>
		</Modal>
	);
};

// --- POI List Item Component ---
const PoiListItem = ({ poi, userSettings }) => {
	const poiDate = formatDateTime(poi.timestamp, userSettings);

	return (
		<div className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
			<div className="flex items-start space-x-3">
				<FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0" />
				<div className="flex-grow">
					<h4 className="font-semibold text-gray-800">{poi.name}</h4>
					{poi.description && (
						<p className="text-sm text-gray-600 mt-1">{poi.description}</p>
					)}
					<div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
						{poi.timestamp && (
							<span className="flex items-center">
								<FaCalendarAlt className="mr-1" /> {poiDate}
							</span>
						)}
						{poi.tripId && poi.tripTitle && (
							<Link
								href={`/trips/${poi.tripId}`}
								className="flex items-center hover:text-blue-600 hover:underline"
								title={`View Trip: ${poi.tripTitle}`}
							>
								<FaRoute className="mr-1" /> {poi.tripTitle}
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

const PoisModal = ({ isOpen, onClose, userId }) => {
	const [pois, setPois] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const limit = 15; // Number of POIs per page

	const fetchPois = async (pageNum = 1) => {
		if (!userId) return;
		setLoading(true);
		setError("");
		try {
			// Fetch from GET /api/users/:userId/pois
			const res = await fetch(
				`${API_URL}/users/${userId}/pois?page=${pageNum}&limit=${limit}`
			);
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || `Failed to fetch POIs (${res.status})`);
			}

			// Append new data if pageNum > 1, otherwise replace
			setPois((prev) => (pageNum === 1 ? data.data : [...prev, ...data.data]));
			setPage(data.page);
			setTotalPages(data.totalPages);
			setTotalCount(data.totalCount);
		} catch (err) {
			console.error("Error fetching POIs:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			// Reset and fetch first page when modal opens
			setPois([]);
			setPage(1);
			setTotalPages(1);
			setTotalCount(0);
			fetchPois(1);
		}
	}, [isOpen, userId]); // Rerun effect if modal opens or userId changes

	const handleLoadMore = () => {
		if (page < totalPages && !loading) {
			fetchPois(page + 1);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Points of Interest (${totalCount})`} // Show total count
			size="md" // Medium size should be sufficient
		>
			{error && <p className="text-red-500 p-4 text-center">{error}</p>}

			{/* List Area */}
			<div className="flex flex-col max-h-[70vh] overflow-y-auto">
				{pois.length > 0 &&
					pois.map((poi) => (
						<PoiListItem
							key={poi._id}
							poi={poi}
						/>
					))}

				{/* Loading indicator */}
				{loading && <LoadingSpinner />}

				{/* No results message */}
				{!loading && pois.length === 0 && !error && (
					<p className="text-gray-500 text-center py-6">
						No points of interest found for this user.
					</p>
				)}

				{/* Load More Button */}
				{!loading && page < totalPages && (
					<div className="text-center p-4 border-t border-gray-100">
						<button
							onClick={handleLoadMore}
							className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
						>
							Load More
						</button>
					</div>
				)}
			</div>
		</Modal>
	);
};

// --- Photo Gallery Modal ---
const PhotoViewerModal = ({
	isOpen,
	onClose,
	// photoUrl,
	// photoContext,

	entry,
}) => {
	console.log("PhotoViewerModal rendered - entry:", entry);
	// if (!isOpen || !photoUrl) return null;
	if (!isOpen || !entry) return null;

	const photoUrl = `${API_URL}/photos/${entry.photoId}`;
	const photoContextText = entry.context || "View Photo";

	let titleContent;

	if (entry.sourceType === "trip" && entry.sourceId) {
		titleContent = (
			<Link
				href={`/trips/${entry.sourceId}`}
				className="hover:bg-gray-100 p-2"
				onClick={onClose} // Optional: close modal when link is clicked
			>
				{photoContextText}
			</Link>
		);
	} else if (entry.sourceType === "recommendation" && entry.sourceId) {
		// Ensure you have a route like /recommendations/[id] for this to work
		titleContent = (
			<Link
				href={`/recommendations/${entry.sourceId}`} // Adjust if your route is different
				className="hover:hover:bg-gray-200 p-2 "
				onClick={onClose} // Optional: close modal when link is clicked
			>
				{photoContextText}
			</Link>
		);
	} else {
		titleContent = photoContextText;
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={titleContent}
			size="screen-h" // Use a large size for viewing photos
			panelClassName="bg-black/80" // Darker background for photo viewing
		>
			<div className="relative w-full h-full flex items-center justify-center p-2">
				<Image
					src={photoUrl}
					alt={entry.context || "User photo"}
					fill // Use fill to make it responsive within the container
					style={{ objectFit: "contain" }} // Ensures the whole image is visible
					className="rounded-md"
					unoptimized // If photos are served directly and not processed by Next.js image optimization
				/>
			</div>
		</Modal>
	);
};

export default function ProfilePage() {
	const params = useParams();
	const { userId } = params;
	const { user, token, loading: authLoading } = useAuth();
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isFollowing, setIsFollowing] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);
	// --- Modal States ---
	const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
	const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
	const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] =
		useState(false);
	const [isPoisModalOpen, setIsPoisModalOpen] = useState(false);

	// --- State for Photo Gallery ---
	const [userPhotos, setUserPhotos] = useState([]);
	const [photosLoading, setPhotosLoading] = useState(false);
	const [photosError, setPhotosError] = useState("");
	const [photosPage, setPhotosPage] = useState(1);
	const [photosTotalPages, setPhotosTotalPages] = useState(1);
	const [photosTotalCount, setPhotosTotalCount] = useState(0);
	const [isPhotoViewerModalOpen, setIsPhotoViewerModalOpen] = useState(false);
	const [selectedPhotoUrl, setSelectedPhotoUrl] = useState("");
	const [selectedPhotoContext, setSelectedPhotoContext] = useState("");
	const [selectedPhotoEntry, setSelectedPhotoEntry] = useState(null);
	const photosLimit = 12; // Match backend or choose a display limit

	const loggedInUser = user;
	const preferredUnits = loggedInUser?.settings?.preferredUnits || "metric";

	useEffect(() => {
		// Fetch profile data when userId is available
		if (userId) {
			const fetchProfile = async () => {
				setLoading(true);
				setError("");
				try {
					const res = await fetch(`${API_URL}/users/${userId}`);
					const data = await res.json();

					if (!res.ok) {
						throw new Error(
							data.message || `Failed to fetch profile (${res.status})`
						);
					}
					setProfileData(data);
					console.log("Fetched profile data:", data);
					// setProfilePictureUrl(`${API_URL}/photos/${data.profilePictureUrl}`);

					// setProfilePictureUrl(`${API_URL}/${data.profilePictureUrl}`);

					// --- Determine initial follow state ---
					// Check if loggedInUser exists and if their ID is in the fetched profile's followers list
					if (loggedInUser && data.followers && Array.isArray(data.followers)) {
						setIsFollowing(data.followers.includes(loggedInUser._id));
					} else {
						setIsFollowing(false); // Not logged in or followers data missing
					}
				} catch (err) {
					console.error("Error fetching profile:", err);
					setError(err.message);
				} finally {
					setLoading(false);
				}
			};

			if (!authLoading) {
				fetchProfile();
			}
		} else {
			// Handle case where userId is somehow missing (shouldn't happen with required param)
			setError("User ID is missing.");
			setLoading(false);
		}
	}, [userId, authLoading, loggedInUser]);

	// Determine if the logged-in user is viewing their own profile
	// Wait for both auth check and profile fetch to finish
	const isOwnProfile = useMemo(() => {
		return !authLoading && loggedInUser && loggedInUser._id === userId;
	}, [authLoading, loggedInUser, userId]);

	// --- Follow/Unfollow Handlers ---
	const handleFollowToggle = async () => {
		if (!loggedInUser || !token) {
			alert("Please log in to follow users."); // Or redirect to login
			return;
		}
		if (followLoading) return; // Prevent multiple clicks

		setFollowLoading(true);
		setError(""); // Clear previous general errors

		const url = `${API_URL}/users/${userId}/follow`;
		const method = isFollowing ? "DELETE" : "POST"; // Toggle method

		try {
			const res = await fetch(url, {
				method: method,
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || `Failed to ${isFollowing ? "unfollow" : "follow"}`
				);
			}

			// --- Update UI State Optimistically (or based on response) ---
			setIsFollowing(!isFollowing); // Toggle state
			// Manually adjust follower count for immediate feedback
			setProfileData((prevData) => ({
				...prevData,
				followersCount: isFollowing
					? prevData.followersCount - 1
					: prevData.followersCount + 1,
				// Also update the followers array if needed, though refetch might be better long-term
			}));
			console.log(data.message); // Log success message
		} catch (err) {
			console.error("Follow/Unfollow error:", err);
			setError(`Error: ${err.message}`); // Show error to user
		} finally {
			setFollowLoading(false);
		}
	};

	// --- Fetch User Photos ---
	const fetchUserPhotos = async (pageNum = 1, initialFetch = false) => {
		if (!userId) return;
		setPhotosLoading(true);
		if (initialFetch) {
			setUserPhotos([]); // Clear for initial fetch or user change
			setPhotosPage(1);
			setPhotosTotalPages(1);
			setPhotosTotalCount(0);
		}
		setPhotosError("");

		try {
			const res = await fetch(
				`${API_URL}/users/${userId}/photos?page=${pageNum}&limit=${photosLimit}`
			);
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Failed to fetch user photos");
			}

			setUserPhotos((prevPhotos) =>
				pageNum === 1 ? data.data : [...prevPhotos, ...data.data]
			);
			setPhotosPage(data.page);
			setPhotosTotalPages(data.totalPages);
			setPhotosTotalCount(data.totalCount);
		} catch (err) {
			console.error("Error fetching user photos:", err);
			setPhotosError(err.message);
		} finally {
			setPhotosLoading(false);
		}
	};

	// --- useEffect to fetch photos when userId changes or on initial load ---
	useEffect(() => {
		if (userId) {
			fetchUserPhotos(1, true); // Initial fetch for page 1
		}
	}, [userId]);

	const handleOpenPhotoViewer = (photoEntry) => {
		// setSelectedPhotoUrl(`${API_URL}/photos/${photoEntry.photoId}`);
		// setSelectedPhotoContext(photoEntry.context || "User Photo");
		setSelectedPhotoEntry(photoEntry);
		setIsPhotoViewerModalOpen(true);
	};
	// --- Render Logic ---
	if (loading || authLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<p className="text-red-600 text-center mt-10">
				Error loading profile: {error}
			</p>
		);
	}

	if (!profileData) {
		// Should be covered by error state, but good fallback
		return <p className="text-center mt-10">Profile not found.</p>;
	}

	// Format join date
	// const joinDate = new Date(profileData.createdAt).toLocaleDateString("en-US", {
	// 	year: "numeric",
	// 	month: "long",
	// 	day: "numeric",
	// });
	// console.log("profilePictureUrl", profilePictureUrl);
	// const preferedDateFormat = loggedInUser?.settings?.dateFormat || "YYYY-MM-DD";
	// const preferedTimeFormat = loggedInUser?.settings?.timeFormat || "HH:mm:ss";
	const userSettings = loggedInUser?.settings || {
		dateFormat: "YYYY-MM-DD",
		timeFormat: "24h",
	};
	const joinDate = formatDateTime(profileData?.createdAt, userSettings);

	return (
		<>
			<div className="max-w-4xl mx-auto bg-white p-6 md:p-8 shadow-md border border-gray-200">
				{/* --- Profile Header --- */}
				<div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
					<ProfilePicture
						profilePictureUrl={profileData.profilePictureUrl}
						username={profileData.username}
						size={100} // Adjusted size slightly
						className="border-2 border-gray-300"
					/>
					<div className="flex-grow text-center md:text-left">
						<h1 className="text-3xl font-bold text-gray-900 mb-1">
							{profileData.username}
						</h1>
						<p className="text-gray-600 mb-4">
							{profileData.bio || "No bio yet."}
						</p>
						<p className="text-sm text-gray-500 mb-4">Joined: {joinDate}</p>

						{/* Action Buttons */}
						<div className="space-x-3 flex items-center justify-center md:justify-start">
							{isOwnProfile ? (
								<>
									<Link
										href={`/profile/${userId}/edit`}
										className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm no-underline" // Removed rounded
									>
										<FaUserEdit className="mr-2" /> Edit Profile
									</Link>
									<Link
										href={`/settings`} // Link to the new settings page
										className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 text-sm no-underline"
									>
										<FaCog className="mr-2" /> Settings
									</Link>
								</>
							) : loggedInUser ? (
								<>
									{!isFollowing && (
										<button
											onClick={handleFollowToggle}
											disabled={followLoading}
											className="flex items-center px-4 py-2 text-sm text-white disabled:opacity-50 bg-green-500 hover:bg-green-600 " // Removed rounded
										>
											{followLoading ? (
												"..."
											) : (
												<>
													<FaUserPlus className="mr-2" /> Follow
												</>
											)}
										</button>
									)}
									{isFollowing && (
										<button
											onClick={handleFollowToggle}
											disabled={followLoading}
											className="flex items-center px-4 py-2 text-sm text-white disabled:opacity-50 bg-gray-500 hover:bg-gray-600" // Removed rounded
										>
											{followLoading ? (
												"..."
											) : (
												<>
													<FaUserMinus className="mr-2" /> Unfollow
												</>
											)}
										</button>
									)}
								</>
							) : (
								<button
									disabled
									className="flex items-center px-4 py-2 text-sm text-white bg-gray-400 opacity-50 cursor-not-allowed" // Removed rounded
								>
									<FaUserPlus className="mr-2" /> Follow
								</button>
							)}
						</div>
						{/* Display follow/unfollow errors specifically */}
						{error && followLoading && (
							<p className="text-red-500 text-sm mt-2 text-center md:text-left">
								{error}
							</p>
						)}
					</div>
				</div>

				{/* --- Stats Bar --- */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-gray-200 py-4 mb-6 text-center">
					<div>
						<div className="text-xs text-gray-500 uppercase tracking-wider">
							Distance
						</div>
						<div className="text-xl font-semibold text-gray-800">
							{formatDistance(profileData.totalDistance, preferredUnits)}
						</div>
					</div>
					<div>
						<div className="text-xs text-gray-500 uppercase tracking-wider">
							Trips
						</div>
						<div className="text-xl font-semibold text-gray-800">
							{profileData.totalTrips}
						</div>
					</div>
					{/* Clickable Follower/Following Counts */}
					<div
						className="cursor-pointer hover:bg-gray-50 p-2"
						onClick={() => setIsFollowersModalOpen(true)}
					>
						<div className="text-xs text-gray-500 uppercase tracking-wider">
							Followers
						</div>
						<div className="text-xl font-semibold text-blue-600">
							{profileData.followersCount}
						</div>
					</div>
					<div
						className="cursor-pointer hover:bg-gray-50 p-2"
						onClick={() => setIsFollowingModalOpen(true)}
					>
						<div className="text-xs text-gray-500 uppercase tracking-wider">
							Following
						</div>
						<div className="text-xl font-semibold text-blue-600">
							{profileData.followingCount}
						</div>
					</div>
				</div>

				{/* --- Content Links --- */}
				{/* <div className="flex justify-center space-x-6 text-gray-700">
					<button
						onClick={() => setIsRecommendationsModalOpen(true)}
						className="flex items-center text-blue-600 hover:underline hover:text-blue-800 transition-colors"
					>
						<FaStar className="mr-1.5" />
						Recommendations ({profileData.totalRecommendations})
					</button>
					<button
						onClick={() => setIsPoisModalOpen(true)}
						className="flex items-center text-blue-600 hover:underline hover:text-blue-800 transition-colors"
					>
						<FaMapMarkerAlt className="mr-1.5" />
						Points of Interest ({profileData.totalPois})
					</button>
				</div> */}
				<div className="mt-6 border-b border-gray-200">
					<nav
						className="-mb-px flex space-x-6 justify-center"
						aria-label="Tabs"
					>
						{/* Recommendations Tab/Link */}
						<button
							onClick={() => setIsRecommendationsModalOpen(true)}
							className="whitespace-nowrap pb-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm flex items-center group transition-colors duration-150 cursor-pointer"
						>
							<FaStar className="mr-2 text-yellow-400 group-hover:text-yellow-500 transition-colors duration-150" />
							Recommendations
							{profileData.totalRecommendations > 0 && (
								<span className="ml-2 bg-gray-200 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transition-colors duration-150">
									{profileData.totalRecommendations}
								</span>
							)}
						</button>

						{/* POIs Tab/Link */}
						<button
							onClick={() => setIsPoisModalOpen(true)}
							className="cursor-pointer whitespace-nowrap pb-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm flex items-center group transition-colors duration-150"
						>
							<FaMapMarkerAlt className="mr-2 text-red-400 group-hover:text-red-500 transition-colors duration-150" />
							Points of Interest
							{profileData.totalPois > 0 && (
								<span className="ml-2 bg-gray-200 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transition-colors duration-150">
									{profileData.totalPois}
								</span>
							)}
						</button>
					</nav>
				</div>

				{/* --- Photo Gallery Section --- */}
				{photosTotalCount > 0 && (
					<section className="mt-6  bg-white shadow ">
						<h2 className="pl-2 pt-2 text-xl font-semibold text-gray-800 mb-4 flex items-center">
							<FaImages className="mr-2  text-blue-500" />
							Gallery
						</h2>
						{photosError && (
							<p className="text-red-500 text-sm mb-3">{photosError}</p>
						)}
						<div className="flex overflow-x-auto space-x-1 pb-3 items-center">
							{userPhotos.map((photoEntry, index) => (
								<div
									key={photoEntry.photoId + "-" + index} // Ensure unique key if photoId could repeat before unique filtering on backend
									className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 relative overflow-hidden cursor-pointer group"
									onClick={() => handleOpenPhotoViewer(photoEntry)}
								>
									<Image
										src={`${API_URL}/photos/${photoEntry.photoId}`}
										alt={photoEntry.context || "User photo"}
										fill
										style={{ objectFit: "cover" }}
										className="group-hover:opacity-80 transition-opacity"
										unoptimized // Assuming direct serving, adjust if using Next.js image optimization for these
										sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
									/>
									<div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
										<FaExpand className="text-white text-2xl" />
									</div>
								</div>
							))}
							{!photosLoading && photosPage < photosTotalPages && (
								<div className="flex-shrink-0 ml-3">
									<button
										onClick={() => fetchUserPhotos(photosPage + 1)}
										className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm  flex items-center justify-center"
									>
										Load More
									</button>
								</div>
							)}
							{photosLoading &&
								!userPhotos.length && ( // Show spinner only if loading and no photos yet
									<div className="flex items-center justify-center w-full h-40">
										<LoadingSpinner />
									</div>
								)}
						</div>
						{/* {!photosLoading && photosPage < photosTotalPages && (
							<div className="text-center mt-4">
								<button
									onClick={() => fetchUserPhotos(photosPage + 1)}
									className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
								>
									Load More Photos
								</button>
							</div>
						)} */}
						{!photosLoading && userPhotos.length === 0 && !photosError && (
							<p className="text-gray-500 text-center py-4">
								No photos to display yet.
							</p>
						)}
					</section>
				)}
			</div>

			{/* --- Render Modals --- */}
			<FollowListModal
				isOpen={isFollowersModalOpen}
				onClose={() => setIsFollowersModalOpen(false)}
				userId={userId}
				type="followers"
			/>
			<FollowListModal
				isOpen={isFollowingModalOpen}
				onClose={() => setIsFollowingModalOpen(false)}
				userId={userId}
				type="following"
			/>
			<RecommendationsModal
				isOpen={isRecommendationsModalOpen}
				onClose={() => setIsRecommendationsModalOpen(false)}
				userId={userId}
			/>
			<PoisModal
				isOpen={isPoisModalOpen}
				onClose={() => setIsPoisModalOpen(false)}
				userId={userId}
				userSettings={userSettings}
			/>

			<PhotoViewerModal
				// isOpen={isPhotoViewerModalOpen}
				// onClose={() => setIsPhotoViewerModalOpen(false)}
				// photoUrl={selectedPhotoUrl}
				// photoContext={selectedPhotoContext}
				isOpen={isPhotoViewerModalOpen}
				onClose={() => {
					setIsPhotoViewerModalOpen(false);
					setSelectedPhotoEntry(null); // Clear the entry on close
				}}
				entry={selectedPhotoEntry}
			/>
		</>
	);
}
