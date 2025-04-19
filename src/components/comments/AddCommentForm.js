"use client";
import React, { useState } from "react";
import { API_URL } from "@/utils/config";

export default function AddCommentForm({ tripId, onCommentAdded, token }) {
	const [text, setText] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!text.trim() || !token || !tripId) {
			setError(
				!token
					? "You must be logged in to comment."
					: "Comment text cannot be empty."
			);
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			const res = await fetch(`${API_URL}/trips/${tripId}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ text: text.trim() }),
			});
			const newComment = await res.json();

			if (!res.ok) {
				throw new Error(
					newComment.message || `Failed to add comment (${res.status})`
				);
			}

			// Clear form and notify parent
			setText("");
			onCommentAdded(newComment); // Pass the new comment (with populated user) up
		} catch (err) {
			console.error("Error adding comment:", err);
			setError(err.message || "Could not post comment.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mt-4"
		>
			<textarea
				rows={3}
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Add your comment..."
				maxLength={500}
				required
				className="block w-full px-3 py-2 border border-gray-300  shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
			/>
			{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
			<div className="flex justify-end mt-2">
				<button
					type="submit"
					disabled={isSubmitting || !text.trim()}
					className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm disabled:opacity-50"
				>
					{isSubmitting ? "Posting..." : "Post Comment"}
				</button>
			</div>
		</form>
	);
}
