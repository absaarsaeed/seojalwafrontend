import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { useUser } from '../../context/UserContext';
import { useSite } from '../../context/SiteContext';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export const TeamPage = () => {
  const { user } = useUser();
  const { sites, activeSite } = useSite();
  const [email, setEmail] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedSites, setSelectedSites] = useState({});
  const [allowBilling, setAllowBilling] = useState(false);

  const toggleSite = (id) => {
    setSelectedSites((s) => ({ ...s, [id]: !s[id] }));
  };

  const toggleAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    const m = {};
    sites.forEach((s) => { m[s.id] = next; });
    setSelectedSites(m);
  };

  const handleInvite = () => {
    if (!email.trim()) {
      toast.error('Please enter an email');
      return;
    }
    setEmail('');
    setAllowBilling(false);
    setSelectAll(false);
    setSelectedSites({});
    toast.success('Invitation sent!');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('') || 'U';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-6"
      data-testid="team-page"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-syne text-2xl font-bold text-[#0A0A0A]">Team Management</h1>
        <p className="text-sm text-[#6B7280]">Invite team members and manage access to your sites.</p>
      </motion.div>

      {/* Invite */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="invite-card">
        <h3 className="font-syne text-lg font-bold text-[#0A0A0A] mb-4">Invite Team Member</h3>
        <div className="space-y-5 max-w-2xl">
          <div>
            <Label htmlFor="invite-email" className="mb-2 block">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-[#F0F0F0]"
              data-testid="invite-email"
            />
          </div>
          <div>
            <Label className="mb-2 block">Select sites to share</Label>
            <div className="space-y-2 p-4 bg-[#F9FAFB] rounded-lg border border-[#F0F0F0]">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={selectAll} onCheckedChange={toggleAll} />
                <span className="text-sm font-medium text-[#0A0A0A]">Select All Sites</span>
              </label>
              {sites.map((s) => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer pl-6">
                  <Checkbox checked={!!selectedSites[s.id]} onCheckedChange={() => toggleSite(s.id)} />
                  <span className="text-sm text-[#0A0A0A]">{s.domain}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox checked={allowBilling} onCheckedChange={() => setAllowBilling(!allowBilling)} />
              <div>
                <p className="text-sm font-medium text-[#0A0A0A]">Allow access to Billing page</p>
                <p className="text-xs text-[#6B7280]">If unchecked, this team member won't see the Billing menu item.</p>
              </div>
            </label>
          </div>
          <Button onClick={handleInvite} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="invite-submit">
            Send Invitation
          </Button>
        </div>
      </motion.div>

      {/* Team members */}
      <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#F0F0F0] p-6" data-testid="team-members-card">
        <h3 className="font-syne text-lg font-bold text-[#0A0A0A] mb-1">My Team</h3>
        <p className="text-sm text-[#6B7280] mb-4">{activeSite?.domain}</p>

        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-lg">
            <div className="w-12 h-12 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#0A0A0A]">{user?.name || 'Ahmed Hassan'}</p>
              <p className="text-sm text-[#6B7280] truncate">{user?.email || 'ahmedhasan@gmail.com'}</p>
            </div>
            <span className="px-3 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-semibold rounded-full">Owner</span>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#F9FAFB] rounded-lg border-2 border-dashed border-[#F0F0F0]">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3">
              <Users size={24} className="text-[#6B7280]" />
            </div>
            <p className="font-medium text-[#0A0A0A]">No other team members yet</p>
            <p className="text-sm text-[#6B7280] mt-1">Invite someone above to collaborate on your sites.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
