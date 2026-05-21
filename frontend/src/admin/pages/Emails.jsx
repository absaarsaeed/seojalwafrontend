import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../../components/ui/dialog';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';
import { Mail, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_BADGES = {
  SENT:    'bg-[#1D9E75]/10 text-[#1D9E75]',
  PENDING: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  FAILED:  'bg-[#EF4444]/10 text-[#EF4444]',
  BOUNCED: 'bg-[#EF4444]/10 text-[#EF4444]',
};

const Pill = ({ status }) => {
  const cls = STATUS_BADGES[(status || '').toUpperCase()] || 'bg-[#71717A]/10 text-[#71717A]';
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase ${cls}`}>{status}</span>;
};

export const Emails = () => {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [template, setTemplate] = useState('all');
  const [active, setActive] = useState(null);
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

  const filtered = (items || []).filter((e) => {
    if (!search) return true;
    const t = search.toLowerCase();
    return [e.recipient, e.subject, e.templateKey].filter(Boolean).some((s) => String(s).toLowerCase().includes(t));
  });

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
                  className={`border-b border-[#F0F0F0] hover:bg-[#F9FAFB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                  data-testid={`email-row-${e.id || i}`}
                >
                  <td className="p-3 text-sm text-[#09090B]">{e.recipient || e.to}</td>
                  <td className="p-3 text-sm text-[#09090B] max-w-[320px] truncate">{e.subject}</td>
                  <td className="p-3 text-xs text-[#71717A]">{e.templateKey || e.template || '—'}</td>
                  <td className="p-3 text-xs text-[#71717A] uppercase">{e.provider || '—'}</td>
                  <td className="p-3"><Pill status={e.status} /></td>
                  <td className="p-3 text-xs text-[#71717A]">{e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setActive(e)} data-testid={`email-view-${e.id || i}`}>
                      <Eye size={14} className="mr-1" />View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }}>
        <DialogContent className="max-w-3xl" data-testid="email-detail-dialog">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><span>{active.subject}</span><Pill status={active.status} /></DialogTitle>
                <DialogDescription>
                  To <strong>{active.recipient || active.to}</strong> · {active.templateKey} · {active.createdAt && new Date(active.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div
                className="bg-white border border-[#F0F0F0] rounded-lg p-4 max-h-[480px] overflow-y-auto text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: active.htmlBody || active.body || `<p class="text-[#71717A]">No body captured.</p>` }}
                data-testid="email-body"
              />
              {active.error && (
                <div className="p-3 bg-red-50 text-[#EF4444] text-xs rounded-lg">
                  Error: {active.error}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <p className="text-xs text-[#71717A] mt-3">{filtered.length} email(s)</p>
    </div>
  );
};

export default Emails;
