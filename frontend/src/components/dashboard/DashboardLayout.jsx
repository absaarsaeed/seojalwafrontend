import { NavLink, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Toaster } from 'sonner';
import { 
  LayoutDashboard, Eye, Pen, Send, BarChart3, Settings, CreditCard, 
  LogOut, Bell, ChevronUp, Menu, X
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/pulse', label: 'Jalwa Pulse', icon: Eye },
  { path: '/dashboard/write', label: 'Jalwa Write', icon: Pen },
  { path: '/dashboard/publish', label: 'Jalwa Publish', icon: Send },
  { path: '/dashboard/post', label: 'Jalwa Post', icon: BarChart3 },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  { path: '/dashboard/settings?tab=billing', label: 'Billing', icon: CreditCard }
];

export const DashboardLayout = () => {
  const { isAuthenticated, user, logout } = useUser();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isLoggingOutRef = useRef(false);

  if (!isAuthenticated && !isLoggingOutRef.current) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    isLoggingOutRef.current = true;
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex" data-testid="dashboard-layout">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg border border-[#F0F0F0] shadow-sm"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/20 z-30" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-white border-r border-[#F0F0F0] flex flex-col z-40 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-0.5">
            <span className="text-xl font-extrabold text-[#0A0A0A]">SEO</span>
            <span className="text-xl font-extrabold text-[#1D9E75]">Jalwa</span>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#0A0A0A] truncate">{user?.name || 'User'}</p>
              <span className="inline-block px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">
                {user?.plan || 'Growth'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.slice(0, -1).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E1F5EE] text-[#1D9E75]'
                    : 'text-[#6B7280] hover:bg-[#F0F0F0] hover:text-[#0A0A0A]'
                }`
              }
              data-testid={`dash-nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Upgrade CTA */}
        {user?.plan !== 'Agency' && (
          <div className="p-4 border-t border-[#F0F0F0]">
            <div className="bg-[#E1F5EE] rounded-lg p-4">
              <p className="text-sm font-medium text-[#0A0A0A] mb-2">Upgrade to Agency</p>
              <p className="text-xs text-[#6B7280] mb-3">Unlock unlimited everything</p>
              <Button size="sm" className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-xs">
                <ChevronUp size={14} className="mr-1" />
                Upgrade now
              </Button>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-[#F0F0F0]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#EF4444] transition-colors w-full"
            data-testid="dash-logout-btn"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#F0F0F0] px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between lg:ml-0 ml-12">
            <h1 className="text-lg font-semibold text-[#0A0A0A]" data-testid="dash-page-title">
              Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#1D9E75] rounded-full" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-[#1D9E75] flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-[#EF4444] focus:text-[#EF4444]">
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Toaster position="bottom-right" richColors />
    </div>
  );
};
