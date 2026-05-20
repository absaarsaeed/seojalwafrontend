import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Logo } from '../../components/public/Logo';
import { authApi } from '../../lib/api';

// Map a Pydantic validation detail → form field name + message.
const detailToFieldError = (d) => {
  const loc = Array.isArray(d?.loc) ? d.loc : [];
  // loc looks like ["body", "email"] — take the last meaningful segment.
  const field = loc.slice(-1)[0];
  return { field, message: d?.msg || 'Invalid value' };
};

const FieldError = ({ id, msg, extra }) =>
  msg ? (
    <p
      id={id}
      className="flex items-start gap-1 mt-1 text-xs text-[#EF4444]"
      data-testid={id}
    >
      <AlertCircle size={12} className="mt-[2px] flex-shrink-0" />
      <span>
        {msg}
        {extra && <> {extra}</>}
      </span>
    </p>
  ) : null;

export const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', website: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({}); // { name, email, password, website }
  const [emailTaken, setEmailTaken] = useState(false);
  const { signup } = useUser();
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    window.location.href = authApi.googleStartUrl();
  };

  const setFormField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear field-specific error as user types
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    if (key === 'email' && emailTaken) setEmailTaken(false);
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});
    setEmailTaken(false);
    // Client-side required checks — the live API only validates email + password,
    // but we want a friendly inline error for an empty name field too.
    const clientErrors = {};
    if (!formData.name?.trim()) clientErrors.name = 'Full name is required';
    if (!formData.email?.trim()) clientErrors.email = 'Email is required';
    if (!formData.password) clientErrors.password = 'Password is required';
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setIsLoading(true);
    try {
      await signup(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const code = err?.code;
      if (code === 'EMAIL_TAKEN' || err?.status === 409) {
        setEmailTaken(true);
      } else if (code === 'VALIDATION_ERROR' || err?.status === 422) {
        const next = {};
        for (const d of err.details || []) {
          const { field, message } = detailToFieldError(d);
          // Map backend field name → local form field. Backend uses `fullName`
          // for our `name` field — handle it explicitly.
          const localField = field === 'fullName' ? 'name' : field;
          if (localField && !next[localField]) next[localField] = message;
        }
        if (Object.keys(next).length === 0) {
          setGeneralError(err.message || 'Please check the fields and try again.');
        } else {
          setFieldErrors(next);
        }
      } else {
        setGeneralError(err?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="signup-page">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1D9E75] p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-0.5">
            <span className="text-2xl font-extrabold text-white">SEO</span>
            <span className="text-2xl font-extrabold text-white/80">Jalwa</span>
          </Link>
        </div>
        <div>
          <blockquote className="text-2xl text-white/90 font-medium leading-relaxed mb-6">
            "We went from invisible to the top AI recommendation in our category. SEO Jalwa changed everything."
          </blockquote>
          <p className="text-white/70">— Sarah Chen, Founder at TechFlow</p>
        </div>
        <div className="space-y-3">
          {['AI visibility monitoring', 'Content in your brand voice', 'Social media automation'].map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-white/80">
              <Check size={18} className="text-white" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center">
              <Logo height={36} />
            </Link>
          </div>

          <h1 className="font-syne text-3xl font-bold text-[#0A0A0A] mb-2">Create your account</h1>
          <p className="text-[#6B7280] mb-8">Start your 14-day free trial. No credit card required.</p>

          {/* General error banner — top of form */}
          {generalError && (
            <div
              className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-50 text-[#EF4444] text-sm"
              data-testid="signup-error-message"
              role="alert"
            >
              <AlertCircle size={16} />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormField('name', e.target.value)}
                placeholder="John Doe"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
                className={`h-11 ${fieldErrors.name ? 'border-[#EF4444]' : 'border-[#F0F0F0]'}`}
                data-testid="signup-name-input"
              />
              <FieldError id="signup-name-error" msg={fieldErrors.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormField('email', e.target.value)}
                placeholder="you@example.com"
                aria-invalid={!!fieldErrors.email || emailTaken}
                aria-describedby={(fieldErrors.email || emailTaken) ? 'signup-email-error' : undefined}
                className={`h-11 ${(fieldErrors.email || emailTaken) ? 'border-[#EF4444]' : 'border-[#F0F0F0]'}`}
                data-testid="signup-email-input"
              />
              {emailTaken ? (
                <p
                  id="signup-email-error"
                  className="flex items-start gap-1 mt-1 text-xs text-[#EF4444]"
                  data-testid="signup-email-taken-error"
                >
                  <AlertCircle size={12} className="mt-[2px] flex-shrink-0" />
                  <span>
                    An account with this email already exists.{' '}
                    <Link to="/login" className="font-medium underline hover:text-[#0F6E56]" data-testid="signup-signin-link">
                      Sign in instead?
                    </Link>
                  </span>
                </p>
              ) : (
                <FieldError id="signup-email-error" msg={fieldErrors.email} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormField('password', e.target.value)}
                  placeholder="Create a password"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
                  className={`h-11 pr-10 ${fieldErrors.password ? 'border-[#EF4444]' : 'border-[#F0F0F0]'}`}
                  data-testid="signup-password-input"
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
              <FieldError id="signup-password-error" msg={fieldErrors.password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormField('website', e.target.value)}
                placeholder="https://yoursite.com"
                aria-invalid={!!fieldErrors.website}
                aria-describedby={fieldErrors.website ? 'signup-website-error' : undefined}
                className={`h-11 ${fieldErrors.website ? 'border-[#EF4444]' : 'border-[#F0F0F0]'}`}
                data-testid="signup-website-input"
              />
              <FieldError id="signup-website-error" msg={fieldErrors.website} />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="auth-primary-btn w-full h-11"
              data-testid="signup-submit-btn"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F0F0F0]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-[#6B7280]">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="auth-google-btn w-full h-11"
              data-testid="signup-google-btn"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1D9E75] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
