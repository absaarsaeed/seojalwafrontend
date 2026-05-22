import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useSite } from '../../context/SiteContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Urdu', 'Hindi', 'Portuguese', 'Italian', 'Dutch'];
const COUNTRIES = ['Worldwide', 'United States', 'United Kingdom', 'Pakistan', 'UAE', 'Canada', 'Australia', 'India'];

const Section = ({ title, subtitle, children, testid }) => (
  <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid={testid}>
    <h3 className="font-syne text-lg font-bold text-[#0A0A0A] mb-1">{title}</h3>
    {subtitle && <p className="text-sm text-[#6B7280] mb-4">{subtitle}</p>}
    <div className="mt-4">{children}</div>
  </motion.div>
);

const ToggleRow = ({ label, subtext, value, onChange, testid }) => (
  <div className="flex items-start justify-between py-3 border-b border-[#F0F0F0] last:border-b-0">
    <div className="flex-1 pr-4">
      <p className="font-medium text-[#0A0A0A]">{label}</p>
      <p className="text-xs text-[#6B7280] mt-1">{subtext}</p>
    </div>
    <Switch checked={value} onCheckedChange={onChange} data-testid={testid} />
  </div>
);

const RadioOption = ({ value, current, onChange, label, subtext, name, testid }) => (
  <label
    htmlFor={`${name}-${value}`}
    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
      current === value ? 'border-[#1D9E75] bg-[#E1F5EE]/30' : 'border-[#F0F0F0] hover:bg-[#F9FAFB]'
    }`}
    data-testid={testid}
  >
    <input
      type="radio"
      id={`${name}-${value}`}
      name={name}
      value={value}
      checked={current === value}
      onChange={() => onChange(value)}
      className="mt-1 accent-[#1D9E75]"
    />
    <div>
      <p className="font-medium text-[#0A0A0A]">{label}</p>
      <p className="text-xs text-[#6B7280] mt-0.5">{subtext}</p>
    </div>
  </label>
);

export const ArticleSettingsPage = () => {
  const { activeSite } = useSite();
  const [toggles, setToggles] = useState({
    autoPublish: true,
    delay24: false,
    heroImages: true,
    youtubeVideos: false,
    infographics: true,
    keyTakeaways: true,
    tableOfContents: true,
    externalLinks: true,
  });
  const [length, setLength] = useState('2000');
  const [frequency, setFrequency] = useState('5');
  const [language, setLanguage] = useState('English');
  const [instructions, setInstructions] = useState('');
  const [website, setWebsite] = useState({
    url: activeSite?.domain || 'myblog.com',
    title: activeSite?.name || 'My Blog',
    description: '',
    language: 'English',
    country: 'Worldwide',
  });
  const [locationMode, setLocationMode] = useState('worldwide');
  const [locationCity, setLocationCity] = useState('');
  const [whatSell, setWhatSell] = useState('SEO consulting services, content marketing packages');
  const [whatNotSell, setWhatNotSell] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');

  const toggle = (key) => setToggles((t) => ({ ...t, [key]: !t[key] }));

  const handleSaveAll = () => toast.success('All article settings saved');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-6"
      data-testid="article-settings-page"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Article Settings</h1>
        <p className="text-sm text-[#6B7280]">Configure your article generation, content, and publishing options.</p>
      </motion.div>

      {/* Section 1 — Publishing Preferences */}
      <Section title="Publishing Preferences" testid="section-publishing">
        <ToggleRow label="Auto-Publish Articles" subtext="Automatically publish AI-generated articles without manual review" value={toggles.autoPublish} onChange={() => toggle('autoPublish')} testid="toggle-auto-publish" />
        <ToggleRow label="Delay Publishing by 24 hours" subtext="Hold articles for 24 hours before publishing so you can review" value={toggles.delay24} onChange={() => toggle('delay24')} testid="toggle-delay-24" />
        <ToggleRow label="Include Hero Images" subtext="AI-generated image displayed at the top of each article" value={toggles.heroImages} onChange={() => toggle('heroImages')} testid="toggle-hero-images" />
        <ToggleRow label="Include YouTube Videos" subtext="Automatically find and embed relevant YouTube videos in articles" value={toggles.youtubeVideos} onChange={() => toggle('youtubeVideos')} testid="toggle-youtube" />
        <ToggleRow label="Include Infographics" subtext="Create visual infographics for complex topics" value={toggles.infographics} onChange={() => toggle('infographics')} testid="toggle-infographics" />
        <ToggleRow label="Include Key Takeaways" subtext="Add a summary box with key points at the end" value={toggles.keyTakeaways} onChange={() => toggle('keyTakeaways')} testid="toggle-takeaways" />
        <ToggleRow label="Include Table of Contents" subtext="Add navigation links at the top of long articles" value={toggles.tableOfContents} onChange={() => toggle('tableOfContents')} testid="toggle-toc" />
        <ToggleRow label="Add External Links to Articles" subtext="Reference and link to authoritative external sources to increase credibility" value={toggles.externalLinks} onChange={() => toggle('externalLinks')} testid="toggle-external-links" />
      </Section>

      {/* Section 2 — Article Length */}
      <Section title="Article Length">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <RadioOption name="len" value="1000" current={length} onChange={setLength} label="~1,000 words" subtext="Quick articles with fast publish cadence (not recommended)" testid="len-1000" />
          <RadioOption name="len" value="2000" current={length} onChange={setLength} label="~2,000 words" subtext="Best balance — fast and thorough" testid="len-2000" />
          <RadioOption name="len" value="3000" current={length} onChange={setLength} label="~3,000 words" subtext="Comprehensive guides, ranks well for competitive terms" testid="len-3000" />
          <RadioOption name="len" value="5000" current={length} onChange={setLength} label="~5,000 words" subtext="In-depth content, best for authority topics" testid="len-5000" />
        </div>
      </Section>

      {/* Section 3 — Publishing Frequency */}
      <Section title="Publishing Frequency">
        <div className="space-y-3">
          <RadioOption name="freq" value="7" current={frequency} onChange={setFrequency} label="7 articles per week (Daily)" subtext="Monday–Sunday, one per day" testid="freq-7" />
          <RadioOption name="freq" value="5" current={frequency} onChange={setFrequency} label="5 articles per week" subtext="Weekdays Mon–Fri" testid="freq-5" />
          <RadioOption name="freq" value="3" current={frequency} onChange={setFrequency} label="3 articles per week" subtext="Monday, Wednesday, Friday" testid="freq-3" />
          <RadioOption name="freq" value="2" current={frequency} onChange={setFrequency} label="2 articles per week" subtext="Monday and Thursday" testid="freq-2" />
          <RadioOption name="freq" value="1" current={frequency} onChange={setFrequency} label="1 article per week" subtext="Once a week, Monday" testid="freq-1" />
        </div>
      </Section>

      {/* Section 4 — Writing Language */}
      <Section title="Writing Language">
        <Label className="mb-2 block">Articles will be written in:</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="border-[#F0F0F0] max-w-sm" data-testid="writing-language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-xs text-[#6B7280] mt-3">Your articles will also be automatically translated and published in your chosen language.</p>
      </Section>

      {/* Section 5 — Global Writing Instructions */}
      <Section title="Global Writing Instructions" subtitle="Custom instructions that will be applied to every generated article.">
        <Textarea
          rows={6}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="E.g. Always use a conversational tone, include real examples, avoid technical jargon, always mention our product name..."
          className="border-[#F0F0F0]"
          data-testid="global-instructions"
        />
      </Section>

      {/* Section 6 — Website Information */}
      <Section title="Website Information">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="w-url" className="mb-2 block">Website URL</Label>
              <Input id="w-url" value={website.url} onChange={(e) => setWebsite({ ...website, url: e.target.value })} className="border-[#F0F0F0]" />
            </div>
            <div>
              <Label htmlFor="w-title" className="mb-2 block">Website Title</Label>
              <Input id="w-title" value={website.title} onChange={(e) => setWebsite({ ...website, title: e.target.value })} className="border-[#F0F0F0]" />
            </div>
          </div>
          <div>
            <Label htmlFor="w-desc" className="mb-2 block">Website Description</Label>
            <Textarea
              id="w-desc"
              rows={3}
              value={website.description}
              onChange={(e) => setWebsite({ ...website, description: e.target.value })}
              placeholder="Describe your website, its purpose, and target audience..."
              className="border-[#F0F0F0]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Language</Label>
              <Select value={website.language} onValueChange={(v) => setWebsite({ ...website, language: v })}>
                <SelectTrigger className="border-[#F0F0F0]"><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Country</Label>
              <Select value={website.country} onValueChange={(v) => setWebsite({ ...website, country: v })}>
                <SelectTrigger className="border-[#F0F0F0]"><SelectValue /></SelectTrigger>
                <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => toast.success('Website information saved')} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Save Website Information</Button>
        </div>
      </Section>

      {/* Section 7 — Location Targeting */}
      <Section title="Location Targeting">
        <div className="space-y-3">
          <RadioOption name="loc" value="worldwide" current={locationMode} onChange={setLocationMode} label="Entire country / Worldwide audience" subtext="Target a global or country-wide audience" testid="loc-worldwide" />
          <RadioOption name="loc" value="city" current={locationMode} onChange={setLocationMode} label="Specific city or area" subtext="Focus articles on a local audience" testid="loc-city" />
          {locationMode === 'city' && (
            <Input
              placeholder="Enter your target city or region"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              className="border-[#F0F0F0] max-w-sm"
              data-testid="loc-city-input"
            />
          )}
        </div>
        <Button onClick={() => toast.success('Location targeting saved')} className="mt-4 bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Save Location Targeting</Button>
      </Section>

      {/* Section 8 — Business Offerings */}
      <Section title="Business Offerings">
        <div className="space-y-6">
          <div>
            <Label className="block font-medium text-[#0A0A0A]">What You Sell</Label>
            <p className="text-xs text-[#6B7280] mb-2">Tell us what products or services to promote in your articles</p>
            <Textarea
              rows={3}
              value={whatSell}
              onChange={(e) => setWhatSell(e.target.value)}
              className="border-[#F0F0F0]"
              data-testid="what-sell"
            />
            <button className="text-sm text-[#1D9E75] hover:underline mt-2">+ Add item</button>
          </div>
          <div>
            <Label className="block font-medium text-[#0A0A0A]">What You Don't Sell</Label>
            <p className="text-xs text-[#6B7280] mb-2">Topics or products we should never recommend or mention</p>
            <Textarea
              rows={3}
              value={whatNotSell}
              onChange={(e) => setWhatNotSell(e.target.value)}
              placeholder="E.g. competitor products, gambling, alcohol..."
              className="border-[#F0F0F0]"
              data-testid="what-not-sell"
            />
            <button className="text-sm text-[#1D9E75] hover:underline mt-2">+ Add item</button>
          </div>
          <Button onClick={() => toast.success('Offerings saved')} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Save Offerings</Button>
        </div>
      </Section>

      {/* Section 10 — Image Preferences */}
      <Section title="Image Preferences" subtitle="Describe the style of images you want generated for your articles">
        <Label className="block font-medium text-[#0A0A0A] mb-2">Featured Image Prompt</Label>
        <Textarea
          rows={3}
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="E.g. professional photography style, bright and colorful, minimalist with white backgrounds..."
          className="border-[#F0F0F0]"
          data-testid="image-prompt"
        />
        <Button onClick={() => toast.success('Image preferences saved')} className="mt-4 bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Save Image Preferences</Button>
      </Section>

      {/* Save all */}
      <motion.div variants={fadeInUp} className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSaveAll} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-8 h-11 shadow-lg" data-testid="save-all-settings">
          Save All Settings
        </Button>
      </motion.div>
    </motion.div>
  );
};
