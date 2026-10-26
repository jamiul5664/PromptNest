import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Heart, ExternalLink, Sparkles, Tag } from 'lucide-react';
import type { PromptRecord } from '../types';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../hooks/useFavorites';
import { CopyFallbackModal } from './CopyFallbackModal';
import { trackEvent } from '../lib/analytics';
import { handleCopyMonetization, handleImageMonetization } from '../lib/monetization';

interface PromptCardProps {
  prompt: PromptRecord;
  priority?: boolean;
  isPreview?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, priority = false, isPreview = false }) => {
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [copied, setCopied] = useState(false);
  const [stepPending, setStepPending] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const favorited = isFavorite(prompt.id);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check 2-step monetization (1st click opens link in background, 2nd click copies)
    const monetization = handleCopyMonetization(prompt.id, prompt.customShortlink);
    if (monetization.shouldOpenLink && monetization.linkToOpen) {
      try {
        window.open(monetization.linkToOpen, '_blank', 'noopener,noreferrer');
      } catch {
        // fallback
      }
      setStepPending(true);
      setTimeout(() => setStepPending(false), 4000);
      showToast('Click once more to copy prompt!', 'info');
      return;
    }

    const result = await copyToClipboard(prompt.promptText);

    if (result.success) {
      setCopied(true);
      showToast('Prompt copied to clipboard!', 'success');
      trackEvent('prompt_copy_success', {
        promptId: prompt.id,
        promptSlug: prompt.slug,
        promptTitle: prompt.title,
        method: result.method,
      });
      setTimeout(() => setCopied(false), 2500);
    } else {
      setShowFallbackModal(true);
      showToast('Automatic copy restricted. Please select manually.', 'info');
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(prompt.id);
    showToast(
      favorited ? 'Removed from saved favorites' : 'Added to saved favorites',
      'info'
    );
  };

  // Determine aspect ratio class
  const getAspectRatioClass = () => {
    switch (prompt.aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return 'aspect-[9/16]';
      case '4:3':
        return 'aspect-[4/3]';
      case '3:4':
        return 'aspect-[3/4]';
      case '21:9':
        return 'aspect-[21/9]';
      default:
        return 'aspect-[4/3]';
    }
  };

  // 2-step Image Click: 1st click opens ouo.io, 2nd click navigates to prompt page
  const handleImageOrDetailClick = (e: React.MouseEvent) => {
    const monetization = handleImageMonetization(prompt.id, prompt.customShortlink);
    if (monetization.shouldOpenLink && monetization.linkToOpen) {
      trackEvent('outbound_sponsored_click', {
        url: monetization.linkToOpen,
        promptTitle: prompt.title,
        promptSlug: prompt.slug,
      });
      e.preventDefault();
      try {
        window.open(monetization.linkToOpen, '_blank', 'noopener,noreferrer');
      } catch {
        // fallback
      }
      return;
    }
  };

  return (
    <>
      <div
        data-prompt-id={prompt.id}
        className="break-inside-avoid mb-6 w-full group relative flex flex-col bg-brand-card dark:bg-brand-card border border-brand-border hover:border-brand-violet/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-card hover:-translate-y-1"
      >
        {/* Image & Preview Container */}
        {isPreview ? (
          <div
            className={`relative w-full ${getAspectRatioClass()} overflow-hidden bg-brand-surface block`}
            aria-label={`Preview: ${prompt.title}`}
          >
            {/* Shimmer loading placeholder */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 animate-shimmer" />
            )}

            {/* Fallback if image fails to load */}
            {imageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-brand-surface text-brand-muted text-center">
                <Sparkles className="w-8 h-8 text-brand-violet mb-2 opacity-60" />
                <span className="text-xs font-medium">Reference Image Preview</span>
              </div>
            ) : (
              <img
                src={prompt.thumbnailUrl || prompt.imageUrl}
                alt={prompt.title}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}

            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10">
                  {prompt.category}
                </span>
                {prompt.isFree ? (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                    Free
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    Premium
                  </span>
                )}
              </div>
            </div>

            {/* Aspect ratio label on bottom right of image */}
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/60 text-white/90 backdrop-blur-md border border-white/10 pointer-events-none">
              {prompt.aspectRatio}
            </div>
          </div>
        ) : (
          <Link
            to={`/prompts/${prompt.slug}`}
            onClick={handleImageOrDetailClick}
            className={`relative w-full ${getAspectRatioClass()} overflow-hidden bg-brand-surface block focus:outline-none focus:ring-2 focus:ring-brand-violet`}
            aria-label={`View prompt: ${prompt.title}`}
          >
            {/* Shimmer loading placeholder */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 animate-shimmer" />
            )}

            {/* Fallback if image fails to load */}
            {imageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-brand-surface text-brand-muted text-center">
                <Sparkles className="w-8 h-8 text-brand-violet mb-2 opacity-60" />
                <span className="text-xs font-medium">Reference Image Preview</span>
              </div>
            ) : (
              <img
                src={prompt.thumbnailUrl || prompt.imageUrl}
                alt={prompt.title}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}

            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10">
                  {prompt.category}
                </span>
                {prompt.isFree ? (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                    Free
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    Premium
                  </span>
                )}
              </div>

              {/* Favorite toggle button */}
              <button
                type="button"
                onClick={handleFavoriteToggle}
                className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                  favorited
                    ? 'bg-rose-500 text-white shadow-glow-sm scale-105'
                    : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/80'
                }`}
                aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Aspect ratio label on bottom right of image */}
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/60 text-white/90 backdrop-blur-md border border-white/10 pointer-events-none">
              {prompt.aspectRatio}
            </div>
          </Link>
        )}

        {/* Card Body & Prompt Information */}
        <div className="p-4 flex flex-col space-y-3">
          <div>
            {isPreview ? (
              <h3 className="font-semibold text-base text-brand-text leading-snug line-clamp-1">
                {prompt.title}
              </h3>
            ) : (
              <Link
                to={`/prompts/${prompt.slug}`}
                className="group-hover:text-brand-lavender transition-colors"
              >
                <h3 className="font-semibold text-base text-brand-text leading-snug line-clamp-1">
                  {prompt.title}
                </h3>
              </Link>
            )}
            <p className="mt-1 text-xs text-brand-muted line-clamp-2 leading-relaxed">
              {prompt.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex items-center space-x-1.5 overflow-hidden">
            <Tag className="w-3 h-3 text-brand-subtle shrink-0" />
            <div className="flex items-center space-x-1 text-[11px] text-brand-muted truncate">
              {prompt.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border text-brand-muted text-[10px] truncate"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card Actions: View Prompt & 1-Click Copy */}
          <div className="pt-2 border-t border-brand-border flex items-center justify-between gap-2">
            {isPreview ? (
              <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-brand-muted py-1.5 opacity-60">
                <span>View Prompt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            ) : (
              <Link
                to={`/prompts/${prompt.slug}`}
                onClick={handleImageOrDetailClick}
                className="inline-flex items-center space-x-1.5 text-xs font-medium text-brand-muted hover:text-brand-lavender transition-colors py-1.5"
              >
                <span>View Prompt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : stepPending
                  ? 'bg-brand-violet-hover text-white shadow-glow-violet ring-2 ring-brand-lavender/50 animate-pulse'
                  : 'bg-brand-violet hover:bg-brand-violet-hover text-white shadow-glow-sm hover:shadow-glow-violet'
              }`}
              aria-label={`Copy prompt for ${prompt.title}`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : stepPending ? (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Click to Copy</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Fallback Modal if clipboard write is blocked */}
      <CopyFallbackModal
        isOpen={showFallbackModal}
        onClose={() => setShowFallbackModal(false)}
        promptText={prompt.promptText}
      />
    </>
  );
};
