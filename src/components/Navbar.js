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
	FaListAlt,
	FaSignOutAlt,
	FaSearch,
} from "react-icons/fa"; // Example: Font Awesome icons
import { MdAddLocationAlt } from "react-icons/md"; // Example: Material Design

export default function Navbar() {
	const { user, logout, loading, isAuthenticated } = useAuth();

	// Helper component for Nav Links to reduce repetition
	const NavLink = ({ href, icon: Icon, children }) => (
		<Link
			href={href}
			className="flex items-center px-3 py-2 text-gray-200 hover:bg-blue-700 hover:text-white rounded-md transition duration-150 ease-in-out"
		>
			<Icon
				className="mr-2 h-5 w-5"
				aria-hidden="true"
			/>
			<span>{children}</span>
		</Link>
	);

	const NavButton = ({ onClick, icon: Icon, children, className = "" }) => (
		<button
			onClick={onClick}
			className={`flex items-center px-3 py-2 text-gray-200 hover:bg-blue-700 hover:text-white rounded-md transition duration-150 ease-in-out ${className}`}
		>
			<Icon
				className="mr-2 h-5 w-5"
				aria-hidden="true"
			/>
			<span>{children}</span>
		</button>
	);

	if (loading) {
		// Optional: render a skeleton navbar or null
		return (
			<nav className="bg-blue-600 text-white p-4 shadow-md h-[64px]"></nav>
		); // Placeholder height
	}

	return (
		<nav className="bg-blue-600 text-white p-4 shadow-md">
			<div className="container mx-auto flex justify-between items-center flex-wrap gap-y-2">
				{/* Logo */}
				<Link
					href={isAuthenticated ? "/feed" : "/"}
					className="text-xl font-bold hover:text-blue-100 mr-4"
				>
					{/* Replace with actual logo later if you have one */}
					Motorhome Mapper
				</Link>

				{/* Navigation Links */}
				<div className="flex items-center space-x-1 md:space-x-2">
					{" "}
					{/* Reduced spacing */}
					{isAuthenticated ? (
						// Logged In Links
						<>
							{/* Optional Feed Link */}
							{/* <NavLink href="/feed" icon={FaHome}>Feed</NavLink> */}
							<NavLink
								href="/trips/new"
								icon={MdAddLocationAlt}
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
							>
								{/* Trips */}
							</NavLink>
							{user && (
								<NavLink
									href={`/profile/${user._id}`}
									icon={FaUser}
								>
									{user.username}
								</NavLink>
							)}
							<NavButton
								onClick={logout}
								icon={FaSignOutAlt}
								className="bg-red-600/80 hover:bg-red-700/90"
							>
								{/* Logout */}
							</NavButton>
						</>
					) : (
						// Logged Out Links
						<>
							<NavLink
								href="/"
								icon={FaHome}
							>
								Home
							</NavLink>
							<NavLink
								href="/login"
								icon={FaSignInAlt}
							>
								Login
							</NavLink>
							<NavLink
								href="/register"
								icon={FaUserPlus}
							>
								Register
							</NavLink>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
