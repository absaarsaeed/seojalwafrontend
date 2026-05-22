import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Admin
import { AdminProvider } from "./admin/context/AdminContext";
import { AdminLayout } from "./admin/components/AdminLayout";
import { AdminLogin } from "./admin/pages/AdminLogin";
import { Dashboard as AdminDashboard } from "./admin/pages/Dashboard";
import { UsersList } from "./admin/pages/UsersList";
import { UserProfile } from "./admin/pages/UserProfile";
import { Pricing as AdminPricing } from "./admin/pages/Pricing";
import { Billing } from "./admin/pages/Billing";
import { Coupons } from "./admin/pages/Coupons";
import { Blog as AdminBlog } from "./admin/pages/Blog";
import { Announcements } from "./admin/pages/Announcements";
import { Analytics } from "./admin/pages/Analytics";
import { ApiKeys } from "./admin/pages/ApiKeys";
import { Settings as AdminSettings } from "./admin/pages/Settings";
import { Submissions } from "./admin/pages/Submissions";
import { Emails } from "./admin/pages/Emails";
import { EmailTemplates } from "./admin/pages/EmailTemplates";
import { AuditLog } from "./admin/pages/AuditLog";
import { AdminInsights } from "./admin/pages/AdminInsights";

// Public
import { UserProvider, useUser } from "./context/UserContext";
import { SiteProvider } from "./context/SiteContext";
import { AppErrorListener } from "./components/AppErrorListener";
import { LimitReachedListener } from "./components/LimitReachedListener";
import { SiteAnalysisListener } from "./components/SiteAnalysisListener";
import { PublicLayout } from "./components/public/PublicLayout";
import { HomePage } from "./pages/public/HomePage";
import { FeaturesPage } from "./pages/public/FeaturesPage";
import { PricingPage } from "./pages/public/PricingPage";
import { IntegrationsPage } from "./pages/public/IntegrationsPage";
import { AboutPage } from "./pages/public/AboutPage";
import { BlogPage, BlogPostPage } from "./pages/public/BlogPage";
import { ContactPage } from "./pages/public/ContactPage";
import { FeedbackPage } from "./pages/public/FeedbackPage";
import { PrivacyPage, TermsPage, CookiesPage } from "./pages/legal/LegalPages";

// Auth
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { GoogleCallbackPage } from "./pages/auth/GoogleCallbackPage";

// Onboarding
import { SelectPlanPage } from "./pages/onboarding/SelectPlanPage";
import { CheckoutPage } from "./pages/onboarding/CheckoutPage";

// Dashboard
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DashboardHome } from "./pages/dashboard/DashboardHome";
import { GrowthScorePage } from "./pages/dashboard/GrowthScorePage";
import { PulsePage } from "./pages/dashboard/PulsePage";
import { WritePage } from "./pages/dashboard/WritePage";
import { PublishPage } from "./pages/dashboard/PublishPage";
import { ArticleViewPage } from "./pages/dashboard/ArticleViewPage";
import { AnalyticsPage } from "./pages/dashboard/AnalyticsPage";
import { PostPage } from "./pages/dashboard/PostPage";
import { ArticleSettingsPage } from "./pages/dashboard/ArticleSettingsPage";
import { ConnectionsPage } from "./pages/dashboard/ConnectionsPage";
import { TeamPage } from "./pages/dashboard/TeamPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { NotificationsPage } from "./pages/dashboard/NotificationsPage";

// Redirect authenticated users away from auth pages.
// We honour a one-time `jalwa_post_signup_redirect` localStorage flag so that
// after /signup successfully creates the account (UserContext flips
// isAuthenticated=true), we send the user to plan selection instead of dashboard.
const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useUser();
  if (isAuthenticated) {
    let target = '/dashboard';
    try {
      const stored = localStorage.getItem('jalwa_post_signup_redirect');
      if (stored) {
        target = stored;
        localStorage.removeItem('jalwa_post_signup_redirect');
      }
    } catch {}
    return <Navigate to={target} replace />;
  }
  return children;
};

function App() {
  return (
    <div className="App">
      <AdminProvider>
        <UserProvider>
          <SiteProvider>
            <AppErrorListener />
            <BrowserRouter>
              <LimitReachedListener />
              <SiteAnalysisListener />
            <Routes>
              {/* Public Marketing Site */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
              </Route>

              {/* Auth (no public layout / no navbar) */}
              <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
              <Route path="/signup" element={<AuthRedirect><SignupPage /></AuthRedirect>} />
              <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

              {/* Onboarding */}
              <Route path="/onboarding/select-plan" element={<ErrorBoundary><SelectPlanPage /></ErrorBoundary>} />
              <Route path="/onboarding/checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />

              {/* User Dashboard (DashboardLayout itself enforces auth) */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<ErrorBoundary><DashboardHome /></ErrorBoundary>} />
                <Route path="growth-score" element={<ErrorBoundary><GrowthScorePage /></ErrorBoundary>} />
                <Route path="ai-visibility" element={<ErrorBoundary><PulsePage /></ErrorBoundary>} />
                <Route path="ai-writer" element={<ErrorBoundary><WritePage /></ErrorBoundary>} />
                <Route path="auto-publish" element={<ErrorBoundary><PublishPage /></ErrorBoundary>} />
                <Route path="auto-publish/article/:id" element={<ErrorBoundary><ArticleViewPage /></ErrorBoundary>} />
                <Route path="analytics" element={<ErrorBoundary><AnalyticsPage /></ErrorBoundary>} />
                <Route path="social-autopilot" element={<ErrorBoundary><PostPage /></ErrorBoundary>} />
                <Route path="article-settings" element={<ErrorBoundary><ArticleSettingsPage /></ErrorBoundary>} />
                <Route path="connections" element={<ErrorBoundary><ConnectionsPage /></ErrorBoundary>} />
                <Route path="team" element={<ErrorBoundary><TeamPage /></ErrorBoundary>} />
                <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                <Route path="notifications" element={<ErrorBoundary><NotificationsPage /></ErrorBoundary>} />
                {/* Legacy redirects */}
                <Route path="pulse" element={<Navigate to="/dashboard/ai-visibility" replace />} />
                <Route path="write" element={<Navigate to="/dashboard/ai-writer" replace />} />
                <Route path="publish" element={<Navigate to="/dashboard/auto-publish" replace />} />
                <Route path="post" element={<Navigate to="/dashboard/social-autopilot" replace />} />
              </Route>

              {/* Admin Login */}
              <Route path="/adminpanel" element={<AdminLogin />} />

              {/* Admin Panel */}
              <Route path="/adminpanel" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersList />} />
                <Route path="users/:id" element={<UserProfile />} />
                <Route path="pricing" element={<AdminPricing />} />
                <Route path="billing" element={<Billing />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="api-keys" element={<ApiKeys />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="submissions" element={<Submissions />} />
                <Route path="emails" element={<Emails />} />
                <Route path="email-templates" element={<EmailTemplates />} />
                <Route path="audit-log" element={<AuditLog />} />
                <Route path="insights" element={<AdminInsights />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </BrowserRouter>
          </SiteProvider>
        </UserProvider>
      </AdminProvider>
    </div>
  );
}

export default App;
