import { useState, useEffect } from 'react';
import { MetricCard, SkeletonCard } from '../components/MetricCard';
import { ChartSkeleton, TableSkeleton } from '../components/SkeletonLoaders';
import { ANALYTICS_DATA } from '../data/dummyData';
import { Eye, Clock, TrendingUp, Zap } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 shadow-sm">
        <p className="text-xs text-[#71717A]">{label}</p>
        <p className="text-sm font-semibold text-[#09090B]">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export const Analytics = () => {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
        </div>
        <ChartSkeleton height={280} />
        <TableSkeleton rows={4} columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-page">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Pageviews"
          value={ANALYTICS_DATA.pageviews}
          icon={Eye}
        />
        <div className="admin-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A] mb-1">
                Avg Session Duration
              </p>
              <p className="text-2xl font-bold text-[#09090B]">
                {ANALYTICS_DATA.avgSessionDuration}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#E8F5F1] flex items-center justify-center">
              <Clock size={20} className="text-[#1D9E75]" />
            </div>
          </div>
        </div>
        <MetricCard
          title="Conversion Rate"
          value={ANALYTICS_DATA.conversionRate}
          format="percentage"
          icon={TrendingUp}
        />
        <div className="admin-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A] mb-1">
                Most Used Module
              </p>
              <p className="text-xl font-bold text-[#09090B]">
                {ANALYTICS_DATA.mostUsedModule}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#E8F5F1] flex items-center justify-center">
              <Zap size={20} className="text-[#1D9E75]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="admin-card p-5">
          <h3 className="text-sm font-semibold text-[#09090B] mb-4">User Growth (12 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ANALYTICS_DATA.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 11 }}
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

        {/* Module Usage */}
        <div className="admin-card p-5">
          <h3 className="text-sm font-semibold text-[#09090B] mb-4">Module Usage Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ANALYTICS_DATA.moduleUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
              <XAxis 
                type="number"
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 11 }}
              />
              <YAxis 
                type="category"
                dataKey="module"
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 11 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="usage" 
                fill="#1D9E75" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="admin-card p-5">
        <h3 className="text-sm font-semibold text-[#09090B] mb-4">Conversion Funnel</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ANALYTICS_DATA.conversionFunnel}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis 
              dataKey="stage" 
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
            <Bar 
              dataKey="count" 
              fill="#1D9E75" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Usage Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-5 border-b border-[#F0F0F0]">
          <h3 className="text-sm font-semibold text-[#09090B]">Feature Usage Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full admin-table" data-testid="feature-usage-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Active Users</th>
                <th>Avg Usage/Month</th>
                <th>Top Action</th>
              </tr>
            </thead>
            <tbody>
              {ANALYTICS_DATA.featureUsage.map((feature, index) => (
                <tr key={index}>
                  <td className="font-medium text-[#09090B]">{feature.module}</td>
                  <td>{feature.activeUsers.toLocaleString()}</td>
                  <td>{feature.avgUsage}</td>
                  <td>
                    <span className="px-2 py-0.5 bg-[#FAFAFA] rounded text-xs">
                      {feature.topAction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
