// src/app/profile/[userId]/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
	FaUserPlus,
	FaUserMinus,
	FaUserCheck,
	FaUserEdit,
} from "react-icons/fa";
import { API_URL } from "@/utils/config";
import ProfilePicture from "@/components/ProfilePicture";
// Placeholder loading component
const LoadingSpinner = () => (
	<div className="flex justify-center items-center h-64">
		<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
	</div>
);

export default function ProfilePage() {
	const params = useParams(); // { userId: 'the_actual_id_from_url' }
	const { userId } = params;
	const { user, token, loading: authLoading } = useAuth();
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isFollowing, setIsFollowing] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);
	// const [profilePictureUrl, setProfilePictureUrl] = useState("");
	// const profilePictureUrl =
	// 	`${API_URL}/photos/${user?.profilePictureUrl}` || "/default-avatar.png";
	// console.log("user", user);
	const loggedInUser = user;

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
	const joinDate = new Date(profileData.createdAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	// console.log("profilePictureUrl", profilePictureUrl);

	return (
		<div className="max-w-4xl mx-auto bg-white p-6 md:p-8  shadow-md border border-gray-200">
			<div className="flex flex-col md:flex-row items-center md:items-start gap-6">
				{/* Profile Picture */}
				{/* <div className="flex-shrink-0 h-50 w-50 rounded-full overflow-hidden">
					<Image
						src={
							// `${API_URL}/photos/${profileData.profilePictureUrl}}` ||
							profilePictureUrl || "/default-avatar.png"
						}
						alt={`${profileData.username}'s profile picture`}
						width={100}
						height={100}
						className="rounded-full border-2 border-gray-300 object-cover h-full w-full"
						priority // Prioritize loading profile image
					/>
				</div> */}
				<ProfilePicture
					size={200}
					// className="rounded-full border-2 border-gray-300 object-cover h-full w-full"
				/>
				{/* Profile Info */}
				<div className="flex-grow text-center md:text-left">
					<h1 className="text-3xl font-bold text-gray-900 mb-1">
						{profileData.username}
					</h1>
					<p className="text-gray-600 mb-4">
						{profileData.bio || "No bio yet."}
					</p>

					<div className="flex justify-center md:justify-start space-x-6 mb-4 text-gray-700">
						{/* Placeholder for Trip Count - Add later */}
						{/* <span><strong>X</strong> Trips</span> */}
						<span>
							<strong>{profileData.followersCount}</strong> Followers
						</span>
						<span>
							<strong>{profileData.followingCount}</strong> Following
						</span>
					</div>

					<p className="text-sm text-gray-500 mb-4">Joined: {joinDate}</p>

					{/* Action Buttons */}
					<div className="space-x-3 flex items-center justify-center md:justify-start">
						{isOwnProfile ? (
							<Link
								href={`/profile/${userId}/edit`}
								className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm no-underline"
							>
								<FaUserEdit className="mr-2" /> Edit Profile
							</Link>
						) : loggedInUser ? ( // Show follow/unfollow only if logged in
							// <button
							// 	onClick={handleFollowToggle}
							// 	disabled={followLoading}
							// 	className={`flex items-center px-4 py-2 rounded text-sm text-white disabled:opacity-50 ${
							// 		isFollowing
							// 			? "bg-gray-500 hover:bg-gray-600" // Style for Unfollow
							// 			: "bg-green-500 hover:bg-green-600" // Style for Follow
							// 	}`}
							// >
							// 	{followLoading ? (
							// 		"..." // Simple loading indicator
							// 	) : isFollowing ? (
							// 		<>
							// 			<FaUserCheck className="mr-2" /> Following
							// 		</>
							// 	) : (
							// 		<>
							// 			<FaUserPlus className="mr-2" /> Follow
							// 		</>
							// 	)}
							// </button>
							<>
								{!isFollowing && (
									<button
										onClick={handleFollowToggle}
										disabled={followLoading}
										className="flex items-center px-4 py-2 rounded text-sm text-white disabled:opacity-50 bg-green-500 hover:bg-green-600 "
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
										className="flex items-center px-4 py-2 rounded text-sm text-white disabled:opacity-5 bg-gray-500 hover:bg-gray-600"
									>
										{followLoading ? (
											"..."
										) : (
											<>
												<FaUserMinus className="mr-2" /> Unfollow
											</>
										)}{" "}
										{/* Use different icon */}
									</button>
								)}
							</>
						) : (
							// Optional: Show a disabled Follow button or prompt to login if not logged in
							<button
								disabled
								className="flex items-center px-4 py-2 rounded text-sm text-white bg-gray-400 opacity-50 cursor-not-allowed"
							>
								<FaUserPlus className="mr-2" /> Follow
							</button>
						)}
					</div>
					{/* Display follow/unfollow errors */}
					{error && followLoading && (
						<p className="text-red-500 text-sm mt-2 text-center md:text-left">
							{error}
						</p>
					)}
				</div>
			</div>

			{/* User's Trips Section (Placeholder) */}
			<div className="mt-10 pt-6 border-t border-gray-200">
				<h2 className="text-2xl font-semibold text-gray-800 mb-4">Trips</h2>
				<p className="text-gray-600">Trips will be displayed here soon!</p>
				{/* TODO: Fetch and display user's trips */}
			</div>
		</div>
	);
}
