import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { POST_DATA } from '../../data/publicData';
import { useSite } from '../../context/SiteContext';
import { socialApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import { Check, X, Instagram, Linkedin, Facebook, Twitter, Youtube, Image, Sparkles, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const platformIcons = {
  Instagram: Instagram,
  Facebook: Facebook,
  LinkedIn: Linkedin,
  'X / Twitter': Twitter,
  Pinterest: () => <span className="text-[#E60023] font-bold">P</span>,
  YouTube: Youtube
};

const platformColors = {
  Instagram: '#E4405F',
  Facebook: '#1877F2',
  LinkedIn: '#0A66C2',
  'X / Twitter': '#1DA1F2'
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

export const PostPage = () => {
  const data = POST_DATA;
  const { activeSite } = useSite();
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Instagram', 'LinkedIn']);
  const [caption, setCaption] = useState('');
  const [liveAccounts, setLiveAccounts] = useState(null);
  const [livePosts, setLivePosts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const accts = await socialApi.accounts();
        if (!cancelled) setLiveAccounts(Array.isArray(accts) ? accts : []);
      } catch {}
      try {
        const posts = await socialApi.posts({ limit: 20 });
        if (!cancelled) setLivePosts(Array.isArray(posts) ? posts : []);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id]);

  const accountsForUI = liveAccounts && liveAccounts.length ? liveAccounts : data.socialAccounts;
  const scheduledForUI = livePosts && livePosts.length
    ? livePosts.map((p) => ({
        id: p.id,
        platform: p.platform || p.network,
        caption: p.caption || p.text || '',
        date: p.scheduledFor ? new Date(p.scheduledFor).toLocaleDateString() : p.date,
        time: p.scheduledFor ? new Date(p.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : p.time,
        status: p.status || 'scheduled',
      }))
    : data.scheduledPosts;

  const connectedPlatforms = accountsForUI.filter((a) => a.connected);

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerateCaption = () => {
    setCaption('Exciting news! We\'re thrilled to share our latest insights on content marketing trends for 2026. From AI-powered optimization to authentic brand storytelling, discover what\'s working for top brands right now. Link in bio! #ContentMarketing #DigitalStrategy #MarketingTips');
    toast.success('Caption generated!');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="post-page"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Social Autopilot</h1>
        <p className="text-sm text-[#6B7280]">Schedule and automate your social media presence</p>
      </motion.div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="bg-[#F0F0F0]">
          <TabsTrigger value="accounts">Social Accounts</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="create">Create Post</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountsForUI.map((account) => {
              const Icon = platformIcons[account.platform];
              return (
                <div key={account.platform} className="coming-soon-card bg-white rounded-xl border border-[#F0F0F0] p-5" data-testid={`social-card-${account.platform.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F0F0F0] flex items-center justify-center">
                        <Icon size={20} style={{ color: platformColors[account.platform] }} />
                      </div>
                      <span className="font-medium text-[#0A0A0A]">{account.platform}</span>
                    </div>
                    <span className="px-3 py-1 bg-[#F0F0F0] text-[#9CA3AF] text-xs font-medium rounded-md">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">Available in v2</p>
                </div>
              );
            })}
          </motion.div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Scheduled Posts</h3>
            <div className="space-y-3">
              {scheduledForUI.map((post) => {
                const Icon = platformIcons[post.platform];
                return (
                  <div key={post.id} className="flex items-start gap-4 p-4 bg-[#F9FAFB] rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                      <Icon size={16} style={{ color: platformColors[post.platform] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0A0A0A] line-clamp-2">{post.caption}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{post.date} at {post.time}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      post.status === 'scheduled' ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Approval Queue */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Approval Queue</h3>
            <div className="space-y-3">
              {data.approvalQueue.map((post) => {
                const Icon = platformIcons[post.platform];
                return (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon size={16} style={{ color: platformColors[post.platform] }} />
                      <div>
                        <p className="text-sm text-[#0A0A0A] line-clamp-1">{post.caption}</p>
                        <p className="text-xs text-[#6B7280]">{post.scheduledFor}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white h-8">Approve</Button>
                      <Button size="sm" variant="outline" className="h-8">Edit</Button>
                      <Button size="sm" variant="outline" className="h-8 text-[#EF4444] border-[#EF4444]">Reject</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            {/* Platform Selector */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#0A0A0A] mb-3">Select platforms</p>
              <div className="flex flex-wrap gap-3">
                {connectedPlatforms.map((account) => {
                  const Icon = platformIcons[account.platform];
                  const isSelected = selectedPlatforms.includes(account.platform);
                  return (
                    <button
                      key={account.platform}
                      onClick={() => togglePlatform(account.platform)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-[#1D9E75] bg-[#E1F5EE]'
                          : 'border-[#F0F0F0] bg-white hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <Icon size={18} style={{ color: platformColors[account.platform] }} />
                      <span className="text-sm text-[#0A0A0A]">{account.platform}</span>
                      {isSelected && <Check size={14} className="text-[#1D9E75]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#0A0A0A]">Caption</p>
                <span className="text-xs text-[#6B7280]">{caption.length}/2200</span>
              </div>
              <Textarea
                placeholder="Write your caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[150px] border-[#F0F0F0]"
              />
              <Button onClick={handleGenerateCaption} variant="outline" className="mt-2 border-[#1D9E75] text-[#1D9E75]">
                <Sparkles size={16} className="mr-2" />
                Generate caption in my brand voice
              </Button>
            </div>

            {/* Image */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#0A0A0A] mb-2">Image</p>
              <div className="flex gap-3">
                <Button variant="outline" className="border-[#F0F0F0]">
                  <Image size={16} className="mr-2" />
                  Upload image
                </Button>
                <Button variant="outline" className="border-[#1D9E75] text-[#1D9E75]">
                  <Sparkles size={16} className="mr-2" />
                  Generate AI image
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                Add to queue
              </Button>
              <Button variant="outline" className="border-[#F0F0F0]">
                <Calendar size={16} className="mr-2" />
                Schedule for later
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Metrics */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Reach', value: data.analytics.totalReach.toLocaleString() },
              { label: 'Avg Engagement', value: `${data.analytics.avgEngagement}%` },
              { label: 'Link Clicks', value: data.analytics.linkClicks.toLocaleString() },
              { label: 'Best Platform', value: data.analytics.bestPlatform }
            ].map((metric) => (
              <div key={metric.label} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-[#0A0A0A]">{metric.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Chart */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Engagement by Platform</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.analytics.byPlatform}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="engagement" fill="#1D9E75" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Posts Table */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
            <div className="p-4 border-b border-[#F0F0F0]">
              <h3 className="font-semibold text-[#0A0A0A]">Recent Posts Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB]">
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Platform</th>
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Caption</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Reach</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Likes</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.analytics.recentPosts.map((post, i) => {
                    const Icon = platformIcons[post.platform];
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                        <td className="p-4">
                          <Icon size={16} style={{ color: platformColors[post.platform] }} />
                        </td>
                        <td className="p-4 text-sm text-[#0A0A0A] max-w-xs truncate">{post.caption}</td>
                        <td className="p-4 text-sm text-[#0A0A0A] text-right">{post.reach.toLocaleString()}</td>
                        <td className="p-4 text-sm text-[#0A0A0A] text-right">{post.likes}</td>
                        <td className="p-4 text-sm text-[#0A0A0A] text-right">{post.clicks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
