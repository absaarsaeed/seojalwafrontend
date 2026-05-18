// Dummy data for SEO Jalwa Admin Panel

export const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3OTAxOTk3OHww&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3OTAxOTk3OHww&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3OTAxOTk3OHww&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3OTAxOTk3OHww&ixlib=rb-4.1.0&q=85",
  "https://images.pexels.com/photos/32721690/pexels-photo-32721690.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
];

export const DASHBOARD_METRICS = {
  totalUsers: 2847,
  paidUsers: 1203,
  mrr: 38492,
  churn: 2.3,
  trends: {
    totalUsers: { value: 12.4, up: true },
    paidUsers: { value: 8.2, up: true },
    mrr: { value: 15.7, up: true },
    churn: { value: 0.5, up: false }
  }
};

export const PLAN_DISTRIBUTION = {
  starter: 847,
  growth: 298,
  agency: 58
};

export const USER_SIGNUPS_CHART = [
  { month: 'Jan', users: 180 },
  { month: 'Feb', users: 220 },
  { month: 'Mar', users: 280 },
  { month: 'Apr', users: 320 },
  { month: 'May', users: 390 },
  { month: 'Jun', users: 450 },
  { month: 'Jul', users: 520 },
  { month: 'Aug', users: 610 },
  { month: 'Sep', users: 720 },
  { month: 'Oct', users: 850 },
  { month: 'Nov', users: 980 },
  { month: 'Dec', users: 1120 }
];

export const RECENT_ACTIVITY = [
  { id: 1, type: 'signup', message: 'New signup: ahmed@gmail.com — Growth plan', time: '2 min ago' },
  { id: 2, type: 'upgrade', message: 'Upgrade: sara@domain.com — Starter → Growth', time: '15 min ago' },
  { id: 3, type: 'cancel', message: 'Cancellation: test@email.com', time: '32 min ago' },
  { id: 4, type: 'signup', message: 'New signup: business@co.com — Starter plan', time: '1 hour ago' },
  { id: 5, type: 'signup', message: 'New signup: maria@company.io — Agency plan', time: '2 hours ago' },
  { id: 6, type: 'upgrade', message: 'Upgrade: john@startup.com — Growth → Agency', time: '3 hours ago' },
  { id: 7, type: 'signup', message: 'New signup: alex@tech.co — Growth plan', time: '4 hours ago' },
  { id: 8, type: 'cancel', message: 'Cancellation: temp@user.com', time: '5 hours ago' }
];

export const USERS_LIST = [
  { id: '1', name: 'Ahmed Hassan', email: 'ahmed@gmail.com', plan: 'Growth', status: 'Active', signupDate: '2025-10-15', lastLogin: '2026-01-14', jalwaScore: 87, avatar: AVATARS[0] },
  { id: '2', name: 'Sara Williams', email: 'sara@domain.com', plan: 'Starter', status: 'Active', signupDate: '2025-09-22', lastLogin: '2026-01-13', jalwaScore: 72, avatar: AVATARS[1] },
  { id: '3', name: 'John Smith', email: 'john@startup.com', plan: 'Agency', status: 'Active', signupDate: '2025-08-10', lastLogin: '2026-01-14', jalwaScore: 95, avatar: AVATARS[2] },
  { id: '4', name: 'Maria Garcia', email: 'maria@company.io', plan: 'Growth', status: 'Active', signupDate: '2025-11-05', lastLogin: '2026-01-12', jalwaScore: 68, avatar: AVATARS[3] },
  { id: '5', name: 'Alex Johnson', email: 'alex@tech.co', plan: 'Starter', status: 'Suspended', signupDate: '2025-07-18', lastLogin: '2025-12-20', jalwaScore: 45, avatar: AVATARS[4] },
  { id: '6', name: 'Emma Brown', email: 'emma@brand.net', plan: 'Growth', status: 'Active', signupDate: '2025-06-30', lastLogin: '2026-01-14', jalwaScore: 81, avatar: AVATARS[0] },
  { id: '7', name: 'David Lee', email: 'david@agency.com', plan: 'Agency', status: 'Active', signupDate: '2025-05-12', lastLogin: '2026-01-13', jalwaScore: 92, avatar: AVATARS[1] },
  { id: '8', name: 'Sophie Chen', email: 'sophie@store.co', plan: 'Free', status: 'Active', signupDate: '2025-12-01', lastLogin: '2026-01-10', jalwaScore: 34, avatar: AVATARS[2] },
  { id: '9', name: 'Michael Taylor', email: 'michael@blog.io', plan: 'Starter', status: 'Active', signupDate: '2025-10-28', lastLogin: '2026-01-14', jalwaScore: 76, avatar: AVATARS[3] },
  { id: '10', name: 'Lisa Anderson', email: 'lisa@creative.co', plan: 'Growth', status: 'Active', signupDate: '2025-09-15', lastLogin: '2026-01-11', jalwaScore: 83, avatar: AVATARS[4] },
  { id: '11', name: 'James Wilson', email: 'james@firm.net', plan: 'Starter', status: 'Suspended', signupDate: '2025-04-20', lastLogin: '2025-11-15', jalwaScore: 29, avatar: AVATARS[0] },
  { id: '12', name: 'Olivia Martinez', email: 'olivia@shop.com', plan: 'Free', status: 'Active', signupDate: '2025-11-22', lastLogin: '2026-01-09', jalwaScore: 41, avatar: AVATARS[1] },
  { id: '13', name: 'Daniel Kim', email: 'daniel@dev.io', plan: 'Growth', status: 'Active', signupDate: '2025-08-05', lastLogin: '2026-01-14', jalwaScore: 88, avatar: AVATARS[2] },
  { id: '14', name: 'Ava Thompson', email: 'ava@media.co', plan: 'Agency', status: 'Active', signupDate: '2025-07-01', lastLogin: '2026-01-13', jalwaScore: 91, avatar: AVATARS[3] },
  { id: '15', name: 'Robert Davis', email: 'robert@corp.com', plan: 'Starter', status: 'Active', signupDate: '2025-12-10', lastLogin: '2026-01-08', jalwaScore: 55, avatar: AVATARS[4] }
];

export const USER_DETAIL = {
  id: '1',
  name: 'Ahmed Hassan',
  email: 'ahmed@gmail.com',
  signupDate: '2025-10-15',
  plan: 'Growth',
  status: 'Active',
  jalwaScore: 67,
  nextBillingDate: '2026-02-15',
  avatar: AVATARS[0],
  integrations: ['WordPress', 'Instagram', 'LinkedIn'],
  usage: {
    articles: { used: 23, limit: 30 },
    socialPosts: { used: 47, limit: 50 },
    aiScans: { used: 8, limit: 10 },
    teamSeats: { used: 2, limit: 3 }
  },
  paymentMethod: { type: 'Visa', last4: '4242' },
  billingHistory: [
    { id: 1, date: '2026-01-15', plan: 'Growth', amount: 199, status: 'Paid', invoiceId: 'INV-2026-001' },
    { id: 2, date: '2025-12-15', plan: 'Growth', amount: 199, status: 'Paid', invoiceId: 'INV-2025-012' },
    { id: 3, date: '2025-11-15', plan: 'Growth', amount: 199, status: 'Paid', invoiceId: 'INV-2025-011' },
    { id: 4, date: '2025-10-15', plan: 'Starter', amount: 79, status: 'Paid', invoiceId: 'INV-2025-010' },
    { id: 5, date: '2025-09-15', plan: 'Starter', amount: 79, status: 'Failed', invoiceId: 'INV-2025-009' }
  ],
  monthlyUsage: [
    { month: 'Aug', articles: 12, posts: 25, scans: 5 },
    { month: 'Sep', articles: 18, posts: 32, scans: 7 },
    { month: 'Oct', articles: 20, posts: 38, scans: 8 },
    { month: 'Nov', articles: 22, posts: 42, scans: 9 },
    { month: 'Dec', articles: 25, posts: 45, scans: 10 },
    { month: 'Jan', articles: 23, posts: 47, scans: 8 }
  ],
  activityLog: [
    { id: 1, action: 'Generated article: How to improve SEO in 2026', time: '2 hours ago' },
    { id: 2, action: 'Connected WordPress: myblog.com', time: '1 day ago' },
    { id: 3, action: 'Published post to Instagram', time: '1 day ago' },
    { id: 4, action: 'Logged in from 192.168.1.45', time: '2 days ago' },
    { id: 5, action: 'Generated article: Top 10 content marketing trends', time: '2 days ago' },
    { id: 6, action: 'AI Visibility scan completed', time: '3 days ago' },
    { id: 7, action: 'Scheduled 5 social posts', time: '3 days ago' },
    { id: 8, action: 'Updated brand voice settings', time: '4 days ago' },
    { id: 9, action: 'Exported analytics report', time: '5 days ago' },
    { id: 10, action: 'Logged in from 10.0.0.1', time: '5 days ago' },
    { id: 11, action: 'Generated article: SEO best practices', time: '6 days ago' },
    { id: 12, action: 'Published post to LinkedIn', time: '6 days ago' },
    { id: 13, action: 'Connected Instagram: @mybrand', time: '1 week ago' },
    { id: 14, action: 'Upgraded plan: Starter → Growth', time: '1 week ago' },
    { id: 15, action: 'Completed onboarding wizard', time: '3 months ago' }
  ]
};

export const DEFAULT_PRICING = {
  starter: {
    name: 'Starter',
    monthlyPrice: 79,
    annualPrice: 69,
    description: 'Perfect for individuals and small blogs getting started with AI-powered SEO.',
    limits: {
      articles: 10,
      socialPosts: 30,
      aiScans: 5,
      teamSeats: 1,
      cmsConnections: 2
    },
    features: {
      brandVoice: true,
      competitorComparison: false,
      prioritySupport: false,
      whiteLabel: false
    }
  },
  growth: {
    name: 'Growth',
    monthlyPrice: 199,
    annualPrice: 166,
    description: 'For growing businesses ready to scale their content and visibility.',
    popular: true,
    limits: {
      articles: 30,
      socialPosts: 100,
      aiScans: 20,
      teamSeats: 3,
      cmsConnections: 'unlimited'
    },
    features: {
      brandVoice: true,
      competitorComparison: true,
      prioritySupport: true,
      whiteLabel: false
    }
  },
  agency: {
    name: 'Agency',
    monthlyPrice: 499,
    annualPrice: 416,
    description: 'For agencies and enterprises managing multiple brands and clients.',
    limits: {
      articles: 'unlimited',
      socialPosts: 'unlimited',
      aiScans: 'unlimited',
      teamSeats: 'unlimited',
      cmsConnections: 'unlimited'
    },
    features: {
      brandVoice: true,
      competitorComparison: true,
      prioritySupport: true,
      whiteLabel: true
    }
  }
};

export const REVENUE_CHART = [
  { month: 'Jan', revenue: 28500 },
  { month: 'Feb', revenue: 29800 },
  { month: 'Mar', revenue: 31200 },
  { month: 'Apr', revenue: 32800 },
  { month: 'May', revenue: 33500 },
  { month: 'Jun', revenue: 34200 },
  { month: 'Jul', revenue: 35100 },
  { month: 'Aug', revenue: 35900 },
  { month: 'Sep', revenue: 36800 },
  { month: 'Oct', revenue: 37400 },
  { month: 'Nov', revenue: 37900 },
  { month: 'Dec', revenue: 38492 }
];

export const TRANSACTIONS = [
  { id: 1, date: '2026-01-14', user: 'ahmed@gmail.com', plan: 'Growth', amount: 199, status: 'Paid', invoiceId: 'INV-001' },
  { id: 2, date: '2026-01-14', user: 'john@startup.com', plan: 'Agency', amount: 499, status: 'Paid', invoiceId: 'INV-002' },
  { id: 3, date: '2026-01-13', user: 'sara@domain.com', plan: 'Starter', amount: 79, status: 'Paid', invoiceId: 'INV-003' },
  { id: 4, date: '2026-01-13', user: 'alex@tech.co', plan: 'Growth', amount: 199, status: 'Failed', invoiceId: 'INV-004' },
  { id: 5, date: '2026-01-12', user: 'maria@company.io', plan: 'Growth', amount: 199, status: 'Paid', invoiceId: 'INV-005' },
  { id: 6, date: '2026-01-12', user: 'emma@brand.net', plan: 'Starter', amount: 79, status: 'Refunded', invoiceId: 'INV-006' },
  { id: 7, date: '2026-01-11', user: 'david@agency.com', plan: 'Agency', amount: 499, status: 'Paid', invoiceId: 'INV-007' },
  { id: 8, date: '2026-01-11', user: 'sophie@store.co', plan: 'Starter', amount: 79, status: 'Paid', invoiceId: 'INV-008' },
  { id: 9, date: '2026-01-10', user: 'michael@blog.io', plan: 'Growth', amount: 199, status: 'Failed', invoiceId: 'INV-009' },
  { id: 10, date: '2026-01-10', user: 'lisa@creative.co', plan: 'Growth', amount: 199, status: 'Paid', invoiceId: 'INV-010' },
  { id: 11, date: '2026-01-09', user: 'james@firm.net', plan: 'Starter', amount: 79, status: 'Paid', invoiceId: 'INV-011' },
  { id: 12, date: '2026-01-09', user: 'olivia@shop.com', plan: 'Starter', amount: 79, status: 'Paid', invoiceId: 'INV-012' },
  { id: 13, date: '2026-01-08', user: 'daniel@dev.io', plan: 'Growth', amount: 199, status: 'Paid', invoiceId: 'INV-013' },
  { id: 14, date: '2026-01-08', user: 'ava@media.co', plan: 'Agency', amount: 499, status: 'Paid', invoiceId: 'INV-014' },
  { id: 15, date: '2026-01-07', user: 'robert@corp.com', plan: 'Starter', amount: 79, status: 'Failed', invoiceId: 'INV-015' },
  { id: 16, date: '2026-01-07', user: 'new@user.com', plan: 'Growth', amount: 199, status: 'Paid', invoiceId: 'INV-016' },
  { id: 17, date: '2026-01-06', user: 'test@example.com', plan: 'Starter', amount: 79, status: 'Paid', invoiceId: 'INV-017' },
  { id: 18, date: '2026-01-06', user: 'hello@world.io', plan: 'Agency', amount: 499, status: 'Failed', invoiceId: 'INV-018' },
  { id: 19, date: '2026-01-05', user: 'demo@site.com', plan: 'Growth', amount: 199, status: 'Refunded', invoiceId: 'INV-019' },
  { id: 20, date: '2026-01-05', user: 'contact@biz.net', plan: 'Starter', amount: 79, status: 'Paid', invoiceId: 'INV-020' }
];

export const COUPONS = [
  { id: 1, code: 'JALWA20', type: 'percentage', value: 20, uses: 45, limit: 100, expiry: '2026-03-31', status: 'Active' },
  { id: 2, code: 'WELCOME50', type: 'fixed', value: 50, uses: 120, limit: 200, expiry: '2026-02-28', status: 'Active' },
  { id: 3, code: 'NEWYEAR25', type: 'percentage', value: 25, uses: 89, limit: 100, expiry: '2026-01-31', status: 'Active' },
  { id: 4, code: 'AGENCY100', type: 'fixed', value: 100, uses: 15, limit: 50, expiry: '2026-06-30', status: 'Active' },
  { id: 5, code: 'BLACKFRIDAY', type: 'percentage', value: 40, uses: 200, limit: 200, expiry: '2025-11-30', status: 'Expired' },
  { id: 6, code: 'SUMMER30', type: 'percentage', value: 30, uses: 150, limit: 150, expiry: '2025-08-31', status: 'Expired' },
  { id: 7, code: 'PARTNER15', type: 'percentage', value: 15, uses: 34, limit: null, expiry: null, status: 'Active' },
  { id: 8, code: 'LIFETIME500', type: 'fixed', value: 500, uses: 5, limit: 10, expiry: '2026-12-31', status: 'Active' }
];

export const BLOG_POSTS = [
  { id: 1, title: 'How AI is Revolutionizing SEO in 2026', slug: 'ai-revolutionizing-seo-2026', status: 'Published', date: '2026-01-10', views: 2847 },
  { id: 2, title: 'Complete Guide to Content Marketing', slug: 'content-marketing-guide', status: 'Published', date: '2026-01-05', views: 1923 },
  { id: 3, title: 'Top 10 Social Media Strategies', slug: 'social-media-strategies', status: 'Published', date: '2025-12-28', views: 3421 },
  { id: 4, title: 'Understanding Google Algorithm Updates', slug: 'google-algorithm-updates', status: 'Draft', date: '2026-01-12', views: 0 },
  { id: 5, title: 'Building Your Brand Voice with AI', slug: 'brand-voice-ai', status: 'Published', date: '2025-12-20', views: 1567 },
  { id: 6, title: 'E-commerce SEO Best Practices', slug: 'ecommerce-seo-practices', status: 'Published', date: '2025-12-15', views: 2134 },
  { id: 7, title: 'The Future of Content Creation', slug: 'future-content-creation', status: 'Draft', date: '2026-01-14', views: 0 },
  { id: 8, title: 'Measuring SEO Success: Key Metrics', slug: 'seo-success-metrics', status: 'Published', date: '2025-12-10', views: 1892 },
  { id: 9, title: 'Local SEO Strategies for Small Businesses', slug: 'local-seo-strategies', status: 'Published', date: '2025-12-05', views: 2456 },
  { id: 10, title: 'Link Building in the AI Era', slug: 'link-building-ai-era', status: 'Draft', date: '2026-01-08', views: 0 }
];

export const ANNOUNCEMENTS = [
  { id: 1, subject: 'New Feature: AI Visibility Pulse', target: 'All users', channel: 'Both', date: '2026-01-10', recipients: 2847 },
  { id: 2, subject: 'Scheduled Maintenance Notice', target: 'All users', channel: 'Email', date: '2026-01-05', recipients: 2847 },
  { id: 3, subject: 'Exclusive Offer: Upgrade to Growth', target: 'Starter plan', channel: 'In-app banner', date: '2025-12-28', recipients: 847 },
  { id: 4, subject: 'Agency Features Now Available', target: 'Agency plan', channel: 'Email', date: '2025-12-20', recipients: 58 },
  { id: 5, subject: 'Holiday Schedule Update', target: 'All users', channel: 'Both', date: '2025-12-18', recipients: 2500 }
];

export const ANALYTICS_DATA = {
  pageviews: 124847,
  avgSessionDuration: '4m 32s',
  conversionRate: 3.2,
  mostUsedModule: 'Jalwa Write',
  userGrowth: USER_SIGNUPS_CHART,
  moduleUsage: [
    { module: 'Jalwa Write', usage: 8945 },
    { module: 'Jalwa Publish', usage: 6723 },
    { module: 'Jalwa Post', usage: 5891 },
    { module: 'Jalwa Pulse', usage: 3456 }
  ],
  conversionFunnel: [
    { stage: 'Visitors', count: 45000 },
    { stage: 'Signups', count: 8500 },
    { stage: 'Trial', count: 4200 },
    { stage: 'Paid', count: 1440 }
  ],
  featureUsage: [
    { module: 'Jalwa Write', activeUsers: 1847, avgUsage: 12, topAction: 'Generate Article' },
    { module: 'Jalwa Publish', activeUsers: 1234, avgUsage: 8, topAction: 'Schedule Post' },
    { module: 'Jalwa Post', activeUsers: 987, avgUsage: 15, topAction: 'Create Social Post' },
    { module: 'Jalwa Pulse', activeUsers: 654, avgUsage: 3, topAction: 'Run AI Scan' }
  ]
};

export const API_KEYS_CONFIG = {
  ai: [
    {
      id: 'openai',
      name: 'OpenAI (GPT-4o + DALL-E 3)',
      icon: 'brain',
      description: 'Powers article generation, content suggestions, and image creation.',
      fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }],
      instructions: [
        'Go to platform.openai.com',
        'Navigate to API Keys section',
        'Click "Create new secret key"',
        'Copy and paste the key here'
      ],
      status: 'connected',
      maskedValue: '••••••sk-1234'
    },
    {
      id: 'anthropic',
      name: 'Anthropic (Claude)',
      icon: 'cpu',
      description: 'Alternative AI model for content generation with different writing style.',
      fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }],
      instructions: [
        'Go to console.anthropic.com',
        'Navigate to API Keys',
        'Create a new API key',
        'Copy and paste here'
      ],
      status: 'not_connected'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: 'sparkles',
      description: 'Google AI model for multimodal content understanding.',
      fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }],
      instructions: [
        'Go to aistudio.google.com',
        'Click "Get API Key"',
        'Create a new key or use existing',
        'Copy and paste here'
      ],
      status: 'not_connected'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      icon: 'search',
      description: 'Real-time web search and fact-checking for content accuracy.',
      fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }],
      instructions: [
        'Go to perplexity.ai/settings/api',
        'Generate an API key',
        'Copy and paste here'
      ],
      status: 'not_connected'
    }
  ],
  payments: [
    {
      id: 'lemonsqueezy',
      name: 'LemonSqueezy',
      icon: 'credit-card',
      description: 'Used for subscription billing and payment processing.',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password' },
        { key: 'storeId', label: 'Store ID', type: 'text' },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' }
      ],
      instructions: [
        'Go to app.lemonsqueezy.com',
        'Navigate to Settings → API',
        'Create API key and note your Store ID',
        'Set up webhooks and copy the secret'
      ],
      status: 'not_connected'
    }
  ],
  email: [
    {
      id: 'resend',
      name: 'Resend',
      icon: 'mail',
      description: 'Transactional emails and user notifications.',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password' },
        { key: 'fromEmail', label: 'From Email', type: 'email' }
      ],
      instructions: [
        'Go to resend.com',
        'Navigate to API Keys',
        'Create a new API key',
        'Verify your sending domain'
      ],
      status: 'connected',
      maskedValue: '••••••re_1234'
    }
  ],
  seo: [
    {
      id: 'dataforseo',
      name: 'DataForSEO',
      icon: 'bar-chart',
      description: 'SEO data, keyword research, and SERP tracking.',
      fields: [
        { key: 'email', label: 'Login Email', type: 'email' },
        { key: 'password', label: 'Password', type: 'password' }
      ],
      instructions: [
        'Go to dataforseo.com',
        'Sign up for an account',
        'Find your credentials in the dashboard',
        'Enter your login email and password'
      ],
      status: 'not_connected'
    }
  ],
  storage: [
    {
      id: 'cloudflare-r2',
      name: 'Cloudflare R2',
      icon: 'hard-drive',
      description: 'Object storage for images, media, and file uploads.',
      fields: [
        { key: 'accountId', label: 'Account ID', type: 'text' },
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text' },
        { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password' },
        { key: 'bucketName', label: 'Bucket Name', type: 'text' }
      ],
      instructions: [
        'Go to dash.cloudflare.com',
        'Navigate to R2 → Create bucket',
        'Click "Manage R2 API Tokens"',
        'Create token with read/write permissions'
      ],
      status: 'not_connected'
    }
  ],
  social: [
    {
      id: 'meta',
      name: 'Meta (Instagram + Facebook)',
      icon: 'instagram',
      description: 'Developer app for user social connections.',
      fields: [
        { key: 'appId', label: 'App ID', type: 'text' },
        { key: 'appSecret', label: 'App Secret', type: 'password' }
      ],
      instructions: [
        'Go to developers.facebook.com',
        'Create App → Business type',
        'Add Instagram Graph API product',
        'Submit for App Review (1-4 weeks)'
      ],
      status: 'pending',
      note: 'App Review takes 1-4 weeks. Start immediately.'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: 'linkedin',
      description: 'LinkedIn posting and company page management.',
      fields: [
        { key: 'clientId', label: 'Client ID', type: 'text' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password' }
      ],
      instructions: [
        'Go to linkedin.com/developers',
        'Create a new app',
        'Request posting permissions',
        'Copy Client ID and Secret'
      ],
      status: 'not_connected'
    },
    {
      id: 'twitter',
      name: 'X / Twitter',
      icon: 'twitter',
      description: 'Tweet posting and thread scheduling.',
      fields: [
        { key: 'clientId', label: 'Client ID', type: 'text' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password' }
      ],
      instructions: [
        'Go to developer.twitter.com',
        'Create Project & App',
        'Enable OAuth 2.0',
        'Note: Basic plan required ($100/mo)'
      ],
      status: 'not_connected',
      note: 'Requires Twitter Basic plan ($100/month)'
    },
    {
      id: 'google-oauth',
      name: 'Google OAuth (Search Console + YouTube)',
      icon: 'youtube',
      description: 'Search Console data and YouTube publishing.',
      fields: [
        { key: 'clientId', label: 'Client ID', type: 'text' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password' }
      ],
      instructions: [
        'Go to console.cloud.google.com',
        'Create Project → Credentials',
        'Create OAuth 2.0 Client ID',
        'Enable Search Console API + YouTube Data API v3'
      ],
      status: 'not_connected'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: 'pin',
      description: 'Pinterest pin creation and board management.',
      fields: [
        { key: 'appId', label: 'App ID', type: 'text' },
        { key: 'appSecret', label: 'App Secret', type: 'password' }
      ],
      instructions: [
        'Go to developers.pinterest.com',
        'Navigate to My Apps',
        'Create a new app',
        'Copy App ID and Secret'
      ],
      status: 'not_connected'
    }
  ],
  cms: [
    {
      id: 'webflow',
      name: 'Webflow',
      icon: 'layout',
      description: 'Uses OAuth — no key needed here. Users connect their own Webflow accounts.',
      isOAuth: true
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: 'file-text',
      description: 'Uses OAuth — no key needed here. Users connect their own Notion workspaces.',
      isOAuth: true
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      icon: 'target',
      description: 'Uses OAuth — no key needed here. Users connect their own HubSpot accounts.',
      isOAuth: true
    }
  ]
};

export const SETTINGS_DATA = {
  general: {
    siteName: 'SEO Jalwa',
    siteUrl: 'https://seojalwa.com',
    supportEmail: 'support@seojalwa.com',
    contactEmail: 'hello@seojalwa.com'
  },
  maintenance: {
    enabled: false,
    message: "We'll be back shortly. Scheduled maintenance in progress."
  },
  social: {
    twitter: 'https://twitter.com/seojalwa',
    linkedin: 'https://linkedin.com/company/seojalwa',
    instagram: 'https://instagram.com/seojalwa'
  }
};
