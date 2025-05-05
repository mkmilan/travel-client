// filepath: client/src/components/common/Modal.js
"use client";

import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { FaTimes } from "react-icons/fa";

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	initialFocusRef, // Optional ref for initial focus
	size = "md", // Default size ('sm', 'md', 'lg', 'xl', '2xl', 'screen-h', 'full')
	panelClassName = "", // Allow custom classes for the panel
}) {
	if (!isOpen) return null;

	// Define size classes
	const sizeClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
		"2xl": "max-w-2xl",
		"screen-h": "max-w-5xl w-full h-[90vh]", // Good for map
		full: "max-w-full w-full h-full", // Full screen
	};

	// Determine panel classes based on size and whether it should grow (for map/images)
	const isGrowable = size === "screen-h" || size === "full";
	const panelSizeClass = sizeClasses[size] || sizeClasses.md;
	const panelLayoutClass = isGrowable ? "flex flex-col" : ""; // Use flex layout for growable content
	const contentAreaClass = isGrowable
		? "flex-grow overflow-hidden p-0 sm:p-2"
		: " p-5"; // No padding or different padding for map/image

	return (
		<Transition
			appear
			show={isOpen}
			as={Fragment}
		>
			<Dialog
				as="div"
				className="relative z-50"
				onClose={onClose}
				initialFocus={initialFocusRef}
			>
				{/* Backdrop */}
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<DialogBackdrop className="fixed inset-0 bg-black/60" />
				</TransitionChild>

				{/* Modal Content Container */}
				<div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
					<TransitionChild
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<DialogPanel
							className={`relative w-full ${panelSizeClass} ${panelLayoutClass} transform  bg-white text-left align-middle shadow-xl transition-all ${panelClassName}`}
						>
							{/* Optional Header with Title */}
							{title && (
								<div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
									<DialogTitle
										as="h3"
										className="text-lg font-semibold leading-6 text-gray-900"
									>
										{title}
									</DialogTitle>
									<button
										type="button"
										className="text-gray-600 hover:text-gray-600 focus:outline-none "
										onClick={onClose}
										aria-label="Close modal"
									>
										<FaTimes size={20} />
									</button>
								</div>
							)}
							{/* Close button for modals without a title bar (like map/image) */}
							{!title && (
								<button
									type="button"
									className="absolute top-2 right-2 text-gray-200 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 z-15 focus:outline-none transition-colors"
									onClick={onClose}
									aria-label="Close modal"
								>
									<FaTimes size={20} />
								</button>
							)}

							{/* Content Area */}
							<div className={contentAreaClass}>{children}</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	);
}
