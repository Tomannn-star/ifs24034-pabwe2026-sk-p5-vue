export const BASE_URL = DELCOM_BASEURL;

const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function putAccessToken(token) {
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch (err) {
    console.error("Failed to access localStorage:", err);
  }
}

export function buildUrl(endpoint, params) {
  const url = endpoint.startsWith("http")
    ? new URL(endpoint)
    : new URL(endpoint.replace(/^\//, ""), `${BASE_URL.replace(/\/+$/, "")}/`);

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function fetchApi(endpoint, options = {}) {
  const {
    method = "GET",
    params,
    body,
    headers = {},
    isFormData = false,
  } = options;

  const url = buildUrl(endpoint, params);
  const token = getAccessToken();

  const reqHeaders = { ...headers };

  if (token && !reqHeaders.Authorization && !reqHeaders.authorization) {
    reqHeaders.Authorization = `Bearer ${token}`;
  }

  let reqBody = body;
  const isBodyFormData = isFormData || (typeof FormData !== "undefined" && body instanceof FormData);

  if (body && !isBodyFormData && typeof body === "object") {
    reqHeaders["Content-Type"] = "application/json";
    reqBody = JSON.stringify(body);
  }

  reqHeaders.Accept = reqHeaders.Accept || "application/json";

  const response = await fetch(url, {
    method,
    headers: reqHeaders,
    body: reqBody,
  });

  let responseData;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const message =
      (responseData && typeof responseData === "object" && responseData.message) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.response = responseData;
    throw error;
  }

  return responseData;
}
