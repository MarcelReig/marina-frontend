import { useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import AuthContext from "./authContextCore";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      // Corrupted session value
      sessionStorage.removeItem("user");
      return null;
    }
  });

  const isAuthenticated = Boolean(token);

  const login = useCallback((accessToken, userPayload) => {
    sessionStorage.setItem("token", accessToken);
    setToken(accessToken);
    if (userPayload) {
      sessionStorage.setItem("user", JSON.stringify(userPayload));
      setUser(userPayload);
    }
  }, []);
  
  // Allow optional refresh token storage (if provided)
  const loginWithRefresh = useCallback((accessToken, refreshToken, userPayload) => {
    sessionStorage.setItem("token", accessToken);
    if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);
    setToken(accessToken);
    if (userPayload) {
      sessionStorage.setItem("user", JSON.stringify(userPayload));
      setUser(userPayload);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ token, user, isAuthenticated, login, loginWithRefresh, logout }), [token, user, isAuthenticated, login, loginWithRefresh, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = { children: PropTypes.node };

// Note: useAuth moved to ./useAuth.js to keep this file component-only for Fast Refresh