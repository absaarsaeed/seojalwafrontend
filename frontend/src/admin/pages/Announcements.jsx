import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../../lib/api';
import { TableSkeleton, FormSkeleton } from '../components/SkeletonLoaders';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Send, Eye, Users, Mail, Bell, Loader2 } from 'lucide-react';

const TARGET_TO_AUDIENCE = {
  'All users': 'ALL',
  'Free users': 'FREE',
  'Starter plan': 'STARTER',
  'Growth plan': 'GROWTH',
  'Agency plan': 'AGENCY',
};

export const Announcements = () => {
  const { announcements, addAnnouncement } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    target: 'All users',
    channel: 'Both'
  });
  const [recipientCount, setRecipientCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Live preview count from /api/admin/announcements/preview-count
  useEffect(() => {
    let cancelled = false;
    setCountLoading(true);
    setRecipientCount(null);
    const audience = TARGET_TO_AUDIENCE[formData.target] || 'ALL';
    (async () => {
      try {
        const res = await adminApi.announcementPreviewCount(audience);
        const count = res?.count ?? res?.recipientCount ?? res?.total ?? null;
        if (!cancelled && count != null) setRecipientCount(count);
      } catch {
        // Silent — UI will show "—"
      } finally {
        if (!cancelled) setCountLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [formData.target]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    try {
      const audience = TARGET_TO_AUDIENCE[formData.target] || 'ALL';
      const res = await adminApi.sendAnnouncement({
        subject: formData.subject,
        message: formData.message,
        targetAudience: audience,
        channel: formData.channel,
      });
      const sent = res?.recipientCount ?? res?.sent ?? recipientCount ?? 0;
      // Keep local context list in sync for the History table.
      addAnnouncement({
        subject: formData.subject,
        target: formData.target,
        channel: formData.channel,
        recipients: sent,
      });
      setFormData({ subject: '', message: '', target: 'All users', channel: 'Both' });
      toast.success(`Sent to ${sent} user${sent === 1 ? '' : 's'} successfully`);
    } catch (err) {
      toast.error(err?.message || 'Could not send announcement');
    } finally {
      setSending(false);
    }
  };

  const handlePreview = () => {
    if (!formData.subject || !formData.message) {
      toast.error('Please fill in subject and message to preview');
      return;
    }
    setShowPreview(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <FormSkeleton fields={4} />
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="announcements-page">
      {/* Create Form */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-[#09090B] mb-4">Send Announcement</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Subject</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter announcement subject"
              className="admin-input"
              data-testid="announcement-subject-input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#71717A]">Message</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Write your announcement message..."
              className="admin-input min-h-[120px]"
              data-testid="announcement-message-input"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-[#71717A]">Target Audience</Label>
              <Select 
                value={formData.target} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, target: v }))}
              >
                <SelectTrigger className="border-[#F0F0F0]" data-testid="announcement-target-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All users">All users</SelectItem>
                  <SelectItem value="Starter plan">Starter plan</SelectItem>
                  <SelectItem value="Growth plan">Growth plan</SelectItem>
                  <SelectItem value="Agency plan">Agency plan</SelectItem>
                  <SelectItem value="Free users">Free users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-[#71717A]">Channel</Label>
              <Select 
                value={formData.channel} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, channel: v }))}
              >
                <SelectTrigger className="border-[#F0F0F0]" data-testid="announcement-channel-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-app banner">In-app banner</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recipients count */}
          <div className="flex items-center gap-2 p-3 bg-[#FAFAFA] rounded-lg" data-testid="announcement-recipient-count">
            <Users size={16} className="text-[#71717A]" />
            <span className="text-sm text-[#27272A]">
              This will be sent to{' '}
              {countLoading ? (
                <Loader2 size={14} className="inline animate-spin text-[#71717A]" />
              ) : (
                <strong data-testid="announcement-recipient-count-value">
                  {recipientCount != null ? recipientCount.toLocaleString() : '—'}
                </strong>
              )}
              {' '}users
            </span>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handlePreview} variant="outline" className="admin-btn-secondary" data-testid="preview-announcement-btn">
              <Eye size={16} className="mr-2" />
              Preview
            </Button>
            <Button type="submit" disabled={sending} className="admin-btn-primary" data-testid="send-announcement-btn">
              {sending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Send size={16} className="mr-2" />}
              {sending ? 'Sending…' : 'Send announcement'}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {formData.channel !== 'Email' && (
              <div>
                <p className="text-xs text-[#71717A] mb-2 flex items-center gap-1">
                  <Bell size={12} /> In-app Banner Preview
                </p>
                <div className="bg-[#1D9E75] text-white p-4 rounded-lg">
                  <p className="font-medium">{formData.subject}</p>
                  <p className="text-sm opacity-90 mt-1">{formData.message}</p>
                </div>
              </div>
            )}
            {formData.channel !== 'In-app banner' && (
              <div>
                <p className="text-xs text-[#71717A] mb-2 flex items-center gap-1">
                  <Mail size={12} /> Email Preview
                </p>
                <div className="border border-[#F0F0F0] rounded-lg overflow-hidden">
                  <div className="bg-[#FAFAFA] p-3 border-b border-[#F0F0F0]">
                    <p className="text-xs text-[#71717A]">Subject:</p>
                    <p className="text-sm font-medium">{formData.subject}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-[#27272A] whitespace-pre-wrap">{formData.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* History Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-5 border-b border-[#F0F0F0]">
          <h3 className="text-sm font-semibold text-[#09090B]">Announcement History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full admin-table" data-testid="announcements-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Target</th>
                <th>Channel</th>
                <th>Sent Date</th>
                <th>Recipients</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} data-testid={`announcement-row-${announcement.id}`}>
                  <td className="font-medium text-[#09090B]">{announcement.subject}</td>
                  <td>{announcement.target}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {announcement.channel === 'Email' || announcement.channel === 'Both' ? (
                        <Mail size={14} className="text-[#71717A]" />
                      ) : null}
                      {announcement.channel === 'In-app banner' || announcement.channel === 'Both' ? (
                        <Bell size={14} className="text-[#71717A]" />
                      ) : null}
                      <span>{announcement.channel}</span>
                    </div>
                  </td>
                  <td>{announcement.date}</td>
                  <td>{announcement.recipients.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
