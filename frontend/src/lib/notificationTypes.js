import {
  Bell, FileText, Search, AlertTriangle, CreditCard, Megaphone,
  CheckCircle2, Mail, Sparkles, ShieldAlert,
} from 'lucide-react';

// Notification type → icon + color metadata.
// Used by NotificationsBell (dropdown) and NotificationsPage (full list).
export const NOTIFICATION_TYPE_META = {
  ARTICLE_PUBLISHED:  { icon: FileText,      color: '#1D9E75', bg: '#E1F5EE', label: 'Article published' },
  ARTICLE_SCHEDULED:  { icon: FileText,      color: '#3B82F6', bg: '#DBEAFE', label: 'Article scheduled' },
  ARTICLE_FAILED:     { icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2', label: 'Article failed' },
  AI_SCAN_COMPLETE:   { icon: Search,        color: '#3B82F6', bg: '#DBEAFE', label: 'AI scan complete' },
  AI_SCAN_FAILED:     { icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2', label: 'AI scan failed' },
  SUBSCRIPTION_TRIAL_ENDING: { icon: CreditCard, color: '#F59E0B', bg: '#FEF3C7', label: 'Trial ending' },
  SUBSCRIPTION_RENEWED:      { icon: CreditCard, color: '#1D9E75', bg: '#E1F5EE', label: 'Subscription renewed' },
  SUBSCRIPTION_FAILED:       { icon: CreditCard, color: '#EF4444', bg: '#FEE2E2', label: 'Payment failed' },
  PAYMENT_FAILED:            { icon: CreditCard, color: '#EF4444', bg: '#FEE2E2', label: 'Payment failed' },
  PLAN_LIMIT_REACHED: { icon: ShieldAlert,   color: '#EF4444', bg: '#FEE2E2', label: 'Plan limit reached' },
  ANNOUNCEMENT:       { icon: Megaphone,     color: '#8B5CF6', bg: '#EDE9FE', label: 'Announcement' },
  WORDPRESS_CONNECTED:{ icon: CheckCircle2,  color: '#1D9E75', bg: '#E1F5EE', label: 'WordPress connected' },
  GSC_CONNECTED:      { icon: CheckCircle2,  color: '#1D9E75', bg: '#E1F5EE', label: 'GSC connected' },
  EMAIL:              { icon: Mail,          color: '#3B82F6', bg: '#DBEAFE', label: 'Email' },
  FEATURE:            { icon: Sparkles,      color: '#8B5CF6', bg: '#EDE9FE', label: 'New feature' },
};

export const DEFAULT_NOTIFICATION_META = {
  icon: Bell, color: '#71717A', bg: '#F3F4F6', label: 'Notification',
};

export const metaForNotificationType = (type) =>
  NOTIFICATION_TYPE_META[String(type || '').toUpperCase()] || DEFAULT_NOTIFICATION_META;
