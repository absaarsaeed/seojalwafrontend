import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useSite } from '../../context/SiteContext';
import { growthApi, analyticsApi, searchTermsApi, aiVisibilityLatestApi } from '../../lib/api';
import { DASHBOARD_DATA } from '../../data/publicData';
import { Button } from '../../components/ui/button';
import { ArrowRight, ArrowUp, FileText, Share2, Eye, TrendingUp, ExternalLink, Globe, X as XIcon, Check } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const sparklineData = [
  { v: 30 }, { v: 45 }, { v: 35 }, { v: 50 }, { v: 48 }, { v: 60 }, { v: 58 }, { v: 67 }
];

const PriorityBadge = ({ priority }) => {
  const colors = {
    HIGH: 'bg-[#EF4444]/10 text-[#EF4444]',
    MEDIUM: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    LOW: 'bg-[#6B7280]/10 text-[#6B7280]'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const activityIcons = {
  article: FileText,
  social: Share2,
  scan: Eye
};

export const DashboardHome = () => {
  const { user, subscription } = useUser();
  const { activeSite, sites } = useSite();
  const data = DASHBOARD_DATA;

  // Onboarding checklist — persistence keyed per-site, recomputed below.
  const onboardingKey = `jalwa_onboarding_dismissed_${activeSite?.id || 'none'}`;
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  useEffect(() => {
    try { setOnboardingDismissed(localStorage.getItem(onboardingKey) === '1'); } catch {}
  }, [onboardingKey]);
  const dismissOnboarding = () => {
    try { localStorage.setItem(onboardingKey, '1'); } catch {}
    setOnboardingDismissed(true);
  };

  // Live signals for onboarding step completion.
  const [hasSearchTerms, setHasSearchTerms] = useState(false);
  const [hasLatestScan, setHasLatestScan] = useState(false);
  useEffect(() => {
    if (!activeSite?.id) {
      setHasSearchTerms(false);
      setHasLatestScan(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const terms = await searchTermsApi.list(activeSite.id);
        const list = Array.isArray(terms) ? terms : terms?.items || terms?.terms || [];
        if (!cancelled) setHasSearchTerms(list.length > 0);
      } catch { if (!cancelled) setHasSearchTerms(false); }
      try {
        const latest = await aiVisibilityLatestApi.latest(activeSite.id);
        if (!cancelled) setHasLatestScan(!!latest && (latest?.overallScore != null || latest?.id));
      } catch { if (!cancelled) setHasLatestScan(false); }
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id]);

  // Live data overlay
  const [growth, setGrowth] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!activeSite?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const g = await growthApi.get(activeSite.id);
        if (!cancelled) setGrowth(g);
      } catch {}
      try {
        const a = await analyticsApi.overview(activeSite.id, '30d');
        if (!cancelled) setAnalytics(a);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id]);

  const liveScore = growth?.latest?.score;
  const liveScoreChange = growth?.latest?.change ?? growth?.latest?.weeklyChange;
  const displayScore = liveScore ?? data.jalwaScore;
  const displayChange = liveScoreChange ?? data.jalwaScoreChange;

  // Compute onboarding step completion from real signals.
  const onboardingSteps = useMemo(() => {
    const hasSite = Array.isArray(sites) && sites.length > 0;
    const siteConnected = !!(activeSite && (activeSite.wordpressConnected || activeSite.isConnected || activeSite.connected || activeSite.status === 'connected'));
    return [
      { id: 'connect',     label: 'Connect your website',          done: hasSite && siteConnected, to: '/dashboard/connections',     cta: hasSite ? 'Connect' : 'Add site' },
      { id: 'preferences', label: 'Set up article preferences',    done: false /* requires backend */, to: '/dashboard/article-settings', cta: 'Set up' },
      { id: 'topics',      label: 'Add content topics',            done: hasSearchTerms,           to: '/dashboard/auto-publish',    cta: 'Add topics' },
      { id: 'first-scan',  label: 'Run your first AI scan',        done: hasLatestScan,            to: '/dashboard/ai-visibility',   cta: 'Run scan' },
    ];
  }, [sites, activeSite, hasSearchTerms, hasLatestScan]);
  const onboardingDone = onboardingSteps.every((s) => s.done);
  const completedCount = onboardingSteps.filter((s) => s.done).length;
  const showOnboarding = !onboardingDismissed && !onboardingDone;
  const showWelcomeBanner = !activeSite;

  // Build this week's strip (Mon-Sun starting from this week's Monday)
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  const weekTitles = [
    '10 SEO Trends for 2026',
    'AI Content Marketing Guide',
    'Rank #1 with AI Tools',
    'ChatGPT vs Perplexity SEO',
    'Local SEO Checklist',
    'Long-Tail Keywords in AI Era',
    'Topical Authority Guide',
  ];
  const weekArticles = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const past = d < today;
    return {
      date: d,
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      title: weekTitles[i],
      status: past ? 'Published' : 'Scheduled',
    };
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="user-dashboard-home"
    >
      {/* Welcome banner — when no active site */}
      {showWelcomeBanner && (
        <motion.div variants={fadeInUp} className="bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-xl p-5 flex flex-wrap items-center gap-4" data-testid="welcome-banner">
          <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
            <Globe size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <h2 className="font-syne text-lg font-bold text-[#0A0A0A]">Welcome to SEO Jalwa{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!</h2>
            <p className="text-sm text-[#0A0A0A]/80">Add your first website to start tracking AI visibility and publishing articles.</p>
          </div>
          <Link to="/dashboard/connections">
            <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="welcome-banner-cta">
              Connect your site <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Onboarding checklist */}
      {showOnboarding && (
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="onboarding-checklist">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-[#0A0A0A]">Get started with SEO Jalwa</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {completedCount} of {onboardingSteps.length} complete — finish setup to unlock daily auto-publishing.
              </p>
            </div>
            <button
              onClick={dismissOnboarding}
              className="text-[#6B7280] hover:text-[#0A0A0A]"
              aria-label="Dismiss onboarding"
              data-testid="onboarding-dismiss"
            >
              <XIcon size={16} />
            </button>
          </div>
          <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-[#1D9E75] transition-all"
              style={{ width: `${(completedCount / onboardingSteps.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-2">
            {onboardingSteps.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 p-3 bg-[#F9FAFB] rounded-lg"
                data-testid={`onboarding-step-${s.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? 'bg-[#1D9E75] text-white' : 'bg-white border-2 border-[#F0F0F0] text-[#6B7280]'}`}>
                    {s.done ? <Check size={14} /> : <span className="text-xs font-semibold">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${s.done ? 'text-[#6B7280] line-through' : 'text-[#0A0A0A]'}`}>{s.label}</span>
                </div>
                {!s.done && (
                  <Link to={s.to}>
                    <Button size="sm" variant="ghost" className="text-[#1D9E75] hover:bg-[#E1F5EE] h-8" data-testid={`onboarding-cta-${s.id}`}>
                      {s.cta} <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Growth Score */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-[#1D9E75] flex items-center justify-center">
              <div className="text-center">
                <span className="font-syne text-4xl font-bold text-[#0A0A0A]" data-testid="dashboard-growth-score">{displayScore}</span>
                <span className="text-lg text-[#6B7280]">/100</span>
              </div>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-1">Your Growth Score</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#1D9E75]">
              <ArrowUp size={16} />
              <span className="font-medium">+{displayChange} this week</span>
            </div>
            <Link to="/dashboard/growth-score" className="inline-flex items-center gap-1 mt-3 text-sm text-[#1D9E75] hover:underline">
              View full score breakdown <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AI Visibility', value: `${growth?.latest?.aiVisibility ?? data.aiVisibility}%`, change: `+${data.aiVisibilityChange}%`, icon: Eye },
          { label: 'Articles This Month', value: data.articlesThisMonth, change: null, icon: FileText },
          { label: 'Social Posts Scheduled', value: data.socialPostsScheduled, change: null, icon: Share2 },
          { label: 'Total Clicks (30d)', value: analytics?.totalClicks?.toLocaleString() ?? `+${data.trafficChange}%`, change: analytics ? 'live' : 'this month', icon: TrendingUp }
        ].map((metric, i) => (
          <div key={metric.label} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-[#6B7280] uppercase tracking-wide">{metric.label}</p>
              <metric.icon size={16} className="text-[#1D9E75]" />
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A]">{metric.value}</p>
            {metric.change && (
              <p className="text-xs text-[#1D9E75] mt-1">{metric.change}</p>
            )}
            <div className="h-8 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="v" stroke="#1D9E75" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recommended Actions */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
        <h3 className="font-semibold text-[#0A0A0A] mb-4">Today's Recommended Actions</h3>
        <div className="space-y-3">
          {data.recommendations.map((rec) => (
            <div 
              key={rec.id} 
              className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <PriorityBadge priority={rec.priority} />
                <span className="text-sm text-[#0A0A0A]">{rec.text}</span>
              </div>
              <Link to={rec.link}>
                <Button size="sm" variant="ghost" className="text-[#1D9E75] hover:bg-[#E1F5EE]">
                  {rec.action} <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </motion.div>

      {/* This Week's Articles */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="this-week-section">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-[#0A0A0A]">This week's articles</h3>
            <p className="text-xs text-[#6B7280]">Publishing automatically to {activeSite?.domain || 'myblog.com'}</p>
          </div>
          <Link to="/dashboard/auto-publish" className="text-sm text-[#1D9E75] hover:underline inline-flex items-center gap-1">
            View full calendar <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {weekArticles.map((a, i) => (
            <div key={i} className="bg-[#F9FAFB] rounded-lg p-3 flex flex-col min-h-[110px]" data-testid={`week-day-${a.day.toLowerCase()}`}>
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase">{a.day} {a.date.getDate()}</p>
              <p className="text-xs text-[#0A0A0A] mt-1 line-clamp-2 flex-1">{a.title}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${a.status === 'Published' ? 'bg-[#E1F5EE] text-[#1D9E75]' : 'bg-[#F0F0F0] text-[#6B7280]'}`}>
                  {a.status}
                </span>
                <a href="#" className="text-[10px] text-[#1D9E75] hover:underline inline-flex items-center gap-0.5">
                  View <ExternalLink size={9} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
        <h3 className="font-semibold text-[#0A0A0A] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {data.recentActivity.map((activity) => {
            const Icon = activityIcons[activity.icon] || FileText;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#1D9E75]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#0A0A0A]">{activity.text}</p>
                  <p className="text-xs text-[#6B7280]">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
