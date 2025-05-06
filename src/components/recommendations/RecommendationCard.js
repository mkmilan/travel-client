"use strict client";
// filepath: /home/mkmilan/Documents/my/travel-2/client/src/components/recommendations/RecommendationCard.js
import React from "react";
import Link from "next/link";
import ProfilePicture from "@/components/ProfilePicture";
import { FaStar } from "react-icons/fa";
import { RECOMMENDATION_CATEGORIES } from "@/utils/constants"; // To display category label
import { getRecommendationCategoryLabel } from "@/utils/constants";

// Simple Star Display Component
const StaticStarRating = ({ rating }) => {
	return (
		<div className="flex items-center space-x-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<FaStar
					key={star}
					className={`w-4 h-4 ${
						rating >= star ? "text-yellow-500" : "text-gray-300"
					}`}
				/>
			))}
			<span className="text-xs text-gray-600">({rating})</span>
		</div>
	);
};

export default function RecommendationCard({ recommendation }) {
	if (!recommendation) return null;

	const { _id, name, description, rating, primaryCategory, user } =
		recommendation;

	return (
		<div className="border-b border-gray-200 py-4 last:border-b-0 ">
			<Link
				href={`/recommendations/${_id}`}
				className=" "
			>
				<div className="flex justify-between items-start mb-2">
					{/* Link the name to the detail page */}
					{/* <Link
					href={`/recommendations/${_id}`}
					className="hover:text-indigo-600"
				> */}
					<h3 className="text-md font-semibold text-gray-800">{name}</h3>
					{/* </Link> */}
					<StaticStarRating rating={rating} />
				</div>

				<div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
					<span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
						{getRecommendationCategoryLabel(primaryCategory)}
					</span>
					<span>·</span>
					{/* <Link
					href={`/profile/${user._id}`}
					className="flex items-center hover:underline"
				> */}
					<ProfilePicture
						size={20}
						profilePictureUrl={user.profilePictureUrl}
						className="mr-1"
					/>
					<span>{user.username}</span>
					{/* </Link> */}
				</div>

				<p className="text-sm text-gray-600 line-clamp-2 mb-1">
					{" "}
					{/* Reduced line clamp */}
					{description}
				</p>
				{/* Add link to view full recommendation */}

				{/* View Details */}
			</Link>
		</div>
	);
}
