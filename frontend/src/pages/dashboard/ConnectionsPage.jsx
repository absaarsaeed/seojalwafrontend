import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { PlatformLogo } from '../../components/public/PlatformLogo';
import { POST_DATA } from '../../data/publicData';
import { Check, Copy, X as XIcon, Download } from 'lucide-react';
import { toast } from 'sonner';
import { WordPressConnectModal } from '../../components/dashboard/WordPressConnectModal';
import { useSite } from '../../context/SiteContext';
import { pluginApi } from '../../lib/api';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const WEBSITE_PLATFORMS = [
  { name: 'WordPress',   method: 'Plugin',  description: 'Install our free plugin, paste your API key', connected: false, comingSoon: false },
  { name: 'Shopify',     method: 'App',     description: 'Install from Shopify App Store',              connected: false, comingSoon: true  },
  { name: 'Webflow',     method: 'OAuth',   description: 'mybrand.webflow.io',                          connected: false, comingSoon: true  },
  { name: 'Ghost',       method: 'OAuth',   description: 'Connect via Admin API Key',                   connected: false, comingSoon: true  },
  { name: 'HubSpot',     method: 'OAuth',   description: 'One-click HubSpot CMS integration',           connected: false, comingSoon: true  },
  { name: 'Wix',         method: 'API Key', description: 'Generate an API key in Wix Dashboard',        connected: false, comingSoon: true  },
  { name: 'Squarespace', method: 'OAuth',   description: 'Connect your Squarespace blog',               connected: false, comingSoon: true  },
  { name: 'Notion',      method: 'OAuth',   description: 'Export drafts to your Notion workspace',      connected: false, comingSoon: true  },
  { name: 'Next.js',     method: 'Webhook', description: 'Custom webhook integration',                  connected: false, comingSoon: true  },
];

const SOCIAL_BRAND_COLORS = {
  Instagram:     '#E1306C',
  Facebook:      '#1877F2',
  LinkedIn:      '#0A66C2',
  'X / Twitter': '#000000',
  Pinterest:     '#E60023',
  YouTube:       '#FF0000',
};

const CopyableInput = ({ value, label }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };
  return (
    <div className="flex gap-2">
      <Input value={value} readOnly className="flex-1 border-[#F0F0F0] font-mono text-sm bg-[#F9FAFB]" />
      <Button variant="outline" size="sm" onClick={handleCopy} className="border-[#F0F0F0]">
        <Copy size={14} />
      </Button>
    </div>
  );
};

const StepList = ({ steps }) => (
  <ol className="space-y-3 mt-2">
    {steps.map((step, i) => (
      <li key={i} className="flex gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1D9E75] text-white text-xs font-semibold flex items-center justify-center">
          {i + 1}
        </span>
        <span className="text-sm text-[#0A0A0A] pt-0.5">{step}</span>
      </li>
    ))}
  </ol>
);

const WebsiteModal = ({ platform, open, onClose, onConnect }) => {
  const [apiKey, setApiKey] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteId, setSiteId] = useState('');

  if (!platform) return null;

  const handleConnect = () => {
    toast.success(`${platform.name} connected (dummy mode)`);
    onConnect(platform.name);
    onClose();
  };

  const content = () => {
    switch (platform.name) {
      case 'WordPress':
        return (
          <>
            <StepList steps={[
              'Download SEO Jalwa WordPress plugin from WordPress.org',
              'Install and activate in your WordPress dashboard',
              'Go to Settings > SEO Jalwa and paste this API key:',
            ]} />
            <div className="mt-4">
              <Label className="text-xs text-[#6B7280] mb-2 block">Your API Key</Label>
              <CopyableInput value="jalwa_live_abc123xyz" label="API key" />
            </div>
            <p className="text-sm text-[#6B7280] mt-4">
              Step 4: Click "Test Connection" in the WordPress plugin.
            </p>
          </>
        );
      case 'Shopify':
        return (
          <StepList steps={[
            'Visit Shopify App Store',
            'Search "SEO Jalwa"',
            'Click Install and approve permissions',
            'You\'ll be redirected back automatically',
          ]} />
        );
      case 'Ghost':
        return (
          <>
            <StepList steps={[
              'Go to your Ghost admin',
              'Settings > Integrations > Add Custom Integration, name it "SEO Jalwa"',
              'Copy the Admin API Key',
              'Paste the key and your Ghost URL below:',
            ]} />
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="ghost-key" className="text-xs text-[#6B7280] mb-2 block">Admin API Key</Label>
                <Input id="ghost-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="abc123:xyz789..." className="border-[#F0F0F0]" />
              </div>
              <div>
                <Label htmlFor="ghost-url" className="text-xs text-[#6B7280] mb-2 block">Your Ghost URL</Label>
                <Input id="ghost-url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://yourblog.ghost.io" className="border-[#F0F0F0]" />
              </div>
            </div>
          </>
        );
      case 'HubSpot':
        return (
          <div className="text-center py-4">
            <p className="text-sm text-[#6B7280] mb-6">
              You'll be redirected to HubSpot to authorize SEO Jalwa. We'll never publish without your approval.
            </p>
          </div>
        );
      case 'Wix':
        return (
          <>
            <StepList steps={[
              'Go to Wix Dashboard > Settings > API Keys',
              'Generate new key with Blog permissions',
              'Paste your key and Wix Site ID below:',
            ]} />
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="wix-key" className="text-xs text-[#6B7280] mb-2 block">API Key</Label>
                <Input id="wix-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="wix_api_..." className="border-[#F0F0F0]" />
              </div>
              <div>
                <Label htmlFor="wix-site" className="text-xs text-[#6B7280] mb-2 block">Wix Site ID</Label>
                <Input id="wix-site" value={siteId} onChange={(e) => setSiteId(e.target.value)} placeholder="abc-123-xyz" className="border-[#F0F0F0]" />
              </div>
            </div>
          </>
        );
      case 'Squarespace':
      case 'Notion':
        return (
          <div className="text-center py-4">
            <p className="text-sm text-[#6B7280] mb-6">
              You'll be redirected to {platform.name} to authorize SEO Jalwa. We'll never publish without your approval.
            </p>
          </div>
        );
      case 'Next.js':
        return (
          <>
            <p className="text-sm text-[#6B7280] mb-3">
              Add this webhook URL to your Next.js project to receive publish events:
            </p>
            <CopyableInput value="https://api.seojalwa.com/webhook/publish/jalwa_abc123" label="Webhook URL" />
            <p className="text-sm text-[#6B7280] mt-4 mb-2">Example API route:</p>
            <pre className="bg-[#0A0A0A] text-[#1D9E75] text-xs p-4 rounded-lg overflow-x-auto font-mono">
{`// pages/api/jalwa-publish.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, body, slug } = req.body;
  // Write to your CMS / database
  await db.posts.create({ title, body, slug });
  return res.status(200).json({ ok: true });
}`}
            </pre>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg" data-testid={`modal-${platform.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <PlatformLogo name={platform.name} size={40} />
            <div>
              <DialogTitle className="text-left">Connect {platform.name}</DialogTitle>
              <span className="inline-block px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">
                {platform.method}
              </span>
            </div>
          </div>
          <DialogDescription className="text-left">{platform.description}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-1">{content()}</div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-[#F0F0F0]">Close</Button>
          {!['WordPress', 'Shopify'].includes(platform.name) && (
            <Button onClick={handleConnect} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
              {platform.name === 'Ghost' || platform.name === 'Wix' ? 'Save & Connect' : platform.name === 'Next.js' ? 'Save webhook' : `Connect with ${platform.name}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SocialModal = ({ platform, open, onClose, onConnect }) => {
  if (!platform) return null;
  const handleConnect = () => {
    toast.success(`${platform.platform} connected (dummy mode)`);
    onConnect(platform.platform);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" data-testid={`modal-social-${platform.platform.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <PlatformLogo name={platform.platform} size={40} />
            <DialogTitle className="text-left">Connect {platform.platform}</DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-sm text-[#6B7280]">
          You'll be redirected to {platform.platform} to authorize SEO Jalwa. We'll never post without your approval.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-[#F0F0F0]">Cancel</Button>
          <Button
            onClick={handleConnect}
            style={{ backgroundColor: SOCIAL_BRAND_COLORS[platform.platform] || '#0A0A0A' }}
            className="text-white hover:opacity-90"
          >
            Connect with {platform.platform}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PlatformCard = ({ name, method, description, connected, comingSoon, onConnect, onDisconnect, testid }) => (
  <div
    className={`bg-white rounded-xl border border-[#F0F0F0] p-5 flex flex-col ${comingSoon ? 'coming-soon-card' : ''}`}
    data-testid={testid}
  >
    <div className="flex items-start gap-3 mb-3">
      <PlatformLogo name={name} size={40} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-semibold text-[#0A0A0A]">{name}</h3>
          <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">
            {method}
          </span>
        </div>
        <p className="text-xs text-[#6B7280] line-clamp-2">{description}</p>
        {comingSoon && (
          <p className="text-[10px] text-[#9CA3AF] mt-1.5">Available in v2</p>
        )}
      </div>
    </div>
    <div className="mt-auto pt-3 flex items-center justify-between">
      {comingSoon ? (
        <span
          className="w-full text-center inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#F0F0F0] text-[#9CA3AF] text-xs font-medium rounded-md"
          data-testid={`${testid}-coming-soon`}
        >
          Coming Soon
        </span>
      ) : connected ? (
        <>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">
            <Check size={12} /> Connected
          </span>
          <button onClick={onDisconnect} className="text-xs text-[#6B7280] hover:text-[#EF4444]">
            Disconnect
          </button>
        </>
      ) : (
        <Button
          onClick={onConnect}
          size="sm"
          className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white w-full"
          data-testid={`${testid}-connect-btn`}
        >
          Connect
        </Button>
      )}
    </div>
  </div>
);

const SocialCard = ({ acc, onConnect, onDisconnect }) => (
  <div
    className="coming-soon-card bg-white rounded-xl border border-[#F0F0F0] p-5 flex flex-col"
    data-testid={`social-card-${acc.platform.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
  >
    <div className="flex items-start gap-3 mb-3">
      <PlatformLogo name={acc.platform} size={40} />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[#0A0A0A] mb-1">{acc.platform}</h3>
        <p className="text-xs text-[#6B7280]">Social autopilot coming soon</p>
        <p className="text-[10px] text-[#9CA3AF] mt-1">Available in v2</p>
      </div>
    </div>
    <div className="mt-auto pt-3">
      <span className="w-full text-center inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#F0F0F0] text-[#9CA3AF] text-xs font-medium rounded-md">
        Coming Soon
      </span>
    </div>
  </div>
);

export const ConnectionsPage = () => {
  const { addSite } = useSite();
  const [websitePlatforms, setWebsitePlatforms] = useState(WEBSITE_PLATFORMS);
  const [socialAccounts, setSocialAccounts] = useState(POST_DATA.socialAccounts);
  const [activeWebsite, setActiveWebsite] = useState(null);
  const [activeSocial, setActiveSocial] = useState(null);
  const [wpOpen, setWpOpen] = useState(false);

  const connectWebsite = async (name, payload = {}) => {
    setWebsitePlatforms((arr) => arr.map((p) => p.name === name ? { ...p, connected: true, description: `Connected · ${payload.url || name.toLowerCase() + '.com'}` } : p));
    // Try to register the connected site in the backend (best-effort)
    try {
      const platformSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
      const url = payload.url || `https://my-${platformSlug}.com`;
      const siteName = payload.name || (() => {
        try { return new URL(url).hostname; } catch { return url; }
      })();
      await addSite({ name: siteName, url, platform: platformSlug });
    } catch {
      // Silent — UI still shows connected. Real backend may already track this site or reject duplicates.
    }
  };
  const disconnectWebsite = (name) => {
    setWebsitePlatforms((arr) => arr.map((p) => p.name === name ? { ...p, connected: false } : p));
    toast.success(`${name} disconnected`);
  };
  const connectSocial = (platform) => {
    setSocialAccounts((arr) => arr.map((a) => a.platform === platform ? { ...a, connected: true, handle: `@mybrand`, followers: 1200 } : a));
  };
  const disconnectSocial = (platform) => {
    setSocialAccounts((arr) => arr.map((a) => a.platform === platform ? { ...a, connected: false, handle: undefined, followers: undefined } : a));
    toast.success(`${platform} disconnected`);
  };

  const openWebsite = (platform) => {
    if (platform.name === 'WordPress') {
      setWpOpen(true);
    } else {
      setActiveWebsite(platform);
    }
  };

  // Plugin metadata for footer download button
  const [pluginMeta, setPluginMeta] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await pluginApi.version();
        if (!cancelled) setPluginMeta(data || null);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);
  const handlePluginDownload = async () => {
    let url = pluginMeta?.download_url || pluginMeta?.downloadUrl;
    if (!url) {
      try {
        const data = await pluginApi.version();
        url = data?.download_url || data?.downloadUrl;
        if (data) setPluginMeta(data);
      } catch {}
    }
    if (url) window.open(url, '_blank');
    else toast.error('Plugin download not available yet. Contact hello@seojalwa.com');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-10"
      data-testid="connections-page"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Connect Site</h1>
        <p className="text-sm text-[#6B7280]">Connect your website so SEO Jalwa can publish articles directly. Choose your platform below.</p>
      </motion.div>

      {/* Section A — Website */}
      <motion.section variants={fadeInUp} className="space-y-4" data-testid="connections-website-section">
        <div>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A]">Connect your website</h2>
          <p className="text-sm text-[#6B7280]">SEO Jalwa will publish articles directly to your connected website.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websitePlatforms.map((p) => (
            <PlatformCard
              key={p.name}
              name={p.name}
              method={p.method}
              description={p.description}
              connected={p.connected}
              comingSoon={p.comingSoon}
              onConnect={() => openWebsite(p)}
              onDisconnect={() => disconnectWebsite(p.name)}
              testid={`website-card-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            />
          ))}
        </div>
      </motion.section>

      {/* Section B — Social */}
      <motion.section variants={fadeInUp} className="space-y-4" data-testid="connections-social-section">
        <div>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A]">Connect your social accounts</h2>
          <p className="text-sm text-[#6B7280]">SEO Jalwa will post content automatically to your connected accounts.</p>
          <p className="text-xs text-[#6B7280] mt-2 italic">
            This is the same as Social Autopilot &gt; Accounts. Manage all connections in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialAccounts.map((acc) => (
            <SocialCard
              key={acc.platform}
              acc={acc}
              onConnect={() => setActiveSocial(acc)}
              onDisconnect={() => disconnectSocial(acc.platform)}
            />
          ))}
        </div>
      </motion.section>

      {/* Download plugin footer */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6 flex flex-wrap items-center justify-between gap-4" data-testid="download-plugin-section">
        <div>
          <p className="font-medium text-[#0A0A0A]">Prefer to install manually?</p>
          <p className="text-xs text-[#6B7280]">Latest version: v{pluginMeta?.version || '—'} · Filename: seojalwa-plugin.zip</p>
        </div>
        <Button
          onClick={handlePluginDownload}
          variant="outline"
          className="border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE]"
          data-testid="footer-download-plugin"
        >
          <Download size={14} className="mr-2" /> Download Plugin (.zip){pluginMeta?.version ? ` — v${pluginMeta.version}` : ''}
        </Button>
      </motion.div>

      <WordPressConnectModal
        open={wpOpen}
        onClose={() => setWpOpen(false)}
        onConnected={(payload) => connectWebsite('WordPress', payload || {})}
      />
      <WebsiteModal
        platform={activeWebsite}
        open={!!activeWebsite}
        onClose={() => setActiveWebsite(null)}
        onConnect={connectWebsite}
      />
      <SocialModal
        platform={activeSocial}
        open={!!activeSocial}
        onClose={() => setActiveSocial(null)}
        onConnect={connectSocial}
      />
    </motion.div>
  );
};
