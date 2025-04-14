// src/app/page.jsx
import Link from "next/link";

export default function LandingPage() {
	return (
		// Remove specific background color here, let the body's bg-gray-100 show
		// Keep vertical padding, adjust horizontal if needed
		<div className="text-center py-16 px-4">
			<h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-600">
				{" "}
				{/* Darker text for light bg */}
				Welcome to Motorhome Mapper!
			</h1>
			<p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
				{" "}
				{/* Slightly darker gray */}
				Your ultimate companion for tracking, mapping, and sharing your
				motorhome and campervan adventures. Never lose a route again!
			</p>

			{/* Feature List - keep cards white */}
			<div className="grid md:grid-cols-3 gap-8 my-12 max-w-4xl mx-auto">
				{/* Card 1 */}
				<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
					{/* Keep indigo accent for card titles */}
					<h3 className="text-xl font-semibold mb-2 text-indigo-700">
						Track Your Routes
					</h3>
					{/* Keep this gray text color as requested */}
					<p className="text-gray-600">
						Easily record your journey using your phone's GPS.
					</p>
				</div>
				{/* Card 2 */}
				<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
					<h3 className="text-xl font-semibold mb-2 text-indigo-700">
						Visualize Your Trips
					</h3>
					<p className="text-gray-600">
						See your completed routes displayed beautifully on a map.
					</p>
				</div>
				{/* Card 3 */}
				<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
					<h3 className="text-xl font-semibold mb-2 text-indigo-700">
						Share Your Adventures
					</h3>
					<p className="text-gray-600">
						Add photos, descriptions, and share with fellow travelers.
					</p>
				</div>
			</div>

			{/* Call to Action Buttons - keep existing colors */}
			<div className="space-x-4">
				<Link
					href="/register"
					className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
				>
					Get Started
				</Link>
				<Link
					href="/login"
					className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
				>
					Login
				</Link>
			</div>
		</div>
	);
}
