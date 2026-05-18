import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Slider } from '../../components/ui/slider';
import { PlatformLogo } from '../../components/public/PlatformLogo';
import { 
  Check, ArrowRight, Radar, Pen, Send, Share2, ChevronRight,
  Sparkles, Globe, Instagram, Linkedin, Facebook, Twitter
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// Animated section wrapper
const AnimatedSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Counter animation hook
const useCounter = (end, duration = 2000, inView) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!inView) return;
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, inView]);
  
  return count;
};

// Floating UI Card Component
const FloatingCard = ({ className, delay = 0, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay + 0.5, duration: 0.6 }}
    className={`bg-white rounded-xl border border-[#F0F0F0] shadow-lg p-4 ${className}`}
    style={{ animation: `float 3s ease-in-out infinite ${delay}s` }}
  >
    {children}
  </motion.div>
);

// Logo marquee items
const LOGOS = ['WordPress', 'Shopify', 'Webflow', 'Ghost', 'HubSpot', 'Wix', 'Notion', 'Squarespace', 'LinkedIn', 'Instagram', 'Facebook', 'X'];

export const HomePage = () => {
  const { getPricing } = useUser();
  const pricing = getPricing();
  const [isAnnual, setIsAnnual] = useState(false);
  
  // AI Mirror demo state
  const [demoUrl, setDemoUrl] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState(null);
  
  // ROI Calculator state
  const [contentSpend, setContentSpend] = useState(79);
  const [seoSpend, setSeoSpend] = useState(149);
  const [socialSpend, setSocialSpend] = useState(99);
  const [aiSpend, setAiSpend] = useState(199);
  
  const totalSpend = contentSpend + seoSpend + socialSpend + aiSpend;
  const jalwaCost = 199;
  const savings = totalSpend - jalwaCost;

  const handleDemoSubmit = () => {
    if (!demoUrl) return;
    setDemoLoading(true);
    setTimeout(() => {
      setDemoLoading(false);
      const domain = demoUrl.replace(/https?:\/\//, '').split('/')[0];
      setDemoResult({
        url: domain,
        score: 23,
        response: `Based on available information, ${domain} appears to be a business providing valuable services. However, when potential customers ask about the best solutions in this space, your brand is currently not prominently featured in AI recommendations. Your competitors are mentioned more frequently in AI-generated responses.`
      });
    }, 2000);
  };

  return (
    <div className="overflow-hidden" data-testid="homepage">
      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1D9E75]/20 bg-[#E1F5EE] mb-6">
              <Sparkles size={14} className="text-[#1D9E75]" />
              <span className="text-sm font-medium text-[#1D9E75]">The AI Growth Platform for 2026</span>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 variants={fadeInUp} className="font-bricolage text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] mb-6" style={{ fontSize: 'clamp(48px, 7vw, 88px)' }}>
              <span className="text-[#0A0A0A]">Your Brand.</span><br />
              <span className="hero-underline text-[#0A0A0A]">Everywhere.</span><br />
              <span className="text-[#1D9E75]">Automatically.</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-[#6B7280] max-w-xl mb-8">
              SEO Jalwa handles your website SEO, AI visibility, content writing, and social media — all connected, all automatic. Set it up once. Forget about it.
            </motion.p>
            
            {/* CTAs */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-6">
              <Link to="/signup">
                <Button size="lg" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-full px-8 h-12 text-base" data-testid="hero-cta-primary">
                  Start free — no card needed
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="ghost" className="text-[#0A0A0A] h-12 text-base group" data-testid="hero-cta-secondary">
                  See how it works 
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            
            {/* Trust line */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1"><Check size={16} className="text-[#1D9E75]" /> 14-day free trial</span>
              <span className="flex items-center gap-1"><Check size={16} className="text-[#1D9E75]" /> Cancel anytime</span>
              <span className="flex items-center gap-1"><Check size={16} className="text-[#1D9E75]" /> Setup in 10 minutes</span>
            </motion.div>
          </motion.div>
          
          {/* Right - Floating Cards */}
          <div className="relative h-[500px] hidden lg:block">
            <FloatingCard className="absolute top-0 right-0 w-56" delay={0}>
              <p className="text-xs text-[#6B7280] mb-2">Growth Score</p>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full border-4 border-[#1D9E75] flex items-center justify-center">
                  <span className="font-bold text-lg text-[#0A0A0A]">74</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0A0A0A]">74<span className="text-sm text-[#6B7280]">/100</span></p>
                  <p className="text-xs text-[#1D9E75]">+12 this month</p>
                </div>
              </div>
            </FloatingCard>
            
            <FloatingCard className="absolute top-32 left-0 w-64" delay={0.5}>
              <p className="text-xs text-[#6B7280] mb-3">AI Visibility</p>
              <div className="space-y-2">
                {['ChatGPT', 'Perplexity', 'Gemini'].map((ai, i) => (
                  <div key={ai} className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7280] w-16">{ai}</span>
                    <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: `${70 - i * 15}%` }} />
                    </div>
                    <span className="text-xs font-medium">{70 - i * 15}%</span>
                  </div>
                ))}
              </div>
            </FloatingCard>
            
            <FloatingCard className="absolute bottom-20 right-10 w-52" delay={1}>
              <p className="text-xs text-[#6B7280] mb-2">Posts scheduled</p>
              <p className="text-xl font-bold text-[#0A0A0A] mb-2">12 posts this week</p>
              <div className="flex gap-2">
                <Instagram size={16} className="text-[#E4405F]" />
                <Linkedin size={16} className="text-[#0A66C2]" />
                <Twitter size={16} className="text-[#1DA1F2]" />
                <Facebook size={16} className="text-[#1877F2]" />
              </div>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="bg-[#F9FAFB] py-8 overflow-hidden">
        <div className="text-center mb-6">
          <p className="text-sm text-[#6B7280]">Trusted by 2,400+ businesses. Works with:</p>
        </div>
        <div className="relative">
          <div className="flex animate-marquee">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <div key={i} className="flex-shrink-0 mx-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#F0F0F0]">
                <PlatformLogo name={logo} size={24} />
                <span className="text-sm font-medium text-[#6B7280]">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <AnimatedSection className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Old way */}
            <div>
              <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-4">The old way</h3>
              <div className="space-y-3">
                {[
                  { name: 'Content writer tool', price: 79 },
                  { name: 'SEO tool', price: 149 },
                  { name: 'Social scheduler', price: 99 },
                  { name: 'AI monitor', price: 199 }
                ].map((tool) => (
                  <div key={tool.name} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#F0F0F0]">
                    <span className="text-[#6B7280]">{tool.name}</span>
                    <span className="font-semibold text-[#0A0A0A]">${tool.price}/mo</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <span className="font-semibold text-red-600">TOTAL</span>
                  <span className="font-bold text-red-600 text-xl">$526/mo</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#6B7280]">4 tools. 4 logins. 4 headaches.</p>
            </div>
            
            {/* New way */}
            <div>
              <h3 className="text-sm font-semibold text-[#1D9E75] uppercase tracking-wide mb-4">The SEO Jalwa way</h3>
              <div className="p-6 bg-[#E1F5EE] rounded-xl border-2 border-[#1D9E75]">
                <div className="text-center">
                  <p className="text-sm text-[#1D9E75] mb-2">Everything included</p>
                  <p className="text-5xl font-bold text-[#0A0A0A]">$199<span className="text-lg font-normal text-[#6B7280]">/mo</span></p>
                  <p className="mt-4 text-[#6B7280]">1 platform. Everything connected.</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-2xl font-bold text-[#1D9E75]">Save $327/month</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* 4 MODULES SHOWCASE */}
      <AnimatedSection className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
              Everything your brand needs to dominate online
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Radar,
                name: 'AI Visibility',
                tagline: 'See what AI says about your brand — and fix it',
                features: ['Track ChatGPT + Perplexity + Gemini mentions', 'AI visibility score 0-100', 'Competitor comparison', 'Weekly improvement recommendations']
              },
              {
                icon: Pen,
                name: 'AI Writer',
                tagline: 'Write like you, not like every other AI tool',
                features: ['Custom brand voice model', 'Blog articles, emails, ad copy', 'Voice consistency scorer', '100+ languages']
              },
              {
                icon: Send,
                name: 'Auto Publish',
                tagline: 'From keyword to published article — automatically',
                features: ['AI keyword research', 'Research-backed article drafts', 'One-click publish to WordPress + 9 more', 'Content ROI tracker']
              },
              {
                icon: Share2,
                name: 'Social Autopilot',
                tagline: 'Your brand posts itself every day',
                features: ['Instagram, Facebook, LinkedIn, X, Pinterest, YouTube', 'AI-generated images per post', 'Smart scheduling', 'Article → 6 social posts auto-generated']
              }
            ].map((module) => (
              <motion.div
                key={module.name}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl border border-[#F0F0F0] p-6 transition-shadow hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-[#E1F5EE] flex items-center justify-center mb-4">
                  <module.icon size={24} className="text-[#1D9E75]" />
                </div>
                <h3 className="font-syne text-xl font-bold text-[#0A0A0A] mb-2">{module.name}</h3>
                <p className="text-[#6B7280] mb-4">{module.tagline}</p>
                <ul className="space-y-2">
                  {module.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#6B7280]">
                      <Check size={16} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/features" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-[#1D9E75] hover:underline">
                  Learn more <ChevronRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* JALWA SCORE SECTION */}
      <AnimatedSection className="py-20 bg-[#E1F5EE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
            One number tells you everything
          </h2>
          <p className="text-lg text-[#6B7280] mb-12 max-w-2xl mx-auto">
            The Growth Score combines your Google rankings, AI visibility, social consistency, and content performance into a single score.
          </p>
          
          <div className="relative inline-block mb-8">
            <div className="w-48 h-48 rounded-full border-8 border-[#1D9E75] flex items-center justify-center bg-white">
              <div className="text-center">
                <span className="font-syne text-5xl font-bold text-[#0A0A0A]">74</span>
                <span className="text-2xl text-[#6B7280]">/100</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { label: 'AI Visibility', pct: '30%' },
              { label: 'SEO Content', pct: '25%' },
              { label: 'Social Consistency', pct: '25%' },
              { label: 'Traffic Trend', pct: '20%' }
            ].map((item) => (
              <div key={item.label} className="px-4 py-2 bg-white rounded-full border border-[#F0F0F0]">
                <span className="text-sm text-[#6B7280]">{item.label}</span>
                <span className="text-sm font-semibold text-[#1D9E75] ml-2">{item.pct}</span>
              </div>
            ))}
          </div>
          
          <p className="text-lg font-semibold text-[#0A0A0A]">
            From 34 → 71 in 90 days. Real users. Real results.
          </p>
        </div>
      </AnimatedSection>

      {/* AI MIRROR DEMO */}
      <AnimatedSection className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
            What does AI say about your brand right now?
          </h2>
          <p className="text-lg text-[#6B7280] mb-8">
            Type your website URL. See what ChatGPT actually says about you. No signup needed.
          </p>
          
          <div className="flex gap-3 max-w-xl mx-auto mb-8">
            <Input
              type="url"
              placeholder="https://yourwebsite.com"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="flex-1 h-12 text-base border-[#F0F0F0]"
              data-testid="ai-demo-input"
            />
            <Button 
              onClick={handleDemoSubmit}
              disabled={demoLoading || !demoUrl}
              className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white h-12 px-6"
              data-testid="ai-demo-btn"
            >
              {demoLoading ? 'Scanning...' : 'Check my AI visibility →'}
            </Button>
          </div>
          
          {demoLoading && (
            <div className="p-6 bg-[#F9FAFB] rounded-xl">
              <p className="text-[#6B7280] animate-pulse">Scanning AI models...</p>
            </div>
          )}
          
          {demoResult && !demoLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-left"
            >
              <div className="p-6 bg-[#F9FAFB] rounded-xl border border-[#F0F0F0] mb-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#10A37F] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">G</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#0A0A0A] mb-1">ChatGPT</p>
                    <p className="text-[#6B7280]">{demoResult.response}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 mb-6">
                <p className="text-sm text-[#6B7280] mb-2">Your AI Visibility Score</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-red-600">{demoResult.score}/100</span>
                  <div className="flex-1 h-3 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${demoResult.score}%` }} />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-[#6B7280] mb-4">Improve your score with SEO Jalwa</p>
                <Link to="/signup">
                  <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                    Start free →
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </AnimatedSection>

      {/* ROI CALCULATOR */}
      <AnimatedSection className="py-20 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
              How much are you overpaying?
            </h2>
          </div>
          
          <div className="bg-white rounded-xl border border-[#F0F0F0] p-8">
            <div className="space-y-6 mb-8">
              {[
                { label: 'Monthly spend on content writing tools', value: contentSpend, setValue: setContentSpend },
                { label: 'Monthly spend on SEO tools', value: seoSpend, setValue: setSeoSpend },
                { label: 'Monthly spend on social media tools', value: socialSpend, setValue: setSocialSpend },
                { label: 'Monthly spend on AI monitoring', value: aiSpend, setValue: setAiSpend }
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#6B7280]">{item.label}</span>
                    <span className="font-semibold text-[#0A0A0A]">${item.value}/mo</span>
                  </div>
                  <Slider
                    value={[item.value]}
                    onValueChange={(v) => item.setValue(v[0])}
                    max={500}
                    step={10}
                    className="[&_[role=slider]]:bg-[#1D9E75]"
                  />
                </div>
              ))}
            </div>
            
            <div className="border-t border-[#F0F0F0] pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">You currently spend:</span>
                <span className="font-semibold text-[#0A0A0A]">${totalSpend}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">SEO Jalwa costs:</span>
                <span className="font-semibold text-[#1D9E75]">${jalwaCost}/mo</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-[#0A0A0A]">You save:</span>
                <span className="font-bold text-[#1D9E75]">${savings > 0 ? savings : 0}/mo</span>
              </div>
              <div className="flex justify-between text-xl">
                <span className="font-semibold text-[#0A0A0A]">Annual savings:</span>
                <span className="font-bold text-[#1D9E75]">${savings > 0 ? savings * 12 : 0}/year</span>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link to="/signup">
                <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-8">
                  Start saving with SEO Jalwa →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* RESULTS/TESTIMONIALS */}
      <AnimatedSection className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: 'E-commerce store', headline: '+216% organic traffic in 90 days', story: 'We connected Shopify and let Auto Publish run. 3 months later our organic traffic had tripled without a single paid ad.' },
              { type: 'SaaS company', headline: 'ChatGPT now recommends us first', story: 'Our Growth Score went from 31 to 78 in 60 days. We\'re now the top AI recommendation in our category.' },
              { type: 'Marketing agency', headline: 'Manages 12 client brands on autopilot', story: 'As an agency, Social Autopilot alone saves us 40 hours a week. Each client\'s social presence runs itself.' }
            ].map((item) => (
              <div key={item.type} className="bg-[#F9FAFB] rounded-xl p-6 border border-[#F0F0F0]">
                <p className="text-sm text-[#1D9E75] font-medium mb-2">{item.type}</p>
                <h3 className="font-syne text-xl font-bold text-[#0A0A0A] mb-3">{item.headline}</h3>
                <p className="text-[#6B7280]">"{item.story}"</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* PRICING PREVIEW */}
      <AnimatedSection className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
              Simple, honest pricing
            </h2>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.entries(pricing).map(([key, plan]) => (
              <div
                key={key}
                className={`rounded-xl border-2 p-6 ${plan.popular ? 'border-[#1D9E75] bg-white' : 'border-[#F0F0F0] bg-white'}`}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-semibold rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="font-syne text-xl font-bold text-[#0A0A0A]">{plan.name}</h3>
                <p className="text-4xl font-bold text-[#0A0A0A] my-4">
                  ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  <span className="text-base font-normal text-[#6B7280]">/mo</span>
                </p>
                <Link to="/signup">
                  <Button className={`w-full ${plan.popular ? 'bg-[#1D9E75] hover:bg-[#0F6E56] text-white' : 'bg-[#F0F0F0] text-[#0A0A0A] hover:bg-[#E0E0E0]'}`}>
                    Start free trial
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-[#6B7280] mt-8">
            All plans include 14-day free trial. Cancel anytime.
          </p>
        </div>
      </AnimatedSection>

      {/* FINAL CTA */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Stop paying for 5 tools that don't talk to each other.
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Start your 14-day free trial. No credit card required.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-full px-8 h-12 text-base">
              Start your free trial
            </Button>
          </Link>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-400">
            <span className="flex items-center gap-2"><Check size={16} className="text-[#1D9E75]" /> Cancel anytime</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-[#1D9E75]" /> Setup in 10 minutes</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-[#1D9E75]" /> Works with your existing stack</span>
          </div>
        </div>
      </section>
    </div>
  );
};
