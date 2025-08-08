import crypto from "crypto";

export function generateHashForDate(dateString, salt = "undercone") {
  const hmac = crypto.createHmac("sha256", salt);
  hmac.update(dateString);
  return hmac.digest("hex").slice(0, 6).toUpperCase(); // e.g., "X8R1ZL"
}
