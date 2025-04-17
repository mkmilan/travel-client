/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		// domains: ["localhost", "https://travel-server-fdxh.onrender.com"],
		remotePatterns: [
			{
				protocol: "http", // Allow http for local development
				hostname: "localhost",
				port: "5001", // Specify the port your local backend runs on
				pathname: "/api/**", // Be specific about the path
			},
			{
				protocol: "https", // Allow https for production
				hostname: "travel-server-fdxh.onrender.com", // Your Render backend hostname
				port: "", // Default port (443 for https)
				pathname: "/api/**", // Be specific about the path
			},
			// Add any other domains you might load images from (e.g., user profile pics from external services)
		],
	},
};

export default nextConfig;
