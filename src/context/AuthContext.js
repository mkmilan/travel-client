"use client";
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/config";
import { requestLogout } from "@/utils/logout.mjs";
import { publicUserProfile } from "@/utils/publicUserProfile.mjs";

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [csrfToken, setCsrfToken] = useState(null);
	const [logoutError, setLogoutError] = useState("");
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

			// Remove legacy cached responses, which could include a bearer token.
			// The HttpOnly cookie and /auth/me are the only browser session authority.
			localStorage.removeItem("userData");

			// Verify with backend
			const authRes = await fetch(`${API_URL}/auth/me`, {
				method: "GET",
				credentials: "include",
			});

			if (authRes.ok) {
				const userData = await authRes.json();

				setUser(publicUserProfile(userData));

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
		localStorage.removeItem("userData");
		setUser(publicUserProfile(userData));

		router.push(`/feed`); // Or your desired redirect path
	};

	const logout = async () => {
		setLogoutError("");
		try {
			await requestLogout({ apiUrl: API_URL, csrfToken });
		} catch (error) {
			// Do not claim logout succeeded while an HttpOnly session may remain valid.
			setLogoutError(error.message);
			return false;
		}
		localStorage.removeItem("userData");
		setUser(null);
		setCsrfToken(null);
		try {
			const response = await fetch(`${API_URL}/csrf-token`, { credentials: "include" });
			if (response.ok) setCsrfToken((await response.json()).csrfToken);
		} catch {
			// Logout succeeded; a later login can refresh the CSRF token.
		}
		router.push(`/`);
		return true;
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

	return (
		<AuthContext.Provider value={authContextValue}>
			{logoutError && <p role="alert" className="bg-red-100 p-3 text-red-900">{logoutError}</p>}
			{!loading && <React.Fragment key={user?._id || user?.id || "anonymous"}>{children}</React.Fragment>}
		</AuthContext.Provider>
	);
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
