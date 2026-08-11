import API from "./axios";

export const googleLogin = (idToken) => API.post("/auth/google", { idToken });

export const initiateRegistration = (payload) => API.post("/auth/register/initiate", payload);
export const verifyRegistrationOtp = (payload) => API.post("/auth/register/verify-otp", payload);
export const resendRegistrationOtp = (payload) => API.post("/auth/register/resend-otp", payload);

export const login = (payload) => API.post("/auth/login", payload);

export const forgotPassword = (mobile) => API.post("/auth/forgot-password", { mobile });
export const resendPasswordResetOtp = (mobile) => API.post("/auth/forgot-password/resend-otp", { mobile });
export const verifyResetOtp = (payload) => API.post("/auth/verify-reset-otp", payload);
export const resetPassword = (payload) => API.post("/auth/reset-password", payload);

export const refreshToken = () => API.post("/auth/refresh-token");
export const logout = () => API.post("/auth/logout");
export const getMe = () => API.get("/auth/me");
export const updateProfile = (payload) => API.put("/auth/profile", payload);
