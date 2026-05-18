/**
 * SEO Jalwa — API client
 *
 * Robust fetch wrapper with:
 *  - JWT access + refresh token flow for users (localStorage)
 *  - Hardcoded session token for admin (sessionStorage)
 *  - Automatic refresh-on-401 with single-flight queueing
 *  - JSON request/response handling and consistent ApiError
 *
 * Base URL comes from REACT_APP_BACKEND_URL.
 */

const BASE_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');

// ---- Token storage ---------------------------------------------------------

const KEYS = {
  ACCESS: 'jalwa_access_token',
  REFRESH: 'jalwa_refresh_token',
  ADMIN: 'jalwa_admin_token',
};

export const tokenStore = {
  getAccess: () => localStorage.getItem(KEYS.ACCESS),
  getRefresh: () => localStorage.getItem(KEYS.REFRESH),
  setUserTokens: ({ access_token, refresh_token }) => {
    if (access_token) localStorage.setItem(KEYS.ACCESS, access_token);
    if (refresh_token) localStorage.setItem(KEYS.REFRESH, refresh_token);
  },
  clearUser: () => {
    localStorage.removeItem(KEYS.ACCESS);
    localStorage.removeItem(KEYS.REFRESH);
  },

  getAdmin: () => sessionStorage.getItem(KEYS.ADMIN),
  setAdmin: (token) => {
    if (token) sessionStorage.setItem(KEYS.ADMIN, token);
  },
  clearAdmin: () => {
    sessionStorage.removeItem(KEYS.ADMIN);
  },
};

// ---- Error type ------------------------------------------------------------

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ---- Refresh single-flight -------------------------------------------------

let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refresh = tokenStore.getRefresh();
  if (!refresh) throw new ApiError('No refresh token', { status: 401 });

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) {
        tokenStore.clearUser();
        throw new ApiError('Refresh failed', { status: res.status });
      }
      const data = await res.json();
      tokenStore.setUserTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token || refresh,
      });
      return data.access_token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---- Core request ----------------------------------------------------------

/**
 * @param {string} path - e.g. "/api/auth/login"
 * @param {object} opts
 *   - method: GET | POST | PUT | PATCH | DELETE
 *   - body: any JSON-serialisable value (auto-stringified)
 *   - auth: 'user' | 'admin' | 'none' (default: 'user' for protected calls; pass 'none' for public)
 *   - headers: extra headers
 *   - _retry: internal, marks a request that has already attempted refresh
 */
async function request(path, opts = {}) {
  const {
    method = 'GET',
    body,
    auth = 'user',
    headers: extraHeaders = {},
    _retry = false,
  } = opts;

  const headers = { Accept: 'application/json', ...extraHeaders };

  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth === 'user') {
    const access = tokenStore.getAccess();
    if (access) headers['Authorization'] = `Bearer ${access}`;
  } else if (auth === 'admin') {
    const adminToken = tokenStore.getAdmin();
    if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
          ? body
          : JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(err.message || 'Network error', { status: 0 });
  }

  // Handle 401 with refresh (only for user-authed calls, only once)
  if (res.status === 401 && auth === 'user' && !_retry && tokenStore.getRefresh()) {
    try {
      await refreshAccessToken();
      return request(path, { ...opts, _retry: true });
    } catch {
      tokenStore.clearUser();
      throw new ApiError('Session expired', { status: 401 });
    }
  }

  // Parse body
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, { status: res.status, data });
  }

  return data;
}

// ---- Convenience methods ---------------------------------------------------

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

// ---- Endpoint wrappers (STEP 0 — 5 endpoints) ------------------------------

export const authApi = {
  register: (payload) =>
    api.post('/api/auth/register', payload, { auth: 'none' }),
  login: (payload) =>
    api.post('/api/auth/login', payload, { auth: 'none' }),
  me: () => api.get('/api/auth/me', { auth: 'user' }),
};

export const plansApi = {
  list: () => api.get('/api/plans', { auth: 'none' }),
};

export const adminAuthApi = {
  login: (payload) =>
    api.post('/api/admin/auth/login', payload, { auth: 'none' }),
};

export default api;
