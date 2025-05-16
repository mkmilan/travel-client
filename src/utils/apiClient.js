import { API_URL } from "./config";

// This function assumes it can somehow get the CSRF token.
// For a cleaner approach, you might pass the `getCsrfToken` function or the token itself
// if this apiClient is instantiated or used within a context where the token is available.
// For simplicity here, we'll assume you'll call this from places where you can pass the token.

/**
 * A wrapper around the fetch API to automatically include CSRF token and credentials.
 *
 * @param {string} endpoint The API endpoint (e.g., '/auth/login').
 * @param {object} options Fetch options (method, body, custom headers, etc.).
 * @param {string | null} csrfToken The CSRF token.
 * @returns {Promise<any>} The JSON response from the API.
 */
export const apiClient = async (endpoint, options = {}, csrfToken) => {
	const {
		method = "GET",
		body,
		headers: customHeaders = {},
		...restOptions
	} = options;

	const defaultHeaders = {
		"Content-Type": "application/json", // Default, can be overridden
		...customHeaders,
	};

	// Add CSRF token for methods that typically modify state
	if (
		csrfToken &&
		["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase())
	) {
		defaultHeaders["X-CSRF-Token"] = csrfToken;
	}

	// Prepare the request body
	let requestBody = body;
	if (
		body &&
		typeof body !== "string" &&
		defaultHeaders["Content-Type"] === "application/json"
	) {
		requestBody = JSON.stringify(body);
	}

	try {
		const res = await fetch(`${API_URL}${endpoint}`, {
			method,
			headers: defaultHeaders,
			body: requestBody,
			credentials: "include", // Always include credentials
			signal: AbortSignal.timeout(15000),
			...restOptions,
		});

		// Handle cases where response might not be JSON (e.g., 204 No Content)
		if (res.status === 204) {
			return null; // Or an empty object, depending on how you want to handle it
		}

		const responseData = await res.json().catch(async (parseError) => {
			const handleSubmit = async (e) => {
				e.preventDefault();
				setError("");
				setSubmitLoading(true);

				if (!csrfToken && !authLoading) {
					setError(
						"Security token is not available. Please wait a moment or refresh the page."
					);
					setSubmitLoading(false);
					return;
				}
				if (!email || !password) {
					setError("Please provide email and password.");
					setSubmitLoading(false);
					return;
				}

				try {
					console.log(
						"before sending csrf token to backend csrfToken:",
						csrfToken
					);
					// Use apiClient
					const data = await apiClient(
						"/auth/login", // Endpoint
						{
							// Options
							method: "POST",
							body: { email, password },
						},
						csrfToken // Pass the CSRF token
					);

					console.log("Login successful user data :", data);
					login(data);
				} catch (err) {
					// apiClient should throw an error with a message
					setError(
						err.message || "An unexpected error occurred. Please try again."
					);
					console.error("Login failed:", err);
				} finally {
					setSubmitLoading(false);
				}
			};
			// If JSON parsing fails, try to get text for more context
			const textResponse = await res
				.text()
				.catch(() => "Server returned non-JSON, non-text response.");
			console.error(
				`API Client: Failed to parse JSON for ${method} ${endpoint}. Status: ${res.status}. Response text: ${textResponse}`
			);
			// Re-throw an error that includes status and potentially the text response
			const error = new Error(
				`Server error: ${res.status}. Response: ${textResponse.substring(
					0,
					100
				)}...`
			);
			error.status = res.status;
			error.response = res; // Attach the full response if needed
			throw error;
		});

		if (!res.ok) {
			const errorMessage =
				responseData.message || `API Error: ${res.status} ${res.statusText}`;
			const error = new Error(errorMessage);
			error.status = res.status;
			error.data = responseData; // Attach full error data from API
			console.error(
				`API Client Error: ${method} ${endpoint} failed with status ${res.status}`,
				responseData
			);
			throw error;
		}

		return responseData;
	} catch (error) {
		// Log and re-throw network errors or errors from the try block
		if (error.name === "AbortError") {
			console.error(`API Client: Request to ${endpoint} timed out.`);
		} else if (!error.status) {
			// Likely a network error not caught by res.ok
			console.error(
				`API Client: Network or unexpected error for ${endpoint}`,
				error.message
			);
		}
		// Ensure the error thrown has a message
		throw new Error(error.message || "An unexpected API error occurred.");
	}
};
