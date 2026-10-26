import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ArrowRight, Wand2 } from 'lucide-react';
import { Hero } from '../components/Hero';
import { FeaturedCategories } from '../components/FeaturedCategories';
import { HowItWorks } from '../components/HowItWorks';
import { PromptGrid } from '../components/PromptGrid';
import { getFeaturedPrompts, getRecentPrompts } from '../lib/prompts';
import { useDocumentHead } from '../hooks/useDocumentHead';

export const HomePage: React.FC = () => {
  useDocumentHead({
    title: 'See It. Copy It. Create It.',
    description:
      'PromptVista is the premier AI image prompt discovery platform. Browse high-resolution reference images, copy battle-tested prompts, and generate stunning visuals.',
  });

  const featuredPrompts = getFeaturedPrompts().slice(0, 8);
  const recentPrompts = getRecentPrompts(8);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <Hero />

      {/* Featured Categories (12 Disciplines) */}
      <FeaturedCategories />

      {/* Trending / Featured Prompts Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-widest font-semibold mb-2">
              <Flame className="w-4 h-4 text-brand-violet" />
              <span>Community Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
              Trending Prompts
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Carefully curated prompts generating exceptional aesthetic fidelity.
            </p>
          </div>

          <Link
            to="/explore?featured=true"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-sm font-semibold text-brand-lavender hover:text-white transition-colors group"
          >
            <span>View All Trending</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <PromptGrid prompts={featuredPrompts} />
      </section>

      {/* Recently Added Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-brand-border/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-widest font-semibold mb-2">
              <Clock className="w-4 h-4 text-brand-violet" />
              <span>Fresh Additions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
              Recently Added
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              The newest verified prompt formulas added to the PromptVista directory.
            </p>
          </div>

          <Link
            to="/explore?sort=newest"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-sm font-semibold text-brand-lavender hover:text-white transition-colors group"
          >
            <span>Browse Newest</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <PromptGrid prompts={recentPrompts} />
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Editorial Creator Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-card via-[#1e1c2d] to-brand-card border border-brand-border p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-violet/20 text-brand-lavender text-xs font-semibold border border-brand-violet/30">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Prompt Engineering Community</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
              Have an extraordinary prompt recipe to share?
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Contribute your tested parameters, camera setups, and negative prompt formulas to help thousands of digital creators achieve gallery-grade results.
            </p>
          </div>

          <Link
            to="/explore"
            className="px-6 py-3.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-bold shadow-glow-sm hover:shadow-glow-violet transition-all whitespace-nowrap"
          >
            Explore All Prompts
          </Link>
        </div>
      </section>
    </div>
  );
};
