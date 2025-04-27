// src/components/navigation/BottomNavBar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	FaHome,
	FaRoute,
	FaMapMarkedAlt,
	FaPlusCircle,
	FaListAlt,
	FaUser,
} from "react-icons/fa"; // Example Icons

const navItems = [
	{ href: "/feed", label: "Home", icon: FaHome },
	// { href: '/map-explore', label: 'Maps', icon: FaMapMarkedAlt }, // Placeholder for later Map Explore feature
	{ href: "/trips/new", label: "Record", icon: FaRoute }, // Use a distinct record icon
	{ href: "/my-trips", label: "Trips", icon: FaListAlt }, // Or use Groups icon if implementing that
	{ href: "/profile/me", label: "You", icon: FaUser }, // Link to own profile
];

export default function BottomNavBar({ currentUserId }) {
	const pathname = usePathname(); // Hook to get current path

	// Special handling for profile link if ID is available
	const profileHref = currentUserId
		? `/profile/${currentUserId}`
		: "/profile/me"; // Fallback just in case
	const items = navItems.map((item) =>
		item.label === "You" ? { ...item, href: profileHref } : item
	);

	return (
		// Fixed position at bottom, high z-index, background, shadow
		<nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-md z-50 md:hidden">
			{" "}
			{/* Hide on medium screens and up */}
			<div className="flex justify-around items-center h-full max-w-md mx-auto px-2">
				{items.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.label === "You" && pathname.startsWith("/profile/")); // Basic active state check

					return (
						<Link
							key={item.label}
							href={item.href}
							className={`flex flex-col items-center justify-center text-xs w-16 h-full ${
								isActive
									? "text-primary-dark"
									: "text-gray-500 hover:text-primary"
							} transition-colors duration-150`}
						>
							<item.icon
								className={`h-6 w-6 mb-1 ${isActive ? "text-primary" : ""}`}
							/>
							<span>{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
