// filepath: /home/mkmilan/Documents/my/travel-2/client/src/app/reset-password/[token]/page.js
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/utils/apiClient";

export default function ResetPasswordPage() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { csrfToken, loading: authLoading } = useAuth();
	const params = useParams();
	const router = useRouter();
	const token = params?.token;

	useEffect(() => {
		if (!token) {
			setError("No reset token found. Please use the link from your email.");
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");

		if (!token) {
			setError("Invalid or missing reset token.");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters long.");
			return;
		}
		if (!csrfToken && !authLoading) {
			setError(
				"Security token is not available. Please wait a moment or refresh the page."
			);
			return;
		}

		setLoading(true);
		try {
			const data = await apiClient(
				`/auth/resetpassword/${token}`,
				{
					method: "PUT",
					body: { password },
				},
				csrfToken
			);
			setMessage(
				data.message ||
					"Password has been reset successfully. You can now log in."
			);
			setPassword("");
			setConfirmPassword("");
			// Optionally redirect to login after a delay
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} catch (err) {
			setError(
				err.message || "An unexpected error occurred. Please try again."
			);
			console.error("Reset password failed:", err);
		} finally {
			setLoading(false);
		}
	};

	if (!token && !error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-100">
				<div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md text-center">
					<p className="text-red-600">Loading token or token is missing...</p>
					<Link
						href="/login"
						className="font-medium text-indigo-600 hover:text-indigo-500"
					>
						Go to Login
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
				<h2 className="text-2xl font-bold text-center text-gray-900">
					Reset Your Password
				</h2>
				{!message && (
					<form
						className="space-y-6"
						onSubmit={handleSubmit}
					>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								New Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
							/>
						</div>
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700"
							>
								Confirm New Password
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-600"
							/>
						</div>

						{error && (
							<div className="p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-600">
								{error}
							</div>
						)}

						<div>
							<button
								type="submit"
								disabled={loading || authLoading || !csrfToken || !token}
								className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
							>
								{loading ? "Resetting..." : "Reset Password"}
							</button>
						</div>
					</form>
				)}
				{message && (
					<div className="p-3 text-sm bg-green-50 border border-green-200 rounded-md text-green-600 text-center">
						<p>{message}</p>
						<Link
							href="/login"
							className="mt-4 inline-block font-medium text-indigo-600 hover:text-indigo-500"
						>
							Proceed to Login
						</Link>
					</div>
				)}
				{!message && (
					<p className="text-sm text-center text-gray-600">
						Remember your password?{" "}
						<Link
							href="/login"
							className="font-medium text-indigo-600 hover:text-indigo-500"
						>
							Sign in
						</Link>
					</p>
				)}
			</div>
		</div>
	);
}
