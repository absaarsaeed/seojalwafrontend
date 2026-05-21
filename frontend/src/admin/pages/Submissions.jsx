import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import {
  Tabs, TabsList, TabsTrigger,
} from '../../components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';
import { Reply, Eye, Check, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_BADGES = {
  NEW:        { label: 'New',        cls: 'bg-[#2563EB]/10 text-[#2563EB]' },
  IN_PROGRESS:{ label: 'In progress', cls: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
  RESOLVED:   { label: 'Resolved',   cls: 'bg-[#1D9E75]/10 text-[#1D9E75]' },
  ARCHIVED:   { label: 'Archived',   cls: 'bg-[#71717A]/10 text-[#71717A]' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_BADGES[(status || 'NEW').toUpperCase()] || STATUS_BADGES.NEW;
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${s.cls}`}>{s.label}</span>;
};

export const Submissions = () => {
  const [tab, setTab] = useState('FEEDBACK');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState(null);
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setItems(null);
    try {
      const params = { type: tab };
      if (status !== 'all') params.status = status;
      const data = await adminApi.submissions(params);
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
    } catch (err) {
      toast.error(err?.message || 'Could not load submissions');
      setItems([]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab, status]);

  const resolved = useMemo(() => (items || []).filter((s) => (s.status || '').toUpperCase() === 'RESOLVED').length, [items]);

  const handleMarkResolved = async (s) => {
    setBusy(true);
    try {
      await adminApi.updateSubmission(s.id, { status: 'RESOLVED' });
      toast.success('Marked as resolved');
      setItems((prev) => (prev || []).map((x) => x.id === s.id ? { ...x, status: 'RESOLVED' } : x));
      if (active?.id === s.id) setActive({ ...active, status: 'RESOLVED' });
    } catch (err) {
      toast.error(err?.message || 'Could not update');
    } finally { setBusy(false); }
  };

  const handleReply = async () => {
    if (!reply.trim() || !active) return;
    setBusy(true);
    try {
      await adminApi.replySubmission(active.id, reply);
      toast.success('Reply sent');
      setReply('');
      await handleMarkResolved(active);
    } catch (err) {
      toast.error(err?.message || 'Could not send reply');
    } finally { setBusy(false); }
  };

  return (
    <div data-testid="admin-submissions-page">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#09090B]">Submissions</h1>
          <p className="text-sm text-[#71717A]">Feedback and contact messages from your users.</p>
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40 admin-input" data-testid="submissions-status-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="FEEDBACK" data-testid="submissions-tab-feedback">Feedback</TabsTrigger>
          <TabsTrigger value="CONTACT" data-testid="submissions-tab-contact">Contact</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="admin-card overflow-hidden">
        {!items ? (
          <TableSkeleton rows={6} cols={4} />
        ) : items.length === 0 ? (
          <EmptyState title="Inbox zero" description={`No ${tab.toLowerCase()} submissions yet.`} icon={MessageSquare} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">From</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Message</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Status</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Date</th>
                <th className="text-right p-3 text-xs font-semibold text-[#71717A] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s, i) => (
                <tr
                  key={s.id || i}
                  className={`border-b border-[#F0F0F0] hover:bg-[#F9FAFB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                  data-testid={`submission-row-${s.id || i}`}
                >
                  <td className="p-3 text-sm">
                    <div className="font-medium text-[#09090B] truncate max-w-[200px]">{s.name || s.email || 'Anonymous'}</div>
                    {s.email && s.name && <div className="text-xs text-[#71717A]">{s.email}</div>}
                  </td>
                  <td className="p-3 text-sm text-[#09090B] max-w-[420px]">
                    <div className="truncate">{s.message || s.title || s.subject}</div>
                  </td>
                  <td className="p-3"><StatusBadge status={s.status} /></td>
                  <td className="p-3 text-xs text-[#71717A]">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setActive(s)} data-testid={`submission-view-${s.id || i}`}>
                      <Eye size={14} className="mr-1" />View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!active} onOpenChange={(o) => { if (!o) { setActive(null); setReply(''); } }}>
        <DialogContent className="max-w-2xl" data-testid="submission-detail-dialog">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>{active.name || active.email || 'Anonymous'}</span>
                  <StatusBadge status={active.status} />
                </DialogTitle>
                <DialogDescription>
                  {active.email} · {active.createdAt && new Date(active.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              {active.rating != null && (
                <p className="text-sm text-[#71717A]">Rating: <strong className="text-[#0A0A0A]">{active.rating} / 5</strong></p>
              )}
              {active.category && <p className="text-sm text-[#71717A]">Category: <strong className="text-[#0A0A0A]">{active.category}</strong></p>}
              {active.pageUrl && <p className="text-sm text-[#71717A]">Page: <a href={active.pageUrl} className="text-[#1D9E75] hover:underline" target="_blank" rel="noopener noreferrer">{active.pageUrl}</a></p>}
              <div className="bg-[#F9FAFB] rounded-lg p-4 max-h-[280px] overflow-y-auto whitespace-pre-wrap text-sm text-[#0A0A0A]" data-testid="submission-message">
                {active.message || active.title || active.subject}
              </div>

              <div className="pt-2">
                <label className="text-xs text-[#71717A] block mb-1.5">Reply (sends email)</label>
                <Textarea
                  rows={4}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a friendly reply..."
                  className="admin-input"
                  data-testid="submission-reply-input"
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleMarkResolved(active)}
                  disabled={busy || (active.status || '').toUpperCase() === 'RESOLVED'}
                  data-testid="submission-mark-resolved-btn"
                >
                  <Check size={14} className="mr-1.5" />Mark resolved
                </Button>
                <Button
                  onClick={handleReply}
                  disabled={busy || !reply.trim()}
                  className="admin-btn-primary"
                  data-testid="submission-send-reply-btn"
                >
                  {busy ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Reply size={14} className="mr-1.5" />}
                  Send reply
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <p className="text-xs text-[#71717A] mt-3">{items?.length || 0} submission(s) · {resolved} resolved</p>
    </div>
  );
};

export default Submissions;
