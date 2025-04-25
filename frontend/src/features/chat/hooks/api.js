const API_BASE = process.env.API_URL;
const API_BASE_URL = `http://${API_BASE}/api`;

// This function will be used for authenticated requests
export const fetchWithAuth = async (endpoint, options = {}) => {
  const accessToken = sessionStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("No access token available");
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const fetchOptions = {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 401 Unauthorized - Token might be expired
    if (response.status === 401) {
      // Try to refresh the token
      const refreshSuccess = await refreshAuthToken();

      if (refreshSuccess) {
        // Retry the original request with new token
        const newAccessToken = sessionStorage.getItem("accessToken");
        const retryOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        };

        const retryResponse = await fetch(url, retryOptions);

        if (!retryResponse.ok) {
          throw new Error(
            `Request failed after token refresh: ${retryResponse.status}`
          );
        }

        return retryResponse.json();
      } else {
        // If refresh failed, redirect to login
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("username");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

// Function to refresh the auth token
export const refreshAuthToken = async () => {
  const refreshToken = sessionStorage.getItem("refreshToken");

  if (!refreshToken) {
    console.error("No refresh token available");
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
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

      console.log("🔄 Token refreshed successfully");
      return true;
    } else {
      throw new Error("Invalid response format during token refresh");
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
};
