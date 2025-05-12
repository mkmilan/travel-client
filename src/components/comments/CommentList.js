// src/components/comments/CommentList.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import ProfilePicture from "../ProfilePicture";
import { formatDateTime } from "@/utils/formatters";

export default function CommentList({
	comments = [],
	loggedInUser,
	onDeleteComment,
	tripId,
}) {
	const [deletingId, setDeletingId] = useState(null);
	const userSettings = loggedInUser?.settings || {
		dateFormat: "YYYY-MM-DD",
		timeFormat: "24h",
	};

	if (comments.length === 0) {
		return <p className="text-gray-500 text-sm">No comments yet.</p>;
	}
	const handleDeleteClick = async (commentId) => {
		if (!onDeleteComment || deletingId) return; // Prevent double clicks

		setDeletingId(commentId);
		try {
			// Call the handler passed from the parent component
			await onDeleteComment(commentId);
			// Parent component should handle state update
		} catch (error) {
			// Parent component should handle error display
			console.error("Error triggered during comment deletion:", error);
		} finally {
			setDeletingId(null); // Reset loading state regardless of outcome
		}
	};

	return (
		<div className="space-y-4">
			{comments.map((comment) => {
				const canDelete = loggedInUser === comment.user._id;
				// console.log("CanDelete:", canDelete);
				// console.log("Comment User ID:", comment.user._id);
				// console.log("LoggedInUser ID:", loggedInUser);
				// console.log("deletingId:", deletingId);
				// console.log("Comment ID:", comment._id);
				return (
					<div
						key={comment._id}
						className="flex items-start mb-3"
					>
						<Link
							href={`/profile/${comment.user._id}`}
							className="flex-shrink-0"
						></Link>

						{/* <ProfilePicture
							src={comment.user.profilePictureUrl}
							alt={comment.user.username}
							size={20}
						/> */}
						<div className="flex-grow bg-gray-50 p-3  border border-gray-200">
							<div className="flex items-center justify-between mb-1">
								<Link
									href={`/profile/${comment.user._id}`}
									className="text-sm font-semibold text-gray-800 hover:underline"
								>
									<>{comment.user.username}</>
								</Link>
								<span className="text-xs text-gray-400">
									{/* {new Date(comment.createdAt).toLocaleDateString()} */}
									{formatDateTime(comment.createdAt, userSettings, true)}
								</span>
							</div>
							<p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
								{comment.text}
							</p>
							{/* Delete Button - Conditionally Rendered */}
							{canDelete ? (
								<div
									onClick={() => handleDeleteClick(comment._id)}
									disabled={deletingId === comment._id}
									className="text-gray-500 hover:text-red-600 cursor-pointer"
								>
									<FaTrash className="h-4 w-4 " />
								</div>
							) : (
								// Placeholder for non-deletable comments
								<div className="text-xs text-gray-400">
									{/* This comment cannot be deleted */}
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
