import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { TrendingUp } from 'lucide-react';

/**
 * Listens for `jalwa:plan-limit` events emitted by api.js when the backend
 * returns 403 + LIMIT_REACHED, and shows an upgrade modal with deep-link
 * to /pricing.
 */
export const LimitReachedListener = () => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      setDetail(e.detail || {});
      setOpen(true);
    };
    window.addEventListener('jalwa:plan-limit', handler);
    return () => window.removeEventListener('jalwa:plan-limit', handler);
  }, []);

  const { used, limit, plan, resource } = detail;
  const resourceLabel = (resource || 'articles').toLowerCase();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" data-testid="plan-limit-dialog">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-2">
            <TrendingUp className="text-[#1D9E75]" size={20} />
          </div>
          <DialogTitle>You've reached your limit</DialogTitle>
          <DialogDescription>
            {used != null && limit != null ? (
              <>You've used <strong>{used} of {limit}</strong> {resourceLabel} this month on the <strong>{plan || 'current'}</strong> plan. Upgrade to publish more.</>
            ) : (
              <>You've reached your {resourceLabel} limit on the {plan || 'current'} plan. Upgrade to keep going.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} data-testid="plan-limit-later">Maybe later</Button>
          <Button
            onClick={() => { setOpen(false); navigate('/pricing'); }}
            className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
            data-testid="plan-limit-view-plans"
          >
            View plans →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LimitReachedListener;
