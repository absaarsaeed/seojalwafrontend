/**
 * Client-side fallback catalog for the Admin API Keys page.
 *
 * The Phase-1 backend is moving from a thin shape (`{ key, maskedValue, isActive,
 * testStatus, lastTestedAt }`) to a richer one (`{ key, label, section,
 * description, fields[], instructions, status, last_tested, test_status }`).
 *
 * The frontend renders whichever the backend gives us. When the backend only
 * returns the thin shape, we hydrate label/section/description/fields/instructions
 * from this catalog so the page stays useful today and tomorrow.
 */

export const SERVICE_CATALOG = {
  // ── AI Models ──────────────────────────────────────────────────────────
  openai: {
    label: 'OpenAI (GPT-4o + DALL·E 3)',
    section: 'AI Models',
    description: 'Powers AI Writer article generation, brand voice training, and DALL·E article cover images.',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-proj-...', required: true },
    ],
    instructions: {
      title: 'How to get this key',
      steps: [
        'Visit platform.openai.com and sign in or create an account.',
        'Open the API Keys section under your profile.',
        'Click "Create new secret key", copy the value, and paste it above.',
      ],
      url: 'https://platform.openai.com/api-keys',
      note: 'Make sure your account has GPT-4o + image generation enabled.',
    },
  },
  anthropic: {
    label: 'Anthropic (Claude Sonnet 4.5)',
    section: 'AI Models',
    description: 'Optional fallback writer used when OpenAI is rate-limited or for longer-form content.',
    fields: [{ name: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-ant-...', required: true }],
    instructions: {
      title: 'How to get this key',
      steps: ['Open console.anthropic.com', 'Settings → API Keys → Create Key', 'Paste it here.'],
      url: 'https://console.anthropic.com/settings/keys',
    },
  },
  gemini: {
    label: 'Google Gemini (1.5 Pro)',
    section: 'AI Models',
    description: 'Alternative model used for AI visibility scans and competitor analysis.',
    fields: [{ name: 'api_key', label: 'API Key', type: 'password', placeholder: 'AIza...', required: true }],
    instructions: {
      title: 'How to get this key',
      steps: ['Visit aistudio.google.com', 'Click "Get API key" in the top bar', 'Create an API key and paste it here.'],
      url: 'https://aistudio.google.com/apikey',
    },
  },
  perplexity: {
    label: 'Perplexity AI',
    section: 'AI Models',
    description: 'Used for AI visibility scans on Perplexity-powered answers.',
    fields: [{ name: 'api_key', label: 'API Key', type: 'password', placeholder: 'pplx-...', required: true }],
    instructions: {
      title: 'How to get this key',
      steps: ['Visit perplexity.ai/settings/api', 'Generate a new API key', 'Paste it above.'],
      url: 'https://www.perplexity.ai/settings/api',
    },
  },

  // ── Email ──────────────────────────────────────────────────────────────
  resend: {
    label: 'Resend',
    section: 'Email',
    description: 'Transactional email (signup, password reset, billing notifications).',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 're_...', required: true },
      { name: 'from_email', label: 'From Email', type: 'email', placeholder: 'hello@seojalwa.com', required: true },
    ],
    instructions: {
      title: 'How to get this key',
      steps: ['Sign up at resend.com', 'Verify your sending domain', 'Create an API Key under Settings.'],
      url: 'https://resend.com/api-keys',
    },
  },
  sendgrid: {
    label: 'SendGrid',
    section: 'Email',
    description: 'Alternative provider for transactional + marketing email.',
    fields: [{ name: 'api_key', label: 'API Key', type: 'password', placeholder: 'SG.xxxx...', required: true }],
    instructions: {
      title: 'How to get this key',
      steps: ['Log in to app.sendgrid.com', 'Settings → API Keys → Create API Key (Full Access)', 'Paste it above.'],
      url: 'https://app.sendgrid.com/settings/api_keys',
    },
  },

  // ── SEO & Keywords ─────────────────────────────────────────────────────
  dataforseo: {
    label: 'DataForSEO',
    section: 'SEO & Keywords',
    description: 'Keyword volume, SERP data, and competitor research.',
    fields: [
      { name: 'login', label: 'Login', type: 'text', placeholder: 'login', required: true },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'password', required: true },
    ],
    instructions: {
      title: 'How to get this',
      steps: ['Create an account on dataforseo.com', 'Use the dashboard credentials directly here.'],
      url: 'https://app.dataforseo.com/register',
    },
  },
  ahrefs: {
    label: 'Ahrefs (optional)',
    section: 'SEO & Keywords',
    description: 'Backlink data and richer keyword research (premium).',
    fields: [{ name: 'api_token', label: 'API Token', type: 'password', placeholder: '...', required: true }],
    instructions: {
      title: 'How to get this token',
      steps: ['Log into Ahrefs', 'Account → Integrations → Generate API token.'],
      url: 'https://ahrefs.com/api',
    },
  },

  // ── File Storage ───────────────────────────────────────────────────────
  s3: {
    label: 'AWS S3 (Article Images)',
    section: 'File Storage',
    description: 'Stores generated article cover images and uploaded media.',
    fields: [
      { name: 'access_key_id', label: 'Access Key ID', type: 'text', placeholder: 'AKIA...', required: true },
      { name: 'secret_access_key', label: 'Secret Access Key', type: 'password', placeholder: '...', required: true },
      { name: 'bucket', label: 'Bucket', type: 'text', placeholder: 'seojalwa-articles', required: true },
      { name: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1', required: true },
    ],
    instructions: {
      title: 'How to set up',
      steps: [
        'Create an S3 bucket in your AWS console.',
        'Create an IAM user with PutObject + GetObject permissions to that bucket.',
        'Copy the access key + secret access key here.',
      ],
      url: 'https://s3.console.aws.amazon.com/s3/home',
    },
  },

  // ── Google Services ────────────────────────────────────────────────────
  google_oauth: {
    label: 'Google OAuth (Sign-in + GSC)',
    section: 'Google Services',
    description: 'Required for "Sign in with Google" and Google Search Console analytics.',
    fields: [
      { name: 'client_id', label: 'Client ID', type: 'text', placeholder: '....apps.googleusercontent.com', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'GOCSPX-...', required: true },
    ],
    instructions: {
      title: 'How to create OAuth credentials',
      steps: [
        'Open Google Cloud Console.',
        'Create / select a project.',
        'Enable the Google Search Console API.',
        'OAuth consent screen → Configure (External, app name SEO Jalwa).',
        'Credentials → Create OAuth 2.0 Client ID (Web application).',
        'Add the redirect URI https://api.seojalwa.com/api/analytics/gsc/callback.',
      ],
      url: 'https://console.cloud.google.com/apis/credentials',
    },
  },

  // ── Social Media OAuth ─────────────────────────────────────────────────
  twitter: {
    label: 'X (Twitter) OAuth',
    section: 'Social Media OAuth Apps',
    description: 'Required to schedule and auto-publish posts to X.',
    fields: [
      { name: 'client_id', label: 'Client ID', type: 'text', placeholder: '...', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', placeholder: '...', required: true },
    ],
    instructions: {
      title: 'How to create an X developer app',
      steps: [
        'Go to developer.x.com.',
        'Create a project + app with read+write+offline.access scopes.',
        'Copy the OAuth 2.0 Client ID and Secret here.',
      ],
      url: 'https://developer.x.com/en/portal/dashboard',
    },
  },
  linkedin: {
    label: 'LinkedIn OAuth',
    section: 'Social Media OAuth Apps',
    description: 'Required to post to LinkedIn pages.',
    fields: [
      { name: 'client_id', label: 'Client ID', type: 'text', placeholder: '...', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', placeholder: '...', required: true },
    ],
    instructions: {
      title: 'How to create a LinkedIn app',
      steps: [
        'Go to linkedin.com/developers',
        'Create app → request OAuth scopes w_member_social, openid, profile, email.',
        'Copy the Client ID and Client Secret here.',
      ],
      url: 'https://www.linkedin.com/developers/apps',
    },
  },
  facebook: {
    label: 'Facebook + Instagram OAuth',
    section: 'Social Media OAuth Apps',
    description: 'Required to post to Facebook Pages and Instagram Business accounts.',
    fields: [
      { name: 'app_id', label: 'App ID', type: 'text', placeholder: '...', required: true },
      { name: 'app_secret', label: 'App Secret', type: 'password', placeholder: '...', required: true },
    ],
    instructions: {
      title: 'How to create a Meta app',
      steps: [
        'Go to developers.facebook.com',
        'Create app with Business type → add Facebook Login + Instagram Graph products.',
        'Copy the App ID and App Secret here.',
      ],
      url: 'https://developers.facebook.com/apps',
    },
  },

  // ── Payments ───────────────────────────────────────────────────────────
  stripe: {
    label: 'Stripe',
    section: 'Payments',
    description: 'Subscription billing and one-time charges. Test keys are auto-enabled in dev.',
    fields: [
      { name: 'publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', required: true },
      { name: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
      { name: 'webhook_secret', label: 'Webhook Signing Secret', type: 'password', placeholder: 'whsec_...', required: false },
    ],
    instructions: {
      title: 'How to get your Stripe keys',
      steps: [
        'Open dashboard.stripe.com',
        'Developers → API keys → reveal the Secret Key.',
        'Developers → Webhooks → create endpoint pointing to /api/billing/webhook → copy the signing secret.',
      ],
      url: 'https://dashboard.stripe.com/apikeys',
    },
  },
};

// Section order used by the UI.
export const SECTIONS = [
  'AI Models',
  'Email',
  'SEO & Keywords',
  'File Storage',
  'Google Services',
  'Social Media OAuth Apps',
  'Payments',
];

// Brand colour per section, used for the colored logo square.
export const SECTION_COLORS = {
  'AI Models': '#1D9E75',
  Email: '#2563EB',
  'SEO & Keywords': '#F59E0B',
  'File Storage': '#EF4444',
  'Google Services': '#4285F4',
  'Social Media OAuth Apps': '#8B5CF6',
  Payments: '#635BFF',
};

/**
 * Merge a backend service object with the catalog fallback.
 * Backend fields always win; catalog fills missing display-only fields.
 */
export const adaptService = (apiService) => {
  const key = apiService.key;
  const fallback = SERVICE_CATALOG[key] || {};

  // Field shape adapter — backend may send array, or we use catalog array.
  const fields = (apiService.fields && apiService.fields.length ? apiService.fields : fallback.fields || []).map(
    (f) => ({
      name: f.name,
      label: f.label,
      type: f.type || 'text',
      placeholder: f.placeholder || '',
      required: f.required ?? true,
      value: f.value || '',
      isSet: f.isSet ?? !!f.value,
    }),
  );

  // Status normalisation: prefer backend `status`; else derive from old shape.
  let status = apiService.status;
  if (!status) {
    if (apiService.maskedValue || apiService.isActive) status = 'connected';
    else status = 'not_connected';
  }

  // For the old shape, expose maskedValue as the first field's value if any.
  if (apiService.maskedValue && fields[0] && !fields[0].value) {
    fields[0].value = apiService.maskedValue;
    fields[0].isSet = true;
  }

  // Test status normalisation
  let testStatus = apiService.test_status || apiService.testStatus;
  if (testStatus) testStatus = testStatus.toString().toLowerCase();

  return {
    key,
    label: apiService.label || fallback.label || key,
    section: apiService.section || fallback.section || 'Other',
    description: apiService.description || fallback.description || '',
    fields,
    status,
    last_tested: apiService.last_tested || apiService.lastTestedAt || null,
    test_status: testStatus || 'untested',
    instructions: apiService.instructions || fallback.instructions || null,
  };
};
