"use client";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import TripCard from "@/components/trips/TripCard";
import { API_URL } from "@/utils/config";

export default function FeedPage() {
	const { user, isAuthenticated, csrfToken } = useAuth();
	const [feedTrips, setFeedTrips] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (isAuthenticated) {
			const fetchFeed = async () => {
				setLoading(true);
				setError("");
				try {
					const res = await fetch(`${API_URL}/trips/feed`, {
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							"X-CSRF-Token": csrfToken,
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
			// Handle case where isAuthenticated somehow becomes null after initial load
			setError("Authentication isAuthenticated not found.");
			setLoading(false);
		}
	}, [isAuthenticated]);

	const renderContent = () => {
		if (feedTrips.length === 0) {
			// TODO: Add better empty state - maybe suggest finding users to follow
			return (
				<div className="text-center py-10 bg-white p-6  shadow border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
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
				<h1 className="text-xl text-center font-bold text-gray-900 mb-6">
					Feed
				</h1>
				{renderContent()}
			</div>
		</ProtectedRoute>
	);
}
