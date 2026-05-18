import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "./admin/context/AdminContext";
import { AdminLayout } from "./admin/components/AdminLayout";
import { AdminLogin } from "./admin/pages/AdminLogin";
import { Dashboard } from "./admin/pages/Dashboard";
import { UsersList } from "./admin/pages/UsersList";
import { UserProfile } from "./admin/pages/UserProfile";
import { Pricing } from "./admin/pages/Pricing";
import { Billing } from "./admin/pages/Billing";
import { Coupons } from "./admin/pages/Coupons";
import { Blog } from "./admin/pages/Blog";
import { Announcements } from "./admin/pages/Announcements";
import { Analytics } from "./admin/pages/Analytics";
import { ApiKeys } from "./admin/pages/ApiKeys";
import { Settings } from "./admin/pages/Settings";

// Home page redirect to admin
const Home = () => {
  return <Navigate to="/adminpanel" replace />;
};

function App() {
  return (
    <div className="App">
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to admin panel */}
            <Route path="/" element={<Home />} />
            
            {/* Admin Login */}
            <Route path="/adminpanel" element={<AdminLogin />} />
            
            {/* Admin Panel Routes */}
            <Route path="/adminpanel" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UsersList />} />
              <Route path="users/:id" element={<UserProfile />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="billing" element={<Billing />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="blog" element={<Blog />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="api-keys" element={<ApiKeys />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch all - redirect to admin */}
            <Route path="*" element={<Navigate to="/adminpanel" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </div>
  );
}

export default App;
