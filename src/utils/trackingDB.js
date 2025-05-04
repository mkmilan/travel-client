"use client";

import { openDB } from "idb";

const DB_NAME = "trackingDB";
const STORE_NAME = "currentTrack";
const VERSION = 1; // Increment this if schema changes
const SESSION_KEY = "activeSession"; // Fixed key for the single active session

// Function to open the database
const openTrackingDB = () => {
	return openDB(DB_NAME, VERSION, {
		upgrade(db, oldVersion, newVersion, transaction) {
			console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);
			// Create object store if it doesn't exist
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME); // Simple key-value store
				console.log(`Object store "${STORE_NAME}" created.`);
			}
			// Handle future schema changes here based on oldVersion/newVersion
		},
	});
};

// --- Database Operations ---

/**
 * Saves the current tracking session state to IndexedDB.
 * @param {object} sessionData - The data object for the active session.
 */
export const saveSessionToDB = async (sessionData) => {
	try {
		const db = await openTrackingDB();
		await db.put(STORE_NAME, sessionData, SESSION_KEY);
		// console.log("Session saved to IndexedDB:", sessionData);
	} catch (error) {
		console.error("Error saving session to IndexedDB:", error);
		// Optionally re-throw or handle error (e.g., show user message)
		throw new Error("Could not save tracking progress to database.");
	}
};

/**
 * Retrieves the active tracking session state from IndexedDB.
 * @returns {Promise<object|null>} The saved session data or null if not found.
 */
export const getSessionFromDB = async () => {
	try {
		const db = await openTrackingDB();
		const sessionData = await db.get(STORE_NAME, SESSION_KEY);
		// console.log("Session retrieved from IndexedDB:", sessionData);
		return sessionData || null;
	} catch (error) {
		console.error("Error retrieving session from IndexedDB:", error);
		return null; // Return null on error to allow fallback/reset
	}
};

/**
 * Deletes the active tracking session state from IndexedDB.
 */
export const deleteSessionFromDB = async () => {
	try {
		const db = await openTrackingDB();
		await db.delete(STORE_NAME, SESSION_KEY);
		console.log("Session deleted from IndexedDB.");
	} catch (error) {
		console.error("Error deleting session from IndexedDB:", error);
		// Optionally re-throw or handle
	}
};
