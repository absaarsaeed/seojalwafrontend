import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';

const navLinks = [
  { path: '/features', label: 'Features' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/integrations', label: 'Integrations' },
  { path: '/blog', label: 'Blog' },
  { path: '/about', label: 'About' }
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}
      data-testid="public-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0.5" data-testid="navbar-logo">
            <span className="text-xl font-extrabold text-[#0A0A0A]">SEO</span>
            <span className="text-xl font-extrabold text-[#1D9E75]">Jalwa</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#1D9E75]'
                    : 'text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
                data-testid={`nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-[#6B7280] hover:text-[#0A0A0A]" data-testid="nav-signin">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-full px-5" data-testid="nav-start-free">
                Start free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-[#0A0A0A]"
            data-testid="navbar-mobile-toggle"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-[#F0F0F0]"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block py-2 text-sm font-medium text-[#6B7280] hover:text-[#0A0A0A]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link to="/signup" className="block">
                  <Button className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                    Start free
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
