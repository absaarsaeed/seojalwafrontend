import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { Logo } from '../../components/public/Logo';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Always show success — never reveal if the email exists. We swallow all
    // errors except server outages (5xx) so the UI doesn't leak account info.
    try {
      await authApi.forgotPassword(email);
    } catch (err) {
      if (err?.status >= 500) {
        setError('We could not process the request right now. Please try again in a moment.');
        setIsLoading(false);
        return;
      }
      // Validation / 404 / 4xx — pretend it succeeded.
    }
    setSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4" data-testid="forgot-password-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-8">
          <Link to="/" className="flex items-center mb-8">
            <Logo height={36} />
          </Link>
          
          {submitted ? (
            <div className="text-center" data-testid="forgot-success">
              <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#1D9E75]" />
              </div>
              <h1 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-2">Check your email</h1>
              <p className="text-[#6B7280] mb-6">
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft size={18} className="mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-lg bg-[#E1F5EE] flex items-center justify-center mb-4">
                <Mail size={24} className="text-[#1D9E75]" />
              </div>
              <h1 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-2">Forgot your password?</h1>
              <p className="text-[#6B7280] mb-6">
                No worries! Enter your email and we'll send you a reset link.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 border-[#F0F0F0]"
                    required
                    data-testid="forgot-email-input"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="auth-primary-btn w-full h-11"
                  data-testid="forgot-submit-btn"
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-[#EF4444] text-sm" data-testid="forgot-error-message">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </form>
              
              <p className="text-center text-sm text-[#6B7280] mt-6">
                <Link to="/login" className="text-[#1D9E75] font-medium hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft size={16} />
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
