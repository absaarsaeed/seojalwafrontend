import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '../../components/ui/collapsible';
import { PlatformLogo } from '../../components/public/PlatformLogo';
import { Check, Copy, ChevronDown, Download, Loader2, AlertCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useSite } from '../../context/SiteContext';
import { sitesApi, pluginApi } from '../../lib/api';

const StepDot = ({ idx, status, label }) => {
  let bg = 'bg-[#F0F0F0] text-[#6B7280]';
  let icon = <span>{idx}</span>;
  if (status === 'done') {
    bg = 'bg-[#1D9E75] text-white';
    icon = <Check size={14} />;
  } else if (status === 'current') {
    bg = 'bg-[#1D9E75] text-white ring-4 ring-[#E1F5EE]';
  }
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${bg}`}>{icon}</div>
      <span className={`text-xs text-center ${status === 'pending' ? 'text-[#6B7280]' : 'text-[#0A0A0A] font-medium'}`}>{label}</span>
    </div>
  );
};

const Stepper = ({ step }) => {
  const states = (i) => i < step ? 'done' : i === step ? 'current' : 'pending';
  return (
    <div className="flex items-center justify-between gap-2 mb-6">
      <StepDot idx={1} status={states(1)} label="Your URL" />
      <div className={`flex-1 h-0.5 ${step > 1 ? 'bg-[#1D9E75]' : 'bg-[#F0F0F0]'}`} />
      <StepDot idx={2} status={states(2)} label="Install Plugin" />
      <div className={`flex-1 h-0.5 ${step > 2 ? 'bg-[#1D9E75]' : 'bg-[#F0F0F0]'}`} />
      <StepDot idx={3} status={states(3)} label="Connect" />
    </div>
  );
};

export const WordPressConnectModal = ({ open, onClose, onConnected }) => {
  const { activeSite } = useSite();
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loadingKey, setLoadingKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [testing, setTesting] = useState(false);
  const [done, setDone] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [pluginMeta, setPluginMeta] = useState(null); // { version, download_url }

  // Load plugin metadata when the modal opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await pluginApi.version();
        if (!cancelled) setPluginMeta(data || null);
      } catch {
        if (!cancelled) setPluginMeta(null);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  const handlePluginDownload = async () => {
    let url = pluginMeta?.download_url || pluginMeta?.downloadUrl;
    if (!url) {
      try {
        const data = await pluginApi.version();
        url = data?.download_url || data?.downloadUrl;
        if (data) setPluginMeta(data);
      } catch {}
    }
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Plugin download not available yet. Contact hello@seojalwa.com');
    }
  };

  // Pre-fill URL whenever the modal opens and an active site exists.
  useEffect(() => {
    if (open && activeSite) {
      setUrl(activeSite.url || activeSite.domain || '');
    }
  }, [open, activeSite]);

  // Fetch real API key when user reaches Step 3.
  useEffect(() => {
    if (step !== 3 || !activeSite?.id) return;
    let cancelled = false;
    (async () => {
      setLoadingKey(true);
      setKeyError('');
      try {
        const data = await sitesApi.get(activeSite.id);
        if (cancelled) return;
        const key = data?.apiKey || data?.api_key || data?.site?.apiKey;
        if (key) setApiKey(key);
        else setKeyError('No API key returned by the server.');
      } catch (err) {
        if (!cancelled) setKeyError(err?.message || 'Could not load API key');
      } finally {
        if (!cancelled) setLoadingKey(false);
      }
    })();
    return () => { cancelled = true; };
  }, [step, activeSite?.id]);

  const reset = () => {
    setStep(1);
    setTesting(false);
    setDone(false);
    setApiKey('');
    setKeyError('');
    setVerifyError('');
  };

  const handleClose = (open) => {
    if (!open) {
      onClose();
      setTimeout(reset, 200);
    }
  };

  const copyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied');
  };

  const handleTestAndConnect = async () => {
    if (!activeSite?.id) {
      toast.error('No site selected');
      return;
    }
    setVerifyError('');
    setTesting(true);
    try {
      const res = await sitesApi.verifyConnection(activeSite.id);
      const ok = res?.success !== false && res?.connected !== false;
      if (!ok) {
        const msg = res?.message || res?.error || 'Could not reach your WordPress site. Please ensure the plugin is installed and the API key is correct.';
        setVerifyError(msg);
        toast.error(msg);
        setTesting(false);
        return;
      }
      setDone(true);
      onConnected?.({ url, site: res });
    } catch (err) {
      const msg = err?.message || 'Connection failed. Please verify the plugin is installed and the API key is pasted correctly in WordPress.';
      setVerifyError(msg);
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  // ── No active site state ────────────────────────────────────────────────
  const NoSiteState = () => (
    <div className="text-center py-10" data-testid="wp-no-site">
      <div className="w-16 h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center mx-auto mb-4">
        <Globe size={28} className="text-[#F59E0B]" />
      </div>
      <h3 className="font-syne text-xl font-bold text-[#0A0A0A] mb-2">No site selected yet</h3>
      <p className="text-sm text-[#6B7280] mb-6 max-w-md mx-auto">
        Please add your website first in the site switcher above, then come back to connect it.
      </p>
      <Button
        onClick={() => handleClose(false)}
        className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
        data-testid="wp-no-site-close"
      >
        Got it, take me to the site switcher
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden" data-testid="wordpress-connect-modal">
        <DialogTitle className="sr-only">Connect Your WordPress Site</DialogTitle>
        <div className="bg-white">
          <div className="p-6 border-b border-[#F0F0F0] flex items-center gap-3">
            <PlatformLogo name="WordPress" size={40} />
            <div>
              <h2 className="font-syne text-xl font-bold text-[#0A0A0A]">Connect Your WordPress Site</h2>
              <p className="text-sm text-[#6B7280]">Follow the 3 steps below to link your site to SEO Jalwa.</p>
            </div>
          </div>

          <div className="p-6">
            {!activeSite ? (
              <NoSiteState />
            ) : (
              <>
                {!done && <Stepper step={step} />}

                {/* Step 1 */}
                {step === 1 && !done && (
                  <div data-testid="wp-step-1">
                    <h3 className="font-semibold text-[#0A0A0A] mb-1">Confirm your WordPress site URL</h3>
                    <p className="text-sm text-[#6B7280] mb-4">We'll use this to verify the plugin installation.</p>
                    <Label htmlFor="wp-url" className="mb-2 block">Site URL</Label>
                    <Input id="wp-url" value={url} onChange={(e) => setUrl(e.target.value)} className="border-[#F0F0F0] mb-4" data-testid="wp-url-input" />
                    <div className="flex justify-end">
                      <Button onClick={() => setStep(2)} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="wp-step-1-continue">
                        Continue →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && !done && (
                  <div data-testid="wp-step-2">
                    <h3 className="font-semibold text-[#0A0A0A] mb-1">Install the SEO Jalwa Plugin</h3>
                    <p className="text-sm text-[#6B7280] mb-4">Choose either automatic or manual installation.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#E1F5EE]/40 border border-[#1D9E75]/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-[#1D9E75] text-white text-[10px] font-semibold rounded-full">RECOMMENDED</span>
                        </div>
                        <p className="font-semibold text-[#0A0A0A] mb-2">Option A — Automatic</p>
                        <p className="text-xs text-[#6B7280] mb-3">Install directly from WordPress.org</p>
                        <ol className="text-xs text-[#6B7280] space-y-1.5 list-decimal list-inside">
                          <li>Go to your WordPress admin</li>
                          <li>Navigate to Plugins → Add New</li>
                          <li>Search for "SEO Jalwa"</li>
                          <li>Click Install then Activate</li>
                        </ol>
                      </div>

                      <div className="bg-[#F9FAFB] border border-[#F0F0F0] rounded-lg p-4">
                        <p className="font-semibold text-[#0A0A0A] mb-2 mt-6">Option B — Manual</p>
                        <p className="text-xs text-[#6B7280] mb-3">Download and upload the plugin file</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#F0F0F0] mb-3"
                          onClick={handlePluginDownload}
                          data-testid="wp-download-plugin"
                        >
                          <Download size={14} className="mr-1.5" />
                          Download Plugin (.zip){pluginMeta?.version ? ` — v${pluginMeta.version}` : ''}
                        </Button>
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <button className="text-xs text-[#1D9E75] hover:underline inline-flex items-center gap-1">
                              How to upload to WordPress <ChevronDown size={12} />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <ol className="text-xs text-[#6B7280] space-y-1 mt-2 list-decimal list-inside">
                              <li>WordPress admin → Plugins → Add New → Upload Plugin</li>
                              <li>Choose seojalwa-plugin.zip</li>
                              <li>Install Now → Activate Plugin</li>
                            </ol>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="ghost" onClick={() => setStep(1)} className="text-[#6B7280]">← Back</Button>
                      <Button onClick={() => setStep(3)} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="wp-step-2-continue">
                        I've installed the plugin →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && !done && (
                  <div data-testid="wp-step-3">
                    <h3 className="font-semibold text-[#0A0A0A] mb-1">Connect your site</h3>
                    <p className="text-sm text-[#6B7280] mb-4">Paste this API key into the plugin to finalize.</p>

                    <Label className="mb-2 block">Your API Key</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={loadingKey ? 'Loading…' : (apiKey || (keyError ? '' : ''))}
                        readOnly
                        placeholder={keyError ? '—' : 'Loading…'}
                        className="flex-1 border-[#F0F0F0] bg-[#F9FAFB] font-mono"
                        data-testid="wp-api-key"
                      />
                      <Button
                        variant="outline"
                        onClick={copyKey}
                        disabled={!apiKey}
                        className="border-[#F0F0F0]"
                        data-testid="wp-copy-key"
                      >
                        {loadingKey ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                      </Button>
                    </div>
                    {keyError && (
                      <p className="flex items-center gap-1 text-xs text-[#EF4444] mb-4" data-testid="wp-api-key-error">
                        <AlertCircle size={12} />
                        <span>{keyError}</span>
                      </p>
                    )}

                    <div className="bg-[#F9FAFB] rounded-lg p-4 mb-4 mt-4">
                      <ol className="text-sm text-[#0A0A0A] space-y-2 list-decimal list-inside">
                        <li>In WordPress admin, go to <strong>Settings → SEO Jalwa</strong></li>
                        <li>Paste your API key above (exact value — no extra spaces)</li>
                        <li>Click <strong>Verify &amp; Connect</strong> in the plugin</li>
                        <li>Return here and click <strong>Test &amp; Connect</strong></li>
                      </ol>
                    </div>

                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button className="text-xs text-[#1D9E75] hover:underline inline-flex items-center gap-1 mb-3" data-testid="wp-troubleshoot-toggle">
                          Not working? Troubleshooting tips <ChevronDown size={12} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="text-xs text-[#6B7280] space-y-1 list-disc list-inside bg-[#F9FAFB] rounded-lg p-3 mb-4">
                          <li>You've activated the plugin in WordPress</li>
                          <li>Your WordPress URL matches the one you added in SEO Jalwa</li>
                          <li>No extra spaces in the API key</li>
                          <li>Your WordPress REST API is reachable from the public internet</li>
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>

                    {verifyError && (
                      <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-50 text-[#EF4444] text-sm" data-testid="wp-verify-error">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span>{verifyError}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button variant="ghost" onClick={() => setStep(2)} className="text-[#6B7280]">← Back</Button>
                      <Button
                        onClick={handleTestAndConnect}
                        disabled={testing || !apiKey}
                        className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
                        data-testid="wp-test-connect"
                      >
                        {testing && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                        {testing ? 'Testing connection...' : 'Test & Connect'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Success */}
                {done && (
                  <div className="text-center py-8" data-testid="wp-success">
                    <div className="w-20 h-20 rounded-full bg-[#1D9E75] flex items-center justify-center mx-auto mb-4">
                      <Check size={40} className="text-white" />
                    </div>
                    <h3 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-2">Connected Successfully!</h3>
                    <p className="text-sm text-[#6B7280] mb-6 max-w-md mx-auto">
                      Your WordPress site is now linked to SEO Jalwa. Articles will be published automatically.
                    </p>
                    <Button onClick={() => handleClose(false)} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                      Go to Dashboard →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
