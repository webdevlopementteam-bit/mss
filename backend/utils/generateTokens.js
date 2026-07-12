import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

// Admin and regular-customer sessions get differently-named refresh cookies.
// Both the admin panel and the storefront log in through the same /auth/login
// endpoint against the same backend host, so a single shared cookie name would
// let one session's silent-refresh pick up the OTHER session's refresh token
// (e.g. an admin who also has the storefront open in another tab would have
// their refresh silently re-authenticate as that regular customer instead).
export const REFRESH_COOKIE_NAME = "refreshToken";
export const ADMIN_REFRESH_COOKIE_NAME = "adminRefreshToken";

export const setRefreshTokenCookie = (res, token, cookieName = REFRESH_COOKIE_NAME) => {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: "/api/auth",
  });
};

export const clearRefreshTokenCookie = (res, cookieName = REFRESH_COOKIE_NAME) => {
  res.clearCookie(cookieName, { path: "/api/auth" });
};
