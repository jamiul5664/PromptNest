import { useState, useEffect, useCallback } from 'react';
import { trackEvent } from '../lib/analytics';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const FAVORITES_STORAGE_KEY = 'promptvista_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync state across multiple tabs or components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY && e.newValue) {
        try {
          setFavorites(JSON.parse(e.newValue));
        } catch {
          // ignore error
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = useCallback(
    async (promptId: string) => {
      setFavorites((prev) => {
        const exists = prev.includes(promptId);
        const next = exists ? prev.filter((id) => id !== promptId) : [...prev, promptId];
        
        try {
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save favorite', e);
        }

        trackEvent('favorite_toggle', {
          promptId,
          favoriteState: !exists,
        });

        // Optional Supabase sync if user is logged in
        const client = supabase;
        if (isSupabaseConfigured && client) {
          client.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              if (!exists) {
                client.from('user_favorites').upsert({ user_id: user.id, prompt_id: promptId });
              } else {
                client.from('user_favorites').delete().match({ user_id: user.id, prompt_id: promptId });
              }
            }
          });
        }

        return next;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (promptId: string) => {
      return favorites.includes(promptId);
    },
    [favorites]
  );

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  }, []);

  return {
    favorites,
    favoritesCount: favorites.length,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
  };
}
