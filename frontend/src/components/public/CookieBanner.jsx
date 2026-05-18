import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { Button } from '../ui/button';
import { Cookie } from 'lucide-react';

export const CookieBanner = () => {
  const { cookieConsent, acceptCookies } = useUser();

  if (cookieConsent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#F0F0F0] shadow-lg"
        data-testid="cookie-banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Cookie size={20} className="text-[#1D9E75] flex-shrink-0" />
              <p className="text-sm text-[#6B7280]">
                We use cookies to improve your experience. By using our site, you agree to our cookie policy.
              </p>
            </div>
            <Button 
              onClick={acceptCookies}
              className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-6 flex-shrink-0"
              data-testid="cookie-accept-btn"
            >
              Accept
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
