import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { FormSkeleton } from '../components/SkeletonLoaders';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Save, AlertTriangle, Eye, EyeOff, Upload, ExternalLink, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/api';

export const Settings = () => {
  const { settings, updateSettings } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [localSettings, setLocalSettings] = useState(settings);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Plugin section state
  const [plugin, setPlugin] = useState({
    pluginVersion: '',
    pluginDownloadUrl: '',
    pluginChangelog: '',
  });
  const [uploadingPlugin, setUploadingPlugin] = useState(false);
  const [savingPlugin, setSavingPlugin] = useState(false);
  const fileInputRef = useRef(null);

  // Reminder days arrays
  const [reminders, setReminders] = useState({
    renewalReminderDays: '',
    trialEndingReminderDays: '',
    paymentRetryDays: '',
  });
  const [savingReminders, setSavingReminders] = useState(false);

  // Hydrate plugin fields from backend admin settings.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.settings();
        if (cancelled) return;
        const flat = data?.settings || data || {};
        setPlugin({
          pluginVersion: flat.pluginVersion || flat.plugin_version || '',
          pluginDownloadUrl: flat.pluginDownloadUrl || flat.plugin_download_url || '',
          pluginChangelog: flat.pluginChangelog || flat.plugin_changelog || '',
        });
        const fmt = (a) => Array.isArray(a) ? a.join(', ') : (a || '');
        setReminders({
          renewalReminderDays: fmt(flat.renewalReminderDays || flat.renewal_reminder_days),
          trialEndingReminderDays: fmt(flat.trialEndingReminderDays || flat.trial_ending_reminder_days),
          paymentRetryDays: fmt(flat.paymentRetryDays || flat.payment_retry_days),
        });
      } catch {
        // Endpoint may not be present — keep empty fields.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const parseDayList = (s) =>
    String(s || '')
      .split(',')
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => Number.isFinite(n) && n >= 0);

  const handleSaveReminders = async () => {
    setSavingReminders(true);
    try {
      await adminApi.updateSettings({
        renewalReminderDays: parseDayList(reminders.renewalReminderDays),
        trialEndingReminderDays: parseDayList(reminders.trialEndingReminderDays),
        paymentRetryDays: parseDayList(reminders.paymentRetryDays),
      });
      toast.success('Reminder schedules saved');
    } catch (err) {
      toast.error(err?.message || 'Could not save reminders');
    } finally {
      setSavingReminders(false);
    }
  };

  const handleSavePlugin = async (override) => {
    const payload = {
      pluginVersion: (override?.pluginVersion ?? plugin.pluginVersion) || '',
      pluginDownloadUrl: (override?.pluginDownloadUrl ?? plugin.pluginDownloadUrl) || '',
      pluginChangelog: (override?.pluginChangelog ?? plugin.pluginChangelog) || '',
    };
    setSavingPlugin(true);
    try {
      await adminApi.updateSettings(payload);
      setPlugin(payload);
      toast.success('Plugin settings saved');
    } catch (err) {
      toast.error(err?.message || 'Could not save plugin settings');
    } finally {
      setSavingPlugin(false);
    }
  };

  const handleUploadPlugin = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.zip$/i.test(file.name)) {
      toast.error('Please upload a .zip file');
      e.target.value = '';
      return;
    }
    setUploadingPlugin(true);
    toast.message(`Uploading ${file.name}...`);
    try {
      const data = await adminApi.uploadPlugin(file);
      const url = data?.download_url || data?.downloadUrl || data?.url || '';
      const version = data?.version || plugin.pluginVersion;
      toast.success('Plugin uploaded successfully');
      // Auto-save the returned URL/version
      await handleSavePlugin({ pluginDownloadUrl: url, pluginVersion: version });
    } catch (err) {
      toast.error(err?.message || 'Plugin upload failed');
    } finally {
      setUploadingPlugin(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleGeneralChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const handleMaintenanceChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      maintenance: { ...prev.maintenance, [field]: value }
    }));
  };

  const handleSocialChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      social: { ...prev.social, [field]: value }
    }));
  };

  const handleSaveGeneral = () => {
    updateSettings(localSettings);
    toast.success('General settings saved');
  };

  const handleSaveMaintenance = () => {
    updateSettings(localSettings);
    toast.success('Maintenance settings saved');
  };

  const handleSaveSocial = () => {
    updateSettings(localSettings);
    toast.success('Social links saved');
  };

  const handleChangePassword = () => {
    if (passwordData.current !== 'jalwaadmin') {
      toast.error('Current password is incorrect');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <FormSkeleton fields={4} />
        <FormSkeleton fields={2} />
        <FormSkeleton fields={3} />
        <FormSkeleton fields={3} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6" data-testid="settings-page">
      {/* General Settings */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-[#09090B] mb-4">General Settings</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Site Name</Label>
            <Input
              value={localSettings.general.siteName}
              onChange={(e) => handleGeneralChange('siteName', e.target.value)}
              className="admin-input"
              data-testid="settings-site-name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Site URL</Label>
            <Input
              value={localSettings.general.siteUrl}
              onChange={(e) => handleGeneralChange('siteUrl', e.target.value)}
              className="admin-input"
              data-testid="settings-site-url"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Support Email</Label>
            <Input
              type="email"
              value={localSettings.general.supportEmail}
              onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
              className="admin-input"
              data-testid="settings-support-email"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Contact Email</Label>
            <Input
              type="email"
              value={localSettings.general.contactEmail}
              onChange={(e) => handleGeneralChange('contactEmail', e.target.value)}
              className="admin-input"
              data-testid="settings-contact-email"
            />
          </div>
          <Button onClick={handleSaveGeneral} className="admin-btn-primary" data-testid="save-general-btn">
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-[#09090B] mb-4">Maintenance Mode</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#27272A]">Enable Maintenance Mode</p>
              <p className="text-xs text-[#71717A]">All visitors will see the maintenance page</p>
            </div>
            <Switch
              checked={localSettings.maintenance.enabled}
              onCheckedChange={(checked) => handleMaintenanceChange('enabled', checked)}
              data-testid="maintenance-toggle"
            />
          </div>

          {localSettings.maintenance.enabled && (
            <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg flex items-start gap-2">
              <AlertTriangle size={16} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#F59E0B]">
                Warning: Maintenance mode is enabled. All visitors will see the maintenance page.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Maintenance Message</Label>
            <Textarea
              value={localSettings.maintenance.message}
              onChange={(e) => handleMaintenanceChange('message', e.target.value)}
              className="admin-input"
              data-testid="maintenance-message"
            />
          </div>
          <Button onClick={handleSaveMaintenance} className="admin-btn-primary" data-testid="save-maintenance-btn">
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Social Links */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-[#09090B] mb-4">Social Links</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Twitter/X URL</Label>
            <Input
              value={localSettings.social.twitter}
              onChange={(e) => handleSocialChange('twitter', e.target.value)}
              placeholder="https://twitter.com/yourhandle"
              className="admin-input"
              data-testid="settings-twitter"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">LinkedIn URL</Label>
            <Input
              value={localSettings.social.linkedin}
              onChange={(e) => handleSocialChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              className="admin-input"
              data-testid="settings-linkedin"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Instagram URL</Label>
            <Input
              value={localSettings.social.instagram}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              className="admin-input"
              data-testid="settings-instagram"
            />
          </div>
          <Button onClick={handleSaveSocial} className="admin-btn-primary" data-testid="save-social-btn">
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Admin Password */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-[#09090B] mb-4">Admin Password</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Current Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                className="admin-input pr-10"
                data-testid="settings-current-password"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#27272A]"
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">New Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                className="admin-input pr-10"
                data-testid="settings-new-password"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#27272A]"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                className="admin-input pr-10"
                data-testid="settings-confirm-password"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#27272A]"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button onClick={handleChangePassword} className="admin-btn-primary" data-testid="change-password-btn">
            Change Password
          </Button>
        </div>
      </div>

      {/* WordPress Plugin */}
      <div className="admin-card p-6" data-testid="settings-plugin-section">
        <h3 className="text-lg font-semibold text-[#09090B] mb-4">WordPress Plugin</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Plugin Version</Label>
            <Input
              value={plugin.pluginVersion}
              onChange={(e) => setPlugin((p) => ({ ...p, pluginVersion: e.target.value }))}
              placeholder="1.0.0"
              className="admin-input"
              data-testid="settings-plugin-version"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Plugin Download URL</Label>
            <Input
              value={plugin.pluginDownloadUrl}
              onChange={(e) => setPlugin((p) => ({ ...p, pluginDownloadUrl: e.target.value }))}
              placeholder="https://cdn.seojalwa.com/plugin/seojalwa-plugin-1.0.0.zip"
              className="admin-input"
              data-testid="settings-plugin-download-url"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Changelog</Label>
            <Textarea
              rows={4}
              value={plugin.pluginChangelog}
              onChange={(e) => setPlugin((p) => ({ ...p, pluginChangelog: e.target.value }))}
              placeholder="• Improved connection reliability&#10;• Added Gutenberg block support"
              className="admin-input"
              data-testid="settings-plugin-changelog"
            />
          </div>

          {plugin.pluginDownloadUrl && (
            <div className="text-sm text-[#71717A]">
              Current download URL:{' '}
              <a
                href={plugin.pluginDownloadUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[#1D9E75] hover:underline inline-flex items-center gap-1"
                data-testid="settings-plugin-current-url"
              >
                {plugin.pluginDownloadUrl}
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => handleSavePlugin()}
              disabled={savingPlugin}
              className="admin-btn-primary"
              data-testid="save-plugin-btn"
            >
              {savingPlugin ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
              Save plugin settings
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              onChange={handleUploadPlugin}
              className="hidden"
              data-testid="settings-plugin-file-input"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPlugin}
              className="border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE]"
              data-testid="upload-plugin-btn"
            >
              {uploadingPlugin ? (
                <><Loader2 size={14} className="animate-spin mr-2" />Uploading...</>
              ) : (
                <><Upload size={14} className="mr-2" />Upload new plugin ZIP</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Reminder schedules */}
      <div className="admin-card p-6" data-testid="settings-reminders-section">
        <h3 className="text-lg font-semibold text-[#09090B] mb-1">Reminder Schedules</h3>
        <p className="text-xs text-[#71717A] mb-4">Comma-separated days. Example <code className="px-1 bg-[#F0F0F0] rounded">7, 3, 1</code> means send reminders at 7, 3, and 1 days before the event.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Subscription renewal reminders (days before)</Label>
            <Input
              value={reminders.renewalReminderDays}
              onChange={(e) => setReminders((p) => ({ ...p, renewalReminderDays: e.target.value }))}
              placeholder="7, 3, 1"
              className="admin-input"
              data-testid="reminder-renewal-days"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Trial-ending reminders (days before)</Label>
            <Input
              value={reminders.trialEndingReminderDays}
              onChange={(e) => setReminders((p) => ({ ...p, trialEndingReminderDays: e.target.value }))}
              placeholder="3, 1"
              className="admin-input"
              data-testid="reminder-trial-days"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Payment retry schedule (days after fail)</Label>
            <Input
              value={reminders.paymentRetryDays}
              onChange={(e) => setReminders((p) => ({ ...p, paymentRetryDays: e.target.value }))}
              placeholder="1, 3, 7"
              className="admin-input"
              data-testid="reminder-payment-retry-days"
            />
          </div>
        </div>
        <div className="pt-4">
          <Button onClick={handleSaveReminders} disabled={savingReminders} className="admin-btn-primary" data-testid="save-reminders-btn">
            {savingReminders ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
            Save reminder schedules
          </Button>
        </div>
      </div>

      {/* Legal Pages Note */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-[#09090B] mb-2">Legal Pages</h3>
        <p className="text-sm text-[#71717A]">
          Privacy Policy, Terms of Service, and Cookie Policy content is managed directly in the codebase. 
          Contact your developer to update.
        </p>
      </div>
    </div>
  );
};
