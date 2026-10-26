import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CategoryCard } from './CategoryCard';

export const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-16 border-t border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-widest font-semibold mb-2">
              <Layers className="w-4 h-4 text-brand-violet" />
              <span>Curated Disciplines</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
              Explore by Visual Category
            </h2>
            <p className="mt-2 text-sm text-brand-muted max-w-xl">
              From cinematic sci-fi citadels to artisanal food styling, discover tested prompts organized by creative domain.
            </p>
          </div>

          <Link
            to="/categories"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-semibold text-brand-lavender hover:text-white transition-colors group"
          >
            <span>All 12 Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 12 Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
};
