import API from "./axios";

export const googleLogin = (idToken) => API.post("/auth/google", { idToken });
export const signup = (payload) => API.post("/auth/signup", payload);
export const verifyEmailOtp = (payload) => API.post("/auth/verify-email-otp", payload);
export const resendOtp = (payload) => API.post("/auth/resend-otp", payload);
export const login = (payload) => API.post("/auth/login", payload);
export const forgotPassword = (email) => API.post("/auth/forgot-password", { email });
export const verifyResetOtp = (payload) => API.post("/auth/verify-reset-otp", payload);
export const resetPassword = (payload) => API.post("/auth/reset-password", payload);
export const refreshToken = () => API.post("/auth/refresh-token");
export const logout = () => API.post("/auth/logout");
export const getMe = () => API.get("/auth/me");
export const updateProfile = (payload) => API.put("/auth/profile", payload);
