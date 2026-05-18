import { useMemo, useState } from 'react';
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
import { Plus, Edit2, Trash2, Check, X as XIcon, ChevronDown, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useSite } from '../../context/SiteContext';
import { PlatformLogo } from '../../components/public/PlatformLogo';
import { PUBLISH_DATA } from '../../data/publicData';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const TITLES = [
  '10 SEO Trends That Will Dominate 2026',
  'Complete Guide to AI-Powered Content Marketing',
  'How to Rank #1 on Google with AI Tools',
  'ChatGPT vs Perplexity: SEO Comparison',
  'Ultimate Local SEO Checklist',
  'Why Your Content Strategy Is Failing',
  'Long-Tail Keywords in the AI Era',
  '5 Free SEO Tools You\'re Not Using',
  'Building Topical Authority Step-by-Step',
  'Content Pillars Explained: 2026 Edition',
  'Schema Markup for Better Rankings',
  'Internal Linking Strategies That Work',
  'Mobile-First Indexing Explained',
  'Backlinks in 2026: Quality Over Quantity',
  'The Death of Keyword Stuffing',
  'AI Writing Tools Compared',
  'Voice Search Optimization Guide',
  'E-E-A-T: The Definitive Guide',
  'Featured Snippets: How to Capture Them',
  'Content Refresh: A Complete Playbook',
  'SEO Audit in 30 Minutes',
  'Building a Content Calendar',
  'Pillar Pages and Topic Clusters',
  'SERP Features You Should Target',
  'Core Web Vitals Optimization',
  'Image SEO Best Practices',
  'Video SEO for YouTube and Google',
  'How to Recover from a Google Penalty',
];

const STATUS_BY_DAY = (date, today) => {
  const d = new Date(date);
  if (d < today) return 'PUBLISHED';
  if (d.getTime() === today.getTime() || d.getTime() === today.getTime() + 86400000) return 'READY';
  return 'SCHEDULED';
};

const statusStyles = {
  PUBLISHED: 'bg-[#E1F5EE] text-[#1D9E75]',
  READY:     'bg-[#DBEAFE] text-[#2563EB]',
  SCHEDULED: 'bg-[#F0F0F0] text-[#6B7280]',
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
    const hasArticle = i % 7 !== 0; // skip Sundays for variety
    cells.push({
      date: d,
      day: i,
      article: hasArticle ? {
        id: `${year}-${month}-${i}`,
        title: TITLES[(i - 1) % TITLES.length],
        searchTerm: TITLES[(i - 1) % TITLES.length].toLowerCase().slice(0, 30),
        status: STATUS_BY_DAY(d, today),
      } : null,
    });
  }
  return { cells, month, year };
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Performance table data
const PERF_ROWS = TITLES.slice(0, 10).map((title, i) => ({
  title,
  term: title.toLowerCase().split(':')[0].slice(0, 30),
  status: i < 6 ? 'Published' : i < 8 ? 'Scheduled' : 'Draft',
  date: `2026-${String(Math.max(1, 5 - Math.floor(i / 4))).padStart(2, '0')}-${String(5 + i * 2).padStart(2, '0')}`,
  impressions: 15000 - i * 1200,
  clicks: 540 - i * 50,
  ctr: ((540 - i * 50) / (15000 - i * 1200) * 100).toFixed(2),
  position: 3.2 + i * 1.8,
}));

const StatusPill = ({ status }) => {
  const style = statusStyles[status] || statusStyles.SCHEDULED;
  const label = status === 'PUBLISHED' ? 'PUBLISHED' : status === 'READY' ? 'READY TO PUBLISH' : 'SCHEDULED';
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${style}`}>{label}</span>;
};

const PerfStatusBadge = ({ status }) => {
  const c = status === 'Published' ? 'bg-[#1D9E75]/10 text-[#1D9E75]'
        : status === 'Scheduled' ? 'bg-[#6B7280]/10 text-[#6B7280]'
        : 'bg-[#F59E0B]/10 text-[#F59E0B]';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
};

export const PublishPage = () => {
  const { activeSite } = useSite();
  const data = PUBLISH_DATA;
  const { cells, month, year } = useMemo(buildMonth, []);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState('terms');
  const [keywords, setKeywords] = useState('');
  const [aiAuto, setAiAuto] = useState(true);

  const handleSaveTerms = () => {
    setAddOpen(false);
    setKeywords('');
    toast.success('Added to your calendar');
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
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Auto Publish</h1>
        <p className="text-sm text-[#6B7280]">Manage your content calendar and CMS connections</p>
      </motion.div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-[#F0F0F0]">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="editor">Article Editor</TabsTrigger>
          <TabsTrigger value="cms">CMS Connections</TabsTrigger>
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
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total articles written',    value: 47 },
              { label: 'Time saved vs writer',      value: '94 hours' },
              { label: 'Articles published this month', value: 12 },
              { label: 'Articles scheduled',        value: 28 },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-[#0A0A0A]">{s.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Calendar Grid */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="calendar-grid">
            <h4 className="font-semibold text-[#0A0A0A] mb-4">{MONTH_NAMES[month]} {year}</h4>
            <div className="grid grid-cols-7 gap-px bg-[#F0F0F0] rounded-lg overflow-hidden">
              {WEEKDAYS.map((d) => (
                <div key={d} className="bg-[#F9FAFB] p-2 text-xs font-semibold text-[#6B7280] text-center">{d}</div>
              ))}
              {cells.map((cell, i) => {
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
                        <PopoverContent className="w-72">
                          <p className="font-semibold text-[#0A0A0A] mb-1">{cell.article.title}</p>
                          <p className="text-xs text-[#6B7280] mb-2">Search term: {cell.article.searchTerm}</p>
                          <p className="text-xs text-[#6B7280] mb-3">Scheduled: {cell.date.toLocaleDateString()}</p>
                          <div className="flex gap-2">
                            <Link to={`/dashboard/auto-publish/article/${cell.article.id}`}>
                              <Button size="sm" variant="outline" className="border-[#F0F0F0] text-xs">
                                <ExternalLink size={12} className="mr-1" /> View Article
                              </Button>
                            </Link>
                            <Button size="sm" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-xs">
                              <Edit2 size={12} className="mr-1" /> Edit
                            </Button>
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

          {/* Recycle Bin */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#F0F0F0] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB]" data-testid="recycle-bin-toggle">
                <Trash2 size={14} /> Recycle Bin (2) <ChevronDown size={14} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 bg-white border border-[#F0F0F0] rounded-lg p-4 space-y-2">
                {['Old SEO Trends 2024', 'Outdated Keyword Strategy'].map((t) => (
                  <div key={t} className="flex items-center justify-between p-2 bg-[#F9FAFB] rounded">
                    <span className="text-sm text-[#6B7280]">{t}</span>
                    <button className="text-xs text-[#1D9E75] hover:underline">Restore</button>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.cmsConnections.map((cms) => (
              <div key={cms.name} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PlatformLogo name={cms.name} size={28} />
                    <span className="font-medium text-[#0A0A0A]">{cms.name}</span>
                  </div>
                  {cms.connected ? (
                    <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full flex items-center gap-1">
                      <Check size={12} /> Connected
                    </span>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs h-7">Connect</Button>
                  )}
                </div>
                {cms.connected && (
                  <div className="text-xs text-[#6B7280] space-y-0.5">
                    <p>{cms.site}</p>
                    <p>Last published: {cms.lastPublished}</p>
                    <p>{cms.articleCount} articles</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </TabsContent>

        {/* ============================ PERFORMANCE ============================ */}
        <TabsContent value="performance" className="space-y-6">
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total impressions', value: '124,847' },
              { label: 'Total clicks',      value: '2,341' },
              { label: 'Avg CTR',           value: '1.87%' },
              { label: 'Avg position',      value: '14.2' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-[#0A0A0A]">{s.value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Article Title</th>
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Search Term</th>
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Published Date</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Impressions</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Clicks</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">CTR</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Avg Position</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {PERF_ROWS.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                      <td className="p-4 text-sm text-[#0A0A0A]">{r.title}</td>
                      <td className="p-4 text-sm text-[#6B7280]">{r.term}</td>
                      <td className="p-4"><PerfStatusBadge status={r.status} /></td>
                      <td className="p-4 text-sm text-[#6B7280]">{r.date}</td>
                      <td className="p-4 text-sm text-[#0A0A0A] text-right">{r.impressions.toLocaleString()}</td>
                      <td className="p-4 text-sm text-[#0A0A0A] text-right">{r.clicks.toLocaleString()}</td>
                      <td className="p-4 text-sm text-[#0A0A0A] text-right">{r.ctr}%</td>
                      <td className="p-4 text-sm text-[#0A0A0A] text-right">{r.position.toFixed(1)}</td>
                      <td className="p-4 text-right">
                        <Link to={`/dashboard/auto-publish/article/${r.term.replace(/[^a-z0-9]+/g, '-')}-${i}`} className="text-sm text-[#1D9E75] hover:underline inline-flex items-center gap-1">
                          View <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
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
