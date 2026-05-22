import { useEffect, useState } from 'react';
import { Wrench, RefreshCw } from 'lucide-react';

/**
 * Listens for jalwa:maintenance-mode CustomEvents emitted by api.js when
 * any non-admin call returns 503 + MAINTENANCE_MODE. Renders a full-screen
 * overlay so the user can't keep interacting with broken endpoints.
 *
 * Admin panel routes still work because they hit /api/admin/* which the
 * backend keeps live during maintenance.
 */
export const MaintenanceListener = () => {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/adminpanel');
      if (isAdminPath) return;
      setMode({
        message: e.detail?.message || 'We are doing some maintenance. Please try again shortly.',
      });
    };
    window.addEventListener('jalwa:maintenance-mode', handler);
    return () => window.removeEventListener('jalwa:maintenance-mode', handler);
  }, []);

  if (!mode) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center px-4"
      data-testid="maintenance-overlay"
    >
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center mx-auto mb-4">
          <Wrench size={28} className="text-[#F59E0B]" />
        </div>
        <h1 className="font-syne text-3xl font-bold text-[#0A0A0A] mb-2">Under Maintenance</h1>
        <p className="text-sm text-[#6B7280] mb-6" data-testid="maintenance-message">
          {mode.message}
        </p>
        <p className="text-xs text-[#9CA3AF] mb-6">We&rsquo;ll be back soon.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
          data-testid="maintenance-retry-btn"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    </div>
  );
};

export default MaintenanceListener;
