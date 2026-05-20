import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Logo } from '../../components/public/Logo';
import { Link } from 'react-router-dom';
import { Star, Check } from 'lucide-react';
import { feedbackApi } from '../../lib/api';
import { useUser } from '../../context/UserContext';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'feature_request', label: 'Feature request' },
  { value: 'bug_report',      label: 'Bug report' },
  { value: 'general',         label: 'General feedback' },
  { value: 'compliment',      label: 'Compliment' },
];

export const FeedbackForm = ({ onSubmitted, embedded = false }) => {
  const { user } = useUser?.() || { user: null };
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!message.trim()) {
      toast.error('Please share what\'s on your mind');
      return;
    }
    setLoading(true);
    try {
      await feedbackApi.submit({ rating, category, message, email });
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      toast.error(err?.message || 'Could not send feedback');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8" data-testid="feedback-success">
        <div className="w-12 h-12 mx-auto bg-[#E1F5EE] rounded-full flex items-center justify-center mb-3">
          <Check className="text-[#1D9E75]" size={22} />
        </div>
        <h3 className="font-semibold text-[#0A0A0A] text-lg">Thanks for the feedback!</h3>
        <p className="text-sm text-[#6B7280] mt-1">We read every message — even the harsh ones.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="feedback-form">
      <div data-testid="feedback-rating">
        <Label className="mb-1.5 block text-sm">How are we doing?</Label>
        <div className="flex gap-1" data-testid="feedback-rating-group">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className="p-1"
              aria-label={`${n} stars`}
              data-testid={`feedback-rating-${n}`}
            >
              <Star
                size={26}
                className={n <= rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#D1D5DB]'}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-sm">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="border-[#F0F0F0]" data-testid="feedback-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-1.5 block text-sm">Message</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind..."
          rows={5}
          className="border-[#F0F0F0]"
          data-testid="feedback-message"
        />
      </div>

      {!user && (
        <div>
          <Label className="mb-1.5 block text-sm">Email (optional)</Label>
          <Input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="border-[#F0F0F0]"
            data-testid="feedback-email"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="auth-primary-btn w-full h-11"
        data-testid="feedback-submit-btn"
      >
        {loading ? 'Sending...' : 'Send feedback'}
      </Button>
      {embedded && (
        <p className="text-[11px] text-[#9CA3AF] text-center">
          You can also visit our full <Link to="/feedback" className="text-[#1D9E75] hover:underline">feedback page</Link>.
        </p>
      )}
    </form>
  );
};

export const FeedbackPage = () => (
  <div className="min-h-screen bg-[#F9FAFB] py-12 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
      data-testid="feedback-page"
    >
      <div className="flex justify-center mb-6">
        <Logo />
      </div>
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-8 shadow-sm">
        <h1 className="font-syne text-3xl font-bold text-[#0A0A0A] mb-2">Send us feedback</h1>
        <p className="text-[#6B7280] mb-6 text-sm">Your input shapes the roadmap. Anything goes — feature ideas, bug reports, compliments, or rants.</p>
        <FeedbackForm />
      </div>
      <p className="text-center text-xs text-[#9CA3AF] mt-6">
        <Link to="/" className="hover:underline">← Back to home</Link>
      </p>
    </motion.div>
  </div>
);

export default FeedbackPage;
