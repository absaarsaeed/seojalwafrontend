import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { PlatformLogo } from '../../components/public/PlatformLogo';
import { useSite } from '../../context/SiteContext';
import {
  ArrowLeft, ExternalLink, Edit2, RotateCw, Check, X as XIcon, AlertTriangle, Play,
  TrendingUp, TrendingDown,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const TOC = [
  'Why SEO Mistakes Are Costing You',
  'Mistake #1: Keyword Cannibalization',
  'Mistake #2: Ignoring Core Web Vitals',
  'Mistake #3: Thin Content Pages',
  'Mistake #4: Broken Internal Links',
  'Mistake #5: Missing E-E-A-T Signals',
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const Infographic = () => (
  <figure className="my-10 rounded-xl overflow-hidden bg-[#0A0A0A] p-8" data-testid="infographic">
    <div className="text-center mb-6">
      <p className="text-white font-syne text-2xl font-bold">The 5 SEO Mistakes Visualized</p>
      <p className="text-[#9CA3AF] text-xs uppercase tracking-wider mt-1">AI-Generated Infographic</p>
    </div>
    <div className="grid grid-cols-5 gap-3">
      {[
        { n: '01', label: 'Keyword Cannibalization', color: '#1D9E75' },
        { n: '02', label: 'Core Web Vitals',         color: '#2563EB' },
        { n: '03', label: 'Thin Content Pages',      color: '#F59E0B' },
        { n: '04', label: 'Broken Internal Links',   color: '#8B5CF6' },
        { n: '05', label: 'Missing E-E-A-T',         color: '#EF4444' },
      ].map((b) => (
        <div key={b.n} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center text-center backdrop-blur">
          <span className="font-syne text-3xl font-bold" style={{ color: b.color }}>{b.n}</span>
          <span className="text-white text-xs mt-2 leading-tight">{b.label}</span>
        </div>
      ))}
    </div>
    <p className="text-[#9CA3AF] text-[11px] text-center mt-6">SEO Jalwa research, May 2026</p>
  </figure>
);

const YouTubePlaceholder = () => (
  <figure className="my-10" data-testid="youtube-placeholder">
    <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#1F2937] to-[#374151] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-20 h-14 rounded-xl bg-[#FF0000] flex items-center justify-center shadow-lg">
        <Play size={32} className="text-white fill-white ml-1" />
      </div>
    </div>
    <figcaption className="text-sm text-[#6B7280] text-center mt-2 italic">
      Related: How to Fix Internal Linking Issues in 2026
    </figcaption>
  </figure>
);

const StatRow = ({ label, value, delta, positive }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#F0F0F0] last:border-b-0">
    <span className="text-sm text-[#6B7280]">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-[#0A0A0A]">{value}</span>
      {delta && (
        <span className={`text-xs flex items-center gap-0.5 ${positive ? 'text-[#1D9E75]' : 'text-[#EF4444]'}`}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        </span>
      )}
    </div>
  </div>
);

const SeoCheck = ({ label, status, value }) => {
  const icons = {
    good:    <Check        size={14} className="text-[#1D9E75]" />,
    missing: <XIcon        size={14} className="text-[#EF4444]" />,
    warn:    <AlertTriangle size={14} className="text-[#F59E0B]" />,
  };
  return (
    <li className="flex items-center justify-between py-1.5">
      <span className="flex items-center gap-2 text-sm text-[#0A0A0A]">
        {icons[status]} {label}
      </span>
      {value && <span className="text-xs text-[#6B7280]">{value}</span>}
    </li>
  );
};

export const ArticleViewPage = () => {
  const navigate = useNavigate();
  const { activeSite } = useSite();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      data-testid="article-view-page"
    >
      {/* Action bar */}
      <motion.div variants={fadeInUp} className="bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard/auto-publish')}
          className="text-sm text-[#6B7280] hover:text-[#0A0A0A] inline-flex items-center gap-1.5"
          data-testid="back-to-calendar"
        >
          <ArrowLeft size={16} /> Back to Calendar
        </button>
        <span className="px-2.5 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-semibold rounded-full" data-testid="article-status-badge">
          PUBLISHED
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-[#6B7280]"><Edit2 size={14} className="mr-1.5" />Edit</Button>
          <Button variant="ghost" size="sm" className="text-[#6B7280]" onClick={() => window.open('https://example.com/blog/5-seo-mistakes-2026', '_blank')}>
            <ExternalLink size={14} className="mr-1.5" />View Live
          </Button>
          <Button size="sm" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="republish-btn">
            <RotateCw size={14} className="mr-1.5" />Republish
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Article */}
        <motion.article variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6 md:p-12 max-w-[780px] mx-auto lg:mx-0 font-inter">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280] mb-6">
            <span className="px-2.5 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">SEO Tips</span>
            <span>Published May 18, 2026</span>
            <span>·</span>
            <span>8 min read</span>
          </div>

          {/* Title */}
          <h1 className="font-syne font-bold text-[#0A0A0A] mb-4 leading-tight" style={{ fontSize: 40 }}>
            5 SEO Mistakes That Are Killing Your Rankings in 2026 (And How to Fix Them)
          </h1>
          <p className="text-lg text-[#6B7280] mb-8 leading-relaxed">
            Most businesses make these SEO errors without even knowing it. Here's how to identify and fix each one fast.
          </p>

          {/* Hero image */}
          <figure className="mb-10">
            <div className="aspect-video rounded-xl overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E1F5EE 0%, #1D9E75 100%)' }}>
              <span className="font-syne font-bold text-white text-2xl drop-shadow">AI-Generated Hero Image</span>
            </div>
            <figcaption className="text-xs text-[#6B7280] text-center mt-2 italic">Generated by SEO Jalwa AI</figcaption>
          </figure>

          {/* Key Takeaways */}
          <aside className="my-10 p-6 rounded-lg border-l-4 border-[#1D9E75] bg-[#E1F5EE]" data-testid="key-takeaways">
            <p className="font-bold text-[#0A0A0A] mb-3">🔑 Key Takeaways</p>
            <ul className="space-y-2 text-[15px] text-[#0A0A0A]">
              <li>• Most websites lose <strong>40% of potential traffic</strong> due to technical SEO errors</li>
              <li>• Keyword cannibalization silently destroys your rankings over time</li>
              <li>• Page speed under 3 seconds is now a hard ranking requirement</li>
              <li>• Internal linking strategy can increase page authority by 35%</li>
              <li>• AI-generated content outperforms manual content when properly optimized with E-E-A-T signals</li>
            </ul>
          </aside>

          {/* TOC */}
          <nav className="my-10 p-6 rounded-lg border border-[#F0F0F0] bg-white" data-testid="table-of-contents">
            <p className="font-bold text-[#0A0A0A] mb-3">📋 Table of Contents</p>
            <ol className="space-y-1.5 list-decimal list-inside text-[15px] text-[#0A0A0A]">
              {TOC.map((t) => (
                <li key={t}>
                  <a href={`#${slug(t)}`} className="hover:text-[#1D9E75] hover:underline">{t}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Body */}
          <div className="prose-content space-y-5 text-[17px] leading-[1.8] text-[#0A0A0A]">
            <h2 id={slug(TOC[0])} className="font-syne text-2xl font-bold pt-4">Why SEO Mistakes Are Costing You</h2>
            <p>
              The hardest part about SEO isn't doing it well — it's <strong>knowing what you're doing wrong</strong>. Google processes over 8.5 billion searches per day, and the small errors compound into massive ranking losses over time. Most teams we audit are unknowingly leaking 30–60% of the organic traffic they could be capturing.
            </p>
            <p>
              The good news? The mistakes below show up in nearly every site we review, and each of them can be fixed in an afternoon. Our research, backed by tools like{' '}
              <a href="https://ahrefs.com" className="text-[#1D9E75] underline hover:no-underline">Ahrefs</a> and{' '}
              <a href="https://www.semrush.com" className="text-[#1D9E75] underline hover:no-underline">Semrush</a>, shows that resolving even a single one of these issues can lift impressions by 12–20% within 30 days.
            </p>

            <h2 id={slug(TOC[1])} className="font-syne text-2xl font-bold pt-6">Mistake #1: Keyword Cannibalization</h2>
            <p>
              <strong>Keyword cannibalization</strong> happens when two or more pages on your site compete for the same query. Instead of helping each other, they split clicks, dilute authority, and confuse Google about which page to rank. We've seen mature blogs cannibalize their own pillar pages with thin sidebar articles published years earlier.
            </p>
            <p>
              Run a search like <em>site:yourdomain.com "your target keyword"</em>. If more than one URL surfaces strongly, you have cannibalization. The fix is straightforward: pick the strongest page, 301-redirect the rest, and consolidate the unique value (data, examples, internal links) into the survivor.
            </p>
            <p>
              Don't underestimate this. In a recent audit, a single round of cannibalization cleanup moved a SaaS client from position 14 to position 3 within six weeks.
            </p>

            <Infographic />

            <h2 id={slug(TOC[2])} className="font-syne text-2xl font-bold pt-6">Mistake #2: Ignoring Core Web Vitals</h2>
            <p>
              Since 2021, <strong>Core Web Vitals</strong> are a real ranking factor — not just a recommendation. Largest Contentful Paint (LCP) under 2.5 seconds, Interaction to Next Paint (INP) under 200ms, and Cumulative Layout Shift (CLS) under 0.1 are now the floor, not the ceiling.
            </p>
            <p>
              The simplest wins are almost always the same: serve images in WebP, defer non-critical JavaScript, and lazy-load anything below the fold. If you're running WordPress, plugins like LiteSpeed Cache or WP Rocket can solve 70% of the issues with a single configuration pass.
            </p>

            <h2 id={slug(TOC[3])} className="font-syne text-2xl font-bold pt-6">Mistake #3: Thin Content Pages</h2>
            <p>
              Google's helpful-content updates have made <strong>thin content a serious liability</strong>. Pages that exist purely for keywords — without depth, expertise, or original insight — now actively drag down your entire domain's authority.
            </p>
            <p>
              A useful threshold: every page should aim for 1,200+ words, address at least three distinct subtopics, and include original assets (data, screenshots, opinions). If a page doesn't meet that bar after revision, it's a candidate for deletion. Pruning weak pages often boosts the rest of the site more than writing new ones.
            </p>

            <h2 id={slug(TOC[4])} className="font-syne text-2xl font-bold pt-6">Mistake #4: Broken Internal Links</h2>
            <p>
              <strong>Internal links pass authority</strong>. Broken ones leak it. Most teams audit external backlinks religiously and ignore the internal graph entirely. That's a mistake — internal links are the cheapest, fastest lever for moving rankings.
            </p>
            <p>
              Run a crawl with{' '}
              <a href="https://www.screamingfrog.co.uk/seo-spider/" className="text-[#1D9E75] underline hover:no-underline">Screaming Frog</a>{' '}
              once a quarter. Fix every 404, then look for orphan pages — pages with zero incoming internal links. Reconnecting orphans to a pillar page can move them from invisibility to page two almost overnight.
            </p>

            <YouTubePlaceholder />

            <h2 id={slug(TOC[5])} className="font-syne text-2xl font-bold pt-6">Mistake #5: Missing E-E-A-T Signals</h2>
            <p>
              Google's quality raters now weigh <strong>Experience, Expertise, Authoritativeness, and Trustworthiness</strong> heavily — especially for YMYL (Your Money or Your Life) topics. If your articles don't have a real author, a real bio, real credentials, and real lived experience showing through the writing, you'll struggle to rank against competitors who do.
            </p>
            <p>
              The fix isn't cosmetic. Add a genuine author profile, link to social proof, include first-person experience inside the content, and cite primary sources. AI-assisted content can absolutely rank — but only when these signals are present and authentic.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl bg-[#0A0A0A] text-white p-8 text-center" data-testid="article-cta">
            <h3 className="font-syne text-2xl font-bold mb-2">Start Growing Your SEO Today</h3>
            <p className="text-[#9CA3AF] mb-6 max-w-md mx-auto text-sm">
              This article was written and published automatically by SEO Jalwa. Join thousands of businesses growing on autopilot.
            </p>
            <Link to="/signup">
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                Try SEO Jalwa Free →
              </Button>
            </Link>
          </div>
        </motion.article>

        {/* Sidebar */}
        <motion.aside variants={fadeInUp} className="hidden lg:block" data-testid="article-sidebar">
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-xl border border-[#F0F0F0] p-5">
              <h4 className="font-semibold text-[#0A0A0A] mb-3">Article Performance</h4>
              <StatRow label="Impressions"  value="12,847" delta positive />
              <StatRow label="Clicks"        value="234"    delta positive />
              <StatRow label="CTR"           value="1.82%"  delta positive={false} />
              <StatRow label="Avg Position"  value="8.4"    delta positive />
              <Link to="/dashboard/analytics" className="text-sm text-[#1D9E75] hover:underline mt-3 inline-flex items-center gap-1">
                View in Analytics →
              </Link>
            </div>

            {/* SEO score */}
            <div className="bg-white rounded-xl border border-[#F0F0F0] p-5">
              <h4 className="font-semibold text-[#0A0A0A] mb-3">SEO Score</h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#1D9E75] flex items-center justify-center">
                  <span className="font-syne text-xl font-bold text-[#0A0A0A]">78</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1D9E75]">/100</p>
                  <p className="text-xs text-[#6B7280]">Good</p>
                </div>
              </div>
              <ul>
                <SeoCheck label="Keyword usage"    status="good" />
                <SeoCheck label="Readability"      status="good" />
                <SeoCheck label="Meta description" status="missing" />
                <SeoCheck label="Title tag"        status="good" />
                <SeoCheck label="Internal links"   status="warn" />
                <SeoCheck label="Word count"       status="good" value="2,100 words" />
              </ul>
              <a href="#" className="text-sm text-[#1D9E75] hover:underline mt-3 inline-block">Edit article</a>
            </div>

            {/* Keyword */}
            <div className="bg-white rounded-xl border border-[#F0F0F0] p-5">
              <h4 className="font-semibold text-[#0A0A0A] mb-3">Target Keyword</h4>
              <p className="font-syne text-lg font-bold text-[#0A0A0A] mb-2">SEO mistakes 2026</p>
              <p className="text-xs text-[#6B7280] mb-1">Monthly searches: 8,400</p>
              <p className="text-xs text-[#6B7280] mb-2">Keyword difficulty: Medium</p>
              <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#1D9E75]" style={{ width: '55%' }} />
              </div>
            </div>

            {/* Published to */}
            <div className="bg-white rounded-xl border border-[#F0F0F0] p-5">
              <h4 className="font-semibold text-[#0A0A0A] mb-3">Published to</h4>
              <div className="flex items-center gap-3 mb-3">
                <PlatformLogo name="WordPress" size={36} />
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A]">{activeSite?.domain || 'myblog.com'}</p>
                  <p className="text-xs text-[#6B7280]">Last synced: 2 hours ago</p>
                </div>
              </div>
              <a
                href="https://example.com/blog/5-seo-mistakes-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#1D9E75] hover:underline inline-flex items-center gap-1"
              >
                View on site <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
};
