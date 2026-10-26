import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Check, AlertTriangle } from 'lucide-react';

interface CopyFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptText: string;
}

export const CopyFallbackModal: React.FC<CopyFallbackModalProps> = ({
  isOpen,
  onClose,
  promptText,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleSelectAndCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Manual select copy failed', err);
      }
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
          className="relative w-full max-w-lg bg-brand-card border border-brand-border rounded-2xl p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fallback-title"
        >
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div className="flex items-center space-x-2 text-brand-lavender">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 id="fallback-title" className="text-lg font-semibold text-brand-text">
                Manual Copy Prompt
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-brand-muted hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-4 text-sm text-brand-muted">
            Your browser prevented automatic clipboard write. You can select the text below or click <strong>Copy Text</strong> to copy manually.
          </p>

          <div className="mt-4">
            <textarea
              ref={textareaRef}
              readOnly
              value={promptText}
              rows={5}
              className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl text-sm font-mono text-brand-text focus:outline-none focus:border-brand-violet resize-none select-all"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSelectAndCopy}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-semibold transition-all shadow-glow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Select & Copy'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
