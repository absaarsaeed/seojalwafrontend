import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const pageTitles = {
  '/adminpanel/dashboard': 'Dashboard',
  '/adminpanel/users': 'Users',
  '/adminpanel/pricing': 'Pricing & Plans',
  '/adminpanel/billing': 'Billing & Revenue',
  '/adminpanel/coupons': 'Discount Coupons',
  '/adminpanel/blog': 'Blog Manager',
  '/adminpanel/announcements': 'Announcements',
  '/adminpanel/analytics': 'Analytics',
  '/adminpanel/api-keys': 'API Keys',
  '/adminpanel/settings': 'Settings',
};

export const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdmin();

  const getTitle = () => {
    // Check for user profile page
    if (location.pathname.startsWith('/adminpanel/users/') && location.pathname !== '/adminpanel/users') {
      return 'User Profile';
    }
    return pageTitles[location.pathname] || 'Admin Panel';
  };

  const handleLogout = () => {
    logout();
    navigate('/adminpanel');
  };

  return (
    <header className="bg-white border-b border-[#F0F0F0] px-6 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#09090B] lg:ml-0 ml-12" data-testid="topbar-title">
          {getTitle()}
        </h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors"
              data-testid="topbar-avatar-menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#1D9E75] flex items-center justify-center">
                <span className="text-white text-sm font-medium">JA</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex items-center gap-2 text-[#27272A]">
              <User size={16} />
              <span>jalwa</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-[#EF4444] focus:text-[#EF4444]"
              data-testid="topbar-logout-btn"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
