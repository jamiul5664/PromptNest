import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { signInWithGoogle, signInWithEmail } from '../lib/userAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // 1-Click Google / Gmail Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithGoogle(email.includes('@gmail.com') ? email : undefined);
      if (result.success) {
        showToast(`Welcome! Successfully signed in with Gmail.`, 'success');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(result.error || 'Google sign-in failed');
        showToast(result.error || 'Google sign-in failed', 'error');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Form Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your Gmail or email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithEmail(email, password, isSignUp);
      if (result.success) {
        showToast(
          isSignUp ? 'Account created and signed in!' : 'Welcome back! Signed in successfully.',
          'success'
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(result.error || 'Authentication error');
        showToast(result.error || 'Authentication error', 'error');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-8 shadow-2xl text-brand-text"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div className="flex items-center space-x-2 text-brand-lavender">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-lavender p-0.5 shadow-glow-sm">
                <div className="w-full h-full bg-brand-bg rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-violet" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-text">
                  {isSignUp ? 'Create PromptVista Account' : 'Sign In to PromptVista'}
                </h3>
                <p className="text-[11px] text-brand-muted">
                  Gmail বা ইমেইল দিয়ে সহজে লগইন করুন
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {/* 1. Continue with Google / Gmail Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-3 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {/* Google 4-color SVG Logo */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google / Gmail</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-brand-border"></div>
              <span className="flex-shrink mx-3 text-xs text-brand-muted uppercase font-mono tracking-wider">
                Or with Gmail Address
              </span>
              <div className="flex-grow border-t border-brand-border"></div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Email / Gmail Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                  Gmail or Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-violet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-brand-muted font-normal">Min 4 chars</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-violet font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : isSignUp ? (
                  <span>Create Account with Gmail</span>
                ) : (
                  <span>Sign In with Gmail</span>
                )}
              </button>

              {/* Toggle Sign Up / Sign In */}
              <div className="text-center text-xs text-brand-muted pt-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-brand-lavender hover:underline font-semibold"
                >
                  {isSignUp
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Sign Up free"}
                </button>
              </div>
            </form>

            {/* Sync Features Info */}
            <div className="pt-3 border-t border-brand-border/60 text-[11px] text-brand-muted space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Save and sync your favorite AI prompt recipes automatically</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
