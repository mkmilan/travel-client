// src/components/Navbar.jsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import {
	FaHome,
	FaRoute,
	FaUser,
	FaSignInAlt,
	FaUserPlus,
	FaPlusCircle,
	FaListAlt,
	FaSignOutAlt,
	FaSearch,
	FaUserCircle,
	FaCog,
	FaStar,
} from "react-icons/fa"; // Example: Font Awesome icons
import { MdAddLocationAlt } from "react-icons/md"; // Example: Material Design
import ProfilePicture from "./ProfilePicture";
import {
	Menu,
	MenuButton,
	MenuItems,
	MenuItem,
	Transition,
} from "@headlessui/react";

export default function Navbar() {
	const { user, logout, loading, isAuthenticated } = useAuth();

	// Helper component for Nav Links to reduce repetition
	const NavLink = ({ href, icon: Icon, children }) => (
		<Link
			href={href}
			// className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md transition duration-150 ease-in-out"
			className="text-gray-600 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100"
		>
			<Icon
				className="m-1 h-5 w-5"
				aria-hidden="true"
			/>
			<span>{children}</span>
		</Link>
	);

	const NavButton = ({ onClick, icon: Icon, children, className = "" }) => (
		<button
			onClick={onClick}
			className={`text-gray-600 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100 ${className}`}
		>
			<Icon
				className="mr-1 h-5 w-5"
				aria-hidden="true"
			/>
			<span>{children}</span>
		</button>
	);

	if (loading) {
		return (
			<nav className="bg-white border-b border-gray-200 px-4 shadow-sm h-16 flex items-center justify-between sticky top-0 z-50">
				<div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>{" "}
				{/* Logo placeholder */}
				<div className="flex items-center space-x-4">
					<div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
					<div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
				</div>
			</nav>
		);
	}

	return (
		<nav className="bg-white border-b border-gray-200 px-4 shadow-sm sticky top-0 z-40">
			<div className="container mx-auto h-16 flex justify-between items-center">
				{/* Logo/Brand Name */}
				<Link
					href={isAuthenticated ? "/feed" : "/"}
					className="text-xl font-bold text-primary hover:text-primary-dark transition-colors"
				>
					Mapper
				</Link>

				{/* Desktop Navigation / Actions (Hidden on Mobile) */}
				<div className="hidden md:flex items-center space-x-4">
					{isAuthenticated ? (
						<>
							{/* Profile Link/Icon */}

							{/* Settings Button (Placeholder) */}
							<NavLink
								href="/trips/new"
								icon={FaRoute}
							>
								{/* Record */}
							</NavLink>
							<NavLink
								href="/my-trips"
								icon={FaListAlt}
							>
								{/* Trips */}
							</NavLink>
							<NavLink
								href="/search"
								icon={FaSearch}
							></NavLink>

							{user && (
								<Link
									href={`/profile/${user._id}`}
									title={user.username || "Profile"}
									className="flex items-center text-gray-600 hover:text-primary transition-colors"
								>
									{user.profilePictureUrl ? (
										<ProfilePicture
											src={user.profilePictureUrl}
											alt="Profile"
											size={25} // Adjust size as needed
											className="rounded-full border border-gray-300"
										/>
									) : (
										<FaUserCircle className="h-8 w-8" /> // Larger icon if no image
									)}
									{/* Optionally show username on desktop */}
									{/* <span className="ml-2 text-sm font-medium">{user.username}</span> */}
								</Link>
							)}

							{/* <NavLink
								href="/recommendations/new"
								icon={FaStar}
								title="Recommendation"
								className="text-gray-600 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100" // Added padding for better click area
							></NavLink> */}

							{/* <NavLink
								href="/settings"
								icon={FaCog}
								title="Settings"
								className="text-gray-600 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100" // Added padding for better click area
							></NavLink> */}

							{/* Logout Button */}
							<NavButton
								onClick={logout}
								icon={FaSignOutAlt}
								className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
							>
								{/* Logout */}
							</NavButton>
						</>
					) : (
						// Logged Out Links/Buttons
						<div className="flex items-center ">
							<NavLink
								href="/login"
								icon={FaSignInAlt}
							>
								{/* Login */}
							</NavLink>
							<NavLink
								href="/register"
								icon={FaUserPlus}
							>
								{/* Register */}
							</NavLink>
						</div>
					)}
				</div>

				{/* Mobile view relies on BottomNavBar, so this section is intentionally empty or could hold a burger icon later */}
				<div className="md:hidden">
					{/* If needed, a burger menu icon could go here to toggle a mobile drawer */}
					{user ? (
						<div className="flex items-center ">
							<NavLink
								href="/search"
								icon={FaSearch}
								className="p-1"
							></NavLink>
							{/* <NavLink
								href="/recommendations/new"
								icon={FaStar}
								title="Recommendation"
								className="text-gray-600 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100" // Added padding for better click area
							></NavLink> */}

							{/* <NavLink
								href="/settings"
								icon={FaCog}
								title="Settings"
								className="text-gray-600 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100" // Added padding for better click area
							></NavLink> */}

							<NavButton
								onClick={logout}
								icon={FaSignOutAlt}
								className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
							>
								{/* Logout */}
							</NavButton>
						</div>
					) : (
						<div className="flex items-center">
							<NavLink
								href="/login"
								icon={FaSignInAlt}
							></NavLink>
							<NavLink
								href="/register"
								icon={FaUserPlus}
							></NavLink>
						</div>
					)}
				</div>
			</div>
		</nav>
	);

	// return (
	// 	<nav className="bg-blue-600 text-white p-4 shadow-md">
	// 		<div className="container mx-auto flex justify-between items-center flex-wrap gap-y-2">
	// 			{/* Logo */}
	// 			<Link
	// 				href={isAuthenticated ? "/feed" : "/"}
	// 				className="text-xl font-bold hover:text-blue-100 mr-4"
	// 			>
	// 				{/* Replace with actual logo later if you have one */}
	// 				Motorhome Mapper
	// 			</Link>

	// 			{/* Navigation Links */}
	// 			<div className="flex items-center space-x-1 md:space-x-2">
	// 				{" "}
	// 				{/* Reduced spacing */}
	// 				{isAuthenticated ? (
	// 					// Logged In Links
	// 					<>
	// 						{/* Optional Feed Link */}
	// 						{/* <NavLink href="/feed" icon={FaHome}>Feed</NavLink> */}
	// 						<NavLink
	// 							href="/trips/new"
	// 							icon={MdAddLocationAlt}
	// 						>
	// 							{/* Record */}
	// 						</NavLink>
	// 						<NavLink
	// 							href="/my-trips"
	// 							icon={FaListAlt}
	// 						>
	// 							{/* Trips */}
	// 						</NavLink>
	// 						<NavLink
	// 							href="/search"
	// 							icon={FaSearch}
	// 						>
	// 							{/* Trips */}
	// 						</NavLink>
	// 						{user && (
	// 							<NavLink
	// 								href={`/profile/${user._id}`}
	// 								icon={FaUser}
	// 							>
	// 								{user.username}
	// 							</NavLink>
	// 						)}
	// 						<NavButton
	// 							onClick={logout}
	// 							icon={FaSignOutAlt}
	// 							className="bg-red-600/80 hover:bg-red-700/90"
	// 						>
	// 							{/* Logout */}
	// 						</NavButton>
	// 					</>
	// 				) : (
	// 					// Logged Out Links
	// 					<>
	// 						<NavLink
	// 							href="/"
	// 							icon={FaHome}
	// 						>
	// 							Home
	// 						</NavLink>
	// 						<NavLink
	// 							href="/login"
	// 							icon={FaSignInAlt}
	// 						>
	// 							Login
	// 						</NavLink>
	// 						<NavLink
	// 							href="/register"
	// 							icon={FaUserPlus}
	// 						>
	// 							Register
	// 						</NavLink>
	// 					</>
	// 				)}
	// 			</div>
	// 		</div>
	// 	</nav>
	// );
}
