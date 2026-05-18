# SEO Jalwa Admin Panel - PRD

## Original Problem Statement
Build the complete admin panel for SEO Jalwa, a SaaS platform at /adminpanel/ route with:
- Light theme, primary color #1D9E75 (green)
- Font: Inter/Manrope
- 12 pages: Login, Dashboard, Users, User Profile, Pricing, Billing, Coupons, Blog, Announcements, Analytics, API Keys, Settings
- Frontend-only auth (jalwa/jalwaadmin)
- All dummy/static data with localStorage persistence

## User Personas
- **Admin**: Platform owner managing users, pricing, content, and settings

## Core Requirements (Static)
1. Admin authentication with hardcoded credentials
2. Dashboard with metrics and charts
3. User management with search/filter
4. Pricing plan editor
5. Revenue/billing tracking
6. Coupon management
7. Blog post management
8. Announcements system
9. Analytics dashboard
10. API keys configuration
11. System settings

## What's Been Implemented (Jan 2026)

### ✅ Completed Features
1. **Admin Login** - Hardcoded auth (jalwa/jalwaadmin), redirect to dashboard
2. **Dashboard** - 4 metric cards, user signups chart (Recharts), activity feed, plan distribution
3. **Users List** - Table with search, plan/status filters, pagination, view action
4. **User Profile** - 4 tabs (Overview, Usage, Billing, Activity), status toggle, notes, Jalwa Score
5. **Pricing Manager** - 3 editable plan cards, feature limits, feature toggles
6. **Billing** - Revenue chart, transactions table with refund/retry actions
7. **Coupons** - CRUD with inline form, copy/deactivate/delete
8. **Blog Manager** - Posts table with create/edit dialog
9. **Announcements** - Form with preview, history table
10. **Analytics** - 4 metrics, 3 charts (growth, module usage, funnel), feature table
11. **API Keys** - 7 sections (AI, Payments, Email, SEO, Storage, Social, CMS)
12. **Settings** - General, Maintenance mode, Social links, Password change

### Technical Stack
- React with React Router v7
- Tailwind CSS with custom design tokens
- Shadcn/UI components
- Recharts for charts
- Sonner for toast notifications
- localStorage for data persistence

## Prioritized Backlog

### P0 (Must Have) - COMPLETED ✅
- All 12 admin pages
- Navigation and routing
- Data persistence

### P1 (Should Have)
- Real backend integration (MongoDB)
- Actual authentication system
- Real-time data updates

### P2 (Nice to Have)
- Export CSV functionality
- Rich text editor for blog
- Email integration for announcements
- Dark mode toggle

## Test Credentials
- **Admin**: username=jalwa, password=jalwaadmin
