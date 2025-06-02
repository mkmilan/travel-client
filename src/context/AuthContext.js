"use client";
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/config";

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [csrfToken, setCsrfToken] = useState(null);
	const [loading, setLoading] = useState(true); // Combined loading state for initial auth and CSRF
	const router = useRouter();

	const initializeAuth = useCallback(async () => {
		console.log("AuthContext: Initializing authentication and CSRF token...");
		setLoading(true);
		try {
			// 1. Fetch CSRF token
			try {
				const csrfRes = await fetch(`${API_URL}/csrf-token`, {
					credentials: "include",
				});
				if (!csrfRes.ok) {
					const errorData = await csrfRes.json().catch(() => ({}));
					console.error("AuthContext: Failed to fetch CSRF token", errorData.message || csrfRes.status);
					setCsrfToken(null);
				} else {
					const csrfData = await csrfRes.json();
					setCsrfToken(csrfData.csrfToken);
					console.log("AuthContext: CSRF token fetched successfully.");
				}
			} catch (csrfErr) {
				console.error("AuthContext: Error during CSRF token fetch:", csrfErr);
				setCsrfToken(null);
			}

			// 2. Check user status
			// Attempt to load user from localStorage for faster UI render
			const storedUserData = localStorage.getItem("userData");
			if (storedUserData) {
				try {
					const parsedUser = JSON.parse(storedUserData);
					setUser(parsedUser);
					console.log("AuthContext: User state pre-loaded from localStorage.");
				} catch (error) {
					console.error("AuthContext: Failed to parse user data from localStorage", error);
					localStorage.removeItem("userData"); // Clear corrupted data
				}
			}

			// Verify with backend
			const authRes = await fetch(`${API_URL}/auth/me`, {
				method: "GET",
				credentials: "include",
			});

			if (authRes.ok) {
				const userData = await authRes.json();
				console.log("AuthContext: User verified with backend:", userData);
				setUser(userData);
				localStorage.setItem("userData", JSON.stringify(userData));
			} else {
				console.log("AuthContext: No active session found with backend or error.", authRes.status);
				setUser(null); // Ensure user is null if /me fails
				localStorage.removeItem("userData");
			}
		} catch (error) {
			console.error("AuthContext: Error during auth initialization (CSRF or /me call):", error);
			setUser(null);
			// setCsrfToken(null); // CSRF might have been set, or failed; keep as is unless specific error
			localStorage.removeItem("userData");
		} finally {
			setLoading(false);
			console.log("AuthContext: Auth initialization complete.");
		}
	}, []); // No dependencies, runs once on mount

	useEffect(() => {
		initializeAuth();
	}, [initializeAuth]);

	// Function to handle login
	const login = (userData) => {
		console.log("AuthContext: Logging in user", userData);
		setUser(userData);
		localStorage.setItem("userData", JSON.stringify(userData));
		router.push(`/feed`); // Or your desired redirect path
	};

	const logout = async () => {
		console.log("AuthContext: Logging out user...");
		const tokenForLogout = csrfToken; // Use current CSRF token

		try {
			const headers = { "Content-Type": "application/json" };
			if (tokenForLogout) {
				headers["X-CSRF-Token"] = tokenForLogout;
			} else {
				console.warn(
					"AuthContext: CSRF token not available for logout. Logout might fail if CSRF is strictly enforced by server for this route."
				);
			}

			await fetch(`${API_URL}/auth/logout`, {
				method: "POST",
				headers: headers,
				credentials: "include",
			});
		} catch (error) {
			console.error("AuthContext: Logout API call failed", error);
			// Still proceed to clear client-side state
		} finally {
			localStorage.removeItem("userData");
			setUser(null);
			// setCsrfToken(null); // Clear old CSRF token

			// Fetch a new CSRF token for the new (unauthenticated) session
			console.log("AuthContext: Fetching new CSRF token post-logout...");
			try {
				const csrfRes = await fetch(`${API_URL}/csrf-token`, {
					credentials: "include",
				});
				if (!csrfRes.ok) {
					setCsrfToken(null);
				} else {
					const csrfData = await csrfRes.json();
					setCsrfToken(csrfData.csrfToken);
					console.log("AuthContext: New CSRF token fetched post-logout.");
				}
			} catch (fetchErr) {
				console.error("AuthContext: Failed to fetch new CSRF token post-logout.", fetchErr);
				setCsrfToken(null);
			}
			console.log("AuthContext: User logged out, client state cleared.");
			router.push(`/`); // Redirect to home/login
		}
	};

	// Value provided by the context
	const authContextValue = {
		user,
		csrfToken,
		loading, // Combined loading state
		isAuthenticated: !!user,
		login,
		logout,
		setUser, // If needed for direct manipulation elsewhere
		// fetchCsrfToken: initializeAuth, // If manual re-init is ever needed
	};

	return <AuthContext.Provider value={authContextValue}>{!loading && children}</AuthContext.Provider>;
};

// Custom hook to easily use the auth context
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined || context === null) {
		// Added null check for safety
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
