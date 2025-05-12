// --- POIs Modal Implementation ---
"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/config";
import Modal from "@/components/Modal";
import { formatDateTime } from "@/utils/formatters";
import { useAuth } from "@/context/AuthContext";

const LoadingSpinner = () => (
	<div className="flex justify-center items-center h-64">
		<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
	</div>
);

// --- POI List Item Component ---
const PoiListItem = ({ poi, userSettings }) => {
	// Update join date formatting
	// const poiDate = poi.timestamp
	// 	? new Date(poi.timestamp).toLocaleDateString("en-US", {
	// 			year: "numeric",
	// 			month: "short",
	// 			day: "numeric",
	// 	  })
	// 	: "Date unknown";
	const poiDate = formatDateTime(poi.timestamp, userSettings);

	return (
		<div className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
			<div className="flex items-start space-x-3">
				<FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0" />
				<div className="flex-grow">
					<h4 className="font-semibold text-gray-800">{poi.name}</h4>
					{poi.description && (
						<p className="text-sm text-gray-600 mt-1">{poi.description}</p>
					)}
					<div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
						{poi.timestamp && (
							<span className="flex items-center">
								<FaCalendarAlt className="mr-1" /> {poiDate}
							</span>
						)}
						{poi.tripId && poi.tripTitle && (
							<Link
								href={`/trips/${poi.tripId}`}
								className="flex items-center hover:text-blue-600 hover:underline"
								title={`View Trip: ${poi.tripTitle}`}
							>
								<FaRoute className="mr-1" /> {poi.tripTitle}
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

const PoisModal = ({ isOpen, onClose, userId }) => {
	const { user } = useAuth();
	const [pois, setPois] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const limit = 15; // Number of POIs per page

	const userSettings = user?.settings || {
		dateFormat: "YYYY-MM-DD",
		timeFormat: "24h",
	};

	const fetchPois = async (pageNum = 1) => {
		if (!userId) return;
		setLoading(true);
		setError("");
		try {
			// Fetch from GET /api/users/:userId/pois
			const res = await fetch(
				`${API_URL}/users/${userId}/pois?page=${pageNum}&limit=${limit}`
			);
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || `Failed to fetch POIs (${res.status})`);
			}

			// Append new data if pageNum > 1, otherwise replace
			setPois((prev) => (pageNum === 1 ? data.data : [...prev, ...data.data]));
			setPage(data.page);
			setTotalPages(data.totalPages);
			setTotalCount(data.totalCount);
		} catch (err) {
			console.error("Error fetching POIs:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			// Reset and fetch first page when modal opens
			setPois([]);
			setPage(1);
			setTotalPages(1);
			setTotalCount(0);
			fetchPois(1);
		}
	}, [isOpen, userId]); // Rerun effect if modal opens or userId changes

	const handleLoadMore = () => {
		if (page < totalPages && !loading) {
			fetchPois(page + 1);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Points of Interest (${totalCount})`} // Show total count
			size="md" // Medium size should be sufficient
		>
			{error && <p className="text-red-500 p-4 text-center">{error}</p>}

			{/* List Area */}
			<div className="flex flex-col max-h-[70vh] overflow-y-auto">
				{pois.length > 0 &&
					pois.map((poi) => (
						<PoiListItem
							key={poi._id}
							poi={poi}
							userSettings={userSettings}
						/>
					))}

				{/* Loading indicator */}
				{loading && <LoadingSpinner />}

				{/* No results message */}
				{!loading && pois.length === 0 && !error && (
					<p className="text-gray-500 text-center py-6">
						No points of interest found for this user.
					</p>
				)}

				{/* Load More Button */}
				{!loading && page < totalPages && (
					<div className="text-center p-4 border-t border-gray-100">
						<button
							onClick={handleLoadMore}
							className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
						>
							Load More
						</button>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default PoisModal;
