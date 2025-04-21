"use client";

import React from "react";
import Link from "next/link";
import ProfilePicture from "@/components/ProfilePicture";
import { FaTimes } from "react-icons/fa"; // Close icon

export default function LikersModal({
	isOpen,
	onClose,
	likers = [], // Default to empty array
	isLoading,
	error,
}) {
	if (!isOpen) return null;

	return (
		// Backdrop
		<div
			className="fixed inset-0 bg-white bg-opacity-50 z-40 flex justify-center items-center p-4"
			onClick={onClose} // Close when clicking backdrop
		>
			{/* Modal Content */}
			<div
				className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto p-5 z-50"
				onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
			>
				{/* Header */}
				<div className="flex justify-between items-center mb-4 border-b pb-2">
					<h3 className="text-lg font-semibold text-gray-800">Liked By</h3>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-800"
						aria-label="Close modal"
					>
						<FaTimes size={20} />
					</button>
				</div>

				{/* Body */}
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
									size={30} // Slightly larger picture in modal
									profilePictureUrl={liker.profilePictureUrl}
								/>
								<span className="font-medium text-gray-700">
									{liker.username}
								</span>
							</Link>
						))
					)}
				</div>
			</div>
		</div>
	);
}
