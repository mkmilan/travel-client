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
	const poiId = searchParams.get("poiId"); // Get POI ID
	const lat = searchParams.get("lat");
	const lon = searchParams.get("lon");
	const poiName = searchParams.get("poiName");
	const poiDesc = searchParams.get("poiDesc");

	const initialData = {
		name: poiName ? decodeURIComponent(poiName) : "",
		description: poiDesc ? decodeURIComponent(poiDesc) : "",
		latitude: lat || "",
		longitude: lon || "",
		// location: { coordinates: [lon ? parseFloat(lon) : null, lat ? parseFloat(lat) : null] } // Alternative if form expects location object
	};

	return (
		<div className="max-w-4xl mx-auto bg-white p-6 md:p-8 shadow-md border border-gray-200 mb-8">
			<h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
				Add New Recommendation
			</h1>
			<RecommendationForm
				initialData={initialData}
				associatedTripId={tripId}
				associatedPoiId={poiId}
				source={poiId ? "POI" : "MANUAL"}
			/>
		</div>
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
