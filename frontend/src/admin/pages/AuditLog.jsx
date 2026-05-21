import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Input } from '../../components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';
import { ScrollText, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';

const COMMON_ACTIONS = [
  'all',
  'USER_DELETED',
  'USER_SUBSCRIPTION_UPDATED',
  'USER_STATUS_UPDATED',
  'TRIAL_EXTENDED',
  'PLAN_UPDATED',
  'SETTINGS_UPDATED',
  'API_KEY_UPDATED',
  'PLUGIN_UPLOADED',
  'ANNOUNCEMENT_SENT',
  'COUPON_CREATED',
  'BLOG_PUBLISHED',
  'EMAIL_TEMPLATE_UPDATED',
];

export const AuditLog = () => {
  const [items, setItems] = useState(null);
  const [action, setAction] = useState('all');
  const [targetId, setTargetId] = useState('');
  const [active, setActive] = useState(null);

  const load = async () => {
    setItems(null);
    try {
      const params = { limit: 100 };
      if (action !== 'all') params.action = action;
      if (targetId.trim()) params.target_id = targetId.trim();
      const data = await adminApi.auditLog(params);
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
    } catch (err) {
      toast.error(err?.message || 'Could not load audit log');
      setItems([]);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [action]);

  return (
    <div data-testid="admin-audit-log-page">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#09090B]">Audit Log</h1>
          <p className="text-sm text-[#71717A]">A complete record of every admin action.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-56 admin-input" data-testid="audit-action-filter">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_ACTIONS.map((a) => (
                <SelectItem key={a} value={a}>{a === 'all' ? 'All actions' : a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <Input
              placeholder="Target ID"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
              className="pl-9 w-56 admin-input"
              data-testid="audit-target-filter"
            />
          </div>
          <Button onClick={load} className="admin-btn-primary" data-testid="audit-refresh-btn">Apply</Button>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        {!items ? (
          <TableSkeleton rows={8} cols={5} />
        ) : items.length === 0 ? (
          <EmptyState title="No audit entries" description="Try widening filters." icon={ScrollText} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">When</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Action</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Target</th>
                <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Admin</th>
                <th className="text-right p-3 text-xs font-semibold text-[#71717A] uppercase">Details</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a, i) => (
                <tr
                  key={a.id || i}
                  className={`border-b border-[#F0F0F0] hover:bg-[#F9FAFB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                  data-testid={`audit-row-${a.id || i}`}
                >
                  <td className="p-3 text-xs text-[#71717A]">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</td>
                  <td className="p-3 text-sm">
                    <code className="px-1.5 py-0.5 bg-[#F0F0F0] rounded text-[11px] text-[#0A0A0A]">{a.action}</code>
                  </td>
                  <td className="p-3 text-xs text-[#71717A] font-mono truncate max-w-[260px]">
                    {a.targetType ? `${a.targetType}:` : ''}{a.targetId || '—'}
                  </td>
                  <td className="p-3 text-xs text-[#0A0A0A]">{a.admin?.username || a.adminUsername || a.actor || 'admin'}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setActive(a)} data-testid={`audit-view-${a.id || i}`}>
                      <Eye size={14} className="mr-1" />Diff
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }}>
        <DialogContent className="max-w-2xl" data-testid="audit-detail-dialog">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.action}</DialogTitle>
                <DialogDescription>
                  {active.targetType ? `${active.targetType}:` : ''}{active.targetId || ''} · {active.createdAt && new Date(active.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <pre
                className="bg-[#0A0A0A] text-[#A7F3D0] text-xs p-4 rounded-lg overflow-x-auto max-h-[420px]"
                data-testid="audit-diff"
              >{JSON.stringify(active.changes || active.diff || active.payload || active, null, 2)}</pre>
            </>
          )}
        </DialogContent>
      </Dialog>

      <p className="text-xs text-[#71717A] mt-3">{items?.length || 0} entries</p>
    </div>
  );
};

export default AuditLog;
