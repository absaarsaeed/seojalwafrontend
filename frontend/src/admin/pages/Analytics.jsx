import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { ChartSkeleton, TableSkeleton } from '../components/SkeletonLoaders';
import { SkeletonCard } from '../components/MetricCard';
import { EmptyState } from '../components/EmptyState';
import {
  TrendingUp, Users, DollarSign, FileText, BarChart3, Sparkles, Search,
} from 'lucide-react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#1D9E75', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 shadow-sm">
      {label && <p className="text-xs text-[#71717A] mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

const Metric = ({ title, value, icon: Icon, accent = '#1D9E75', accentBg = '#E1F5EE', sub, testid }) => (
  <div className="admin-card p-5" data-testid={testid}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A] mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#09090B]">{value}</p>
        {sub && <p className="text-xs text-[#71717A] mt-1">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentBg }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
    </div>
  </div>
);

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminApi.analytics();
        if (!cancelled) setData(res || {});
      } catch (err) {
        toast.error(err?.message || 'Could not load analytics');
        if (!cancelled) setData({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6" data-testid="admin-analytics-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
        </div>
        <ChartSkeleton height={280} />
        <TableSkeleton rows={4} columns={4} />
      </div>
    );
  }

  // Backend shape:
  // { users: { total, byPlan, newToday, newThisWeek, newThisMonth, dailySignups[] },
  //   revenue: { mrr, arr, thisMonth, lastMonth, dailyRevenue[] },
  //   content: { articlesGenerated, articlesThisMonth, aiScansRun, totalWordsWritten },
  //   funnel: { registered, connectedSite, generatedArticle, ranScan, upgradedToPaid, visitors, signups, trial, paid } }
  const users = data?.users || {};
  const revenue = data?.revenue || {};
  const content = data?.content || {};
  const funnel = data?.funnel || {};

  const dailySignups = Array.isArray(users.dailySignups)
    ? users.dailySignups.map((d) => ({ date: fmtDate(d.date), count: d.count || 0 }))
    : [];
  const dailyRevenue = Array.isArray(revenue.dailyRevenue)
    ? revenue.dailyRevenue.map((d) => ({ date: fmtDate(d.date), amount: d.amount || 0 }))
    : [];
  const planDist = Object.entries(users.byPlan || {})
    .filter(([, v]) => (v || 0) > 0)
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }));

  // Conversion funnel: visitors → signups → trial → paid (the 4 keys present)
  const funnelData = [
    funnel.visitors != null && { stage: 'Visitors', count: funnel.visitors },
    funnel.signups != null && { stage: 'Signups', count: funnel.signups },
    funnel.trial != null && { stage: 'Trial Started', count: funnel.trial },
    funnel.connectedSite != null && { stage: 'Connected Site', count: funnel.connectedSite },
    funnel.generatedArticle != null && { stage: 'Generated Article', count: funnel.generatedArticle },
    funnel.paid != null && { stage: 'Paid', count: funnel.paid },
  ].filter(Boolean);

  const totalRevenue = revenue.mrr || revenue.thisMonth || 0;
  const conversionRate = funnel.signups && funnel.paid != null
    ? ((funnel.paid / funnel.signups) * 100).toFixed(1)
    : null;

  const hasAnything = users.total != null || revenue.mrr != null || content.articlesGenerated != null;

  if (!hasAnything) {
    return (
      <div data-testid="admin-analytics-page" className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#09090B]">Analytics</h1>
          <p className="text-sm text-[#71717A]">Live platform analytics — users, revenue, content, conversion.</p>
        </div>
        <div className="admin-card">
          <EmptyState
            title="No analytics data yet"
            description="Analytics will populate once you have users, revenue, and content activity."
            icon={BarChart3}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-analytics-page">
      <div>
        <h1 className="text-2xl font-semibold text-[#09090B]">Analytics</h1>
        <p className="text-sm text-[#71717A]">Live platform analytics — users, revenue, content, conversion.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Metric
          title="Total Users"
          value={(users.total || 0).toLocaleString()}
          sub={`+${users.newThisMonth || 0} this month`}
          icon={Users}
          testid="metric-total-users"
        />
        <Metric
          title="Monthly Revenue"
          value={`$${(totalRevenue || 0).toLocaleString()}`}
          sub={revenue.lastMonth != null ? `Last month: $${revenue.lastMonth.toLocaleString()}` : null}
          icon={DollarSign}
          accent="#3B82F6" accentBg="#DBEAFE"
          testid="metric-monthly-revenue"
        />
        <Metric
          title="Conversion Rate"
          value={conversionRate != null ? `${conversionRate}%` : '—'}
          sub={funnel.paid != null ? `${funnel.paid} paid / ${funnel.signups} signups` : null}
          icon={TrendingUp}
          accent="#F59E0B" accentBg="#FEF3C7"
          testid="metric-conversion-rate"
        />
        <Metric
          title="Articles Generated"
          value={(content.articlesGenerated || 0).toLocaleString()}
          sub={`${content.articlesThisMonth || 0} this month`}
          icon={FileText}
          accent="#8B5CF6" accentBg="#EDE9FE"
          testid="metric-total-articles"
        />
      </div>

      {/* Signups Line + Plan Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card p-5" data-testid="chart-signups">
          <h3 className="text-sm font-semibold text-[#09090B] mb-4">User Signups (30 days)</h3>
          {dailySignups.length === 0 ? (
            <EmptyState title="No signup data" description="User signup history will appear here." icon={Users} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailySignups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Signups"
                  stroke="#1D9E75" strokeWidth={2}
                  dot={false} activeDot={{ r: 4, fill: '#1D9E75' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="admin-card p-5" data-testid="chart-plan-distribution">
          <h3 className="text-sm font-semibold text-[#09090B] mb-4">Plan Distribution</h3>
          {planDist.length === 0 ? (
            <EmptyState title="No plan data" description="Active plan breakdown will appear here." icon={BarChart3} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={planDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={90}
                  paddingAngle={2}
                  label={(e) => `${e.name}: ${e.value}`}
                >
                  {planDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Revenue Bars */}
      <div className="admin-card p-5" data-testid="chart-revenue">
        <h3 className="text-sm font-semibold text-[#09090B] mb-4">Revenue (30 days)</h3>
        {dailyRevenue.length === 0 ? (
          <EmptyState title="No revenue data" description="Daily revenue will appear here." icon={DollarSign} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip prefix="$" />} />
              <Bar dataKey="amount" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Conversion Funnel */}
      <div className="admin-card p-5" data-testid="chart-funnel">
        <h3 className="text-sm font-semibold text-[#09090B] mb-4">Conversion Funnel</h3>
        {funnelData.length === 0 ? (
          <EmptyState title="No funnel data" description="Conversion funnel will appear here." icon={TrendingUp} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="stage"
                axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }}
                width={160}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#1D9E75" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Content Stats */}
      <div className="admin-card overflow-hidden" data-testid="table-content-stats">
        <div className="p-5 border-b border-[#F0F0F0]">
          <h3 className="text-sm font-semibold text-[#09090B]">Content Stats</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#F0F0F0]">
          <div className="bg-white p-5" data-testid="content-articles-generated">
            <div className="flex items-center gap-2 text-[#71717A] mb-1.5">
              <FileText size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wide">Articles Generated</span>
            </div>
            <p className="text-2xl font-bold text-[#09090B]">{(content.articlesGenerated || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-5" data-testid="content-articles-month">
            <div className="flex items-center gap-2 text-[#71717A] mb-1.5">
              <FileText size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wide">This Month</span>
            </div>
            <p className="text-2xl font-bold text-[#09090B]">{(content.articlesThisMonth || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-5" data-testid="content-scans">
            <div className="flex items-center gap-2 text-[#71717A] mb-1.5">
              <Search size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wide">AI Scans Run</span>
            </div>
            <p className="text-2xl font-bold text-[#09090B]">{(content.aiScansRun || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-5" data-testid="content-words">
            <div className="flex items-center gap-2 text-[#71717A] mb-1.5">
              <Sparkles size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wide">Words Written</span>
            </div>
            <p className="text-2xl font-bold text-[#09090B]">{(content.totalWordsWritten || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
