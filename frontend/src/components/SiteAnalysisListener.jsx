import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';
import { sitesApi } from '../lib/api';

/**
 * Listens for `jalwa:site-connected` after a successful WordPress connection.
 * Polls GET /api/sites/{id} every 3s until `analyzed === true`. When ready,
 * shows a celebration modal with two CTAs.
 */
export const SiteAnalysisListener = () => {
  const [open, setOpen] = useState(false);
  const [siteId, setSiteId] = useState('');
  const pollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      const id = e.detail?.siteId;
      if (!id) return;
      setSiteId(id);
      // start polling
      if (pollRef.current) clearInterval(pollRef.current);
      let elapsed = 0;
      pollRef.current = setInterval(async () => {
        elapsed += 3000;
        // stop polling after 5 min to avoid leaks
        if (elapsed > 5 * 60 * 1000) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          return;
        }
        try {
          const s = await sitesApi.get(id);
          if (s?.analyzed === true || s?.analysisComplete === true) {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setOpen(true);
          }
        } catch {}
      }, 3000);
    };
    window.addEventListener('jalwa:site-connected', handler);
    return () => {
      window.removeEventListener('jalwa:site-connected', handler);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" data-testid="site-ready-dialog">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-2">
            <Sparkles className="text-[#1D9E75]" size={22} />
          </div>
          <DialogTitle>Your site is ready! 🎉</DialogTitle>
          <DialogDescription>
            We analyzed your content and configured everything automatically. Your first batch of articles is queued up.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => { setOpen(false); navigate('/dashboard/article-settings'); }}
            data-testid="site-ready-review-btn"
          >
            Review settings →
          </Button>
          <Button
            onClick={() => { setOpen(false); navigate('/dashboard/auto-publish'); }}
            className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
            data-testid="site-ready-articles-btn"
          >
            See my articles →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SiteAnalysisListener;
