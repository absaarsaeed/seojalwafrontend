import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Loader2, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { plansApi, checkoutApi } from '../../lib/api';
import { toast } from 'sonner';

export const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('planId');
  const interval = searchParams.get('interval') || 'monthly';

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Coupon
  const [coupon, setCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState(null); // { valid, discount, message }

  // Payment form
  const [card, setCard] = useState({ name: '', number: '', expMonth: '', expYear: '', cvv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId) {
      navigate('/onboarding/select-plan', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await plansApi.get(planId);
        if (!cancelled) setPlan(data?.plan || data);
      } catch {
        // Fallback: load the full list and find by id/name.
        try {
          let list;
          try { list = await plansApi.selection(); } catch { list = await plansApi.list(); }
          const arr = Array.isArray(list) ? list : list?.plans || list?.items || [];
          const target = arr.find((p) => (p.id || '').toString() === planId || (p.name || '').toLowerCase() === planId.toLowerCase());
          if (target && !cancelled) setPlan(target);
          else if (!cancelled) setError('Could not load plan');
        } catch {
          if (!cancelled) setError('Could not load plan');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [planId, navigate]);

  const basePrice = useMemo(() => {
    if (!plan) return 0;
    return interval === 'annual'
      ? plan.annualPrice ?? Math.round((plan.monthlyPrice ?? 0) * 12 * 0.8)
      : plan.monthlyPrice ?? 0;
  }, [plan, interval]);

  const discount = couponResult?.valid ? (couponResult.discount ?? 0) : 0;
  const total = Math.max(0, basePrice - discount);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponResult(null);
    try {
      const res = await checkoutApi.validateCoupon(coupon.trim(), planId);
      const valid = res?.valid !== false && res?.success !== false;
      if (valid) {
        const discountAmount = res?.discount ?? res?.discountAmount ?? (res?.percentOff ? Math.round(basePrice * (res.percentOff / 100)) : 0);
        setCouponResult({ valid: true, discount: discountAmount, message: res?.message || 'Coupon applied' });
        toast.success('Coupon applied');
      } else {
        setCouponResult({ valid: false, message: res?.message || 'Invalid code' });
      }
    } catch (err) {
      setCouponResult({ valid: false, message: err?.message || 'Invalid code' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePay = async () => {
    setError(null);
    // Minimal client-side validation
    if (!card.name.trim() || !card.number.trim() || !card.expMonth || !card.expYear || !card.cvv) {
      setError('Please fill in all payment fields');
      return;
    }
    setSubmitting(true);
    try {
      const startRes = await checkoutApi.start({ planId, interval, couponCode: couponResult?.valid ? coupon.trim() : undefined });
      const sessionId = startRes?.sessionId || startRes?.id;
      if (!sessionId) throw new Error('Checkout session could not be created');
      await checkoutApi.complete(sessionId, {
        cardName: card.name.trim(),
        cardNumber: card.number.replace(/\s+/g, ''),
        expiryMonth: parseInt(card.expMonth, 10),
        expiryYear: parseInt(card.expYear, 10),
        cvv: card.cvv.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Payment failed. Please check your card details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" data-testid="checkout-loading">
        <Loader2 className="animate-spin text-[#1D9E75]" size={32} />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" data-testid="checkout-error">
        <div className="text-center">
          <p className="text-[#0A0A0A] mb-4">Plan not found.</p>
          <Link to="/onboarding/select-plan">
            <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Back to plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4" data-testid="checkout-success">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl border border-[#F0F0F0] p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-full bg-[#1D9E75] mx-auto flex items-center justify-center mb-4"
          >
            <Check size={32} className="text-white" />
          </motion.div>
          <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-2">Payment successful! 🎉</h2>
          <p className="text-[#6B7280] mb-1">Welcome to <strong>{plan.name}</strong> plan.</p>
          <p className="text-sm text-[#6B7280] mb-6">We're generating your first articles now...</p>
          <Button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white w-full"
            data-testid="checkout-success-cta"
          >
            Go to dashboard →
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4" data-testid="checkout-page">
      <div className="max-w-5xl mx-auto">
        <Link to="/onboarding/select-plan" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1D9E75] mb-6" data-testid="back-to-plans">
          <ArrowLeft size={16} /> Back to plans
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Order Summary */}
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6" data-testid="order-summary">
            <h3 className="font-syne text-xl font-bold text-[#0A0A0A] mb-4">Order summary</h3>
            <div className="flex items-start justify-between pb-4 border-b border-[#F0F0F0]">
              <div>
                <p className="font-semibold text-[#0A0A0A]" data-testid="summary-plan-name">{plan.name} plan</p>
                <p className="text-xs text-[#6B7280]">Billed {interval === 'annual' ? 'annually' : 'monthly'}</p>
              </div>
              <p className="font-semibold text-[#0A0A0A]" data-testid="summary-base-price">${basePrice.toFixed(2)}</p>
            </div>

            {/* Coupon */}
            <div className="py-4 border-b border-[#F0F0F0]">
              <Label className="text-xs text-[#6B7280] uppercase tracking-wide mb-2 block">Have a coupon?</Label>
              <div className="flex gap-2">
                <Input
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setCouponResult(null); }}
                  placeholder="Enter code"
                  className="flex-1 border-[#F0F0F0]"
                  data-testid="coupon-input"
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !coupon.trim()}
                  variant="outline"
                  className="border-[#1D9E75] text-[#1D9E75]"
                  data-testid="coupon-apply-btn"
                >
                  {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </Button>
              </div>
              {couponResult && (
                <p className={`text-xs mt-2 ${couponResult.valid ? 'text-[#1D9E75]' : 'text-[#EF4444]'}`} data-testid="coupon-message">
                  {couponResult.valid ? `✓ ${couponResult.message}` : `✗ ${couponResult.message}`}
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="text-[#0A0A0A]">${basePrice.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm" data-testid="discount-row">
                  <span className="text-[#1D9E75]">Discount</span>
                  <span className="text-[#1D9E75]">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#F0F0F0]">
                <span className="font-semibold text-[#0A0A0A]">Total</span>
                <span className="font-syne text-xl font-bold text-[#0A0A0A]" data-testid="summary-total">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6B7280] pt-2">
              <Lock size={12} /> 100% secure checkout
            </div>
          </div>

          {/* Right — Payment form */}
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6" data-testid="payment-form">
            <h3 className="font-syne text-xl font-bold text-[#0A0A0A] mb-1">Payment details</h3>
            <p className="text-xs text-[#6B7280] mb-5">Nothing will be charged during beta testing.</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="card-name" className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">Cardholder name</Label>
                <Input id="card-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Jane Doe" className="border-[#F0F0F0]" data-testid="card-name" />
              </div>
              <div>
                <Label htmlFor="card-number" className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">Card number</Label>
                <Input id="card-number" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="border-[#F0F0F0]" data-testid="card-number" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="card-exp-month" className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">Month</Label>
                  <Input id="card-exp-month" value={card.expMonth} onChange={(e) => setCard({ ...card, expMonth: e.target.value })} placeholder="12" maxLength={2} className="border-[#F0F0F0]" data-testid="card-exp-month" />
                </div>
                <div>
                  <Label htmlFor="card-exp-year" className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">Year</Label>
                  <Input id="card-exp-year" value={card.expYear} onChange={(e) => setCard({ ...card, expYear: e.target.value })} placeholder="2030" maxLength={4} className="border-[#F0F0F0]" data-testid="card-exp-year" />
                </div>
                <div>
                  <Label htmlFor="card-cvv" className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">CVV</Label>
                  <Input id="card-cvv" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="123" maxLength={4} className="border-[#F0F0F0]" data-testid="card-cvv" />
                </div>
              </div>

              {error && <p className="text-xs text-[#EF4444]" data-testid="checkout-error-msg">{error}</p>}

              <Button
                onClick={handlePay}
                disabled={submitting}
                className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white py-6 text-base font-semibold"
                data-testid="pay-btn"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin mr-2" />Processing payment...</>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </Button>

              <p className="text-xs text-center text-[#6B7280] bg-[#FEF3C7] py-2 rounded-md" data-testid="test-mode-warning">
                ⚠️ Test mode: Any card details work
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
