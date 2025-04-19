/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		// domains: ["localhost", "https://travel-server-fdxh.onrender.com"],
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "5001",
				pathname: "/api/**",
			},
			{
				protocol: "https",
				hostname: "travel-server-fdxh.onrender.com",
				port: "", // Default port (443 for https)
				pathname: "/api/**",
			},
		],
	},
};

export default nextConfig;
