import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DASHBOARD_DATA, PULSE_DATA } from '../../data/publicData';
import { useSite } from '../../context/SiteContext';
import { growthApi } from '../../lib/api';
import { ArrowUp, TrendingUp, Eye, Pen, Share2, Search } from 'lucide-react';
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

const breakdown = [
  { label: 'AI Visibility',       weight: 30, value: 61, icon: Eye,    color: '#1D9E75' },
  { label: 'SEO Content',         weight: 25, value: 72, icon: Search, color: '#2563EB' },
  { label: 'Social Consistency',  weight: 25, value: 58, icon: Share2, color: '#F59E0B' },
  { label: 'Content Performance', weight: 20, value: 78, icon: Pen,    color: '#8B5CF6' }
];

export const GrowthScorePage = () => {
  const { activeSite } = useSite();
  const [live, setLive] = useState(null);

  useEffect(() => {
    if (!activeSite?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await growthApi.get(activeSite.id);
        if (!cancelled) setLive(data);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id]);

  const score = live?.latest?.score ?? DASHBOARD_DATA.jalwaScore;
  const change = live?.latest?.change ?? live?.latest?.weeklyChange ?? DASHBOARD_DATA.jalwaScoreChange;
  const history = Array.isArray(live?.history) && live.history.length
    ? live.history.map((h) => ({ week: h.week || h.label || h.date, score: h.score }))
    : PULSE_DATA.scoreHistory;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="growth-score-page"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Growth Score</h1>
        <p className="text-sm text-[#6B7280]">Your overall brand performance — one number, four dimensions.</p>
      </motion.div>

      {/* Score widget */}
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
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#1D9E75] mb-2">
              <ArrowUp size={20} />
              <span className="text-xl font-semibold">+{change} this week</span>
            </div>
            <p className="text-[#6B7280] mb-4">
              You're above 78% of brands in your size range. Keep publishing consistently to climb higher.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E1F5EE] rounded-full">
              <TrendingUp size={14} className="text-[#1D9E75]" />
              <span className="text-sm font-medium text-[#1D9E75]">Trending up</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Score history */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
        <h3 className="font-semibold text-[#0A0A0A] mb-4">Score history (last 8 weeks)</h3>
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

      {/* What affects your score */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
        <h3 className="font-semibold text-[#0A0A0A] mb-4">What affects your score</h3>
        <div className="space-y-4">
          {breakdown.map((item) => (
            <div key={item.label} className="p-4 bg-[#F9FAFB] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}1A` }}>
                    <item.icon size={18} style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-[#0A0A0A]">{item.label}</p>
                    <p className="text-xs text-[#6B7280]">Weight: {item.weight}%</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-[#0A0A0A]">{item.value}<span className="text-sm text-[#6B7280]">/100</span></span>
              </div>
              <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
