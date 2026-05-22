import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '../../components/ui/sheet';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';
import { Mail, Eye, Search, RotateCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_BADGES = {
  SENT:      'bg-[#1D9E75]/10 text-[#1D9E75]',
  DELIVERED: 'bg-[#1D9E75]/10 text-[#1D9E75]',
  PENDING:   'bg-[#F59E0B]/10 text-[#F59E0B]',
  FAILED:    'bg-[#EF4444]/10 text-[#EF4444]',
  BOUNCED:   'bg-[#EF4444]/10 text-[#EF4444]',
};

const Pill = ({ status }) => {
  const cls = STATUS_BADGES[(status || '').toUpperCase()] || 'bg-[#71717A]/10 text-[#71717A]';
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase ${cls}`} data-testid={`email-status-${(status || '').toLowerCase()}`}>
      {status}
    </span>
  );
};

export const Emails = () => {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [template, setTemplate] = useState('all');
  const [active, setActive] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.emailTemplates();
        const list = Array.isArray(data) ? data : data?.items || [];
        setTemplates(list);
      } catch {}
    })();
  }, []);

  const load = async () => {
    setItems(null);
    try {
      const params = {};
      if (status !== 'all') params.status = status;
      if (template !== 'all') params.template_key = template;
      const data = await adminApi.emails(params);
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
    } catch (err) {
      toast.error(err?.message || 'Could not load emails');
      setItems([]);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [status, template]);

  const openDetail = async (e) => {
    setActive(e);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await adminApi.email(e.id);
      setDetail(data || e);
    } catch {
      setDetail(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setActive(null);
    setDetail(null);
  };

  const handleResend = async () => {
    if (!active?.id) return;
    setResending(true);
    try {
      await adminApi.emailResend(active.id);
      toast.success('Email resent');
      load();
    } catch (err) {
      toast.error(err?.message || 'Could not resend');
    } finally {
      setResending(false);
    }
  };

  const filtered = (items || []).filter((e) => {
    if (!search) return true;
    const t = search.toLowerCase();
    return [e.recipient, e.to, e.subject, e.templateKey].filter(Boolean).some((s) => String(s).toLowerCase().includes(t));
  });

  const view = detail || active || {};
  const htmlBody = view.htmlBody || view.html || view.body || '';

  return (
    <div data-testid="admin-emails-page">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#09090B]">Email Logs</h1>
          <p className="text-sm text-[#71717A]">Every outbound email — delivery state, template, provider.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <Input
              placeholder="Search recipient / subject"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 admin-input"
              data-testid="emails-search-input"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36 admin-input" data-testid="emails-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="BOUNCED">Bounced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger className="w-44 admin-input" data-testid="emails-template-filter"><SelectValue placeholder="Template" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.key || t.id} value={t.key || t.id}>{t.name || t.key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        {!items ? (
          <TableSkeleton rows={6} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No emails yet" description="Outgoing emails will appear here once your app starts sending." icon={Mail} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Recipient</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Subject</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Template</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Provider</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Status</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Sent</th>
                <th className="text-right p-3 text-xs font-semibold text-[#71717A] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr
                  key={e.id || i}
                  className={`border-b border-[#F0F0F0] hover:bg-[#F9FAFB] cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                  onClick={() => openDetail(e)}
                  data-testid={`email-row-${e.id || i}`}
                >
                  <td className="p-3 text-sm text-[#09090B]">{e.recipient || e.to}</td>
                  <td className="p-3 text-sm text-[#09090B] max-w-[320px] truncate">{e.subject}</td>
                  <td className="p-3 text-xs text-[#71717A]">{e.templateKey || e.template || '—'}</td>
                  <td className="p-3 text-xs text-[#71717A] uppercase">{e.provider || '—'}</td>
                  <td className="p-3"><Pill status={e.status} /></td>
                  <td className="p-3 text-xs text-[#71717A]">{e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={(ev) => { ev.stopPropagation(); openDetail(e); }} data-testid={`email-view-${e.id || i}`}>
                      <Eye size={14} className="mr-1" />View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-[#71717A] mt-3">{filtered.length} email(s)</p>

      <Sheet open={!!active} onOpenChange={(o) => { if (!o) closeDetail(); }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col"
          data-testid="email-detail-panel"
        >
          <SheetHeader className="px-6 py-4 border-b border-[#F0F0F0]">
            <SheetTitle className="text-base flex items-center gap-2 pr-8">
              <span className="truncate">{view.subject || 'Email details'}</span>
              {view.status && <Pill status={view.status} />}
            </SheetTitle>
            <SheetDescription className="text-xs">
              To <strong data-testid="email-detail-recipient">{view.recipient || view.to}</strong>
              {view.templateKey && <> · <span className="text-[#1D9E75]">{view.templateKey}</span></>}
              {view.createdAt && <> · {new Date(view.createdAt).toLocaleString()}</>}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Metadata block */}
            <div className="px-6 py-4 grid grid-cols-2 gap-3 text-xs border-b border-[#F0F0F0] bg-[#FAFAFA]">
              <div>
                <p className="text-[#71717A] uppercase font-semibold tracking-wide mb-0.5">From</p>
                <p className="text-[#09090B]">{view.from || view.sender || '—'}</p>
              </div>
              <div>
                <p className="text-[#71717A] uppercase font-semibold tracking-wide mb-0.5">Provider</p>
                <p className="text-[#09090B] uppercase">{view.provider || '—'}</p>
              </div>
              <div>
                <p className="text-[#71717A] uppercase font-semibold tracking-wide mb-0.5">Message ID</p>
                <p className="text-[#09090B] font-mono text-[10px] truncate">{view.messageId || view.providerMessageId || view.id || '—'}</p>
              </div>
              <div>
                <p className="text-[#71717A] uppercase font-semibold tracking-wide mb-0.5">Attempts</p>
                <p className="text-[#09090B]">{view.attempts ?? view.retryCount ?? 1}</p>
              </div>
            </div>

            {/* HTML body in iframe (sandboxed, no execution) */}
            <div className="px-6 py-4">
              <p className="text-xs text-[#71717A] uppercase font-semibold tracking-wide mb-2">Email Body Preview</p>
              {detailLoading ? (
                <div className="flex items-center justify-center py-12 border border-[#F0F0F0] rounded-lg" data-testid="email-detail-loading">
                  <Loader2 className="animate-spin text-[#1D9E75]" size={20} />
                </div>
              ) : htmlBody ? (
                <iframe
                  title="email-preview"
                  sandbox=""
                  srcDoc={htmlBody}
                  className="w-full border border-[#F0F0F0] rounded-lg bg-white"
                  style={{ height: 500 }}
                  data-testid="email-iframe-preview"
                />
              ) : (
                <div className="p-6 text-center text-sm text-[#71717A] border border-dashed border-[#F0F0F0] rounded-lg" data-testid="email-no-body">
                  No body captured for this email.
                </div>
              )}
            </div>

            {view.error && (
              <div className="px-6 pb-4">
                <div className="p-3 bg-red-50 border border-red-200 text-[#B91C1C] text-xs rounded-lg" data-testid="email-detail-error">
                  <p className="font-semibold mb-1">Error</p>
                  <p>{view.error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-[#F0F0F0] flex items-center justify-end gap-2 bg-white">
            <Button variant="outline" onClick={closeDetail} data-testid="email-detail-close">Close</Button>
            <Button
              onClick={handleResend}
              disabled={resending || !active?.id}
              className="admin-btn-primary"
              data-testid="email-resend-btn"
            >
              {resending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <RotateCw size={14} className="mr-1.5" />}
              {resending ? 'Resending...' : 'Resend'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Emails;
