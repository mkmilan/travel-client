import React from "react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import Image from "next/image";
import { useEffect, useState } from "react";

const ProfilePicture = ({ size = 15, className = "" }) => {
	const { user } = useAuth();
	const [key, setKey] = useState(Date.now());
	const profile =
		`${API_URL}/photos/${user?.profilePictureUrl}` || "/default-avatar.png";

	useEffect(() => {
		setKey(Date.now());
	}, [user?.profilePictureUrl]);
	console.log("profilePicture URL from Profile picture component", profile);

	return (
		<div
			className={`rounded-full h-${size} w-${size} overflow-hidden avatar aspect-square rounded-full`}
		>
			<Image
				key={key}
				src={profile}
				alt="Profile Picture"
				width={size}
				height={size}
				className="rounded-full border-1 border-gray-300 h-full w-full object-cover"
			/>
		</div>
	);
};

export default ProfilePicture;
