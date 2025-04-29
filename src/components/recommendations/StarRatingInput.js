import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

export const StarRatingInput = ({ rating, setRating }) => {
	return (
		<div className="flex space-x-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button" // Prevent form submission
					onClick={() => setRating(star)}
					className="text-yellow-500 focus:outline-none"
					aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
				>
					{rating >= star ? (
						<FaStar className="w-6 h-6" />
					) : (
						<FaRegStar className="w-6 h-6" />
					)}
				</button>
			))}
		</div>
	);
};
