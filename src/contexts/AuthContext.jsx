/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import axios from "axios";

const REACT_APP_API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const REACT_APP_STORAGE_KEY = import.meta.env.VITE_REACT_APP_STORAGE_KEY;

axios.defaults.baseURL = REACT_APP_API_BASE_URL + "/api";

const AuthContext = createContext();

const ENCRYPTION_KEY =
  REACT_APP_STORAGE_KEY || "your-256-bit-secret-key-must-be-32-chars-long!";

const secureLocalStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(value),
        ENCRYPTION_KEY,
        { keySize: 256 / 8 }
      ).toString();

      try {
        localStorage.setItem(key, encrypted);
      } catch (e) {
        console.warn("LocalStorage blocked, falling back to sessionStorage");
        sessionStorage.setItem(key, encrypted);
      }
    } catch (error) {
      console.error("Secure storage set error:", error);
    }
  },

  getItem: (key) => {
    try {
      let encrypted = localStorage.getItem(key);
      if (!encrypted) encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;

      const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted ? JSON.parse(decrypted) : null;
    } catch (error) {
      console.error("Secure storage get error:", error);
      return null;
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
    sessionStorage.clear();
  },
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    admin: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = secureLocalStorage.getItem("auth_super_token");
        const storedAdmin = secureLocalStorage.getItem("auth_super_admin");

        if (storedToken && storedAdmin) {
          if (isTokenValid(storedToken)) {
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${storedToken}`;

            setAuthState({
              token: storedToken,
              admin: storedAdmin,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            clearAuthData();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuthData();
      } finally {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
    setupAxiosInterceptors();
  }, []);

  const isTokenValid = (token) => {
    if (!token) return false;

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return tokenData.exp > currentTime;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
      (config) => {
        if (authState.token && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${authState.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log("Token expired or invalid, logging out user...");
          await handleTokenExpired();
          return Promise.reject(error);
        }

        if (error.response?.status === 403) {
          console.log("Access forbidden, token might be revoked...");
          await handleTokenExpired();
        }

        return Promise.reject(error);
      }
    );
  };

  const handleTokenExpired = async () => {
    try {
      console.log("Session expired. Please log in again.");
      clearAuthData();
      navigate("/login", {
        replace: true,
        state: { message: "Your session has expired. Please log in again." },
      });
    } catch (error) {
      console.error("Error handling token expiration:", error);
    }
  };

  const login = async (identifier, password) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await axios.post("/admin/auth/login", {
        email: identifier,
        password,
      });

      if (response.data.success) {
        const { admin, token: authToken } = response.data.data;

        secureLocalStorage.setItem("auth_super_token", authToken);
        secureLocalStorage.setItem("auth_super_admin", admin);

        axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

        setAuthState({
          token: authToken,
          admin: admin,
          isAuthenticated: true,
          isLoading: false,
        });

        navigate("/");

        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          error.message ||
          "Login failed";
        return {
          success: false,
          error: errorMessage,
          statusCode: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: "Network error. Please check your connection and try again.",
        };
      } else {
        return {
          success: false,
          error: error.message || "An unexpected error occurred",
        };
      }
    }
  };

  const logout = () => {
    clearAuthData();
    navigate("/login");
  };

  const clearAuthData = () => {
    secureLocalStorage.removeItem("auth_super_token");
    secureLocalStorage.removeItem("auth_super_admin");
    delete axios.defaults.headers.common["Authorization"];
    setAuthState({
      token: null,
      admin: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (userData) => {
    const updatedAdmin = { ...authState.admin, ...userData };
    secureLocalStorage.setItem("auth_super_admin", updatedAdmin);
    setAuthState((prev) => ({
      ...prev,
      admin: updatedAdmin,
    }));
  };

  const hasRole = (roleName) => {
    return authState.admin?.role === roleName;
  };

  const validateToken = () => {
    if (!authState.token || !isTokenValid(authState.token)) {
      handleTokenExpired();
      return false;
    }
    return true;
  };

  const value = {
    ...authState,
    login,
    logout,
    updateUser,
    hasRole,
    validateToken,
    userId: authState.admin?.id,
    userEmail: authState.admin?.email,
    username: authState.admin?.name,
    userRole: authState.admin?.role,
    fullName: authState.admin?.name || "Admin",
    avatar: authState.admin?.avatar,
    user: authState.admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
