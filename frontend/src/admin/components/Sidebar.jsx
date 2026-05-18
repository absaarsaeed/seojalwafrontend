import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Tag,
  FileText,
  Megaphone,
  BarChart3,
  Key,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/adminpanel/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/adminpanel/users', label: 'Users', icon: Users },
  { path: '/adminpanel/pricing', label: 'Pricing', icon: CreditCard },
  { path: '/adminpanel/billing', label: 'Billing', icon: Receipt },
  { path: '/adminpanel/coupons', label: 'Coupons', icon: Tag },
  { path: '/adminpanel/blog', label: 'Blog', icon: FileText },
  { path: '/adminpanel/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/adminpanel/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/adminpanel/api-keys', label: 'API Keys', icon: Key },
  { path: '/adminpanel/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/adminpanel');
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1D9E75] flex items-center justify-center">
            <span className="text-white font-bold text-sm">SJ</span>
          </div>
          <div>
            <span className="font-semibold text-[#1D9E75]">SEO Jalwa</span>
            <span className="text-[#71717A] ml-1 text-sm">Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            data-testid={`sidebar-nav-${item.label.toLowerCase().replace(' ', '-')}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#1D9E75] text-white'
                  : 'text-[#27272A] hover:bg-[#F0F0F0]'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#F0F0F0]">
        <div className="text-xs text-[#71717A] mb-2">Logged in as</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#09090B]">jalwa</span>
          <button
            onClick={handleLogout}
            data-testid="sidebar-logout-btn"
            className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#EF4444] transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg border border-[#F0F0F0] shadow-sm"
        data-testid="sidebar-mobile-toggle"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] flex-shrink-0 bg-white border-r border-[#F0F0F0] h-screen sticky top-0 flex-col">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 w-[240px] bg-white border-r border-[#F0F0F0] h-screen z-40 flex flex-col transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};
