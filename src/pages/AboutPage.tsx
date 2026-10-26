import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, ArrowRight, Eye, Copy, Wand2 } from 'lucide-react';
import { useDocumentHead } from '../hooks/useDocumentHead';

export const AboutPage: React.FC = () => {
  useDocumentHead({
    title: 'About PromptVista — See It. Copy It. Create It.',
    description:
      'PromptVista is the premier editorial AI art prompt discovery platform. Learn about our curation principles, attribution ethics, and prompt engineering mission.',
  });

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in text-brand-text">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-violet/15 text-brand-lavender text-xs font-semibold border border-brand-violet/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Independent AI Discovery</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-brand-text">
          About PromptVista
        </h1>
        <p className="text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
          Democratizing prompt engineering by bridging the gap between visual inspiration and technical parameter syntax.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="p-8 rounded-3xl bg-brand-card border border-brand-border space-y-4 shadow-xl">
        <h2 className="text-2xl font-bold text-brand-text">Our Philosophy</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          Prompt engineering has evolved into a new creative dialect. Achieving gallery-grade AI images requires understanding camera lenses, film stocks, octane lighting caustics, and negative exclusions.
        </p>
        <p className="text-sm text-brand-muted leading-relaxed">
          PromptVista was born out of frustration with low-quality prompt dumps and spam aggregators. We curate only authentic, editorial-grade visual references paired with the precise parameters used to synthesize them.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
          <Eye className="w-6 h-6 text-brand-violet" />
          <h3 className="font-bold text-base text-brand-text">See It</h3>
          <p className="text-xs text-brand-muted leading-relaxed">
            Discover real aesthetic references with verified aspect ratios, color palettes, and lighting setups across 12 creative disciplines.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
          <Copy className="w-6 h-6 text-brand-lavender" />
          <h3 className="font-bold text-base text-brand-text">Copy It</h3>
          <p className="text-xs text-brand-muted leading-relaxed">
            One-click reliable clipboard copying. No misleading countdowns, fake buttons, paywalls, or forced ad redirects.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
          <Wand2 className="w-6 h-6 text-emerald-400" />
          <h3 className="font-bold text-base text-brand-text">Create It</h3>
          <p className="text-xs text-brand-muted leading-relaxed">
            Take prompts into Midjourney v6, Flux.1, Stable Diffusion XL, or DALL-E 3 and iterate your own original masterpieces.
          </p>
        </div>
      </div>

      {/* Ethical Platform Disclaimer */}
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-3">
        <div className="flex items-center space-x-2 text-brand-lavender font-bold text-base">
          <Shield className="w-5 h-5 text-brand-violet" />
          <span>Independent Platform & Licensing Ethics</span>
        </div>
        <p className="text-xs text-brand-muted leading-relaxed">
          PromptVista operates independently and is not sponsored by or affiliated with Midjourney Inc., Stability AI, Black Forest Labs, or OpenAI. Reference visuals in our catalog are drawn from public domain works, licensed creative commons, and authenticated creator submissions with transparent attributions.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/explore"
          className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-semibold transition-all shadow-glow-sm"
        >
          <span>Start Exploring Prompts</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
