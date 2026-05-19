/**
 * SEO Jalwa — API client (v2, envelope-aware)
 *
 * Backend always returns:
 *   success:  { success: true,  data: any, message?: string, pagination?: {...} }
 *   failure:  { success: false, error: string, code: string, statusCode: number, details?: [] }
 *
 * `request()` returns `data` directly on success. When pagination is present,
 * it's attached as a `.pagination` property on the returned object/array.
 * On failure (HTTP non-2xx or success:false), throws ApiError.
 *
 * Token storage:
 *   - User:  access + refresh in localStorage  (keys: jalwa_access_token, jalwa_refresh_token)
 *   - Admin: token in sessionStorage           (key:  jalwa_admin_token)
 *
 * 401 on user-authed requests triggers a single-flight refresh + retry.
 */

const BASE_URL = (
  process.env.REACT_APP_API_BASE_URL ||
  // Production external backend. REACT_APP_BACKEND_URL is reserved by the
  // Emergent platform and points to the preview host, which has no /api routes —
  // so we prefer REACT_APP_API_BASE_URL when present, falling back to the
  // known SEO Jalwa Railway deployment.
  'https://api.seojalwa.com'
).replace(/\/$/, '');

// ---- Token storage ---------------------------------------------------------

const KEYS = {
  ACCESS: 'jalwa_access_token',
  REFRESH: 'jalwa_refresh_token',
  ADMIN: 'jalwa_admin_token',
};

export const tokenStore = {
  getAccess: () => localStorage.getItem(KEYS.ACCESS),
  getRefresh: () => localStorage.getItem(KEYS.REFRESH),
  setUserTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem(KEYS.ACCESS, accessToken);
    if (refreshToken) localStorage.setItem(KEYS.REFRESH, refreshToken);
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
  constructor(message, { status = 0, code = '', data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

// ---- Refresh single-flight -------------------------------------------------

let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new ApiError('No refresh token', { status: 401 });

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        tokenStore.clearUser();
        throw new ApiError(body?.error || 'Refresh failed', { status: res.status });
      }
      const data = body.data || {};
      tokenStore.setUserTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
      });
      return data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---- Core request ----------------------------------------------------------

async function request(path, opts = {}) {
  const {
    method = 'GET',
    body,
    query,
    auth = 'user', // 'user' | 'admin' | 'none'
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
    if (adminToken) headers['X-Admin-Token'] = adminToken;
  }

  // Build URL with query string
  let url = `${BASE_URL}${path}`;
  if (query && typeof query === 'object') {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const s = qs.toString();
    if (s) url += (url.includes('?') ? '&' : '?') + s;
  }

  let res;
  try {
    res = await fetch(url, {
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

  // Auto-refresh on 401 for user-authed calls
  if (res.status === 401 && auth === 'user' && !_retry && tokenStore.getRefresh()) {
    try {
      await refreshAccessToken();
      return request(path, { ...opts, _retry: true });
    } catch {
      tokenStore.clearUser();
      throw new ApiError('Session expired', { status: 401, code: 'SESSION_EXPIRED' });
    }
  }

  // Parse body
  const text = await res.text();
  let body_ = null;
  if (text) {
    try {
      body_ = JSON.parse(text);
    } catch {
      body_ = text;
    }
  }

  if (!res.ok) {
    const msg =
      (body_ && (body_.error || body_.detail || body_.message)) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, {
      status: res.status,
      code: body_?.code || '',
      data: body_,
    });
  }

  // Envelope handling
  if (body_ && typeof body_ === 'object' && 'success' in body_) {
    if (body_.success === false) {
      throw new ApiError(body_.error || 'Request failed', {
        status: res.status,
        code: body_.code || '',
        data: body_,
      });
    }
    const data = body_.data;
    if (body_.pagination && data && typeof data === 'object') {
      try {
        // Attach pagination as a property without mutating shape semantics.
        Object.defineProperty(data, 'pagination', {
          value: body_.pagination,
          enumerable: false,
        });
      } catch {
        // ignore (e.g., frozen)
      }
    }
    return data;
  }

  return body_;
}

// ---- Convenience methods ---------------------------------------------------

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

// ---------------------------------------------------------------------------
// Endpoint wrappers — discovered API surface
// ---------------------------------------------------------------------------

export const authApi = {
  register: (payload) => api.post('/api/auth/register', payload, { auth: 'none' }),
  login: (payload) => api.post('/api/auth/login', payload, { auth: 'none' }),
  me: () => api.get('/api/auth/me', { auth: 'user' }),
  logout: () => api.post('/api/auth/logout', {}, { auth: 'user' }),
  forgotPassword: (email) =>
    api.post('/api/auth/forgot-password', { email }, { auth: 'none' }),
};

export const plansApi = {
  list: () => api.get('/api/plans', { auth: 'none' }),
};

export const adminAuthApi = {
  login: (payload) =>
    api.post('/api/admin/auth/login', payload, { auth: 'none' }),
};

// Public — STEP 1 ----------------------------------------------------------
export const publicApi = {
  blogList: (params = {}) => api.get('/api/blog', { auth: 'none', query: params }),
  blogPost: (slug) => api.get(`/api/blog/${encodeURIComponent(slug)}`, { auth: 'none' }),
  contact: (payload) => api.post('/api/contact', payload, { auth: 'none' }),
  aiMirrorDemo: (url) => api.post('/api/ai-visibility/demo', { url }, { auth: 'none' }),
};

// Sites --------------------------------------------------------------------
export const sitesApi = {
  list: () => api.get('/api/sites'),
  create: (payload) => api.post('/api/sites', payload),
  get: (id) => api.get(`/api/sites/${id}`),
  update: (id, payload) => api.put(`/api/sites/${id}`, payload),
  remove: (id) => api.del(`/api/sites/${id}`),
};

// Dashboard ----------------------------------------------------------------
export const growthApi = {
  get: (siteId) => api.get('/api/growth-score', { query: { siteId } }),
};

export const analyticsApi = {
  overview: (siteId, range = '30d') =>
    api.get('/api/analytics/overview', { query: { siteId, range } }),
};

export const aiVisibilityApi = {
  scans: (siteId) => api.get('/api/ai-visibility/scans', { query: { siteId } }),
  scan: (payload) => api.post('/api/ai-visibility/scan', payload),
};

export const articlesApi = {
  list: (params) => api.get('/api/articles', { query: params }),
  get: (id) => api.get(`/api/articles/${id}`),
  calendar: ({ siteId, year, month }) =>
    api.get('/api/articles/calendar', { query: { siteId, year, month } }),
  generate: (payload) => api.post('/api/articles/generate', payload),
};

export const socialApi = {
  accounts: () => api.get('/api/social/accounts'),
  posts: (params = {}) => api.get('/api/social/posts', { query: params }),
};

export const teamApi = {
  list: () => api.get('/api/team'),
};

// Admin --------------------------------------------------------------------
export const adminApi = {
  dashboardStats: () => api.get('/api/admin/dashboard/stats', { auth: 'admin' }),
  users: (params) => api.get('/api/admin/users', { auth: 'admin', query: params }),
  user: (id) => api.get(`/api/admin/users/${id}`, { auth: 'admin' }),
  plans: () => api.get('/api/admin/plans', { auth: 'admin' }),
  updatePlan: (id, payload) =>
    api.put(`/api/admin/plans/${id}`, payload, { auth: 'admin' }),
  coupons: () => api.get('/api/admin/coupons', { auth: 'admin' }),
  blog: () => api.get('/api/admin/blog', { auth: 'admin' }),
  announcements: () => api.get('/api/admin/announcements', { auth: 'admin' }),
  apiKeys: () => api.get('/api/admin/api-keys', { auth: 'admin' }),
  updateApiKey: (key, fields) => {
    // Send both shapes so this works against the old backend (expects `value`)
    // and the new backend (expects `fields`).
    const body = {
      fields,
      value: fields?.api_key ?? Object.values(fields || {})[0],
    };
    return api.put(`/api/admin/api-keys/${encodeURIComponent(key)}`, body, { auth: 'admin' });
  },
  testApiKey: (key) =>
    api.post(`/api/admin/api-keys/${encodeURIComponent(key)}/test`, {}, { auth: 'admin' }),
  settings: () => api.get('/api/admin/settings', { auth: 'admin' }),
};

// AI Visibility (extended) -------------------------------------------------
export const aiVisibilityLatestApi = {
  latest: (siteId) => api.get('/api/ai-visibility/latest', { query: { siteId } }),
};

// Analytics — Google Search Console ----------------------------------------
export const gscApi = {
  // Spec: GET /api/analytics/gsc/connect → { authUrl }. Falls back to POST if GET unavailable.
  connect: async () => {
    try {
      return await api.get('/api/analytics/gsc/connect');
    } catch (err) {
      if (err.status === 405) {
        return api.post('/api/analytics/gsc/connect', {});
      }
      throw err;
    }
  },
  sync: (siteId) => api.post('/api/analytics/sync', { siteId }),
};

// Brand voice --------------------------------------------------------------
export const brandVoiceApi = {
  train: (payload) => api.post('/api/brand-voice/train', payload),
  job: (jobId) => api.get(`/api/brand-voice/job/${jobId}`),
  get: (siteId) => api.get('/api/brand-voice', { query: { siteId } }),
};

export default api;
