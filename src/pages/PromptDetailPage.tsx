import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  Heart,
  Share2,
  Flag,
  Sparkles,
  ArrowLeft,
  Maximize2,
  X,
  ExternalLink,
  Shield,
  Wand2,
  Info,
} from 'lucide-react';
import { getPromptBySlug, getRelatedPrompts } from '../lib/prompts';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../hooks/useFavorites';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { PromptGrid } from '../components/PromptGrid';
import { CopyFallbackModal } from '../components/CopyFallbackModal';
import { ReportModal } from '../components/ReportModal';
import { getRelevantResourceForPrompt, handleCopyMonetization } from '../lib/monetization';
import { trackEvent } from '../lib/analytics';

export const PromptDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [stepPending, setStepPending] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [fallbackModalOpen, setFallbackModalOpen] = useState(false);

  const prompt = slug ? getPromptBySlug(slug) : undefined;

  // SEO document head
  useDocumentHead({
    title: prompt ? `${prompt.title} - AI Prompt Recipe` : 'Prompt Not Found',
    description: prompt
      ? `${prompt.description} Copy full tested prompt with camera parameters and aspect ratio for Midjourney, Flux, SDXL.`
      : undefined,
    imageUrl: prompt?.imageUrl,
    canonicalUrl: prompt ? `https://promptvista.pages.dev/prompts/${prompt.slug}` : undefined,
  });

  if (!prompt) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <h2 className="text-3xl font-black text-brand-text mb-4">Prompt Not Found</h2>
        <p className="text-sm text-brand-muted mb-8 leading-relaxed">
          The requested prompt reference could not be located or may have been updated.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-semibold transition-all shadow-glow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Prompt Library</span>
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(prompt.id);
  const relatedPrompts = getRelatedPrompts(prompt, 4);
  const sponsoredPartner = getRelevantResourceForPrompt(prompt.category);

  // Copy Prompt handler with 2-step shortener support
  const handleCopyPrompt = async () => {
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
      setCopiedPrompt(true);
      showToast('Prompt copied to clipboard! Ready to paste into your AI generator.', 'success');
      trackEvent('prompt_copy_success', {
        promptId: prompt.id,
        promptSlug: prompt.slug,
        method: result.method,
      });
      setTimeout(() => setCopiedPrompt(false), 2500);
    } else {
      setFallbackModalOpen(true);
    }
  };

  // Copy Negative Prompt handler
  const handleCopyNegative = async () => {
    if (!prompt.negativePrompt) return;
    const result = await copyToClipboard(prompt.negativePrompt);
    if (result.success) {
      setCopiedNegative(true);
      showToast('Negative prompt copied to clipboard!', 'success');
      setTimeout(() => setCopiedNegative(false), 2500);
    } else {
      setFallbackModalOpen(true);
    }
  };

  // Share handler via Web Share API or copy link
  const handleShare = async () => {
    const shareData = {
      title: `${prompt.title} | PromptVista`,
      text: `Check out this AI image prompt on PromptVista: ${prompt.title}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        trackEvent('share_action', { promptSlug: prompt.slug, method: 'web_share' });
        return;
      } catch (err) {
        // User cancelled or unsupported
      }
    }

    // Fallback: copy link to clipboard
    const res = await copyToClipboard(window.location.href);
    if (res.success) {
      showToast('Link copied to clipboard! Share it with friends.', 'success');
      trackEvent('share_action', { promptSlug: prompt.slug, method: 'copy_link' });
    } else {
      showToast('Please copy the page URL from your address bar.', 'info');
    }
  };

  return (
    <div
      data-prompt-id={prompt.id}
      className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in"
    >
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-brand-muted">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/category/${prompt.categorySlug}`} className="hover:text-white transition-colors">
            {prompt.category}
          </Link>
          <span>/</span>
          <span className="text-brand-text truncate max-w-[200px]">{prompt.title}</span>
        </div>
      </div>

      {/* Main Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Large Reference Image */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-brand-border bg-brand-surface group shadow-2xl">
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="w-full h-auto max-h-[750px] object-contain mx-auto transition-transform duration-300"
            />

            {/* Quick overlay controls */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-all shadow-md"
                title="View full resolution in lightbox"
                aria-label="Enlarge image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Metadata Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between text-xs text-white/90">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md font-mono text-[11px]">
                  Aspect {prompt.aspectRatio}
                </span>
                {prompt.dimensions && (
                  <span className="text-[11px] text-white/70 hidden sm:inline">
                    {prompt.dimensions}
                  </span>
                )}
              </div>

              {prompt.author && (
                <div className="text-[11px] text-white/80">
                  Photo by{' '}
                  {prompt.author.profileUrl ? (
                    <a
                      href={prompt.author.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-white"
                    >
                      {prompt.author.name}
                    </a>
                  ) : (
                    <span>{prompt.author.name}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* License & Community Report Action */}
          <div className="flex items-center justify-between text-xs text-brand-muted px-2">
            <span className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{prompt.license}</span>
            </span>

            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center space-x-1 text-brand-muted hover:text-rose-400 transition-colors"
            >
              <Flag className="w-3 h-3" />
              <span>Report Content</span>
            </button>
          </div>
        </div>

        {/* Right Column: Prompt Details, Copy Panel, Tool Guidance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Badges */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link
                to={`/category/${prompt.categorySlug}`}
                className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-brand-violet/15 text-brand-lavender border border-brand-violet/25 hover:bg-brand-violet/25 transition-colors"
              >
                {prompt.category}
              </Link>
              <span className="text-xs text-brand-muted font-medium px-2 py-0.5 rounded bg-brand-surface border border-brand-border">
                {prompt.style}
              </span>
              {prompt.isFree ? (
                <span className="px-2 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20">
                  Free
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-semibold text-amber-300 bg-amber-500/10 rounded border border-amber-500/20">
                  Premium
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight leading-snug">
              {prompt.title}
            </h1>
            <p className="mt-2 text-sm text-brand-muted leading-relaxed">
              {prompt.description}
            </p>
          </div>

          {/* Social / Interaction Bar */}
          <div className="flex items-center space-x-3 py-1">
            <button
              type="button"
              onClick={() => {
                toggleFavorite(prompt.id);
                showToast(
                  favorited ? 'Removed from favorites' : 'Saved to favorites!',
                  'info'
                );
              }}
              className={`flex-1 inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                favorited
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-sm'
                  : 'bg-brand-card border-brand-border text-brand-text hover:bg-brand-surface'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current text-rose-500' : ''}`} />
              <span>{favorited ? 'Saved in Favorites' : 'Save to Favorites'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-surface text-brand-text text-xs font-semibold transition-all"
              title="Share prompt link"
            >
              <Share2 className="w-4 h-4 text-brand-lavender" />
              <span>Share</span>
            </button>
          </div>

          {/* Prominent Copy Prompt Panel */}
          <div className="p-5 rounded-2xl bg-brand-card border border-brand-border shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-violet" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-lavender">
                  Generation Prompt
                </span>
              </div>
              <span className="text-[11px] text-brand-muted font-mono">
                {prompt.promptText.length} characters
              </span>
            </div>

            {/* Read-only selectable prompt box */}
            <div className="relative group/box">
              <textarea
                readOnly
                value={prompt.promptText}
                rows={5}
                className="w-full p-3.5 bg-brand-bg border border-brand-border rounded-xl text-xs sm:text-sm font-mono text-brand-text leading-relaxed select-all focus:outline-none focus:border-brand-violet resize-none"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>

            {/* Big 1-Click Copy CTA */}
            <button
              type="button"
              onClick={handleCopyPrompt}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-glow-sm ${
                copiedPrompt
                  ? 'bg-emerald-500 text-white'
                  : stepPending
                  ? 'bg-brand-violet-hover text-white ring-2 ring-brand-lavender/50 shadow-glow-violet animate-pulse'
                  : 'bg-brand-violet hover:bg-brand-violet-hover text-white hover:shadow-glow-violet'
              }`}
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Prompt Copied to Clipboard!</span>
                </>
              ) : stepPending ? (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Click Once More to Copy Prompt</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Prompt (One Click)</span>
                </>
              )}
            </button>
          </div>

          {/* Negative Prompt Panel (when present) */}
          {prompt.negativePrompt && (
            <div className="p-4 rounded-xl bg-brand-card/60 border border-brand-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400">
                  Negative Prompt / Exclusions
                </span>
                <button
                  type="button"
                  onClick={handleCopyNegative}
                  className="text-xs font-medium text-brand-lavender hover:text-white flex items-center space-x-1"
                >
                  {copiedNegative ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNegative ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs font-mono text-brand-muted bg-brand-bg p-2.5 rounded-lg select-all">
                {prompt.negativePrompt}
              </p>
            </div>
          )}

          {/* Compatible AI Image Generators */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              <Wand2 className="w-3.5 h-3.5 text-brand-violet" />
              <span>Suggested Compatible Tools</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {prompt.suggestedTools.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1.5 rounded-lg bg-brand-card border border-brand-border text-xs font-medium text-brand-text flex items-center space-x-1"
                >
                  <span>{tool}</span>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-brand-subtle flex items-start space-x-1">
              <Info className="w-3 h-3 shrink-0 mt-0.5 text-brand-muted" />
              <span>Compatible with leading models. PromptVista is not affiliated or partnered with listed third parties.</span>
            </p>
          </div>

          {/* Tags */}
          <div className="pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted block mb-2">
              Keywords & Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/explore?q=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-xs text-brand-muted hover:text-brand-lavender hover:border-brand-violet/40 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Optional Sponsored Resource / Compute Partner (Isolated) */}
          {sponsoredPartner && (
            <div className="p-4 rounded-xl bg-brand-card/70 border border-brand-border/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-brand-violet/20 text-brand-lavender font-semibold text-[10px]">
                  {sponsoredPartner.badgeText}
                </span>
                <span className="text-brand-subtle text-[10px]">{sponsoredPartner.sponsorName}</span>
              </div>
              <h4 className="font-semibold text-brand-text">{sponsoredPartner.title}</h4>
              <p className="text-brand-muted text-[11px] leading-relaxed">
                {sponsoredPartner.description}
              </p>
              <a
                href={sponsoredPartner.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent('outbound_sponsored_click', {
                    sponsorId: sponsoredPartner.id,
                    promptSlug: prompt.slug,
                  })
                }
                className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-lavender hover:text-white pt-1"
              >
                <span>Visit {sponsoredPartner.sponsorName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Related Prompts Section */}
      {relatedPrompts.length > 0 && (
        <section className="pt-12 border-t border-brand-border/60 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-text">
                Related Prompts & Variations
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Similar aesthetics and creative recipes in {prompt.category}.
              </p>
            </div>
            <Link
              to={`/category/${prompt.categorySlug}`}
              className="text-xs font-semibold text-brand-lavender hover:underline"
            >
              See all in {prompt.category}
            </Link>
          </div>

          <PromptGrid prompts={relatedPrompts} />
        </section>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={prompt.imageUrl}
            alt={prompt.title}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Manual Copy Fallback Modal */}
      <CopyFallbackModal
        isOpen={fallbackModalOpen}
        onClose={() => setFallbackModalOpen(false)}
        promptText={prompt.promptText}
      />

      {/* Content Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        promptSlug={prompt.slug}
        promptTitle={prompt.title}
      />
    </div>
  );
};
