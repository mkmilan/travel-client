// src/app/profile/[userId]/edit/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { API_URL } from "@/utils/config";

// Simple loading indicator
const LoadingSpinner = () => (
	<div className="flex justify-center items-center h-64">
		<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
	</div>
);

export default function EditProfilePage() {
	const params = useParams();
	const { userId } = params;
	const router = useRouter();
	const {
		user: loggedInUser,
		token,
		loading: authLoading,
		setUser,
	} = useAuth();

	const [bio, setBio] = useState("");
	const [profilePictureUrl, setProfilePictureUrl] = useState("");
	const [loading, setLoading] = useState(false); // For API call
	const [initialLoading, setInitialLoading] = useState(true); // For initial data fetch
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Authorization Check: Ensure logged-in user matches the profile being edited
	useEffect(() => {
		if (!authLoading && loggedInUser?._id !== userId) {
			// If auth is loaded and user doesn't match, redirect
			setError("You are not authorized to edit this profile.");
			setTimeout(() => router.push(`/profile/${userId}`), 2000);
		}
		// If authorized, fetch current data to pre-fill form
		else if (!authLoading && loggedInUser?._id === userId) {
			// Pre-fill form with data from AuthContext (usually fresh enough after login/refresh)
			setBio(loggedInUser.bio || "");
			setProfilePictureUrl(loggedInUser.profilePictureUrl || "");
			setInitialLoading(false); // Done initial loading/check
		} else if (!authLoading && !loggedInUser) {
			// If auth is loaded but no user (should be caught by ProtectedRoute, but belt-and-suspenders)
			setError("Please log in to edit your profile.");
			setTimeout(() => router.push("/login"), 2000);
		}
	}, [authLoading, loggedInUser, userId, router]);

	// --- Form Submission Handler ---
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		// Check again if user is authorized (though useEffect should handle redirects)
		if (loggedInUser?._id !== userId) {
			setError("Authorization error.");
			setLoading(false);
			return;
		}

		try {
			const res = await fetch(`${API_URL}/users/me`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`, // Send the token
				},
				// Send only the fields being updated
				body: JSON.stringify({ bio, profilePictureUrl }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || `Failed to update profile (${res.status})`
				);
			}

			// --- Handle Success ---
			setSuccess("Profile updated successfully!");
			// Update user state in AuthContext immediately for UI consistency
			setUser(data); // Update context with the response from the server
			// Redirect back to profile page after a short delay
			setTimeout(() => {
				router.push(`/profile/${userId}`); //////////////////////////////////////////
			}, 1500); // 1.5 seconds delay
		} catch (err) {
			console.error("Error updating profile:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// --- Render Logic ---
	// Show ProtectedRoute's handling first (redirects if not logged in at all)
	// Then show our loading/error/auth states
	return (
		<ProtectedRoute>
			{initialLoading ? (
				<LoadingSpinner />
			) : error && !success ? ( // Show error only if there's no success message yet
				<p className="text-red-600 text-center mt-10">{error}</p>
			) : (
				<div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">
						Edit Profile
					</h1>

					{success && <p className="text-green-600 mb-4">{success}</p>}

					<form
						onSubmit={handleSubmit}
						className="space-y-4"
					>
						{/* Bio Field */}
						<div>
							<label
								htmlFor="bio"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Bio
							</label>
							<textarea
								id="bio"
								name="bio"
								rows={4}
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell us a little about yourself and your travels..."
								className="text-gray-700 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								maxLength={160} // Matches schema validation
							/>
							<p className="text-xs text-gray-500 mt-1">
								{160 - bio.length} characters remaining
							</p>
						</div>

						{/* Profile Picture URL Field */}
						<div>
							<label
								htmlFor="profilePictureUrl"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Profile Picture URL
							</label>
							<input
								id="profilePictureUrl"
								name="profilePictureUrl"
								type="url" // Use type="url" for basic format hint
								value={profilePictureUrl}
								onChange={(e) => setProfilePictureUrl(e.target.value)}
								placeholder="https://example.com/your-image.jpg"
								className="text-gray-600 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
							{/* Simple image preview */}
							{profilePictureUrl && (
								<div className="mt-2">
									<span className="text-xs text-gray-500 mr-2">Preview:</span>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={profilePictureUrl}
										alt="Preview"
										className="inline-block h-10 w-10 rounded-full object-cover border border-gray-300"
										onError={(e) => (e.target.style.display = "none")}
										onLoad={(e) => (e.target.style.display = "inline-block")}
									/>
								</div>
							)}
						</div>

						{/* Error message for submission */}
						{error && !success && (
							<p className="text-sm text-red-600">{error}</p>
						)}

						{/* Submit Button */}
						<div className="flex justify-end space-x-3 pt-4">
							<button
								type="button" // Cancel button
								onClick={() => router.back()} // Go back to previous page
								className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
								disabled={loading}
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading || initialLoading} // Disable while loading data or submitting
								className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
							>
								{loading ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</form>
				</div>
			)}
		</ProtectedRoute>
	);
}
