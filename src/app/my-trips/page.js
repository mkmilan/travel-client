"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import TripCard from "@/components/trips/TripCard";
import { API_URL } from "@/utils/config";
// Loading/Error components can be reused or defined locally
const LoadingComponent = () => <p>Loading your trips...</p>;
const ErrorComponent = ({ message }) => (
	<p className="text-red-500">Error: {message}</p>
);

export default function MyTripsPage() {
	const { user, isAuthenticated, csrfToken } = useAuth();
	const [trips, setTrips] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	console.log("user", user);
	console.log("isAuthenticated", isAuthenticated);

	useEffect(() => {
		if (!isAuthenticated) {
			setError("Not authorized. Please log in."); // More user-friendly message
			setLoading(false);
			// router.push('/login'); // Or redirect, though ProtectedRoute should do this
			return;
		}

		const fetchMyTrips = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(`${API_URL}/trips/me`, {
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
						"X-CSRF-Token": csrfToken,
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
	}, [isAuthenticated]);

	if (loading) return <LoadingComponent />;
	if (error) return <ErrorComponent message={error} />;

	return (
		<ProtectedRoute>
			<div className="max-w-4xl mx-auto">
				{" "}
				{/* Constrain width */}
				<h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
					My Trips
				</h1>
				{trips.length === 0 ? (
					<p className="text-gray-600 bg-white p-6 shadow border border-gray-200">
						You haven't saved any trips yet.{" "}
						<Link
							href="/trips/new"
							className="text-blue-600 hover:underline"
						>
							Track one now!
						</Link>
					</p>
				) : (
					<div className="space-y-6 ">
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
