import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Check, ArrowUp, ArrowDown, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useSite } from '../../context/SiteContext';
import { analyticsApi, gscApi } from '../../lib/api';
import { toast } from 'sonner';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const PositionBadge = ({ position }) => {
  if (position == null) return <span className="text-xs text-[#6B7280]">—</span>;
  let cls = 'bg-[#6B7280]/10 text-[#6B7280]';
  if (position <= 10) cls = 'bg-[#1D9E75]/10 text-[#1D9E75]';
  else if (position <= 20) cls = 'bg-[#2563EB]/10 text-[#2563EB]';
  else if (position <= 50) cls = 'bg-[#F59E0B]/10 text-[#F59E0B]';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{position.toFixed(1)}</span>;
};

const MetricCard = ({ label, value, delta, deltaPositive, color, testid }) => (
  <div className="bg-white rounded-xl border border-[#F0F0F0] p-5" data-testid={testid}>
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
  const location = useLocation();
  const navigate = useNavigate();
  const [range, setRange] = useState('30d');
  const [overview, setOverview] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [gscConnecting, setGscConnecting] = useState(false);
  const [gscSyncing, setGscSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Detect ?connected=true after OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('connected') === 'true') {
      toast.success('Google Search Console connected! Syncing data...');
      params.delete('connected');
      const newSearch = params.toString();
      navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
      setReloadKey((k) => k + 1);
    }
    if (params.get('error') === 'gsc_failed') {
      toast.error('Google connection failed. Please try again or contact support.');
      params.delete('error');
      navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  useEffect(() => {
    if (!activeSite?.id) {
      setOverview(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await analyticsApi.overview(activeSite.id, range);
        if (!cancelled) setOverview(data);
      } catch (err) {
        if (!cancelled) setOverview(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id, range, reloadKey]);

  const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : (n ?? '—'));
  const gscConnected = !!overview?.gscConnected;

  const handleGscConnect = async () => {
    setGscConnecting(true);
    try {
      const res = await gscApi.connect();
      const authUrl = res?.authUrl || res?.auth_url;
      if (authUrl) {
        window.location.href = authUrl;
        return;
      }
      toast.error('Could not start Google Search Console connection');
      console.error('GSC connect: no authUrl in response', res);
    } catch (err) {
      console.error('GSC connect failed:', err);
      toast.error(err?.message || 'Could not connect Google Search Console');
    } finally {
      setGscConnecting(false);
    }
  };

  const handleSyncNow = async () => {
    if (!activeSite?.id) {
      toast.error('Connect a site first');
      return;
    }
    setGscSyncing(true);
    try {
      await gscApi.sync(activeSite.id);
      toast.success('Analytics synced');
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error('GSC sync failed:', err);
      toast.error(err?.message || 'Sync failed');
    } finally {
      setGscSyncing(false);
    }
  };

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

      {/* No active site */}
      {!activeSite && (
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-dashed border-[#F0F0F0] p-12 text-center" data-testid="analytics-no-site">
          <Sparkles size={32} className="text-[#1D9E75] mx-auto mb-3" />
          <p className="text-lg font-medium text-[#0A0A0A] mb-1">Connect a website first</p>
          <p className="text-sm text-[#6B7280] mb-4">Add your site to start tracking Google Search Console performance.</p>
          <Link to="/dashboard/connections">
            <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Connect website</Button>
          </Link>
        </motion.div>
      )}

      {/* GSC NOT connected — prominent empty state */}
      {activeSite && !gscConnected && !loading && (
        <motion.div variants={fadeInUp} className="bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-xl p-8 text-center" data-testid="gsc-not-connected">
          <div className="w-12 h-12 rounded-full bg-[#F59E0B] flex items-center justify-center mx-auto mb-3">
            <Sparkles size={22} className="text-white" />
          </div>
          <p className="text-lg font-bold text-[#0A0A0A] mb-1">Connect Google Search Console</p>
          <p className="text-sm text-[#6B7280] mb-4">Get real traffic data — impressions, clicks, CTR, average position, and your top-performing articles.</p>
          <Button onClick={handleGscConnect} disabled={gscConnecting} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="gsc-connect-btn">
            {gscConnecting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Connect Google Search Console
          </Button>
        </motion.div>
      )}

      {/* GSC Connected banner */}
      {activeSite && gscConnected && (
        <motion.div variants={fadeInUp} className="bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-xl p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
              <Check size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-[#0A0A0A]">Google Search Console Connected</p>
              <p className="text-xs text-[#6B7280] truncate">
                Property: sc-domain:{activeSite?.domain || activeSite?.url}
                {overview?.lastSyncedAt ? ` · Last synced: ${new Date(overview.lastSyncedAt).toLocaleString()}` : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSyncNow}
              disabled={gscSyncing}
              className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
              data-testid="gsc-sync-btn"
            >
              {gscSyncing ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
              {gscSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Metrics + Chart + Tables — only when GSC connected */}
      {activeSite && gscConnected && (
        <>
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Clicks"      value={fmt(overview.totalClicks)} color="#1D9E75" testid="metric-total-clicks" />
            <MetricCard label="Total Impressions" value={fmt(overview.totalImpressions)} color="#2563EB" testid="metric-total-impressions" />
            <MetricCard label="Average CTR"       value={overview.avgCTR != null ? `${(overview.avgCTR * 100).toFixed(2)}%` : '—'} color="#F59E0B" testid="metric-avg-ctr" />
            <MetricCard label="Average Position"  value={overview.avgPosition != null ? overview.avgPosition.toFixed(1) : '—'} color="#8B5CF6" testid="metric-avg-position" />
          </motion.div>

          {Array.isArray(overview.trend) && overview.trend.length > 0 && (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-[#0A0A0A]">Article Traffic & Clicks Over Time</h3>
                <p className="text-xs text-[#6B7280]">Daily impressions and clicks from Google Search</p>
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                      formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
                    />
                    <Legend />
                    <Area yAxisId="left"  type="monotone" dataKey="impressions" name="Impressions" stroke="#2563EB" strokeWidth={2} fill="url(#impr)" />
                    <Area yAxisId="right" type="monotone" dataKey="clicks"      name="Clicks"      stroke="#1D9E75" strokeWidth={2} fill="url(#clk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Articles table */}
          {Array.isArray(overview.topArticles) && overview.topArticles.length > 0 && (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
              <div className="p-6 border-b border-[#F0F0F0]">
                <h3 className="font-semibold text-[#0A0A0A]">Your Articles</h3>
                <p className="text-xs text-[#6B7280]">Performance from Google Search Console</p>
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
                    {overview.topArticles.map((a, i) => (
                      <tr key={a.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                        <td className="p-4 text-sm">
                          <a href={a.url || '#'} target="_blank" rel="noreferrer" className="text-[#1D9E75] hover:underline inline-flex items-center gap-1">
                            {a.title} <ExternalLink size={12} />
                          </a>
                        </td>
                        <td className="p-4 text-sm text-[#0A0A0A] text-right">{(a.impressions || 0).toLocaleString()}</td>
                        <td className="p-4 text-sm text-[#0A0A0A] text-right">{(a.clicks || 0).toLocaleString()}</td>
                        <td className="p-4 text-sm text-[#0A0A0A] text-right">{a.ctr != null ? `${(a.ctr * 100).toFixed(2)}%` : '—'}</td>
                        <td className="p-4 text-sm text-right"><PositionBadge position={a.position} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Search performance */}
          {(Array.isArray(overview.topQueries) && overview.topQueries.length > 0) || (Array.isArray(overview.topPages) && overview.topPages.length > 0) ? (
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.isArray(overview.topQueries) && overview.topQueries.length > 0 && (
                <div className="bg-white rounded-xl border border-[#F0F0F0] p-6">
                  <h3 className="font-semibold text-[#0A0A0A] mb-4">Top Search Terms</h3>
                  <ol className="space-y-3" data-testid="top-search-terms">
                    {overview.topQueries.map((t, i) => (
                      <li key={i} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                        <span className="w-7 h-7 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center text-xs font-bold text-[#6B7280]">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#0A0A0A] truncate">{t.query || t.term}</p>
                          <p className="text-xs text-[#6B7280]">{(t.clicks || 0).toLocaleString()} clicks · {(t.impressions || 0).toLocaleString()} impressions</p>
                        </div>
                        <PositionBadge position={t.position} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {Array.isArray(overview.topPages) && overview.topPages.length > 0 && (
                <div className="bg-white rounded-xl border border-[#F0F0F0] p-6">
                  <h3 className="font-semibold text-[#0A0A0A] mb-4">Top Pages</h3>
                  <ol className="space-y-3" data-testid="top-pages">
                    {overview.topPages.map((p, i) => (
                      <li key={i} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                        <span className="w-7 h-7 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center text-xs font-bold text-[#6B7280]">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#0A0A0A] truncate font-mono">{p.url || p.page}</p>
                          <p className="text-xs text-[#6B7280]">{(p.clicks || 0).toLocaleString()} clicks · {(p.impressions || 0).toLocaleString()} impressions</p>
                        </div>
                        <PositionBadge position={p.position} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          ) : null}
        </>
      )}

      {/* Loading skeleton */}
      {activeSite && loading && !overview && (
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-8 h-48 animate-pulse" data-testid="analytics-loading" />
      )}
    </motion.div>
  );
};
