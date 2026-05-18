import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Check, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useSite } from '../../context/SiteContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// 30 days of dummy traffic
const buildSeries = () => {
  const series = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    series.push({
      date: label,
      impressions: 60000 + Math.round(Math.random() * 60000),
      clicks: 200 + Math.round(Math.random() * 1000),
    });
  }
  return series;
};

const SERIES = buildSeries();

const ARTICLES = [
  { title: '10 SEO Trends That Will Dominate 2026', impressions: 184230, clicks: 4120, ctr: 2.24, position: 4.2 },
  { title: 'Complete Guide to AI-Powered Content Marketing', impressions: 156780, clicks: 3987, ctr: 2.54, position: 3.8 },
  { title: 'How to Rank #1 on Google with AI Tools', impressions: 142309, clicks: 2891, ctr: 2.03, position: 5.1 },
  { title: 'ChatGPT vs Perplexity: Which is Better for SEO?', impressions: 128456, clicks: 2347, ctr: 1.83, position: 6.4 },
  { title: 'The Ultimate Local SEO Checklist for 2026', impressions: 114287, clicks: 2103, ctr: 1.84, position: 7.2 },
  { title: 'Why Your Content Strategy Is Failing (And How to Fix It)', impressions: 98765, clicks: 1876, ctr: 1.90, position: 8.9 },
  { title: 'Mastering Long-Tail Keywords in the AI Era', impressions: 87432, clicks: 1543, ctr: 1.77, position: 9.5 },
  { title: 'The 5 Best Free SEO Tools You\'re Not Using', impressions: 76321, clicks: 1387, ctr: 1.82, position: 11.3 },
  { title: 'Building Topical Authority: A Step-by-Step Guide', impressions: 67432, clicks: 1098, ctr: 1.63, position: 13.7 },
  { title: 'Content Pillars Explained: The 2026 Edition', impressions: 58743, clicks: 956, ctr: 1.63, position: 14.8 },
  { title: 'How to Use Schema Markup for Better Rankings', impressions: 49382, clicks: 743, ctr: 1.50, position: 18.4 },
  { title: 'Internal Linking Strategies That Actually Work', impressions: 41287, clicks: 612, ctr: 1.48, position: 21.2 },
  { title: 'Mobile-First Indexing: What You Need to Know', impressions: 36421, clicks: 489, ctr: 1.34, position: 24.6 },
  { title: 'Backlinks in 2026: Quality Over Quantity', impressions: 28743, clicks: 387, ctr: 1.35, position: 32.1 },
  { title: 'The Death of Keyword Stuffing (Finally)', impressions: 21456, clicks: 234, ctr: 1.09, position: 53.4 },
];

const SEARCH_TERMS = [
  { term: 'best seo tools 2026', clicks: 1234, impressions: 23456, position: 3.2 },
  { term: 'ai content marketing', clicks: 987, impressions: 18743, position: 4.1 },
  { term: 'how to rank on google', clicks: 876, impressions: 16234, position: 5.7 },
  { term: 'chatgpt for seo', clicks: 743, impressions: 14123, position: 6.8 },
  { term: 'content strategy template', clicks: 654, impressions: 12387, position: 7.4 },
  { term: 'local seo checklist', clicks: 543, impressions: 10234, position: 8.2 },
  { term: 'long tail keywords', clicks: 432, impressions: 8743, position: 9.6 },
  { term: 'schema markup guide', clicks: 387, impressions: 7423, position: 11.3 },
  { term: 'topical authority seo', clicks: 321, impressions: 6234, position: 13.8 },
  { term: 'free seo audit tools', clicks: 287, impressions: 5432, position: 15.4 },
];

const TOP_PAGES = [
  { url: '/blog/10-seo-trends-2026', clicks: 1876, impressions: 32456, position: 3.1 },
  { url: '/blog/complete-guide-ai-content-marketing', clicks: 1543, impressions: 28743, position: 3.7 },
  { url: '/blog/rank-1-google-ai-tools', clicks: 1287, impressions: 24123, position: 5.2 },
  { url: '/blog/chatgpt-vs-perplexity', clicks: 1098, impressions: 22387, position: 6.3 },
  { url: '/blog/local-seo-checklist', clicks: 987, impressions: 19432, position: 7.1 },
  { url: '/blog/content-strategy-failing', clicks: 876, impressions: 17234, position: 8.8 },
  { url: '/blog/long-tail-keywords-ai', clicks: 743, impressions: 15123, position: 9.4 },
  { url: '/blog/best-free-seo-tools', clicks: 654, impressions: 13456, position: 11.2 },
  { url: '/blog/topical-authority-guide', clicks: 543, impressions: 11234, position: 13.6 },
  { url: '/blog/content-pillars-2026', clicks: 432, impressions: 9432, position: 14.7 },
];

const PositionBadge = ({ position }) => {
  let cls = 'bg-[#6B7280]/10 text-[#6B7280]';
  if (position <= 10) cls = 'bg-[#1D9E75]/10 text-[#1D9E75]';
  else if (position <= 20) cls = 'bg-[#2563EB]/10 text-[#2563EB]';
  else if (position <= 50) cls = 'bg-[#F59E0B]/10 text-[#F59E0B]';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{position.toFixed(1)}</span>;
};

const MetricCard = ({ label, value, delta, deltaPositive, color }) => (
  <div className="bg-white rounded-xl border border-[#F0F0F0] p-5">
    <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-2">{label}</p>
    <p className="text-2xl font-bold text-[#0A0A0A] mb-1" style={{ color }}>{value}</p>
    {delta && (
      <p className={`text-xs flex items-center gap-1 ${deltaPositive ? 'text-[#1D9E75]' : 'text-[#EF4444]'}`}>
        {deltaPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {delta}
      </p>
    )}
  </div>
);

export const AnalyticsPage = () => {
  const { activeSite } = useSite();
  const [range, setRange] = useState('30d');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-6"
      data-testid="analytics-page"
    >
      <motion.div variants={fadeInUp} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Analytics</h1>
          <p className="text-sm text-[#6B7280]">Track your search performance with Google Search Console data.</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[180px] border-[#F0F0F0]" data-testid="analytics-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* GSC banner */}
      <motion.div variants={fadeInUp} className="bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
            <Check size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#0A0A0A]">Google Search Console Connected</p>
            <p className="text-xs text-[#6B7280] truncate">Property: sc-domain:{activeSite?.domain || 'myblog.com'} · Last synced: 2 hours ago</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-[#F0F0F0] bg-white">Select Property</Button>
          <Button size="sm" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Sync Now</Button>
          <Button size="sm" variant="ghost" className="text-[#6B7280]">Disconnect</Button>
        </div>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Clicks"      value="26,089"     delta="+12% vs last month"   deltaPositive color="#1D9E75" />
        <MetricCard label="Total Impressions" value="1,867,192"  delta="+8% vs last month"    deltaPositive color="#2563EB" />
        <MetricCard label="Average CTR"       value="1.40%"      delta="-0.2% vs last month"  deltaPositive={false} color="#F59E0B" />
        <MetricCard label="Average Position"  value="2.8"        delta="+0.4 improved"        deltaPositive color="#8B5CF6" />
      </motion.div>

      {/* Chart */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-[#0A0A0A]">SEO Jalwa Article Traffic & Clicks Over Time</h3>
          <p className="text-xs text-[#6B7280]">How articles written by SEO Jalwa are performing in Google Search</p>
        </div>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SERIES} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="impr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis yAxisId="left"  tick={{ fill: '#2563EB', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#1D9E75', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #F0F0F0', borderRadius: 8 }}
                formatter={(value) => value.toLocaleString()}
              />
              <Legend />
              <Area yAxisId="left"  type="monotone" dataKey="impressions" name="Impressions" stroke="#2563EB" strokeWidth={2} fill="url(#impr)" />
              <Area yAxisId="right" type="monotone" dataKey="clicks"      name="Clicks"      stroke="#1D9E75" strokeWidth={2} fill="url(#clk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Articles table */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
        <div className="p-6 border-b border-[#F0F0F0]">
          <h3 className="font-semibold text-[#0A0A0A]">Your Articles</h3>
          <p className="text-xs text-[#6B7280]">Last 30 days performance from Google Search Console</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Article Title</th>
                <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Impressions</th>
                <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Clicks</th>
                <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">CTR</th>
                <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Avg Position</th>
              </tr>
            </thead>
            <tbody data-testid="articles-table">
              {ARTICLES.map((a, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                  <td className="p-4 text-sm">
                    <a href="#" className="text-[#1D9E75] hover:underline inline-flex items-center gap-1">
                      {a.title} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="p-4 text-sm text-[#0A0A0A] text-right">{a.impressions.toLocaleString()}</td>
                  <td className="p-4 text-sm text-[#0A0A0A] text-right">{a.clicks.toLocaleString()}</td>
                  <td className="p-4 text-sm text-[#0A0A0A] text-right">{a.ctr.toFixed(2)}%</td>
                  <td className="p-4 text-sm text-right"><PositionBadge position={a.position} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Search performance */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#F0F0F0] p-6">
          <h3 className="font-semibold text-[#0A0A0A] mb-4">Top Search Terms</h3>
          <ol className="space-y-3" data-testid="top-search-terms">
            {SEARCH_TERMS.map((t, i) => (
              <li key={i} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                <span className="w-7 h-7 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center text-xs font-bold text-[#6B7280]">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#0A0A0A] truncate">{t.term}</p>
                  <p className="text-xs text-[#6B7280]">{t.clicks.toLocaleString()} clicks · {t.impressions.toLocaleString()} impressions</p>
                </div>
                <PositionBadge position={t.position} />
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-white rounded-xl border border-[#F0F0F0] p-6">
          <h3 className="font-semibold text-[#0A0A0A] mb-4">Top Pages</h3>
          <ol className="space-y-3" data-testid="top-pages">
            {TOP_PAGES.map((p, i) => (
              <li key={i} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                <span className="w-7 h-7 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center text-xs font-bold text-[#6B7280]">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#0A0A0A] truncate font-mono">{p.url}</p>
                  <p className="text-xs text-[#6B7280]">{p.clicks.toLocaleString()} clicks · {p.impressions.toLocaleString()} impressions</p>
                </div>
                <PositionBadge position={p.position} />
              </li>
            ))}
          </ol>
        </div>
      </motion.div>
    </motion.div>
  );
};
