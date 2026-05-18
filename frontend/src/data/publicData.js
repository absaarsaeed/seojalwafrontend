// Dummy data for public website and user dashboard

export const DUMMY_BLOG_POSTS = [
  {
    id: 1,
    slug: 'ai-seo-2026-complete-guide',
    title: 'The Complete Guide to AI-Powered SEO in 2026',
    excerpt: 'Everything you need to know about how AI is transforming search engine optimization and what it means for your business.',
    category: 'SEO',
    date: '2026-01-10',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
  },
  {
    id: 2,
    slug: 'chatgpt-brand-mentions',
    title: 'How to Get ChatGPT to Recommend Your Brand',
    excerpt: 'Practical strategies to improve your AI visibility and become the go-to recommendation in your industry.',
    category: 'AI Visibility',
    date: '2026-01-05',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1684163760787-de3063e2f7e2?w=800'
  },
  {
    id: 3,
    slug: 'social-media-automation-guide',
    title: 'Social Media Automation: The Right Way',
    excerpt: 'Automate your social presence without losing authenticity. A complete guide to smart scheduling.',
    category: 'Social Media',
    date: '2025-12-28',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800'
  },
  {
    id: 4,
    slug: 'content-marketing-roi',
    title: 'Measuring Content Marketing ROI in 2026',
    excerpt: 'New metrics and methods for understanding the true value of your content investment.',
    category: 'Content',
    date: '2025-12-20',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
  },
  {
    id: 5,
    slug: 'brand-voice-ai',
    title: 'Creating a Consistent Brand Voice with AI',
    excerpt: 'How to train AI to write in your unique voice while maintaining authenticity and quality.',
    category: 'AI Writing',
    date: '2025-12-15',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
  },
  {
    id: 6,
    slug: 'seo-mistakes-2026',
    title: '10 SEO Mistakes That Will Kill Your Rankings in 2026',
    excerpt: 'Avoid these common pitfalls that are costing businesses their organic traffic.',
    category: 'SEO',
    date: '2025-12-10',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800'
  }
];

export const INTEGRATIONS = [
  { name: 'WordPress', category: 'CMS & Website', method: 'Plugin', description: 'Publish articles directly to your WordPress site with one click.' },
  { name: 'Shopify', category: 'E-commerce', method: 'API Key', description: 'Optimize product descriptions and blog content for your store.' },
  { name: 'Webflow', category: 'CMS & Website', method: 'OAuth', description: 'Push content to your Webflow CMS collections automatically.' },
  { name: 'Ghost', category: 'CMS & Website', method: 'API Key', description: 'Seamless publishing to Ghost blogs with full formatting.' },
  { name: 'HubSpot', category: 'CRM & Sales', method: 'OAuth', description: 'Sync content with HubSpot CMS and track performance.' },
  { name: 'Wix', category: 'CMS & Website', method: 'OAuth', description: 'Publish blog posts to your Wix website.' },
  { name: 'Squarespace', category: 'CMS & Website', method: 'OAuth', description: 'Connect your Squarespace blog for direct publishing.' },
  { name: 'Notion', category: 'Other', method: 'OAuth', description: 'Export content drafts to your Notion workspace.' },
  { name: 'Next.js', category: 'CMS & Website', method: 'API', description: 'Headless CMS integration for Next.js sites.' },
  { name: 'Instagram', category: 'Social Media', method: 'OAuth', description: 'Schedule and publish posts to Instagram Business accounts.' },
  { name: 'Facebook', category: 'Social Media', method: 'OAuth', description: 'Manage your Facebook page posts automatically.' },
  { name: 'LinkedIn', category: 'Social Media', method: 'OAuth', description: 'Publish professional content to LinkedIn profiles and pages.' },
  { name: 'X / Twitter', category: 'Social Media', method: 'OAuth', description: 'Schedule tweets and threads for maximum engagement.' },
  { name: 'Pinterest', category: 'Social Media', method: 'OAuth', description: 'Create and schedule pins with AI-generated images.' },
  { name: 'YouTube', category: 'Social Media', method: 'OAuth', description: 'Manage community posts and video descriptions.' },
  { name: 'Google Search Console', category: 'Other', method: 'OAuth', description: 'Import keyword data and track search performance.' },
  { name: 'Zapier', category: 'Other', method: 'API', description: 'Connect to 5,000+ apps through Zapier workflows.' },
  { name: 'Make', category: 'Other', method: 'API', description: 'Build custom automations with Make (formerly Integromat).' }
];

export const FAQ_DATA = [
  {
    question: 'Do I need all 4 modules?',
    answer: 'No! Each module works independently. Start with what you need most — many users begin with Jalwa Write or Jalwa Post and add more as they grow.'
  },
  {
    question: 'How does the brand voice model work?',
    answer: 'During onboarding, you provide examples of your existing content. Our AI analyzes your tone, vocabulary, and style to create a custom voice model. Everything generated matches your unique brand voice.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All plans include a 14-day free trial with full access to all features. No credit card required to start.'
  },
  {
    question: 'How long does setup take?',
    answer: 'Most users are fully set up in 10-15 minutes. Connect your CMS, link your social accounts, and let the AI learn your brand voice — that\'s it.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. No contracts, no hidden fees. Cancel anytime from your dashboard and you won\'t be charged again.'
  },
  {
    question: 'What CMS platforms are supported?',
    answer: 'We support WordPress, Shopify, Webflow, Ghost, HubSpot, Wix, Squarespace, Notion, and any platform with a REST API. More integrations are added monthly.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use bank-level encryption, never sell your data, and you can export or delete everything at any time. We\'re GDPR compliant.'
  },
  {
    question: 'Do you offer white-label for agencies?',
    answer: 'Yes! The Agency plan includes white-label options. Your clients see your branding, not ours. Contact us for custom enterprise solutions.'
  }
];

export const DASHBOARD_DATA = {
  jalwaScore: 67,
  jalwaScoreChange: 5,
  aiVisibility: 61,
  aiVisibilityChange: 8,
  articlesThisMonth: 8,
  socialPostsScheduled: 24,
  trafficChange: 34,
  recommendations: [
    { id: 1, priority: 'HIGH', text: 'Write article about: Top SEO mistakes 2026', action: 'Write now', link: '/dashboard/write' },
    { id: 2, priority: 'MEDIUM', text: 'Schedule 3 more posts for this week', action: 'Schedule', link: '/dashboard/post' },
    { id: 3, priority: 'LOW', text: 'Your AI visibility dropped on Perplexity this week', action: 'View details', link: '/dashboard/pulse' }
  ],
  recentActivity: [
    { id: 1, icon: 'article', text: 'Published article: "Content Marketing in 2026"', time: '2 hours ago' },
    { id: 2, icon: 'social', text: 'Scheduled 4 posts for next week', time: '5 hours ago' },
    { id: 3, icon: 'scan', text: 'AI visibility scan completed', time: '1 day ago' },
    { id: 4, icon: 'article', text: 'Generated article draft: "SEO Best Practices"', time: '2 days ago' },
    { id: 5, icon: 'social', text: 'Instagram post published automatically', time: '2 days ago' }
  ]
};

export const PULSE_DATA = {
  overallScore: 61,
  lastScanned: '2 hours ago',
  scoreHistory: [
    { week: 'Week 1', score: 34 },
    { week: 'Week 2', score: 38 },
    { week: 'Week 3', score: 42 },
    { week: 'Week 4', score: 48 },
    { week: 'Week 5', score: 52 },
    { week: 'Week 6', score: 55 },
    { week: 'Week 7', score: 58 },
    { week: 'Week 8', score: 61 }
  ],
  aiModels: [
    { name: 'ChatGPT', score: 71, status: 'positive' },
    { name: 'Perplexity', score: 45, status: 'warning' },
    { name: 'Gemini', score: 68, status: 'positive' },
    { name: 'Claude', score: 58, status: 'neutral' },
    { name: 'Copilot', score: 63, status: 'positive' }
  ],
  competitors: [
    { name: 'competitor1.com', score: 78 },
    { name: 'competitor2.com', score: 54 }
  ],
  recommendations: [
    { text: 'Write an article about "Best practices for [your industry]"', difficulty: 'Easy', impact: 12 },
    { text: 'Add FAQ schema markup to your homepage', difficulty: 'Medium', impact: 8 },
    { text: 'Get mentioned on 3 industry-relevant blogs', difficulty: 'Hard', impact: 15 },
    { text: 'Update your About page with more detailed company info', difficulty: 'Easy', impact: 5 },
    { text: 'Create comparison content vs your competitors', difficulty: 'Medium', impact: 10 }
  ]
};

export const WRITE_DATA = {
  voiceTrained: true,
  voiceDescription: 'Professional yet approachable. Clear and direct. Avoids jargon.',
  toneSettings: {
    formalCasual: 40,
    seriousPlayful: 30,
    simpleTechnical: 35
  },
  voiceScore: 84,
  library: [
    { id: 1, type: 'Blog Article', title: '5 SEO Mistakes Killing Your Rankings', date: '2026-01-12', wordCount: 1847 },
    { id: 2, type: 'Email', title: 'Welcome Email Sequence', date: '2026-01-10', wordCount: 456 },
    { id: 3, type: 'Ad Copy', title: 'Facebook Ad - Product Launch', date: '2026-01-08', wordCount: 89 },
    { id: 4, type: 'Blog Article', title: 'Content Marketing ROI Guide', date: '2026-01-05', wordCount: 2103 },
    { id: 5, type: 'Social Caption', title: 'LinkedIn Post - Industry Insights', date: '2026-01-03', wordCount: 234 },
    { id: 6, type: 'Product Description', title: 'Premium Subscription Features', date: '2025-12-28', wordCount: 312 }
  ]
};

export const PUBLISH_DATA = {
  scheduledArticles: [
    { id: 1, title: 'Complete Guide to AI SEO', keyword: 'ai seo guide', cms: 'WordPress', date: '2026-01-20', status: 'Scheduled' },
    { id: 2, title: 'Content Marketing Trends 2026', keyword: 'content marketing trends', cms: 'WordPress', date: '2026-01-25', status: 'Draft' },
    { id: 3, title: 'Social Media Strategy Guide', keyword: 'social media strategy', cms: 'Webflow', date: '2026-01-28', status: 'Scheduled' },
    { id: 4, title: 'Building Brand Authority', keyword: 'brand authority', cms: 'WordPress', date: '2026-02-01', status: 'Draft' },
    { id: 5, title: 'SEO Mistakes to Avoid', keyword: 'seo mistakes', cms: 'Ghost', date: '2026-02-05', status: 'Scheduled' }
  ],
  cmsConnections: [
    { name: 'WordPress', connected: true, site: 'myblog.com', lastPublished: '2026-01-12', articleCount: 23 },
    { name: 'Webflow', connected: true, site: 'mysite.webflow.io', lastPublished: '2026-01-08', articleCount: 8 },
    { name: 'Ghost', connected: false },
    { name: 'HubSpot', connected: false },
    { name: 'Shopify', connected: true, site: 'mystore.myshopify.com', lastPublished: '2025-12-20', articleCount: 12 },
    { name: 'Wix', connected: false },
    { name: 'Squarespace', connected: false },
    { name: 'Notion', connected: false }
  ],
  publishedArticles: [
    { title: 'AI-Powered Content Creation', date: '2026-01-12', cms: 'WordPress', traffic: 1247, ctr: 4.2, position: 8.3, shares: 45, roi: '$312' },
    { title: 'SEO Best Practices 2026', date: '2026-01-08', cms: 'WordPress', traffic: 2341, ctr: 5.1, position: 5.2, shares: 89, roi: '$587' },
    { title: 'Social Media Automation', date: '2026-01-03', cms: 'Webflow', traffic: 876, ctr: 3.8, position: 12.1, shares: 23, roi: '$219' },
    { title: 'Brand Voice Guide', date: '2025-12-28', cms: 'WordPress', traffic: 1532, ctr: 4.5, position: 6.8, shares: 67, roi: '$383' },
    { title: 'Content ROI Metrics', date: '2025-12-20', cms: 'WordPress', traffic: 987, ctr: 3.2, position: 15.4, shares: 34, roi: '$247' },
    { title: 'Marketing Automation Tips', date: '2025-12-15', cms: 'Ghost', traffic: 654, ctr: 2.9, position: 18.7, shares: 12, roi: '$164' },
    { title: 'Email Marketing Guide', date: '2025-12-10', cms: 'WordPress', traffic: 1876, ctr: 4.8, position: 4.5, shares: 78, roi: '$469' },
    { title: 'Keyword Research 101', date: '2025-12-05', cms: 'Shopify', traffic: 543, ctr: 2.7, position: 22.3, shares: 8, roi: '$136' }
  ]
};

export const POST_DATA = {
  socialAccounts: [
    { platform: 'Instagram', connected: true, handle: '@mybrand', followers: 4200, lastPost: '2 days ago' },
    { platform: 'Facebook', connected: true, handle: 'My Brand Page', followers: 12400, lastPost: '1 day ago' },
    { platform: 'LinkedIn', connected: true, handle: 'My Brand', followers: 890, lastPost: '3 days ago' },
    { platform: 'X / Twitter', connected: false },
    { platform: 'Pinterest', connected: false },
    { platform: 'YouTube', connected: false }
  ],
  scheduledPosts: [
    { id: 1, platform: 'Instagram', caption: 'Exciting news coming soon! Stay tuned for our big announcement...', date: '2026-01-16', time: '10:00 AM', status: 'scheduled' },
    { id: 2, platform: 'LinkedIn', caption: 'The future of content marketing is here. Here\'s what we\'ve learned...', date: '2026-01-16', time: '2:00 PM', status: 'scheduled' },
    { id: 3, platform: 'Facebook', caption: 'Happy Friday! Here\'s your weekly dose of marketing tips...', date: '2026-01-17', time: '9:00 AM', status: 'scheduled' },
    { id: 4, platform: 'Instagram', caption: 'Behind the scenes of our creative process...', date: '2026-01-18', time: '12:00 PM', status: 'pending' },
    { id: 5, platform: 'LinkedIn', caption: 'New blog post: 10 SEO trends you can\'t ignore in 2026', date: '2026-01-18', time: '3:00 PM', status: 'pending' },
    { id: 6, platform: 'Facebook', caption: 'Weekend motivation: Your brand deserves to be seen...', date: '2026-01-19', time: '10:00 AM', status: 'pending' }
  ],
  approvalQueue: [
    { id: 1, platform: 'Instagram', caption: 'Introducing our newest feature...', scheduledFor: 'Jan 20, 10:00 AM' },
    { id: 2, platform: 'LinkedIn', caption: 'Thought leadership piece on AI in marketing...', scheduledFor: 'Jan 20, 2:00 PM' },
    { id: 3, platform: 'Facebook', caption: 'Customer success story spotlight...', scheduledFor: 'Jan 21, 9:00 AM' }
  ],
  analytics: {
    totalReach: 47800,
    avgEngagement: 4.2,
    linkClicks: 1247,
    bestPlatform: 'Instagram',
    byPlatform: [
      { platform: 'Instagram', engagement: 5.8, reach: 18400 },
      { platform: 'Facebook', engagement: 3.2, reach: 21200 },
      { platform: 'LinkedIn', engagement: 4.1, reach: 8200 }
    ],
    recentPosts: [
      { platform: 'Instagram', caption: 'New year, new content strategy...', reach: 2340, likes: 187, clicks: 45, date: '2026-01-14' },
      { platform: 'Facebook', caption: 'Check out our latest blog post...', reach: 3120, likes: 89, clicks: 67, date: '2026-01-13' },
      { platform: 'LinkedIn', caption: 'Industry insights: AI and SEO...', reach: 1890, likes: 124, clicks: 89, date: '2026-01-12' },
      { platform: 'Instagram', caption: 'Behind the scenes Monday...', reach: 1567, likes: 201, clicks: 23, date: '2026-01-12' },
      { platform: 'Facebook', caption: 'Happy Monday! Tips for the week...', reach: 2890, likes: 67, clicks: 34, date: '2026-01-11' }
    ]
  }
};

export const SETTINGS_DATA = {
  invoices: [
    { id: 'INV-2026-001', date: '2026-01-01', amount: 199, status: 'Paid' },
    { id: 'INV-2025-012', date: '2025-12-01', amount: 199, status: 'Paid' },
    { id: 'INV-2025-011', date: '2025-11-01', amount: 199, status: 'Paid' },
    { id: 'INV-2025-010', date: '2025-10-01', amount: 199, status: 'Paid' },
    { id: 'INV-2025-009', date: '2025-09-01', amount: 79, status: 'Paid' }
  ],
  usage: {
    articles: { used: 8, limit: 30 },
    socialPosts: { used: 24, limit: 100 },
    aiScans: { used: 3, limit: 20 },
    teamSeats: { used: 1, limit: 3 }
  }
};
