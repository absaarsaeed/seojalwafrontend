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
