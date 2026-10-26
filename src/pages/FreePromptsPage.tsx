import React, { useMemo } from 'react';
import { getAllPrompts } from '../lib/prompts';
import { PromptGrid } from '../components/PromptGrid';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { Gift } from 'lucide-react';

export const FreePromptsPage: React.FC = () => {
  useDocumentHead({
    title: '100% Free AI Image Prompts',
    description:
      'Browse and copy completely free AI image prompts for Midjourney, Stable Diffusion, and DALL-E. No sign-up or credits required.',
  });

  const freePrompts = useMemo(() => {
    return getAllPrompts().filter((p) => p.isFree);
  }, []);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs uppercase tracking-widest font-semibold">
          <Gift className="w-4 h-4" />
          <span>Open Creative Access</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
          100% Free Prompts
        </h1>
        <p className="text-sm text-brand-muted leading-relaxed">
          Every prompt in this collection is completely free to copy, modify, and use in your personal and commercial image synthesis projects. No subscription, sign-up, or credit card required.
        </p>
      </div>

      {/* Grid */}
      <PromptGrid
        prompts={freePrompts}
        emptyTitle="No free prompts found"
        emptySubtitle="Check back soon for new additions."
      />
    </div>
  );
};
