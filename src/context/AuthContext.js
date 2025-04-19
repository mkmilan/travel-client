"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	// const [profilePicture, setProfilePicture] = useState("/default-avatar.png");
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Function to handle login
	const login = (userData, jwtToken) => {
		console.log("AuthContext: Logging in user", userData);
		localStorage.setItem("authToken", jwtToken);
		// localStorage.setItem("userData", JSON.stringify(userData));
		setToken(jwtToken);
		setUser(userData);
		router.push(`/feed`);
	};

	// Function to handle logout
	const logout = () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("userData");
		setToken(null);
		setUser(null);
		router.push(`/`);
	};

	// Effect to check authentication status on initial load or refresh
	useEffect(() => {
		console.log("AuthContext: Checking auth status on load...");
		const storedToken = localStorage.getItem("authToken");
		const storedUserData = localStorage.getItem("userData");

		console.log("AuthContext: Stored user data:", storedUserData);

		if (storedToken && storedUserData) {
			console.log("AuthContext: Found token in localStorage.");

			try {
				const parsedUser = JSON.parse(storedUserData);
				setToken(storedToken);
				setUser(parsedUser);
				console.log("AuthContext: User state restored from localStorage.");
			} catch (error) {
				console.error(
					"AuthContext: Failed to parse user data from localStorage",
					error
				);
				// Clear potentially corrupted data

				logout(); // Clear invalid stored data
			}
		} else {
			console.log("AuthContext: No token found.");
		}
		setLoading(false); // Finished checking auth status
	}, []); // Empty dependency array means this runs once on mount

	useEffect(() => {
		if (user) {
			console.log("AuthContext: Persisting user data to localStorage:", user);
			localStorage.setItem("userData", JSON.stringify(user));
		} else {
			// If user becomes null (e.g., during logout), remove it from storage
			console.log("AuthContext: Removing user data from localStorage.");
			localStorage.removeItem("userData");
		}
		// Also persist token changes (though less likely to change outside login/logout)
		if (token) {
			localStorage.setItem("authToken", token);
		} else {
			localStorage.removeItem("authToken");
		}
	}, [user, token]); // Run this effect whenever user or token state changes

	// Value provided by the context
	const authContextValue = {
		user,
		token,
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
