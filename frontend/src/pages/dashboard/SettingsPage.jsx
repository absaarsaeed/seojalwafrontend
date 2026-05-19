import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { useSite } from '../../context/SiteContext';
import { userApi } from '../../lib/api';
import { SETTINGS_DATA } from '../../data/publicData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import { Eye, EyeOff, Download, AlertTriangle, ChevronUp, User, Plus, Mail } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed');
    setPasswords({ current: '', new: '', confirm: '' });
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
              <Button onClick={handleChangePassword} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white">Change Password</Button>
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
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-red-200 p-6">
            <h3 className="font-semibold text-[#EF4444] mb-2">Danger Zone</h3>
            <p className="text-sm text-[#6B7280] mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="outline" className="border-[#EF4444] text-[#EF4444] hover:bg-red-50">Delete account</Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Current Plan */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#0A0A0A]">Current Plan</h3>
                <p className="text-sm text-[#6B7280]">{user?.plan || 'Growth'} — $199/month</p>
              </div>
              <span className="px-3 py-1 bg-[#E1F5EE] text-[#1D9E75] text-sm font-medium rounded-full">Active</span>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">Next billing date: January 1, 2027</p>
            <Button variant="outline" className="border-[#1D9E75] text-[#1D9E75]">
              <ChevronUp size={16} className="mr-2" />
              Upgrade to Agency
            </Button>
          </motion.div>

          {/* Usage */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Usage This Month</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.usage).map(([key, val]) => (
                <div key={key} className="space-y-2">
                  <p className="text-sm text-[#6B7280] capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-lg font-semibold text-[#0A0A0A]">{val.used}/{val.limit}</p>
                  <Progress value={(val.used / val.limit) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Invoices */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
            <div className="p-4 border-b border-[#F0F0F0]">
              <h3 className="font-semibold text-[#0A0A0A]">Invoice History</h3>
            </div>
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
                {data.invoices.map((invoice, i) => (
                  <tr key={invoice.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                    <td className="p-4 text-sm text-[#0A0A0A]">{invoice.id}</td>
                    <td className="p-4 text-sm text-[#6B7280]">{invoice.date}</td>
                    <td className="p-4 text-sm text-[#0A0A0A]">${invoice.amount}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">{invoice.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="ghost" className="h-8">
                        <Download size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Cancel */}
          <p className="text-sm text-[#6B7280]">
            Need to cancel? <button className="text-[#EF4444] hover:underline">Cancel subscription</button>
          </p>
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
      </Tabs>
    </motion.div>
  );
};
