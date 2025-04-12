// src/components/tracking/TrackingStatusDisplay.jsx
import React from "react";
import { formatTime } from "@/utils/formatters"; // Use the utility

export default function TrackingStatusDisplay({
	isTracking,
	elapsedTime,
	pointsCount,
}) {
	return (
		<div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
			<div className="p-4 bg-gray-100 rounded">
				<p className="text-sm font-medium text-gray-500">Status</p>
				<p
					className={`text-lg font-semibold ${
						isTracking ? "text-green-600" : "text-red-600"
					}`}
				>
					{isTracking ? "Tracking Active" : "Not Tracking"}
				</p>
			</div>
			<div className="p-4 bg-gray-100 rounded">
				<p className="text-sm font-medium text-gray-500">Duration</p>
				<p className="text-lg font-semibold text-gray-900">
					{formatTime(elapsedTime)}
				</p>
			</div>
			<div className="p-4 bg-gray-100 rounded">
				<p className="text-sm font-medium text-gray-500">Points Collected</p>
				<p className="text-lg font-semibold text-gray-900">{pointsCount}</p>
			</div>
		</div>
	);
}
