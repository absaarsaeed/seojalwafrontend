import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from './ui/dialog';
import { FeedbackForm } from '../pages/public/FeedbackPage';

/**
 * Floating round button (bottom-right). Clicking opens a small dialog
 * with the FeedbackForm component pre-filled for the logged-in user.
 */
export const FeedbackFAB = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white shadow-lg flex items-center justify-center transition-transform hover:-translate-y-0.5"
        aria-label="Send feedback"
        data-testid="feedback-fab"
      >
        <MessageCircle size={20} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" data-testid="feedback-dialog">
          <DialogHeader>
            <DialogTitle>Send us feedback</DialogTitle>
            <DialogDescription>
              We read every message — feature ideas, bug reports, anything.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <FeedbackForm embedded onSubmitted={() => setTimeout(() => setOpen(false), 1800)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackFAB;
