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

// Public
import { UserProvider, useUser } from "./context/UserContext";
import { SiteProvider } from "./context/SiteContext";
import { PublicLayout } from "./components/public/PublicLayout";
import { HomePage } from "./pages/public/HomePage";
import { FeaturesPage } from "./pages/public/FeaturesPage";
import { PricingPage } from "./pages/public/PricingPage";
import { IntegrationsPage } from "./pages/public/IntegrationsPage";
import { AboutPage } from "./pages/public/AboutPage";
import { BlogPage, BlogPostPage } from "./pages/public/BlogPage";
import { ContactPage } from "./pages/public/ContactPage";
import { PrivacyPage, TermsPage, CookiesPage } from "./pages/legal/LegalPages";

// Auth
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";

// Dashboard
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardHome } from "./pages/dashboard/DashboardHome";
import { GrowthScorePage } from "./pages/dashboard/GrowthScorePage";
import { PulsePage } from "./pages/dashboard/PulsePage";
import { WritePage } from "./pages/dashboard/WritePage";
import { PublishPage } from "./pages/dashboard/PublishPage";
import { AnalyticsPage } from "./pages/dashboard/AnalyticsPage";
import { PostPage } from "./pages/dashboard/PostPage";
import { ArticleSettingsPage } from "./pages/dashboard/ArticleSettingsPage";
import { ConnectionsPage } from "./pages/dashboard/ConnectionsPage";
import { TeamPage } from "./pages/dashboard/TeamPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";

// Redirect authenticated users away from auth pages
const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useUser();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <div className="App">
      <AdminProvider>
        <UserProvider>
          <SiteProvider>
            <BrowserRouter>
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
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
              </Route>

              {/* Auth (no public layout / no navbar) */}
              <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
              <Route path="/signup" element={<AuthRedirect><SignupPage /></AuthRedirect>} />
              <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />

              {/* User Dashboard (DashboardLayout itself enforces auth) */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="growth-score" element={<GrowthScorePage />} />
                <Route path="ai-visibility" element={<PulsePage />} />
                <Route path="ai-writer" element={<WritePage />} />
                <Route path="auto-publish" element={<PublishPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="social-autopilot" element={<PostPage />} />
                <Route path="article-settings" element={<ArticleSettingsPage />} />
                <Route path="connections" element={<ConnectionsPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="settings" element={<SettingsPage />} />
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
