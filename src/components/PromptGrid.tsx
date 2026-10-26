import React from 'react';
import type { PromptRecord } from '../types';
import { PromptCard } from './PromptCard';
import { SearchX } from 'lucide-react';

interface PromptGridProps {
  prompts: PromptRecord[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  onResetFilters?: () => void;
  layout?: 'masonry' | 'grid';
}

export const PromptGrid: React.FC<PromptGridProps> = ({
  prompts,
  isLoading = false,
  emptyTitle = 'No Prompts Found',
  emptySubtitle = 'Try adjusting your search terms, clearing filters, or browsing other categories.',
  onResetFilters,
  layout = 'masonry',
}) => {
  if (isLoading) {
    return (
      <div
        className={
          layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start'
            : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]'
        }
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid mb-6 rounded-2xl border border-brand-border bg-brand-card overflow-hidden space-y-3 p-4"
          >
            <div
              className={`rounded-xl animate-shimmer ${
                i % 4 === 0
                  ? 'aspect-[21/9]'
                  : i % 4 === 1
                  ? 'aspect-video'
                  : i % 4 === 2
                  ? 'aspect-square'
                  : 'aspect-[9/16]'
              }`}
            />
            <div className="h-4 bg-brand-surface rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-brand-surface rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4 bg-brand-card/40 border border-brand-border/60 rounded-3xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted">
          <SearchX className="w-8 h-8 text-brand-violet" />
        </div>
        <h3 className="text-xl font-bold text-brand-text mb-2">{emptyTitle}</h3>
        <p className="text-sm text-brand-muted mb-6 leading-relaxed">
          {emptySubtitle}
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-xs font-semibold shadow-glow-sm transition-all"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        layout === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start'
          : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]'
      }
    >
      {prompts.map((prompt, index) => (
        <PromptCard key={prompt.id} prompt={prompt} priority={index < 4} />
      ))}
    </div>
  );
};
