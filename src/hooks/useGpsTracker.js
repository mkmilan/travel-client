// src/hooks/useGpsTracker.js
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { reverseGeocode } from "../utils/geocoding"; // Import geocoding function

const LOCAL_STORAGE_KEY = "currentMotorhomeTrack"; // Key for localStorage

const geoOptions = {
	enableHighAccuracy: true,
	timeout: 15000,
	maximumAge: 5000,
};

export function useGpsTracker() {
	const [isTracking, setIsTracking] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [trackedPoints, setTrackedPoints] = useState([]);
	const [pointsOfInterest, setPointsOfInterest] = useState([]);
	const [currentPosition, setCurrentPosition] = useState(null);
	const [startTime, setStartTime] = useState(null);
	const [elapsedTime, setElapsedTime] = useState(0);
	const [trackingError, setTrackingError] = useState("");
	const [needsSaving, setNeedsSaving] = useState(false); // Flag if restored data needs action
	const [isInitializing, setIsInitializing] = useState(true);
	const [isAddingPoi, setIsAddingPoi] = useState(false);

	const elapsedTimeRef = useRef(elapsedTime);
	const watchIdRef = useRef(null);
	const timerIntervalRef = useRef(null);

	// Update ref whenever state changes
	useEffect(() => {
		elapsedTimeRef.current = elapsedTime;
	}, [elapsedTime]);

	// --- LocalStorage Handling ---
	const saveTrackToLocalStorage = useCallback(
		(points, time, trackStartTime, pois, paused) => {
			// Also save elapsedTime and maybe startTime if needed for resume later
			const trackData = {
				points,
				elapsedTime: time,
				startTime: trackStartTime,
				pointsOfInterest: pois,
				isPaused: paused ? "paused" : points.length > 0 ? "stopped" : "idle",
			};
			try {
				localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trackData));
			} catch (error) {
				console.error("Error saving track points to localStorage:", error);
				setTrackingError("Could not save track progress."); // Inform user
			}
		},
		// [elapsedTime, startTime]
		[]
	); // Dependencies for data being saved

	const clearSavedTrack = useCallback(() => {
		localStorage.removeItem(LOCAL_STORAGE_KEY);
		setTrackedPoints([]);
		setPointsOfInterest([]); // Clear POIs state
		setElapsedTime(0);
		setStartTime(null);
		setCurrentPosition(null);
		setIsTracking(false);
		setIsPaused(false);
		setNeedsSaving(false);
		setTrackingError("");
		console.log("Cleared saved track from localStorage and reset state.");
	}, []);

	// Load on Mount
	useEffect(() => {
		console.log("useGpsTracker: Checking localStorage...");
		const savedTrackJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (savedTrackJSON) {
			try {
				const savedTrack = JSON.parse(savedTrackJSON);
				if (savedTrack && Array.isArray(savedTrack.points)) {
					// Allow empty points array if paused/stopped
					console.log(
						`Restoring track data. Status: ${savedTrack.status}, Points: ${savedTrack.points.length}`
					);
					setTrackedPoints(savedTrack.points);
					setPointsOfInterest(savedTrack.pointsOfInterest || []); // Restore POIs
					setElapsedTime(savedTrack.elapsedTime || 0);
					setStartTime(savedTrack.startTime || null);

					if (savedTrack.status === "paused") {
						setIsPaused(true);
						setIsTracking(false);
						setNeedsSaving(false); // Not ready for saving yet
						console.log("Restored to PAUSED state.");
					} else if (
						savedTrack.status === "stopped" &&
						savedTrack.points.length > 1
					) {
						setIsPaused(false);
						setIsTracking(false);
						setNeedsSaving(true); // Ready for saving
						console.log("Restored to STOPPED state (needs saving).");
					} else {
						// If status is idle or points < 2, treat as fresh start needed
						console.log("Restored data invalid or insufficient, clearing.");
						clearSavedTrack(); // Clear invalid/insufficient data
					}
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
		} else {
			console.log("No track found in localStorage.");
			// Ensure initial state is clean if nothing is loaded
			setTrackedPoints([]);
			setPointsOfInterest([]);
			setElapsedTime(0);
			setStartTime(null);
			setIsPaused(false);
			setNeedsSaving(false);
		}
		setIsInitializing(false);
	}, [clearSavedTrack]); // Dependency on clear function

	// --- Timer ---
	const startTimer = useCallback(() => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
		}
		console.log("Starting timer interval.");
		timerIntervalRef.current = setInterval(() => {
			setElapsedTime((prevTime) => prevTime + 1);
		}, 1000);
	}, []);

	const stopTimer = useCallback(() => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
			timerIntervalRef.current = null;
			console.log("Stopped timer interval.");
		}
	}, []);

	// --- Geolocation Watcher ---
	const startWatcher = useCallback(() => {
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
		}

		if (!navigator.geolocation) {
			setTrackingError("Geolocation not supported.");
			setIsTracking(false);
			setIsPaused(false);
			return false; // Indicate failure
		}

		console.log("Attempting to start watchPosition...");
		watchIdRef.current = navigator.geolocation.watchPosition(
			(position) => {
				// Success Callback
				if (watchIdRef.current === null) return;

				const { latitude, longitude, accuracy, speed, altitude } =
					position.coords;
				const timestamp = position.timestamp;
				setCurrentPosition({ lat: latitude, lon: longitude, accuracy });

				const speedMps = typeof speed === "number" && speed >= 0 ? speed : null;

				// Only record point if accuracy is good enough
				if (accuracy < 100) {
					const newPoint = {
						lat: latitude,
						lon: longitude,
						timestamp,
						altitude,
						speed: speedMps,
					};
					setTrackedPoints((prevPoints) => {
						const newPoints = [...prevPoints, newPoint];
						// Save state to localStorage using current elapsedTimeRef value
						// Don't save status here, save happens on pause/stop
						// saveTrackToLocalStorage(newPoints, elapsedTimeRef.current, startTime, pointsOfInterest, isPaused);
						return newPoints;
					});

					// If this is the very first point of the session (after start/resume)
					if (!isTracking) {
						setIsTracking(true); // Set tracking state
						setIsPaused(false); // Ensure not paused
						if (startTime === null) {
							// If it's a brand new session
							const now = Date.now();
							setStartTime(now);
							// Don't reset elapsedTime if resuming from pause
							console.log("Tracking session started for the first time.");
						} else {
							console.log("Tracking resumed.");
						}
						startTimer(); // Start/restart the timer
					}
				} else {
					console.warn(`Low accuracy: ${accuracy}m. Point not recorded.`);
					// Optionally set a temporary error message for the user?
					// setTrackingError(`Low GPS accuracy (${accuracy.toFixed(0)}m). Trying again...`);
				}
			},
			(geoError) => {
				// Error Callback
				console.error("Geolocation Error:", geoError);
				let message = "Unknown geolocation error.";
				switch (geoError.code) {
					case geoError.PERMISSION_DENIED:
						message = "Geolocation permission denied.";
						break;
					case geoError.POSITION_UNAVAILABLE:
						message = "Location information is unavailable.";
						break;
					case geoError.TIMEOUT:
						message = "Geolocation request timed out.";
						break;
				}
				setTrackingError(message);
				if (watchIdRef.current !== null) {
					navigator.geolocation.clearWatch(watchIdRef.current);
					watchIdRef.current = null;
				}
				stopTimer();
				setIsTracking(false); // Stop tracking on error
				setIsPaused(false); // Ensure not paused on error
				// Don't set needsSaving on error
			},
			geoOptions
		);
		return true; // Indicate success
	}, [
		isTracking,
		isPaused,
		startTimer,
		stopTimer,
		startTime,
		pointsOfInterest,
	]); // Dependencies for watcher logic

	const stopWatcher = useCallback(() => {
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
			watchIdRef.current = null;
			console.log("Stopped watchPosition.");
		}
	}, []);

	// --- Tracking Control ---
	const startTracking = useCallback(async () => {
		// Clear everything for a completely new track
		clearSavedTrack();
		setTrackingError("");

		// Check permissions before starting watcher
		if (!navigator.geolocation) {
			setTrackingError("Geolocation not supported.");
			return;
		}
		try {
			const permissionStatus = await navigator.permissions.query({
				name: "geolocation",
			});
			if (permissionStatus.state === "denied") {
				setTrackingError(
					"Geolocation permission denied. Please enable in browser settings."
				);
				return;
			}
			// Prompt will happen automatically if state is 'prompt'
		} catch (permError) {
			console.warn(
				"Permission query failed, proceeding cautiously.",
				permError
			);
		}

		// Start the watcher (which will set isTracking, startTime, startTimer on first good point)
		startWatcher();
	}, [clearSavedTrack, startWatcher]);

	const pauseTracking = useCallback(() => {
		if (!isTracking) return; // Can only pause if currently tracking

		stopWatcher();
		stopTimer();
		setIsTracking(false);
		setIsPaused(true);
		setNeedsSaving(false); // Not ready for saving yet
		setTrackingError(""); // Clear any temporary errors
		// Save current state as paused
		saveTrackToLocalStorage(
			trackedPoints,
			elapsedTime,
			startTime,
			pointsOfInterest,
			true
		);
		console.log("Tracking paused.");
	}, [
		isTracking,
		stopWatcher,
		stopTimer,
		trackedPoints,
		elapsedTime,
		startTime,
		pointsOfInterest,
		saveTrackToLocalStorage,
	]);

	const resumeTracking = useCallback(() => {
		if (!isPaused) return; // Can only resume if paused

		setTrackingError("");
		setIsPaused(false);
		// Restart watcher - it will handle setting isTracking and restarting timer
		if (startWatcher()) {
			// isPaused will be set to false inside startWatcher's success callback logic indirectly
			// setIsPaused(false); // Set immediately? Or wait for first point? Let's wait.
			console.log("Attempting to resume tracking...");
		} else {
			console.error("Failed to restart watcher on resume.");
			// Error should be set by startWatcher
		}
	}, [isPaused, startWatcher]);

	const stopTracking = useCallback(() => {
		// This function now means "Final Stop" (prepare for save/discard)
		stopWatcher();
		stopTimer();
		setIsTracking(false);
		setIsPaused(false);

		if (trackedPoints.length > 1) {
			setNeedsSaving(true); // Mark that data exists and needs saving
			setTrackingError(""); // Clear tracking errors if we successfully stopped
			// Save final state as 'stopped'
			saveTrackToLocalStorage(
				trackedPoints,
				elapsedTime,
				startTime,
				pointsOfInterest,
				false
			);
			console.log("Tracking stopped. Ready to save.");
		} else {
			setTrackingError("Not enough points tracked to save.");
			clearSavedTrack(); // Discard insufficient points
			console.log("Tracking stopped. Insufficient points, data cleared.");
		}
	}, [
		stopWatcher,
		stopTimer,
		trackedPoints,
		elapsedTime,
		startTime,
		pointsOfInterest,
		clearSavedTrack,
		saveTrackToLocalStorage,
	]);

	// --- Point of Interest ---
	const addPointOfInterest = useCallback(
		async (description = "") => {
			if (!currentPosition) {
				setTrackingError("Cannot add POI: Current location unknown.");
				return;
			}
			if (isAddingPoi) return; // Prevent multiple simultaneous adds

			setIsAddingPoi(true);
			setTrackingError(""); // Clear previous errors

			const { lat, lon } = currentPosition;
			const timestamp = Date.now();
			let locationName = "Fetching name...";

			const poiBase = { lat, lon, timestamp, description, name: locationName };

			// Add POI with temporary name immediately for responsiveness
			setPointsOfInterest((prevPois) => [...prevPois, poiBase]);

			try {
				locationName = await reverseGeocode(lat, lon);
				console.log(`POI Geocoded: ${locationName}`);
			} catch (error) {
				console.error("Error fetching POI name:", error);
				locationName = "Name unavailable"; // Update name on error
				setTrackingError("Could not fetch name for the point of interest."); // Inform user
			} finally {
				// Update the specific POI with the fetched/error name
				setPointsOfInterest((prevPois) =>
					prevPois.map((poi) =>
						poi.timestamp === timestamp // Find by timestamp (assuming unique enough for this context)
							? { ...poi, name: locationName || "Unknown" }
							: poi
					)
				);
				setIsAddingPoi(false);
				// Re-save to localStorage with updated POI name
				saveTrackToLocalStorage(
					trackedPoints,
					elapsedTime,
					startTime,
					pointsOfInterest,
					isPaused
				);
			}
		},
		[
			currentPosition,
			isAddingPoi,
			trackedPoints,
			elapsedTime,
			startTime,
			pointsOfInterest,
			isPaused,
			saveTrackToLocalStorage,
		]
	);

	// Function to add dummy points for testing
	const addDummyPoints = useCallback(() => {
		clearSavedTrack(); // Clear any real saved track
		const now = Date.now();
		const dummyPoints = [
			{ lat: 50.8713, lon: 4.3758, timestamp: now, altitude: 50, speed: 5.5 },
			{
				lat: 50.8725,
				lon: 4.3765,
				timestamp: now + 30000,
				altitude: 51,
				speed: 6.5,
			},
			{
				lat: 50.873,
				lon: 4.3772,
				timestamp: now + 60000,
				altitude: 52,
				speed: 5.1,
			},
			{
				lat: 50.8735,
				lon: 4.3779,
				timestamp: now + 90000,
				altitude: 51,
				speed: 5.9,
			},
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
			stopWatcher();
			stopTimer();
		};
	}, [stopWatcher, stopTimer]);

	// useEffect(() => {
	// 	return () => {
	// 		if (watchIdRef.current !== null)
	// 			navigator.geolocation.clearWatch(watchIdRef.current);
	// 		stopTimer(); // Ensure timer is cleared on unmount
	// 	};
	// }, [stopTimer]);

	// Hook returns state and control methods
	return {
		isTracking,
		isPaused, // Expose pause state
		trackedPoints,
		pointsOfInterest, // Expose POIs
		currentPosition,
		elapsedTime,
		trackingError,
		needsSaving,
		isInitializing,
		isAddingPoi, // Expose POI loading state
		startTracking,
		pauseTracking, // Expose pause
		resumeTracking, // Expose resume
		stopTracking, // This is now "Final Stop"
		addPointOfInterest, // Expose POI function
		clearSavedTrack,
		addDummyPoints,
	};
}
