import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Compass } from 'lucide-react';
import { useDocumentHead } from '../hooks/useDocumentHead';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useDocumentHead({
    title: '404 - Page Not Found',
    description: 'The requested page could not be found on PromptVista.',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="py-24 max-w-xl mx-auto px-4 text-center space-y-8 animate-fade-in">
      <div className="space-y-3">
        <span className="text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-brand-violet to-brand-lavender">
          404
        </span>
        <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
          The page or prompt you were looking for seems to have drifted into an alternate latent space. Search our library below or return home.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto">
        <div className="relative flex items-center bg-brand-card border border-brand-border rounded-2xl p-1.5 shadow-xl focus-within:border-brand-violet">
          <Search className="w-5 h-5 text-brand-muted ml-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts or styles..."
            className="w-full bg-transparent px-3 py-2 text-sm text-brand-text placeholder-brand-muted focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-card hover:bg-brand-surface border border-brand-border text-xs font-semibold text-brand-text transition-all"
        >
          <Home className="w-4 h-4 text-brand-violet" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-xs font-semibold transition-all shadow-glow-sm"
        >
          <Compass className="w-4 h-4" />
          <span>Browse Library</span>
        </Link>
      </div>
    </div>
  );
};
