import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { CategoryItem } from '../types';
import { getPromptCountByCategory } from '../lib/prompts';

interface CategoryCardProps {
  category: CategoryItem;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const count = getPromptCountByCategory(category.slug);

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative rounded-2xl overflow-hidden border border-brand-border hover:border-brand-violet/50 bg-brand-card transition-all duration-300 hover:shadow-card hover:-translate-y-1 block aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-brand-violet"
      aria-label={`Explore ${category.name} (${count} prompts)`}
    >
      {/* Category Image */}
      <img
        src={category.imageUrl}
        alt={category.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:via-black/50" />

      {/* Card Content Overlay */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-lavender/90 bg-brand-violet/20 px-2 py-0.5 rounded backdrop-blur-sm border border-brand-violet/30">
            {count} {count === 1 ? 'Prompt' : 'Prompts'}
          </span>
          <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-brand-lavender transition-colors line-clamp-1">
          {category.name}
        </h3>
        <p className="text-xs text-white/70 line-clamp-1 mt-0.5 leading-relaxed">
          {category.description}
        </p>
      </div>
    </Link>
  );
};
