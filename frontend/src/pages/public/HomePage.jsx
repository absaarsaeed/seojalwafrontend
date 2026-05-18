import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Slider } from '../../components/ui/slider';
import { PlatformLogo } from '../../components/public/PlatformLogo';
import {
  Check, X as XIcon, ArrowRight, Plug, Pen, Share2, TrendingUp, Star,
  Sparkles, FileText, Search, Eye, Calendar, Zap,
} from 'lucide-react';

// =====================================================
// Animation helpers
// =====================================================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const InView = ({ children, className = '', amount = 0.2, id }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <motion.section id={id} ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className={className}>
      {children}
    </motion.section>
  );
};

// =====================================================
// Counter
// =====================================================
const useCount = (end, duration = 1600, inView) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setN(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, inView]);
  return n;
};

const CountStat = ({ value, suffix = '', prefix = '', label }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const n = useCount(value, 1600, inView);
  return (
    <div ref={ref} className="text-center">
      <p className="font-bricolage text-5xl md:text-6xl font-extrabold text-[#1D9E75]">
        {prefix}{n.toLocaleString()}{suffix}
      </p>
    </div>
  );
};

// =====================================================
// Stars
// =====================================================
const Stars = ({ size = 14, color = '#FBBF24' }) => (
  <div className="flex gap-0.5">
    {[0, 1, 2, 3, 4].map((i) => (
      <Star key={i} size={size} fill={color} stroke={color} />
    ))}
  </div>
);

// =====================================================
// SECTION 1 — HERO
// =====================================================
const Hero = () => (
  <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
    {/* Soft radial glow */}
    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(29,158,117,0.10) 0%, rgba(255,255,255,0) 60%)' }} />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-5xl mx-auto">
        {/* Trust badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1D9E75]/30 bg-[#E1F5EE]/40 text-sm text-[#0A0A0A] mb-8">
          <Zap size={14} className="text-[#1D9E75]" /> Trusted by 2,400+ growing businesses
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-bricolage tracking-tight leading-[0.95] text-[#0A0A0A] mb-6"
          style={{ fontSize: 'clamp(40px, 7.5vw, 80px)' }}
        >
          <div>Get Found. Get Recommended.</div>
          <div>By Google, <span className="text-[#1D9E75]">ChatGPT, Perplexity</span></div>
          <div>And Your Next 1,000 Customers.</div>
        </motion.h1>

        {/* Subhead */}
        <motion.p variants={fadeUp} className="text-lg md:text-xl text-[#6B7280] max-w-3xl mx-auto mb-8 leading-relaxed">
          SEO Jalwa writes and publishes 1 expert article to your website every day, grows your AI search visibility, and posts to all your social media — completely automatically. Set it up once.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center mb-6">
          <Link to="/signup">
            <Button
              className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white h-[52px] px-7 rounded-full text-base transition-transform hover:scale-[1.02]"
              data-testid="hero-cta-primary"
            >
              Start Your Free Trial <ArrowRight size={18} className="ml-1" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="ghost" className="h-[52px] text-[#0A0A0A] underline-offset-4 hover:underline" data-testid="hero-cta-secondary">
              See how it works ↓
            </Button>
          </a>
        </motion.div>

        {/* Trust row */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[#6B7280] mb-12">
          <span className="inline-flex items-center gap-1.5"><Stars /> 4.9/5 from 847 reviews</span>
          <span className="inline-flex items-center gap-1"><Check size={14} className="text-[#1D9E75]" /> No credit card required</span>
          <span className="inline-flex items-center gap-1"><Check size={14} className="text-[#1D9E75]" /> Setup in 10 minutes</span>
          <span className="inline-flex items-center gap-1"><Check size={14} className="text-[#1D9E75]" /> Cancel anytime</span>
        </motion.div>

        {/* Hero visual — browser mockup with floating cards */}
        <motion.div variants={fadeUp} className="relative max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-[#F0F0F0] shadow-2xl bg-white">
            {/* Chrome bar */}
            <div className="bg-[#F9FAFB] px-4 py-2.5 flex items-center gap-2 border-b border-[#F0F0F0]">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <span className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="ml-3 flex-1 h-6 rounded-md bg-white border border-[#F0F0F0] flex items-center px-3 text-xs text-[#6B7280]">
                <Search size={11} className="mr-1.5" />app.seojalwa.com/dashboard/auto-publish
              </div>
            </div>
            {/* Calendar mockup */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-syne text-lg font-bold text-[#0A0A0A]">Your Content Calendar</p>
                  <p className="text-xs text-[#6B7280]">Published automatically every day at 9–11am GMT</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" /> Live
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-[10px]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-[#6B7280] font-semibold text-center py-1">{d}</div>
                ))}
                {Array.from({ length: 14 }).map((_, i) => {
                  const past = i < 6;
                  const today = i === 6;
                  return (
                    <div key={i} className={`rounded-md p-2 min-h-[60px] ${past ? 'bg-[#E1F5EE]/60' : today ? 'bg-[#DBEAFE]/50' : 'bg-[#F9FAFB]'}`}>
                      <p className="text-[#0A0A0A] text-[9px] leading-tight line-clamp-2">SEO Trends {2026 + i}: Guide</p>
                      <span className={`mt-1 inline-block px-1 rounded text-[8px] font-semibold ${past ? 'bg-[#1D9E75] text-white' : today ? 'bg-[#2563EB] text-white' : 'bg-[#F0F0F0] text-[#6B7280]'}`}>
                        {past ? 'Published' : today ? 'Ready' : 'Sched.'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute -top-6 -left-4 md:-left-12 bg-white rounded-xl border border-[#F0F0F0] shadow-xl p-3 max-w-[220px]"
            style={{ animation: 'float 3.5s ease-in-out infinite' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />
              <span className="text-[10px] font-semibold text-[#1D9E75]">Article published</span>
            </div>
            <p className="text-xs font-medium text-[#0A0A0A] line-clamp-2">5 SEO Mistakes to Avoid in 2026</p>
            <p className="text-[10px] text-[#6B7280]">myblog.com · 2 min ago</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="absolute -top-6 -right-4 md:-right-12 bg-white rounded-xl border border-[#F0F0F0] shadow-xl p-3 flex items-center gap-3"
            style={{ animation: 'float 3.5s ease-in-out infinite 0.5s' }}
          >
            <div className="w-12 h-12 rounded-full border-[3px] border-[#1D9E75] flex items-center justify-center">
              <span className="font-syne text-sm font-bold text-[#0A0A0A]">74</span>
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280]">Growth Score</p>
              <p className="text-xs font-bold text-[#0A0A0A]">74<span className="text-[#6B7280]">/100</span></p>
              <p className="text-[10px] text-[#1D9E75]">+12 this month</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute -bottom-6 right-4 md:-right-8 bg-white rounded-xl border border-[#F0F0F0] shadow-xl p-3"
            style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}
          >
            <p className="text-[10px] font-semibold text-[#0A0A0A] mb-2">📱 6 social posts scheduled</p>
            <div className="flex gap-1.5">
              {['Instagram', 'Facebook', 'LinkedIn', 'X / Twitter', 'Pinterest', 'YouTube'].map((p) => (
                <PlatformLogo key={p} name={p} size={20} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// =====================================================
// SECTION 2 — THE FEAR
// =====================================================
const FearSection = () => (
  <InView className="relative bg-[#0A0A0A] text-white py-24 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <motion.div variants={fadeUp} className="text-center max-w-4xl mx-auto mb-14">
        <h2 className="font-syne text-3xl md:text-5xl font-bold mb-4 leading-tight">
          Right Now, AI Is Recommending<br /><span className="text-[#1D9E75]">Your Competitors</span> Instead of You
        </h2>
        <p className="text-[#9CA3AF] text-lg leading-relaxed">
          When your potential customers ask ChatGPT or Perplexity for recommendations in your industry — does your business come up? Or does your competitor?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Without */}
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="rounded-2xl p-6 border border-[#EF4444]/30" style={{ background: 'linear-gradient(180deg, rgba(239,68,68,0.08) 0%, rgba(10,10,10,0) 100%)' }}>
          <span className="inline-block px-3 py-1 bg-[#EF4444]/20 text-[#FCA5A5] text-xs font-semibold rounded-full mb-4">❌ Without SEO Jalwa</span>
          <div className="bg-[#1F2937]/70 rounded-xl p-4 border border-white/5">
            <p className="text-xs text-[#9CA3AF] mb-1">User asks ChatGPT</p>
            <p className="text-sm mb-3">"What's the best [your service] in [your city]?"</p>
            <p className="text-xs text-[#9CA3AF] mb-1">ChatGPT responds</p>
            <p className="text-sm mb-2">Based on my knowledge, here are the top options:</p>
            <ol className="space-y-1.5 text-sm">
              <li><span className="text-[#1D9E75]">✓</span> <strong>CompetitorA</strong> — Well-known for results</li>
              <li><span className="text-[#1D9E75]">✓</span> <strong>CompetitorB</strong> — Highly rated by customers</li>
              <li><span className="text-[#1D9E75]">✓</span> <strong>CompetitorC</strong> — A popular choice</li>
            </ol>
            <p className="text-xs text-[#FCA5A5] mt-3 italic">[YOUR BUSINESS] is not prominently featured in AI recommendations.</p>
          </div>
          <p className="text-center mt-4 text-[#FCA5A5] font-semibold">Your business: Not recommended</p>
        </motion.div>

        {/* With */}
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="rounded-2xl p-6 border border-[#1D9E75]/40" style={{ background: 'linear-gradient(180deg, rgba(29,158,117,0.10) 0%, rgba(10,10,10,0) 100%)' }}>
          <span className="inline-block px-3 py-1 bg-[#1D9E75]/20 text-[#1D9E75] text-xs font-semibold rounded-full mb-4">✅ With SEO Jalwa</span>
          <div className="bg-[#1F2937]/70 rounded-xl p-4 border border-white/5">
            <p className="text-xs text-[#9CA3AF] mb-1">User asks ChatGPT</p>
            <p className="text-sm mb-3">"What's the best [your service] in [your city]?"</p>
            <p className="text-xs text-[#9CA3AF] mb-1">ChatGPT responds</p>
            <p className="text-sm mb-2">Based on my knowledge, here are the top options:</p>
            <ol className="space-y-1.5 text-sm">
              <li><span className="text-[#1D9E75]">✓</span> <strong className="text-[#1D9E75]">YOUR BUSINESS</strong> — Leading provider known for exceptional results and consistently high-quality content</li>
              <li>CompetitorA</li>
              <li>CompetitorB</li>
            </ol>
          </div>
          <p className="text-center mt-4 text-[#1D9E75] font-semibold">Your business: #1 Recommended</p>
        </motion.div>
      </div>

      {/* 3 stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { stat: '67%', label: 'of buyers now start on AI search' },
          { stat: '3x', label: 'more leads from AI-recommended brands' },
          { stat: '319%', label: 'average traffic increase in first 90 days' },
        ].map((s) => (
          <div key={s.stat} className="bg-[#1F2937]/60 border border-white/5 rounded-xl p-6 text-center">
            <p className="font-bricolage text-4xl md:text-5xl font-extrabold text-[#1D9E75] mb-1">{s.stat}</p>
            <p className="text-sm text-[#9CA3AF]">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="text-center">
        <Link to="/signup">
          <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white h-12 px-7 rounded-full transition-transform hover:scale-[1.02]" data-testid="fear-cta">
            Fix My AI Visibility <ArrowRight size={18} className="ml-1" />
          </Button>
        </Link>
      </motion.div>
    </div>
  </InView>
);

// =====================================================
// SECTION 3 — SOCIAL PROOF BAR
// =====================================================
const SOCIAL_LOGOS = ['WordPress', 'Shopify', 'Webflow', 'Ghost', 'HubSpot', 'Wix', 'Notion', 'Squarespace', 'Google Search Console', 'LinkedIn', 'Instagram', 'Facebook', 'X / Twitter'];

const SocialProofBar = () => (
  <section className="bg-white border-y border-[#F0F0F0] py-10">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-center gap-3 mb-6 text-sm text-[#6B7280]">
        <Stars size={16} />
        <span>Trusted by <strong className="text-[#0A0A0A]">2,400+ businesses</strong> growing on autopilot</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee">
          {[...SOCIAL_LOGOS, ...SOCIAL_LOGOS].map((l, i) => (
            <div key={i} className="flex-shrink-0 mx-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#F0F0F0]">
              <PlatformLogo name={l} size={24} />
              <span className="text-sm font-medium text-[#6B7280] whitespace-nowrap">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// =====================================================
// SECTION 4 — HOW IT WORKS
// =====================================================
const HowItWorks = () => {
  const steps = [
    { icon: Plug,    title: 'Connect Your Website',           desc: 'Install our plugin or connect via OAuth in under 2 minutes. We automatically learn your niche, audience, and competitors.' },
    { icon: Pen,     title: 'We Write Expert Articles Daily', desc: 'Our AI researches the best topics for your business and publishes 1 SEO-optimized article to your website every single day.' },
    { icon: Share2,  title: 'Your Content Goes Everywhere',   desc: 'Every article is automatically repurposed into social posts for Instagram, LinkedIn, Facebook, X, Pinterest and YouTube.' },
    { icon: TrendingUp, title: 'Watch Your Traffic Explode',  desc: 'Track rankings, AI visibility, and traffic growth from one dashboard. Your Growth Score climbs every week.' },
  ];
  return (
    <InView id="how-it-works" className="bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1D9E75] mb-3">Simple by design</p>
          <h2 className="font-syne text-3xl md:text-5xl font-bold text-[#0A0A0A]">From Setup to Growing Traffic in 4 Steps</h2>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Connecting dotted line */}
          <div className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-[#1D9E75]/30" />
          {steps.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="relative bg-white text-center">
              <div className="relative inline-flex items-center justify-center w-[72px] h-[72px] rounded-full bg-[#E1F5EE] mb-4 z-10">
                <s.icon size={28} className="text-[#1D9E75]" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0A0A0A] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
              </div>
              <h3 className="font-syne text-lg font-bold text-[#0A0A0A] mb-2">{s.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Writing sample preview */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-8 max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-3">Writing Example: What your articles will look like</p>
          <h3 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-3">10 SEO Trends That Will Dominate 2026</h3>
          <p className="text-[#0A0A0A] leading-relaxed mb-2">
            The SEO landscape is shifting faster than at any point in the last decade. AI search engines now influence{' '}
            <a href="#" className="text-[#1D9E75] underline hover:no-underline">67% of buying decisions</a>, Core Web Vitals are a hard ranking floor, and Google's helpful-content updates have made thin pages a liability.
          </p>
          <p className="text-[#0A0A0A] leading-relaxed mb-2">
            In this guide, we break down the ten trends that matter most for the year ahead — and exactly what to do about each. From{' '}
            <a href="#" className="text-[#1D9E75] underline hover:no-underline">topical authority architecture</a> to E-E-A-T signals, you'll have a clear playbook.
          </p>
          <p className="text-[#0A0A0A] leading-relaxed mb-4">
            Most websites we audit are leaking 30–60% of their potential organic traffic because of fixable issues. This article walks through every one of them, with concrete steps.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-[#F9FAFB] border border-[#F0F0F0] rounded-full text-xs text-[#6B7280]">2,100 words</span>
            <span className="px-2.5 py-1 bg-[#E1F5EE] text-[#1D9E75] rounded-full text-xs font-medium">SEO Score: 91/100</span>
            <span className="px-2.5 py-1 bg-[#F9FAFB] border border-[#F0F0F0] rounded-full text-xs text-[#6B7280] inline-flex items-center gap-1"><PlatformLogo name="WordPress" size={14} /> Published to WordPress</span>
          </div>
        </motion.div>

        {/* Vs agencies */}
        <motion.div variants={fadeUp} className="mt-12 max-w-4xl mx-auto">
          <p className="text-center text-sm text-[#6B7280] mb-6">Unlike agencies that keep you in the dark:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#EF4444]/20 rounded-xl p-6 space-y-2">
              {['Waiting weeks for content', '$3,000–$5,000/month agency fees', 'No visibility into performance'].map((t) => (
                <p key={t} className="flex items-start gap-2 text-sm text-[#0A0A0A]"><XIcon size={16} className="text-[#EF4444] mt-0.5 flex-shrink-0" />{t}</p>
              ))}
            </div>
            <div className="bg-white border border-[#1D9E75]/30 rounded-xl p-6 space-y-2">
              {['Article published every day', 'Real-time ranking data', 'Cancel anytime, no contracts'].map((t) => (
                <p key={t} className="flex items-start gap-2 text-sm text-[#0A0A0A]"><Check size={16} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />{t}</p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </InView>
  );
};

// =====================================================
// SECTION 5 — REAL RESULTS
// =====================================================
const RealResults = () => (
  <InView className="bg-[#F9FAFB] py-24 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1D9E75] mb-3">Real businesses. Real growth. Real fast.</p>
        <h2 className="font-syne text-3xl md:text-5xl font-bold text-[#0A0A0A]">Numbers That Speak for Themselves</h2>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div>
          <CountStat value={2400} suffix="+" />
          <p className="text-center text-sm text-[#6B7280] mt-1">Businesses on autopilot</p>
        </div>
        <div>
          <p className="font-bricolage text-5xl md:text-6xl font-extrabold text-[#1D9E75] text-center">1 article</p>
          <p className="text-center text-sm text-[#6B7280] mt-1">Published per day, per site</p>
        </div>
        <div>
          <CountStat value={67} suffix="%" />
          <p className="text-center text-sm text-[#6B7280] mt-1">Average traffic increase in 90 days</p>
        </div>
        <div>
          <p className="font-bricolage text-5xl md:text-6xl font-extrabold text-[#1D9E75] text-center">#1</p>
          <p className="text-center text-sm text-[#6B7280] mt-1">AI recommendation achieved by our users</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { company: 'StyleBoutique.co', industry: 'Fashion & Retail',     metric: '+216% organic traffic', time: 'in 90 days',         quote: 'We connected our Shopify store and let SEO Jalwa run. Three months later we\'re getting 3x the organic visitors without spending a dollar on ads. The articles it writes are genuinely better than our old agency.', name: 'Sarah K., Founder' },
          { company: 'ProjectFlow App',  industry: 'B2B SaaS',             metric: 'ChatGPT recommends us first', time: 'after 60 days', quote: 'Our Growth Score went from 31 to 78 in 60 days. We\'re now the top recommendation when anyone asks AI about project management tools in our category. Pipeline is up 40%.', name: 'Marcus T., CEO' },
          { company: 'Surge Digital',    industry: 'Marketing Agency',     metric: '12 client brands on autopilot', time: 'saves 40hrs/week', quote: 'As an agency managing 12 clients, SEO Jalwa is the only tool I couldn\'t work without. Each client gets daily content. Social posts write themselves. I spend my time on strategy, not production.', name: 'Priya M., Agency Owner' },
        ].map((r, i) => (
          <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl border border-[#F0F0F0] p-7 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="font-syne font-bold text-[#0A0A0A]">{r.company}</p>
              <span className="px-2 py-0.5 bg-[#F9FAFB] border border-[#F0F0F0] text-[#6B7280] text-[10px] font-medium rounded-full">{r.industry}</span>
            </div>
            <p className="font-bricolage text-2xl font-extrabold text-[#1D9E75] leading-tight mb-1">{r.metric}</p>
            <p className="text-xs text-[#6B7280] mb-5">{r.time}</p>
            <p className="text-sm text-[#0A0A0A] leading-relaxed mb-6 flex-1">"{r.quote}"</p>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-sm font-medium text-[#0A0A0A]">{r.name}</p>
              <Stars />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </InView>
);

// =====================================================
// SECTION 6 — COMPARISON
// =====================================================
const ComparisonRow = ({ label, left, right, last }) => (
  <div className={`grid grid-cols-3 ${!last ? 'border-b border-[#F0F0F0]' : ''}`}>
    <div className="p-4 text-sm font-medium text-[#0A0A0A] bg-[#F9FAFB]">{label}</div>
    <div className="p-4 text-sm text-[#6B7280] flex items-start gap-2"><XIcon size={16} className="text-[#EF4444] mt-0.5 flex-shrink-0" />{left}</div>
    <div className="p-4 text-sm text-[#0A0A0A] flex items-start gap-2"><Check size={16} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />{right}</div>
  </div>
);

const Comparison = () => (
  <InView className="bg-white py-24 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
      <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="font-syne text-3xl md:text-5xl font-bold text-[#0A0A0A] leading-tight">
          Agency-Quality SEO.<br />
          <span className="text-[#1D9E75]">Without the $5,000/Month Bill.</span>
        </h2>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-[#F0F0F0] overflow-hidden">
        <div className="grid grid-cols-3 bg-[#0A0A0A] text-white">
          <div className="p-5"></div>
          <div className="p-5 border-l border-white/10">
            <p className="font-syne font-bold mb-2">Traditional SEO Agency</p>
            <span className="inline-block px-2.5 py-1 bg-[#EF4444]/20 text-[#FCA5A5] text-xs font-semibold rounded-full">Avg $3,000–$5,000/month</span>
          </div>
          <div className="p-5 border-l border-white/10 bg-[#1D9E75]/10">
            <p className="font-syne font-bold mb-2">SEO Jalwa</p>
            <span className="inline-block px-2.5 py-1 bg-[#1D9E75] text-white text-xs font-semibold rounded-full">Starting at $79/month</span>
            <p className="text-xs text-[#1D9E75] mt-1">Most Popular: $199/mo</p>
          </div>
        </div>
        {[
          ['Articles per month',       '4–8 articles ($500+ each)',  '30 articles (daily publishing)'],
          ['Turnaround time',          '1–2 weeks per article',      'Published automatically daily'],
          ['Social media',             'Extra $500–$1,500/mo',       'Included — all platforms'],
          ['AI visibility monitoring', 'Not offered',                'Included — all AI models'],
          ['Contract',                 '6–12 month minimum',         'Cancel anytime'],
          ['Reporting',                'Monthly PDF report',         'Real-time dashboard'],
          ['Setup time',               '2–4 week onboarding',        'Under 10 minutes'],
        ].map((r, i, a) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}>
            <ComparisonRow label={r[0]} left={r[1]} right={r[2]} last={i === a.length - 1} />
          </motion.div>
        ))}
      </motion.div>

      {/* Savings calc */}
      <motion.div variants={fadeUp} className="mt-10 max-w-2xl mx-auto bg-[#E1F5EE] rounded-2xl p-8">
        <p className="text-center text-sm uppercase tracking-wider text-[#0A0A0A] font-semibold mb-4">Your Savings Breakdown</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Traditional agency cost</span><span className="text-[#0A0A0A] font-medium">$4,000/mo</span></div>
          <div className="flex justify-between text-sm"><span className="text-[#6B7280]">SEO Jalwa Growth plan</span><span className="text-[#0A0A0A] font-medium">$199/mo</span></div>
          <div className="border-t border-[#1D9E75]/30 pt-2 flex justify-between"><span className="font-semibold text-[#0A0A0A]">You save</span><span className="font-bricolage text-3xl font-extrabold text-[#1D9E75]">$3,801/mo</span></div>
          <p className="text-center text-[#0A0A0A] text-sm mt-2">Annual savings: <span className="font-bricolage text-2xl font-extrabold text-[#1D9E75]">$45,612</span>/year</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-8 text-center">
        <Link to="/signup">
          <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white h-12 px-7 rounded-full transition-transform hover:scale-[1.02]">
            Start Saving Today <ArrowRight size={18} className="ml-1" />
          </Button>
        </Link>
      </motion.div>
    </div>
  </InView>
);

// =====================================================
// SECTION 7 — AI MIRROR DEMO
// =====================================================
const AIMirror = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const submit = () => {
    if (!url) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const domain = url.replace(/https?:\/\//, '').split('/')[0];
      setResult({
        domain,
        score: 23,
        response: `Based on available information, ${domain} appears to be a business providing services in its industry. However, when potential customers ask about the best solutions in this space, your brand is not prominently featured in AI recommendations. Competitors are mentioned more frequently in AI-generated responses.`,
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <InView className="bg-[#111827] text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2 variants={fadeUp} className="font-syne text-3xl md:text-5xl font-bold mb-3">What Does AI Say About Your Business Right Now?</motion.h2>
        <motion.p variants={fadeUp} className="text-[#9CA3AF] mb-8 text-lg">Type your website URL. See what ChatGPT actually says about you in seconds. No signup needed.</motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-2 mb-8">
          <Input
            value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="https://yourwebsite.com"
            className="flex-1 h-12 bg-[#1F2937] border-white/10 text-white placeholder:text-[#6B7280] focus-visible:ring-[#1D9E75]"
            data-testid="ai-mirror-url"
          />
          <Button onClick={submit} disabled={loading} className="h-12 bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-6 whitespace-nowrap" data-testid="ai-mirror-submit">
            Check My AI Visibility <ArrowRight size={16} className="ml-1.5" />
          </Button>
        </motion.div>

        {loading && (
          <div className="rounded-xl bg-[#1F2937] border border-white/5 p-6">
            <p className="text-[#9CA3AF] mb-4">Scanning ChatGPT, Perplexity, Gemini<span className="animate-pulse">...</span></p>
            <div className="flex justify-center gap-3">
              {['ChatGPT', 'Perplexity', 'Gemini'].map((ai, i) => (
                <motion.div key={ai} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.4 }} className="px-3 py-1.5 bg-[#0A0A0A] rounded-lg text-xs">
                  {ai}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-[#1F2937] border border-white/10 p-6 text-left">
            <p className="text-xs text-[#9CA3AF] mb-2">ChatGPT response for "{result.domain}"</p>
            <p className="text-sm leading-relaxed mb-5">{result.response}</p>
            <p className="text-xs text-[#9CA3AF] mb-1">Your AI Visibility Score</p>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-bricolage text-4xl font-extrabold text-[#EF4444]">{result.score}<span className="text-[#6B7280] text-xl">/100</span></span>
            </div>
            <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden mb-5">
              <div className="h-full bg-[#EF4444]" style={{ width: `${result.score}%` }} />
            </div>
            <Link to="/signup">
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white w-full">Improve this score with SEO Jalwa →</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </InView>
  );
};

// =====================================================
// SECTION 8 — ROI CALCULATOR
// =====================================================
const ROICalculator = () => {
  const [content, setContent] = useState(79);
  const [seo, setSeo] = useState(149);
  const [social, setSocial] = useState(99);
  const [ai, setAi] = useState(199);
  const total = content + seo + social + ai;
  const jalwa = 199;
  const save = Math.max(0, total - jalwa);

  return (
    <InView className="bg-[#E1F5EE] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="font-syne text-3xl md:text-5xl font-bold text-[#0A0A0A]">How Much Are You Overpaying Right Now?</h2>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-8 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {[
              { label: 'Monthly spend on content writing tools', value: content, set: setContent },
              { label: 'Monthly spend on SEO tools',             value: seo,     set: setSeo },
              { label: 'Monthly spend on social media tools',    value: social,  set: setSocial },
              { label: 'Monthly spend on AI writing tools',      value: ai,      set: setAi },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#6B7280]">{s.label}</span>
                  <span className="font-semibold text-[#0A0A0A]">${s.value}</span>
                </div>
                <Slider value={[s.value]} onValueChange={(v) => s.set(v[0])} min={0} max={1000} step={10} />
              </div>
            ))}
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-2xl p-8 flex flex-col justify-center">
            <p className="text-sm text-[#9CA3AF] uppercase tracking-wider mb-2">You're paying right now</p>
            <p className="font-bricolage text-5xl font-extrabold mb-6">${total}<span className="text-xl text-[#6B7280]">/month</span></p>
            <p className="text-sm text-[#9CA3AF] uppercase tracking-wider mb-2">SEO Jalwa Growth plan</p>
            <p className="font-bricolage text-3xl font-extrabold text-[#1D9E75] mb-6">${jalwa}/month</p>
            <div className="border-t border-white/10 pt-5">
              <p className="text-sm text-[#9CA3AF] uppercase tracking-wider mb-1">You save</p>
              <p className="font-bricolage text-5xl font-extrabold text-[#1D9E75]">${save}<span className="text-xl text-white">/mo</span></p>
              <p className="text-sm text-[#9CA3AF] mt-1">${(save * 12).toLocaleString()} per year</p>
            </div>
          </div>
        </motion.div>
      </div>
    </InView>
  );
};

// =====================================================
// SECTION 9 — WHAT YOU GET
// =====================================================
const WhatYouGet = () => {
  const cards = [
    { icon: Eye,        title: 'AI Visibility',           tagline: 'Get recommended by every AI search engine',
      desc: 'We monitor what ChatGPT, Perplexity, Gemini, Claude and Copilot say about your brand every week. Get your Growth Score and a clear action plan to become the top AI recommendation in your category.',
      features: ['Monitor 5 AI models weekly', 'Growth Score 0–100', 'Competitor visibility comparison', 'Step-by-step improvement plan', 'Weekly alert emails'] },
    { icon: Calendar,   title: 'Daily Article Publishing', tagline: '1 expert article published to your site every day',
      desc: 'Our AI researches the best keywords for your business, writes expert-level articles that rank on Google, and publishes them directly to your WordPress, Shopify, Webflow, or any other platform — all without you lifting a finger.',
      features: ['1 article per day, automatically', 'AI keyword research included', 'Publishes to 10+ platforms', 'Hero images generated per article', 'Google Search Console tracking'] },
    { icon: Share2,     title: 'Social Media Autopilot',  tagline: 'Your brand posts itself every single day',
      desc: 'Every article you publish automatically becomes 6 social posts — formatted perfectly for Instagram, Facebook, LinkedIn, X, Pinterest, and YouTube. AI-generated images included. Zero effort required.',
      features: ['6 platforms covered', 'AI-generated images per post', 'Platform-specific formatting', 'Smart scheduling by best time', 'Traffic attribution per post'] },
    { icon: Pen,        title: 'AI Writer',               tagline: 'Writes exactly like your brand — not like every other AI tool',
      desc: 'Train our AI on your existing content and it learns your brand voice perfectly. Every article, email, and social post sounds unmistakably like you — not generic AI output that all your competitors are also using.',
      features: ['Custom brand voice model', 'Blog articles, emails, ad copy', 'Voice consistency scorer', '100+ languages supported', 'Repurpose content in one click'] },
  ];
  return (
    <InView className="bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-syne text-3xl md:text-5xl font-bold text-[#0A0A0A] mb-3">Everything Your Brand Needs to Dominate Online</h2>
          <p className="text-lg text-[#6B7280]">Four modules. One platform. Your entire growth stack — automated.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((c) => (
            <motion.div key={c.title} variants={fadeUp} className="bg-white rounded-2xl border border-[#F0F0F0] p-7 hover:border-[#1D9E75] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-[#E1F5EE] flex items-center justify-center">
                  <c.icon size={20} className="text-[#1D9E75]" />
                </div>
                <h3 className="font-syne text-xl font-bold text-[#0A0A0A]">{c.title}</h3>
              </div>
              <p className="text-[#1D9E75] font-medium mb-3">{c.tagline}</p>
              <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">{c.desc}</p>
              <ul className="space-y-2">
                {c.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#0A0A0A]">
                    <Check size={16} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </InView>
  );
};

// =====================================================
// SECTION 10 — INTEGRATIONS
// =====================================================
const INTEGRATIONS_GRID = ['WordPress', 'Shopify', 'Webflow', 'Ghost', 'HubSpot', 'Wix', 'Squarespace', 'Notion', 'Next.js', 'Google Search Console', 'Instagram', 'Facebook', 'LinkedIn', 'X / Twitter', 'Pinterest', 'YouTube', 'Zapier', 'Make'];

const Integrations = () => (
  <InView className="bg-[#F9FAFB] py-24 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
      <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="font-syne text-3xl md:text-5xl font-bold text-[#0A0A0A] mb-3">Plugs Into Everything You Already Use</h2>
        <p className="text-[#6B7280] text-lg">No migration. No switching. Just connect and go.</p>
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {INTEGRATIONS_GRID.map((p) => (
          <div key={p} className="bg-white rounded-xl border border-[#F0F0F0] p-4 flex flex-col items-center gap-2 hover:border-[#1D9E75] transition-colors">
            <PlatformLogo name={p} size={36} />
            <span className="text-xs text-[#6B7280] text-center">{p}</span>
          </div>
        ))}
      </motion.div>
      <motion.p variants={fadeUp} className="text-center text-sm text-[#6B7280] mt-6">+ Open API for anything else</motion.p>
    </div>
  </InView>
);

// =====================================================
// SECTION 11 — PRICING PREVIEW
// =====================================================
const PLAN_DEFAULT_FEATURES = {
  starter: ['1 connected site', '15 articles per month', 'AI Visibility (3 models)', 'Social posts (3 platforms)', 'Email support'],
  growth:  ['3 connected sites', '30 articles per month (1/day)', 'AI Visibility (all 5 models)', 'All 6 social platforms', 'Brand voice AI writer', 'Priority support'],
  agency:  ['10 connected sites', 'Unlimited articles', 'AI Visibility (all 5 models)', 'All 6 social platforms', 'White-label reports', 'Dedicated success manager'],
};

const Pricing = () => {
  const { getPricing } = useUser();
  const pricing = getPricing();
  const [annual, setAnnual] = useState(false);
  const safeFeatures = (planObj, fallback) => {
    if (Array.isArray(planObj?.features)) return planObj.features;
    return fallback;
  };
  const plans = [
    { id: 'starter', plan: { ...pricing.starter, features: safeFeatures(pricing.starter, PLAN_DEFAULT_FEATURES.starter) } },
    { id: 'growth',  plan: { ...pricing.growth,  features: safeFeatures(pricing.growth,  PLAN_DEFAULT_FEATURES.growth)  }, popular: true },
    { id: 'agency',  plan: { ...pricing.agency,  features: safeFeatures(pricing.agency,  PLAN_DEFAULT_FEATURES.agency)  } },
  ];

  return (
    <InView className="bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="font-syne text-3xl md:text-5xl font-bold text-[#0A0A0A] mb-3">Simple, Transparent Pricing</h2>
          <p className="text-[#6B7280] mb-6">Cancel anytime. No contracts. No surprises.</p>
          <div className="inline-flex items-center bg-[#F9FAFB] rounded-full p-1 border border-[#F0F0F0]">
            <button onClick={() => setAnnual(false)} className={`px-4 py-1.5 rounded-full text-sm transition-colors ${!annual ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280]'}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`px-4 py-1.5 rounded-full text-sm transition-colors ${annual ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280]'}`}>Annual <span className="text-[#1D9E75] text-xs ml-1">Save 17%</span></button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((p) => (
            <div key={p.id} className={`relative bg-white rounded-2xl border p-7 ${p.popular ? 'border-[#1D9E75] shadow-lg' : 'border-[#F0F0F0]'}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1D9E75] text-white text-xs font-semibold rounded-full">MOST POPULAR</span>}
              <p className="font-syne text-xl font-bold text-[#0A0A0A] mb-4">{p.plan.name}</p>
              <p className="font-bricolage text-5xl font-extrabold text-[#0A0A0A] mb-1">${annual ? p.plan.annualPrice : p.plan.monthlyPrice}<span className="text-base text-[#6B7280] font-normal">/mo</span></p>
              <p className="text-xs text-[#6B7280] mb-5">{annual ? 'billed annually' : 'billed monthly'}</p>
              <ul className="space-y-2 mb-6">
                {(Array.isArray(p.plan.features) ? p.plan.features : []).slice(0, 6).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#0A0A0A]"><Check size={16} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className={`w-full ${p.popular ? 'bg-[#1D9E75] hover:bg-[#0F6E56] text-white' : 'bg-white border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#F9FAFB]'}`}>
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </motion.div>

        {/* Value breakdown */}
        <motion.div variants={fadeUp} className="bg-[#F9FAFB] rounded-2xl p-8 max-w-3xl mx-auto">
          <p className="text-center text-sm uppercase tracking-wider text-[#0A0A0A] font-semibold mb-5">What you get for $199/month (Growth Plan)</p>
          <div className="space-y-2">
            {[
              { label: '30 articles/month written',     value: '$3,000' },
              { label: 'Social posts (100/month)',      value: '$500' },
              { label: 'AI visibility monitoring',      value: '$199' },
              { label: 'Brand voice AI writer',         value: '$79' },
              { label: 'Analytics dashboard',           value: '$99' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#F0F0F0] last:border-b-0">
                <span className="text-sm text-[#6B7280]">{r.label}</span>
                <span className="text-sm font-medium text-[#0A0A0A]">~{r.value} value</span>
              </div>
            ))}
            <div className="pt-3 flex items-center justify-between">
              <span className="font-semibold text-[#0A0A0A]">Total value</span>
              <span className="font-bricolage text-2xl font-extrabold text-[#0A0A0A]">~$3,877/month</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#0A0A0A]">You pay</span>
              <span className="font-bricolage text-2xl font-extrabold text-[#0A0A0A]">$199/month</span>
            </div>
            <div className="bg-[#1D9E75] rounded-xl p-4 flex items-center justify-between mt-3">
              <span className="font-semibold text-white">You save</span>
              <span className="font-bricolage text-3xl font-extrabold text-white">$3,678/month</span>
            </div>
          </div>
        </motion.div>
      </div>
    </InView>
  );
};

// =====================================================
// SECTION 12 — FINAL CTA
// =====================================================
const FinalCTA = () => (
  <InView className="bg-[#0A0A0A] text-white py-24 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto text-center">
      <motion.h2 variants={fadeUp} className="font-bricolage font-extrabold leading-[0.95] mb-6" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
        Your Competitors Are Already <span className="text-[#1D9E75]">on Autopilot.</span>
      </motion.h2>
      <motion.p variants={fadeUp} className="text-[#9CA3AF] text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
        Every day you wait is another day they publish content, climb AI rankings, and take customers that should be yours.
      </motion.p>
      <motion.div variants={fadeUp}>
        <Link to="/signup">
          <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white h-14 px-8 rounded-full text-base transition-transform hover:scale-[1.02]" data-testid="final-cta">
            Start Free Trial — No Card Needed <ArrowRight size={20} className="ml-2" />
          </Button>
        </Link>
      </motion.div>
      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-[#9CA3AF]">
        <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#1D9E75]" /> No credit card required</span>
        <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#1D9E75]" /> Setup in 10 minutes</span>
        <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#1D9E75]" /> Cancel anytime</span>
      </motion.div>
    </div>
  </InView>
);

// =====================================================
// MAIN
// =====================================================
export const HomePage = () => {
  return (
    <div className="overflow-hidden" data-testid="homepage">
      <Hero />
      <FearSection />
      <SocialProofBar />
      <HowItWorks />
      <RealResults />
      <Comparison />
      <AIMirror />
      <ROICalculator />
      <WhatYouGet />
      <Integrations />
      <Pricing />
      <FinalCTA />
    </div>
  );
};
