"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/utils/apiClient";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { csrfToken, loading: authLoading } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");
		setLoading(true);

		if (!csrfToken && !authLoading) {
			setError(
				"Security token is not available. Please wait a moment or refresh the page."
			);
			setLoading(false);
			return;
		}
		if (!email) {
			setError("Please provide your email address.");
			setLoading(false);
			return;
		}

		try {
			const data = await apiClient(
				"/auth/forgotpassword",
				{
					method: "POST",
					body: { email },
				},
				csrfToken
			);
			console.log("Forgot password response email:", email);

			setMessage(
				data.message ||
					"If an account with that email exists, a password reset link has been sent."
			);
			setEmail(""); // Clear email field on success
		} catch (err) {
			setError(
				err.message || "An unexpected error occurred. Please try again."
			);
			console.error("Forgot password failed:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
				<h2 className="text-2xl font-bold text-center text-gray-900">
					Forgot Your Password?
				</h2>
				<p className="text-sm text-center text-gray-600">
					Enter your email address and we'll send you a link to reset your
					password.
				</p>
				<form
					className="space-y-6"
					onSubmit={handleSubmit}
				>
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

					{message && (
						<div className="p-3 text-sm bg-green-50 border border-green-200 rounded-md text-green-600">
							{message}
						</div>
					)}
					{error && (
						<div className="p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-600">
							{error}
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading || authLoading || !csrfToken}
							className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{loading ? "Sending..." : "Send Reset Link"}
						</button>
					</div>
				</form>
				<p className="text-sm text-center text-gray-600">
					Remember your password?{" "}
					<Link
						href="/login"
						className="font-medium text-indigo-600 hover:text-indigo-500"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
