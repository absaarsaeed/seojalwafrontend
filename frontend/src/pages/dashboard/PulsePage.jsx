import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { aiVisibilityApi, aiVisibilityLatestApi } from '../../lib/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { RefreshCw, ArrowRight, ChevronDown, MessageSquareText, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DifficultyBadge = ({ difficulty }) => {
  const key = (difficulty || '').toString().toLowerCase();
  const colors = {
    easy: 'bg-[#1D9E75]/10 text-[#1D9E75]',
    medium: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    hard: 'bg-[#EF4444]/10 text-[#EF4444]',
  };
  const label = difficulty ? difficulty[0].toUpperCase() + difficulty.slice(1) : 'Easy';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[key] || colors.easy}`}>
      {label}
    </span>
  );
};

const ImpactBadge = ({ impact }) => {
  const key = (impact || '').toString().toLowerCase();
  const colors = {
    low: 'bg-[#71717A]/10 text-[#71717A]',
    medium: 'bg-[#2563EB]/10 text-[#2563EB]',
    high: 'bg-[#1D9E75]/10 text-[#1D9E75]',
  };
  const label = `${key ? key[0].toUpperCase() + key.slice(1) : 'Low'} impact`;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[key] || colors.low}`}>
      {label}
    </span>
  );
};

const VisibilityStatusBadge = ({ status, score }) => {
  // Derive status from numeric score if backend didn't supply one.
  let key = (status || '').toString().toUpperCase();
  if (!key && typeof score === 'number') {
    if (score >= 70) key = 'VISIBLE';
    else if (score >= 40) key = 'PARTIAL';
    else key = 'NOT_VISIBLE';
  }
  const map = {
    VISIBLE:     { cls: 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/30', label: 'Visible on AI Engines ✓' },
    PARTIAL:     { cls: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30', label: 'Partially Visible' },
    NOT_VISIBLE: { cls: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30', label: 'Not Yet Visible' },
  };
  const cfg = map[key] || map.PARTIAL;
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-semibold ${cfg.cls}`}
      data-testid="visibility-status-badge"
    >
      {cfg.label}
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
  const { activeSite } = useSite();
  const [scans, setScans] = useState([]);
  const [latest, setLatest] = useState(null);
  const [latestLoading, setLatestLoading] = useState(false);
  const [queriesOpen, setQueriesOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(null);
  const scanJobRef = useRef(null);

  useEffect(() => () => {
    if (scanJobRef.current) clearInterval(scanJobRef.current);
  }, []);

  useEffect(() => {
    if (!activeSite?.id) {
      setScans([]);
      setLatest(null);
      return;
    }
    let cancelled = false;
    setLatestLoading(true);
    (async () => {
      try {
        const list = await aiVisibilityApi.scans(activeSite.id);
        if (!cancelled) setScans(Array.isArray(list) ? list : []);
      } catch {}
      try {
        const data = await aiVisibilityLatestApi.latest(activeSite.id);
        if (!cancelled) setLatest(data || null);
      } catch { if (!cancelled) setLatest(null); }
      if (!cancelled) setLatestLoading(false);
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id]);

  const handleScan = async () => {
    // Force a synchronous commit so the button label flips immediately,
    // even if the no-site branch resets state on the very next tick.
    flushSync(() => {
      setIsScanning(true);
      setScanStatus('queued');
    });
    if (!activeSite?.id) {
      toast.error('Connect a site first');
      setIsScanning(false);
      setScanStatus(null);
      return;
    }
    try {
      const res = await aiVisibilityApi.scan({ siteId: activeSite.id });
      const jobId = res?.jobId || res?.job_id || res?.id;
      // No job id → backend ran synchronously. Refresh immediately.
      if (!jobId) {
        const list = await aiVisibilityApi.scans(activeSite.id);
        setScans(Array.isArray(list) ? list : []);
        try {
          const data = await aiVisibilityLatestApi.latest(activeSite.id);
          setLatest(data || null);
        } catch {}
        toast.success('New AI visibility scan completed');
        setIsScanning(false);
        setScanStatus('completed');
        return;
      }
      // Poll every 3s
      if (scanJobRef.current) clearInterval(scanJobRef.current);
      scanJobRef.current = setInterval(async () => {
        try {
          const job = await aiVisibilityApi.scanJob(jobId);
          const status = (job?.status || '').toLowerCase();
          // Stage label — backend may send `currentStep` or `progress`.
          const STAGES = [
            'Generating brand queries...',
            'Scanning ChatGPT...',
            'Scanning Perplexity...',
            'Scanning Gemini...',
            'Scanning Claude...',
            'Analyzing results...',
          ];
          let stage = status || 'in_progress';
          if (job?.currentStep) {
            stage = job.currentStep;
          } else if (typeof job?.progress === 'number') {
            const idx = Math.min(STAGES.length - 1, Math.floor((job.progress / 100) * STAGES.length));
            stage = STAGES[idx];
          }
          setScanStatus(stage);
          if (status === 'completed' || status === 'success') {
            clearInterval(scanJobRef.current);
            scanJobRef.current = null;
            const list = await aiVisibilityApi.scans(activeSite.id);
            setScans(Array.isArray(list) ? list : []);
            try {
              const data = await aiVisibilityLatestApi.latest(activeSite.id);
              setLatest(data || null);
            } catch {}
            toast.success('New AI visibility scan completed');
            setIsScanning(false);
          } else if (status === 'failed' || status === 'error') {
            clearInterval(scanJobRef.current);
            scanJobRef.current = null;
            toast.error(job?.error || 'Scan failed');
            setIsScanning(false);
          }
        } catch {
          // keep polling
        }
      }, 3000);
    } catch (err) {
      toast.error(err?.message || 'Could not run scan');
      setIsScanning(false);
      setScanStatus('failed');
    }
  };

  const liveScore = latest?.overallScore ?? scans?.[0]?.overallScore;
  const liveRecs = Array.isArray(latest?.recommendations) ? latest.recommendations : null;
  const liveQueries = Array.isArray(latest?.queries) ? latest.queries : null;
  const liveHistory = Array.isArray(latest?.history) ? latest.history : Array.isArray(scans) && scans.length > 1
    ? scans.slice(0, 8).reverse().map((s, i) => ({ week: `Week ${i + 1}`, score: s.overallScore ?? 0 }))
    : null;

  const hasAnyData = liveScore != null;

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
          {liveScore != null && (
            <div className="px-4 py-2 bg-[#E1F5EE] rounded-lg">
              <span className="text-sm text-[#6B7280]">AI Visibility Score: </span>
              <span className="font-bold text-[#1D9E75]" data-testid="ai-visibility-score">{liveScore}/100</span>
            </div>
          )}
          <Button onClick={handleScan} disabled={isScanning || !activeSite} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="run-scan-btn">
            <RefreshCw size={16} className={`mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning AI engines...' : 'Run new scan'}
          </Button>
        </div>
      </motion.div>
      {isScanning && (
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="scan-status">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles size={18} className="text-[#1D9E75] animate-pulse" />
            <p className="text-sm font-medium text-[#0A0A0A]">Scanning AI engines...</p>
          </div>
          <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#1D9E75] animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-[#6B7280] mt-3">This usually takes 30–90 seconds.</p>
        </motion.div>
      )}

      {/* No active site */}
      {!activeSite && (
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-dashed border-[#F0F0F0] p-12 text-center" data-testid="ai-visibility-no-site">
          <Sparkles size={32} className="text-[#1D9E75] mx-auto mb-3" />
          <p className="text-lg font-medium text-[#0A0A0A] mb-1">Connect a website first</p>
          <p className="text-sm text-[#6B7280] mb-4">We'll scan ChatGPT, Perplexity, Gemini, Claude and Copilot for your brand.</p>
          <Link to="/dashboard/connections">
            <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Connect website</Button>
          </Link>
        </motion.div>
      )}

      {/* Empty state */}
      {activeSite && !latestLoading && !hasAnyData && (
        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-dashed border-[#F0F0F0] p-12 text-center" data-testid="ai-visibility-empty">
          <Sparkles size={32} className="text-[#1D9E75] mx-auto mb-3" />
          <p className="text-lg font-medium text-[#0A0A0A] mb-1">No visibility data yet</p>
          <p className="text-sm text-[#6B7280] mb-4">Run your first AI scan to see how ChatGPT, Perplexity, Gemini, Claude and Copilot mention your brand.</p>
          <Button onClick={handleScan} disabled={isScanning} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="ai-visibility-first-scan-btn">
            Run your first AI scan
          </Button>
        </motion.div>
      )}

      {/* Tabs — only show when we have data */}
      {activeSite && hasAnyData && (
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#F0F0F0]">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations" data-testid="tab-recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Visibility status + score circle */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-36 h-36 rounded-full border-8 border-[#1D9E75] flex items-center justify-center bg-[#E1F5EE]/30 flex-shrink-0">
                <div className="text-center">
                  <span className="font-syne text-5xl font-bold text-[#0A0A0A]">{liveScore}</span>
                  <span className="text-lg text-[#6B7280]">/100</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <VisibilityStatusBadge status={latest?.visibilityStatus || latest?.status} score={liveScore} />
                {(latest?.visibilityMessage || latest?.message) && (
                  <p className="text-sm text-[#0A0A0A] mt-3" data-testid="visibility-message">
                    {latest?.visibilityMessage || latest?.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Score Over Time */}
          {liveHistory && liveHistory.length > 0 && (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
              <h3 className="font-semibold text-[#0A0A0A] mb-4">Visibility Score Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={liveHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#1D9E75" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#1D9E75' }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Queries tested — collapsible, only shown when backend supplied them */}
          {liveQueries && liveQueries.length > 0 && (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="queries-section">
              <Collapsible open={queriesOpen} onOpenChange={setQueriesOpen}>
                <CollapsibleTrigger asChild>
                  <button type="button" className="w-full flex items-center justify-between" data-testid="queries-toggle">
                    <div className="flex items-center gap-2 text-left">
                      <MessageSquareText size={16} className="text-[#1D9E75]" />
                      <div>
                        <h3 className="font-semibold text-[#0A0A0A]">Queries tested</h3>
                        <p className="text-xs text-[#6B7280]">{liveQueries.length} questions tested across AI models</p>
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-[#6B7280] transition-transform ${queriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <ol className="list-decimal pl-6 space-y-1.5 text-sm text-[#0A0A0A]">
                    {liveQueries.map((q, i) => (<li key={i}>{q}</li>))}
                  </ol>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="recommendations-card">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Improvement Recommendations</h3>
            {!liveRecs || liveRecs.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#6B7280]" data-testid="recommendations-empty">
                Run a scan to get personalized recommendations.
              </div>
            ) : (
              <div className="space-y-4">
                {liveRecs.map((rec, i) => {
                  const action = rec.action || rec.text || '';
                  const isWriteArticle = /write\s+an?\s+article/i.test(action);
                  return (
                    <div
                      key={i}
                      className="flex flex-wrap items-start justify-between gap-3 p-4 bg-[#F9FAFB] rounded-lg"
                      data-testid={`recommendation-${i}`}
                    >
                      <div className="flex-1 min-w-[240px] space-y-2">
                        <p className="text-sm text-[#0A0A0A]">{action}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <DifficultyBadge difficulty={rec.difficulty} />
                          <ImpactBadge impact={rec.expectedImpact || rec.impact} />
                          {rec.category && (
                            <span className="px-2 py-0.5 rounded text-xs text-[#71717A] bg-white border border-[#F0F0F0]">
                              {rec.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {isWriteArticle ? (
                        <Link to="/dashboard/auto-publish">
                          <Button size="sm" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid={`recommendation-write-${i}`}>
                            Write now <ArrowRight size={14} className="ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-[#1D9E75]">
                          Start <ArrowRight size={14} className="ml-1" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
      )}
    </motion.div>
  );
};
