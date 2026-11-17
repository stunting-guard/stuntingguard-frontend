/**
 * Service API terpusat untuk StuntingGuard Desa Frontend
 * Menghubungkan antarmuka React ke Express backend REST API
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

/* ------------------------------------------------------------------ */
/* Manajemen Sesi & LocalStorage                                      */
/* ------------------------------------------------------------------ */

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error("Gagal menyimpan token ke localStorage:", err);
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (err) {
    console.error("Gagal menyimpan user ke localStorage:", err);
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error("Gagal membersihkan sesi:", err);
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

/* ------------------------------------------------------------------ */
/* Helper URL Builder                                                 */
/* ------------------------------------------------------------------ */

function buildUrl(endpoint, params = {}) {
  let cleanEndpoint = endpoint;
  // Jika endpoint diawali /api, sesuaikan dengan BASE_URL
  if (cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.slice(5);
  } else if (cleanEndpoint.startsWith("/api")) {
    cleanEndpoint = cleanEndpoint.slice(4);
  }

  const base = BASE_URL.replace(/\/+$/, "");
  const path = cleanEndpoint.replace(/^\/+/, "");
  const url = new URL(`${base}/${path}`);

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.append(key, val);
      }
    });
  }

  return url.toString();
}

/* ------------------------------------------------------------------ */
/* Request Wrapper (Fetch Native)                                     */
/* ------------------------------------------------------------------ */

export async function request(endpoint, options = {}) {
  const { params, headers = {}, body, ...customConfig } = options;
  const token = getToken();

  const defaultHeaders = {
    Accept: "application/json",
  };

  if (!(body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const url = buildUrl(endpoint, params);

  try {
    const response = await fetch(url, config);

    // Tangani 401 Unauthorized: hapus sesi & redirect ke login
    if (response.status === 401) {
      clearSession();
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
      let errMessage = "Sesi telah berakhir. Silakan login kembali.";
      try {
        const errorData = await response.json();
        if (errorData?.message) errMessage = errorData.message;
      } catch {
        // Abaikan parse error
      }
      const error = new Error(errMessage);
      error.status = 401;
      throw error;
    }

    // Parse JSON
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const err = new Error(
        data?.message || `Permintaan gagal dengan status ${response.status}`
      );
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Download Binary Blob (.xlsx / .pdf)                                */
/* ------------------------------------------------------------------ */

export async function downloadBlob(endpoint, customFilename = "") {
  const token = getToken();
  const url = buildUrl(endpoint);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (response.status === 401) {
    clearSession();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Sesi tidak valid untuk mengunduh laporan.");
  }

  if (!response.ok) {
    let message = "Gagal mengunduh berkas laporan.";
    try {
      const errJson = await response.json();
      if (errJson?.message) message = errJson.message;
    } catch {
      // bukan JSON
    }
    throw new Error(message);
  }

  // Ambil nama file dari header Content-Disposition jika ada
  let filename = customFilename;
  if (!filename) {
    const disposition = response.headers.get("content-disposition");
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/);
      if (match && match[1]) filename = match[1];
    }
  }

  if (!filename) {
    filename = `Laporan-StuntingGuard-${Date.now()}`;
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(blobUrl);

  return { success: true, filename, size: blob.size };
}

/* ------------------------------------------------------------------ */
/* Method Shorthands & Helper Auth                                    */
/* ------------------------------------------------------------------ */

export const api = {
  get: (endpoint, params = {}, options = {}) =>
    request(endpoint, { method: "GET", params, ...options }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { method: "POST", body, ...options }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { method: "PUT", body, ...options }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { method: "PATCH", body, ...options }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { method: "DELETE", ...options }),

  downloadBlob,

  // Auth helper
  async login(credentials) {
    const res = await request("/auth/login", {
      method: "POST",
      body: credentials,
    });
    if (res?.data?.token) {
      setToken(res.data.token);
      if (res.data.user) {
        setUser(res.data.user);
      }
    }
    return res;
  },

  async logout() {
    try {
      if (getToken()) {
        await request("/auth/logout", { method: "POST" });
      }
    } catch (err) {
      console.warn("Peringatan saat logout dari server:", err);
    } finally {
      clearSession();
    }
  },

  async getMe() {
    const res = await request("/auth/me", { method: "GET" });
    if (res?.data) {
      setUser(res.data);
    }
    return res;
  },
};

export default api;
