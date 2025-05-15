"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/config";

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	// const [profilePicture, setProfilePicture] = useState("/default-avatar.png");
	// const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Function to handle login
	const login = (userData, jwtToken) => {
		console.log("AuthContext: Logging in user", userData);
		// localStorage.setItem("authToken", jwtToken);
		// setToken(jwtToken);

		setUser(userData);
		localStorage.setItem("userData", JSON.stringify(userData));
		router.push(`/feed`);
	};

	// Function to handle logout
	// const logout = () => {
	// 	localStorage.removeItem("authToken");
	// 	localStorage.removeItem("userData");
	// 	setToken(null);
	// 	setUser(null);
	// 	router.push(`/`);
	// };
	const logout = async () => {
		console.log("AuthContext: Logging out user...");
		try {
			await fetch(`${API_URL}/auth/logout`, {
				method: "POST",
				headers: {
					// Important for backend to process if it expects JSON, though not strictly needed for this simple logout
					"Content-Type": "application/json",
				},
				credentials: "include", // Crucial: send cookies with the request
			});
		} catch (error) {
			console.error("AuthContext: Logout API call failed", error);
			// Still proceed with client-side cleanup
		} finally {
			localStorage.removeItem("userData");
			setUser(null);
			console.log("AuthContext: User logged out, client state cleared.");
			router.push(`/`);
		}
	};

	// // Effect to check authentication status on initial load or refresh
	// useEffect(() => {
	// 	console.log("AuthContext: Checking auth status on load...");
	// 	const storedToken = localStorage.getItem("authToken");
	// 	const storedUserData = localStorage.getItem("userData");

	// 	console.log("AuthContext: Stored user data:", storedUserData);

	// 	if (storedToken && storedUserData) {
	// 		console.log("AuthContext: Found token in localStorage.");

	// 		try {
	// 			const parsedUser = JSON.parse(storedUserData);
	// 			setToken(storedToken);
	// 			setUser(parsedUser);
	// 			console.log("AuthContext: User state restored from localStorage.");
	// 		} catch (error) {
	// 			console.error(
	// 				"AuthContext: Failed to parse user data from localStorage",
	// 				error
	// 			);
	// 			// Clear potentially corrupted data

	// 			logout(); // Clear invalid stored data
	// 		}
	// 	} else {
	// 		console.log("AuthContext: No token found.");
	// 	}
	// 	setLoading(false); // Finished checking auth status
	// }, []); // Empty dependency array means this runs once on mount

	// useEffect(() => {
	// 	if (user) {
	// 		console.log("AuthContext: Persisting user data to localStorage:", user);
	// 		localStorage.setItem("userData", JSON.stringify(user));
	// 	} else {
	// 		// If user becomes null (e.g., during logout), remove it from storage
	// 		console.log("AuthContext: Removing user data from localStorage.");
	// 		localStorage.removeItem("userData");
	// 	}
	// 	// Also persist token changes (though less likely to change outside login/logout)
	// 	if (token) {
	// 		localStorage.setItem("authToken", token);
	// 	} else {
	// 		localStorage.removeItem("authToken");
	// 	}
	// }, [user, token]); // Run this effect whenever user or token state changes

	// Effect to check authentication status on initial load or refresh
	useEffect(() => {
		const checkUserStatus = async () => {
			console.log("AuthContext: Checking auth status on load...");
			setLoading(true);
			// Attempt to load user from localStorage for faster UI render
			const storedUserData = localStorage.getItem("userData");
			if (storedUserData) {
				try {
					const parsedUser = JSON.parse(storedUserData);
					setUser(parsedUser);
					console.log("AuthContext: User state pre-loaded from localStorage.");
				} catch (error) {
					console.error(
						"AuthContext: Failed to parse user data from localStorage",
						error
					);
					localStorage.removeItem("userData"); // Clear corrupted data
				}
			}

			try {
				// Verify with backend
				const res = await fetch(`${API_URL}/auth/me`, {
					method: "GET",
					credentials: "include", // Crucial: send cookies
				});

				if (res.ok) {
					const data = await res.json();
					console.log("AuthContext: User verified with backend:", data);
					setUser(data);
					localStorage.setItem("userData", JSON.stringify(data)); // Update localStorage
				} else {
					console.log(
						"AuthContext: No active session found with backend or error.",
						res.status
					);
					// If /me fails (e.g. 401), clear user state if it was pre-loaded
					if (user) {
						// Check if user was pre-loaded
						setUser(null);
						localStorage.removeItem("userData");
					}
				}
			} catch (error) {
				console.error(
					"AuthContext: Error checking user status with backend",
					error
				);
				// If network error, and user was pre-loaded, keep it for now, or decide on UX
				// For simplicity, if /me fails for any reason, treat as logged out
				if (user) {
					setUser(null);
					localStorage.removeItem("userData");
				}
			} finally {
				setLoading(false);
				console.log("AuthContext: Auth status check complete.");
			}
		};

		checkUserStatus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Value provided by the context
	const authContextValue = {
		user,
		// token,
		loading, // Expose loading state
		login,
		logout,
		isAuthenticated: !!user,
		setUser,
	};

	return (
		<AuthContext.Provider value={authContextValue}>
			{/* Don't render children until initial auth check is done */}
			{!loading && children}
		</AuthContext.Provider>
	);
};

// Custom hook to easily use the auth context
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
