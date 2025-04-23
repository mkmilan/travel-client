// src/components/navigation/BottomNavWrapper.jsx
"use client"; // This needs to be a client component to use hooks

import React from "react";
import { useAuth } from "@/context/AuthContext";
import BottomNavBar from "./BottomNavBar"; // Import the actual nav bar

export default function BottomNavWrapper({ children }) {
	const { isAuthenticated, user, loading } = useAuth();

	// Don't render children or bottom nav until auth state is loaded
	if (loading) {
		// You might want a full-page loader here instead of just padding
		return <main className="pb-20 pt-16 md:pt-0"></main>; // Maintain padding
	}

	return (
		<>
			<main className="pb-20 pt-4 md:pt-8">
				{" "}
				{/* Adjust top padding as needed */}
				{children}
			</main>
			{/* Conditionally render BottomNavBar only if authenticated */}
			{isAuthenticated && <BottomNavBar currentUserId={user?._id} />}
		</>
	);
}
