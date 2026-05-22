import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Loader2, Eye } from 'lucide-react';
import { adminLegalApi } from '../../lib/api';

const PAGES = [
  { slug: 'privacy-policy',  label: 'Privacy Policy' },
  { slug: 'terms-of-service', label: 'Terms of Service' },
  { slug: 'cookie-policy',   label: 'Cookie Policy' },
];

const LegalEditor = ({ slug }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await adminLegalApi.get(slug);
        const page = res?.page || res || {};
        if (!cancelled) {
          setTitle(page.title || '');
          setContent(page.content || page.body || '');
          setUpdatedAt(page.updatedAt || page.lastUpdated || null);
        }
      } catch {
        if (!cancelled) toast.error('Could not load page');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminLegalApi.update(slug, { title, content });
      setUpdatedAt(new Date().toISOString());
      toast.success(`${slug.replace(/-/g, ' ')} saved`);
    } catch (err) {
      toast.error(err?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid={`legal-editor-loading-${slug}`}>
        <Loader2 className="animate-spin text-[#1D9E75]" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid={`legal-editor-${slug}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-[#71717A]" data-testid={`legal-last-updated-${slug}`}>
          Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : '—'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`/${slug}`, '_blank', 'noopener,noreferrer')}
          data-testid={`legal-preview-${slug}`}
        >
          <Eye size={14} className="mr-1.5" /> Preview public page
        </Button>
      </div>

      <div>
        <label className="text-xs text-[#71717A] uppercase tracking-wide mb-1 block">Page title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="admin-input"
          data-testid={`legal-title-input-${slug}`}
        />
      </div>

      <div>
        <label className="text-xs text-[#71717A] uppercase tracking-wide mb-1 block">Body (HTML allowed)</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="admin-input min-h-[420px] font-mono text-sm"
          placeholder={`<h2>Section title</h2>\n<p>Your content here. HTML tags are allowed.</p>`}
          data-testid={`legal-content-input-${slug}`}
        />
        <p className="text-[10px] text-[#9CA3AF] mt-1">Supports basic HTML: &lt;h1-h6&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;.</p>
      </div>

      <Button onClick={handleSave} disabled={saving} className="admin-btn-primary" data-testid={`legal-save-${slug}`}>
        {saving ? <><Loader2 size={14} className="animate-spin mr-2" /> Saving...</> : 'Save changes'}
      </Button>
    </div>
  );
};

export const Legal = () => {
  return (
    <div className="space-y-6" data-testid="admin-legal-page">
      <div>
        <h2 className="text-xl font-semibold text-[#09090B]">Legal Pages</h2>
        <p className="text-sm text-[#71717A]">Edit the live content of the public-facing Privacy / Terms / Cookie policy pages.</p>
      </div>

      <div className="admin-card p-4">
        <Tabs defaultValue="privacy-policy" className="w-full">
          <TabsList className="bg-[#F0F0F0] mb-4">
            {PAGES.map((p) => (
              <TabsTrigger key={p.slug} value={p.slug} data-testid={`legal-tab-${p.slug}`}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {PAGES.map((p) => (
            <TabsContent key={p.slug} value={p.slug}>
              <LegalEditor slug={p.slug} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Legal;
