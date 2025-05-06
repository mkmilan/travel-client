import React from "react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import Image from "next/image";
import { useEffect, useState } from "react";

const ProfilePicture = ({
	size = 15,
	className = "",
	profilePictureUrl,
	username = "User",
}) => {
	const { user: loggedInUser } = useAuth();
	const [imageKey, setImageKey] = useState(Date.now());
	const [currentSrc, setCurrentSrc] = useState("/default-avatar.png");

	// const pictureId = profilePictureUrl || user?.profilePictureUrl;
	// const profileSrc = `${API_URL}/photos/${pictureId}` || "/default-avatar.png";

	useEffect(() => {
		// Determine the picture ID: use passed prop or fallback to logged-in user's
		const picId = profilePictureUrl || loggedInUser?.profilePictureUrl;

		if (picId) {
			setCurrentSrc(`${API_URL}/photos/${picId}`);
		} else {
			setCurrentSrc("/default-avatar.png");
		}
		setImageKey(Date.now()); // Refresh key when source logic changes to force re-render of Image if needed
	}, [profilePictureUrl, loggedInUser?.profilePictureUrl]);
	// console.log("profilePicture URL from Profile picture component", profileSrc);

	return (
		<div
			className={`relative rounded-full overflow-hidden aspect-square ${className}`}
			style={{ width: `${size}px`, height: `${size}px` }}
		>
			<Image
				key={imageKey}
				src={currentSrc}
				alt={username ? `${username}'s profile picture` : "Profile picture"}
				fill
				style={{ objectFit: "cover" }}
				className="rounded-full" // Ensures the image itself is rounded
				sizes={`${size}px`} // Provides a hint to Next.js Image optimization
				onError={() => {
					// console.warn(`Error loading image: ${currentSrc}. Falling back to default.`);
					if (currentSrc !== "/default-avatar.png") {
						// Avoid infinite loop if default also fails
						setCurrentSrc("/default-avatar.png");
						setImageKey(Date.now()); // Refresh key for fallback
					}
				}}
			/>
		</div>
	);
};

export default ProfilePicture;
