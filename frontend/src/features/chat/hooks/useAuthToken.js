// src/hooks/useAuthToken.js
import { useState, useEffect, useCallback } from "react";
import { message } from "antd";


const API_BASE = import.meta.env.VITE_API_URL;
const API_BASE_URL = `/api`;
// Default token refresh interval (4 minutes to refresh before the typical 5-minute expiration)
const DEFAULT_REFRESH_INTERVAL = 4 * 60 * 1000;

export function useAuthToken() {
  const [accessToken, setAccessToken] = useState(
    sessionStorage.getItem("accessToken")
  );
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState(null);

  // Fetch a new token using the refresh token
  const refreshToken = useCallback(async () => {
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.error("No refresh token available");
      setTokenError(new Error("No refresh token available"));
      return false;
    }

    setTokenLoading(true);
    setTokenError(null);

    try {
      const response = await fetch(`/api/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status}`);
      }

      const data = await response.json();

      if (data.access) {
        // Store the new tokens
        sessionStorage.setItem("accessToken", data.access);
        if (data.refresh) {
          sessionStorage.setItem("refreshToken", data.refresh);
        }

        setAccessToken(data.access);
        console.log("🔄 Token refreshed successfully");
        return true;
      } else {
        throw new Error("Invalid response format during token refresh");
      }
    } catch (err) {
      console.error("Token refresh error:", err);
      setTokenError(err);
      message.error("Your session has expired. Please log in again.");
      return false;
    } finally {
      setTokenLoading(false);
    }
  }, []);

  // Logout function to clear tokens
  const logout = useCallback(() => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("username");
    setAccessToken(null);
    window.location.href = "/login"; // Redirect to login
  }, []);

  // Setup token refresh at interval
  useEffect(() => {
    if (!accessToken) return;

    // Decode the token to check expiration (if needed)
    const isTokenExpired = () => {
      try {
        const tokenData = JSON.parse(atob(accessToken.split(".")[1]));
        const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
        return Date.now() >= expiryTime;
      } catch (e) {
        console.error("Error parsing token:", e);
        return true; // Assume expired if we can't parse it
      }
    };

    // Handle token refresh
    const handleTokenRefresh = async () => {
      if (isTokenExpired()) {
        console.log("Token expired, refreshing...");
        const success = await refreshToken();
        if (!success) {
          logout();
        }
      } else {
        console.log("Token still valid, refreshing proactively");
        await refreshToken();
      }
    };

    // Initial check
    if (isTokenExpired()) {
      handleTokenRefresh();
    }

    // Set up interval for token refresh
    const intervalId = setInterval(
      handleTokenRefresh,
      DEFAULT_REFRESH_INTERVAL
    );

    return () => clearInterval(intervalId);
  }, [accessToken, refreshToken, logout]);

  return {
    accessToken,
    refreshToken,
    logout,
    tokenLoading,
    tokenError,
    isAuthenticated: !!accessToken,
  };
}
