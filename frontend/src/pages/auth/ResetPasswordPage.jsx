import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Logo } from '../../components/public/Logo';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldError('');

    if (!password || password.length < 8) {
      setFieldError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setFieldError('Passwords do not match');
      return;
    }
    if (!token) {
      setTokenInvalid(true);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
      // Auto-redirect to login after a brief success state.
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      const code = err?.code;
      if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || err?.status === 400) {
        setTokenInvalid(true);
      } else if (code === 'VALIDATION_ERROR' || err?.status === 422) {
        const first = err.details?.[0];
        setFieldError(first?.msg || 'Please check the password requirements.');
      } else {
        setGeneralError(err?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4" data-testid="reset-password-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-8">
          <Link to="/" className="flex items-center mb-8">
            <Logo height={36} />
          </Link>

          {success ? (
            <div className="text-center" data-testid="reset-success">
              <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#1D9E75]" />
              </div>
              <h1 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-2">Password reset</h1>
              <p className="text-[#6B7280] mb-6">
                Your password has been updated. Redirecting you to sign in…
              </p>
              <Link to="/login">
                <Button className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                  Continue to sign in
                </Button>
              </Link>
            </div>
          ) : tokenInvalid ? (
            <div className="text-center" data-testid="reset-token-invalid">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-[#EF4444]" />
              </div>
              <h1 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-2">This reset link has expired</h1>
              <p className="text-[#6B7280] mb-6">
                Reset links are valid for a limited time. Request a new one to continue.
              </p>
              <Link to="/forgot-password">
                <Button className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="reset-request-new-link">
                  Request a new link
                </Button>
              </Link>
              <Link to="/login" className="block mt-4 text-sm text-[#6B7280] hover:underline">
                <ArrowLeft size={14} className="inline mr-1" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-lg bg-[#E1F5EE] flex items-center justify-center mb-4">
                <KeyRound size={24} className="text-[#1D9E75]" />
              </div>
              <h1 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-2">Choose a new password</h1>
              <p className="text-[#6B7280] mb-6">Pick something secure you'll remember.</p>

              {generalError && (
                <div
                  className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-50 text-[#EF4444] text-sm"
                  data-testid="reset-error-message"
                  role="alert"
                >
                  <AlertCircle size={16} />
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (fieldError) setFieldError(''); }}
                      placeholder="At least 8 characters"
                      aria-invalid={!!fieldError}
                      className={`h-11 pr-10 ${fieldError ? 'border-[#EF4444]' : 'border-[#F0F0F0]'}`}
                      data-testid="reset-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); if (fieldError) setFieldError(''); }}
                    placeholder="Re-type your new password"
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? 'reset-field-error' : undefined}
                    className={`h-11 ${fieldError ? 'border-[#EF4444]' : 'border-[#F0F0F0]'}`}
                    data-testid="reset-confirm-input"
                  />
                  {fieldError && (
                    <p
                      id="reset-field-error"
                      className="flex items-start gap-1 mt-1 text-xs text-[#EF4444]"
                      data-testid="reset-field-error"
                    >
                      <AlertCircle size={12} className="mt-[2px] flex-shrink-0" />
                      <span>{fieldError}</span>
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !password || !confirm}
                  className="w-full h-11 bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
                  data-testid="reset-submit-btn"
                >
                  {isLoading ? 'Updating password...' : 'Update password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
