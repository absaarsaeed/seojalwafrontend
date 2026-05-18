import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { FormSkeleton } from '../components/SkeletonLoaders';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Save, AlertTriangle, Eye, EyeOff } from 'lucide-react';

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
