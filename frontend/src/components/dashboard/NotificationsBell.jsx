import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell, FileText, Search, AlertTriangle, CreditCard, Megaphone,
  CheckCircle2, Mail, Sparkles, ShieldAlert, MailOpen,
} from 'lucide-react';
import { notificationsApi } from '../../lib/api';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

const timeAgo = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
};

// Type → { icon, color (icon stroke), bg (badge), label }
const TYPE_META = {
  ARTICLE_PUBLISHED:  { icon: FileText,      color: '#1D9E75', bg: '#E1F5EE', label: 'Article published' },
  ARTICLE_SCHEDULED:  { icon: FileText,      color: '#3B82F6', bg: '#DBEAFE', label: 'Article scheduled' },
  ARTICLE_FAILED:     { icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2', label: 'Article failed' },
  AI_SCAN_COMPLETE:   { icon: Search,        color: '#3B82F6', bg: '#DBEAFE', label: 'AI scan complete' },
  AI_SCAN_FAILED:     { icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2', label: 'AI scan failed' },
  SUBSCRIPTION_TRIAL_ENDING: { icon: CreditCard,  color: '#F59E0B', bg: '#FEF3C7', label: 'Trial ending' },
  SUBSCRIPTION_RENEWED:      { icon: CreditCard,  color: '#1D9E75', bg: '#E1F5EE', label: 'Subscription renewed' },
  SUBSCRIPTION_FAILED:       { icon: CreditCard,  color: '#EF4444', bg: '#FEE2E2', label: 'Payment failed' },
  PAYMENT_FAILED:            { icon: CreditCard,  color: '#EF4444', bg: '#FEE2E2', label: 'Payment failed' },
  PLAN_LIMIT_REACHED: { icon: ShieldAlert,   color: '#EF4444', bg: '#FEE2E2', label: 'Plan limit reached' },
  ANNOUNCEMENT:       { icon: Megaphone,     color: '#8B5CF6', bg: '#EDE9FE', label: 'Announcement' },
  WORDPRESS_CONNECTED:{ icon: CheckCircle2,  color: '#1D9E75', bg: '#E1F5EE', label: 'WordPress connected' },
  GSC_CONNECTED:      { icon: CheckCircle2,  color: '#1D9E75', bg: '#E1F5EE', label: 'GSC connected' },
  EMAIL:              { icon: Mail,          color: '#3B82F6', bg: '#DBEAFE', label: 'Email' },
  FEATURE:            { icon: Sparkles,      color: '#8B5CF6', bg: '#EDE9FE', label: 'New feature' },
};

const DEFAULT_META = { icon: Bell, color: '#71717A', bg: '#F3F4F6', label: 'Notification' };

const metaForType = (type) => {
  if (!type) return DEFAULT_META;
  return TYPE_META[String(type).toUpperCase()] || DEFAULT_META;
};

/**
 * Bell + dropdown wired to /api/notifications. Polls unread count every 60s.
 * Notifications get type-specific colored icons (ARTICLE_PUBLISHED -> green doc,
 * AI_SCAN_COMPLETE -> blue search, etc.). Falls back gracefully when the
 * endpoint is missing.
 */
export const NotificationsBell = () => {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pollRef = useRef(null);

  const refreshCount = async () => {
    try {
      const data = await notificationsApi.unreadCount();
      const c = typeof data === 'number' ? data : (data?.count ?? data?.unread ?? 0);
      setUnread(c || 0);
    } catch {
      // ignore — bell renders without badge
    }
  };

  useEffect(() => {
    refreshCount();
    pollRef.current = setInterval(refreshCount, 60000);
    return () => clearInterval(pollRef.current);
  }, []);

  const loadList = async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list({ limit: 10 });
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next) => {
    setOpen(next);
    if (next) loadList();
  };

  const handleClickItem = async (n) => {
    // Optimistic mark-read
    if (!n?.read && n?.id) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      try { await notificationsApi.markRead(n.id); } catch {}
    }
    setOpen(false);
    if (n?.link) navigate(n.link);
    refreshCount();
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try { await notificationsApi.markAllRead(); } catch {}
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          aria-label="Notifications"
          data-testid="notifications-bell"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#EF4444] text-white text-[10px] font-semibold rounded-full flex items-center justify-center"
              data-testid="notifications-badge"
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" data-testid="notifications-dropdown">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
          <h4 className="font-semibold text-[#0A0A0A] text-sm">Notifications</h4>
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-[11px] text-[#1D9E75] hover:underline"
              data-testid="notifications-mark-all-read"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-[#6B7280]" data-testid="notifications-loading">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#6B7280]" data-testid="notifications-empty">
              <MailOpen size={24} className="mx-auto mb-2 text-[#D1D5DB]" />
              You&rsquo;re all caught up.
            </div>
          ) : (
            items.map((n) => {
              const meta = metaForType(n.type || n.kind || n.category);
              const Icon = meta.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => handleClickItem(n)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-[#F9FAFB] border-b border-[#F0F0F0] last:border-b-0 ${n.read ? '' : 'bg-[#E1F5EE]/30'}`}
                  data-testid={`notification-item-${n.id}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: meta.bg }}
                    data-testid={`notification-icon-${(n.type || 'default').toLowerCase()}`}
                  >
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#0A0A0A] truncate">{n.title || n.subject || meta.label}</p>
                    {n.message && <p className="text-[11px] text-[#6B7280] line-clamp-2">{n.message}</p>}
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{timeAgo(n.createdAt || n.date)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#1D9E75] mt-1.5" data-testid="notification-unread-dot" />}
                </button>
              );
            })
          )}
        </div>
        <div className="p-2 border-t border-[#F0F0F0] text-center">
          <Link to="/dashboard/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="text-[#1D9E75] hover:bg-[#E1F5EE] w-full" data-testid="notifications-view-all">
              View all →
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsBell;
