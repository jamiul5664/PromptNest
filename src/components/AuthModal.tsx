import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, ShieldCheck, Sparkles, Mail, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      showToast('Running in local mode. No account is required to copy or browse prompts!', 'info');
      onClose();
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showToast('Account created! Check your email for verification link.', 'success');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast('Signed in successfully!', 'success');
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    const result = await checkSupabaseConnection();
    setDbStatus(result.message);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-6 shadow-2xl text-brand-text"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div className="flex items-center space-x-2 text-brand-lavender">
              <Sparkles className="w-5 h-5 text-brand-violet" />
              <h3 className="text-lg font-semibold text-brand-text">
                {isSupabaseConfigured ? (isSignUp ? 'Create PromptVista Account' : 'Sign In to PromptVista') : 'Account & Sync Status'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-brand-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isSupabaseConfigured ? (
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl bg-brand-bg border border-brand-border/80 space-y-2">
                <div className="flex items-center space-x-2 text-brand-lavender font-medium text-sm">
                  <Database className="w-4 h-4 text-brand-violet" />
                  <span>Local Guest Mode Active</span>
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  PromptVista is fully functional without cloud credentials. Your saved favorites, searches, and custom prompts are stored privately in your browser's local cache.
                </p>
              </div>

              <div className="space-y-2 text-xs text-brand-muted">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited prompt browsing & 1-click copying</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Local favorites persistence (no sign-up required)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ready for Supabase cloud sync via <code>.env</code> file</span>
                </div>
              </div>

              {dbStatus && (
                <div className="p-3 text-xs rounded-lg bg-black/40 border border-brand-border text-brand-lavender">
                  {dbStatus}
                </div>
              )}

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={loading}
                  className="text-xs text-brand-lavender hover:underline"
                >
                  {loading ? 'Checking...' : 'Check Supabase Connection'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-semibold transition-all shadow-glow-sm"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="mt-4 space-y-4">
              <p className="text-xs text-brand-muted">
                {isSignUp
                  ? 'Sign up to sync your favorite prompts across devices.'
                  : 'Welcome back! Sign in to access your cloud-saved prompts.'}
              </p>

              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@promptvista.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white font-semibold text-sm transition-all shadow-glow-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>

              <div className="text-center text-xs text-brand-muted pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-brand-lavender hover:underline"
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
