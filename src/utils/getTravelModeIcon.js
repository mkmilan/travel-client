import {
	FaCar,
	FaBus,
	FaCaravan,
	FaMotorcycle,
	FaBicycle,
	FaWalking,
	FaQuestionCircle,
	FaRoute,
	FaPlane, // Added for completeness if you expand travel modes
	FaShip, // Added for completeness
	FaTrain, // Added for completeness
} from "react-icons/fa";
// If you have fa6 icons and prefer them for some:
// import { FaCaravan as Fa6Caravan } from "react-icons/fa6";

// Consistent with EditTripPage and Trip Model enums
// ["motorhome", "campervan", "car", "motorcycle", "bicycle", "walking", ""]
export const getTravelModeIcon = (travelMode) => {
	switch (travelMode) {
		case "motorhome":
			return FaBus; // Using FaCar as per EditTripPage for consistency
		case "campervan":
			return FaCaravan; // FaCaravan is in react-icons/fa
		case "car":
			return FaCar;
		case "motorcycle":
			return FaMotorcycle;
		case "bicycle":
			return FaBicycle;
		case "walking":
			return FaWalking;
		case "plane": // Example for future expansion
			return FaPlane;
		case "boat": // Example for future expansion (FaShip is more common)
			return FaShip;
		case "train": // Example for future expansion
			return FaTrain;
		case "": // Empty string for 'other' or 'not specified'
			return FaQuestionCircle;
		default:
			return FaRoute; // A generic fallback for unknown or null/undefined modes
	}
};

// Optional: A helper to get the name if you need it alongside the icon
export const getTravelModeName = (travelMode) => {
	switch (travelMode) {
		case "motorhome":
			return "Motorhome";
		case "campervan":
			return "Campervan";
		case "car":
			return "Car";
		case "motorcycle":
			return "Motorcycle";
		case "bicycle":
			return "Bicycle";
		case "walking":
			return "Walk/Hike";
		case "plane":
			return "Plane";
		case "boat":
			return "Boat/Ferry";
		case "train":
			return "Train";
		case "":
			return "Other";
		default:
			return "Unknown Mode";
	}
};
