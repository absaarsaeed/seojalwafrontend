import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { DASHBOARD_DATA } from '../../data/publicData';
import { Button } from '../../components/ui/button';
import { ArrowRight, ArrowUp, FileText, Share2, Eye, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const sparklineData = [
  { v: 30 }, { v: 45 }, { v: 35 }, { v: 50 }, { v: 48 }, { v: 60 }, { v: 58 }, { v: 67 }
];

const PriorityBadge = ({ priority }) => {
  const colors = {
    HIGH: 'bg-[#EF4444]/10 text-[#EF4444]',
    MEDIUM: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    LOW: 'bg-[#6B7280]/10 text-[#6B7280]'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const activityIcons = {
  article: FileText,
  social: Share2,
  scan: Eye
};

export const DashboardHome = () => {
  const { user } = useUser();
  const data = DASHBOARD_DATA;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="user-dashboard-home"
    >
      {/* Jalwa Score */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-[#1D9E75] flex items-center justify-center">
              <div className="text-center">
                <span className="font-syne text-4xl font-bold text-[#0A0A0A]">{data.jalwaScore}</span>
                <span className="text-lg text-[#6B7280]">/100</span>
              </div>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-1">Your Jalwa Score</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#1D9E75]">
              <ArrowUp size={16} />
              <span className="font-medium">+{data.jalwaScoreChange} this week</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AI Visibility', value: `${data.aiVisibility}%`, change: `+${data.aiVisibilityChange}%`, icon: Eye },
          { label: 'Articles This Month', value: data.articlesThisMonth, change: null, icon: FileText },
          { label: 'Social Posts Scheduled', value: data.socialPostsScheduled, change: null, icon: Share2 },
          { label: 'Traffic Change', value: `+${data.trafficChange}%`, change: 'this month', icon: TrendingUp }
        ].map((metric, i) => (
          <div key={metric.label} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-[#6B7280] uppercase tracking-wide">{metric.label}</p>
              <metric.icon size={16} className="text-[#1D9E75]" />
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A]">{metric.value}</p>
            {metric.change && (
              <p className="text-xs text-[#1D9E75] mt-1">{metric.change}</p>
            )}
            <div className="h-8 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="v" stroke="#1D9E75" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recommended Actions */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
        <h3 className="font-semibold text-[#0A0A0A] mb-4">Today's Recommended Actions</h3>
        <div className="space-y-3">
          {data.recommendations.map((rec) => (
            <div 
              key={rec.id} 
              className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <PriorityBadge priority={rec.priority} />
                <span className="text-sm text-[#0A0A0A]">{rec.text}</span>
              </div>
              <Link to={rec.link}>
                <Button size="sm" variant="ghost" className="text-[#1D9E75] hover:bg-[#E1F5EE]">
                  {rec.action} <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
        <h3 className="font-semibold text-[#0A0A0A] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {data.recentActivity.map((activity) => {
            const Icon = activityIcons[activity.icon] || FileText;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#1D9E75]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#0A0A0A]">{activity.text}</p>
                  <p className="text-xs text-[#6B7280]">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
