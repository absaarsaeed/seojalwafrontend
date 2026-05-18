import { useState, useEffect } from 'react';
import { MetricCard, SkeletonCard } from '../components/MetricCard';
import { ChartSkeleton } from '../components/SkeletonLoaders';
import { DASHBOARD_METRICS, PLAN_DISTRIBUTION, USER_SIGNUPS_CHART, RECENT_ACTIVITY } from '../data/dummyData';
import { Users, UserCheck, DollarSign, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
          value={DASHBOARD_METRICS.totalUsers}
          trend={DASHBOARD_METRICS.trends.totalUsers}
          icon={Users}
        />
        <MetricCard
          title="Paid Users"
          value={DASHBOARD_METRICS.paidUsers}
          trend={DASHBOARD_METRICS.trends.paidUsers}
          icon={UserCheck}
        />
        <MetricCard
          title="MRR"
          value={DASHBOARD_METRICS.mrr}
          trend={DASHBOARD_METRICS.trends.mrr}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Churn This Month"
          value={DASHBOARD_METRICS.churn}
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
              <p className="text-2xl font-bold text-[#09090B] mt-1">{PLAN_DISTRIBUTION.starter.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-[#09090B] mt-1">{PLAN_DISTRIBUTION.growth.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-[#09090B] mt-1">{PLAN_DISTRIBUTION.agency.toLocaleString()}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium">
              Agency
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
