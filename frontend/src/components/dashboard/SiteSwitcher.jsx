import { useState } from 'react';
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

export const SiteSwitcher = () => {
  const { sites, activeSite, setActiveSiteId, addSite } = useSite();
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ domain: '', name: '', platform: 'WordPress' });

  const handleAdd = () => {
    if (!form.domain.trim() || !form.name.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    addSite(form);
    setOpenDialog(false);
    setForm({ domain: '', name: '', platform: 'WordPress' });
    toast.success('Site added! Go to Connect Site to set up your integration.');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-[#F0F0F0] hover:border-[#1D9E75] hover:bg-[#F9FAFB] transition-colors"
            data-testid="site-switcher-trigger"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe size={16} className="text-[#1D9E75] flex-shrink-0" />
              <span className="text-sm font-medium text-[#0A0A0A] truncate">{activeSite?.domain}</span>
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
              <span className="flex-1 truncate">{site.domain}</span>
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

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent data-testid="add-site-dialog">
          <DialogHeader>
            <DialogTitle>Add a new site</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-site-url">Website URL</Label>
              <Input
                id="add-site-url"
                placeholder="example.com"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className="border-[#F0F0F0]"
                data-testid="add-site-url"
              />
            </div>
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
            <Button variant="outline" onClick={() => setOpenDialog(false)} className="border-[#F0F0F0]">
              Cancel
            </Button>
            <Button onClick={handleAdd} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="add-site-submit">
              Add site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
