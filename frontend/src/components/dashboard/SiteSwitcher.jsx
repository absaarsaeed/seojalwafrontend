import { useState, useEffect } from 'react';
import { Globe, ChevronDown, Plus, Check } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';

const PLATFORMS = ['WordPress', 'Shopify', 'Webflow', 'Ghost', 'Wix', 'Squarespace', 'Other'];

const normaliseUrl = (raw) => {
  let v = (raw || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v;
};

export const SiteSwitcher = () => {
  const { sites, activeSite, setActiveSiteId, addSite } = useSite();
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ url: '', name: '', platform: 'WordPress' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Allow any page to open the Add Site dialog via custom event.
  useEffect(() => {
    const handler = () => setOpenDialog(true);
    window.addEventListener('jalwa:open-add-site', handler);
    return () => window.removeEventListener('jalwa:open-add-site', handler);
  }, []);

  const handleAdd = async () => {
    const url = normaliseUrl(form.url);
    const name = form.name.trim();
    if (!url || !name) {
      toast.error('Please fill all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await addSite({
        name,
        url,
        // SiteContext upper-cases platform for backend enum (WORDPRESS, SHOPIFY, ...).
        platform: form.platform,
      });
      setOpenDialog(false);
      setForm({ url: '', name: '', platform: 'WordPress' });
      toast.success('Site added! Go to Connect Site to set up your integration.');
    } catch (err) {
      toast.error(err?.message || 'Could not add site');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display fallback: when SiteContext is still empty, show a friendly prompt
  // instead of an empty button — clicking it opens the Add Site dialog.
  if (!activeSite) {
    return (
      <>
        <button
          onClick={() => setOpenDialog(true)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-dashed border-[#1D9E75]/40 hover:border-[#1D9E75] hover:bg-[#E1F5EE]/40 transition-colors text-left"
          data-testid="site-switcher-empty"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Plus size={16} className="text-[#1D9E75] flex-shrink-0" />
            <span className="text-sm font-medium text-[#1D9E75] truncate">Add your first website</span>
          </div>
        </button>
        <AddSiteDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          form={form}
          setForm={setForm}
          isSubmitting={isSubmitting}
          onSubmit={handleAdd}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-[#F0F0F0] hover:border-[#1D9E75] hover:bg-[#F9FAFB] transition-colors"
            data-testid="site-switcher-trigger"
          >
            <div className="flex items-center gap-2 min-w-0 text-left">
              <Globe size={16} className="text-[#1D9E75] flex-shrink-0" />
              <span className="text-sm font-medium text-[#0A0A0A] truncate">
                {activeSite.name || activeSite.domain}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#6B7280] flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[228px]" data-testid="site-switcher-menu">
          {sites.map((site) => (
            <DropdownMenuItem
              key={site.id}
              onClick={() => setActiveSiteId(site.id)}
              className="cursor-pointer"
              data-testid={`site-option-${site.id}`}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${site.id === activeSite?.id ? 'bg-[#1D9E75]' : 'bg-[#F0F0F0]'}`} />
              <span className="flex-1 truncate">{site.name || site.domain}</span>
              {site.id === activeSite?.id && <Check size={14} className="text-[#1D9E75]" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenDialog(true)}
            className="cursor-pointer text-[#1D9E75] focus:text-[#1D9E75]"
            data-testid="site-add-new"
          >
            <Plus size={14} className="mr-2" />
            Add new site
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddSiteDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        form={form}
        setForm={setForm}
        isSubmitting={isSubmitting}
        onSubmit={handleAdd}
      />
    </>
  );
};

const AddSiteDialog = ({ open, onOpenChange, form, setForm, isSubmitting, onSubmit }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent data-testid="add-site-dialog">
      <DialogHeader>
        <DialogTitle>Add a new website</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="add-site-name">Website name</Label>
          <Input
            id="add-site-name"
            placeholder="My Awesome Site"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border-[#F0F0F0]"
            data-testid="add-site-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="add-site-url">Website URL</Label>
          <Input
            id="add-site-url"
            placeholder="https://example.com"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="border-[#F0F0F0]"
            data-testid="add-site-url"
          />
        </div>
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
            <SelectTrigger className="border-[#F0F0F0]" data-testid="add-site-platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#F0F0F0]" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
          data-testid="add-site-submit"
        >
          {isSubmitting ? 'Adding…' : 'Add website'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
