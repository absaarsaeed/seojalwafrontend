import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WRITE_DATA } from '../../data/publicData';
import { useSite } from '../../context/SiteContext';
import { articlesApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Slider } from '../../components/ui/slider';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import { Check, RefreshCw, Copy, Send, FileText, Sparkles } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const contentTypes = ['Blog Article', 'Email', 'Ad Copy', 'Social Caption', 'Product Description'];

const generatedContent = `# 5 SEO Mistakes Killing Your Rankings in 2026

Search engine optimization has evolved dramatically, but many businesses are still making critical mistakes that tank their rankings. Here's what you need to know.

## 1. Ignoring AI Visibility

In 2026, it's not just about Google anymore. ChatGPT, Perplexity, and other AI assistants are becoming primary sources of information. If your brand isn't optimized for AI visibility, you're missing out on a massive traffic source.

## 2. Keyword Stuffing (Yes, It's Still Happening)

Despite years of algorithm updates, some businesses still try to game the system by cramming keywords everywhere. Modern search engines are smarter than that. Focus on natural, helpful content instead.

## 3. Neglecting Mobile Experience

With over 60% of searches happening on mobile devices, a poor mobile experience is a ranking death sentence. Test your site on multiple devices and optimize accordingly.`;

export const WritePage = () => {
  const data = WRITE_DATA;
  const { activeSite } = useSite();
  const [selectedType, setSelectedType] = useState('Blog Article');
  const [brief, setBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState('');
  const [tones, setTones] = useState(data.toneSettings);
  const [library, setLibrary] = useState(data.library);

  useEffect(() => {
    if (!activeSite?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await articlesApi.list({ siteId: activeSite.id, limit: 20 });
        if (cancelled) return;
        const arr = Array.isArray(list) ? list : list?.items || [];
        if (arr.length) {
          setLibrary(arr.map((a) => ({
            id: a.id,
            type: a.type || 'Blog Article',
            date: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '',
            title: a.title,
            wordCount: a.wordCount || a.content?.split(/\s+/).length || 0,
          })));
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [activeSite?.id]);

  const handleGenerate = async () => {
    if (!brief) {
      toast.error('Please enter a topic or brief');
      return;
    }
    if (!activeSite?.id) {
      toast.error('Connect a site first to generate articles');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await articlesApi.generate({
        siteId: activeSite.id,
        searchTerm: brief,
        type: selectedType,
      });
      const content = res?.content || res?.body || res?.article?.content || '';
      setGenerated(content || `# ${brief}\n\nGenerated article — full content will appear once the AI Writer completes.`);
      toast.success('Content generated!');
    } catch (err) {
      toast.error(err?.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    toast.success('Copied to clipboard');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="write-page"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">AI Writer</h1>
        <p className="text-sm text-[#6B7280]">Create content in your unique brand voice</p>
      </motion.div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-[#F0F0F0]">
          <TabsTrigger value="voice">Voice Setup</TabsTrigger>
          <TabsTrigger value="create">Create Content</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-[#0A0A0A]">Brand Voice Model</h3>
                <p className="text-sm text-[#6B7280]">Your AI-trained voice profile</p>
              </div>
              <span className="px-3 py-1 bg-[#E1F5EE] text-[#1D9E75] text-sm font-medium rounded-full flex items-center gap-1">
                <Check size={14} /> Trained
              </span>
            </div>
            
            <div className="p-4 bg-[#F9FAFB] rounded-lg mb-6">
              <p className="text-sm text-[#6B7280] mb-1">Your brand voice:</p>
              <p className="text-[#0A0A0A]">{data.voiceDescription}</p>
            </div>

            <div className="space-y-6 mb-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#6B7280]">Formal</span>
                  <span className="text-[#6B7280]">Casual</span>
                </div>
                <Slider value={[tones.formalCasual]} onValueChange={(v) => setTones(prev => ({ ...prev, formalCasual: v[0] }))} max={100} className="[&_[role=slider]]:bg-[#1D9E75]" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#6B7280]">Serious</span>
                  <span className="text-[#6B7280]">Playful</span>
                </div>
                <Slider value={[tones.seriousPlayful]} onValueChange={(v) => setTones(prev => ({ ...prev, seriousPlayful: v[0] }))} max={100} className="[&_[role=slider]]:bg-[#1D9E75]" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#6B7280]">Simple</span>
                  <span className="text-[#6B7280]">Technical</span>
                </div>
                <Slider value={[tones.simpleTechnical]} onValueChange={(v) => setTones(prev => ({ ...prev, simpleTechnical: v[0] }))} max={100} className="[&_[role=slider]]:bg-[#1D9E75]" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Voice consistency score</p>
                <p className="text-2xl font-bold text-[#1D9E75]">{data.voiceScore}/100</p>
              </div>
              <Button variant="outline" className="border-[#1D9E75] text-[#1D9E75]">
                <RefreshCw size={16} className="mr-2" />
                Retrain voice model
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            {/* Content Type Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {contentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-[#1D9E75] text-white'
                      : 'bg-[#F0F0F0] text-[#6B7280] hover:bg-[#E0E0E0]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Brief Input */}
            <Textarea
              placeholder="Enter your topic or brief... (e.g., 'Write about SEO mistakes businesses make in 2026')"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="min-h-[120px] border-[#F0F0F0] mb-4"
            />

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Generate in my brand voice
                </>
              )}
            </Button>
          </motion.div>

          {/* Generated Content */}
          {generated && (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#0A0A0A]">Generated Content</h3>
                <span className="px-3 py-1 bg-[#E1F5EE] text-[#1D9E75] text-sm font-medium rounded-full">
                  Brand voice match: 91%
                </span>
              </div>
              
              <div className="prose prose-sm max-w-none mb-6 p-4 bg-[#F9FAFB] rounded-lg">
                <div className="whitespace-pre-wrap text-[#0A0A0A]">{generated}</div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" className="border-[#F0F0F0]">
                  <Copy size={16} className="mr-2" />
                  Copy
                </Button>
                <Button variant="outline" className="border-[#F0F0F0]">
                  <Send size={16} className="mr-2" />
                  Send to Publish
                </Button>
                <Button variant="outline" className="border-[#F0F0F0]">
                  <RefreshCw size={16} className="mr-2" />
                  Regenerate
                </Button>
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {library.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-[#F0F0F0] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-[#F0F0F0] text-[#6B7280] text-xs font-medium rounded">
                    {item.type}
                  </span>
                  <span className="text-xs text-[#6B7280]">{item.date}</span>
                </div>
                <h4 className="font-medium text-[#0A0A0A] mb-2 line-clamp-2">{item.title}</h4>
                <p className="text-xs text-[#6B7280]">{item.wordCount} words</p>
              </div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
