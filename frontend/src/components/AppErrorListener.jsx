import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Listens to `jalwa:api-error` events emitted by api.js for cross-cutting
 * status codes (403, 429, 5xx, network). Shows a sonner toast. Throttles
 * duplicate messages within a short window so a burst of failed calls
 * doesn't produce a wall of toasts.
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
      const { status, code, message } = e.detail || {};
      let title = message || 'Something went wrong';
      let testid = 'global-error-toast';

      if (status === 0 || code === 'NETWORK_ERROR') {
        title = 'Network error. Please check your connection.';
        testid = 'global-error-network';
      } else if (status === 403) {
        title = "You don't have permission to do that.";
        testid = 'global-error-403';
      } else if (status === 429) {
        title = 'Too many requests. Please slow down and try again.';
        testid = 'global-error-429';
      } else if (status >= 500) {
        title = 'Server error. Our team has been notified — please try again shortly.';
        testid = 'global-error-5xx';
      }

      const key = `${status}:${code || title}`;
      if (!shouldShow(key)) return;
      toast.error(title, { id: testid });
    };

    window.addEventListener('jalwa:api-error', handler);
    return () => window.removeEventListener('jalwa:api-error', handler);
  }, []);

  return null;
};

export default AppErrorListener;
