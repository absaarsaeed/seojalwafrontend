import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { plansApi } from '../../lib/api';

// Public marketing-feel labels for plan features.
const FEATURE_LABELS = {
  articlesPerMonth:        (v) => `${v === 'unlimited' ? 'Unlimited' : v} article${v === 1 ? '' : 's'} per month`,
  socialPostsPerMonth:     (v) => `${v === 'unlimited' ? 'Unlimited' : v} social post${v === 1 ? '' : 's'} per month`,
  websiteConnections:      (v) => `${v === 'unlimited' ? 'Unlimited' : v} website connection${v === 1 ? '' : 's'}`,
  aiScansPerMonth:         (v) => `${v === 'unlimited' ? 'Unlimited' : v} AI scan${v === 1 ? '' : 's'} per month`,
  teamSeats:               (v) => `${v === 'unlimited' ? 'Unlimited' : v} team seat${v === 1 ? '' : 's'}`,
  whiteLabel:              () => 'White-label dashboard',
  prioritySupport:         () => 'Priority support',
  customDomains:           () => 'Custom domains',
  analyticsRetention:      (v) => `${v} months analytics retention`,
};

const formatFeatures = (plan) => {
  const features = plan.features || plan;
  const out = [];
  for (const [k, v] of Object.entries(features)) {
    if (v === false || v == null || v === '' || v === 0) continue;
    if (FEATURE_LABELS[k]) out.push(FEATURE_LABELS[k](v));
  }
  // Generic boolean fields (whiteLabel:true, etc.) handled above.
  // Any plan.featureList[] from backend takes precedence.
  if (Array.isArray(plan.featureList)) return plan.featureList.slice(0, 8);
  return out.slice(0, 8);
};

const formatPrice = (plan, interval) => {
  if (plan.monthlyPrice === 0 || plan.id === 'free' || (plan.name || '').toLowerCase() === 'free') {
    return { primary: '$0', suffix: '/ forever' };
  }
  const price = interval === 'annual'
    ? plan.annualPrice ?? Math.round((plan.monthlyPrice ?? 0) * 12 * 0.8)
    : plan.monthlyPrice ?? 0;
  if (interval === 'annual') {
    const monthly = (price / 12).toFixed(0);
    return { primary: `$${monthly}`, suffix: '/ month, billed annually' };
  }
  return { primary: `$${price}`, suffix: '/ month' };
};

export const SelectPlanPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState('monthly');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await plansApi.selection();
        const list = Array.isArray(data) ? data : data?.plans || data?.items || [];
        if (!cancelled) setPlans(list);
      } catch {
        // Fallback: try the standard plans endpoint.
        try {
          const data = await plansApi.list();
          const list = Array.isArray(data) ? data : data?.plans || data?.items || [];
          if (!cancelled) setPlans(list);
        } catch { if (!cancelled) setPlans([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sorted = useMemo(() => {
    return [...plans].sort((a, b) => (a.monthlyPrice ?? 0) - (b.monthlyPrice ?? 0));
  }, [plans]);

  const handleSelect = (plan) => {
    const isFree = (plan.monthlyPrice ?? 0) === 0 || (plan.name || '').toLowerCase() === 'free' || plan.id === 'free';
    if (isFree) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate(`/onboarding/checkout?planId=${encodeURIComponent(plan.id)}&interval=${interval}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4" data-testid="select-plan-page">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#1D9E75] flex items-center justify-center">
              <span className="text-white font-bold font-syne">J</span>
            </div>
            <span className="font-syne font-bold text-[#0A0A0A]">SEO Jalwa</span>
          </Link>
          <h1 className="font-syne text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-2">
            Welcome! Choose your plan
          </h1>
          <p className="text-[#6B7280] mb-6">Start free or pick a plan — change anytime.</p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#F0F0F0] rounded-full" data-testid="interval-toggle">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${interval === 'monthly' ? 'bg-[#1D9E75] text-white' : 'text-[#6B7280]'}`}
              data-testid="interval-monthly"
            >Monthly</button>
            <button
              onClick={() => setInterval('annual')}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${interval === 'annual' ? 'bg-[#1D9E75] text-white' : 'text-[#6B7280]'}`}
              data-testid="interval-annual"
            >Annual <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${interval === 'annual' ? 'bg-white/20' : 'bg-[#E1F5EE] text-[#1D9E75]'}`}>Save 20%</span></button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20" data-testid="select-plan-loading">
            <Loader2 className="animate-spin text-[#1D9E75]" size={32} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#F0F0F0]" data-testid="select-plan-empty">
            <p className="text-[#6B7280] mb-3">Plans are temporarily unavailable.</p>
            <Link to="/dashboard">
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Continue to dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="plan-grid">
            {sorted.map((plan) => {
              const isFree = (plan.monthlyPrice ?? 0) === 0 || (plan.name || '').toLowerCase() === 'free' || plan.id === 'free';
              const isPopular = (plan.name || '').toLowerCase() === 'growth' || plan.popular === true;
              const { primary, suffix } = formatPrice(plan, interval);
              return (
                <motion.div
                  key={plan.id || plan.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative bg-white rounded-2xl border p-6 flex flex-col ${isPopular ? 'border-[#1D9E75] shadow-lg ring-1 ring-[#1D9E75]/20' : 'border-[#F0F0F0]'}`}
                  data-testid={`plan-card-${(plan.id || plan.name || '').toString().toLowerCase()}`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1D9E75] text-white text-xs font-semibold rounded-full">
                      Most Popular
                    </span>
                  )}
                  {isFree && (
                    <span className="self-start mb-2 px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-[10px] font-semibold rounded-full">
                      No credit card required
                    </span>
                  )}
                  <h3 className="font-syne text-xl font-bold text-[#0A0A0A] mb-1">{plan.name}</h3>
                  {plan.tagline && <p className="text-xs text-[#6B7280] mb-3">{plan.tagline}</p>}
                  <div className="mb-5">
                    <span className="font-syne text-3xl font-bold text-[#0A0A0A]">{primary}</span>
                    <span className="text-sm text-[#6B7280] ml-1">{suffix}</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {formatFeatures(plan).map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#0A0A0A]">
                        <Check size={14} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSelect(plan)}
                    className={isFree
                      ? 'bg-[#1D9E75] hover:bg-[#0F6E56] text-white w-full'
                      : isPopular
                        ? 'bg-[#1D9E75] hover:bg-[#0F6E56] text-white w-full'
                        : 'bg-white border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE] w-full'}
                    data-testid={`plan-cta-${(plan.id || plan.name || '').toString().toLowerCase()}`}
                  >
                    {isFree ? 'Start for free' : 'Get started'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/dashboard" className="text-sm text-[#6B7280] hover:text-[#1D9E75] hover:underline" data-testid="skip-for-now">
            Skip for now → continue with free plan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SelectPlanPage;
