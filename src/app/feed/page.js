"use client";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import TripCard from "@/components/trips/TripCard";
import { SITE_URL, API_URL } from "@/utils/config";

export default function FeedPage() {
	const { user, token } = useAuth();
	const [feedTrips, setFeedTrips] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		// Only fetch if token is available (ProtectedRoute handles initial login check)
		if (token) {
			const fetchFeed = async () => {
				setLoading(true);
				setError("");
				try {
					const res = await fetch(`${API_URL}/trips/feed`, {
						// Relative URL
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});
					const data = await res.json();
					if (!res.ok) {
						throw new Error(
							data.message || `Failed to fetch feed (${res.status})`
						);
					}
					setFeedTrips(data); // Set the array of trips
				} catch (err) {
					console.error("Error fetching feed:", err);
					setError(err.message);
				} finally {
					setLoading(false);
				}
			};

			fetchFeed();
		} else {
			// Handle case where token somehow becomes null after initial load
			setError("Authentication token not found.");
			setLoading(false);
		}
	}, [token]); // Re-fetch if token changes

	// return (
	// 	<ProtectedRoute>
	// 		{" "}
	// 		{/* Protect this page */}
	// 		<div>
	// 			<h1 className="text-3xl font-bold mb-4">Main Feed</h1>
	// 			{user ? (
	// 				<p className="">
	// 					Welcome back, {user.username}! This is your main feed (content
	// 					coming soon).
	// 				</p>
	// 			) : (
	// 				<p className="">Loading user data...</p>
	// 			)}
	// 			{/* TODO: Fetch and display trips from followed users */}
	// 			<div className="mt-6 space-y-4">
	// 				{/* Placeholder for trip cards */}
	// 				<div className="p-4 bg-white rounded shadow border border-gray-200 text-gray-700">
	// 					Trip Card 1 Placeholder
	// 				</div>
	// 				<div className="p-4 bg-white rounded shadow border border-gray-200 text-gray-700">
	// 					Trip Card 2 Placeholder
	// 				</div>
	// 			</div>
	// 		</div>
	// 	</ProtectedRoute>
	// );
	const renderContent = () => {
		// if (loading) return <LoadingComponent />;
		// if (error) return <ErrorComponent message={error} />;
		if (feedTrips.length === 0) {
			// TODO: Add better empty state - maybe suggest finding users to follow
			return (
				<div className="text-center py-10 bg-white p-6 rounded-lg shadow border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-700 mb-2">
						Your Feed is Empty
					</h2>
					<p className="text-gray-500">
						Follow other travelers to see their trips here!
					</p>
					{/* Optional: Link to a user search/discovery page later */}
				</div>
			);
		}

		return (
			<div className="space-y-6">
				{feedTrips.map((trip) => (
					// Pass the trip data (which now includes user details from backend)
					<TripCard
						key={trip._id}
						trip={trip}
					/>
				))}
			</div>
		);
	};

	return (
		<ProtectedRoute>
			<div className="max-w-4xl mx-auto">
				{" "}
				{/* Constrain width */}
				<h1 className="text-3xl font-bold text-gray-900 mb-6">Feed</h1>
				{renderContent()}
			</div>
		</ProtectedRoute>
	);
}
