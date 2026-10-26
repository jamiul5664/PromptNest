import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wand2,
  Database,
  PlusCircle,
  Eye,
  Download,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import type { PromptRecord, AspectRatioType, PromptCategorySlug } from '../types';
import { saveCustomPrompt, getAllPrompts } from '../lib/prompts';
import { PromptCard } from '../components/PromptCard';
import { useToast } from '../context/ToastContext';
import { isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';
import { useDocumentHead } from '../hooks/useDocumentHead';

export const AdminPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  useDocumentHead({
    title: 'Creator Studio & Content Management',
    description: 'Admin architecture for drafting, previewing, and publishing verified AI prompt recipes.',
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [promptText, setPromptText] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [categorySlug, setCategorySlug] = useState<PromptCategorySlug>('nature-landscapes');
  const [tagsInput, setTagsInput] = useState('Cinematic, 35mm, Hasselblad, 8k');
  const [style, setStyle] = useState('Cinematic Photography');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [isFree, setIsFree] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [authorName, setAuthorName] = useState('PromptVista Studio');
  const [license, setLicense] = useState('Unsplash Free Commercial License');
  const [suggestedTools, setSuggestedTools] = useState('Midjourney v6, Flux.1 Dev');

  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);

  // Generate dynamic slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const selectedCategory = CATEGORIES.find((c) => c.slug === categorySlug);

  // Draft prompt object for live preview
  const previewPrompt: PromptRecord = {
    id: `custom-${Date.now()}`,
    slug: generateSlug(title || 'draft-prompt-preview'),
    title: title || 'Title of Your AI Reference Prompt',
    description: description || 'Visual and compositional description explaining the scene atmosphere.',
    imageUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    promptText:
      promptText ||
      'Cinematic shot of natural landscape at dawn, volumetric god rays, Hasselblad X2D 100C --ar 16:9 --v 6.0',
    negativePrompt: negativePrompt || undefined,
    category: selectedCategory ? selectedCategory.name : 'Nature & Landscapes',
    categorySlug,
    tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    style,
    aspectRatio,
    createdAt: new Date().toISOString(),
    isFeatured,
    isFree,
    suggestedTools: suggestedTools.split(',').map((t) => t.trim()).filter(Boolean),
    license,
    author: { name: authorName },
  };

  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !promptText.trim() || !imageUrl.trim()) {
      showToast('Please fill in title, prompt text, and a valid image URL.', 'error');
      return;
    }

    const newRecord: PromptRecord = {
      ...previewPrompt,
      id: `pv-${Date.now()}`,
      slug: generateSlug(title),
      createdAt: new Date().toISOString(),
    };

    saveCustomPrompt(newRecord);
    showToast(`Published "${title}" to your active library!`, 'success');

    // Reset fields
    setTitle('');
    setDescription('');
    setImageUrl('');
    setPromptText('');
    setNegativePrompt('');

    navigate(`/prompts/${newRecord.slug}`);
  };

  const handleCheckSupabase = async () => {
    setCheckingDb(true);
    const result = await checkSupabaseConnection();
    setDbStatus(result.message);
    setCheckingDb(false);
  };

  const handleExportAllJSON = () => {
    const all = getAllPrompts();
    const blob = new Blob([JSON.stringify(all, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptvista-full-dataset-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Full prompt library exported as JSON!', 'success');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-widest font-semibold mb-2">
            <Wand2 className="w-4 h-4 text-brand-violet" />
            <span>Content Architecture & Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
            Creator Content Studio
          </h1>
          <p className="text-sm text-brand-muted max-w-2xl mt-1">
            Author and validate prompt formulas with instant card preview, metadata tagging, and optional Supabase backend sync.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportAllJSON}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-card hover:bg-brand-surface border border-brand-border text-xs font-semibold text-brand-text shadow-sm"
        >
          <Download className="w-4 h-4 text-brand-violet" />
          <span>Export Entire Library JSON</span>
        </button>
      </div>

      {/* Backend & Database Health Box */}
      <div className="p-6 rounded-2xl bg-brand-card border border-brand-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-brand-violet" />
            <h3 className="font-bold text-sm text-brand-text">Backend & Database Infrastructure</h3>
          </div>
          <span
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-brand-violet/10 border-brand-violet/30 text-brand-lavender'
            }`}
          >
            {isSupabaseConfigured ? 'Supabase Configured' : 'Offline / Local Seed Mode'}
          </span>
        </div>

        <p className="text-xs text-brand-muted leading-relaxed">
          {isSupabaseConfigured
            ? 'Production Supabase credentials detected via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Row Level Security (RLS) is active.'
            : 'Running with local seed data and browser localStorage persistence. To connect your cloud database, copy `.env.example` to `.env` and run `supabase/schema.sql`.'}
        </p>

        {dbStatus && (
          <div className="p-3 rounded-xl bg-black/40 border border-brand-border text-xs text-brand-lavender font-mono">
            {dbStatus}
          </div>
        )}

        <div className="pt-1 flex items-center space-x-3">
          <button
            type="button"
            onClick={handleCheckSupabase}
            disabled={checkingDb}
            className="text-xs font-semibold text-brand-lavender hover:underline flex items-center space-x-1"
          >
            <span>{checkingDb ? 'Testing endpoint...' : 'Verify Supabase RLS Endpoint'}</span>
          </button>
        </div>
      </div>

      {/* Two-Column Editor & Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Authoring Form */}
        <div className="lg:col-span-7 bg-brand-card p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-brand-text flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-brand-violet" />
            <span>Author New Prompt Recipe</span>
          </h2>

          <form onSubmit={handleSavePrompt} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                Prompt Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Nordic Fjords at Golden Hour Dawn"
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                Visual Description *
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of lighting, subject matter, and mood..."
                className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                Reference Image URL (Unsplash or CDN) *
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                Exact Generation Prompt Text *
              </label>
              <textarea
                required
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Cinematic wide-angle aerial shot of steep fjords... --ar 16:9 --v 6.0"
                className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl text-xs sm:text-sm font-mono text-brand-text focus:outline-none focus:border-brand-violet resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                Negative Prompt / Exclusions (Optional)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="oversaturated, blurry, bad anatomy, noise..."
                className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-mono text-brand-text focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                  Category *
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value as PromptCategorySlug)}
                  className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-brand-text focus:outline-none focus:border-brand-violet"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                  Aspect Ratio *
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
                  className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-brand-text focus:outline-none focus:border-brand-violet"
                >
                  <option value="1:1">1:1 Square</option>
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Portrait</option>
                  <option value="4:3">4:3 Standard</option>
                  <option value="3:4">3:4 Vertical</option>
                  <option value="21:9">21:9 Ultrawide</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                  Visual Style
                </label>
                <input
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Cinematic Photography, 3D Render..."
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                  License & Attribution
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="Unsplash Free Commercial License"
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Fjords, Fog, Nordic, 35mm"
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                  Photographer / Creator Attribution
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                  Compatible Models
                </label>
                <input
                  type="text"
                  value={suggestedTools}
                  onChange={(e) => setSuggestedTools(e.target.value)}
                  placeholder="Midjourney v6, Flux.1 Dev, SDXL"
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs">
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-brand-border text-brand-violet focus:ring-brand-violet"
                />
                <span className="text-brand-text font-medium">Free Access (100% Free)</span>
              </label>

              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-brand-border text-brand-violet focus:ring-brand-violet"
                />
                <span className="text-brand-text font-medium">Feature on Homepage</span>
              </label>
            </div>

            <div className="pt-4 border-t border-brand-border/60 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-bold shadow-glow-sm hover:shadow-glow-violet transition-all"
              >
                Publish Prompt to Library
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-wider font-semibold">
            <Eye className="w-4 h-4 text-brand-violet" />
            <span>Live Card Preview</span>
          </div>

          <div className="max-w-sm mx-auto lg:max-w-none">
            <PromptCard prompt={previewPrompt} priority={true} />
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-muted space-y-2">
            <div className="flex items-center space-x-2 text-brand-lavender font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
              <span>Security & Moderation Standards</span>
            </div>
            <p className="leading-relaxed">
              All submitted prompts undergo automated syntax validation. Image URLs must reference public CDNs or verified creative commons photography.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
