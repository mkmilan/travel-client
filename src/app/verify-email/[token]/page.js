"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Assuming you have login function here
import { apiClient } from "@/utils/apiClient"; // Your API client

export default function VerifyEmailPage() {
	const [message, setMessage] = useState("Verifying your email...");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const params = useParams();
	const router = useRouter();
	const { login } = useAuth(); // Get the login function from context

	const token = params?.token;

	useEffect(() => {
		if (!token) {
			setError("Verification token is missing from the URL.");
			setMessage("");
			setLoading(false);
			return;
		}

		const verifyUserEmail = async () => {
			setLoading(true);
			setError("");
			try {
				// No CSRF token needed for a GET request that's verifying a token
				const data = await apiClient(`/auth/verifyemail/${token}`, {
					method: "GET",
				});

				// The backend's verifyEmail controller now sends back user data and sets the cookie
				// So we can use the login function from AuthContext to update the frontend state
				if (data && data._id) {
					// The backend already set the httpOnly cookie.
					// We need to update the AuthContext state.
					// Assuming your login function in AuthContext can take user data
					// and set the user state without making another login API call.
					// Or, if your login function always fetches /me, that's fine too.

					// await login(null, null, data); // Pass user data directly if login supports it
					login(data);
					setMessage(
						"Email verified successfully! You are now logged in. Redirecting..."
					);
					setTimeout(() => {
						router.push("/"); // Redirect to homepage or dashboard
					}, 3000);
				} else {
					// This case should ideally not happen if backend sends user data on success
					setError(
						data.message ||
							"Verification successful, but no user data returned. Please try logging in."
					);
					setMessage("");
				}
			} catch (err) {
				console.error("Email verification failed:", err);
				setError(
					err.message ||
						"Failed to verify email. The link may be invalid or expired."
				);
				setMessage("");
			} finally {
				setLoading(false);
			}
		};

		verifyUserEmail();
	}, [token, router, login]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded shadow-md">
				<h2 className="text-2xl font-bold text-gray-900">Email Verification</h2>
				{loading && (
					<div className="flex items-center justify-center">
						<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
						<p className="ml-3 text-gray-700">Verifying...</p>
					</div>
				)}
				{message && !error && <p className="text-green-600">{message}</p>}
				{error && <p className="text-red-600">{error}</p>}
				{!loading && (
					<div className="mt-6">
						<Link
							href={error ? "/register" : "/login"}
							className="font-medium text-indigo-600 hover:text-indigo-500"
						>
							{error ? "Try to register again" : "Proceed to Login"}
						</Link>
						{!error && <span className="mx-2 text-gray-400">or</span>}
						{!error && (
							<Link
								href="/"
								className="font-medium text-indigo-600 hover:text-indigo-500"
							>
								Go to Homepage
							</Link>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
