import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';
import { Sparkles, RefreshCw, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const PRIORITY = {
  HIGH:   { label: 'High',   cls: 'bg-[#EF4444]/10 text-[#EF4444]' },
  MEDIUM: { label: 'Medium', cls: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
  LOW:    { label: 'Low',    cls: 'bg-[#71717A]/10 text-[#71717A]' },
};
const EFFORT = {
  EASY:   { label: 'Easy',   cls: 'bg-[#1D9E75]/10 text-[#1D9E75]' },
  MEDIUM: { label: 'Medium', cls: 'bg-[#2563EB]/10 text-[#2563EB]' },
  HARD:   { label: 'Hard',   cls: 'bg-[#8B5CF6]/10 text-[#8B5CF6]' },
};

const Pill = ({ value, map }) => {
  const k = (value || '').toUpperCase();
  const m = map[k] || { label: value || '—', cls: 'bg-[#F0F0F0] text-[#71717A]' };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${m.cls}`}>{m.label}</span>;
};

const Metric = ({ label, value, sublabel }) => (
  <div className="admin-card p-4">
    <p className="text-xs text-[#71717A] uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-semibold text-[#09090B] mt-1">{value ?? '—'}</p>
    {sublabel && <p className="text-xs text-[#71717A] mt-0.5">{sublabel}</p>}
  </div>
);

export const AdminInsights = () => {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (force = false) => {
    if (force) setRefreshing(true);
    else setData(null);
    try {
      const res = await adminApi.insightsRetention(force);
      setData(res || null);
    } catch (err) {
      toast.error(err?.message || 'Could not load insights');
      setData({ suggestions: [], metrics: {} });
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => { load(false); }, []);

  const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
  const metrics = data?.metrics || {};

  return (
    <div data-testid="admin-insights-page">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#09090B] flex items-center gap-2">
            <Sparkles size={20} className="text-[#1D9E75]" />
            AI Insights — Retention
          </h1>
          <p className="text-sm text-[#71717A]">GPT-powered suggestions to keep more users active and paying.</p>
        </div>
        <Button onClick={() => load(true)} disabled={refreshing} variant="outline" data-testid="insights-refresh-btn">
          {refreshing ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
          Re-run analysis
        </Button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" data-testid="insights-metrics">
        <Metric label="Active 30d" value={metrics.activeUsers30d ?? metrics.activeUsers ?? metrics.active_users_30d} />
        <Metric label="Churn rate" value={metrics.churnRate != null ? `${metrics.churnRate}%` : '—'} sublabel="Last 30 days" />
        <Metric label="Activation rate" value={metrics.activationRate != null ? `${metrics.activationRate}%` : '—'} sublabel="Trial → paid" />
        <Metric label="Avg articles / user" value={metrics.avgArticlesPerUser ?? metrics.avg_articles_per_user} />
      </div>

      {!data ? (
        <TableSkeleton rows={3} cols={1} />
      ) : suggestions.length === 0 ? (
        <EmptyState title="No suggestions yet" description="Try running the analysis once you have at least a dozen active users." icon={TrendingUp} />
      ) : (
        <div className="space-y-3" data-testid="insights-suggestions">
          {suggestions.map((s, i) => (
            <div key={s.id || i} className="admin-card p-5" data-testid={`insight-suggestion-${i}`}>
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Pill value={s.priority} map={PRIORITY} />
                  <Pill value={s.effort} map={EFFORT} />
                  {s.category && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#F0F0F0] text-[#71717A]">{s.category}</span>
                  )}
                </div>
                {s.expectedImpact && (
                  <span className="text-xs text-[#71717A]">Expected impact: <strong className="text-[#0A0A0A]">{s.expectedImpact}</strong></span>
                )}
              </div>
              <h3 className="font-semibold text-[#09090B] mb-1">{s.title}</h3>
              {s.insight && <p className="text-sm text-[#71717A] mb-3">{s.insight}</p>}
              {s.recommendation && (
                <div className="bg-[#E1F5EE]/40 border border-[#1D9E75]/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#1D9E75] uppercase mb-1">Recommendation</p>
                  <p className="text-sm text-[#0A0A0A]">{s.recommendation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data?.generatedAt && (
        <p className="text-xs text-[#71717A] mt-4">Generated {new Date(data.generatedAt).toLocaleString()}</p>
      )}
    </div>
  );
};

export default AdminInsights;
