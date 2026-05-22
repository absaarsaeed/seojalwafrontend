import { useEffect, useMemo, useState } from 'react';
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
import { ScrollText, Eye, Search, Loader2 } from 'lucide-react';
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

// Flatten { a: { b: 1 }, c: 2 } → { "a.b": 1, c: 2 } for diff rendering
const flatten = (obj, prefix = '', out = {}) => {
  if (obj == null || typeof obj !== 'object') {
    out[prefix || '(root)'] = obj;
    return out;
  }
  Object.entries(obj).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  });
  return out;
};

const formatVal = (v) => {
  if (v == null) return <span className="text-[#71717A] italic">—</span>;
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return JSON.stringify(v);
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const DiffTable = ({ before, after }) => {
  const flatBefore = useMemo(() => flatten(before || {}), [before]);
  const flatAfter = useMemo(() => flatten(after || {}), [after]);
  const allKeys = useMemo(
    () => Array.from(new Set([...Object.keys(flatBefore), ...Object.keys(flatAfter)])).sort(),
    [flatBefore, flatAfter]
  );

  if (allKeys.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-[#71717A] border border-dashed border-[#F0F0F0] rounded-lg" data-testid="diff-empty">
        No before/after data captured.
      </div>
    );
  }

  return (
    <div className="border border-[#F0F0F0] rounded-lg overflow-hidden" data-testid="diff-table">
      <table className="w-full text-sm">
        <thead className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
          <tr>
            <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Field</th>
            <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">Before</th>
            <th className="text-left p-3 text-xs font-semibold text-[#71717A] uppercase">After</th>
          </tr>
        </thead>
        <tbody>
          {allKeys.map((k) => {
            const b = flatBefore[k];
            const a = flatAfter[k];
            const changed = JSON.stringify(b) !== JSON.stringify(a);
            return (
              <tr
                key={k}
                className={`border-b border-[#F0F0F0] last:border-b-0 ${changed ? 'bg-[#FEFCE8]' : 'bg-white'}`}
                data-testid={`diff-row-${k}`}
              >
                <td className="p-3 font-mono text-[11px] text-[#0A0A0A] align-top">{k}</td>
                <td className={`p-3 text-xs align-top break-all ${changed ? 'text-[#B91C1C] line-through opacity-80' : 'text-[#09090B]'}`}>
                  {formatVal(b)}
                </td>
                <td className={`p-3 text-xs align-top break-all ${changed ? 'text-[#1D9E75] font-medium' : 'text-[#09090B]'}`}>
                  {formatVal(a)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const AuditLog = () => {
  const [items, setItems] = useState(null);
  const [action, setAction] = useState('all');
  const [targetId, setTargetId] = useState('');
  const [active, setActive] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const openDetail = async (entry) => {
    setActive(entry);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await adminApi.auditLogGet(entry.id);
      setDetail(data || entry);
    } catch {
      setDetail(entry);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setActive(null);
    setDetail(null);
  };

  const view = detail || active || {};
  // Backend shape may use { before, after } or { changes: { before, after } } or { old, new }
  const before = view.before ?? view.changes?.before ?? view.old ?? view.previous ?? null;
  const after = view.after ?? view.changes?.after ?? view.new ?? view.current ?? null;

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
                  className={`border-b border-[#F0F0F0] hover:bg-[#F9FAFB] cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                  onClick={() => openDetail(a)}
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
                    <Button size="sm" variant="ghost" onClick={(ev) => { ev.stopPropagation(); openDetail(a); }} data-testid={`audit-view-${a.id || i}`}>
                      <Eye size={14} className="mr-1" />Diff
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-[#71717A] mt-3">{items?.length || 0} entries</p>

      <Sheet open={!!active} onOpenChange={(o) => { if (!o) closeDetail(); }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto"
          data-testid="audit-detail-panel"
        >
          <SheetHeader>
            <SheetTitle className="text-base flex items-center gap-2 pr-8">
              <code className="px-1.5 py-0.5 bg-[#F0F0F0] rounded text-[12px] text-[#0A0A0A]">{view.action}</code>
            </SheetTitle>
            <SheetDescription className="text-xs">
              {view.targetType ? <strong>{view.targetType}: </strong> : null}
              <span className="font-mono">{view.targetId || ''}</span>
              {view.createdAt && <> · {new Date(view.createdAt).toLocaleString()}</>}
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12" data-testid="audit-detail-loading">
              <Loader2 className="animate-spin text-[#1D9E75]" size={20} />
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs border border-[#F0F0F0] rounded-lg p-3 bg-[#FAFAFA]">
                <div>
                  <p className="text-[#71717A] uppercase font-semibold tracking-wide mb-0.5">Admin</p>
                  <p className="text-[#09090B]">{view.admin?.username || view.adminUsername || view.actor || 'admin'}</p>
                </div>
                <div>
                  <p className="text-[#71717A] uppercase font-semibold tracking-wide mb-0.5">IP Address</p>
                  <p className="text-[#09090B] font-mono">{view.ip || view.ipAddress || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[#71717A] uppercase font-semibold tracking-wide mb-0.5">User Agent</p>
                  <p className="text-[#09090B] text-[10px] truncate">{view.userAgent || '—'}</p>
                </div>
              </div>

              {/* Before/After Diff */}
              <div>
                <p className="text-xs text-[#71717A] uppercase font-semibold tracking-wide mb-2">Changes</p>
                <DiffTable before={before} after={after} />
              </div>

              {/* Raw payload (collapsed by default visual cue) */}
              {view.metadata || view.payload ? (
                <details className="border border-[#F0F0F0] rounded-lg">
                  <summary className="px-3 py-2 cursor-pointer text-xs font-semibold text-[#71717A] uppercase">
                    Raw metadata
                  </summary>
                  <pre className="bg-[#0A0A0A] text-[#A7F3D0] text-[11px] p-3 rounded-b-lg overflow-x-auto max-h-[280px]" data-testid="audit-raw-payload">
                    {JSON.stringify(view.metadata || view.payload, null, 2)}
                  </pre>
                </details>
              ) : null}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AuditLog;
