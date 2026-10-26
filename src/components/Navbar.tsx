import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Layers,
  Flame,
  Gift,
  Heart,
  Sun,
  Moon,
  User,
  Menu,
  X,
  Search,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useFavorites } from '../hooks/useFavorites';
import { AuthModal } from './AuthModal';
import { getCurrentUser, signOutUser } from '../lib/userAuth';
import type { UserProfile } from '../lib/userAuth';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('promptvista_user_auth_change', handleAuthChange);
    return () => window.removeEventListener('promptvista_user_auth_change', handleAuthChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    setUserMenuOpen(false);
  };

  const navLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Trending', path: '/explore?sort=newest&featured=true', icon: Flame },
    { name: 'Free Prompts', path: '/free-prompts', icon: Gift },
  ];

  const isActive = (path: string) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-brand-border/80 bg-brand-bg/85 dark:bg-brand-bg/85 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <Link
            to="/"
            className="flex items-center space-x-3 group focus:outline-none"
            aria-label="PromptVista Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-lavender p-0.5 shadow-glow-sm group-hover:shadow-glow-violet transition-all duration-300">
              <div className="w-full h-full bg-brand-bg rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-violet group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-brand-text group-hover:text-brand-lavender transition-colors">
                PromptVista
              </span>
              <span className="text-[10px] uppercase tracking-wider text-brand-muted hidden sm:block font-medium -mt-1">
                See It. Copy It. Create It.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-brand-lavender bg-brand-card border border-brand-border shadow-sm'
                      : 'text-brand-muted hover:text-brand-text hover:bg-brand-card/50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-violet shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Explore / Search Link */}
            <Link
              to="/explore"
              className="p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-card border border-transparent hover:border-brand-border transition-colors"
              title="Search prompts"
              aria-label="Search prompts"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-card border border-transparent hover:border-brand-border transition-colors"
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-brand-violet" />}
            </button>

            {/* Favorites Icon & Live Badge */}
            <Link
              to="/favorites"
              className="relative p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-card border border-transparent hover:border-brand-border transition-colors"
              title="View saved favorites"
              aria-label={`View saved favorites (${favoritesCount})`}
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-sm animate-fade-in">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Sign In / User Profile Menu */}
            {currentUser ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border border-brand-border bg-brand-card hover:border-brand-violet/50 text-xs font-semibold text-brand-text transition-all shadow-sm"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff'}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover border border-brand-violet/40"
                  />
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-muted" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-brand-card border border-brand-border shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                    <div className="px-3 py-2 border-b border-brand-border/60">
                      <p className="text-xs font-bold text-brand-text truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-brand-muted truncate font-mono">{currentUser.email}</p>
                    </div>

                    <Link
                      to="/favorites"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-brand-text hover:bg-brand-surface transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>My Saved Prompts ({favoritesCount})</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 w-full transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-brand-border bg-brand-card hover:border-brand-violet/50 text-xs font-semibold text-brand-text transition-all hover:shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-brand-violet" />
                <span>Sign In / Gmail</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-card border border-brand-border"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-brand-border bg-brand-bg px-4 pt-2 pb-6 space-y-2 animate-fade-in">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    active
                      ? 'bg-brand-violet/15 text-brand-lavender border border-brand-violet/30'
                      : 'text-brand-muted hover:text-white hover:bg-brand-card'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-violet" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-brand-border">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-brand-card border border-brand-border">
                    <img
                      src={currentUser.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff'}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full border border-brand-violet/40"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-text truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-brand-muted truncate font-mono">{currentUser.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 text-xs text-rose-400 font-semibold px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 w-full"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center space-x-2 text-sm text-brand-text font-semibold px-3 py-2.5 rounded-xl bg-brand-card border border-brand-border w-full justify-center shadow-sm"
                >
                  <User className="w-4 h-4 text-brand-violet" />
                  <span>Sign In with Gmail</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth & Sync Status Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
