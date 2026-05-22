import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSite } from '../../context/SiteContext';
import { growthApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { ArrowUp, ArrowDown, TrendingUp, Eye, Pen, Share2, Search, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 shadow-sm">
        <p className="text-xs text-[#6B7280]">{label}</p>
        <p className="text-sm font-semibold text-[#0A0A0A]">{payload[0].value}/100</p>
      </div>
    );
  }
  return null;
};

const COMPONENT_DEFS = [
  { key: 'aiVisibility',      label: 'AI Visibility',       icon: Eye,    color: '#1D9E75' },
  { key: 'seoContent',        label: 'SEO Content',         icon: Search, color: '#2563EB' },
  { key: 'socialConsistency', label: 'Social Consistency',  icon: Share2, color: '#F59E0B' },
  { key: 'trafficTrend',      label: 'Traffic Trend',       icon: TrendingUp, color: '#8B5CF6' },
  { key: 'contentPerformance',label: 'Content Performance', icon: Pen,    color: '#8B5CF6' },
];

export const GrowthScorePage = () => {
  const { activeSite } = useSite();
  const [live, setLive] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeSite?.id) {
      setLive(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await growthApi.get(activeSite.id);
        if (!cancelled) setLive(data || null);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Could not load growth score');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id]);

  const score = live?.latest?.score ?? live?.score;
  const change = live?.latest?.change ?? live?.latest?.weeklyChange ?? live?.change;
  const history = Array.isArray(live?.history) ? live.history.map((h) => ({
    week: h.week || h.label || h.date,
    score: h.score,
  })) : null;
  const components = live?.latest?.components || live?.components || {};

  const hasData = score != null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="growth-score-page"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Growth Score</h1>
        <p className="text-sm text-[#6B7280]">Your overall brand performance — one number, four dimensions.</p>
      </motion.div>

      {/* No active site */}
      {!activeSite && (
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-dashed border-[#F0F0F0] p-12 text-center" data-testid="growth-no-site">
          <Sparkles size={32} className="text-[#1D9E75] mx-auto mb-3" />
          <p className="text-lg font-medium text-[#0A0A0A] mb-1">Connect a website to see your Growth Score</p>
          <p className="text-sm text-[#6B7280] mb-4">Add your site to start tracking AI visibility and SEO content health.</p>
          <Link to="/dashboard/connections">
            <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Connect website</Button>
          </Link>
        </motion.div>
      )}

      {/* Loading */}
      {activeSite && isLoading && !live && (
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-8 h-60 animate-pulse" data-testid="growth-loading" />
      )}

      {/* Empty state */}
      {activeSite && !isLoading && !hasData && (
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-dashed border-[#F0F0F0] p-12 text-center" data-testid="growth-empty">
          <Sparkles size={32} className="text-[#1D9E75] mx-auto mb-3" />
          <p className="text-lg font-medium text-[#0A0A0A] mb-1">Your growth score will appear here</p>
          <p className="text-sm text-[#6B7280] mb-4">{error || 'Run your first AI scan to generate your score.'}</p>
          <Link to="/dashboard/ai-visibility">
            <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="growth-run-scan-btn">Run AI Scan</Button>
          </Link>
        </motion.div>
      )}

      {/* Score widget */}
      {activeSite && hasData && (
        <>
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-44 h-44 rounded-full border-8 border-[#1D9E75] flex items-center justify-center bg-[#E1F5EE]/30">
                  <div className="text-center">
                    <span className="font-syne text-6xl font-bold text-[#0A0A0A]" data-testid="growth-score-value">{score}</span>
                    <span className="text-xl text-[#6B7280]">/100</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <p className="text-sm text-[#6B7280] uppercase tracking-wide mb-1">Your Growth Score</p>
                {change != null && (
                  <div className={`flex items-center justify-center md:justify-start gap-2 mb-2 ${change >= 0 ? 'text-[#1D9E75]' : 'text-[#EF4444]'}`}>
                    {change >= 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                    <span className="text-xl font-semibold" data-testid="growth-change-text">{change > 0 ? '+' : ''}{change} this week</span>
                  </div>
                )}
                {live?.percentile != null && (
                  <p className="text-[#6B7280] mb-4">
                    You're above {live.percentile}% of brands in your size range.
                  </p>
                )}
                {change != null && change >= 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E1F5EE] rounded-full">
                    <TrendingUp size={14} className="text-[#1D9E75]" />
                    <span className="text-sm font-medium text-[#1D9E75]">Trending up</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Score history */}
          {history && history.length > 0 && (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
              <h3 className="font-semibold text-[#0A0A0A] mb-4">Score history (last {history.length} weeks)</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="#1D9E75" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#1D9E75' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Component breakdown */}
          {(() => {
            const items = COMPONENT_DEFS
              .map((d) => ({ ...d, value: components[d.key] ?? components[d.label] }))
              .filter((d) => d.value != null);
            if (items.length === 0) return null;
            return (
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="growth-components">
                <h3 className="font-semibold text-[#0A0A0A] mb-4">What affects your score</h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.key} className="p-4 bg-[#F9FAFB] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}1A` }}>
                            <item.icon size={18} style={{ color: item.color }} />
                          </div>
                          <p className="font-medium text-[#0A0A0A]">{item.label}</p>
                        </div>
                        <span className="text-xl font-bold text-[#0A0A0A]">
                          {item.value}<span className="text-sm text-[#6B7280]">/100</span>
                        </span>
                      </div>
                      <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })()}
        </>
      )}
    </motion.div>
  );
};
