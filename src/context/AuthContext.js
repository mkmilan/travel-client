"use client";
import React, {
	createContext,
	useState,
	useContext,
	useEffect,
	useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/config";

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [csrfToken, setCsrfToken] = useState(null);
	const [csrfLoading, setCsrfLoading] = useState(true);
	const router = useRouter();

	// Function to fetch CSRF token
	const fetchCsrfToken = useCallback(async () => {
		console.log("AuthContext: Fetching CSRF token...");
		setCsrfLoading(true);
		try {
			const res = await fetch(`${API_URL}/csrf-token`, {
				credentials: "include",
			});
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(
					errorData.message || `Failed to fetch CSRF token (${res.status})`
				);
			}
			const data = await res.json();
			setCsrfToken(data.csrfToken);
			console.log("AuthContext: CSRF token fetched successfully.");
		} catch (err) {
			console.error("AuthContext: CSRF token fetch error:", err);
			setCsrfToken(null); // Set to null on error
			// Potentially show a global error or retry
		} finally {
			setCsrfLoading(false);
		}
	}, []);

	// Effect to fetch CSRF token on initial load
	useEffect(() => {
		fetchCsrfToken();
	}, [fetchCsrfToken]);

	// Function to handle login
	const login = (userData) => {
		console.log("AuthContext: Logging in user", userData);

		setUser(userData);
		localStorage.setItem("userData", JSON.stringify(userData));
		router.push(`/feed`);
	};

	// const logout = async () => {
	// 	console.log("AuthContext: Logging out user...");
	// 	try {
	// 		await fetch(`${API_URL}/auth/logout`, {
	// 			method: "POST",
	// 			headers: {
	// 				// Important for backend to process if it expects JSON, though not strictly needed for this simple logout
	// 				"Content-Type": "application/json",
	// 			},
	// 			credentials: "include", // Crucial: send cookies with the request
	// 		});
	// 	} catch (error) {
	// 		console.error("AuthContext: Logout API call failed", error);
	// 		// Still proceed with client-side cleanup
	// 	} finally {
	// 		localStorage.removeItem("userData");
	// 		setUser(null);
	// 		console.log("AuthContext: User logged out, client state cleared.");
	// 		router.push(`/`);
	// 	}
	// };
	const logout = async () => {
		console.log("AuthContext: Logging out user...");
		if (!csrfToken && !csrfLoading) {
			// If CSRF token is definitely not available and not loading, try fetching it again
			// Or handle this case more gracefully, e.g. by warning the user or delaying logout
			console.warn(
				"AuthContext: CSRF token not available for logout. Attempting to fetch."
			);
			await fetchCsrfToken(); // Attempt to fetch it if missing
			// Re-check after attempting fetch, though this might introduce slight delay
			if (!csrfToken) {
				console.error(
					"AuthContext: CSRF token still not available after re-fetch. Proceeding logout without it, which might fail."
				);
				// Decide if you want to proceed or block logout if CSRF is critical
			}
		}

		try {
			const headers = {
				"Content-Type": "application/json",
			};
			if (csrfToken) {
				headers["X-CSRF-Token"] = csrfToken;
			}

			await fetch(`${API_URL}/auth/logout`, {
				method: "POST",
				headers: headers,
				credentials: "include",
			});
		} catch (error) {
			console.error("AuthContext: Logout API call failed", error);
		} finally {
			localStorage.removeItem("userData");
			setUser(null);
			setCsrfToken(null); // Clear CSRF token on logout
			fetchCsrfToken(); // Fetch a new CSRF token for the new (unauthenticated) session
			console.log("AuthContext: User logged out, client state cleared.");
			router.push(`/`);
		}
	};

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
					credentials: "include",
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
		loading, // Expose loading state
		login,
		logout,
		isAuthenticated: !!user,
		setUser,
		csrfToken,
		fetchCsrfToken, // Expose function to manually refresh token if needed
	};

	return (
		<AuthContext.Provider value={authContextValue}>
			{/* Don't render children until initial auth check is done */}
			{!(loading || csrfLoading) && children}
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
