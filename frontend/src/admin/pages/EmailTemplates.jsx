import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import { FormSkeleton, TableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';
import { Mail, Save, Send, RefreshCw, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const EmailTemplates = () => {
  const [list, setList] = useState(null);
  const [active, setActive] = useState(null); // { key, name, subject, htmlBody, variables, isActive }
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setList(null);
    try {
      const data = await adminApi.emailTemplates();
      const items = Array.isArray(data) ? data : data?.items || [];
      setList(items);
      if (items.length && !active) {
        const fresh = await adminApi.emailTemplate(items[0].key || items[0].id);
        setActive(fresh);
      }
    } catch (err) {
      toast.error(err?.message || 'Could not load templates');
      setList([]);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const selectTemplate = async (key) => {
    try {
      const fresh = await adminApi.emailTemplate(key);
      setActive(fresh);
    } catch (err) {
      toast.error(err?.message || 'Could not load template');
    }
  };

  const handleSave = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await adminApi.updateEmailTemplate(active.key || active.id, {
        subject: active.subject,
        htmlBody: active.htmlBody || active.body,
        isActive: active.isActive !== false,
      });
      toast.success('Template saved');
    } catch (err) {
      toast.error(err?.message || 'Could not save');
    } finally { setSaving(false); }
  };

  const handleSendTest = async () => {
    if (!active || !testEmail) {
      toast.error('Enter a test email address');
      return;
    }
    setTesting(true);
    try {
      await adminApi.testEmailTemplate(active.key || active.id, { testEmail });
      toast.success(`Test email sent to ${testEmail}`);
    } catch (err) {
      toast.error(err?.message || 'Could not send test');
    } finally { setTesting(false); }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await adminApi.seedEmailTemplates();
      toast.success('Templates re-seeded');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Seed failed');
    } finally { setSeeding(false); }
  };

  const renderPreview = () => {
    const html = active?.htmlBody || active?.body || '';
    // Sample variable substitution for preview.
    const samples = {
      '{{fullName}}': 'Demo User',
      '{{firstName}}': 'Demo',
      '{{email}}': 'demo@seojalwa.com',
      '{{siteName}}': 'Demo Site',
      '{{resetLink}}': 'https://app.seojalwa.com/reset-password?token=demo',
      '{{verifyLink}}': 'https://app.seojalwa.com/verify?token=demo',
      '{{appUrl}}':    'https://app.seojalwa.com',
      '{{plan}}':      'Growth',
      '{{trialDays}}': '7',
    };
    let out = html;
    Object.entries(samples).forEach(([k, v]) => { out = out.split(k).join(v); });
    return out;
  };

  return (
    <div data-testid="admin-email-templates-page">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#09090B]">Email Templates</h1>
          <p className="text-sm text-[#71717A]">Edit subject + HTML body. Variables wrap in {'{{ }}'}.</p>
        </div>
        <Button onClick={handleSeed} disabled={seeding} variant="outline" data-testid="reseed-templates-btn">
          {seeding ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
          Re-seed defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left rail */}
        <aside className="admin-card p-2 max-h-[700px] overflow-y-auto" data-testid="templates-list">
          {!list ? (
            <TableSkeleton rows={6} cols={1} />
          ) : list.length === 0 ? (
            <EmptyState title="No templates" description="Seed defaults to get started" icon={Mail} />
          ) : (
            <ul className="space-y-1">
              {list.map((t) => (
                <li key={t.key || t.id}>
                  <button
                    onClick={() => selectTemplate(t.key || t.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      (active?.key || active?.id) === (t.key || t.id) ? 'bg-[#1D9E75]/10 text-[#1D9E75] font-medium' : 'hover:bg-[#F9FAFB] text-[#0A0A0A]'
                    }`}
                    data-testid={`template-item-${t.key || t.id}`}
                  >
                    <div className="font-medium">{t.name || t.key}</div>
                    <div className="text-[10px] text-[#71717A] font-mono truncate">{t.key || t.id}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Editor */}
        <section className="space-y-4">
          {!active ? (
            <FormSkeleton />
          ) : (
            <>
              <div className="admin-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#09090B]">{active.name || active.key}</h3>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Active</Label>
                    <Switch
                      checked={active.isActive !== false}
                      onCheckedChange={(v) => setActive((p) => ({ ...p, isActive: v }))}
                      data-testid="template-active-switch"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-[#71717A]">Subject</Label>
                  <Input
                    value={active.subject || ''}
                    onChange={(e) => setActive((p) => ({ ...p, subject: e.target.value }))}
                    className="admin-input mt-1.5"
                    data-testid="template-subject-input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#71717A]">HTML body</Label>
                  <Textarea
                    rows={18}
                    value={active.htmlBody || active.body || ''}
                    onChange={(e) => setActive((p) => ({ ...p, htmlBody: e.target.value }))}
                    className="admin-input mt-1.5 font-mono text-[12px] leading-5"
                    data-testid="template-body-input"
                  />
                </div>
                {Array.isArray(active.variables) && active.variables.length > 0 && (
                  <div>
                    <Label className="text-xs text-[#71717A]">Available variables</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {active.variables.map((v) => (
                        <code key={v} className="px-1.5 py-0.5 bg-[#F0F0F0] rounded text-[11px] text-[#0A0A0A]">{`{{${v}}}`}</code>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-card p-5">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs text-[#71717A]">Test recipient</Label>
                    <Input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="hello@seojalwa.com"
                      className="admin-input mt-1.5"
                      data-testid="template-test-email-input"
                    />
                  </div>
                  <Button variant="outline" onClick={() => setPreviewOpen(true)} data-testid="template-preview-btn">
                    <Eye size={14} className="mr-1.5" />Preview
                  </Button>
                  <Button
                    onClick={handleSendTest}
                    disabled={testing || !testEmail}
                    variant="outline"
                    data-testid="template-test-send-btn"
                  >
                    {testing ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Send size={14} className="mr-1.5" />}
                    Send test
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="admin-btn-primary"
                    data-testid="template-save-btn"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
                    Save changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl" data-testid="template-preview-dialog">
          <DialogHeader>
            <DialogTitle>{active?.subject}</DialogTitle>
            <DialogDescription>Rendered with sample variables.</DialogDescription>
          </DialogHeader>
          <div
            className="bg-white border border-[#F0F0F0] rounded-lg p-4 max-h-[520px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: renderPreview() }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplates;
