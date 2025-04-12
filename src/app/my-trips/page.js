"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import TripCard from "@/components/trips/TripCard";

// Loading/Error components can be reused or defined locally
const LoadingComponent = () => <p>Loading your trips...</p>;
const ErrorComponent = ({ message }) => (
	<p className="text-red-500">Error: {message}</p>
);

export default function MyTripsPage() {
	const { token } = useAuth();
	const [trips, setTrips] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!token) {
			// Should be handled by ProtectedRoute, but good safety check
			setError("Not authorized.");
			setLoading(false);
			return;
		}

		const fetchMyTrips = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/me`, {
					// Relative URL
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(
						data.message || `Failed to fetch trips (${res.status})`
					);
				}
				setTrips(data);
			} catch (err) {
				console.error("Error fetching my trips:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchMyTrips();
	}, [token]); // Re-fetch if token changes (e.g., after login)

	if (loading) return <LoadingComponent />;
	if (error) return <ErrorComponent message={error} />;

	return (
		<ProtectedRoute>
			<div className="max-w-4xl mx-auto">
				{" "}
				{/* Constrain width */}
				<h1 className="text-3xl font-bold text-gray-900 mb-6">My Trips</h1>
				{trips.length === 0 ? (
					<p className="text-gray-600 bg-white p-6 rounded-lg shadow border border-gray-200">
						You haven't saved any trips yet.{" "}
						<Link
							href="/trips/new"
							className="text-blue-600 hover:underline"
						>
							Track one now!
						</Link>
					</p>
				) : (
					<div className="space-y-6">
						{" "}
						{/* Increased spacing between cards */}
						{trips.map((trip) => (
							<TripCard
								key={trip._id}
								trip={trip}
							/> // Use the TripCard component
						))}
					</div>
				)}
			</div>
		</ProtectedRoute>
	);
}
