import React from "react";
import RecommendationCard from "./RecommendationCard";

export default function RecommendationList({ recommendations }) {
	if (!recommendations || recommendations.length === 0) {
		return <p>No recommendations available.</p>;
	}

	return (
		<div className="space-y-4">
			{recommendations.map((rec) => (
				<RecommendationCard
					key={rec._id}
					recommendation={rec}
				/>
			))}
		</div>
	);
}
