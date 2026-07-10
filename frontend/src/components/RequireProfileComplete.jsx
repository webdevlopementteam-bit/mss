// src/components/RequireProfileComplete.jsx
// Global gate: forces a logged-in user with an incomplete profile to stay on
// /user-dashboard/profile until they save it. Re-evaluated on every navigation
// (including browser back/forward) since it reads useLocation().

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireProfileComplete = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const mustCompleteProfile =
    user && user.role !== "admin" && user.profileCompleted === false;

  if (mustCompleteProfile && location.pathname !== "/user-dashboard/profile") {
    return <Navigate to="/user-dashboard/profile" replace />;
  }

  return children;
};

export default RequireProfileComplete;
