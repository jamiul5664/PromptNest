import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Layers, Check } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

const POPULAR_CHIPS = [
  { label: 'Nature', query: 'Nature' },
  { label: 'Product Photography', query: 'Product Photography' },
  { label: 'Abstract', query: 'Abstract' },
  { label: 'Architecture', query: 'Architecture' },
  { label: 'Fantasy', query: 'Fantasy' },
  { label: 'Silhouette', query: 'Silhouette' },
  { label: '3D Art', query: '3D Art' },
];

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      trackEvent('search_submission', { searchQuery: searchTerm.trim() });
      navigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleChipClick = (query: string) => {
    trackEvent('search_submission', { searchQuery: query });
    navigate(`/explore?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-violet/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-brand-lavender/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines, Search, and CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Tagline Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-violet/10 border border-brand-violet/25 text-brand-lavender text-xs font-semibold backdrop-blur-sm shadow-glow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
              <span>See It. Copy It. Create It.</span>
            </div>

            {/* Confident Headline & Subtitle */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-brand-text leading-[1.12]">
                Find Your Next{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet via-brand-lavender to-white">
                  AI Creation
                </span>
              </h1>
              <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover inspiring visuals, copy powerful prompts, and bring your creative ideas to life across Midjourney, Flux, Stable Diffusion, and DALL-E.
              </p>
            </div>

            {/* Prominent Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto lg:mx-0">
              <div className="relative flex items-center bg-brand-card/95 border border-brand-border hover:border-brand-violet/60 rounded-2xl p-2 shadow-2xl transition-all duration-300 focus-within:border-brand-violet focus-within:shadow-glow-sm">
                <Search className="w-5 h-5 text-brand-muted ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search prompts, styles, colors, and ideas..."
                  className="w-full bg-transparent px-4 py-2.5 text-sm sm:text-base text-brand-text placeholder-brand-muted focus:outline-none"
                  aria-label="Search prompt database"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-xs sm:text-sm font-semibold transition-all shrink-0 shadow-glow-sm hover:shadow-glow-violet"
                >
                  Search
                </button>
              </div>

              {/* Popular Search Chips */}
              <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs">
                <span className="text-brand-subtle font-medium mr-1">Trending:</span>
                {POPULAR_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleChipClick(chip.query)}
                    className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-violet/50 text-brand-muted hover:text-white transition-all text-[11px] font-medium"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </form>

            {/* Dual CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                to="/explore"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-semibold transition-all shadow-glow-sm hover:shadow-glow-violet"
              >
                <span>Explore Prompts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-card hover:bg-brand-card-hover border border-brand-border text-brand-text text-sm font-semibold transition-all"
              >
                <Layers className="w-4 h-4 text-brand-violet" />
                <span>Browse Categories</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Curated Visual Mosaic of Reference Art */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none grid grid-cols-2 gap-4">
              {/* Mosaic Card 1 */}
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-brand-border shadow-card aspect-[3/4] group">
                  <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                    alt="Nordic Fjord reference"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[10px] uppercase font-semibold text-brand-lavender">Nordic Fjord</span>
                    <span className="text-xs text-white font-medium line-clamp-1">Cinematic 35mm Landscape</span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-brand-border shadow-card aspect-square group">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
                    alt="Luxury perfume reference"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[10px] uppercase font-semibold text-brand-lavender">Product Studio</span>
                    <span className="text-xs text-white font-medium line-clamp-1">Matte Ceramic Bottle</span>
                  </div>
                </div>
              </div>

              {/* Mosaic Card 2 */}
              <div className="space-y-4 pt-6">
                <div className="relative rounded-2xl overflow-hidden border border-brand-border shadow-card aspect-square group">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
                    alt="Iridescent liquid art"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[10px] uppercase font-semibold text-brand-lavender">Abstract 3D</span>
                    <span className="text-xs text-white font-medium line-clamp-1">Iridescent Silk Ribbon</span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-brand-border shadow-card aspect-[3/4] group">
                  <img
                    src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80"
                    alt="Monochrome silhouette reference"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[10px] uppercase font-semibold text-brand-lavender">Monochrome</span>
                    <span className="text-xs text-white font-medium line-clamp-1">Lone Oak at Twilight</span>
                  </div>
                </div>
              </div>

              {/* Floating verified badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-brand-card/95 border border-brand-violet/40 shadow-glow-sm backdrop-blur-md flex items-center space-x-2 text-xs text-brand-text whitespace-nowrap">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>100% Tested Prompts with Camera Specs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
