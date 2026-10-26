import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { handleFirstSiteTouch, handleButtonMonetization } from './lib/monetization';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PromptDetailPage } from './pages/PromptDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { FreePromptsPage } from './pages/FreePromptsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { recordPageView, initVisitorHeartbeat, trackEvent } from './lib/analytics';

// Scroll to top upon page navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Track real-time public page views and active visitor heartbeats
function AnalyticsRouteTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    recordPageView(pathname, document.title);
    const cleanup = initVisitorHeartbeat(pathname, document.title);
    return cleanup;
  }, [pathname]);

  return null;
}

export function App() {
  useEffect(() => {
    // 1. Listen for the first touch/click anywhere on the website (if enabled)
    const handleGlobalInteraction = () => {
      handleFirstSiteTouch();
    };

    // 2. Global Button & Clickable Interceptor:
    // Triggers 2-step monetization on ANY button/link
    // EXCEPT: Search, Explore, Categories, Trending, Free Prompts!
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('button, a, [role="button"]') as HTMLElement | null;
      if (!clickable) return;

      const monetization = handleButtonMonetization(clickable);
      if (monetization.shouldOpenLink && monetization.linkToOpen) {
        trackEvent('outbound_sponsored_click', { url: monetization.linkToOpen });
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        try {
          window.open(monetization.linkToOpen, '_blank', 'noopener,noreferrer');
        } catch {
          // fallback
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    window.addEventListener('click', handleGlobalInteraction, { capture: true });
    window.addEventListener('touchstart', handleGlobalInteraction, { capture: true });

    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
      window.removeEventListener('click', handleGlobalInteraction, { capture: true });
      window.removeEventListener('touchstart', handleGlobalInteraction, { capture: true });
    };
  }, []);

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <AnalyticsRouteTracker />
        <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text transition-colors duration-200">
          {/* Top Navigation */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/prompts/:slug" element={<PromptDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:slug" element={<CategoryDetailPage />} />
              <Route path="/free-prompts" element={<FreePromptsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Global Editorial Footer */}
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
