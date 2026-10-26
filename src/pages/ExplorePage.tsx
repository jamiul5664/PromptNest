import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/FilterBar';
import { PromptGrid } from '../components/PromptGrid';
import { getAllPrompts, filterAndSortPrompts } from '../lib/prompts';
import type { FilterState } from '../types';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { Compass } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState<FilterState>(() => ({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    style: searchParams.get('style') || 'all',
    aspectRatio: searchParams.get('ar') || 'all',
    pricing: (searchParams.get('pricing') as any) || 'all',
    isFeatured: searchParams.get('featured') === 'true',
    sortBy: (searchParams.get('sort') as any) || 'newest',
  }));

  // Synchronize state with URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.style !== 'all') params.set('style', filters.style);
    if (filters.aspectRatio !== 'all') params.set('ar', filters.aspectRatio);
    if (filters.pricing !== 'all') params.set('pricing', filters.pricing);
    if (filters.isFeatured) params.set('featured', 'true');
    if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  useDocumentHead({
    title: filters.query ? `Search: "${filters.query}"` : 'Explore AI Prompts & Art References',
    description:
      'Search and filter hundreds of verified AI image prompts by style, category, aspect ratio, and creation tools.',
  });

  const allPrompts = useMemo(() => getAllPrompts(), []);

  const filteredPrompts = useMemo(() => {
    return filterAndSortPrompts(allPrompts, filters);
  }, [allPrompts, filters]);

  const handleResetFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      style: 'all',
      aspectRatio: 'all',
      pricing: 'all',
      isFeatured: false,
      sortBy: 'newest',
    });
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-widest font-semibold">
          <Compass className="w-4 h-4 text-brand-violet" />
          <span>Curated Prompt Repository</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
          Explore Prompt Library
        </h1>
        <p className="text-sm text-brand-muted max-w-2xl leading-relaxed">
          Filter through tested prompt recipes by style, aspect ratio, camera settings, and AI generation model compatibility.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        totalResults={filteredPrompts.length}
      />

      {/* Results Grid */}
      <PromptGrid
        prompts={filteredPrompts}
        emptyTitle={filters.query ? `No results for "${filters.query}"` : 'No prompts match the active filters'}
        emptySubtitle="Try widening your search terms, changing the visual style, or clearing specific filters."
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};
