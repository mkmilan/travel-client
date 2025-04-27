// filepath: /home/mkmilan/Documents/my/travel-2/client/src/app/recommendations/new/page.js
import React from "react";
import RecommendationForm from "@/components/recommendations/RecommendationForm";
import ProtectedRoute from "@/components/ProtectedRoute"; // Ensure user is logged in

export default function NewRecommendationPage() {
	return (
		<ProtectedRoute>
			<div className="max-w-4xl mx-auto bg-white p-6 md:p-8 shadow-md border border-gray-200 mb-8">
				<h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
					Add New Recommendation
				</h1>
				<RecommendationForm />
			</div>
		</ProtectedRoute>
	);
}
