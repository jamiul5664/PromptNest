import React, { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import type { FilterState } from '../types';
import { CATEGORIES } from '../data/categories';
import { getAllPrompts } from '../lib/prompts';

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  totalResults: number;
}

const STYLES = [
  'All Styles',
  'Cinematic Photography',
  '3D Octane Render',
  'Studio Commercial',
  'Fine Art Minimalist',
  'Monochrome High-Contrast',
  'Cinematic Concept Art',
  'Editorial Architecture',
  'Dark Food Editorial',
  'Vintage Watercolor Etching',
  'Material Render',
  '3D Isometric Diorama',
  'Editorial Fashion Portrait',
];

const ASPECT_RATIOS: { label: string; value: string }[] = [
  { label: 'All Ratios', value: 'all' },
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Landscape', value: '16:9' },
  { label: '9:16 Portrait', value: '9:16' },
  { label: '4:3 Standard', value: '4:3' },
  { label: '3:4 Vertical', value: '3:4' },
  { label: '21:9 Ultrawide', value: '21:9' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  totalResults,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Compute live search suggestions based on titles and tags
  useEffect(() => {
    if (filters.query.trim().length > 1) {
      const q = filters.query.toLowerCase().trim();
      const prompts = getAllPrompts();
      const matched = new Set<string>();

      prompts.forEach((p) => {
        if (p.title.toLowerCase().includes(q)) matched.add(p.title);
        p.tags.forEach((t) => {
          if (t.toLowerCase().includes(q)) matched.add(t);
        });
      });

      setSuggestions(Array.from(matched).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [filters.query]);

  // Click outside suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = Boolean(
    filters.query ||
    (filters.category && filters.category !== 'all') ||
    (filters.style && filters.style !== 'all') ||
    (filters.aspectRatio && filters.aspectRatio !== 'all') ||
    filters.pricing !== 'all' ||
    filters.isFeatured
  );

  const resetFilters = () => {
    onChange({
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
    <div className="w-full space-y-4">
      {/* Main Search Bar & Quick Toggles */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input with Live Suggestions */}
        <div className="relative flex-1" ref={suggestionsRef}>
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-brand-muted absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => onChange({ ...filters, query: e.target.value })}
              onFocus={() => setIsFocused(true)}
              placeholder="Search prompts, styles, colors, and ideas..."
              className="w-full pl-12 pr-10 py-3 bg-brand-card border border-brand-border rounded-xl text-brand-text placeholder-brand-muted text-sm focus:outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet transition-all"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, query: '' })}
                className="absolute right-3.5 p-1 rounded-md text-brand-muted hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {isFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-brand-card border border-brand-border rounded-xl shadow-2xl overflow-hidden z-30 divide-y divide-brand-border/40">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    onChange({ ...filters, query: suggestion });
                    setIsFocused(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-brand-text hover:bg-brand-violet/10 hover:text-brand-lavender flex items-center justify-between transition-colors"
                >
                  <span className="truncate">{suggestion}</span>
                  <Sparkles className="w-3.5 h-3.5 text-brand-violet shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls: Filter Toggle, Sort Selector, Reset */}
        <div className="flex items-center space-x-2">
          {/* Advanced Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center space-x-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              showAdvanced || hasActiveFilters
                ? 'bg-brand-violet/15 border-brand-violet text-brand-lavender'
                : 'bg-brand-card border-brand-border text-brand-muted hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-violet animate-pulse" />
            )}
          </button>

          {/* Sort By Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as FilterState['sortBy'],
              })
            }
            className="px-3.5 py-3 bg-brand-card border border-brand-border rounded-xl text-sm font-medium text-brand-text focus:outline-none focus:border-brand-violet"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="p-3 rounded-xl bg-brand-card border border-brand-border text-brand-muted hover:text-white hover:border-brand-violet/40 transition-colors"
              title="Reset all filters"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Advanced Filter Panel */}
      {showAdvanced && (
        <div className="p-5 rounded-2xl bg-brand-card/90 border border-brand-border backdrop-blur-md space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => onChange({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-brand-text focus:outline-none focus:border-brand-violet"
              >
                <option value="all">All Categories (12)</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Style Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                Visual Style
              </label>
              <select
                value={filters.style}
                onChange={(e) => onChange({ ...filters, style: e.target.value })}
                className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-brand-text focus:outline-none focus:border-brand-violet"
              >
                {STYLES.map((st) => (
                  <option key={st} value={st === 'All Styles' ? 'all' : st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                Aspect Ratio
              </label>
              <select
                value={filters.aspectRatio}
                onChange={(e) => onChange({ ...filters, aspectRatio: e.target.value })}
                className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-brand-text focus:outline-none focus:border-brand-violet"
              >
                {ASPECT_RATIOS.map((ar) => (
                  <option key={ar.value} value={ar.value}>
                    {ar.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                License / Tier
              </label>
              <select
                value={filters.pricing}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    pricing: e.target.value as FilterState['pricing'],
                  })
                }
                className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-brand-text focus:outline-none focus:border-brand-violet"
              >
                <option value="all">All Prompts (Free & Premium)</option>
                <option value="free">100% Free Prompts</option>
                <option value="premium">Premium Showcase</option>
              </select>
            </div>
          </div>

          {/* Quick Checkbox Chips */}
          <div className="pt-2 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.isFeatured}
                  onChange={(e) => onChange({ ...filters, isFeatured: e.target.checked })}
                  className="rounded border-brand-border text-brand-violet focus:ring-brand-violet"
                />
                <span className="text-brand-text font-medium">Show only Featured Prompts</span>
              </label>
            </div>

            <div className="text-brand-muted">
              Showing <strong className="text-brand-text">{totalResults}</strong> matching results
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
