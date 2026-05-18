import { TrendingUp, TrendingDown } from 'lucide-react';

export const MetricCard = ({ title, value, trend, icon: Icon, format = 'number' }) => {
  const formatValue = (val) => {
    if (format === 'currency') {
      return `$${val.toLocaleString()}`;
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="admin-card p-5" data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#71717A] mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#09090B]">
            {formatValue(value)}
          </p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-[#E8F5F1] flex items-center justify-center">
            <Icon size={20} className="text-[#1D9E75]" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          {trend.up ? (
            <TrendingUp size={14} className="text-[#1D9E75]" />
          ) : (
            <TrendingDown size={14} className="text-[#EF4444]" />
          )}
          <span className={`text-xs font-medium ${trend.up ? 'text-[#1D9E75]' : 'text-[#EF4444]'}`}>
            {trend.value}%
          </span>
          <span className="text-xs text-[#71717A]">vs last month</span>
        </div>
      )}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="admin-card p-5">
    <div className="flex items-start justify-between">
      <div>
        <div className="h-3 w-20 bg-[#F0F0F0] rounded skeleton-pulse mb-2" />
        <div className="h-8 w-24 bg-[#F0F0F0] rounded skeleton-pulse" />
      </div>
      <div className="w-10 h-10 rounded-lg bg-[#F0F0F0] skeleton-pulse" />
    </div>
    <div className="mt-3 flex items-center gap-2">
      <div className="h-3 w-16 bg-[#F0F0F0] rounded skeleton-pulse" />
    </div>
  </div>
);
