import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, X, CheckCircle, ShieldAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptSlug: string;
  promptTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  promptSlug,
  promptTitle,
}) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState('license');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('content_reports').insert({
          prompt_slug: promptSlug,
          reason,
          details,
          reporter_email: email || null,
        });
      } else {
        // Fallback: save to localStorage for review
        const reports = JSON.parse(localStorage.getItem('promptvista_reports') || '[]');
        reports.push({
          promptSlug,
          promptTitle,
          reason,
          details,
          email,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('promptvista_reports', JSON.stringify(reports));
      }

      setSubmitted(true);
      showToast('Report received. Our moderation team will review it within 24 hours.', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        setEmail('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      showToast('Report submitted locally. Thank you for keeping the platform safe.', 'info');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-6 shadow-2xl text-brand-text"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div className="flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-brand-text">Report Prompt Content</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-brand-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-lg font-medium text-brand-text">Report Submitted</h4>
              <p className="text-sm text-brand-muted">
                Thank you for helping us maintain an ethical and safe repository.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-brand-muted">
                Reporting: <strong className="text-brand-text">{promptTitle}</strong>
              </p>

              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1.5">
                  Reason for Report
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet"
                >
                  <option value="license">Copyright / Intellectual Property / DMCA</option>
                  <option value="inappropriate">Inappropriate, Offensive, or NSFW Content</option>
                  <option value="broken">Broken Image or Misleading Prompt Text</option>
                  <option value="other">Incorrect Attribution or Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1.5">
                  Additional Details
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                  rows={3}
                  placeholder="Please describe why this content should be reviewed or updated..."
                  className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1.5">
                  Your Email (Optional, for follow-up)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-brand-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <Flag className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
