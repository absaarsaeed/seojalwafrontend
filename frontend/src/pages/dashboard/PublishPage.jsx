import { useState } from 'react';
import { motion } from 'framer-motion';
import { PUBLISH_DATA } from '../../data/publicData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Progress } from '../../components/ui/progress';
import { Check, X, ExternalLink, Calendar, Globe } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const StatusBadge = ({ status }) => {
  const colors = {
    Scheduled: 'bg-[#1D9E75]/10 text-[#1D9E75]',
    Draft: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    Published: 'bg-[#2563EB]/10 text-[#2563EB]'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

export const PublishPage = () => {
  const data = PUBLISH_DATA;
  const [autoSchedule, setAutoSchedule] = useState(true);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="publish-page"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Jalwa Publish</h1>
        <p className="text-sm text-[#6B7280]">Manage your content calendar and CMS connections</p>
      </motion.div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-[#F0F0F0]">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="editor">Article Editor</TabsTrigger>
          <TabsTrigger value="cms">CMS Connections</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[#0A0A0A]">Content Calendar</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6B7280]">Auto-schedule</span>
                <Switch checked={autoSchedule} onCheckedChange={setAutoSchedule} />
              </div>
            </div>
            
            <div className="space-y-3">
              {data.scheduledArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar size={18} className="text-[#6B7280]" />
                    <div>
                      <p className="font-medium text-[#0A0A0A]">{article.title}</p>
                      <p className="text-xs text-[#6B7280]">Keyword: {article.keyword} • {article.cms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#6B7280]">{article.date}</span>
                    <StatusBadge status={article.status} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Editor */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-[#F0F0F0] p-6">
              <Input placeholder="Article title..." className="text-xl font-semibold border-0 p-0 mb-4 focus-visible:ring-0" />
              <Textarea placeholder="Start writing your article..." className="min-h-[400px] border-[#F0F0F0]" />
            </div>
            
            {/* SEO Panel */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#F0F0F0] p-6">
              <h3 className="font-semibold text-[#0A0A0A] mb-4">SEO Score</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-[#1D9E75] flex items-center justify-center">
                  <span className="font-bold text-lg text-[#0A0A0A]">78</span>
                </div>
                <p className="text-sm text-[#6B7280]">Good! A few improvements recommended.</p>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: 'Keyword usage', status: 'good' },
                  { label: 'Readability', status: 'good' },
                  { label: 'Meta description', status: 'missing' },
                  { label: 'Title tag', status: 'good' },
                  { label: 'Internal links', status: 'warning' },
                  { label: 'Word count', status: 'good' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7280]">{item.label}</span>
                    {item.status === 'good' ? (
                      <Check size={16} className="text-[#1D9E75]" />
                    ) : item.status === 'missing' ? (
                      <X size={16} className="text-[#EF4444]" />
                    ) : (
                      <span className="text-[#F59E0B]">⚠</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-3">
                <Input placeholder="Meta title..." className="border-[#F0F0F0]" />
                <Textarea placeholder="Meta description..." className="border-[#F0F0F0]" rows={3} />
              </div>
              
              <Button className="w-full mt-4 bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                Publish now
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="cms" className="space-y-6">
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.cmsConnections.map((cms) => (
              <div key={cms.name} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-[#6B7280]" />
                    <span className="font-medium text-[#0A0A0A]">{cms.name}</span>
                  </div>
                  {cms.connected ? (
                    <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full flex items-center gap-1">
                      <Check size={12} /> Connected
                    </span>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs h-7">Connect</Button>
                  )}
                </div>
                {cms.connected && (
                  <div className="text-xs text-[#6B7280]">
                    <p>{cms.site}</p>
                    <p>Last published: {cms.lastPublished}</p>
                    <p>{cms.articleCount} articles</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Title</th>
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Date</th>
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">CMS</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Traffic</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">CTR</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Avg Position</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {data.publishedArticles.map((article, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                      <td className="p-4 text-sm text-[#0A0A0A]">{article.title}</td>
                      <td className="p-4 text-sm text-[#6B7280]">{article.date}</td>
                      <td className="p-4 text-sm text-[#6B7280]">{article.cms}</td>
                      <td className="p-4 text-sm text-[#0A0A0A] text-right">{article.traffic.toLocaleString()}</td>
                      <td className="p-4 text-sm text-[#0A0A0A] text-right">{article.ctr}%</td>
                      <td className="p-4 text-sm text-[#0A0A0A] text-right">{article.position}</td>
                      <td className="p-4 text-sm text-[#1D9E75] font-medium text-right">{article.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
