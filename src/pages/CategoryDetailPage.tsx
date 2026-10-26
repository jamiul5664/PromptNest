import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import { getAllPrompts } from '../lib/prompts';
import { PromptGrid } from '../components/PromptGrid';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { ArrowLeft } from 'lucide-react';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const category = CATEGORIES.find((c) => c.slug === slug);
  const prompts = getAllPrompts().filter((p) => p.categorySlug === slug);

  useDocumentHead({
    title: category ? `${category.name} AI Image Prompts` : 'Category Not Found',
    description: category
      ? `Discover tested AI image generation prompts for ${category.name}. Copy lighting formulas, camera setups, and negative prompts.`
      : undefined,
    imageUrl: category?.imageUrl,
    canonicalUrl: category ? `https://promptvista.pages.dev/category/${category.slug}` : undefined,
  });

  if (!category) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold text-brand-text mb-3">Category Not Found</h2>
        <p className="text-sm text-brand-muted mb-6">
          The category you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/categories"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-violet text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Categories</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-brand-border bg-brand-card p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover opacity-20 filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/90 to-transparent" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <Link
            to="/categories"
            className="inline-flex items-center space-x-1.5 text-xs text-brand-lavender hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-brand-violet/20 border border-brand-violet/30 text-brand-lavender text-xs font-semibold">
              {prompts.length} {prompts.length === 1 ? 'Prompt' : 'Prompts'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-text tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-text">
            Prompts in {category.name}
          </h2>
          <span className="text-xs text-brand-muted">
            Showing {prompts.length} results
          </span>
        </div>

        <PromptGrid
          prompts={prompts}
          emptyTitle={`No prompts yet in ${category.name}`}
          emptySubtitle="Check back soon as new verified recipes are added regularly."
        />
      </div>
    </div>
  );
};
