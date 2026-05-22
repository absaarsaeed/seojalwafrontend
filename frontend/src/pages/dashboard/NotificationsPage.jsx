import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { notificationsApi } from '../../lib/api';
import {
  Bell, FileText, Search, AlertTriangle, CreditCard, Megaphone,
  CheckCircle2, Mail, Sparkles, ShieldAlert, MailOpen, Check,
} from 'lucide-react';
import { toast } from 'sonner';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

const TYPE_META = {
  ARTICLE_PUBLISHED:  { icon: FileText,      color: '#1D9E75', bg: '#E1F5EE' },
  ARTICLE_SCHEDULED:  { icon: FileText,      color: '#3B82F6', bg: '#DBEAFE' },
  ARTICLE_FAILED:     { icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2' },
  AI_SCAN_COMPLETE:   { icon: Search,        color: '#3B82F6', bg: '#DBEAFE' },
  AI_SCAN_FAILED:     { icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2' },
  SUBSCRIPTION_TRIAL_ENDING: { icon: CreditCard, color: '#F59E0B', bg: '#FEF3C7' },
  SUBSCRIPTION_RENEWED:      { icon: CreditCard, color: '#1D9E75', bg: '#E1F5EE' },
  SUBSCRIPTION_FAILED:       { icon: CreditCard, color: '#EF4444', bg: '#FEE2E2' },
  PAYMENT_FAILED:            { icon: CreditCard, color: '#EF4444', bg: '#FEE2E2' },
  PLAN_LIMIT_REACHED: { icon: ShieldAlert,   color: '#EF4444', bg: '#FEE2E2' },
  ANNOUNCEMENT:       { icon: Megaphone,     color: '#8B5CF6', bg: '#EDE9FE' },
  WORDPRESS_CONNECTED:{ icon: CheckCircle2,  color: '#1D9E75', bg: '#E1F5EE' },
  GSC_CONNECTED:      { icon: CheckCircle2,  color: '#1D9E75', bg: '#E1F5EE' },
  EMAIL:              { icon: Mail,          color: '#3B82F6', bg: '#DBEAFE' },
  FEATURE:            { icon: Sparkles,      color: '#8B5CF6', bg: '#EDE9FE' },
};
const DEFAULT_META = { icon: Bell, color: '#71717A', bg: '#F3F4F6' };
const metaForType = (type) => TYPE_META[String(type || '').toUpperCase()] || DEFAULT_META;

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list({ limit: 50 });
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleClick = async (n) => {
    if (!n?.read && n?.id) {
      try { await notificationsApi.markRead(n.id); } catch {}
    }
    if (n?.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error(err?.message || 'Could not mark all');
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      data-testid="notifications-page"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Notifications</h1>
          <p className="text-sm text-[#6B7280]">All your alerts and updates in one place.</p>
        </div>
        <Button variant="outline" onClick={handleMarkAll} className="border-[#F0F0F0]" data-testid="mark-all-read-btn">
          <Check size={14} className="mr-2" />Mark all as read
        </Button>
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0]">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#6B7280]" data-testid="notifications-loading">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center" data-testid="notifications-empty-state">
            <MailOpen size={32} className="mx-auto mb-3 text-[#D1D5DB]" />
            <p className="text-[#0A0A0A] font-medium">You're all caught up.</p>
            <p className="text-sm text-[#6B7280] mt-1">New activity from your sites will show up here.</p>
          </div>
        ) : (
          items.map((n) => {
            const meta = metaForType(n.type || n.kind || n.category);
            const Icon = meta.icon;
            return (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left flex items-start gap-3 p-4 hover:bg-[#F9FAFB] border-b border-[#F0F0F0] last:border-b-0 ${n.read ? '' : 'bg-[#E1F5EE]/20'}`}
              data-testid={`notification-row-${n.id}`}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: meta.bg }}
                data-testid={`notification-row-icon-${(n.type || 'default').toLowerCase()}`}
              >
                <Icon size={16} style={{ color: meta.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[#0A0A0A]">{n.title || n.subject}</p>
                  <span className="text-xs text-[#9CA3AF] flex-shrink-0">{timeAgo(n.createdAt || n.date)}</span>
                </div>
                {n.message && <p className="text-sm text-[#6B7280] mt-1">{n.message}</p>}
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-[#1D9E75] mt-2 flex-shrink-0" />}
            </button>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
};

export default NotificationsPage;
