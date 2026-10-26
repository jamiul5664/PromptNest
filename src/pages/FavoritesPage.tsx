import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Download, ArrowRight } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { getAllPrompts } from '../lib/prompts';
import { PromptGrid } from '../components/PromptGrid';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useToast } from '../context/ToastContext';

export const FavoritesPage: React.FC = () => {
  const { favorites, clearAllFavorites } = useFavorites();
  const { showToast } = useToast();

  useDocumentHead({
    title: 'Saved Favorite Prompts',
    description: 'Your saved collection of AI image prompts on PromptVista.',
  });

  const allPrompts = useMemo(() => getAllPrompts(), []);

  const favoritePrompts = useMemo(() => {
    return allPrompts.filter((p) => favorites.includes(p.id));
  }, [allPrompts, favorites]);

  const handleExportJSON = () => {
    if (favoritePrompts.length === 0) return;
    const blob = new Blob([JSON.stringify(favoritePrompts, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptvista-favorites-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Favorites exported as JSON file!', 'success');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 text-xs uppercase tracking-widest font-semibold">
            <Heart className="w-4 h-4 fill-current" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
            Saved Prompts ({favoritePrompts.length})
          </h1>
          <p className="text-sm text-brand-muted max-w-xl">
            Your saved reference recipes are persisted securely in your browser cache and will sync automatically when signed into Supabase.
          </p>
        </div>

        {favoritePrompts.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-card hover:bg-brand-surface border border-brand-border text-xs font-semibold text-brand-text transition-all"
              title="Download favorites as JSON"
            >
              <Download className="w-3.5 h-3.5 text-brand-violet" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all saved favorites?')) {
                  clearAllFavorites();
                  showToast('All favorites removed.', 'info');
                }
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400 transition-all"
              title="Clear all favorites"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {favoritePrompts.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto px-4 bg-brand-card/40 border border-brand-border/60 rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-brand-text mb-2">No Saved Prompts Yet</h3>
          <p className="text-sm text-brand-muted mb-6 leading-relaxed">
            Click the heart icon on any prompt card or prompt detail page to save reference recipes here for fast access.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-xs font-semibold shadow-glow-sm transition-all"
          >
            <span>Explore Prompts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <PromptGrid prompts={favoritePrompts} />
      )}
    </div>
  );
};
