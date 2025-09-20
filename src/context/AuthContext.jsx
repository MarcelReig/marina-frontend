import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import AuthContext from "./authContextCore";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = Boolean(token);

  const login = (accessToken, userPayload) => {
    sessionStorage.setItem("token", accessToken);
    setToken(accessToken);
    if (userPayload) {
      sessionStorage.setItem("user", JSON.stringify(userPayload));
      setUser(userPayload);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, isAuthenticated, login, logout }), [token, user, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = { children: PropTypes.node };

// Note: useAuth moved to ./useAuth.js to keep this file component-only for Fast Refresh