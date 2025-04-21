import React from "react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import Image from "next/image";
import { useEffect, useState } from "react";

const ProfilePicture = ({ size = 15, className = "", profilePictureUrl }) => {
	const { user } = useAuth();
	const [key, setKey] = useState(Date.now());

	const pictureId = profilePictureUrl || user?.profilePictureUrl;
	const profileSrc = `${API_URL}/photos/${pictureId}` || "/default-avatar.png";

	useEffect(() => {
		setKey(Date.now());
	}, [pictureId]);
	console.log("profilePicture URL from Profile picture component", profileSrc);

	return (
		<div
			className={`rounded-full h-${size} w-${size} overflow-hidden avatar aspect-square rounded-full`}
		>
			<Image
				key={key}
				src={profileSrc}
				alt="Profile Picture"
				width={size}
				height={size}
				className="rounded-full border-1 border-gray-300 h-full w-full object-cover"
			/>
		</div>
	);
};

export default ProfilePicture;
