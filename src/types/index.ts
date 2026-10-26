export type AspectRatioType = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9';

export type PromptCategorySlug =
  | 'nature-landscapes'
  | 'abstract-backgrounds'
  | 'product-photography'
  | 'minimalist-art'
  | 'black-silhouettes'
  | 'fantasy-cinematic'
  | 'architecture-interiors'
  | 'food-photography'
  | 'botanical-illustrations'
  | 'textures-patterns'
  | '3d-art'
  | 'editorial-conceptual';

export interface PromptAuthor {
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
}

export interface PromptRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  promptText: string;
  negativePrompt?: string;
  category: string;
  categorySlug: PromptCategorySlug;
  tags: string[];
  style: string;
  aspectRatio: AspectRatioType;
  dimensions?: string;
  createdAt: string;
  isFeatured: boolean;
  isFree: boolean;
  suggestedTools: string[];
  license: string;
  author: PromptAuthor;
  sourceModel?: string; // e.g. "Flux.1", "Midjourney v6", "SDXL" when known
  customShortlink?: string; // Optional custom ouo.io shortlink for this specific prompt
}

export interface CategoryItem {
  id: string;
  slug: PromptCategorySlug;
  name: string;
  description: string;
  imageUrl: string;
  iconName?: string;
}

export interface FilterState {
  query: string;
  category: string;
  style: string;
  aspectRatio: string;
  pricing: 'all' | 'free' | 'premium';
  isFeatured: boolean;
  sortBy: 'newest' | 'oldest' | 'alphabetical';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}
