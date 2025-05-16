// src/app/profile/[userId]/edit/page.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { API_URL } from "@/utils/config";
import Image from "next/image";

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
		loading: authLoading,
		setUser,
		isAuthenticated,
		csrfToken,
	} = useAuth();

	const [bio, setBio] = useState("");
	// Store the file object itself
	const [profilePictureFile, setProfilePictureFile] = useState(null);
	// Store the URL for preview (can be existing URL or object URL for new file)
	const [profilePicturePreview, setProfilePicturePreview] = useState("");
	const [loading, setLoading] = useState(false); // For API call
	const [initialLoading, setInitialLoading] = useState(true); // For initial data fetch
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const fileInputRef = useRef(null); // Ref for the file input
	const profilePictureUrl =
		`${API_URL}/photos/${loggedInUser?.profilePictureUrl}` ||
		"/default-avatar.png";

	// ... (useEffect for authorization and pre-filling) ...
	useEffect(() => {
		if (!authLoading && loggedInUser?._id !== userId) {
			setError("You are not authorized to edit this profile.");
			setTimeout(() => router.push(`/profile/${userId}`), 2000);
		} else if (!authLoading && loggedInUser?._id === userId) {
			setBio(loggedInUser.bio || "");
			// Set initial preview URL from context
			console.log("Profile picture URL:", loggedInUser.profilePictureUrl);

			setProfilePicturePreview(profilePictureUrl);
			//TODO: pozvati backendza podatke za sliku
			// setProfilePicturePreview(
			// 	`${API_URL}/photos/${data.profilePictureUrl}` || "/default-avatar.png"
			// );
			setInitialLoading(false);
		} else if (!authLoading && !loggedInUser) {
			setError("Please log in to edit your profile.");
			setTimeout(() => router.push("/login"), 2000);
		}
	}, [authLoading, loggedInUser, userId, router]);

	// --- Handle File Input Change ---
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		console.log("File selected:", file);

		if (file) {
			// Basic validation (optional: add size/type checks here)
			if (file.size > 50 * 1024 * 1024) {
				// Example: 10MB limit
				setError("File size exceeds 10MB limit.");
				setProfilePictureFile(null); // Clear selection
				e.target.value = null; // Reset file input
				return;
			}
			if (
				!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
					file.type
				)
			) {
				setError(
					"Invalid file type. Please select a JPG, PNG, GIF, or WEBP image."
				);
				setProfilePictureFile(null); // Clear selection
				e.target.value = null; // Reset file input
				return;
			}

			setError(""); // Clear previous errors
			setProfilePictureFile(file);
			// Create a temporary URL for preview
			console.log(
				"Creating object URL for preview:",
				URL.createObjectURL(file)
			);
			console.log("file", file);

			setProfilePicturePreview(URL.createObjectURL(file));
		}
	};

	// --- Form Submission Handler ---
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		if (loggedInUser?._id !== userId) {
			setError("Authorization error.");
			setLoading(false);
			return;
		}

		// Use FormData to send file and text data
		const formData = new FormData();
		formData.append("bio", bio); // Append bio text field

		// Append the file ONLY if a new one was selected
		if (profilePictureFile) {
			// Use 'photo' as the key, matching multer middleware

			formData.append("photo", profilePictureFile);
			console.log("Appending file to FormData:", formData.photo);
		}
		// Note: We don't append profilePictureUrl directly,
		// the backend handles generating the URL after upload.

		try {
			const res = await fetch(`${API_URL}/users/me`, {
				method: "PUT",
				credentials: "include",
				headers: {
					"X-CSRF-Token": csrfToken,
				},
				body: formData, // Send FormData object
			});

			const data = await res.json(); // Server should still respond with JSON
			console.log("Response data:", data);

			if (!res.ok) {
				throw new Error(
					data.message || `Failed to update profile (${res.status})`
				);
			}

			// --- Handle Success ---
			const newProfilePictureUrl = `${data.profilePictureUrl}?t=${Date.now()}`;
			setSuccess("Profile updated successfully!");
			// Update user state in AuthContext with the NEW data from the server response
			// setUser(data);
			setUser({ ...data, profilePictureUrl: newProfilePictureUrl });
			setProfilePictureFile(null); // Clear the selected file state
			if (fileInputRef.current) {
				fileInputRef.current.value = null; // Reset file input visually
			}
			// Update preview to the new URL from the server
			// setProfilePicturePreview(data.profilePictureUrl || "");

			// Redirect back to profile page after a short delay
			setTimeout(() => {
				router.push(`/profile/${userId}`);
			}, 1500);
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
			) : error && !success ? (
				<p className="text-red-600 text-center mt-10">{error}</p>
			) : (
				<div className="max-w-2xl mx-auto bg-white p-6 md:p-8 shadow-md border border-gray-200">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">
						Edit Profile
					</h1>

					{success && <p className="text-green-600 mb-4">{success}</p>}

					<form
						onSubmit={handleSubmit}
						className="space-y-4"
					>
						{/* Profile Picture Upload */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Profile Picture
							</label>
							<div className="flex items-center space-x-4">
								{/* Image Preview */}
								<div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
									{profilePicturePreview ? (
										<Image
											src={profilePicturePreview}
											alt="Profile Preview"
											width={64}
											height={64}
											className="object-cover h-full w-full"
											// Handle potential loading errors for external URLs
											onError={() => setProfilePicturePreview("")} // Clear preview on error
										/>
									) : (
										<span className="text-gray-500 text-xs">No Image</span>
									)}
								</div>
								<input
									ref={fileInputRef} // Assign ref
									type="file"
									id="profilePicture"
									name="profilePicture" // Name might not be strictly needed here
									accept="image/png, image/jpeg, image/gif, image/webp" // Specify accepted types
									onChange={handleFileChange}
									className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
								/>
							</div>
						</div>

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
								placeholder="Tell us a little about yourself..."
								className="text-gray-700 block w-full px-3 py-2 border border-gray-300 shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								maxLength={160}
							/>
							<p className="text-xs text-gray-500 mt-1">
								{160 - (bio?.length || 0)} characters remaining
							</p>
						</div>

						{/* Error message for submission */}
						{error && !success && (
							<p className="text-sm text-red-600">{error}</p>
						)}

						{/* Submit Button */}
						<div className="flex justify-end space-x-3 pt-4">
							<button
								type="button"
								onClick={() => router.back()}
								className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2  text-sm"
								disabled={loading}
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading || initialLoading}
								className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2  text-sm disabled:opacity-50"
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
