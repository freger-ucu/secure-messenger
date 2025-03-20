import { getTokens, refreshAccessToken } from "./auth";

export const fetchWithToken = async (url, options = {}) => {
  const { accessToken } = getTokens();

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  let response = await fetch(url, { ...options, headers });

  // If the token is expired, refresh it and retry the request
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();
    headers.Authorization = `Bearer ${newAccessToken}`;
    response = await fetch(url, { ...options, headers });
  }

  return response;
};

