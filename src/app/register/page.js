"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SITE_URL, API_URL } from "@/utils/config";

export default function RegisterPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault(); // Prevent default form submission
		setError(""); // Clear previous errors
		setLoading(true);

		// Basic client-side validation
		if (!username || !email || !password) {
			setError("Please fill in all fields.");
			setLoading(false);
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters long.");
			setLoading(false);
			return;
		}

		try {
			// --- Make API Call ---
			const res = await fetch(`${API_URL}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				// If response status is not 2xx, throw an error with the message from backend
				throw new Error(data.message || `HTTP error! status: ${res.status}`);
			}

			// --- Handle Success ---
			console.log("Registration successful:", data);
			// Optional: Show a success message before redirecting
			router.push(`${SITE_URL}/login`); // Redirect to login page on success
		} catch (err) {
			// --- Handle Errors ---
			console.error("Registration failed:", err);
			// err.message should contain the error message from backend or fetch failure
			setError(err.message || "An unexpected error occurred.");
		} finally {
			// Ensure loading is set to false whether success or error
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
				<h2 className="text-2xl font-bold text-center text-gray-900">
					Create your Account
				</h2>
				<form
					className="space-y-6"
					onSubmit={handleSubmit}
				>
					<div>
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700"
						>
							Username
						</label>
						<input
							id="username"
							name="username"
							type="text"
							required
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
						/>
					</div>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
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
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="new-password" // Important for password managers
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
						/>
					</div>

					{error && <p className="text-sm text-red-600">{error}</p>}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{loading ? "Registering..." : "Register"}
						</button>
					</div>
				</form>
				<p className="text-sm text-center text-gray-600">
					Already have an account?{" "}
					<Link
						href={`${SITE_URL}/login`}
						className="font-medium text-indigo-600 hover:text-indigo-500"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
