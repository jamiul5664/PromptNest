import React from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryCard } from '../components/CategoryCard';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { Layers } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  useDocumentHead({
    title: 'Visual Disciplines & Categories',
    description:
      'Explore 12 curated AI image categories: Nature, Product Photography, Abstract, Minimalist, Silhouettes, Sci-Fi Fantasy, Architecture, Food, Botanical, 3D Art, and Editorial.',
  });

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      <div className="space-y-3 max-w-3xl">
        <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-widest font-semibold">
          <Layers className="w-4 h-4 text-brand-violet" />
          <span>Curated Disciplines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
          Browse Categories
        </h1>
        <p className="text-sm text-brand-muted leading-relaxed">
          Discover prompt recipes organized by artistic domain, visual medium, and lighting style. Each category is verified with real reference generations and exact parameter recipes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
};
