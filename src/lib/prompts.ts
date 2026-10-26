import { SEED_PROMPTS } from '../data/seedPrompts';
import type { PromptRecord, FilterState, PromptCategorySlug } from '../types';

const LOCAL_PROMPTS_KEY = 'promptvista_custom_prompts';
const DELETED_PROMPTS_KEY = 'promptvista_deleted_prompt_ids';

/**
 * Returns list of prompt IDs deleted by the account holder.
 */
function getDeletedPromptIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DELETED_PROMPTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Returns all active prompts, combining seed data with user-added custom prompts,
 * excluding any prompts deleted by the account holder.
 */
export function getAllPrompts(): PromptRecord[] {
  let customPrompts: PromptRecord[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_PROMPTS_KEY);
      if (stored) {
        customPrompts = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse custom prompts from localStorage', e);
    }
  }

  const deletedIds = new Set(getDeletedPromptIds());

  // Combine custom first, then seed prompts, avoiding duplicates by id
  const map = new Map<string, PromptRecord>();
  customPrompts.forEach((p) => {
    if (!deletedIds.has(p.id)) {
      map.set(p.id, p);
    }
  });

  SEED_PROMPTS.forEach((p) => {
    if (!map.has(p.id) && !deletedIds.has(p.id)) {
      map.set(p.id, p);
    }
  });

  return Array.from(map.values());
}

/**
 * Find single prompt by slug.
 */
export function getPromptBySlug(slug: string): PromptRecord | undefined {
  const prompts = getAllPrompts();
  return prompts.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
}

/**
 * Returns prompts tagged as featured.
 */
export function getFeaturedPrompts(): PromptRecord[] {
  return getAllPrompts().filter((p) => p.isFeatured);
}

/**
 * Returns newest prompts ordered by creation date.
 */
export function getRecentPrompts(limit = 8): PromptRecord[] {
  return getAllPrompts()
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * Returns related prompts matching category or overlapping tags.
 */
export function getRelatedPrompts(currentPrompt: PromptRecord, limit = 4): PromptRecord[] {
  return getAllPrompts()
    .filter((p) => p.id !== currentPrompt.id)
    .map((p) => {
      let score = 0;
      if (p.categorySlug === currentPrompt.categorySlug) score += 5;
      const sharedTags = p.tags.filter((t) => currentPrompt.tags.includes(t));
      score += sharedTags.length * 2;
      return { prompt: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.prompt);
}

/**
 * Computes exact count of prompts per category based on actual dataset.
 */
export function getPromptCountByCategory(categorySlug: PromptCategorySlug | string): number {
  const all = getAllPrompts();
  return all.filter((p) => p.categorySlug === categorySlug).length;
}

/**
 * Robust client-side search, filtering, and sorting across all prompt fields.
 */
export function filterAndSortPrompts(prompts: PromptRecord[], filters: FilterState): PromptRecord[] {
  let result = prompts.filter((p) => {
    // 1. Text Search query
    if (filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchPrompt = p.promptText.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      const matchStyle = p.style.toLowerCase().includes(q);

      if (!matchTitle && !matchDesc && !matchPrompt && !matchCategory && !matchTags && !matchStyle) {
        return false;
      }
    }

    // 2. Category filter
    if (filters.category && filters.category !== 'all') {
      if (p.categorySlug !== filters.category && p.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    // 3. Visual style filter
    if (filters.style && filters.style !== 'all') {
      if (p.style.toLowerCase() !== filters.style.toLowerCase()) {
        return false;
      }
    }

    // 4. Aspect Ratio filter
    if (filters.aspectRatio && filters.aspectRatio !== 'all') {
      if (p.aspectRatio !== filters.aspectRatio) {
        return false;
      }
    }

    // 5. Pricing filter (Free vs Premium)
    if (filters.pricing === 'free' && !p.isFree) return false;
    if (filters.pricing === 'premium' && p.isFree) return false;

    // 6. Featured filter
    if (filters.isFeatured && !p.isFeatured) return false;

    return true;
  });

  // Sorting
  result.sort((a, b) => {
    if (filters.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (filters.sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return result;
}

/**
 * Saves a new custom prompt (added by the account holder).
 */
export function saveCustomPrompt(newPrompt: PromptRecord): void {
  if (typeof window === 'undefined') return;
  try {
    let customPrompts: PromptRecord[] = [];
    const stored = localStorage.getItem(LOCAL_PROMPTS_KEY);
    if (stored) {
      customPrompts = JSON.parse(stored);
    }

    // Remove if already exists with same id or slug
    const updated = [newPrompt, ...customPrompts.filter((p) => p.id !== newPrompt.id && p.slug !== newPrompt.slug)];
    localStorage.setItem(LOCAL_PROMPTS_KEY, JSON.stringify(updated));

    // Remove from deleted list if it was previously deleted
    const deleted = getDeletedPromptIds().filter((id) => id !== newPrompt.id);
    localStorage.setItem(DELETED_PROMPTS_KEY, JSON.stringify(deleted));

    window.dispatchEvent(new Event('prompts_updated'));
  } catch (err) {
    console.error('Failed to save prompt', err);
  }
}

/**
 * Deletes / removes a prompt and its image permanently from the website.
 * Works for both custom-added prompts and seed default prompts.
 */
export function deletePrompt(promptId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // 1. Remove from custom prompts if present
    const stored = localStorage.getItem(LOCAL_PROMPTS_KEY);
    if (stored) {
      const customPrompts: PromptRecord[] = JSON.parse(stored);
      const filtered = customPrompts.filter((p) => p.id !== promptId);
      localStorage.setItem(LOCAL_PROMPTS_KEY, JSON.stringify(filtered));
    }

    // 2. Mark as deleted in DELETED_PROMPTS_KEY
    const deleted = getDeletedPromptIds();
    if (!deleted.includes(promptId)) {
      deleted.push(promptId);
      localStorage.setItem(DELETED_PROMPTS_KEY, JSON.stringify(deleted));
    }

    // 3. Dispatch event so UI updates immediately everywhere
    window.dispatchEvent(new Event('prompts_updated'));
    return true;
  } catch (err) {
    console.error('Failed to delete prompt', err);
    return false;
  }
}

/**
 * Restores all default seed prompts in case the account holder wants to reset.
 */
export function restoreAllDefaultPrompts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DELETED_PROMPTS_KEY);
  window.dispatchEvent(new Event('prompts_updated'));
}

/**
 * Returns number of custom prompts added by account holder.
 */
export function getCustomPromptCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(LOCAL_PROMPTS_KEY);
    return stored ? JSON.parse(stored).length : 0;
  } catch {
    return 0;
  }
}
