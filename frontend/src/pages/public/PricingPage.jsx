import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import { Check, X, ArrowRight, Mail } from 'lucide-react';
import { FAQ_DATA } from '../../data/publicData';
import { plansApi, pagesApi, checkoutApi } from '../../lib/api';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const allFeatures = [
  { name: 'AI Visibility Monitoring', starter: true, growth: true, agency: true },
  { name: 'AI Writer (Content Writing)', starter: true, growth: true, agency: true },
  { name: 'Auto Article Writing', starter: true, growth: true, agency: true },
  { name: 'Social Autopilot', starter: true, growth: true, agency: true },
  { name: 'Custom Brand Voice Model', starter: true, growth: true, agency: true },
  { name: 'Articles per month', starter: '10', growth: '30', agency: 'Unlimited' },
  { name: 'Social posts per month', starter: '30', growth: '100', agency: 'Unlimited' },
  { name: 'AI visibility scans', starter: '5', growth: '20', agency: 'Unlimited' },
  { name: 'Team seats', starter: '1', growth: '3', agency: 'Unlimited' },
  { name: 'CMS connections', starter: '2', growth: 'Unlimited', agency: 'Unlimited' },
  { name: 'Competitor comparison', starter: false, growth: true, agency: true },
  { name: 'Priority support', starter: false, growth: true, agency: true },
  { name: 'White-label reports', starter: false, growth: false, agency: true },
  { name: 'API access', starter: false, growth: false, agency: true },
  { name: 'Dedicated account manager', starter: false, growth: false, agency: true }
];

export const PricingPage = () => {
  const { getPricing, user } = useUser();
  const fallbackPricing = getPricing();
  const [isAnnual, setIsAnnual] = useState(false);
  const [livePlans, setLivePlans] = useState(null); // array | null
  const [trialDays, setTrialDays] = useState(14);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [busyPlan, setBusyPlan] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await plansApi.list();
        const list = Array.isArray(data) ? data : data?.items || data?.plans || [];
        if (!cancelled && list.length > 0) setLivePlans(list);
      } catch {}
      try {
        const s = await pagesApi.settings();
        const flat = s?.settings || s || {};
        const td = flat.trialDays || flat.trial_days || flat.trialPeriodDays;
        if (!cancelled && td) setTrialDays(Number(td) || 14);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const handleStartPlan = async (planKey) => {
    // Logged-out users go through normal signup flow.
    if (!user) {
      window.location.assign('/signup');
      return;
    }
    setBusyPlan(planKey);
    try {
      const res = await checkoutApi.start({
        planId: planKey,
        interval: isAnnual ? 'annual' : 'monthly',
      });
      const url = res?.checkoutUrl || res?.checkout_url;
      if (url) {
        window.location.assign(url);
        return;
      }
      // Backend returned a message → show contact modal.
      setUpgradeMessage(res?.message || 'To upgrade your plan, please contact hello@seojalwa.com and we\'ll set you up manually.');
      setUpgradeOpen(true);
    } catch {
      setUpgradeMessage('To upgrade your plan, please contact hello@seojalwa.com and we\'ll set you up manually.');
      setUpgradeOpen(true);
    } finally {
      setBusyPlan('');
    }
  };

  // Merge backend plans with the fallback shape used by the existing UI.
  const pricing = (() => {
    if (!livePlans) return fallbackPricing;
    const byKey = {};
    livePlans.forEach((p) => {
      const k = (p.id || p.key || p.name || '').toLowerCase();
      byKey[k] = {
        name: p.name || p.id || '',
        monthlyPrice: p.monthlyPrice ?? p.priceMonthly ?? p.price ?? 0,
        annualPrice: p.annualPrice ?? p.priceAnnual ?? (p.monthlyPrice ? Math.round(p.monthlyPrice * 0.8) : 0),
        popular: !!p.popular || /growth/i.test(p.name || ''),
        whiteLabel: !!p.whiteLabel,
        articlesPerMonth: p.articlesPerMonth,
        socialPostsPerMonth: p.socialPostsPerMonth,
        aiScansPerMonth: p.aiScansPerMonth,
        teamSeats: p.teamSeats,
        websiteConnections: p.websiteConnections,
      };
    });
    // keep stable key order matching legacy UI
    return {
      starter: byKey.starter || fallbackPricing.starter,
      growth: byKey.growth || fallbackPricing.growth,
      agency: byKey.agency || fallbackPricing.agency,
    };
  })();

  return (
    <div className="min-h-screen" data-testid="pricing-page">
      {/* Hero */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-syne text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A0A0A] mb-6"
          >
            Pricing that makes your accountant happy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#6B7280] max-w-2xl mx-auto mb-8"
          >
            One platform replacing 4-5 tools. The math speaks for itself.
          </motion.p>
          
          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-[#F0F0F0] rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!isAnnual ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isAnnual ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280]'}`}
            >
              Annual <span className="text-[#1D9E75] text-xs ml-1">Save 2 months</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(pricing).map(([key, plan]) => (
              <motion.div
                key={key}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className={`rounded-xl border-2 p-8 ${plan.popular ? 'border-[#1D9E75] bg-white shadow-lg' : 'border-[#F0F0F0] bg-white'}`}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-semibold rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="font-syne text-2xl font-bold text-[#0A0A0A]">{plan.name}</h3>
                <p className="text-5xl font-bold text-[#0A0A0A] my-4">
                  ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  <span className="text-lg font-normal text-[#6B7280]">/mo</span>
                </p>
                {isAnnual && (
                  <p className="text-sm text-[#1D9E75] mb-4">
                    Billed ${(plan.annualPrice * 12)} annually
                  </p>
                )}
                <Button
                  onClick={() => handleStartPlan(key)}
                  disabled={busyPlan === key}
                  className={`w-full mb-6 ${plan.popular ? 'bg-[#1D9E75] hover:bg-[#0F6E56] text-white' : 'bg-[#F0F0F0] text-[#0A0A0A] hover:bg-[#E0E0E0]'}`}
                  data-testid={`pricing-cta-${key}`}
                >
                  {busyPlan === key ? 'Loading...' : user ? `Upgrade to ${plan.name}` : `Start your ${trialDays}-day free trial`}
                </Button>
                {/* White-label / branding line */}
                <p className="text-xs text-[#6B7280] mb-3" data-testid={`pricing-branding-${key}`}>
                  {plan.whiteLabel ? '✓ White-label (no SEO Jalwa branding)' : 'Includes SEO Jalwa branding'}
                </p>
                <ul className="space-y-3">
                  {allFeatures.slice(0, 10).map((feature) => {
                    const value = feature[key];
                    const isIncluded = value === true || (typeof value === 'string');
                    return (
                      <li key={feature.name} className="flex items-center gap-2 text-sm">
                        {isIncluded ? (
                          <Check size={16} className="text-[#1D9E75] flex-shrink-0" />
                        ) : (
                          <X size={16} className="text-[#D1D5DB] flex-shrink-0" />
                        )}
                        <span className={isIncluded ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}>
                          {typeof value === 'string' ? `${feature.name}: ${value}` : feature.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-8 text-center">
            Compare all features
          </h2>
          <div className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                    <th className="text-left p-4 font-semibold text-[#0A0A0A]">Feature</th>
                    <th className="text-center p-4 font-semibold text-[#0A0A0A]">Starter</th>
                    <th className="text-center p-4 font-semibold text-[#1D9E75]">Growth</th>
                    <th className="text-center p-4 font-semibold text-[#0A0A0A]">Agency</th>
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, i) => (
                    <tr key={feature.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                      <td className="p-4 text-[#6B7280]">{feature.name}</td>
                      {['starter', 'growth', 'agency'].map((plan) => {
                        const value = feature[plan];
                        return (
                          <td key={plan} className="p-4 text-center">
                            {value === true ? (
                              <Check size={18} className="text-[#1D9E75] mx-auto" />
                            ) : value === false ? (
                              <X size={18} className="text-[#D1D5DB] mx-auto" />
                            ) : (
                              <span className="text-[#0A0A0A] font-medium">{value}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-8 text-center">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_DATA.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-[#F0F0F0] rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium text-[#0A0A0A] hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#6B7280]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white mb-6">
            Start your 14-day free trial today
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            No credit card required. Cancel anytime.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-full px-8">
              Get started free <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Manual-upgrade contact dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md" data-testid="upgrade-contact-dialog">
          <DialogHeader>
            <DialogTitle>Upgrade your plan</DialogTitle>
            <DialogDescription>{upgradeMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:hello@seojalwa.com?subject=Upgrade%20my%20SEO%20Jalwa%20plan"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-lg font-medium"
              data-testid="upgrade-email-link"
            >
              <Mail size={16} /> Email hello@seojalwa.com
            </a>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUpgradeOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
