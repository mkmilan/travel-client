"use client";
import React, { useState } from "react"; // Removed useEffect as it's not used here
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
// apiClient is imported but not used in the handleSubmit, per your existing code.
// If you intend to use apiClient, the handleSubmit logic would change.
// import { apiClient } from "@/utils/apiClient";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [submitLoading, setSubmitLoading] = useState(false);
	const { login, csrfToken, loading: authContextLoading } = useAuth(); // authContextLoading is the combined loading state from AuthContext

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitLoading(true);

		// Check if AuthContext is still loading initial data (CSRF token, user status)
		if (authContextLoading) {
			setError("Authentication system is initializing. Please wait a moment and try again.");
			setSubmitLoading(false);
			return;
		}

		// Check if CSRF token is available after AuthContext has finished loading
		if (!csrfToken) {
			setError("Security token is not available. Please refresh the page and try again.");
			setSubmitLoading(false);
			return;
		}

		if (!email || !password) {
			setError("Please provide email and password.");
			setSubmitLoading(false);
			return;
		}

		try {
			console.log("Login attempt: Sending CSRF token to backend:", csrfToken);

			const res = await fetch(`${API_URL}/auth/login`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken,
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				// If response status is not 2xx, throw an error with the message from backend
				throw new Error(data.message || `HTTP error! status: ${res.status}`);
			}

			console.log("Login successful, user data:", data);
			login(data); // login function from AuthContext handles user state update and redirect
		} catch (err) {
			setError(err.message || "An unexpected error occurred. Please try again.");
			console.error("Login failed:", err);
		} finally {
			setSubmitLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
				<h2 className="text-2xl font-bold text-center text-gray-900">Sign in to your account</h2>
				<form className="space-y-6" onSubmit={handleSubmit}>
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">
							Email address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
						/>
					</div>

					{error && (
						<div className="p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-600">
							<div className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-5 h-5 mr-2"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
								{error}
							</div>
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={submitLoading || authContextLoading || (!csrfToken && !authContextLoading)} // Disable if submitting, or if auth context is loading, or if csrfToken is not available AND auth context is done loading
							className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{submitLoading ? "Signing in..." : "Sign in"}
						</button>
					</div>
				</form>
				<p className="text-sm text-center text-gray-600">
					Don&apos;t have an account?{" "}
					<Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
						Sign up
					</Link>
				</p>
				<p className="mt-2 text-sm text-center text-gray-600">
					<Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
						Forgot your password?
					</Link>
				</p>
			</div>
		</div>
	);
}
