import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PULSE_DATA } from '../../data/publicData';
import { useSite } from '../../context/SiteContext';
import { aiVisibilityApi } from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { RefreshCw, Plus, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const StatusBadge = ({ status }) => {
  const colors = {
    positive: 'bg-[#1D9E75]/10 text-[#1D9E75]',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    neutral: 'bg-[#6B7280]/10 text-[#6B7280]'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
      {status === 'positive' ? 'Good' : status === 'warning' ? 'Needs Work' : 'Neutral'}
    </span>
  );
};

const DifficultyBadge = ({ difficulty }) => {
  const colors = {
    Easy: 'bg-[#1D9E75]/10 text-[#1D9E75]',
    Medium: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    Hard: 'bg-[#EF4444]/10 text-[#EF4444]'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 shadow-sm">
        <p className="text-xs text-[#6B7280]">{label}</p>
        <p className="text-sm font-semibold text-[#0A0A0A]">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const PulsePage = () => {
  const data = PULSE_DATA;
  const { activeSite } = useSite();
  const [newCompetitor, setNewCompetitor] = useState('');
  const [simulatorQuery, setSimulatorQuery] = useState('');
  const [scans, setScans] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!activeSite?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await aiVisibilityApi.scans(activeSite.id);
        if (!cancelled) setScans(Array.isArray(list) ? list : []);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id]);

  const handleScan = async () => {
    if (!activeSite?.id) {
      toast.error('Connect a site first');
      return;
    }
    setIsScanning(true);
    try {
      await aiVisibilityApi.scan({ siteId: activeSite.id });
      const list = await aiVisibilityApi.scans(activeSite.id);
      setScans(Array.isArray(list) ? list : []);
      toast.success('New AI visibility scan completed');
    } catch (err) {
      toast.error(err?.message || 'Could not run scan');
    } finally {
      setIsScanning(false);
    }
  };

  const liveScore = scans?.[0]?.overallScore;
  const displayScore = liveScore ?? data.overallScore;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="pulse-page"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">AI Visibility</h1>
          <p className="text-sm text-[#6B7280]">Monitor your AI visibility across all major platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#E1F5EE] rounded-lg">
            <span className="text-sm text-[#6B7280]">AI Visibility Score: </span>
            <span className="font-bold text-[#1D9E75]" data-testid="ai-visibility-score">{displayScore}/100</span>
          </div>
          <Button onClick={handleScan} disabled={isScanning} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="run-scan-btn">
            <RefreshCw size={16} className={`mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run new scan'}
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#F0F0F0]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score Over Time */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Visibility Score Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#1D9E75" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#1D9E75' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* AI Model Breakdown */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">AI Model Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {data.aiModels.map((model) => (
                <div key={model.name} className="text-center p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-sm text-[#6B7280] mb-2">{model.name}</p>
                  <p className="text-2xl font-bold text-[#0A0A0A] mb-2">{model.score}%</p>
                  <Progress value={model.score} className="h-2 mb-2" />
                  <StatusBadge status={model.status} />
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <div className="flex items-center gap-3 mb-6">
              <Input
                placeholder="Add competitor domain (e.g., competitor.com)"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                className="max-w-sm border-[#F0F0F0]"
              />
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            </div>
            
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Competitor Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[...data.competitors, { name: 'Your site', score: data.overallScore }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="#1D9E75" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-2">AI Response Simulator</h3>
            <p className="text-sm text-[#6B7280] mb-4">See how AI responds to questions about your industry</p>
            <div className="flex gap-3 mb-6">
              <Input
                placeholder="Ask any question about your industry..."
                value={simulatorQuery}
                onChange={(e) => setSimulatorQuery(e.target.value)}
                className="flex-1 border-[#F0F0F0]"
              />
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                Simulate
              </Button>
            </div>
            
            <div className="p-4 bg-[#F9FAFB] rounded-lg">
              <p className="text-sm text-[#6B7280] mb-2">Example response:</p>
              <p className="text-[#0A0A0A]">
                "When looking for the best solutions in this space, there are several strong options. 
                Your brand appears in recommendations but isn't consistently the top choice. 
                Improving your content authority could boost your visibility."
              </p>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Improvement Recommendations</h3>
            <div className="space-y-4">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="flex items-center gap-4">
                    <DifficultyBadge difficulty={rec.difficulty} />
                    <span className="text-sm text-[#0A0A0A]">{rec.text}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#1D9E75] font-medium">+{rec.impact} pts</span>
                    <Button size="sm" variant="ghost" className="text-[#1D9E75]">
                      Start <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
