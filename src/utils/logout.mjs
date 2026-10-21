// Keep the server session authoritative: network/HTTP failures are not logout success.
export async function requestLogout({ apiUrl, csrfToken, fetchImpl = fetch }) {
  const headers = { "Content-Type": "application/json" };
  if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  let response;
  try {
    response = await fetchImpl(`${apiUrl}/auth/logout`, {
      method: "POST", headers, credentials: "include",
    });
  } catch {
    throw new Error("Could not log out. Check your connection and try again; your session may still be active.");
  }
  if (!response.ok) {
    throw new Error("Could not log out. Refresh the page and try again; your session may still be active.");
  }
}
