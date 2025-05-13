"use client";

import React, { useState, Fragment } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import Link from "next/link";
import {
	FaPaperPlane,
	FaSpinner,
	FaCheckCircle,
	FaExclamationTriangle,
	FaCheck,
} from "react-icons/fa";
import { RadioGroup, Label, Description } from "@headlessui/react";

const feedbackTypes = [
	{ id: "suggestion", name: "Suggestion" },
	{ id: "bug", name: "Bug Report" },
];

const suggestionCategories = [
	{ id: "feature", name: "New Feature Request" },
	{ id: "ui_change", name: "UI/UX Improvement" },
	{ id: "other", name: "Other Suggestion" },
];

export default function SuggestionPage() {
	const { user, token } = useAuth();
	const [selectedFeedbackType, setSelectedFeedbackType] = useState(
		feedbackTypes[0]
	);
	const [selectedSuggestionCategory, setSelectedSuggestionCategory] = useState(
		suggestionCategories[0]
	);
	const [subject, setSubject] = useState("");
	const [description, setDescription] = useState("");
	const [email, setEmail] = useState(user?.email || "");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		setSuccess(null);

		if (!subject.trim() || !description.trim()) {
			setError("Subject and description are required.");
			setIsSubmitting(false);
			return;
		}

		try {
			const payload = {
				type: selectedFeedbackType.id,
				...(selectedFeedbackType.id === "suggestion" && {
					category: selectedSuggestionCategory.id,
				}),
				subject,
				description,
				email: email.trim() || undefined,
				userId: user?._id || undefined,
			};

			const response = await fetch(`${API_URL}/suggestions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token && { Authorization: `Bearer ${token}` }),
				},
				body: JSON.stringify(payload),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to submit feedback.");
			}

			setSuccess("Thank you! Your feedback has been submitted successfully.");
			setSelectedFeedbackType(feedbackTypes[0]);
			setSelectedSuggestionCategory(suggestionCategories[0]);
			setSubject("");
			setDescription("");
			// setEmail(user?.email || ""); // Optionally reset email
		} catch (err) {
			setError(err.message || "An unexpected error occurred.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-4 md:p-8">
			<div className="bg-white p-6 md:p-8 shadow-md border border-gray-200">
				<h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
					Submit Feedback
				</h1>

				{success && (
					<div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 flex items-center">
						<FaCheckCircle className="mr-2" />
						{success}
					</div>
				)}
				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 flex items-center">
						<FaExclamationTriangle className="mr-2" />
						{error}
					</div>
				)}

				<form
					onSubmit={handleSubmit}
					className="space-y-6"
				>
					<div>
						<RadioGroup
							value={selectedFeedbackType}
							onChange={setSelectedFeedbackType}
							className="space-y-2"
						>
							<Label className="block text-sm font-medium text-gray-700 mb-1">
								Type of Feedback
							</Label>
							<div className="grid grid-cols-2 gap-2">
								{feedbackTypes.map((type) => (
									<RadioGroup.Option
										key={type.id}
										value={type}
										as={Fragment}
									>
										{({ checked, active }) => (
											<button
												type="button"
												className={`${
													checked
														? "bg-blue-600 text-white"
														: "bg-gray-100 text-gray-700 hover:bg-gray-200"
												} border border-gray-300  px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full flex items-center justify-center`}
											>
												{checked && <FaCheck className="mr-2 h-4 w-4" />}
												{type.name}
											</button>
										)}
									</RadioGroup.Option>
								))}
							</div>
						</RadioGroup>
					</div>

					{selectedFeedbackType.id === "suggestion" && (
						<div>
							<RadioGroup
								value={selectedSuggestionCategory}
								onChange={setSelectedSuggestionCategory}
								className="space-y-2"
							>
								<Label className="block text-sm font-medium text-gray-700 mb-1">
									Suggestion Category
								</Label>
								<div className="space-y-2">
									{suggestionCategories.map((category) => (
										<RadioGroup.Option
											key={category.id}
											value={category}
											as={Fragment}
										>
											{({ checked, active }) => (
												<div
													className={`${
														checked
															? "bg-blue-50 border-blue-500 ring-2 ring-blue-500"
															: "bg-white border-gray-300 hover:bg-gray-50"
													} border  px-3 py-2 cursor-pointer flex items-center text-sm`}
												>
													<span
														className={`${
															checked
																? "bg-blue-600"
																: "bg-white border-gray-400"
														} h-4 w-4  border flex items-center justify-center mr-3`}
													>
														{checked && (
															<FaCheck className="h-2.5 w-2.5 text-white" />
														)}
													</span>
													<span className="text-gray-800">{category.name}</span>
												</div>
											)}
										</RadioGroup.Option>
									))}
								</div>
							</RadioGroup>
						</div>
					)}

					<div>
						<label
							htmlFor="subject"
							className="block text-sm font-medium text-gray-700"
						>
							Subject / Title
						</label>
						<input
							type="text"
							name="subject"
							id="subject"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							required
							className="mt-1 block w-full px-3 py-1.5 border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700"
						>
							Description
						</label>
						<textarea
							name="description"
							id="description"
							rows="5"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							required
							className="mt-1 block w-full px-3 py-1.5 border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
						></textarea>
						<p className="mt-1 text-xs text-gray-500">
							Please be as detailed as possible. If reporting a bug, include
							steps to reproduce it.
						</p>
					</div>

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
							Your Email (Optional - for follow-up)
						</label>
						<input
							type="email"
							name="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 block w-full px-3 py-1.5 border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
						/>
					</div>

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
						>
							{isSubmitting ? (
								<FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
							) : (
								<FaPaperPlane className="-ml-1 mr-2 h-5 w-5" />
							)}
							{isSubmitting ? "Submitting..." : "Submit Feedback"}
						</button>
					</div>
				</form>
			</div>
			<p className="text-center mt-6 text-sm text-gray-500">
				Alternatively, you can discuss features on our{" "}
				<a
					href="https://github.com/your-repo/issues" // Replace with your actual issues link
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-600 hover:underline"
				>
					GitHub Issues page
				</a>
				.
			</p>
		</div>
	);
}
