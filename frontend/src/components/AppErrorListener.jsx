import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

/**
 * Listens to `jalwa:api-error` events emitted by api.js for cross-cutting
 * status codes (403, 429, 5xx, network). Renders a sonner `toast.custom`
 * whose root carries a discoverable `data-testid` so e2e tests can assert it.
 * Throttles duplicate messages within a short window so a burst of failed
 * calls doesn't produce a wall of toasts.
 */
export const AppErrorListener = () => {
  const lastShownRef = useRef(new Map()); // key -> timestamp

  useEffect(() => {
    const shouldShow = (key) => {
      const now = Date.now();
      const prev = lastShownRef.current.get(key) || 0;
      if (now - prev < 4000) return false;
      lastShownRef.current.set(key, now);
      return true;
    };

    const handler = (e) => {
      const detail = e.detail || {};
      const { status, code, message, kind } = detail;
      const k = (kind || '').toLowerCase();

      let title = message || 'Something went wrong';
      let testid = 'global-error-toast';

      if (k === 'network' || status === 0 || code === 'NETWORK_ERROR') {
        title = 'Network error. Please check your connection.';
        testid = 'global-error-network';
      } else if (k === '403' || status === 403) {
        title = "You don't have permission to do that.";
        testid = 'global-error-403';
      } else if (k === '429' || status === 429) {
        title = 'Too many requests. Please slow down and try again.';
        testid = 'global-error-429';
      } else if (k === '5xx' || (typeof status === 'number' && status >= 500)) {
        title = 'Server error. Our team has been notified — please try again shortly.';
        testid = 'global-error-5xx';
      }

      const dedupeKey = `${testid}:${title}`;
      if (!shouldShow(dedupeKey)) return;

      toast.custom(
        (id) => (
          <div
            data-testid={testid}
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-white border border-red-200 shadow-lg text-sm text-[#0A0A0A] max-w-sm"
          >
            <AlertCircle size={16} className="text-[#EF4444] mt-0.5 flex-shrink-0" />
            <span className="flex-1">{title}</span>
            <button
              onClick={() => toast.dismiss(id)}
              className="text-[#6B7280] hover:text-[#0A0A0A] text-xs"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    };

    window.addEventListener('jalwa:api-error', handler);
    return () => window.removeEventListener('jalwa:api-error', handler);
  }, []);

  return null;
};

export default AppErrorListener;
