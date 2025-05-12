"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import {
	getRecommendationCategoryLabel,
	getRecommendationTagLabel,
} from "@/utils/constants";
import LoadingComponent from "@/components/LoadingComponent";
import ProfilePicture from "@/components/ProfilePicture";
import Modal from "@/components/Modal";
import { FaStar, FaMapMarkerAlt, FaTag, FaCalendarAlt } from "react-icons/fa";
import { formatDateTime } from "@/utils/formatters";

const RecommendationMap = dynamic(
	() => import("@/components/map/RecommendationMap"),
	{
		ssr: false, // Disable Server-Side Rendering for this component
		loading: () => (
			<div className="bg-gray-200 h-80 md:h-96 flex items-center justify-center text-gray-600">
				Loading Map...
			</div>
		), // Optional loading indicator
	}
);
// Reusable Static Star Rating (could be moved to a shared components dir)
const StaticStarRating = ({ rating }) => {
	return (
		<div className="flex items-center space-x-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<FaStar
					key={star}
					className={`w-5 h-5 ${
						// Slightly larger stars
						rating >= star ? "text-yellow-500" : "text-gray-300"
					}`}
				/>
			))}
			<span className="text-sm text-gray-600">({rating.toFixed(1)})</span>
		</div>
	);
};

export default function RecommendationDetailPage() {
	const params = useParams();
	const { recommendationId } = params;
	const { loggedInUser, token } = useAuth(); // For potential edit/delete later
	const userSettings = loggedInUser?.settings || {
		dateFormat: "YYYY-MM-DD",
		timeFormat: "24h",
	};

	const [recommendation, setRecommendation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// State for Image Modal
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState("");

	useEffect(() => {
		if (!recommendationId) return;

		const fetchRecommendation = async () => {
			setLoading(true);
			setError("");
			try {
				const response = await fetch(
					`${API_URL}/recommendations/${recommendationId}`
				);
				if (!response.ok) {
					const errData = await response.json();
					throw new Error(
						errData.message ||
							`Failed to fetch recommendation (${response.status})`
					);
				}
				const data = await response.json();
				setRecommendation(data);
			} catch (err) {
				console.error("Error fetching recommendation:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchRecommendation();
	}, [recommendationId]);

	const handleImageClick = (imageUrl) => {
		setSelectedImageUrl(imageUrl);
		setIsImageModalOpen(true);
	};

	if (loading) return <LoadingComponent />;
	if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;
	if (!recommendation)
		return <p className="text-center mt-4">Recommendation not found.</p>;

	const {
		name,
		description,
		rating,
		primaryCategory,
		attributeTags,
		location,
		photos,
		user,
		createdAt,
		updatedAt,
		associatedTrip, // For linking back if needed
	} = recommendation || {};

	const categoryLabel = getRecommendationCategoryLabel(primaryCategory);
	const tagLabels = attributeTags?.map(getRecommendationTagLabel) || [];
	const [longitude, latitude] = location.coordinates;

	return (
		<div className="max-w-4xl mx-auto pb-12">
			{/* Image Modal */}
			<Modal
				isOpen={isImageModalOpen}
				onClose={() => setIsImageModalOpen(false)}
				size="screen-h"
				panelClassName="bg-black/80 flex items-center justify-center"
			>
				{selectedImageUrl && (
					<div className="relative w-full h-full flex items-center justify-center">
						<Image
							src={selectedImageUrl}
							alt="Selected recommendation photo"
							width={1200}
							height={900}
							className="object-contain max-h-full max-w-full"
						/>
					</div>
				)}
			</Modal>

			{/* Main Content Card */}
			<div className="bg-white p-6 md:p-8 shadow-md border border-gray-200">
				{/* Header: Name & Rating */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
						{name}
					</h1>
					<div className="flex-shrink-0">
						<StaticStarRating rating={rating} />
					</div>
				</div>

				{/* Meta Info: Category, User, Date */}
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-6">
					<span className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1  font-medium">
						{categoryLabel}
					</span>
					<div className="flex items-center">
						<span className="mr-1">By:</span>
						<Link
							href={`/profile/${user._id}`}
							className="flex items-center hover:underline"
						>
							<ProfilePicture
								size={24}
								profilePictureUrl={user.profilePictureUrl}
								className="mr-1.5"
							/>
							<span className="ml-1">{user.username}</span>
						</Link>
					</div>
					<div
						className="flex items-center"
						title={`Created: ${formatDateTime(
							recommendation.createdAt,
							userSettings
						)}, Updated: ${formatDateTime(
							recommendation.updatedAt,
							userSettings
						)}`}
					>
						<FaCalendarAlt className="mr-1.5 text-gray-400" />
						<span>
							{formatDateTime(recommendation.createdAt, userSettings)}
						</span>
					</div>
					{associatedTrip && (
						<Link
							href={`/trips/${associatedTrip}`}
							className="text-indigo-600 hover:underline"
						>
							View Associated Trip
						</Link>
					)}
				</div>

				{/* Description */}
				<div className="prose max-w-none text-gray-700 mb-6">
					<p>{description}</p>
				</div>

				{/* Attribute Tags */}
				{tagLabels.length > 0 && (
					<div className="mb-6">
						<h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
							<FaTag className="mr-2 text-gray-400" /> Features
						</h2>
						<div className="flex flex-wrap gap-2">
							{tagLabels.map((label, index) => (
								<span
									key={index}
									className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-sm"
								>
									{label}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Location */}
				<div className="mb-6">
					<h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
						<FaMapMarkerAlt className="mr-2 text-gray-400" /> Location
					</h2>
					<p className="text-sm text-gray-600">
						Coordinates: {latitude.toFixed(5)}, {longitude.toFixed(5)}
					</p>
					<div className="h-48 md:h-64 w-full border rounded overflow-hidden">
						<Suspense fallback={<LoadingComponent message="Loading map..." />}>
							<RecommendationMap
								latitude={latitude}
								longitude={longitude}
								popupText={name} // Optional: text for map marker popup
							/>
						</Suspense>
					</div>
				</div>

				{/* Photos */}
				{photos && photos.length > 0 && (
					<div className="mb-6">
						<h2 className="text-lg font-semibold text-gray-800 mb-3">
							Photos ({photos.length})
						</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
							{photos.map((photoId) => {
								const imageUrl = `${API_URL}/photos/${photoId}`;
								return (
									<div
										key={photoId}
										className="aspect-square overflow-hidden shadow cursor-pointer group bg-gray-100"
										onClick={() => handleImageClick(imageUrl)}
										title="View larger image"
									>
										<Image
											src={imageUrl}
											alt={`Recommendation photo ${photoId}`}
											width={300}
											height={300}
											className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
										/>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* TODO: Add Edit/Delete buttons for owner */}
			</div>
		</div>
	);
}
