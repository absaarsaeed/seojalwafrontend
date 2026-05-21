import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
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
import { ArrowLeft, Globe, Instagram, Linkedin, FileText, ExternalLink, Calendar, Trash2, Loader2 } from 'lucide-react';
import { USERS_LIST, USER_DETAIL } from '../data/dummyData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { adminApi } from '../../lib/api';

const PlanBadge = ({ plan }) => {
  // Backend may send a Plan document instead of a string — render the name only.
  const planName = typeof plan === 'object' && plan ? (plan.name || plan.id || 'Free') : (plan || 'Free');
  const colors = {
    Starter: 'bg-[#2563EB]/10 text-[#2563EB]',
    Growth: 'bg-[#1D9E75]/10 text-[#1D9E75]',
    Agency: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    Free: 'bg-[#71717A]/10 text-[#71717A]'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[planName] || colors.Free}`}>
      {planName}
    </span>
  );
};

const integrationIcons = {
  WordPress: Globe,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  Notion: FileText
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 shadow-sm">
        <p className="text-xs text-[#71717A] mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs">
            <span className="font-medium" style={{ color: p.color }}>{p.name}:</span> {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, userNotes, updateUserStatus, updateUserNote } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activityLog, setActivityLog] = useState(null);

  // Find user from list or use detail data
  const baseUser = users.find(u => u.id === id) || USERS_LIST.find(u => u.id === id);
  const user = { ...USER_DETAIL, ...baseUser };

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

  // Load real activity log for this user
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
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userNotes[id]) {
      setNote(userNotes[id]);
    }
    if (user.plan) {
      setSelectedPlan(user.plan);
    }
  }, [id, userNotes, user.plan]);

  const handleStatusToggle = () => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    updateUserStatus(id, newStatus);
    toast.success(`User ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully`);
  };

  const handleSaveNote = () => {
    updateUserNote(id, note);
    toast.success('Note saved successfully');
  };

  const handleExtendTrial = () => {
    toast.success('Trial extended by 7 days');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FormSkeleton fields={6} />
          <div className="lg:col-span-2"><ChartSkeleton height={400} /></div>
        </div>
      </div>
    );
  }

  const isActive = user.status === 'Active';

  return (
    <div className="space-y-6" data-testid="user-profile-page">
      {/* Back button */}
      <Link to="/adminpanel/users" className="inline-flex items-center gap-2 text-sm text-[#71717A] hover:text-[#09090B] transition-colors" data-testid="back-to-users">
        <ArrowLeft size={16} />
        Back to users
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card p-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#1D9E75] flex items-center justify-center mb-3">
                <span className="text-white text-2xl font-bold">
                  {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[#09090B]">{user.name}</h2>
              <p className="text-sm text-[#71717A]">{user.email}</p>
              <p className="text-xs text-[#71717A] mt-1">Signed up: {user.signupDate}</p>
              <div className="mt-3">
                <PlanBadge plan={user.plan} />
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between py-3 border-t border-[#F0F0F0]">
              <span className="text-sm font-medium text-[#27272A]">Status</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isActive ? 'text-[#1D9E75]' : 'text-[#EF4444]'}`}>
                  {user.status}
                </span>
                <Switch
                  checked={isActive}
                  onCheckedChange={handleStatusToggle}
                  data-testid="user-status-toggle"
                />
              </div>
            </div>

            {/* Growth Score */}
            <div className="py-4 border-t border-[#F0F0F0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#27272A]">Growth Score</span>
                <span className="text-lg font-bold text-[#1D9E75]">{user.jalwaScore}/100</span>
              </div>
              <div className="relative">
                <Progress value={user.jalwaScore} className="h-2" />
              </div>
            </div>

            {/* Danger zone */}
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

            {/* Connected Integrations */}
            <div className="py-4 border-t border-[#F0F0F0]">
              <span className="text-sm font-medium text-[#27272A] block mb-3">Connected Integrations</span>
              <div className="flex flex-wrap gap-2">
                {user.integrations?.map((integration) => {
                  const Icon = integrationIcons[integration] || Globe;
                  return (
                    <div 
                      key={integration}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F0F0] rounded-full text-sm text-[#27272A]"
                    >
                      <Icon size={14} />
                      {integration}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="py-4 border-t border-[#F0F0F0]">
              <span className="text-sm font-medium text-[#27272A] block mb-2">Internal Notes</span>
              <Textarea
                placeholder="Add a note about this user..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="admin-input min-h-[100px]"
                data-testid="user-notes-textarea"
              />
              <Button 
                onClick={handleSaveNote} 
                className="admin-btn-primary mt-3 w-full"
                data-testid="save-note-btn"
              >
                Save Note
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Tabs */}
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
                  {/* Current Plan */}
                  <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg">
                    <div>
                      <p className="text-xs text-[#71717A] uppercase tracking-wide">Current Plan</p>
                      <p className="text-lg font-semibold text-[#09090B]">{typeof user.plan === 'object' && user.plan ? (user.plan.name || user.plan.id) : user.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#71717A] uppercase tracking-wide">Next Billing</p>
                      <p className="text-sm font-medium text-[#09090B] flex items-center gap-1">
                        <Calendar size={14} />
                        {user.nextBillingDate}
                      </p>
                    </div>
                  </div>

                  {/* Usage Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(user.usage || {}).map(([key, data]) => (
                      <div key={key} className="p-4 border border-[#F0F0F0] rounded-lg">
                        <p className="text-xs text-[#71717A] uppercase tracking-wide mb-2">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <div className="flex items-end gap-1 mb-2">
                          <span className="text-xl font-bold text-[#09090B]">{data.used}</span>
                          <span className="text-sm text-[#71717A]">/ {data.limit}</span>
                        </div>
                        <Progress value={(data.used / data.limit) * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Usage Tab */}
              <TabsContent value="usage" className="p-5">
                <h4 className="text-sm font-semibold text-[#09090B] mb-4">Monthly Usage (Last 6 Months)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={user.monthlyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="articles" fill="#1D9E75" name="Articles" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="posts" fill="#2563EB" name="Posts" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="scans" fill="#F59E0B" name="Scans" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="p-5">
                <div className="space-y-6">
                  {/* Payment Method */}
                  <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-[#1D9E75] rounded flex items-center justify-center text-white text-xs font-bold">
                        VISA
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#09090B]">Visa ending {user.paymentMethod?.last4}</p>
                        <p className="text-xs text-[#71717A]">Primary payment method</p>
                      </div>
                    </div>
                  </div>

                  {/* Change Plan */}
                  <div className="flex items-center gap-4">
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
                    <Button className="admin-btn-primary" onClick={() => toast.success('Plan updated')}>Save</Button>
                    <Button variant="outline" className="admin-btn-secondary" onClick={handleExtendTrial} data-testid="extend-trial-btn">
                      Add 7-day Trial Extension
                    </Button>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#09090B] mb-3">Billing History</h4>
                    <table className="w-full admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Plan</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.billingHistory?.map((item) => (
                          <tr key={item.id}>
                            <td>{item.date}</td>
                            <td>{item.plan}</td>
                            <td>${item.amount}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.status === 'Paid' ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td>
                              <button className="text-[#2563EB] text-sm flex items-center gap-1 hover:underline">
                                <ExternalLink size={12} />
                                {item.invoiceId}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

      {/* Cascade delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeleteEmail(''); }}>
        <DialogContent className="max-w-md" data-testid="admin-delete-user-dialog">
          <DialogHeader>
            <DialogTitle className="text-[#EF4444]">Delete this user?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{user.email}</strong> and cascade-delete all their sites, articles, scans, notifications, and feedback. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-1">
            <label className="text-xs text-[#71717A] block">Type <code className="px-1 bg-[#F0F0F0] rounded">DELETE</code> to confirm</label>
            <Input
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              placeholder="DELETE"
              className="admin-input"
              data-testid="admin-delete-confirm-input"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteUser}
              disabled={isDeleting || deleteEmail !== 'DELETE'}
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
