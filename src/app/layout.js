// src/app/layout.js (or .jsx/.tsx)
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

import "leaflet/dist/leaflet.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Motorhome Mapper",
	description: "Track and share your motorhome adventures",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			{/* Apply light gray background to the body */}
			<body className={`${inter.className} bg-gray-100`}>
				<AuthProvider>
					<Navbar />
					{/* Add some default padding within the main content area */}
					<main className="container mx-auto px-4 py-8">{children}</main>
				</AuthProvider>
			</body>
		</html>
	);
}
