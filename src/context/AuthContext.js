"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Function to handle login
	const login = (userData, jwtToken) => {
		console.log("AuthContext: Logging in user", userData);
		localStorage.setItem("authToken", jwtToken);
		localStorage.setItem("userData", JSON.stringify(userData));
		setToken(jwtToken);
		setUser(userData);
		router.push(`/feed`);
	};

	// Function to handle logout
	const logout = () => {
		console.log("AuthContext: Logging out user");
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

		if (storedToken && storedUserData) {
			console.log("AuthContext: Found token in localStorage.");
			// Basic check: Assume token is valid if present.
			// A more robust check would be to call '/api/auth/me' here
			// to verify the token with the backend and get fresh user data.
			// Let's keep it simple for now and trust the stored data.
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
				logout(); // Clear invalid stored data
			}
		} else {
			console.log("AuthContext: No token found.");
		}
		setLoading(false); // Finished checking auth status
	}, []); // Empty dependency array means this runs once on mount

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
