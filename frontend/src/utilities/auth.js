// Save tokens to session storage
export const saveTokens = (accessToken, refreshToken) => {
  sessionStorage.setItem("accessToken", accessToken);
  sessionStorage.setItem("refreshToken", refreshToken);
};

// Get tokens from session storage
export const getTokens = () => {
  return {
    accessToken: sessionStorage.getItem("accessToken"),
    refreshToken: sessionStorage.getItem("refreshToken"),
  };
};

// Clear tokens from session storage (logout)
export const clearTokens = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};

// Refresh the access token using the refresh token
export const refreshAccessToken = async () => {
  const { refreshToken } = getTokens();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("http://127.0.0.1:8000/auth/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to refresh token");
  }

  saveTokens(result.access, result.refresh);
  return result.access;
};
