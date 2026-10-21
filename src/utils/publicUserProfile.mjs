// Browser UI needs profile fields, never the bearer token returned for native clients.
const PROFILE_FIELDS = ["_id", "id", "username", "email", "isEmailVerified", "profilePictureUrl", "bio", "following", "followers", "settings", "createdAt", "updatedAt"];
export function publicUserProfile(data) {
  if (!data || typeof data !== "object") return null;
  return Object.fromEntries(PROFILE_FIELDS.filter(key => Object.hasOwn(data, key)).map(key => [key, data[key]]));
}
