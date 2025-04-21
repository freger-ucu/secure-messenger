// src/utils/api.js
const API_BASE_URL = "http://127.0.0.1:8000/api";

export const fetchWithAuth = async (endpoint, options = {}) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const url = `${API_BASE_URL}${endpoint}`;
  const fetchOptions = {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};
