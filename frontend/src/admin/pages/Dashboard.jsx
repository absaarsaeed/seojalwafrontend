import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MetricCard, SkeletonCard } from '../components/MetricCard';
import { ChartSkeleton } from '../components/SkeletonLoaders';
import { DASHBOARD_METRICS, PLAN_DISTRIBUTION, USER_SIGNUPS_CHART, RECENT_ACTIVITY } from '../data/dummyData';
import { Users, UserCheck, DollarSign, TrendingDown, Sparkles, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { adminApi } from '../../lib/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 shadow-sm">
        <p className="text-xs text-[#71717A]">{label}</p>
        <p className="text-sm font-semibold text-[#09090B]">{payload[0].value.toLocaleString()} users</p>
      </div>
    );
  }
  return null;
};

const ActivityDot = ({ type }) => {
  const colors = {
    signup: 'bg-[#1D9E75]',
    upgrade: 'bg-[#2563EB]',
    cancel: 'bg-[#EF4444]'
  };
  return <div className={`w-2 h-2 rounded-full ${colors[type] || 'bg-[#71717A]'}`} />;
};

export const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.dashboardStats();
        if (!cancelled) setStats(data);
      } catch {}
      try {
        const ins = await adminApi.insightsRetention(false);
        if (!cancelled) setInsights(ins);
      } catch {}
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const liveMetrics = stats ? {
    totalUsers: stats.totalUsers ?? 0,
    paidUsers: stats.paidUsers ?? 0,
    mrr: stats.MRR ?? 0,
    churn: stats.churnThisMonth ?? 0,
  } : DASHBOARD_METRICS;

  const planDist = stats?.planDistribution ?? PLAN_DISTRIBUTION;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3"><ChartSkeleton height={300} /></div>
          <div className="lg:col-span-2"><ChartSkeleton height={300} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={liveMetrics.totalUsers}
          trend={DASHBOARD_METRICS.trends.totalUsers}
          icon={Users}
        />
        <MetricCard
          title="Paid Users"
          value={liveMetrics.paidUsers}
          trend={DASHBOARD_METRICS.trends.paidUsers}
          icon={UserCheck}
        />
        <MetricCard
          title="MRR"
          value={liveMetrics.mrr}
          trend={DASHBOARD_METRICS.trends.mrr}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Churn This Month"
          value={liveMetrics.churn}
          trend={DASHBOARD_METRICS.trends.churn}
          icon={TrendingDown}
          format="percentage"
        />
      </div>

      {/* Chart and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* User Signups Chart */}
        <div className="lg:col-span-3 admin-card p-5">
          <h3 className="text-sm font-semibold text-[#09090B] mb-4">User Signups (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={USER_SIGNUPS_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#1D9E75" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#1D9E75' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 admin-card p-5">
          <h3 className="text-sm font-semibold text-[#09090B] mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {RECENT_ACTIVITY.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3"
                data-testid={`activity-item-${activity.id}`}
              >
                <div className="mt-1.5">
                  <ActivityDot type={activity.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#27272A] truncate">{activity.message}</p>
                  <p className="text-xs text-[#71717A]">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A]">Starter Plan</p>
              <p className="text-2xl font-bold text-[#09090B] mt-1" data-testid="plan-dist-starter">{(planDist.starter ?? 0).toLocaleString()}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-medium">
              Starter
            </div>
          </div>
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A]">Growth Plan</p>
              <p className="text-2xl font-bold text-[#09090B] mt-1" data-testid="plan-dist-growth">{(planDist.growth ?? 0).toLocaleString()}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-medium">
              Growth
            </div>
          </div>
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A]">Agency Plan</p>
              <p className="text-2xl font-bold text-[#09090B] mt-1" data-testid="plan-dist-agency">{(planDist.agency ?? 0).toLocaleString()}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium">
              Agency
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights widget */}
      <div className="admin-card p-5" data-testid="dashboard-insights-widget">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#1D9E75]" />
            <h3 className="font-semibold text-[#09090B]">AI Insights — Retention</h3>
          </div>
          <Link to="/adminpanel/insights" className="text-sm text-[#1D9E75] hover:underline inline-flex items-center gap-1" data-testid="dashboard-insights-view-all">
            View all suggestions <ArrowRight size={14} />
          </Link>
        </div>
        {!insights ? (
          <p className="text-sm text-[#71717A]">Loading AI suggestions...</p>
        ) : !Array.isArray(insights.suggestions) || insights.suggestions.length === 0 ? (
          <p className="text-sm text-[#71717A]">No suggestions yet. Re-run the analysis when you have more active users.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.suggestions.slice(0, 3).map((s, i) => {
              const priority = (s.priority || '').toUpperCase();
              const cls = priority === 'HIGH' ? 'border-[#EF4444]/30 bg-[#EF4444]/5'
                : priority === 'MEDIUM' ? 'border-[#F59E0B]/30 bg-[#F59E0B]/5'
                : 'border-[#F0F0F0] bg-[#F9FAFB]';
              return (
                <div key={s.id || i} className={`rounded-lg p-4 border ${cls}`} data-testid={`dashboard-insight-${i}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-white">{priority || '—'}</span>
                    {s.category && <span className="text-[10px] text-[#71717A] uppercase">{s.category}</span>}
                  </div>
                  <p className="text-sm font-semibold text-[#09090B] mb-1">{s.title}</p>
                  <p className="text-xs text-[#71717A] line-clamp-3">{s.recommendation || s.insight}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
