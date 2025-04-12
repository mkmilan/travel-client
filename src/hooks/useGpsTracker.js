// src/hooks/useGpsTracker.js
"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const LOCAL_STORAGE_KEY = "currentMotorhomeTrack"; // Key for localStorage

const geoOptions = {
	enableHighAccuracy: true,
	timeout: 15000,
	maximumAge: 5000,
};

export function useGpsTracker() {
	const [isTracking, setIsTracking] = useState(false);
	const [trackedPoints, setTrackedPoints] = useState([]);
	const [currentPosition, setCurrentPosition] = useState(null);
	const [startTime, setStartTime] = useState(null);
	const [elapsedTime, setElapsedTime] = useState(0);
	const [trackingError, setTrackingError] = useState("");
	const [needsSaving, setNeedsSaving] = useState(false); // Flag if restored data needs action
	const [isInitializing, setIsInitializing] = useState(true); // Loading state

	const watchIdRef = useRef(null);
	const timerIntervalRef = useRef(null);

	// --- LocalStorage Handling ---
	const saveTrackToLocalStorage = useCallback(
		(points) => {
			// Also save elapsedTime and maybe startTime if needed for resume later
			const trackData = { points, elapsedTime, startTime };
			try {
				localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trackData));
			} catch (error) {
				console.error("Error saving track points to localStorage:", error);
				setTrackingError("Could not save track progress."); // Inform user
			}
		},
		[elapsedTime, startTime]
	); // Dependencies for data being saved

	const clearSavedTrack = useCallback(() => {
		localStorage.removeItem(LOCAL_STORAGE_KEY);
		console.log("Cleared saved track from localStorage.");
	}, []);

	// Load on Mount
	useEffect(() => {
		console.log("useGpsTracker: Checking localStorage...");
		const savedTrackJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (savedTrackJSON) {
			try {
				const savedTrack = JSON.parse(savedTrackJSON);
				if (
					savedTrack &&
					Array.isArray(savedTrack.points) &&
					savedTrack.points.length > 0
				) {
					console.log(`Restoring ${savedTrack.points.length} points.`);
					setTrackedPoints(savedTrack.points);
					setElapsedTime(savedTrack.elapsedTime || 0);
					setStartTime(savedTrack.startTime || null);
					// Don't automatically start tracking, set a flag
					setNeedsSaving(true);
					// Update currentPosition display to last known point
					if (savedTrack.points.length > 0) {
						const lastPoint = savedTrack.points[savedTrack.points.length - 1];
						setCurrentPosition({
							lat: lastPoint.lat,
							lon: lastPoint.lon,
							accuracy: null,
						}); // Accuracy unknown
					}
				} else {
					clearSavedTrack();
				}
			} catch (error) {
				console.error("Failed parse saved track", error);
				clearSavedTrack();
			}
		}
		setIsInitializing(false);
	}, [clearSavedTrack]); // Dependency on clear function

	// --- Timer ---
	const startTimer = useCallback(() => {
		clearInterval(timerIntervalRef.current);
		timerIntervalRef.current = setInterval(() => {
			setElapsedTime((prevTime) => prevTime + 1);
		}, 1000);
	}, []);

	const stopTimer = useCallback(() => {
		clearInterval(timerIntervalRef.current);
	}, []);

	// --- Tracking Control ---
	const startTracking = useCallback(async () => {
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
			watchIdRef.current = null;
		}

		clearSavedTrack(); // Clear old data on explicit new start
		setTrackingError("");
		setTrackedPoints([]);
		setElapsedTime(0);
		setCurrentPosition(null);
		setIsTracking(false); // Ensure state is ready
		setNeedsSaving(false); // Starting fresh

		if (!navigator.geolocation) {
			setTrackingError("Geolocation not supported.");
			return;
		}

		try {
			const permissionStatus = await navigator.permissions.query({
				name: "geolocation",
			});
			if (permissionStatus.state === "denied") {
				setTrackingError("Geolocation permission denied.");
				return;
			}
		} catch (permError) {
			console.warn("Permission query failed.", permError);
		}

		console.log("Attempting to start watchPosition...");
		watchIdRef.current = navigator.geolocation.watchPosition(
			(position) => {
				// Success Callback
				if (watchIdRef.current === null) return; // Bail if stopped

				const { latitude, longitude, accuracy, speed, altitude } =
					position.coords;
				const timestamp = position.timestamp;
				setCurrentPosition({ lat: latitude, lon: longitude, accuracy });

				if (accuracy < 100) {
					// Use functional update + save to localStorage
					setTrackedPoints((prevPoints) => {
						const newPoint = {
							lat: latitude,
							lon: longitude,
							timestamp,
							altitude,
							speed,
						};
						const newPoints = [...prevPoints, newPoint];
						saveTrackToLocalStorage(newPoints); // Save updated points
						return newPoints;
					});

					if (!isTracking) {
						// Start timer/state only once
						setIsTracking(true);
						const now = Date.now();
						setStartTime(now);
						setElapsedTime(0);
						startTimer();
						console.log("Tracking started.");
					}
				} else {
					console.warn(`Low accuracy: ${accuracy}m`);
				}
			},
			(geoError) => {
				// Error Callback
				console.error("Geolocation Error:", geoError);
				let message = "Unknown geolocation error.";
				// ... (error code handling) ...
				setTrackingError(message);
				if (watchIdRef.current !== null) {
					navigator.geolocation.clearWatch(watchIdRef.current);
					watchIdRef.current = null;
				}
				stopTimer();
				setIsTracking(false);
			},
			geoOptions
		);
	}, [
		isTracking,
		startTimer,
		stopTimer,
		saveTrackToLocalStorage,
		clearSavedTrack,
	]); // Include isTracking

	const stopTracking = useCallback(() => {
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
			watchIdRef.current = null;
		}
		stopTimer();
		setIsTracking(false);
		// Don't clear localStorage here, let save/discard handle it
		if (trackedPoints.length > 1) {
			setNeedsSaving(true); // Mark that data exists and needs saving
			setTrackingError(""); // Clear tracking errors if we successfully stopped
		} else {
			setTrackingError("Not enough points tracked.");
			clearSavedTrack(); // Discard insufficient points
			setTrackedPoints([]); // Reset state too
			setElapsedTime(0);
			setNeedsSaving(false);
		}
	}, [stopTimer, trackedPoints, clearSavedTrack]);

	// Function to add dummy points for testing
	const addDummyPoints = useCallback(() => {
		clearSavedTrack(); // Clear any real saved track
		const now = Date.now();
		const dummyPoints = [
			{ lat: 50.8713, lon: 4.3758, timestamp: now, altitude: 50 },
			{ lat: 50.8725, lon: 4.3765, timestamp: now + 30000, altitude: 51 },
			{ lat: 50.873, lon: 4.3772, timestamp: now + 60000, altitude: 52 },
			{ lat: 50.8735, lon: 4.3779, timestamp: now + 90000, altitude: 51 },
		];
		setTrackedPoints(dummyPoints);
		setCurrentPosition({
			lat: dummyPoints[dummyPoints.length - 1].lat,
			lon: dummyPoints[dummyPoints.length - 1].lon,
			accuracy: 5,
		});
		setElapsedTime(90);
		setIsTracking(false); // Set tracking to false, ready to "stop"
		setNeedsSaving(true); // Mark as needing save
		saveTrackToLocalStorage(dummyPoints); // Also save dummy points for persistence testing
		console.log("Dummy points added and saved to localStorage.");
	}, [saveTrackToLocalStorage, clearSavedTrack]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (watchIdRef.current !== null)
				navigator.geolocation.clearWatch(watchIdRef.current);
			clearInterval(timerIntervalRef.current);
		};
	}, []);

	// Hook returns state and control methods
	return {
		isTracking,
		trackedPoints,
		currentPosition,
		elapsedTime,
		trackingError,
		needsSaving,
		isInitializing,
		startTracking,
		stopTracking,
		clearSavedTrack, // Expose clear function
		addDummyPoints, // Expose dummy data function
		setTrackedPoints, // Expose setter if needed externally (like after cancel)
		setElapsedTime, // Expose setter for reset
		setNeedsSaving, // Expose setter for reset
	};
}
