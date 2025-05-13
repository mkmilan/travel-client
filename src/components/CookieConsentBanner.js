"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const BASE_COOKIE_CONSENT_KEY = "cookie_consent_given";

// Helper function to get the user-specific or guest key
const getConsentKey = (userId) => {
	return userId
		? `${BASE_COOKIE_CONSENT_KEY}_${userId}`
		: `${BASE_COOKIE_CONSENT_KEY}_guest`;
};

export default function CookieConsentBanner() {
	const [isVisible, setIsVisible] = useState(false);
	const { user, loading: authLoading } = useAuth();

	useEffect(() => {
		// Wait for authentication status to be resolved
		if (authLoading) {
			return;
		}

		const currentConsentKey = getConsentKey(user?._id);
		const consentStatus = localStorage.getItem(currentConsentKey);

		// Show banner if consent is not explicitly "accepted" or "declined"
		if (consentStatus !== "accepted" && consentStatus !== "declined") {
			setIsVisible(true);
		} else {
			setIsVisible(false); // Ensure banner is hidden if consent was previously given/declined
		}
	}, [user, authLoading]);

	const handleConsent = (status) => {
		if (authLoading) return; // Prevent action if auth state is not yet clear

		const currentConsentKey = getConsentKey(user?._id);
		localStorage.setItem(currentConsentKey, status);
		setIsVisible(false);

		if (status === "accepted") {
			// Here you might also want to initialize any scripts that depend on consent
			// For example, Google Analytics, etc.
			console.log(`Cookie consent ${status} for key: ${currentConsentKey}`);
		} else {
			console.log(
				`Cookie consent ${status} (banner hidden) for key: ${currentConsentKey}`
			);
			// If declined, you might need to actively remove/disable non-essential cookies
			// or prevent them from loading.
		}
	};

	if (!isVisible || authLoading) {
		// Don't show the banner if it's not supposed to be visible or if auth is still loading
		return null;
	}

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg z-50">
			<div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
				<p className="text-sm mb-3 md:mb-0 md:mr-4">
					We use cookies to enhance your experience and analyze site traffic. By
					clicking &quot;Accept&quot;, you consent to our use of cookies. Read
					our{" "}
					<Link
						href="/privacy-policy"
						className="text-blue-400 hover:text-blue-300 underline"
					>
						Privacy Policy
					</Link>{" "}
					for more details.
				</p>
				<div className="flex space-x-3">
					<button
						onClick={() => handleConsent("accepted")}
						className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-medium"
					>
						Accept
					</button>
					<button
						onClick={() => handleConsent("declined")}
						className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm font-medium"
					>
						Decline
					</button>
				</div>
			</div>
		</div>
	);
}
