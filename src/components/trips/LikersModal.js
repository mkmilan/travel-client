// filepath: client/src/components/trips/LikersModal.js
"use client";

import React from "react";
import Link from "next/link";
import ProfilePicture from "@/components/ProfilePicture";
import Modal from "@/components/Modal"; // Import the new generic modal
// FaTimes is no longer needed here as it's handled by the generic Modal

export default function LikersModal({
	isOpen,
	onClose,
	likers = [],
	isLoading,
	error,
}) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Liked By" // Pass the title
			size="sm" // Specify the size
		>
			{/* Body content remains the same */}
			<div className="space-y-3">
				{isLoading ? (
					<p className="text-gray-600 text-center">Loading likers...</p>
				) : error ? (
					<p className="text-red-600 text-center">Error: {error}</p>
				) : likers.length === 0 ? (
					<p className="text-gray-600 text-center">No likes yet.</p>
				) : (
					likers.map((liker) => (
						<Link
							key={liker._id}
							href={`/profile/${liker._id}`}
							className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 transition duration-150"
							onClick={onClose} // Close modal when clicking a user link
						>
							<ProfilePicture
								size={30}
								profilePictureUrl={liker.profilePictureUrl}
							/>
							<span className="font-medium text-gray-700">
								{liker.username}
							</span>
						</Link>
					))
				)}
			</div>
		</Modal>
	);
}
