import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || "mindbloom_default_secret_key_for_development_32chars";
  return new TextEncoder().encode(secret);
};

/**
 * Signs a payload into an encrypted JWT token.
 *
 * @param {object} payload - Data to embed in the token (e.g. { userId, email })
 * @param {string} expiresIn - Expiration duration (default: "7d")
 * @returns {Promise<string>} Signed JWT string
 */
export async function signToken(payload, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

/**
 * Verifies a JWT token and returns the decoded payload if valid.
 *
 * @param {string} token - JWT token string
 * @returns {Promise<object|null>} Decoded payload or null if invalid/expired
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently logged-in user from the HTTP-only cookie.
 * Usable inside Server Components, Server Actions, and Route Handlers.
 *
 * @returns {Promise<object|null>} Decoded user session payload or null
 */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
