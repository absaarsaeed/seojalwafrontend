import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FormSkeleton, ChartSkeleton } from '../components/SkeletonLoaders';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Instagram, Linkedin, FileText, Calendar, Trash2, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/api';

const PlanBadge = ({ plan }) => {
  const planName = typeof plan === 'object' && plan ? (plan.name || plan.id || 'Free') : (plan || 'Free');
  const colors = {
    Starter: 'bg-[#2563EB]/10 text-[#2563EB]',
    Growth: 'bg-[#1D9E75]/10 text-[#1D9E75]',
    Agency: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    Free: 'bg-[#71717A]/10 text-[#71717A]'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[planName] || colors.Free}`} data-testid="user-plan-badge">
      {planName}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  const colors = {
    active: 'bg-[#1D9E75]/10 text-[#1D9E75]',
    trialing: 'bg-[#2563EB]/10 text-[#2563EB]',
    cancelled: 'bg-[#EF4444]/10 text-[#EF4444]',
    paused: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    free: 'bg-[#71717A]/10 text-[#71717A]',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] || colors.free}`} data-testid="user-subscription-status">
      {status || 'Free'}
    </span>
  );
};

const integrationIcons = {
  WordPress: Globe,
  wordpress: Globe,
  Shopify: Globe,
  shopify: Globe,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  Notion: FileText,
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
};

const UsageBar = ({ label, used, limit }) => {
  const u = Number(used ?? 0);
  const l = Number(limit ?? 0);
  const pct = l > 0 ? Math.min(100, (u / l) * 100) : 0;
  const text = l > 0 ? `${u} / ${l}` : `${u}`;
  return (
    <div className="p-4 border border-[#F0F0F0] rounded-lg" data-testid={`usage-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <p className="text-xs text-[#71717A] uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-xl font-bold text-[#09090B]">{text}</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
};

export const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activityLog, setActivityLog] = useState(null);

  // Load real user data
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await adminApi.user(id);
        if (cancelled) return;
        setUser(data);
        const planName = data?.subscription?.plan?.name || data?.plan;
        if (planName) setSelectedPlan(typeof planName === 'string' ? planName : planName.name || '');
        if (data?.adminNote || data?.note) setNote(data.adminNote || data.note);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Could not load user');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Load real activity log
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.userActivityLog(id, { limit: 50 });
        const list = Array.isArray(data) ? data : data?.items || [];
        if (!cancelled) setActivityLog(list);
      } catch {
        if (!cancelled) setActivityLog([]);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const res = await adminApi.deleteUser(id);
      const cascaded = res?.cascadedDeletes || res?.cascaded || {};
      const summary = Object.entries(cascaded).map(([k, v]) => `${v} ${k}`).join(', ');
      toast.success(`User deleted${summary ? ` — also removed ${summary}` : ''}`);
      setDeleteOpen(false);
      navigate('/adminpanel/users', { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async () => {
    const currentStatus = (user?.status || user?.account?.status || '').toLowerCase();
    const next = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminApi.updateUserStatus(id, { status: next });
      setUser((u) => ({ ...u, status: next }));
      toast.success(`User ${next === 'active' ? 'activated' : 'suspended'}`);
    } catch (err) {
      toast.error(err?.message || 'Could not update status');
    }
  };

  const handleSaveNote = async () => {
    try {
      await adminApi.addUserNote(id, note);
      toast.success('Note saved');
    } catch (err) {
      toast.error(err?.message || 'Could not save note');
    }
  };

  const handleExtendTrial = async () => {
    try {
      await adminApi.extendTrial(id, 7);
      toast.success('Trial extended by 7 days');
    } catch (err) {
      toast.error(err?.message || 'Could not extend trial');
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;
    try {
      await adminApi.updateUserSubscription(id, { plan: selectedPlan });
      toast.success(`Plan updated to ${selectedPlan}`);
    } catch (err) {
      toast.error(err?.message || 'Could not update plan');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="user-profile-loading">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FormSkeleton fields={6} />
          <div className="lg:col-span-2"><ChartSkeleton height={400} /></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6" data-testid="user-profile-error">
        <Link to="/adminpanel/users" className="inline-flex items-center gap-2 text-sm text-[#71717A] hover:text-[#09090B]" data-testid="back-to-users">
          <ArrowLeft size={16} /> Back to users
        </Link>
        <div className="admin-card p-12 text-center">
          <p className="text-lg font-medium text-[#09090B] mb-2">User not found</p>
          <p className="text-sm text-[#71717A]">{error || `No user exists with ID ${id}.`}</p>
        </div>
      </div>
    );
  }

  // Normalize fields across possible API shapes.
  const fullName = user.fullName || user.name || user.email?.split('@')[0] || 'Unknown';
  const email = user.email || '';
  const createdAt = user.createdAt || user.created_at || user.signupDate;
  const profilePhoto = user.profilePhoto || user.avatar;
  const subscription = user.subscription || {};
  const plan = subscription.plan || user.plan;
  const planName = typeof plan === 'object' && plan ? (plan.name || plan.id) : plan;
  const status = (user.status || user.account?.status || 'Active');
  const isActive = (status || '').toLowerCase() === 'active';
  const subStatus = subscription.status || (plan ? 'active' : 'free');
  const monthlyPrice = subscription.plan?.monthlyPrice ?? subscription.monthlyPrice;
  const nextBillingDate = subscription.currentPeriodEnd || subscription.nextBillingDate;
  const usage = user.usage || {};
  const stats = user.stats || {};
  const sites = Array.isArray(user.sites) ? user.sites : [];
  const billingHistory = Array.isArray(user.billingHistory) ? user.billingHistory : Array.isArray(user.invoices) ? user.invoices : [];
  const paymentMethod = user.paymentMethod || subscription.paymentMethod;
  const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6" data-testid="user-profile-page">
      <Link to="/adminpanel/users" className="inline-flex items-center gap-2 text-sm text-[#71717A] hover:text-[#09090B] transition-colors" data-testid="back-to-users">
        <ArrowLeft size={16} />
        Back to users
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card p-6">
            <div className="flex flex-col items-center text-center mb-6">
              {profilePhoto ? (
                <img src={profilePhoto} alt={fullName} className="w-20 h-20 rounded-full object-cover mb-3" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1D9E75] flex items-center justify-center mb-3">
                  <span className="text-white text-2xl font-bold">{initials}</span>
                </div>
              )}
              <h2 className="text-lg font-semibold text-[#09090B]" data-testid="user-full-name">{fullName}</h2>
              <p className="text-sm text-[#71717A]" data-testid="user-email">{email}</p>
              <p className="text-xs text-[#71717A] mt-1">Signed up: {formatDate(createdAt)}</p>
              <div className="mt-3 flex items-center gap-2">
                <PlanBadge plan={planName || 'Free'} />
                <StatusBadge status={subStatus} />
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-[#F0F0F0]">
              <span className="text-sm font-medium text-[#27272A]">Account Status</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isActive ? 'text-[#1D9E75]' : 'text-[#EF4444]'}`}>
                  {isActive ? 'Active' : 'Suspended'}
                </span>
                <Switch
                  checked={isActive}
                  onCheckedChange={handleStatusToggle}
                  data-testid="user-status-toggle"
                />
              </div>
            </div>

            {stats.growthScore != null && (
              <div className="py-4 border-t border-[#F0F0F0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#27272A]">Growth Score</span>
                  <span className="text-lg font-bold text-[#1D9E75]" data-testid="user-growth-score">{stats.growthScore}/100</span>
                </div>
                <Progress value={stats.growthScore} className="h-2" />
              </div>
            )}

            <div className="py-4 border-t border-red-200">
              <Button
                onClick={() => setDeleteOpen(true)}
                variant="outline"
                className="w-full border-[#EF4444] text-[#EF4444] hover:bg-red-50"
                data-testid="admin-delete-user-btn"
              >
                <Trash2 size={14} className="mr-2" />
                Delete user (cascade)
              </Button>
            </div>

            <div className="py-4 border-t border-[#F0F0F0]">
              <span className="text-sm font-medium text-[#27272A] block mb-3">Connected Integrations</span>
              {sites.length === 0 ? (
                <p className="text-xs text-[#71717A]">No integrations connected.</p>
              ) : (
                <div className="flex flex-wrap gap-2" data-testid="user-integrations">
                  {sites.map((s) => {
                    const platform = s.platform || 'WordPress';
                    const Icon = integrationIcons[platform] || Globe;
                    return (
                      <div key={s.id || s.url} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F0F0] rounded-full text-sm text-[#27272A]">
                        <Icon size={14} />
                        {s.name || s.domain || platform}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="py-4 border-t border-[#F0F0F0]">
              <span className="text-sm font-medium text-[#27272A] block mb-2">Internal Notes</span>
              <Textarea
                placeholder="Add a note about this user..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="admin-input min-h-[100px]"
                data-testid="user-notes-textarea"
              />
              <Button onClick={handleSaveNote} className="admin-btn-primary mt-3 w-full" data-testid="save-note-btn">
                Save Note
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3">
          <div className="admin-card">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start border-b border-[#F0F0F0] rounded-none bg-transparent p-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1D9E75] data-[state=active]:bg-transparent" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="usage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1D9E75] data-[state=active]:bg-transparent" data-testid="tab-usage">Usage</TabsTrigger>
                <TabsTrigger value="billing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1D9E75] data-[state=active]:bg-transparent" data-testid="tab-billing">Billing</TabsTrigger>
                <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1D9E75] data-[state=active]:bg-transparent" data-testid="tab-activity">Activity Log</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="p-5">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg">
                    <div>
                      <p className="text-xs text-[#71717A] uppercase tracking-wide">Current Plan</p>
                      <p className="text-lg font-semibold text-[#09090B]" data-testid="overview-plan-name">{planName || 'Free'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#71717A] uppercase tracking-wide">Next Billing</p>
                      <p className="text-sm font-medium text-[#09090B] flex items-center gap-1 justify-end">
                        <Calendar size={14} />
                        {formatDate(nextBillingDate)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <UsageBar label="Articles" used={usage.articlesThisMonth} limit={subscription.plan?.articlesPerMonth} />
                    <UsageBar label="Social Posts" used={usage.socialPostsThisMonth} limit={subscription.plan?.socialPostsPerMonth} />
                    <UsageBar label="AI Scans" used={usage.aiScansThisMonth} limit={subscription.plan?.aiScansPerMonth} />
                    <UsageBar label="Team Seats" used={usage.teamSeatsUsed} limit={subscription.plan?.teamSeats} />
                  </div>
                </div>
              </TabsContent>

              {/* Usage Tab */}
              <TabsContent value="usage" className="p-5">
                <h4 className="text-sm font-semibold text-[#09090B] mb-4">Usage Limits</h4>
                <div className="space-y-4">
                  <UsageBar label="Articles This Month" used={usage.articlesThisMonth} limit={subscription.plan?.articlesPerMonth} />
                  <UsageBar label="Social Posts This Month" used={usage.socialPostsThisMonth} limit={subscription.plan?.socialPostsPerMonth} />
                  <UsageBar label="AI Scans This Month" used={usage.aiScansThisMonth} limit={subscription.plan?.aiScansPerMonth} />
                  <UsageBar label="Team Seats Used" used={usage.teamSeatsUsed} limit={subscription.plan?.teamSeats} />
                </div>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="p-5">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#FAFAFA] rounded-lg">
                      <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Plan</p>
                      <p className="text-lg font-semibold text-[#09090B]" data-testid="billing-plan-name">{planName || 'Free'}</p>
                    </div>
                    <div className="p-4 bg-[#FAFAFA] rounded-lg">
                      <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Monthly Price</p>
                      <p className="text-lg font-semibold text-[#09090B]" data-testid="billing-monthly-price">
                        {monthlyPrice != null ? `$${monthlyPrice}` : '—'}
                      </p>
                    </div>
                    <div className="p-4 bg-[#FAFAFA] rounded-lg">
                      <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Status</p>
                      <StatusBadge status={subStatus} />
                    </div>
                    <div className="p-4 bg-[#FAFAFA] rounded-lg">
                      <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Next Billing</p>
                      <p className="text-sm font-medium text-[#09090B] flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(nextBillingDate)}
                      </p>
                    </div>
                  </div>

                  {paymentMethod?.last4 && (
                    <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-[#1D9E75] rounded flex items-center justify-center text-white text-xs font-bold">
                          {(paymentMethod.brand || 'VISA').toUpperCase().slice(0, 4)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#09090B]">Card ending {paymentMethod.last4}</p>
                          <p className="text-xs text-[#71717A]">Primary payment method</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 flex-wrap">
                    <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger className="w-40 border-[#F0F0F0]" data-testid="change-plan-select">
                        <SelectValue placeholder="Change plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Starter">Starter</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                        <SelectItem value="Agency">Agency</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="admin-btn-primary" onClick={handleChangePlan} data-testid="save-plan-btn">Save</Button>
                    <Button variant="outline" className="admin-btn-secondary" onClick={handleExtendTrial} data-testid="extend-trial-btn">
                      Add 7-day Trial Extension
                    </Button>
                  </div>

                  {billingHistory.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#09090B] mb-3">Billing History</h4>
                      <table className="w-full admin-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Plan</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingHistory.map((item, i) => (
                            <tr key={item.id || i}>
                              <td>{formatDate(item.date || item.createdAt)}</td>
                              <td>{item.plan || item.planName || planName}</td>
                              <td>${item.amount || item.total}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  (item.status || '').toLowerCase() === 'paid' ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                                }`}>
                                  {item.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Activity Log Tab */}
              <TabsContent value="activity" className="p-5">
                <div className="space-y-3 max-h-[400px] overflow-y-auto" data-testid="admin-user-activity-log">
                  {activityLog == null ? (
                    <p className="text-sm text-[#71717A]">Loading activity...</p>
                  ) : activityLog.length === 0 ? (
                    <p className="text-sm text-[#71717A]">No activity recorded yet.</p>
                  ) : (
                    activityLog.map((item, i) => (
                      <div key={item.id || i} className="flex items-start gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                        <div className="w-2 h-2 rounded-full bg-[#1D9E75] mt-2" />
                        <div className="flex-1">
                          <p className="text-sm text-[#27272A]">{item.action || item.title || item.message}</p>
                          <p className="text-xs text-[#71717A]">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : item.time}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeleteConfirm(''); }}>
        <DialogContent className="max-w-md" data-testid="admin-delete-user-dialog">
          <DialogHeader>
            <DialogTitle className="text-[#EF4444]">Delete this user?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{email}</strong> and cascade-delete all their sites, articles, scans, notifications, and feedback. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-1">
            <label className="text-xs text-[#71717A] block">Type <code className="px-1 bg-[#F0F0F0] rounded">DELETE</code> to confirm</label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="admin-input"
              data-testid="admin-delete-confirm-input"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteUser}
              disabled={isDeleting || deleteConfirm !== 'DELETE'}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
              data-testid="admin-delete-user-confirm-btn"
            >
              {isDeleting ? <><Loader2 size={14} className="mr-2 animate-spin" />Deleting...</> : 'Permanently Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
