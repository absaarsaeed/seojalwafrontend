import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '../../components/ui/popover';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '../../components/ui/collapsible';
import { Plus, Edit2, Trash2, Check, X as XIcon, ChevronDown, ExternalLink, Sparkles, RotateCw, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useSite } from '../../context/SiteContext';
import { useUser } from '../../context/UserContext';
import { articlesApi, searchTermsApi } from '../../lib/api';
import { PlatformLogo } from '../../components/public/PlatformLogo';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusStyles = {
  PUBLISHED:  'bg-[#E1F5EE] text-[#1D9E75]',
  READY:      'bg-[#DBEAFE] text-[#2563EB]',
  SCHEDULED:  'bg-[#DBEAFE] text-[#2563EB]',
  DRAFT:      'bg-[#FEF3C7] text-[#D97706]',
  PUBLISHING: 'bg-[#FEF3C7] text-[#D97706]',
  FAILED:     'bg-red-100 text-[#EF4444]',
};

const statusLabels = {
  PUBLISHED:  'PUBLISHED',
  READY:      'READY TO PUBLISH',
  SCHEDULED:  'SCHEDULED',
  DRAFT:      'DRAFT',
  PUBLISHING: 'PUBLISHING',
  FAILED:     'FAILED',
};

const buildMonth = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, day: i, article: null });
  }
  return { cells, month, year };
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Performance table data — fetched live from articlesApi.list

const StatusPill = ({ status }) => {
  const key = (status || 'SCHEDULED').toUpperCase();
  const style = statusStyles[key] || statusStyles.SCHEDULED;
  const label = statusLabels[key] || key;
  const isAnimated = key === 'PUBLISHING';
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${style} ${isAnimated ? 'animate-pulse' : ''}`} data-testid={`status-pill-${key.toLowerCase()}`}>
      {label}
    </span>
  );
};

const PerfStatusBadge = ({ status }) => {
  const c = status === 'Published' ? 'bg-[#1D9E75]/10 text-[#1D9E75]'
        : status === 'Scheduled' ? 'bg-[#6B7280]/10 text-[#6B7280]'
        : 'bg-[#F59E0B]/10 text-[#F59E0B]';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
};

export const PublishPage = () => {
  const { activeSite } = useSite();
  const { subscription } = useUser();
  const { cells, month, year } = useMemo(buildMonth, []);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState('terms');
  const [keywords, setKeywords] = useState('');
  const [aiAuto, setAiAuto] = useState(true);
  const [liveCalendar, setLiveCalendar] = useState(null);
  const [liveArticles, setLiveArticles] = useState([]);

  useEffect(() => {
    if (!activeSite?.id) {
      setLiveCalendar(null);
      setLiveArticles([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const cal = await articlesApi.calendar({
          siteId: activeSite.id,
          year,
          month: month + 1,
        });
        if (!cancelled) setLiveCalendar(cal);
      } catch { if (!cancelled) setLiveCalendar(null); }
      try {
        const list = await articlesApi.list({ siteId: activeSite.id });
        const items = Array.isArray(list)
          ? list
          : Array.isArray(list?.items)
            ? list.items
            : Array.isArray(list?.articles)
              ? list.articles
              : Array.isArray(list?.data)
                ? list.data
                : [];
        if (!cancelled) setLiveArticles(items);
      } catch { if (!cancelled) setLiveArticles([]); }
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id, year, month]);

  // Merge live calendar by day-number when present
  const cellsToRender = useMemo(() => {
    if (!liveCalendar || typeof liveCalendar !== 'object') return cells;
    return cells.map((c) => {
      if (!c) return c;
      const liveEntry = liveCalendar[String(c.day)] || liveCalendar[c.day];
      if (liveEntry) {
        const article = Array.isArray(liveEntry) ? liveEntry[0] : liveEntry;
        return {
          ...c,
          article: {
            id: article.id || c.article?.id || `${year}-${month}-${c.day}`,
            title: article.title || c.article?.title,
            searchTerm: article.searchTerm || article.keyword || c.article?.searchTerm,
            status: (article.status || c.article?.status || 'SCHEDULED').toUpperCase(),
          },
        };
      }
      return c;
    });
  }, [cells, liveCalendar, year, month]);

  const handleSaveTerms = async () => {
    if (!activeSite?.id) {
      toast.error('Connect a site first');
      return;
    }
    const terms = keywords
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    if (terms.length === 0) {
      toast.error('Enter at least one search term');
      return;
    }
    try {
      await searchTermsApi.create({ siteId: activeSite.id, terms });
      toast.success('Added to your calendar');
      setAddOpen(false);
      setKeywords('');
    } catch (err) {
      toast.error(err?.message || 'Could not save search terms');
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-6"
      data-testid="publish-page"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Auto Article Writing</h1>
        <p className="text-sm text-[#6B7280]">Manage your content calendar and Website Connections</p>
      </motion.div>

      {/* Free-plan article limit banner */}
      {(() => {
        const planName = (subscription?.plan?.name || subscription?.plan || '').toString().toLowerCase();
        const isFree = planName === 'free';
        const limit = subscription?.plan?.articlesPerMonth ?? subscription?.articlesPerMonth ?? (isFree ? 3 : null);
        const used = liveArticles.length;
        const limitReached = limit != null && used >= limit;
        if (!limitReached) return null;
        return (
          <motion.div
            variants={fadeInUp}
            className="rounded-xl p-5 flex flex-wrap items-center gap-4 border bg-[#FEF3C7] border-[#F59E0B]/30"
            data-testid="free-plan-limit-banner"
          >
            <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
              <Lock size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-[240px]">
              <h2 className="font-syne text-lg font-bold text-[#0A0A0A]">
                You&rsquo;ve used all {limit} {isFree ? 'free' : ''} article{limit === 1 ? '' : 's'}
              </h2>
              <p className="text-sm text-[#6B7280]">Upgrade to keep publishing automatically every day.</p>
            </div>
            <Link to="/pricing">
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="free-plan-upgrade-btn">
                View plans →
              </Button>
            </Link>
          </motion.div>
        );
      })()}

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-[#F0F0F0]">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="editor">Article Editor</TabsTrigger>
          <TabsTrigger value="cms">Website Connections</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* ============================ CALENDAR ============================ */}
        <TabsContent value="calendar" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-syne text-xl font-bold text-[#0A0A0A]">Your Content Calendar</h3>
                <p className="text-sm text-[#6B7280]">Articles are published to your site every day at 9–11am GMT.</p>
              </div>
              <Button onClick={() => setAddOpen(true)} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="add-search-terms-btn">
                <Plus size={16} className="mr-1" /> Add Search Terms
              </Button>
            </div>
            {(() => {
              const isTrial = (subscription?.status || '').toLowerCase() === 'trialing';
              const calArr = Array.isArray(liveCalendar)
                ? liveCalendar
                : Array.isArray(liveCalendar?.days)
                  ? liveCalendar.days
                  : Array.isArray(liveCalendar?.items)
                    ? liveCalendar.items
                    : [];
              const trialArticles = calArr.reduce((acc, day) => acc + (Array.isArray(day?.articles) ? day.articles.length : (day?.article ? 1 : 0)), 0);
              if (!isTrial || trialArticles === 0) return null;
              return (
                <div className="mt-4 p-3 bg-[#E1F5EE]/40 border border-[#1D9E75]/30 rounded-lg text-sm text-[#0A0A0A]" data-testid="trial-articles-banner">
                  ✨ We pre-generated <strong>{trialArticles}</strong> article{trialArticles === 1 ? '' : 's'} for your trial. Click any article to review and edit before publishing.
                </div>
              );
            })()}
          </motion.div>

          {/* Stats — from real articles list */}
          {(() => {
            const total = liveArticles.length;
            const thisMonth = liveArticles.filter((a) => {
              const d = new Date(a.publishedAt || a.scheduledAt || a.createdAt || 0);
              return d.getMonth() === month && d.getFullYear() === year;
            });
            const published = thisMonth.filter((a) => (a.status || '').toUpperCase() === 'PUBLISHED').length;
            const scheduled = liveArticles.filter((a) => ['SCHEDULED', 'READY'].includes((a.status || '').toUpperCase())).length;
            const stats = [
              { label: 'Total articles written',          value: total },
              { label: 'Articles published this month',   value: published },
              { label: 'Articles scheduled',              value: scheduled },
              { label: 'Time saved vs writer',            value: `${total * 2} hours` },
            ];
            return (
              <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-[#0A0A0A]">{s.value}</p>
                  </div>
                ))}
              </motion.div>
            );
          })()}

          {/* No-site empty state */}
          {!activeSite && (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-dashed border-[#F0F0F0] p-12 text-center" data-testid="calendar-no-site">
              <Globe size={32} className="text-[#1D9E75] mx-auto mb-3" />
              <p className="text-lg font-medium text-[#0A0A0A] mb-1">Connect a website first</p>
              <p className="text-sm text-[#6B7280] mb-4">Add your site so we can publish daily SEO articles to it.</p>
              <Link to="/dashboard/connections">
                <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Connect website</Button>
              </Link>
            </motion.div>
          )}

          {/* Calendar empty (site connected but no articles yet) */}
          {activeSite && liveArticles.length === 0 && !liveCalendar && (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-dashed border-[#F0F0F0] p-12 text-center" data-testid="calendar-empty">
              <p className="text-lg font-medium text-[#0A0A0A] mb-1">No articles yet</p>
              <p className="text-sm text-[#6B7280] mb-4">Add search terms to start publishing articles automatically.</p>
              <Button onClick={() => setAddOpen(true)} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                <Plus size={16} className="mr-1" /> Add Search Terms
              </Button>
            </motion.div>
          )}

          {/* Calendar Grid */}
          {activeSite && (
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="calendar-grid">
            <h4 className="font-semibold text-[#0A0A0A] mb-4">{MONTH_NAMES[month]} {year}</h4>
            <div className="grid grid-cols-7 gap-px bg-[#F0F0F0] rounded-lg overflow-hidden">
              {WEEKDAYS.map((d) => (
                <div key={d} className="bg-[#F9FAFB] p-2 text-xs font-semibold text-[#6B7280] text-center">{d}</div>
              ))}
              {cellsToRender.map((cell, i) => {
                if (!cell) return <div key={i} className="bg-white min-h-[110px]" />;
                return (
                  <div key={i} className="bg-white min-h-[110px] p-2 relative">
                    <div className="text-xs text-[#6B7280] mb-1">{cell.day}</div>
                    {cell.article ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full text-left p-2 rounded-md bg-[#F9FAFB] hover:bg-[#E1F5EE] transition-colors" data-testid={`calendar-article-${cell.day}`}>
                            <p className="text-xs font-medium text-[#0A0A0A] line-clamp-2 mb-1">{cell.article.title}</p>
                            <div className="flex items-center justify-between gap-1">
                              <StatusPill status={cell.article.status} />
                              <div className="flex gap-1 opacity-60">
                                <Edit2 size={11} className="text-[#6B7280]" />
                                <Trash2 size={11} className="text-[#6B7280]" />
                              </div>
                            </div>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72" data-testid={`calendar-popover-${cell.day}`}>
                          <p className="font-semibold text-[#0A0A0A] mb-1">{cell.article.title}</p>
                          <p className="text-xs text-[#6B7280] mb-2">Search term: {cell.article.searchTerm}</p>
                          <p className="text-xs text-[#6B7280] mb-3">Scheduled: {cell.date.toLocaleDateString()}</p>
                          {(cell.article.status || '').toUpperCase() === 'FAILED' && cell.article.error && (
                            <div className="p-2 mb-3 bg-red-50 text-[#EF4444] text-xs rounded" data-testid="calendar-failed-error">
                              {cell.article.error}
                            </div>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <Link to={`/dashboard/auto-publish/article/${cell.article.id}`}>
                              <Button size="sm" variant="outline" className="border-[#F0F0F0] text-xs">
                                <ExternalLink size={12} className="mr-1" /> View Article
                              </Button>
                            </Link>
                            {(cell.article.status || '').toUpperCase() === 'FAILED' ? (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await articlesApi.retry(cell.article.id);
                                    toast.success('Retry queued');
                                  } catch (e) {
                                    toast.error(e?.message || 'Retry failed');
                                  }
                                }}
                                className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs"
                                data-testid={`calendar-retry-${cell.day}`}
                              >
                                <RotateCw size={12} className="mr-1" /> Retry
                              </Button>
                            ) : (
                              <Button size="sm" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-xs">
                                <Edit2 size={12} className="mr-1" /> Edit
                              </Button>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <button onClick={() => setAddOpen(true)} className="w-full h-[70px] flex flex-col items-center justify-center text-[#6B7280] hover:bg-[#F9FAFB] rounded-md border border-dashed border-[#F0F0F0]">
                        <Plus size={14} />
                        <span className="text-[10px] mt-1">Add topic</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
          )}
        </TabsContent>

        {/* ============================ EDITOR ============================ */}
        <TabsContent value="editor" className="space-y-6">
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white rounded-xl border border-[#F0F0F0] p-6">
              <Input placeholder="Article title..." className="text-xl font-semibold border-0 p-0 mb-4 focus-visible:ring-0" />
              <Textarea placeholder="Start writing your article..." className="min-h-[400px] border-[#F0F0F0]" />
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#F0F0F0] p-6">
              <h3 className="font-semibold text-[#0A0A0A] mb-4">SEO Score</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-[#1D9E75] flex items-center justify-center">
                  <span className="font-bold text-lg text-[#0A0A0A]">78</span>
                </div>
                <p className="text-sm text-[#6B7280]">Good! A few improvements recommended.</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Keyword usage', status: 'good' },
                  { label: 'Readability', status: 'good' },
                  { label: 'Meta description', status: 'missing' },
                  { label: 'Title tag', status: 'good' },
                  { label: 'Internal links', status: 'warning' },
                  { label: 'Word count', status: 'good' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7280]">{item.label}</span>
                    {item.status === 'good' ? <Check size={16} className="text-[#1D9E75]" /> :
                     item.status === 'missing' ? <XIcon size={16} className="text-[#EF4444]" /> :
                     <span className="text-[#F59E0B]">⚠</span>}
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Publish now</Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* ============================ CMS ============================ */}
        <TabsContent value="cms" className="space-y-6">
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="website-connections">
            {/* WordPress (only platform live in v1) */}
            <div className="bg-white rounded-xl border border-[#F0F0F0] p-4" data-testid="website-card-wordpress">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PlatformLogo name="WordPress" size={28} />
                  <span className="font-medium text-[#0A0A0A]">WordPress</span>
                </div>
                {activeSite ? (
                  <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full flex items-center gap-1">
                    <Check size={12} /> Connected
                  </span>
                ) : (
                  <Link to="/dashboard/connections">
                    <Button size="sm" variant="outline" className="text-xs h-7">Connect</Button>
                  </Link>
                )}
              </div>
              {activeSite && (
                <div className="text-xs text-[#6B7280] space-y-0.5">
                  <p>{activeSite.url || activeSite.domain}</p>
                  <p>{liveArticles.length} article{liveArticles.length === 1 ? '' : 's'}</p>
                </div>
              )}
            </div>

            {/* Coming soon — Shopify, Webflow, Ghost */}
            {['Shopify', 'Webflow', 'Ghost'].map((name) => (
              <div key={name} className="bg-white rounded-xl border border-[#F0F0F0] p-4 coming-soon-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PlatformLogo name={name} size={28} />
                    <span className="font-medium text-[#0A0A0A]">{name}</span>
                  </div>
                  <span className="px-2 py-1 bg-[#F0F0F0] text-[#9CA3AF] text-xs font-medium rounded-md">Coming Soon</span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-2">Available in v2</p>
              </div>
            ))}
          </motion.div>
        </TabsContent>

        {/* ============================ PERFORMANCE ============================ */}
        <TabsContent value="performance" className="space-y-6">
          {(() => {
            const articles = Array.isArray(liveArticles) ? liveArticles : [];
            const totals = articles.reduce((acc, a) => ({
              impressions: acc.impressions + (a.impressions || 0),
              clicks: acc.clicks + (a.clicks || 0),
            }), { impressions: 0, clicks: 0 });
            const avgCtr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : '0.00';
            const positions = articles.map((a) => a.position).filter((p) => p != null);
            const avgPos = positions.length ? (positions.reduce((s, p) => s + p, 0) / positions.length).toFixed(1) : '—';
            const hasData = articles.length > 0;
            return (
              <>
                <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Total impressions</p>
                    <p className="text-2xl font-bold text-[#0A0A0A]" data-testid="perf-total-impressions">{totals.impressions.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Total clicks</p>
                    <p className="text-2xl font-bold text-[#0A0A0A]" data-testid="perf-total-clicks">{totals.clicks.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Avg CTR</p>
                    <p className="text-2xl font-bold text-[#0A0A0A]">{avgCtr}%</p>
                  </div>
                  <div className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Avg position</p>
                    <p className="text-2xl font-bold text-[#0A0A0A]">{avgPos}</p>
                  </div>
                </motion.div>

                {!hasData ? (
                  <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-dashed border-[#F0F0F0] p-12 text-center" data-testid="perf-empty">
                    <p className="text-sm text-[#6B7280]">No published articles yet. Add search terms to start publishing.</p>
                  </motion.div>
                ) : (
                  <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                            <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Article Title</th>
                            <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                            <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Impressions</th>
                            <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Clicks</th>
                            <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">CTR</th>
                            <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {articles.map((r, i) => {
                            const impr = r.impressions || 0;
                            const clk = r.clicks || 0;
                            const ctr = impr > 0 ? ((clk / impr) * 100).toFixed(2) : '0.00';
                            return (
                              <tr key={r.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                                <td className="p-4 text-sm text-[#0A0A0A]">{r.title}</td>
                                <td className="p-4"><PerfStatusBadge status={r.status || 'Draft'} /></td>
                                <td className="p-4 text-sm text-[#0A0A0A] text-right">{impr.toLocaleString()}</td>
                                <td className="p-4 text-sm text-[#0A0A0A] text-right">{clk.toLocaleString()}</td>
                                <td className="p-4 text-sm text-[#0A0A0A] text-right">{ctr}%</td>
                                <td className="p-4 text-right">
                                  <Link to={`/dashboard/auto-publish/article/${r.id || i}`} className="text-sm text-[#1D9E75] hover:underline inline-flex items-center gap-1">
                                    View <ExternalLink size={12} />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* Add Search Terms dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg" data-testid="add-terms-dialog">
          <DialogHeader>
            <DialogTitle>Add article topics</DialogTitle>
          </DialogHeader>
          <Tabs value={addTab} onValueChange={setAddTab}>
            <TabsList className="bg-[#F0F0F0]">
              <TabsTrigger value="terms">Search Terms</TabsTrigger>
              <TabsTrigger value="ai">Let AI decide</TabsTrigger>
            </TabsList>
            <TabsContent value="terms" className="space-y-3 mt-4">
              <Label>Enter keywords or topics, one per line</Label>
              <Textarea
                rows={6}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={'best SEO tools 2026\nhow to rank on Google\ncontent marketing tips'}
                className="border-[#F0F0F0]"
                data-testid="keywords-textarea"
              />
              <Button onClick={handleSaveTerms} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white w-full">Add to calendar</Button>
            </TabsContent>
            <TabsContent value="ai" className="space-y-4 mt-4">
              <div className="p-4 bg-[#E1F5EE]/40 rounded-lg flex gap-3">
                <Sparkles size={18} className="text-[#1D9E75] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#6B7280]">
                  SEO Jalwa will automatically research and select the best topics for your website based on your niche and competitor gaps.
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                <span className="font-medium text-[#0A0A0A]">AI auto-select topics</span>
                <Switch checked={aiAuto} onCheckedChange={setAiAuto} />
              </div>
              <Button onClick={() => { setAddOpen(false); toast.success('Preference saved'); }} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white w-full">
                Save preference
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
