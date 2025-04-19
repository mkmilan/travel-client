// src/components/comments/CommentList.jsx
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function CommentList({ comments = [] }) {
	if (comments.length === 0) {
		return <p className="text-gray-500 text-sm">No comments yet.</p>;
	}

	return (
		<div className="space-y-4">
			{comments.map((comment) => (
				<div
					key={comment._id}
					className="flex items-start space-x-3"
				>
					<Link
						href={`/profile/${comment.user._id}`}
						className="flex-shrink-0"
					>
						{/* <Image
							src={comment.user.profilePictureUrl || "/default-avatar.png"}
							alt={comment.user.username}
							width={32}
							height={32}
							className="rounded-full object-cover"
						/> */}
					</Link>
					<div className="flex-grow bg-gray-50 p-3  border border-gray-200">
						<div className="flex items-center justify-between mb-1">
							<Link
								href={`/profile/${comment.user._id}`}
								className="text-sm font-semibold text-gray-800 hover:underline"
							>
								{comment.user.username}
							</Link>
							<span className="text-xs text-gray-400">
								{new Date(comment.createdAt).toLocaleDateString()}
							</span>
						</div>
						<p className="text-sm text-gray-700 whitespace-pre-wrap">
							{comment.text}
						</p>
						{/* TODO: Add Delete button if user owns comment */}
					</div>
				</div>
			))}
		</div>
	);
}
