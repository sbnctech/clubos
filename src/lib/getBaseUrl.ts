export function getBaseUrl() {
  if (typeof window === "undefined") {
    // Server-side: use environment variable or default to port 3000
    return process.env.BASE_URL ?? "http://localhost:3000";
  }
  return "";
}
