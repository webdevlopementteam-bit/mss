import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const getStoredUser = () => {
  try {
    const data = localStorage.getItem("user");

    if (!data || data === "undefined" || data === "null") {
      return null;
    }

    return JSON.parse(data);
  } catch (err) {
    console.error("Invalid user in localStorage:", err);
    localStorage.removeItem("user");
    return null;
  }
};

const [user, setUser] = useState(getStoredUser);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user); // 🔥 IMPORTANT
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
