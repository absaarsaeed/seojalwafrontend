# SEO Jalwa - PRD

## Original Problem Statement
Build the complete SEO Jalwa SaaS frontend with TWO domains:

**1. Admin Panel (`/adminpanel/*`)** — 12 pages for platform management
**2. Public Marketing Website (9 pages) + User Dashboard (`/dashboard/*`)**

Design constraints:
- Strict light theme, primary #1D9E75 green
- Syne font for bold headings, Inter for body
- All animations via Framer Motion
- Data persistence via `localStorage` only (no backend)
- Public pricing reads from `seo_jalwa_admin` localStorage key (admin → public bridge)

## User Personas
- **Admin**: Platform owner managing users, pricing, content, settings (`/adminpanel/*`)
- **End User / Customer**: Visits marketing site, signs up, manages SEO/AI visibility from `/dashboard/*`
- **Visitor**: Browses marketing pages, reads blog, contacts sales

## Core Requirements
1. Admin authentication with hardcoded credentials (jalwa/jalwaadmin)
2. Admin: 12 management pages (Dashboard, Users, Pricing, Billing, Coupons, Blog, Announcements, Analytics, API Keys, Settings + Login)
3. Public site: HomePage, Features, Pricing, Integrations, About, Blog list, Blog detail, Contact + 3 legal pages
4. Auth pages: Login, Signup, Forgot Password
5. User Dashboard: Home, Jalwa Pulse, Jalwa Write, Jalwa Publish, Jalwa Post, Settings
6. Protected `/dashboard/*` routes — unauthenticated users redirect to `/login`
7. Admin pricing changes reflect on public `/pricing` page (localStorage bridge)
8. Cookie consent banner with persistence
9. Framer Motion animations throughout public + auth + dashboard

## What's Been Implemented

### ✅ Phase 1: Admin Panel (Jan 2026)
1. **Admin Login** — Hardcoded auth (jalwa/jalwaadmin)
2. **Dashboard** — 4 metric cards, user signups chart (Recharts), activity feed, plan distribution
3. **Users List** — Table with search, plan/status filters, pagination
4. **User Profile** — 4 tabs (Overview, Usage, Billing, Activity), status toggle, notes
5. **Pricing Manager** — 3 editable plan cards → writes to `seo_jalwa_admin.pricing`
6. **Billing** — Revenue chart, transactions table
7. **Coupons** — CRUD with copy/deactivate/delete
8. **Blog Manager** — Posts table with create/edit dialog
9. **Announcements** — Form with preview + history
10. **Analytics** — 4 metrics, 3 charts, feature table
11. **API Keys** — 7 sections
12. **Settings** — General, Maintenance, Social, Password
- Tested: `/app/test_reports/iteration_1.json` — 100% pass

### ✅ Phase 5: Brand assets + SEO meta (Feb 2026)
- **Brand logo** — User-uploaded SEO Jalwa wordmark (`seo-jalwa-logo.png`) + square app icon (`seo-jalwa-icon.png`) live under `/app/frontend/public/`. New shared `Logo`/`LogoIcon` components in `/components/public/Logo.jsx`. Logo image now used in Navbar, Footer (next to copyright), Dashboard sidebar, Login mobile header, Signup mobile header, Forgot Password header. Green side panels in Login/Signup keep the white wordmark text (better contrast on green).
- **Favicons** — Multi-resolution: `favicon.ico` + `favicon-256.png` + `favicon-512.png` (with apple-touch-icon variants).
- **SEO meta on landing page** — `<title>SEO Jalwa — AI-Powered SEO That Publishes Daily, Grows Your Traffic on Autopilot</title>`, comprehensive meta description, keywords, canonical URL, robots/googlebot directives, theme-color #1D9E75. Open Graph (og:type/url/title/description/image 512x512), Twitter Card (summary_large_image with @seojalwa handles). JSON-LD structured data: Organization + WebSite + SoftwareApplication ($79 offer + 4.9★/847 reviews aggregateRating).
- **PWA manifest** rewritten with brand colors + icon set.
- **`robots.txt`** + **`sitemap.xml`** added (root + 9 public pages, disallows /adminpanel + /dashboard).

### ✅ Phase 4: Homepage rebuild + Article View (Feb 2026)
- **Article View** — `/dashboard/auto-publish/article/:id` with premium blog reading layout: action bar (Back / Edit / View Live / Republish), 780px article with meta + 40px Syne title + gradient hero + Key Takeaways box + TOC + 6-section body with 3 green external links + designed dark infographic + YouTube placeholder + dark CTA, sticky right sidebar (Article Performance / SEO Score 78 / Target Keyword / Published to). Wired View Article + Performance "View" links in PublishPage.
- **Homepage rebuild** — 12 sections, conversion-focused, 100% verified (iteration_5):
  1. Hero (Bricolage 3-line headline, browser mockup with calendar + 3 floating cards)
  2. Fear (dark bg, Without/With ChatGPT cards, 3 stats: 67%/3x/319%, CTA Fix My AI Visibility)
  3. Social proof (stars + marquee with Google Search Console)
  4. How It Works (4 steps with dotted line, writing sample preview, agency vs jalwa columns)
  5. Real Results (4 count-up metrics, 3 testimonial cards with industry badges and 5-star rows)
  6. Comparison ($5,000/mo vs $199 — 7-row table, savings card $3,801/mo / $45,612/yr)
  7. AI Mirror (dark, 2s fake loading, score 23/100 red bar)
  8. ROI Calculator (light green bg, 4 sliders, dark right panel)
  9. What You Get (4 detailed module cards: AI Visibility, Daily Article Publishing, Social Autopilot, AI Writer)
  10. Integrations grid (18 brand-logo cards + Open API)
  11. Pricing (Monthly/Annual toggle, 3 plans, Value breakdown ending in green "$3,678/mo savings")
  12. Final dark CTA (Bricolage huge headline "Your Competitors Are Already on Autopilot.")
- Existing localStorage pricing bridge (`seo_jalwa_admin.pricing`) still works on the new homepage.

Tested: `/app/test_reports/iteration_5.json` — 100% pass; testing agent self-applied a 1-line InView `id`-forwarding fix during testing.

### ✅ Phase 3: Multi-site, Analytics, Team & WordPress flow (Feb 2026)
1. **Multi-site support** — `SiteContext` + `SiteSwitcher` in sidebar (above nav). Default sites: myblog.com + mystore.com. Active site persists to `localStorage.jalwa_active_site`. Add-site modal (URL/name/platform). Active-site badge in dashboard topbar.
2. **Auto Publish upgrade** — Full month calendar grid (Sun-Sat, 4-5 rows) with status pills (PUBLISHED / READY TO PUBLISH / SCHEDULED) + clickable article popover (View Article / Edit). 4 stats cards. 'Add Search Terms' dialog with 'Search Terms' + 'Let AI decide' tabs. Recycle Bin collapsible. Performance tab: 4 metric cards + 10-row table.
3. **NEW /dashboard/analytics** — GSC banner (connected state, sync), date-range selector, 4 colored metric cards, full-width Recharts area chart (Impressions+Clicks, 30 days, dual Y-axis), 15-row articles table, Top Search Terms + Top Pages side-by-side lists with position badges.
4. **NEW /dashboard/article-settings** — 10 sections: Publishing Preferences (8 toggles), Article Length (4 radios), Publishing Frequency (5 radios), Writing Language, Global Writing Instructions, Website Information, Location Targeting (conditional city input), Competitors (add/remove, max 5), Business Offerings, Image Preferences. Sticky 'Save All Settings' button.
5. **NEW /dashboard/team** — Invite card (email + per-site checkboxes + billing-access toggle + Send Invitation toast). My Team card with Owner row + empty state.
6. **Connections → Connect Site rename** + 3-step WordPress full-page modal (URL → Install Plugin auto/manual + accordion → API key + Test & Connect with 2s spinner → success screen). Download plugin footer.
7. **DashboardHome 'This week's articles'** — 7-day Mon-Sun strip with status badges and 'View full calendar →' link.
8. **Sidebar (11 items, final)**: Dashboard, Growth Score, AI Visibility, AI Writer, Auto Publish, Analytics, Social Autopilot, Article Settings, Connect Site, Team, Settings.
9. **Public site updates** — HomePage Auto Publish module rewritten ('1 article published every single day') + 4 new bullets; trust line +'1 article/day auto-published' pill; marquee +Google Search Console logo. FeaturesPage Auto Publish +3 bullets (GSC, daily, multi-site); NEW 5th Analytics module section. Subtitle updated to 'Five intelligent modules'.

Tested: `/app/test_reports/iteration_4.json` — 100% pass on all 9 changes.

### ✅ Phase 2: Public Marketing Site + User Dashboard (Feb 2026)
**Public Marketing Pages (`/`)**
- HomePage with hero (**Bricolage Grotesque 800** for the 3 hero lines), AI Mirror Demo, ROI calc, Growth Score showcase, Framer Motion entrance + scroll animations
- FeaturesPage, PricingPage (reads `seo_jalwa_admin.pricing`), IntegrationsPage, AboutPage
- BlogPage (listing) + BlogPostPage (detail with related)
- ContactPage, PrivacyPage, TermsPage, CookiesPage
- Shared PublicLayout: Navbar (sticky, logo, nav, Sign in, Start free), Footer, CookieBanner

**Module naming (final)**
- Jalwa Pulse  → **AI Visibility**     (`/dashboard/ai-visibility`)
- Jalwa Write  → **AI Writer**         (`/dashboard/ai-writer`)
- Jalwa Publish → **Auto Publish**     (`/dashboard/auto-publish`)
- Jalwa Post   → **Social Autopilot**  (`/dashboard/social-autopilot`)
- Jalwa Score  → **Growth Score**      (`/dashboard/growth-score` — standalone page)
- Brand name "SEO Jalwa" / "Jalwa" preserved in logo only.

**Integration logos** — shared `PlatformLogo` component (colored 40x40 brand-square with white letter, Instagram gradient). Used on /integrations grid, homepage marquee, /dashboard/connections.

**Auth Pages**
- LoginPage (split layout: brand panel + form), SignupPage, ForgotPasswordPage
- All redirect to `/dashboard` on success
- `AuthRedirect` wrapper sends logged-in users to `/dashboard`

**User Dashboard (`/dashboard/*`)** — Sidebar order: Dashboard, **Growth Score**, AI Visibility, AI Writer, Auto Publish, Social Autopilot, **Connections** (NEW), Settings
- DashboardLayout with sidebar nav (collapses on mobile), top bar with **dynamic page title**, notifications, avatar menu, logout
- All 8 pages: DashboardHome, GrowthScorePage, PulsePage, WritePage, PublishPage, PostPage, ConnectionsPage, SettingsPage
- Protected via `<Navigate to="/login" replace />` guard inside DashboardLayout
- Logout uses `isLoggingOutRef` to avoid redirect-to-login race
- Legacy routes (/dashboard/pulse, /write, /publish, /post) redirect to new ones

**ConnectionsPage** (`/dashboard/connections`)
- Section A "Connect your website" — 9 platform cards (WordPress, Shopify, Webflow [pre-connected], Ghost, HubSpot, Wix, Squarespace, Notion, Next.js). Each card has method badge (Plugin/OAuth/API Key/Webhook/App) and Connect/Disconnect.
- Per-platform modals: WordPress shows copyable API key `jalwa_live_abc123xyz`; Ghost & Wix have credential input fields; Next.js shows copyable webhook URL + code snippet; others OAuth-style.
- Section B "Connect your social accounts" — 6 platforms (3 pre-connected, 3 disconnected). OAuth modal with platform-brand-colored Connect button.

**Critical localStorage bridge** — verified working:
- Admin Pricing page writes `{pricing: {starter, growth, agency}}` into `seo_jalwa_admin`
- Public PricingPage + UserContext.getPricing() read from same key
- Tested: `/app/test_reports/iteration_2.json` (97%→100% after logout fix), `/app/test_reports/iteration_3.json` (100% on all 5 targeted changes)

### Technical Stack
- React 19 + React Router DOM v7
- Tailwind CSS + Shadcn/UI components
- **Framer Motion** for animations
- **Syne** + Inter fonts (`@fontsource/syne`, `@fontsource/inter`)
- Recharts for analytics charts
- Sonner for toasts
- localStorage for ALL data persistence — no backend

## Architecture
```
/app/frontend/src/
├── App.js                      # All routes (public + auth + dashboard + admin)
├── admin/                      # Phase 1 (admin panel)
├── components/
│   ├── public/                 # Navbar, Footer, CookieBanner, PublicLayout
│   └── dashboard/              # DashboardLayout
├── context/
│   ├── AdminContext.jsx        # writes seo_jalwa_admin
│   └── UserContext.jsx         # reads seo_jalwa_admin.pricing
├── data/
│   ├── dummyData.js            # admin
│   └── publicData.js           # public + dashboard
└── pages/
    ├── public/                 # 8 marketing pages
    ├── auth/                   # Login, Signup, ForgotPassword
    ├── dashboard/              # 6 dashboard pages
    └── legal/                  # Privacy, Terms, Cookies
```

## Prioritized Backlog

### P0 (Must Have) — COMPLETED ✅
- Admin panel (12 pages)
- Public marketing site (11 routes)
- Auth pages (3)
- User dashboard (6 pages)
- localStorage pricing bridge
- Protected routes + AuthRedirect

### P1 (Should Have)
- Real backend (MongoDB + FastAPI)
- Actual authentication (JWT or Emergent Google Auth)
- Real AI visibility tracking integrations (ChatGPT, Perplexity, Gemini APIs)
- Email transactional (SendGrid/Resend) for password reset, signup, billing
- Stripe billing integration

## Phase 6: API Foundation — STEP 0 (Feb 18, 2026)
Frontend connected to external backend at `https://api.seojalwa.com` (DNS pending deploy).

**New files:**
- `src/lib/api.js` — fetch wrapper, JWT + refresh single-flight, ApiError, endpoint helpers (`authApi`, `plansApi`, `adminAuthApi`)
- `src/context/AuthContext.jsx` — real user auth, hydrates from `/api/auth/me`
- `src/context/AdminAuthContext.jsx` — admin auth, token in sessionStorage
- `src/components/RequireAuth.jsx`, `src/components/RequireAdmin.jsx` — route guards

**Refactored (no UI breakage):**
- `src/context/UserContext.jsx` — now a bridge over `AuthProvider`; pricing fetched from `/api/plans`
- `src/admin/context/AdminContext.jsx` — uses `AdminAuthProvider`; preserves all admin local state
- `LoginPage`, `SignupPage`, `AdminLogin` — async submit, real error display

**Endpoints wired (5):**
- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- `GET /api/plans` (public) · `POST /api/admin/auth/login`

**Token storage:** access+refresh in localStorage (user); admin token in sessionStorage.

## Phase 7: Full Wiring — STEPS 1-3 (Feb 18, 2026)

### Discovered API shapes
- **Envelope** (every endpoint): `{ success, data, message?, pagination?, error?, code?, statusCode?, details? }`
- **Register payload**: `{ fullName, email, password }` (note: `fullName` NOT `name`; `website` not accepted)
- **Auth tokens**: `accessToken` / `refreshToken` (camelCase). Refresh uses `{ refreshToken }`.
- **/api/auth/me data**: `{ user, subscription, sites }`
- **/api/plans data**: array of `{ id, name, monthlyPrice, annualPrice (=yearly total), description, articlesPerMonth, ... }`
- **Sites**: `{ id, name, url, platform }` — site creation requires `url` + valid `platform` (wordpress, shopify, ...). Frontend normalizes `url → domain` so legacy code keeps working.

### STEP 1 (Public)
- `BlogPage`, `BlogPostPage` → `GET /api/blog`, `GET /api/blog/:slug` with launch-state fallback to dummy posts
- `ContactPage` → `POST /api/contact { name, email, subject, message }`
- `HomePage` AI Mirror demo → `POST /api/ai-visibility/demo { url }` showing real per-model scores
- `ForgotPasswordPage` → `POST /api/auth/forgot-password { email }`

### STEP 2 (User Dashboard)
- `DashboardHome` → overlay live `/api/growth-score` + `/api/analytics/overview` on header card + metric tiles
- `GrowthScorePage` → live score + history from `/api/growth-score?siteId`
- `PulsePage` (AI Visibility) → `/api/ai-visibility/scans?siteId` + working `POST /api/ai-visibility/scan` button
- `WritePage` (AI Writer) → `POST /api/articles/generate` + `/api/articles?siteId` for library
- `PublishPage` (Auto Publish) → `/api/articles/calendar?siteId&year&month` overlayed onto calendar grid
- `AnalyticsPage` → live metric cards from `/api/analytics/overview`
- `PostPage` (Social Autopilot) → `/api/social/accounts` + `/api/social/posts`
- `TeamPage` → `/api/team` list
- `ConnectionsPage` + `WordPressConnectModal` → creates site via `POST /api/sites` when connection succeeds
- `ArticleViewPage` → `/api/articles/:id` with graceful fallback to demo content
- `ArticleSettingsPage`, `SettingsPage` → no matching backend endpoints discovered; remain mocked with TODOs

### STEP 3 (Admin) — ✅ COMPLETED
- **Auth header**: admin uses `X-Admin-Token` (NOT `Authorization: Bearer`); `api.js` updated accordingly.
- Live admin login: `jalwa` / `jalwaisadmin` → returns `data: { token, expiresAt }`.
- `AdminContext` now hydrates from real API on admin login: coupons, blog posts, announcements, api-keys, settings.
- `Dashboard.jsx` → live `/api/admin/dashboard/stats` (totalUsers, paidUsers, MRR, churn, planDistribution).
- `UsersList.jsx` → live `/api/admin/users` with adapter mapping `fullName`+`subscription` → row shape.
- `Pricing.jsx` → live `/api/admin/plans` with bidirectional mapping (flat API ↔ nested UI), Save persists via `PUT /api/admin/plans/:id`.
- `Coupons`, `Blog`, `Announcements`, `ApiKeys`, `Settings` admin pages → display live data from AdminContext when present; mutations stay local until backend mutation endpoints are explored.
- `Analytics` + `Billing` admin pages remain visual mockups (no matching backend endpoints).

### 🔴 BLOCKERS — RESOLVED on Feb 18, 2026 (later)
1. ✅ **CORS** — fixed (trailing-slash bug); preview origin now allowed.
2. ✅ **Admin credentials** — confirmed `jalwa / jalwaisadmin`.
3. ✅ **Made with Emergent badge** — removed from `public/index.html`.

## Phase 8: Phase-1 Backend Updates Wiring (Feb 19, 2026)

### Discovered live-API quirks
- **Admin auth header**: `X-Admin-Token` (NOT `Authorization: Bearer`).
- **`REACT_APP_BACKEND_URL` is platform-managed** and resets to the preview host — so `lib/api.js` reads `REACT_APP_API_BASE_URL` first and falls back to a hard-coded `https://api.seojalwa.com`.
- **Site platform enum** must be UPPERCASE (`WORDPRESS`, `SHOPIFY`, ...).
- **Sites response** uses `url` → frontend `SiteContext` derives `domain` from URL for legacy components.
- **`/api/admin/api-keys`** currently returns the OLD slim shape `{ key, maskedValue, isActive, testStatus, lastTestedAt }`. Frontend has a `serviceCatalog.js` that merges the slim response with rich client-side metadata (label / section / description / fields / instructions) so the new-shape spec works today and tomorrow.
- **GSC connect** spec'd as `GET /api/analytics/gsc/connect → { authUrl }`; live API answers GET with `405`. `gscApi.connect()` tries GET first and transparently falls back to POST.

### What landed in this phase
1. **Homepage hero rewritten** to the 3-line copy + 4-icon pill row (Daily articles / Social autopilot / AI visibility / Google rankings).
2. **Admin API Keys page completely dynamic** — `ApiKeys.jsx` rebuilt from scratch:
   - Loads `/api/admin/api-keys`; merges with client `serviceCatalog.js` so labels/sections/fields/instructions are always present.
   - Groups cards by section (AI Models / Email / SEO / Storage / Google / Social OAuth / Payments) with section accent bar + count.
   - Each card: colored logo square, status badge (4 states), description, dynamic fields (password show/hide, masked placeholder), collapsible "How to get this key" with steps + platform link + optional note, Save / Test buttons, "Last tested: X ago" relative time auto-updating every 30s.
   - **Save** → `PUT /api/admin/api-keys/{key}` — only sends non-empty fields so existing secrets aren't blanked.
   - **Test connection** → `POST /api/admin/api-keys/{key}/test` — shows latency, updates card status to connected/error.
3. **Article view page** picks up new optional fields: `keyTakeaways`, `faqSchema` (renders FAQ section at the bottom), `estimatedReadTime`, `seoScore` (with red/orange/green ring color), `suggestedTags` (pill row), `metaTitle` + `metaDescription` (preview in SEO sidebar). All null/empty cases hide the corresponding section.
4. **AI Visibility (`PulsePage`)**:
   - Fetches `/api/ai-visibility/latest` for live `overallScore`, `recommendations`, `queries`.
   - Recommendations tab: real difficulty (easy/medium/hard), expected-impact, category badges. "Write an article…" recs get a "Write now →" button linking to the AI Writer. Empty state when backend has no recs.
   - Overview tab: new collapsible "Queries tested" section showing the 20 generated questions.
5. **Analytics page GSC flow**:
   - "Connect Google Search Console" → real OAuth bounce via `GET /api/analytics/gsc/connect` (POST fallback) → `window.location.href = authUrl`.
   - Detect `?connected=true` on mount → green toast + clean URL + refetch.
   - "Sync Now" → `POST /api/analytics/sync` with `siteId` + loading state + refetch.
6. **Brand voice (AI Writer Voice tab)**:
   - On mount: `GET /api/brand-voice?siteId` to hydrate existing profile.
   - "Retrain voice model" → `POST /api/brand-voice/train`; polls `/api/brand-voice/job/{id}` every 3s until completed/failed.
   - Result `profile`: maps `formality / playfulness / technicality` onto the three sliders, shows `tone` description, `writingPersona` as italic blockquote, `characteristicPhrases` as green pills, `thingsToAvoid` as red pills.

### Verified end-to-end
- `/` hero: 3-line headline + 4 pills rendered correctly.
- Admin login → `/api-keys`: 29 services configured across 7 sections, 14 cards visible above fold, OpenAI test connection returned "✓ READY", card status auto-updated to "Connected" + "Last tested: just now".

### P2 (Nice to Have)
- Export CSV from admin
- Rich text editor for blog (TipTap/Lexical)
- Dark mode toggle
- Real-time notifications
- Multi-tenant org support

## Test Credentials
- **Admin**: username=`jalwa`, password=`jalwaadmin`
- **User Dashboard**: any email/password works in dummy mode (e.g., test@jalwa.com / test1234)

## Test Reports
- `/app/test_reports/iteration_1.json` — Admin panel (100% pass)
- `/app/test_reports/iteration_2.json` — Public + Dashboard (97% → 100% after logout fix)
