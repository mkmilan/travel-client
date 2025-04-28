// filepath: /home/mkmilan/Documents/my/travel-2/client/src/app/recommendations/new/page.js
"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoadingComponent from "@/components/LoadingComponent";
import RecommendationForm from "@/components/recommendations/RecommendationForm";
import ProtectedRoute from "@/components/ProtectedRoute";

function NewRecommendationContent() {
	const searchParams = useSearchParams();
	const tripId = searchParams.get("tripId");
	console.log("tripId", tripId);

	return (
		// <ProtectedRoute>
		<div className="max-w-4xl mx-auto bg-white p-6 md:p-8 shadow-md border border-gray-200 mb-8">
			<h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
				Add New Recommendation
			</h1>
			<RecommendationForm associatedTripId={tripId} />
		</div>
		// </ProtectedRoute>
	);
}
export default function NewRecommendationPage() {
	return (
		<ProtectedRoute>
			{/* Suspense is required when using useSearchParams in Pages Router */}
			<Suspense fallback={<LoadingComponent />}>
				<NewRecommendationContent />
			</Suspense>
		</ProtectedRoute>
	);
}
