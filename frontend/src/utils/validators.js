export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Min 8 chars, at least one uppercase, one lowercase, one digit, one special character.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const isValidMobile = (mobile) => INDIAN_MOBILE_REGEX.test(mobile || "");
export const isValidEmail = (email) => EMAIL_REGEX.test(email || "");
export const isValidPassword = (password) => PASSWORD_REGEX.test(password || "");

export const PASSWORD_HINT =
  "At least 8 characters with uppercase, lowercase, a number and a special character";
