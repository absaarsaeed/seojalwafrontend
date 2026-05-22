import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useSite } from '../../context/SiteContext';
import {
  dashboardApi,
  articlesApi,
  searchTermsApi,
  aiVisibilityLatestApi,
  growthApi,
  userApi,
} from '../../lib/api';
import { Button } from '../../components/ui/button';
import {
  Pencil,
  DollarSign,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X as XIcon,
  ExternalLink,
  RotateCw,
  Trash2,
  Edit2,
  Sparkles,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Article status → badge style.
const statusConfig = {
  PUBLISHED: { label: '✓ PUBLISHED', cls: 'bg-[#E1F5EE] text-[#1D9E75]' },
  SCHEDULED: { label: 'SCHEDULED', cls: 'bg-[#DBEAFE] text-[#2563EB]' },
  READY:     { label: 'READY',     cls: 'bg-[#DBEAFE] text-[#2563EB]' },
  QUEUED:    { label: 'QUEUED',    cls: 'bg-[#FEF3C7] text-[#D97706]' },
  DRAFT:     { label: 'DRAFT',     cls: 'bg-[#F0F0F0] text-[#6B7280]' },
  FAILED:    { label: 'FAILED',    cls: 'bg-red-100 text-[#EF4444]' },
};

const StatCard = ({ icon: Icon, color, value, label, testid }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow" data-testid={testid}>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <p className="font-syne text-2xl font-bold text-[#0A0A0A]" data-testid={`${testid}-value`}>{value}</p>
    <p className="text-xs text-[#6B7280] mt-1">{label}</p>
  </div>
);

const buildMonthCells = (year, month) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), day: i });
  }
  return cells;
};

const ArticleCell = ({ article, onRetry, onDelete, onEdit }) => {
  const cfg = statusConfig[article.status] || statusConfig.DRAFT;
  return (
    <div className="space-y-1 text-left" data-testid={`article-${article.id || article.status}`}>
      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.cls}`} data-testid={`article-status-${article.status}`}>
        {cfg.label}
      </span>
      <p className="text-[11px] text-[#0A0A0A] line-clamp-2 leading-tight">
        {article.title || article.searchTerm || '—'}
      </p>
      {article.searchTerm && article.title && (
        <p className="text-[10px] text-[#9CA3AF] line-clamp-1 italic">{article.searchTerm}</p>
      )}
      <div className="flex flex-wrap gap-1 mt-1">
        {article.status === 'PUBLISHED' && (
          <Link
            to={`/dashboard/auto-publish/article/${article.id}`}
            className="text-[10px] text-[#1D9E75] hover:underline inline-flex items-center gap-0.5"
          >
            View Article
          </Link>
        )}
        {article.status === 'PUBLISHED' && article.cmsUrl && (
          <a
            href={article.cmsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-[#2563EB] hover:underline inline-flex items-center gap-0.5"
            data-testid={`article-view-live-${article.id}`}
          >
            View Live <ExternalLink size={9} />
          </a>
        )}
        {article.status === 'FAILED' && (
          <button onClick={() => onRetry(article)} className="text-[10px] text-[#1D9E75] hover:underline inline-flex items-center gap-0.5" data-testid={`article-retry-${article.id}`}>
            <RotateCw size={9} /> Retry
          </button>
        )}
        {['SCHEDULED', 'READY', 'QUEUED', 'DRAFT'].includes(article.status) && (
          <button onClick={() => onEdit(article)} className="text-[10px] text-[#6B7280] hover:text-[#1D9E75] inline-flex items-center gap-0.5">
            <Edit2 size={9} /> Edit
          </button>
        )}
        <button onClick={() => onDelete(article)} className="ml-auto text-[10px] text-[#6B7280] hover:text-[#EF4444]" data-testid={`article-delete-${article.id}`}>
          <Trash2 size={9} />
        </button>
      </div>
    </div>
  );
};

export const DashboardHome = () => {
  const { user, subscription } = useUser();
  const { activeSite, sites } = useSite();
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Plugin update banner
  const [pluginBannerDismissed, setPluginBannerDismissed] = useState(false);
  const pluginUpdate = overview?.pluginUpdate;
  const showPluginBanner = !!(pluginUpdate && pluginUpdate.available && !pluginUpdate.dismissed && !pluginBannerDismissed);

  // Calendar state
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const cells = useMemo(() => buildMonthCells(cursor.year, cursor.month), [cursor]);
  const [calendar, setCalendar] = useState(null);

  // Per-site onboarding dismissal
  const onboardingKey = `jalwa_onboarding_dismissed_${activeSite?.id || 'none'}`;
  const dbDismissed = user?.onboarding?.dismissed === true;
  const [onboardingDismissed, setOnboardingDismissed] = useState(dbDismissed);
  useEffect(() => {
    if (dbDismissed) { setOnboardingDismissed(true); return; }
    try { setOnboardingDismissed(localStorage.getItem(onboardingKey) === '1'); } catch {}
  }, [onboardingKey, dbDismissed]);
  const dismissOnboarding = async () => {
    try { localStorage.setItem(onboardingKey, '1'); } catch {}
    setOnboardingDismissed(true);
    try { await userApi.updateOnboarding({ dismissed: true }); } catch {}
  };

  const [hasSearchTerms, setHasSearchTerms] = useState(false);
  const [hasLatestScan, setHasLatestScan] = useState(false);

  // Load dashboard + calendar + signals
  useEffect(() => {
    if (!activeSite?.id) {
      setOverview(null);
      setCalendar(null);
      setHasSearchTerms(false);
      setHasLatestScan(false);
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
        const cal = await articlesApi.calendar({
          siteId: activeSite.id,
          year: cursor.year,
          month: cursor.month + 1,
        });
        if (!cancelled) setCalendar(cal);
      } catch { if (!cancelled) setCalendar(null); }
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
  }, [activeSite?.id, cursor.year, cursor.month]);

  // Onboarding checklist
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

  // Stats — pull from overview.stats but fall back to overview.metrics & subscription.usage.
  const stats = overview?.stats || {};
  const usage = subscription?.usage || {};
  const totalWords = stats.totalWordsWritten ?? usage.totalWordsWritten ?? 0;
  const costSavings = stats.costSavings ?? Math.round((totalWords / 1000) * 50);
  const timeSaved = stats.timeSaved ?? Math.round((totalWords / 1000) * 2);
  const articlesPublished = stats.articlesPublished ?? overview?.metrics?.articlesThisMonth ?? 0;

  // Build a date → article map for calendar.
  const articlesByDate = useMemo(() => {
    const map = {};
    const calArr = Array.isArray(calendar)
      ? calendar
      : Array.isArray(calendar?.days)
        ? calendar.days
        : Array.isArray(calendar?.items)
          ? calendar.items
          : [];
    calArr.forEach((entry) => {
      const dateStr = entry.date || entry.day || entry.scheduledFor;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arts = Array.isArray(entry.articles) ? entry.articles : (entry.article ? [entry.article] : [entry]);
      if (!map[key]) map[key] = [];
      arts.filter(Boolean).forEach((a) => map[key].push(a));
    });
    return map;
  }, [calendar]);

  const dismissPluginBanner = async () => {
    setPluginBannerDismissed(true);
    try {
      await userApi.dismissPluginBanner({ version: pluginUpdate?.latestVersion });
    } catch {}
  };

  const handleRetry = async (article) => {
    try {
      await articlesApi.retry(article.id);
      toast.success('Retry queued');
    } catch (err) {
      toast.error(err?.message || 'Could not retry');
    }
  };
  const handleDelete = async (article) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await articlesApi.remove(article.id);
      toast.success('Deleted');
      // Refresh calendar
      try {
        const cal = await articlesApi.calendar({ siteId: activeSite.id, year: cursor.year, month: cursor.month + 1 });
        setCalendar(cal);
      } catch {}
    } catch (err) {
      toast.error(err?.message || 'Could not delete');
    }
  };
  const handleEdit = (article) => {
    window.location.assign(`/dashboard/auto-publish/article/${article.id}`);
  };

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-6"
      data-testid="user-dashboard-home"
    >
      {/* Plugin update banner */}
      {showPluginBanner && (
        <motion.div
          variants={fadeInUp}
          className="rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 p-4 flex flex-wrap items-center gap-3"
          data-testid="plugin-update-banner"
        >
          <span className="text-xl">🔄</span>
          <div className="flex-1 min-w-[260px]">
            <p className="text-sm text-[#0A0A0A]">
              A new version of the WordPress plugin is available (
              <strong>v{pluginUpdate.latestVersion}</strong>). You&rsquo;re running
              v{pluginUpdate.currentVersion}. Go to your WordPress admin →
              Plugins and click Update Now.
            </p>
          </div>
          <a
            href="/integrations"
            className="text-xs font-medium text-[#1D9E75] hover:underline"
            data-testid="plugin-update-details"
          >
            Details
          </a>
          <button onClick={dismissPluginBanner} className="text-[#9CA3AF] hover:text-[#0A0A0A]" data-testid="plugin-update-close">
            <XIcon size={16} />
          </button>
        </motion.div>
      )}

      {/* Welcome banner (no site) */}
      {showWelcomeBanner && (
        <motion.div variants={fadeInUp} className="bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-xl p-8 flex flex-wrap items-center gap-4" data-testid="welcome-banner">
          <div className="w-12 h-12 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
            <Globe size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <h2 className="font-syne text-xl font-bold text-[#0A0A0A]">
              Welcome to SEO Jalwa{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h2>
            <p className="text-sm text-[#0A0A0A]/80 mt-1">Connect your first website to start publishing daily articles on autopilot.</p>
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
        <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-sm p-6" data-testid="onboarding-checklist">
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

      {activeSite && (
        <>
          {/* Stats bar */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="dashboard-stats-bar">
            <StatCard
              icon={Pencil}
              color="#1D9E75"
              value={totalWords.toLocaleString()}
              label="words written for you"
              testid="stat-total-words"
            />
            <StatCard
              icon={DollarSign}
              color="#16A34A"
              value={`$${costSavings.toFixed(0)}`}
              label="saved vs hiring a writer"
              testid="stat-cost-savings"
            />
            <StatCard
              icon={Clock}
              color="#2563EB"
              value={`${timeSaved} hours`}
              label="saved on content creation"
              testid="stat-time-saved"
            />
            <StatCard
              icon={FileText}
              color="#8B5CF6"
              value={articlesPublished}
              label="articles live on your site"
              testid="stat-articles-published"
            />
          </motion.div>

          {/* Content Calendar */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-sm p-6" data-testid="content-calendar">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-syne text-xl font-bold text-[#0A0A0A]">Your Content Calendar</h2>
                <p className="text-sm text-[#6B7280]">Articles are published to your site every day automatically.</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/dashboard/auto-publish">
                  <Button size="sm" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="calendar-add-terms-btn">
                    <Plus size={14} className="mr-1" /> Add Search Terms
                  </Button>
                </Link>
              </div>
            </div>

            {/* Month navigation */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setCursor((c) => ({ year: c.month === 0 ? c.year - 1 : c.year, month: c.month === 0 ? 11 : c.month - 1 }))}
                className="w-8 h-8 rounded-full hover:bg-[#F9FAFB] flex items-center justify-center text-[#6B7280]"
                data-testid="calendar-prev-month"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="font-semibold text-[#0A0A0A] min-w-[140px] text-center" data-testid="calendar-month-label">{monthLabel}</p>
              <button
                onClick={() => setCursor((c) => ({ year: c.month === 11 ? c.year + 1 : c.year, month: c.month === 11 ? 0 : c.month + 1 }))}
                className="w-8 h-8 rounded-full hover:bg-[#F9FAFB] flex items-center justify-center text-[#6B7280]"
                data-testid="calendar-next-month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-xs text-[#9CA3AF] text-center font-semibold uppercase tracking-wide">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2" data-testid="calendar-grid">
              {cells.map((c, i) => {
                if (!c) return <div key={`empty-${i}`} className="aspect-square" />;
                const key = `${c.date.getFullYear()}-${c.date.getMonth()}-${c.date.getDate()}`;
                const arts = articlesByDate[key] || [];
                const isToday = c.date.toDateString() === today.toDateString();
                return (
                  <div
                    key={key}
                    className={`min-h-[110px] rounded-lg border p-1.5 ${isToday ? 'border-[#1D9E75] bg-[#E1F5EE]/30' : 'border-[#F0F0F0]'}`}
                    data-testid={`cal-cell-${c.day}`}
                  >
                    <p className={`text-[10px] font-semibold mb-1 ${isToday ? 'text-[#1D9E75]' : 'text-[#6B7280]'}`}>{c.day}</p>
                    {arts.length === 0 ? null : (
                      <ArticleCell
                        article={arts[0]}
                        onRetry={handleRetry}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    )}
                    {arts.length > 1 && (
                      <p className="text-[9px] text-[#9CA3AF] mt-1">+{arts.length - 1} more</p>
                    )}
                  </div>
                );
              })}
            </div>

            {overviewLoading && !calendar && (
              <p className="text-xs text-[#9CA3AF] text-center mt-4" data-testid="calendar-loading">Loading articles…</p>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
