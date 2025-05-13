"use client";

import Link from "next/link";
import {
	FaGithub,
	FaTwitter,
	FaFacebook,
	FaInstagram,
	FaLightbulb,
	FaShieldAlt,
	FaFileContract,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function AboutPage() {
	return (
		<div className="max-w-3xl mx-auto p-4 md:p-8">
			<div className="bg-white p-6 md:p-10 shadow-md border border-gray-200 ">
				<h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
					About Motorhome Mapper
				</h1>

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-700 mb-3">
						Our Mission
					</h2>
					<p className="text-gray-600 leading-relaxed">
						Motorhome Mapper is dedicated to helping motorhome and campervan
						enthusiasts track, map, and share their adventures with ease. We aim
						to provide a simple, focused platform for documenting your journeys
						and connecting with a community of like-minded travelers.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-700 mb-3">
						Key Features
					</h2>
					<ul className="list-disc list-inside text-gray-600 space-y-1">
						<li>GPS trip tracking and GPX export.</li>
						<li>Interactive maps to visualize your routes.</li>
						<li>Photo uploads to capture your memories.</li>
						<li>Points of Interest and recommendations.</li>
						<li>Social features: follow users, like, and comment on trips.</li>
						<li>User profiles and trip statistics.</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
						<FaLightbulb className="mr-2 text-yellow-500" />
						Feedback & Suggestions
					</h2>
					<p className="text-gray-600 mb-2">
						Your feedback is invaluable to us! Whether you have a feature
						suggestion or want to report a bug, please let us know.
					</p>
					<Link
						href="/suggestion" // Corrected to singular based on your file structure
						className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
					>
						Submit a Suggestion or Bug Report &rarr;
					</Link>
				</section>

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-700 mb-3">Legal</h2>
					<ul className="space-y-1">
						<li>
							<Link
								href="/privacy-policy" // Placeholder - create this page later
								className="text-blue-600 hover:text-blue-700 hover:underline flex items-center"
							>
								<FaShieldAlt className="mr-2" /> Privacy Policy
							</Link>
						</li>
						<li>
							<Link
								href="/terms-of-service" // Placeholder - create this page later
								className="text-blue-600 hover:text-blue-700 hover:underline flex items-center"
							>
								<FaFileContract className="mr-2" /> Terms of Service
							</Link>
						</li>
					</ul>
				</section>

				<section>
					<h2 className="text-xl font-semibold text-gray-700 mb-4">
						Connect With Us
					</h2>
					<div className="flex space-x-6">
						<a
							href="https://github.com" // Replace with your actual GitHub link
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-500 hover:text-gray-800 transition-colors"
							aria-label="GitHub"
						>
							<FaGithub size={28} />
						</a>
						<a
							href="https://twitter.com" // Replace with your actual Twitter link
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-500 hover:text-blue-500 transition-colors"
							aria-label="Twitter"
						>
							<FaXTwitter size={28} />
						</a>
						<a
							href="https://facebook.com" // Replace with your actual Facebook link
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-500 hover:text-blue-700 transition-colors"
							aria-label="Facebook"
						>
							<FaFacebook size={28} />
						</a>
						<a
							href="https://instagram.com" // Replace with your actual Instagram link
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-500 hover:text-pink-600 transition-colors"
							aria-label="Instagram"
						>
							<FaInstagram size={28} />
						</a>
					</div>
				</section>
			</div>
		</div>
	);
}
