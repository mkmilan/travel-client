"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * A client component that wraps page content, redirecting unauthenticated users.
 * @param {object} props
 * @param {React.ReactNode} props.children The page component to render if authenticated.
 */
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// Wait until the initial loading is finished
		if (!loading) {
			// If not authenticated, redirect to the login page
			if (!isAuthenticated) {
				console.log("ProtectedRoute: Not authenticated, redirecting to /login");
				router.push("/login");
			} else {
				console.log("ProtectedRoute: Authenticated, allowing access.");
			}
		}
	}, [isAuthenticated, loading, router]); // Depend on auth state, loading status, and router

	// While loading or if authenticated, render the children (the protected page content)
	// If not authenticated, we initiate redirect in useEffect, but still might render children briefly,
	// so rendering null or a loader while redirecting is better.
	if (loading || !isAuthenticated) {
		// You can optionally return a loading spinner here instead of null
		// e.g., return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
		return null; // Or a loading indicator
	}

	// If authenticated and not loading, render the actual page content
	return children;
};

export default ProtectedRoute;
