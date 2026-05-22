import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useSite } from '../../context/SiteContext';
import { growthApi, analyticsApi, searchTermsApi, aiVisibilityLatestApi, dashboardApi, userApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { ArrowRight, ArrowUp, ArrowDown, FileText, Share2, Eye, TrendingUp, Globe, X as XIcon, Check, Sparkles, Zap } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const activityIcons = {
  article: FileText,
  social: Share2,
  scan: Eye,
  FileText,
  Share2,
  Eye,
};

const MetricCard = ({ label, value, change, icon: Icon, to, testid }) => {
  const Body = (
    <div className="bg-white rounded-xl border border-[#F0F0F0] p-4 hover:border-[#1D9E75]/40 hover:shadow-sm transition-all h-full" data-testid={testid}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-[#6B7280] uppercase tracking-wide">{label}</p>
        <Icon size={16} className="text-[#1D9E75]" />
      </div>
      <p className="text-2xl font-bold text-[#0A0A0A]">{value}</p>
      {change && <p className="text-xs text-[#6B7280] mt-1">{change}</p>}
    </div>
  );
  return to ? <Link to={to}>{Body}</Link> : Body;
};

export const DashboardHome = () => {
  const { user, subscription } = useUser();
  const { activeSite, sites } = useSite();

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [growth, setGrowth] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Per-site onboarding dismissal — backed by user.onboarding.dismissed
  // (from DB on next /me hydration), with a localStorage fallback for the
  // current session so the checklist never reappears on the same refresh.
  const onboardingKey = `jalwa_onboarding_dismissed_${activeSite?.id || 'none'}`;
  const dbDismissed = user?.onboarding?.dismissed === true;
  const [onboardingDismissed, setOnboardingDismissed] = useState(dbDismissed);
  useEffect(() => {
    if (dbDismissed) {
      setOnboardingDismissed(true);
      return;
    }
    try { setOnboardingDismissed(localStorage.getItem(onboardingKey) === '1'); } catch {}
  }, [onboardingKey, dbDismissed]);

  const dismissOnboarding = async () => {
    try { localStorage.setItem(onboardingKey, '1'); } catch {}
    setOnboardingDismissed(true);
    // Persist server-side so it never shows on any future session/device.
    try { await userApi.updateOnboarding({ dismissed: true }); } catch {}
  };

  // Live onboarding signals
  const [hasSearchTerms, setHasSearchTerms] = useState(false);
  const [hasLatestScan, setHasLatestScan] = useState(false);

  useEffect(() => {
    if (!activeSite?.id) {
      setHasSearchTerms(false);
      setHasLatestScan(false);
      setOverview(null);
      setGrowth(null);
      setAnalytics(null);
      return;
    }
    let cancelled = false;
    setOverviewLoading(true);
    (async () => {
      try {
        const ov = await dashboardApi.overview(activeSite.id);
        if (!cancelled) setOverview(ov);
      } catch { if (!cancelled) setOverview(null); }
      try {
        const g = await growthApi.get(activeSite.id);
        if (!cancelled) setGrowth(g);
      } catch {}
      try {
        const a = await analyticsApi.overview(activeSite.id, '30d');
        if (!cancelled) setAnalytics(a);
      } catch {}
      try {
        const terms = await searchTermsApi.list(activeSite.id);
        const list = Array.isArray(terms) ? terms : terms?.items || terms?.terms || [];
        if (!cancelled) setHasSearchTerms(list.length > 0);
      } catch { if (!cancelled) setHasSearchTerms(false); }
      try {
        const latest = await aiVisibilityLatestApi.latest(activeSite.id);
        if (!cancelled) setHasLatestScan(!!latest && (latest?.overallScore != null || latest?.id));
      } catch { if (!cancelled) setHasLatestScan(false); }
      if (!cancelled) setOverviewLoading(false);
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id]);

  // Onboarding steps from real signals
  const onboardingSteps = useMemo(() => {
    const hasSite = Array.isArray(sites) && sites.length > 0;
    const siteConnected = !!(activeSite && (activeSite.wordpressConnected || activeSite.isConnected || activeSite.connected || activeSite.status === 'connected' || overview?.hasConnectedSite));
    return [
      { id: 'connect',     label: 'Connect your website',          done: hasSite && siteConnected, to: '/dashboard/connections',     cta: hasSite ? 'Connect' : 'Add site' },
      { id: 'preferences', label: 'Set up article preferences',    done: !!overview?.hasArticleSettings, to: '/dashboard/article-settings', cta: 'Set up' },
      { id: 'topics',      label: 'Add content topics',            done: hasSearchTerms,           to: '/dashboard/auto-publish',    cta: 'Add topics' },
      { id: 'first-scan',  label: 'Run your first AI scan',        done: hasLatestScan,            to: '/dashboard/ai-visibility',   cta: 'Run scan' },
    ];
  }, [sites, activeSite, hasSearchTerms, hasLatestScan, overview]);
  const onboardingDone = onboardingSteps.every((s) => s.done);
  const completedCount = onboardingSteps.filter((s) => s.done).length;
  const showOnboarding = !!activeSite && !onboardingDismissed && !onboardingDone;
  const showWelcomeBanner = !activeSite;

  // Trial banner removed (Phase 2) — free plan replaces trial.
  // Backend may still expose trial flags; we no longer surface them in UI.

  // Metrics from overview only
  const metrics = overview?.metrics || {};
  const growthScore = overview?.growthScore?.score ?? growth?.latest?.score;
  const growthChange = overview?.growthScore?.change ?? growth?.latest?.change ?? growth?.latest?.weeklyChange;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="user-dashboard-home"
    >
      {/* Trial banner removed in Phase 2 — Free plan UI replaces trial messaging */}

      {/* Welcome banner */}
      {showWelcomeBanner && (
        <motion.div variants={fadeInUp} className="bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-xl p-8 flex flex-wrap items-center gap-4" data-testid="welcome-banner">
          <div className="w-12 h-12 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
            <Globe size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <h2 className="font-syne text-xl font-bold text-[#0A0A0A]">
              Welcome to SEO Jalwa{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h2>
            <p className="text-sm text-[#0A0A0A]/80 mt-1">Connect your first website to start tracking AI visibility and publishing daily articles on autopilot.</p>
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
            <button onClick={dismissOnboarding} className="text-[#6B7280] hover:text-[#0A0A0A]" aria-label="Dismiss onboarding" data-testid="onboarding-dismiss">
              <XIcon size={16} />
            </button>
          </div>
          <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#1D9E75] transition-all" style={{ width: `${(completedCount / onboardingSteps.length) * 100}%` }} />
          </div>
          <ul className="space-y-2">
            {onboardingSteps.map((s, i) => (
              <li key={s.id} className="flex items-center justify-between gap-3 p-3 bg-[#F9FAFB] rounded-lg" data-testid={`onboarding-step-${s.id}`}>
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

      {/* If no active site: stop here — do NOT show dummy metrics */}
      {!activeSite ? null : (
        <>
          {/* Growth Score widget */}
          {growthScore != null ? (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Link to="/dashboard/growth-score" className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-[#1D9E75] flex items-center justify-center hover:scale-105 transition-transform">
                    <div className="text-center">
                      <span className="font-syne text-4xl font-bold text-[#0A0A0A]" data-testid="dashboard-growth-score">{growthScore}</span>
                      <span className="text-lg text-[#6B7280]">/100</span>
                    </div>
                  </div>
                </Link>
                <div className="text-center md:text-left">
                  <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-1">Your Growth Score</h2>
                  {growthChange != null && (
                    <div className={`flex items-center justify-center md:justify-start gap-2 ${growthChange >= 0 ? 'text-[#1D9E75]' : 'text-[#EF4444]'}`}>
                      {growthChange >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      <span className="font-medium">{growthChange > 0 ? '+' : ''}{growthChange} from last week</span>
                    </div>
                  )}
                  <Link to="/dashboard/growth-score" className="inline-flex items-center gap-1 mt-3 text-sm text-[#1D9E75] hover:underline">
                    View full score breakdown <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : overviewLoading ? (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6 h-40 animate-pulse" data-testid="growth-score-loading" />
          ) : (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-dashed border-[#F0F0F0] p-6 text-center" data-testid="growth-score-empty">
              <p className="text-sm text-[#6B7280] mb-3">Your Growth Score will appear here after your first AI visibility scan.</p>
              <Link to="/dashboard/ai-visibility">
                <Button size="sm" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Run your first scan</Button>
              </Link>
            </motion.div>
          )}

          {/* Metrics Grid — only real data */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="dashboard-metrics-grid">
            <MetricCard
              label="Articles This Month"
              value={metrics.articlesThisMonth ?? 0}
              change={metrics.articlesThisMonth != null ? 'published this month' : 'No articles yet'}
              icon={FileText}
              to="/dashboard/auto-publish"
              testid="metric-articles-card"
            />
            <MetricCard
              label="Social Posts"
              value={metrics.socialPostsScheduled ?? 0}
              change={metrics.socialPostsScheduled != null ? 'scheduled' : 'No posts scheduled'}
              icon={Share2}
              to="/dashboard/social-autopilot"
              testid="metric-social-card"
            />
            <MetricCard
              label="Total Clicks"
              value={(metrics.totalClicks ?? analytics?.totalClicks ?? 0).toLocaleString()}
              change="from Google Search Console"
              icon={TrendingUp}
              to="/dashboard/analytics"
              testid="metric-clicks-card"
            />
            <MetricCard
              label="AI Visibility"
              value={metrics.aiVisibility != null ? `${metrics.aiVisibility}%` : '—'}
              change={metrics.aiVisibility != null ? 'across 5 AI models' : 'Run a scan to see this'}
              icon={Eye}
              to="/dashboard/ai-visibility"
              testid="metric-ai-visibility-card"
            />
          </motion.div>

          {/* Today's Recommendations */}
          {(() => {
            const recs = Array.isArray(overview?.recommendations) ? overview.recommendations.slice(0, 3) : [];
            if (recs.length === 0) return null;
            return (
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="todays-recommendations">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-[#1D9E75]" />
                  <h3 className="font-semibold text-[#0A0A0A]">Today's Recommendations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recs.map((r, i) => (
                    <div key={r.id || i} className="border border-[#F0F0F0] rounded-lg p-4" data-testid={`recommendation-${i}`}>
                      <p className="font-medium text-[#0A0A0A] mb-1">{r.title}</p>
                      {r.description && <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{r.description}</p>}
                      {r.link && (
                        <Link to={r.link}>
                          <Button size="sm" variant="ghost" className="text-[#1D9E75] hover:bg-[#E1F5EE] h-8 p-0">
                            {r.cta || 'View'} <ArrowRight size={12} className="ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })()}

          {/* Next scheduled + Top performer */}
          {(overview?.nextScheduledArticle || overview?.topPerformingArticle) && (
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overview?.nextScheduledArticle && (
                <div className="bg-white rounded-xl border border-[#F0F0F0] p-5" data-testid="next-scheduled-card">
                  <p className="text-xs uppercase tracking-wide text-[#6B7280] mb-1">Next Scheduled Article</p>
                  <p className="font-medium text-[#0A0A0A] mb-1">{overview.nextScheduledArticle.title}</p>
                  <p className="text-xs text-[#6B7280]">
                    Publishes in {overview.nextScheduledArticle.daysUntil ?? overview.nextScheduledArticle.daysLeft} days
                  </p>
                </div>
              )}
              {overview?.topPerformingArticle && (
                <div className="bg-white rounded-xl border border-[#F0F0F0] p-5" data-testid="top-performer-card">
                  <p className="text-xs uppercase tracking-wide text-[#6B7280] mb-1">Top Performer</p>
                  <p className="font-medium text-[#0A0A0A] mb-1">{overview.topPerformingArticle.title}</p>
                  <p className="text-xs text-[#1D9E75]">{(overview.topPerformingArticle.clicks || 0).toLocaleString()} clicks</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="dashboard-recent-activity">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {(() => {
                const liveActivity = Array.isArray(overview?.recentActivity) ? overview.recentActivity : null;
                if (overviewLoading && !liveActivity) {
                  return (
                    <>
                      <div className="h-12 bg-[#F9FAFB] rounded animate-pulse" />
                      <div className="h-12 bg-[#F9FAFB] rounded animate-pulse" />
                      <div className="h-12 bg-[#F9FAFB] rounded animate-pulse" />
                    </>
                  );
                }
                if (!liveActivity || liveActivity.length === 0) {
                  return (
                    <p className="text-sm text-[#6B7280]" data-testid="activity-empty">
                      No activity yet. Generate your first article to see action here.
                    </p>
                  );
                }
                return liveActivity.slice(0, 6).map((a, i) => {
                  const iconKey = a.icon || a.type || 'FileText';
                  const Icon = activityIcons[iconKey] || FileText;
                  const text = a.message || a.title || a.action || '';
                  const time = a.createdAt ? new Date(a.createdAt).toLocaleString() : (a.time || '');
                  const Wrapper = a.link ? Link : 'div';
                  const wrapperProps = a.link ? { to: a.link, className: 'block' } : {};
                  return (
                    <Wrapper key={a.id || i} {...wrapperProps}>
                      <div className="flex items-start gap-3 hover:bg-[#F9FAFB] -mx-2 px-2 py-1.5 rounded">
                        <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                          <Icon size={16} className="text-[#1D9E75]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#0A0A0A]">{text}</p>
                          <p className="text-xs text-[#6B7280]">{time}</p>
                        </div>
                      </div>
                    </Wrapper>
                  );
                });
              })()}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
