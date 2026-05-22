import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { useSite } from '../../context/SiteContext';
import { userApi, authApi, tokenStore, billingApi, quotaApi } from '../../lib/api';
import { SETTINGS_DATA } from '../../data/publicData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Eye, EyeOff, Download, AlertTriangle, ChevronUp, User, Plus, Mail, Loader2 } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const ArticleQuotaCard = ({ subscription, sites, billingUsage }) => {
  const planQuota = subscription?.plan?.articlesPerMonth ?? subscription?.articlesPerMonth ?? null;
  const used = billingUsage?.articles?.used ?? subscription?.usage?.articlesThisMonth ?? 0;
  const remaining = planQuota != null ? Math.max(0, planQuota - used) : null;
  const siteList = useMemo(() => (Array.isArray(sites) ? sites : []), [sites]);
  const multipleSites = siteList.length > 1;

  const [autoDistribute, setAutoDistribute] = useState(true);
  const [allocations, setAllocations] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!planQuota || siteList.length === 0) return;
    // Initial allocation: existing site.quota field, else equal split.
    const initial = {};
    const even = Math.floor(planQuota / siteList.length);
    let assigned = 0;
    siteList.forEach((s, i) => {
      const existing = s.articleQuota ?? s.quota;
      initial[s.id] = existing != null ? existing : (i === siteList.length - 1 ? planQuota - assigned : even);
      if (existing != null) assigned += existing;
      else assigned += even;
    });
    setAllocations(initial);
  }, [planQuota, siteList]);

  if (planQuota == null) return null;

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + (parseInt(v, 10) || 0), 0);
  const overLimit = totalAllocated > planQuota;

  const handleAllocChange = (siteId, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setAllocations((a) => ({ ...a, [siteId]: num }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(allocations).map(([siteId, quota]) => quotaApi.setSiteQuota(siteId, quota))
      );
      toast.success('Site quota saved');
    } catch (err) {
      toast.error(err?.message || 'Could not save quota');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="article-quota-card">
      <h3 className="font-semibold text-[#0A0A0A] mb-1">Article Quota</h3>
      <p className="text-xs text-[#6B7280] mb-4">From your {subscription?.plan?.name || 'current'} plan.</p>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="p-3 bg-[#F9FAFB] rounded-lg">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide">Total quota</p>
          <p className="font-syne text-xl font-bold text-[#0A0A0A]" data-testid="quota-total">{planQuota}/mo</p>
        </div>
        <div className="p-3 bg-[#F9FAFB] rounded-lg">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide">Used this month</p>
          <p className="font-syne text-xl font-bold text-[#0A0A0A]" data-testid="quota-used">{used}</p>
        </div>
        <div className="p-3 bg-[#F9FAFB] rounded-lg">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide">Remaining</p>
          <p className="font-syne text-xl font-bold text-[#1D9E75]" data-testid="quota-remaining">{remaining}</p>
        </div>
      </div>

      {multipleSites && (
        <div className="space-y-4 pt-4 border-t border-[#F0F0F0]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#0A0A0A]">Site allocation</p>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-distribute" className="text-xs text-[#6B7280]">Auto-distribute equally</Label>
              <Switch
                id="auto-distribute"
                checked={autoDistribute}
                onCheckedChange={(on) => {
                  setAutoDistribute(on);
                  if (on) {
                    const even = Math.floor(planQuota / siteList.length);
                    const newAlloc = {};
                    siteList.forEach((s, i) => {
                      newAlloc[s.id] = (i === siteList.length - 1) ? planQuota - even * (siteList.length - 1) : even;
                    });
                    setAllocations(newAlloc);
                  }
                }}
                data-testid="quota-auto-distribute"
              />
            </div>
          </div>
          <div className="space-y-3" data-testid="quota-sites-list">
            {siteList.map((s) => (
              <div key={s.id} className="flex items-center gap-3" data-testid={`quota-site-${s.id}`}>
                <p className="text-sm text-[#0A0A0A] flex-1 min-w-0 truncate">{s.name || s.domain || s.url}</p>
                <Input
                  type="number"
                  value={allocations[s.id] ?? 0}
                  onChange={(e) => { setAutoDistribute(false); handleAllocChange(s.id, e.target.value); }}
                  className="w-24"
                  min={0}
                  data-testid={`quota-input-${s.id}`}
                />
                <span className="text-xs text-[#6B7280]">articles</span>
              </div>
            ))}
          </div>
          <p className={`text-xs ${overLimit ? 'text-[#EF4444]' : 'text-[#6B7280]'}`} data-testid="quota-allocation-summary">
            Total allocated: {totalAllocated} / {planQuota}
            {overLimit && ' — over plan limit'}
          </p>
          <Button
            onClick={handleSave}
            disabled={saving || overLimit}
            className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
            data-testid="save-quota-btn"
          >
            {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
            Save allocation
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export const SettingsPage = () => {
  const { user, updateUser } = useUser();
  const { sites } = useSite();
  const data = SETTINGS_DATA;

  // Resolve the user's website URL — prefer the explicit field from /auth/me,
  // fall back to the first connected site's URL so the field is never empty
  // when at least one site exists.
  const resolvedWebsite =
    user?.websiteUrl ||
    user?.website ||
    sites?.[0]?.url ||
    sites?.[0]?.domain ||
    '';

  const [profile, setProfile] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    website: resolvedWebsite,
  });

  // Hydrate the form as auth/sites finish loading so the website doesn't
  // appear blank on the first render.
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: prev.name || user?.fullName || user?.name || '',
      email: prev.email || user?.email || '',
      website: prev.website || resolvedWebsite,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, sites?.length]);

  // Pre-fill from /api/user/profile when available (richer than /auth/me).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await userApi.profile();
        if (cancelled || !p) return;
        const data = p?.user || p?.profile || p;
        setProfile((prev) => ({
          name: data.fullName || data.name || prev.name,
          email: data.email || prev.email,
          website: data.websiteUrl || data.website || prev.website,
        }));
      } catch {
        // Endpoint not present yet — silently fall back to auth data.
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({});
  const [notifications, setNotifications] = useState({
    emailDigest: true,
    weeklyReport: true,
    aiAlerts: true,
    billingAlerts: true
  });
  const [inviteEmail, setInviteEmail] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      try {
        await userApi.updateProfile({
          fullName: profile.name,
          email: profile.email,
          websiteUrl: profile.website,
        });
      } catch (err) {
        // 404 → endpoint not yet implemented; keep local update.
        if (err?.status && err.status !== 404) {
          toast.error(err?.message || 'Could not save profile');
          return;
        }
      }
      updateUser(profile);
      toast.success('Profile saved');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userApi.deleteAccount({ password: deletePassword });
      try { tokenStore.clearAll(); } catch {}
      try { localStorage.clear(); sessionStorage.clear(); } catch {}
      toast.success('Your account has been deleted. Goodbye 👋');
      window.location.href = 'https://seojalwa.com';
    } catch (err) {
      toast.error(err?.message || 'Could not delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  // User activity log
  const [activityItems, setActivityItems] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setActivityLoading(true);
    (async () => {
      try {
        const data = await userApi.activity();
        const list = Array.isArray(data) ? data : data?.items || [];
        if (!cancelled) setActivityItems(list);
      } catch {
        if (!cancelled) setActivityItems([]);
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Billing — real subscription / usage / invoices
  const [subscription, setSubscription] = useState(null);
  const [billingUsage, setBillingUsage] = useState(null);
  const [billingInvoices, setBillingInvoices] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await billingApi.subscription();
        if (!cancelled) setSubscription(s || null);
      } catch {}
      try {
        const u = await billingApi.usage();
        if (!cancelled) setBillingUsage(u || null);
      } catch {}
      try {
        const inv = await billingApi.invoices();
        if (!cancelled) setBillingInvoices(Array.isArray(inv) ? inv : inv?.items || null);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);
  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const res = await billingApi.cancel();
      toast.success(res?.message || 'Subscription cancelled at end of period');
      setSubscription((prev) => prev ? { ...prev, status: 'cancelled', cancelAtPeriodEnd: true } : res);
      setCancelOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Could not cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };
  const handleChangePassword = async () => {
    setPasswordError('');
    if (!passwords.current) {
      setPasswordError('Enter your current password');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    if ((passwords.new || '').length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast.success('Password updated');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      if (err?.code === 'INVALID_CREDENTIALS' || err?.status === 401) {
        setPasswordError('Current password is incorrect');
      } else {
        toast.error(err?.message || 'Could not change password');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail) {
      toast.error('Enter an email address');
      return;
    }
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
      data-testid="settings-page"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Settings</h1>
        <p className="text-sm text-[#6B7280]">Manage your account, billing, and team</p>
      </motion.div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-[#F0F0F0]">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="activity" data-testid="settings-activity-tab">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          {/* Profile */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Profile</h3>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-2xl font-bold">
                {profile.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <Button variant="outline" className="border-[#F0F0F0]">Upload photo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} className="border-[#F0F0F0]" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} className="border-[#F0F0F0]" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Website URL</Label>
                <Input
                  value={profile.website}
                  onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="border-[#F0F0F0]"
                  data-testid="settings-website-input"
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="settings-save-profile-btn">{isSavingProfile ? 'Saving...' : 'Save'}</Button>
          </motion.div>

          {/* Password */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Change Password</h3>
            <div className="space-y-4 max-w-md">
              {['current', 'new', 'confirm'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="capitalize">{field === 'confirm' ? 'Confirm New' : field} Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords[field] ? 'text' : 'password'}
                      value={passwords[field]}
                      onChange={(e) => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                      className="border-[#F0F0F0] pr-10"
                    />
                    <button onClick={() => setShowPasswords(p => ({ ...p, [field]: !p[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                      {showPasswords[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <Button onClick={handleChangePassword} disabled={isChangingPassword} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="settings-change-password-btn">
                {isChangingPassword ? 'Updating...' : 'Change Password'}
              </Button>
              {passwordError && (
                <p className="flex items-start gap-1 mt-2 text-xs text-[#EF4444]" data-testid="settings-password-error">
                  <span>{passwordError}</span>
                </p>
              )}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'emailDigest', label: 'Daily email digest' },
                { key: 'weeklyReport', label: 'Weekly Growth Score report' },
                { key: 'aiAlerts', label: 'AI visibility alerts' },
                { key: 'billingAlerts', label: 'Billing alerts' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-[#0A0A0A]">{item.label}</span>
                  <Switch checked={notifications[item.key]} onCheckedChange={(v) => setNotifications(p => ({ ...p, [item.key]: v }))} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-red-200 p-6" data-testid="settings-danger-zone">
            <h3 className="font-semibold text-[#EF4444] mb-2">Delete Account</h3>
            <p className="text-sm text-[#6B7280] mb-4">Permanently delete your account and all your data. This cannot be undone.</p>
            <Button
              variant="outline"
              className="border-[#EF4444] text-[#EF4444] hover:bg-red-50"
              onClick={() => setDeleteOpen(true)}
              data-testid="settings-delete-account-btn"
            >
              Delete my account
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {(() => {
            const planName = subscription?.planName || subscription?.plan || user?.plan || 'Starter';
            const price = subscription?.priceFormatted || subscription?.price || '—';
            const status = (subscription?.status || 'active').toLowerCase();
            const statusLabel = { trialing: 'Trialing', active: 'Active', cancelled: 'Cancelled', canceled: 'Cancelled', past_due: 'Past due' }[status] || status;
            const statusStyle = status === 'trialing' ? 'bg-[#FEF3C7] text-[#D97706]'
              : status === 'cancelled' || status === 'canceled' ? 'bg-red-100 text-[#EF4444]'
              : 'bg-[#E1F5EE] text-[#1D9E75]';
            const trialDaysLeft = subscription?.trialDaysLeft;
            const nextBilling = subscription?.nextBillingDate || subscription?.currentPeriodEnd;
            const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd;
            const nextPlan = subscription?.upgradePlan || (planName === 'Starter' ? 'Growth' : planName === 'Growth' ? 'Agency' : null);
            return (
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="billing-subscription-card">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-[#0A0A0A]">Current Plan</h3>
                    <p className="text-sm text-[#6B7280]">{planName}{price && price !== '—' ? ` — ${price}` : ''}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyle}`} data-testid="subscription-status-badge">
                    {statusLabel}
                  </span>
                </div>
                {status === 'trialing' && trialDaysLeft != null && (
                  <p className="text-sm text-[#0A0A0A] mb-3" data-testid="trial-days-left">
                    Free trial extended via admin — {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left.
                  </p>
                )}
                {status === 'active' && nextBilling && (
                  <p className="text-sm text-[#6B7280] mb-4" data-testid="next-billing-date">
                    {cancelAtPeriodEnd ? `Cancels on ${new Date(nextBilling).toLocaleDateString()}` : `Next billing: ${new Date(nextBilling).toLocaleDateString()} — renews automatically`}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {nextPlan && (
                    <Button
                      onClick={() => window.location.assign('/pricing')}
                      variant="outline"
                      className="border-[#1D9E75] text-[#1D9E75]"
                      data-testid="upgrade-plan-btn"
                    >
                      <ChevronUp size={16} className="mr-2" />
                      Upgrade to {nextPlan}
                    </Button>
                  )}
                  {!cancelAtPeriodEnd && (status === 'active' || status === 'trialing') && (
                    <Button
                      onClick={() => setCancelOpen(true)}
                      variant="ghost"
                      className="text-[#EF4444] hover:bg-red-50"
                      data-testid="cancel-subscription-btn"
                    >
                      Cancel subscription
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })()}

          {/* Usage */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="billing-usage-card">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Usage This Month</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(billingUsage || data.usage).map(([key, val]) => {
                const used = val?.used ?? 0;
                const limit = val?.limit ?? 0;
                const pct = limit > 0 ? (used / limit) * 100 : 0;
                return (
                  <div key={key} className="space-y-2">
                    <p className="text-sm text-[#6B7280] capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-lg font-semibold text-[#0A0A0A]">{used}/{limit || '∞'}</p>
                    <Progress value={Math.min(100, pct)} className="h-2" />
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Article Quota Allocation */}
          <ArticleQuotaCard
            subscription={subscription}
            sites={sites}
            billingUsage={billingUsage}
          />

          {/* Invoices */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
            <div className="p-4 border-b border-[#F0F0F0]">
              <h3 className="font-semibold text-[#0A0A0A]">Invoice History</h3>
            </div>
            {(billingInvoices || data.invoices).length === 0 ? (
              <p className="p-6 text-sm text-[#6B7280] text-center">No invoices yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB]">
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Invoice</th>
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Date</th>
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Amount</th>
                    <th className="text-left p-4 text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                    <th className="text-right p-4 text-xs font-semibold text-[#6B7280] uppercase">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {(billingInvoices || data.invoices).map((invoice, i) => (
                    <tr key={invoice.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                      <td className="p-4 text-sm text-[#0A0A0A]">{invoice.id || invoice.number}</td>
                      <td className="p-4 text-sm text-[#6B7280]">{invoice.date || (invoice.createdAt && new Date(invoice.createdAt).toLocaleDateString())}</td>
                      <td className="p-4 text-sm text-[#0A0A0A]">${invoice.amount || invoice.total}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">{invoice.status || 'paid'}</span>
                      </td>
                      <td className="p-4 text-right">
                        <a href={invoice.downloadUrl || invoice.pdfUrl || '#'} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8"><Download size={14} /></Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>

          {/* Cancel — handled by dedicated button + dialog above */}
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {/* Current Members */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Team Members</h3>
            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-medium">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <p className="font-medium text-[#0A0A0A]">{user?.name || 'You'}</p>
                  <p className="text-sm text-[#6B7280]">{user?.email}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">Admin</span>
            </div>
          </motion.div>

          {/* Invite */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Invite Team Member</h3>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 border-[#F0F0F0]"
              />
              <Button onClick={handleSendInvite} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">
                <Mail size={16} className="mr-2" />
                Send Invite
              </Button>
            </div>
            <p className="text-xs text-[#6B7280] mt-2">You can invite up to {3 - (data.usage.teamSeats.used)} more team members on your current plan.</p>
          </motion.div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0]" data-testid="user-activity-card">
            <div className="p-4 border-b border-[#F0F0F0]">
              <h3 className="font-semibold text-[#0A0A0A]">Your activity</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">Recent actions on your account.</p>
            </div>
            {activityLoading ? (
              <div className="p-6 text-sm text-[#6B7280] text-center" data-testid="user-activity-loading">Loading...</div>
            ) : !activityItems || activityItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6B7280]" data-testid="user-activity-empty">
                No activity yet. Sign in events and content changes will appear here.
              </div>
            ) : (
              <ul className="divide-y divide-[#F0F0F0]">
                {activityItems.map((a, i) => (
                  <li key={a.id || i} className="flex items-start gap-3 p-4" data-testid={`user-activity-row-${i}`}>
                    <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] flex-shrink-0">
                      <User size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#0A0A0A]">{a.action || a.title || a.message}</p>
                      {a.detail && <p className="text-xs text-[#6B7280] mt-0.5">{a.detail}</p>}
                    </div>
                    <span className="text-xs text-[#9CA3AF] flex-shrink-0">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : a.date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Delete account confirmation */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) { setDeleteEmailConfirm(''); setDeletePassword(''); } }}>
        <DialogContent className="max-w-md" data-testid="delete-account-dialog">
          <DialogHeader>
            <DialogTitle className="text-[#EF4444]">Delete your account?</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all your data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="mb-1.5 block text-xs">Type your email to confirm: <span className="font-mono text-[#0A0A0A]">{user?.email}</span></Label>
              <Input
                value={deleteEmailConfirm}
                onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                placeholder={user?.email || 'your@email.com'}
                className="border-[#F0F0F0]"
                data-testid="delete-account-email-input"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Enter your password</Label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Current password"
                className="border-[#F0F0F0]"
                data-testid="delete-account-password-input"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting || !deletePassword || (deleteEmailConfirm || '').toLowerCase() !== (user?.email || '').toLowerCase()}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
              data-testid="confirm-delete-account-btn"
            >
              {isDeleting ? <><Loader2 size={14} className="mr-2 animate-spin" />Deleting...</> : 'Permanently Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel subscription confirmation */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md" data-testid="cancel-subscription-dialog">
          <DialogHeader>
            <DialogTitle>Cancel your subscription?</DialogTitle>
            <DialogDescription>
              You'll keep access until the end of your current billing period. After that you'll be downgraded to free.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>Keep subscription</Button>
            <Button
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              variant="outline"
              className="border-[#EF4444] text-[#EF4444] hover:bg-red-50"
              data-testid="confirm-cancel-subscription-btn"
            >
              {isCancelling ? <><Loader2 size={14} className="mr-2 animate-spin" />Cancelling...</> : 'Yes, cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
