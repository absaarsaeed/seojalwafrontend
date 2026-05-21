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
  clearAll: () => {
    localStorage.removeItem(KEYS.ACCESS);
    localStorage.removeItem(KEYS.REFRESH);
    sessionStorage.removeItem(KEYS.ADMIN);
  },
};

// ---- Global error event bus ------------------------------------------------
// Dispatches a window-level `jalwa:api-error` CustomEvent for cross-cutting
// concerns (toasts on 403/429/5xx/network). UI listens once at app boot.
const emitApiError = (payload) => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jalwa:api-error', { detail: payload }));
    }
  } catch {}
};

// ---- Error type ------------------------------------------------------------

export class ApiError extends Error {
  constructor(message, { status = 0, code = '', data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
    // Convenience: surface validation details directly on the error
    // (backend shape: { details: [{ loc:["body","email"], msg, type, ... }] }).
    this.details = Array.isArray(data?.details) ? data.details : null;
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
      const doFetch =
        (typeof window !== 'undefined' && window.__nativeFetch) || fetch;
      const res = await doFetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      // Read via clone so external fetch wrappers (PostHog, etc.) can't
      // race-consume the stream first.
      let body = null;
      try {
        body = await res.clone().json();
      } catch {
        try { body = await res.json(); } catch {}
      }
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

  // Prefer the un-wrapped native fetch reference captured before any 3rd-party
  // script (e.g. emergent-main.js, PostHog) could monkey-patch window.fetch
  // to consume response bodies for telemetry — that breaks our error handling
  // with "body stream already read". Falls back to the (possibly wrapped)
  // global fetch if the pin is missing.
  const doFetch =
    (typeof window !== 'undefined' && window.__nativeFetch) || fetch;

  let res;
  try {
    res = await doFetch(url, {
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
    const e = new ApiError(err.message || 'Network error', { status: 0, code: 'NETWORK_ERROR' });
    emitApiError({ status: 0, code: 'NETWORK_ERROR', message: 'Network error. Please check your connection.', path });
    throw e;
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

  // Parse body. We read once via .text() and parse JSON ourselves. We try
  // .clone().text() first so that any fetch interceptor (e.g. PostHog) that
  // has already consumed the original stream doesn't break us.
  let text = '';
  try {
    text = await res.text();
  } catch {
    // Body was already read by an interceptor — try once more on a clone.
    try {
      text = await res.clone().text();
    } catch {
      text = '';
    }
  }
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
    const code = body_?.code || '';
    // 403 + LIMIT_REACHED is special — emit a dedicated event so the UI can
    // show an upgrade modal instead of the generic global toast.
    if (res.status === 403 && code === 'LIMIT_REACHED') {
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('jalwa:plan-limit', {
            detail: {
              code,
              status: res.status,
              message: msg,
              ...(body_?.data || {}),
            },
          }));
        }
      } catch {}
    } else if (res.status === 403 || res.status === 429 || res.status >= 500) {
      // Emit cross-cutting toast for the rest.
      emitApiError({ status: res.status, code, message: msg, path });
    }
    throw new ApiError(msg, {
      status: res.status,
      code,
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
  // DELETE with body support.
  delWithBody: (path, body, opts) => request(path, { ...opts, method: 'DELETE', body }),
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
  resetPassword: ({ token, newPassword }) =>
    api.post('/api/auth/reset-password', { token, newPassword }, { auth: 'none' }),
  changePassword: ({ currentPassword, newPassword }) =>
    api.put('/api/user/password', { currentPassword, newPassword }, { auth: 'user' }),
  // Google OAuth — redirect-only. Backend should set redirect params on /auth/google/callback.
  googleStartUrl: () => `${BASE_URL}/api/auth/google`,
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
  verifyConnection: (id) => api.post(`/api/sites/${id}/verify-connection`, {}),
};

// User profile -------------------------------------------------------------
export const userApi = {
  profile: () => api.get('/api/user/profile'),
  updateProfile: (payload) => api.put('/api/user/profile', payload),
  deleteAccount: (payload) => api.delWithBody('/api/user/account', payload),
  activity: () => api.get('/api/user/activity'),
};

// Billing -----------------------------------------------------------------
export const billingApi = {
  subscription: () => api.get('/api/billing/subscription'),
  usage: () => api.get('/api/billing/usage'),
  invoices: () => api.get('/api/billing/invoices'),
  cancel: () => api.post('/api/billing/cancel', {}),
  resume: () => api.post('/api/billing/resume', {}),
};

// Feedback (public) -------------------------------------------------------
export const feedbackApi = {
  submit: (payload) => api.post('/api/feedback', payload, { auth: 'none' }),
};

// Notifications ------------------------------------------------------------
export const notificationsApi = {
  list: (params) => api.get('/api/notifications', { query: params }),
  unreadCount: () => api.get('/api/notifications/unread-count'),
  markRead: (id) => api.post(`/api/notifications/${id}/read`, {}),
  markAllRead: () => api.post('/api/notifications/mark-all-read', {}),
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
  scanJob: (jobId) => api.get(`/api/ai-visibility/scan/${jobId}`),
};

export const articlesApi = {
  list: (params) => api.get('/api/articles', { query: params }),
  get: (id) => api.get(`/api/articles/${id}`),
  calendar: ({ siteId, year, month }) =>
    api.get('/api/articles/calendar', { query: { siteId, year, month } }),
  generate: (payload) => api.post('/api/articles/generate', payload),
  job: (jobId) => api.get(`/api/articles/job/${jobId}`),
  publish: (id, payload) => api.post(`/api/articles/${id}/publish`, payload),
  retry: (id) => api.post(`/api/articles/${id}/retry`, {}),
};

// Search terms (content topics) ------------------------------------------
export const searchTermsApi = {
  list: (siteId) => api.get('/api/search-terms', { query: { siteId } }),
  create: ({ siteId, terms }) => api.post('/api/search-terms', { siteId, terms }),
};

// Public plugin metadata --------------------------------------------------
export const pluginApi = {
  version: () => api.get('/api/plugin/version', { auth: 'none' }),
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
  updateSettings: (payload) => api.put('/api/admin/settings', payload, { auth: 'admin' }),
  // Plugin upload uses multipart/form-data — bypass the JSON helper.
  uploadPlugin: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const doFetch = (typeof window !== 'undefined' && window.__nativeFetch) || fetch;
    const adminToken = tokenStore.getAdmin();
    const res = await doFetch(`${BASE_URL}/api/admin/plugin/upload`, {
      method: 'POST',
      headers: adminToken ? { 'X-Admin-Token': adminToken } : {},
      body: fd,
    });
    let body = null;
    try { body = await res.json(); } catch {}
    if (!res.ok || body?.success === false) {
      throw new ApiError(body?.error || `Upload failed (${res.status})`, {
        status: res.status,
        code: body?.code || '',
        data: body,
      });
    }
    return body?.data || body;
  },

  // Dashboard activity feed
  dashboardActivity: (params) =>
    api.get('/api/admin/dashboard/activity', { auth: 'admin', query: params }),

  // Users — extended
  deleteUser: (id) => api.del(`/api/admin/users/${id}`, { auth: 'admin' }),
  updateUserSubscription: (id, payload) =>
    api.put(`/api/admin/users/${id}/subscription`, payload, { auth: 'admin' }),
  updateUserStatus: (id, payload) =>
    api.put(`/api/admin/users/${id}/status`, payload, { auth: 'admin' }),
  extendTrial: (id, days) =>
    api.post(`/api/admin/users/${id}/extend-trial`, { days }, { auth: 'admin' }),
  addUserNote: (id, note) =>
    api.post(`/api/admin/users/${id}/note`, { note }, { auth: 'admin' }),
  userActivityLog: (id, params) =>
    api.get(`/api/admin/users/${id}/activity-log`, { auth: 'admin', query: params }),

  // Audit log
  auditLog: (params) =>
    api.get('/api/admin/audit-log', { auth: 'admin', query: params }),

  // Email logs
  emails: (params) =>
    api.get('/api/admin/emails', { auth: 'admin', query: params }),
  email: (id) =>
    api.get(`/api/admin/emails/${id}`, { auth: 'admin' }),

  // Email templates
  emailTemplates: () =>
    api.get('/api/admin/email-templates', { auth: 'admin' }),
  emailTemplate: (key) =>
    api.get(`/api/admin/email-templates/${encodeURIComponent(key)}`, { auth: 'admin' }),
  updateEmailTemplate: (key, payload) =>
    api.put(`/api/admin/email-templates/${encodeURIComponent(key)}`, payload, { auth: 'admin' }),
  testEmailTemplate: (key, payload) =>
    api.post(`/api/admin/email-templates/${encodeURIComponent(key)}/test`, payload, { auth: 'admin' }),
  seedEmailTemplates: () =>
    api.post('/api/admin/email-templates/seed', {}, { auth: 'admin' }),

  // Submissions (contact + feedback)
  submissions: (params) =>
    api.get('/api/admin/submissions', { auth: 'admin', query: params }),
  submission: (id) =>
    api.get(`/api/admin/submissions/${id}`, { auth: 'admin' }),
  updateSubmission: (id, payload) =>
    api.put(`/api/admin/submissions/${id}`, payload, { auth: 'admin' }),
  replySubmission: (id, message) =>
    api.post(`/api/admin/submissions/${id}/reply`, { message }, { auth: 'admin' }),

  // AI Insights
  insightsRetention: (force = false) =>
    api.get('/api/admin/insights/retention', { auth: 'admin', query: force ? { force: 'true' } : undefined }),

  // Plugin info
  pluginInfo: () => api.get('/api/admin/plugin/info', { auth: 'admin' }),
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
