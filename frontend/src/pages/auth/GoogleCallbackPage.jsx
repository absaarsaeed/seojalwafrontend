import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { tokenStore } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Lands on /auth/google/callback after Google OAuth. Backend appends
 * accessToken/refreshToken/isNewUser as query params, we persist them,
 * hydrate the user, and route to /dashboard. On missing tokens we
 * bounce to /login?error=google_failed.
 */
export const GoogleCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    const accessToken = params.get('accessToken') || params.get('access_token');
    const refreshToken = params.get('refreshToken') || params.get('refresh_token');
    // const isNewUser = params.get('isNewUser') === 'true';

    (async () => {
      if (!accessToken) {
        navigate('/login?error=google_failed', { replace: true });
        return;
      }
      tokenStore.setUserTokens({ accessToken, refreshToken: refreshToken || accessToken });
      try {
        await refresh();
      } catch {}
      navigate('/dashboard', { replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]" data-testid="google-callback-page">
      <div className="flex flex-col items-center gap-3 text-[#6B7280]">
        <Loader2 size={28} className="animate-spin text-[#1D9E75]" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
