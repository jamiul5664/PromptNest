import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Shield,
  KeyRound,
  PlusCircle,
  Trash2,
  Image as ImageIcon,
  Upload,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Search,
  RotateCcw,
  LogOut,
  DollarSign,
  Save,
  Globe,
  Activity,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import type { PromptRecord, AspectRatioType, PromptCategorySlug } from '../types';
import {
  getAllPrompts,
  saveCustomPrompt,
  deletePrompt,
  restoreAllDefaultPrompts,
} from '../lib/prompts';
import {
  isOwnerAuthenticated,
  loginOwner,
  logoutOwner,
  setMasterPasscode,
  isCustomPasscodeSet,
  resetPasscodeToDefault,
  getMasterPasscode,
} from '../lib/auth';
import {
  getMonetizationConfig,
  saveMonetizationConfig,
} from '../lib/monetization';
import type { MonetizationConfig } from '../lib/monetization';
import {
  getTrafficSummary,
  getActiveLiveSessions,
  getLiveViewersCount,
  resetTrafficData,
  seedSampleTraffic,
  setSimulationEnabled,
} from '../lib/analytics';
import type { TrafficSummary, LiveSession } from '../lib/analytics';
import { TrafficAnalyticsView } from './TrafficAnalyticsView';
import { PromptCard } from '../components/PromptCard';
import { ToastProvider, useToast } from '../context/ToastContext';

function AdminDashboardInner() {
  const { showToast } = useToast();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isOwnerAuthenticated());
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showLoginPasscode, setShowLoginPasscode] = useState(false);
  const [isCustomPass, setIsCustomPass] = useState(() => isCustomPasscodeSet());

  // Passcode Change Modal State
  const [showPasscodeChangeModal, setShowPasscodeChangeModal] = useState(false);
  const [currentPasscodeAttempt, setCurrentPasscodeAttempt] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmNewPasscode, setConfirmNewPasscode] = useState('');
  const [showNewPasscode, setShowNewPasscode] = useState(false);

  // Active Tab: 'traffic' | 'manage' | 'add' | 'monetization'
  const [activeTab, setActiveTab] = useState<'traffic' | 'manage' | 'add' | 'monetization'>('traffic');

  // Traffic & Live Viewers State
  const [trafficSummary, setTrafficSummary] = useState<TrafficSummary>(() => getTrafficSummary());
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(() => getActiveLiveSessions());
  const [liveCount, setLiveCount] = useState<number>(() => getLiveViewersCount());

  // Prompts Data
  const [prompts, setPrompts] = useState<PromptRecord[]>(() => getAllPrompts());
  const [manageSearch, setManageSearch] = useState('');
  const [manageCategory, setManageCategory] = useState('all');

  // Delete confirmation modal state
  const [promptToDelete, setPromptToDelete] = useState<PromptRecord | null>(null);

  // Form State for Adding Prompts
  const [imageUploadType, setImageUploadType] = useState<'upload' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [promptText, setPromptText] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [categorySlug, setCategorySlug] = useState<PromptCategorySlug>('nature-landscapes');
  const [tagsInput, setTagsInput] = useState('Cinematic, 8k, Ultra Detailed');
  const [style, setStyle] = useState('Cinematic Photography');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [isFree, setIsFree] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [authorName, setAuthorName] = useState('Account Holder');
  const [suggestedTools, setSuggestedTools] = useState('Midjourney v6, Flux.1 Dev');
  const [customShortlink, setCustomShortlink] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monetization (ouo.io / Shortlink) Config State
  const [monetizationConfig, setMonetizationConfig] = useState<MonetizationConfig>(() => getMonetizationConfig());

  // Listen to prompt and auth updates
  useEffect(() => {
    const refreshData = () => {
      setPrompts(getAllPrompts());
      setIsAuthenticated(isOwnerAuthenticated());
      setMonetizationConfig(getMonetizationConfig());
      setIsCustomPass(isCustomPasscodeSet());
    };

    const refreshTraffic = () => {
      setTrafficSummary(getTrafficSummary());
      setLiveSessions(getActiveLiveSessions());
      setLiveCount(getLiveViewersCount());
    };

    window.addEventListener('prompts_updated', refreshData);
    window.addEventListener('owner_auth_change', refreshData);
    window.addEventListener('owner_passcode_changed', refreshData);
    window.addEventListener('monetization_config_updated', refreshData);
    window.addEventListener('promptvista_traffic_updated', refreshTraffic);
    window.addEventListener('storage', refreshTraffic);

    // Live heartbeat ticker: updates active viewers count every 2.5s
    const trafficInterval = window.setInterval(refreshTraffic, 2500);

    return () => {
      window.removeEventListener('prompts_updated', refreshData);
      window.removeEventListener('owner_auth_change', refreshData);
      window.removeEventListener('owner_passcode_changed', refreshData);
      window.removeEventListener('monetization_config_updated', refreshData);
      window.removeEventListener('promptvista_traffic_updated', refreshTraffic);
      window.removeEventListener('storage', refreshTraffic);
      window.clearInterval(trafficInterval);
    };
  }, []);

  // Traffic Action Handlers
  const refreshTraffic = () => {
    setTrafficSummary(getTrafficSummary());
    setLiveSessions(getActiveLiveSessions());
    setLiveCount(getLiveViewersCount());
  };

  const handleResetTraffic = () => {
    resetTrafficData();
    refreshTraffic();
    showToast('All traffic counters and sessions have been reset.', 'info');
  };

  const handleSeedTraffic = () => {
    seedSampleTraffic();
    refreshTraffic();
    showToast('Sample 24-hour traffic data seeded successfully!', 'success');
  };

  const handleToggleSimulation = (enabled: boolean) => {
    setSimulationEnabled(enabled);
    refreshTraffic();
    showToast(`Traffic simulation mode turned ${enabled ? 'ON' : 'OFF'}.`, 'info');
  };

  // Handle Passcode Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginOwner(passcodeAttempt);
    if (result.success) {
      setIsAuthenticated(true);
      setPasscodeAttempt('');
      setPasscodeError('');
      showToast('Welcome, Account Holder! Panel unlocked.', 'success');
    } else {
      setPasscodeError(result.error || 'Incorrect passcode');
      showToast('Access denied: Invalid master passcode.', 'error');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logoutOwner();
    setIsAuthenticated(false);
    showToast('Logged out. Control panel locked.', 'info');
  };

  // Handle Local File Upload from PC
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size exceeds 10MB limit.', 'error');
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setImageUrl(base64Data);
      showToast(`Image "${file.name}" loaded successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Helper to generate URL slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const selectedCategory = CATEGORIES.find((c) => c.slug === categorySlug);

  // Current draft preview
  const previewPrompt: PromptRecord = {
    id: `custom-preview`,
    slug: generateSlug(title || 'draft-prompt'),
    title: title || 'New AI Generation Title',
    description: description || 'Visual and compositional description explaining the mood and lighting.',
    imageUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    promptText:
      promptText ||
      'Cinematic masterpiece photography, dramatic lighting, 8k resolution --ar 16:9 --v 6.0',
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
    license: 'Account Holder Exclusive',
    author: { name: authorName },
    customShortlink: customShortlink.trim() || undefined,
  };

  // Handle Add Prompt & Image
  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !promptText.trim() || !imageUrl.trim()) {
      showToast('Please provide a title, prompt text, and an image (upload or URL).', 'error');
      return;
    }

    const uniqueId = `prompt-${Date.now()}`;
    const newRecord: PromptRecord = {
      ...previewPrompt,
      id: uniqueId,
      slug: `${generateSlug(title)}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };

    saveCustomPrompt(newRecord);
    setPrompts(getAllPrompts());
    showToast(`Added "${newRecord.title}" successfully! It is now live on the website.`, 'success');

    // Reset Form
    setTitle('');
    setDescription('');
    setImageUrl('');
    setImageFileName('');
    setPromptText('');
    setNegativePrompt('');
    setCustomShortlink('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Switch to manage tab
    setActiveTab('manage');
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (!promptToDelete) return;
    const ok = deletePrompt(promptToDelete.id);
    if (ok) {
      setPrompts(getAllPrompts());
      showToast(`Removed "${promptToDelete.title}" and its image from the website.`, 'success');
    } else {
      showToast('Failed to delete prompt.', 'error');
    }
    setPromptToDelete(null);
  };

  // Handle Change Passcode
  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStored = getMasterPasscode();
    if (currentPasscodeAttempt.trim() !== currentStored) {
      showToast('Current master passcode is incorrect.', 'error');
      return;
    }
    if (!newPasscode.trim() || newPasscode.length < 4) {
      showToast('New passcode must be at least 4 characters long.', 'error');
      return;
    }
    if (newPasscode.trim() !== confirmNewPasscode.trim()) {
      showToast('New passcode and confirmation do not match.', 'error');
      return;
    }
    setMasterPasscode(newPasscode.trim());
    setCurrentPasscodeAttempt('');
    setNewPasscode('');
    setConfirmNewPasscode('');
    setShowPasscodeChangeModal(false);
    setIsCustomPass(true);
    showToast('Master passcode updated successfully! Old passcode has been permanently disabled.', 'success');
  };

  // Handle Reset Passcode to Default
  const handleResetToDefaultPasscode = () => {
    if (window.confirm('Are you sure you want to reset the admin passcode back to default "admin123"?')) {
      resetPasscodeToDefault();
      setCurrentPasscodeAttempt('');
      setNewPasscode('');
      setConfirmNewPasscode('');
      setShowPasscodeChangeModal(false);
      setIsCustomPass(false);
      showToast('Master passcode reset back to default: admin123', 'info');
    }
  };

  // Handle Save Monetization Config
  const handleSaveMonetization = (e: React.FormEvent) => {
    e.preventDefault();
    saveMonetizationConfig(monetizationConfig);
    showToast('Monetization & Shortlink settings saved successfully!', 'success');
  };

  // Filtered prompts in the Manage tab
  const filteredPrompts = prompts.filter((p) => {
    if (manageCategory !== 'all' && p.categorySlug !== manageCategory) return false;
    if (manageSearch.trim()) {
      const q = manageSearch.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.promptText.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ==========================================
  // 1. LOCKED SECURITY GATE (Non-Authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#101018] text-brand-text">
        <div className="w-full max-w-md p-8 rounded-3xl bg-brand-card border border-brand-border shadow-2xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-violet/15 border border-brand-violet/30 flex items-center justify-center text-brand-violet shadow-glow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-brand-text">
              Account Holder Access
            </h1>
            <p className="text-xs text-brand-muted leading-relaxed">
              শুধুমাত্র সাইটের মালিক / অ্যাকাউন্ট হোল্ডারদের জন্য সংরক্ষিত। সাধারণ ইউজাররা এই প্যানেল দেখতে বা ব্যবহার করতে পারবে না।
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                Master Passcode (মাস্টার পাসকোড)
              </label>
              <div className="relative">
                <input
                  type={showLoginPasscode ? 'text' : 'password'}
                  required
                  value={passcodeAttempt}
                  onChange={(e) => setPasscodeAttempt(e.target.value)}
                  placeholder={isCustomPass ? 'Enter your custom master passcode' : 'Enter master passcode (Default: admin123)'}
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet font-mono pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPasscode(!showLoginPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                  title={showLoginPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showLoginPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passcodeError && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-start space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{passcodeError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-bold shadow-glow-sm hover:shadow-glow-violet transition-all flex items-center justify-center space-x-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="pt-2 border-t border-brand-border/60 text-[11px] text-brand-muted space-y-2">
            {isCustomPass ? (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Custom Passcode Active (default admin123 is disabled)</span>
              </div>
            ) : (
              <p>
                Default master passcode is <code className="text-brand-lavender font-mono px-1.5 py-0.5 rounded bg-brand-bg border border-brand-border">admin123</code>
              </p>
            )}
            <div className="pt-1">
              <a
                href="/"
                className="inline-flex items-center space-x-1 text-xs text-brand-lavender hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Visit Main Public Website</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. UNLOCKED ACCOUNT HOLDER CONTROL PANEL
  // ==========================================
  return (
    <div className="min-h-screen bg-[#101018] text-brand-text py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Top Banner & Control Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-brand-card border border-brand-border shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                Standalone Account Holder Panel (Private)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-text">
              PromptVista Content & Monetization Studio
            </h1>
            <p className="text-xs text-brand-muted">
              এই ফাইলটি শুধুমাত্র অ্যাডমিন প্যানেলের জন্য। এখান থেকে ইমেজ/প্রম্পট যোগ ও ডিলিট করুন এবং ouo.io শর্ট লিংক সেট করুন।
            </p>
          </div>

          {/* Top Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-bg hover:bg-brand-surface border border-brand-border text-xs font-semibold text-brand-text transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-brand-violet" />
              <span>View Live Website</span>
            </a>

            <button
              type="button"
              onClick={() => setShowPasscodeChangeModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-bg hover:bg-brand-surface border border-brand-border text-xs font-semibold text-brand-text transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-violet" />
              <span>Change Passcode</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Panel</span>
            </button>
          </div>
        </div>

        {/* Stats Counter Bar (5 Interactive Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Live Viewers Online (Clickable) */}
          <button
            type="button"
            onClick={() => setActiveTab('traffic')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTab === 'traffic'
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-glow-sm'
                : 'bg-brand-card hover:bg-brand-surface border-brand-border'
            } flex items-center justify-between`}
          >
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Live Online
                </span>
              </div>
              <h3 className="text-2xl font-black text-brand-text mt-0.5">
                {liveCount} <span className="text-xs font-normal text-brand-muted">active</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </button>

          {/* Card 2: Today's Page Views (Clickable) */}
          <button
            type="button"
            onClick={() => setActiveTab('traffic')}
            className="p-4 rounded-2xl bg-brand-card hover:bg-brand-surface border border-brand-border text-left transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-brand-muted font-medium">Today's Traffic</span>
              <h3 className="text-2xl font-black text-brand-text">
                {trafficSummary.todayPageViews} <span className="text-xs font-normal text-brand-muted">views</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-lavender">
              <Eye className="w-5 h-5" />
            </div>
          </button>

          {/* Card 3: Total Prompts */}
          <div className="p-4 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-between">
            <div>
              <span className="text-xs text-brand-muted font-medium">Total Live Prompts</span>
              <h3 className="text-2xl font-black text-brand-text">{prompts.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-violet">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Short Link Status */}
          <div className="p-4 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-between">
            <div>
              <span className="text-xs text-brand-muted font-medium">Short Link Status</span>
              <h3 className="text-sm font-bold mt-1">
                {monetizationConfig.enabled ? (
                  <span className="text-emerald-400">Active (Background)</span>
                ) : (
                  <span className="text-brand-muted">Disabled</span>
                )}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Card 5: Website Sync */}
          <div className="p-4 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-between">
            <div>
              <span className="text-xs text-brand-muted font-medium">Website Sync</span>
              <h3 className="text-sm font-bold text-emerald-400 mt-1 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Synchronized</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-brand-border/80 space-x-2 overflow-x-auto">
          {/* TAB: LIVE TRAFFIC */}
          <button
            type="button"
            onClick={() => setActiveTab('traffic')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center space-x-2 shrink-0 ${
              activeTab === 'traffic'
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Live Traffic & Viewers ({liveCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center space-x-2 shrink-0 ${
              activeTab === 'manage'
                ? 'text-brand-lavender border-b-2 border-brand-violet'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Manage & Remove Prompts ({prompts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center space-x-2 shrink-0 ${
              activeTab === 'add'
                ? 'text-brand-lavender border-b-2 border-brand-violet'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-brand-violet" />
            <span>Add New Prompt & Image</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monetization')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center space-x-2 shrink-0 ${
              activeTab === 'monetization'
                ? 'text-brand-lavender border-b-2 border-brand-violet'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Monetization & ouo.io Links</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 0: LIVE TRAFFIC & VIEWERS                                     */}
        {/* ================================================================= */}
        {activeTab === 'traffic' && (
          <TrafficAnalyticsView
            trafficSummary={trafficSummary}
            liveSessions={liveSessions}
            liveCount={liveCount}
            onRefresh={refreshTraffic}
            onReset={handleResetTraffic}
            onSeedSample={handleSeedTraffic}
            onToggleSimulation={handleToggleSimulation}
          />
        )}

        {/* ================================================================= */}
        {/* TAB 1: MANAGE & REMOVE (DELETE) PROMPTS                          */}
        {/* ================================================================= */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={manageSearch}
                  onChange={(e) => setManageSearch(e.target.value)}
                  placeholder="Search prompts to remove or inspect..."
                  className="w-full pl-10 pr-4 py-2 bg-brand-card border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <select
                  value={manageCategory}
                  onChange={(e) => setManageCategory(e.target.value)}
                  className="px-3 py-2 bg-brand-card border border-brand-border rounded-xl text-xs font-medium text-brand-text focus:outline-none focus:border-brand-violet"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore all default initial seed prompts?')) {
                      restoreAllDefaultPrompts();
                      setPrompts(getAllPrompts());
                      showToast('Default prompts restored.', 'info');
                    }
                  }}
                  className="p-2 rounded-xl bg-brand-card border border-brand-border text-brand-muted hover:text-white transition-colors"
                  title="Restore default initial seed prompts"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompts Table / Management List */}
            {filteredPrompts.length === 0 ? (
              <div className="py-16 text-center bg-brand-card/50 rounded-3xl border border-brand-border space-y-3">
                <p className="text-sm text-brand-muted">No prompts match your search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setManageSearch('');
                    setManageCategory('all');
                  }}
                  className="text-xs text-brand-lavender underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPrompts.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-border-light transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-surface border border-brand-border shrink-0">
                        <img
                          src={item.thumbnailUrl || item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-brand-violet/15 text-brand-lavender border border-brand-violet/25">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-mono text-brand-subtle">
                            {item.aspectRatio}
                          </span>
                          {item.isFree ? (
                            <span className="text-[10px] text-emerald-400 font-medium">Free</span>
                          ) : (
                            <span className="text-[10px] text-amber-300 font-medium">Premium</span>
                          )}
                          {item.customShortlink ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-mono" title={`Custom: ${item.customShortlink}`}>
                              Custom ouo
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-surface text-brand-muted border border-brand-border font-mono">
                              Global ouo
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-brand-text truncate">
                          {item.title}
                        </h4>

                        <p className="text-xs font-mono text-brand-muted truncate max-w-xl">
                          {item.promptText}
                        </p>
                      </div>
                    </div>

                    {/* Right Actions: View & Remove */}
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <a
                        href={`/prompts/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-white transition-colors"
                        title="View live prompt"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* RED REMOVE BUTTON */}
                      <button
                        type="button"
                        onClick={() => setPromptToDelete(item)}
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 text-xs font-bold transition-all shadow-sm"
                        title={`Remove prompt: ${item.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: ADD NEW PROMPT & IMAGE                                   */}
        {/* ================================================================= */}
        {activeTab === 'add' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Form */}
            <div className="lg:col-span-7 bg-brand-card p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xl space-y-6">
              <div className="flex items-center space-x-2 text-brand-lavender font-bold text-lg">
                <PlusCircle className="w-5 h-5 text-brand-violet" />
                <span>Add New Image & Prompt Recipe</span>
              </div>

              <form onSubmit={handleAddPrompt} className="space-y-5">
                {/* Image Input Selection: Upload vs URL */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted">
                    Reference Image *
                  </label>

                  <div className="flex items-center space-x-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageUploadType('upload')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                        imageUploadType === 'upload'
                          ? 'bg-brand-violet/20 border-brand-violet text-brand-lavender shadow-sm'
                          : 'bg-brand-bg border-brand-border text-brand-muted hover:text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File From PC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUploadType('url')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                        imageUploadType === 'url'
                          ? 'bg-brand-violet/20 border-brand-violet text-brand-lavender shadow-sm'
                          : 'bg-brand-bg border-brand-border text-brand-muted hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Paste Image URL</span>
                    </button>
                  </div>

                  {imageUploadType === 'upload' ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 border-2 border-dashed border-brand-border hover:border-brand-violet rounded-2xl bg-brand-bg cursor-pointer text-center space-y-2 transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-brand-violet mx-auto" />
                      <p className="text-xs font-semibold text-brand-text">
                        {imageFileName ? (
                          <span className="text-emerald-400 font-bold">{imageFileName} (Click to change)</span>
                        ) : (
                          <span>Click to choose an image from your computer</span>
                        )}
                      </p>
                      <p className="text-[11px] text-brand-muted">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                      Prompt Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Majestic Cyberpunk Rain City"
                      className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the visual mood, subject, and style..."
                      className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet resize-none"
                    />
                  </div>
                </div>

                {/* Exact Generation Prompt Text */}
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                    Exact Generation Prompt *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Cinematic wide-angle shot of neon lit skyscraper... --ar 16:9 --v 6.0"
                    className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl text-xs font-mono text-brand-text focus:outline-none focus:border-brand-violet resize-none"
                  />
                </div>

                {/* Negative Prompt */}
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                    Negative Prompt / Exclusions (Optional)
                  </label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="blurry, deformed, low quality, oversaturated"
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-mono text-brand-text focus:outline-none focus:border-brand-violet"
                  />
                </div>

                {/* Category & Aspect Ratio */}
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

                {/* Style & Tags */}
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
                      Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Neon, Cyberpunk, 8k, Unreal"
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet"
                    />
                  </div>
                </div>

                {/* Author & Tools */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                      Author Attribution
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
                      Compatible AI Models
                    </label>
                    <input
                      type="text"
                      value={suggestedTools}
                      onChange={(e) => setSuggestedTools(e.target.value)}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-violet"
                    />
                  </div>
                </div>

                {/* Custom ouo.io Shortlink for this Prompt (Optional) */}
                <div className="p-3.5 rounded-xl bg-brand-bg border border-brand-border/80 space-y-1.5">
                  <label className="block text-xs font-semibold text-brand-text flex items-center justify-between">
                    <span>Specific ouo.io Shortlink for this Prompt (Optional)</span>
                    <span className="text-[10px] text-brand-lavender font-mono">Optional</span>
                  </label>
                  <input
                    type="url"
                    value={customShortlink}
                    onChange={(e) => setCustomShortlink(e.target.value)}
                    placeholder="https://ouo.io/xxxx (খালি রাখলে গ্লোবাল ouo.io লিংক ব্যবহার হবে)"
                    className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-text font-mono focus:outline-none focus:border-brand-violet"
                  />
                  <p className="text-[11px] text-brand-muted">
                    এই প্রম্পটের ইমেজে ইউজার ক্লিক করলে যদি নির্দিষ্ট শর্ট লিংক দিতে চান তবে এখানে দিন। ফাঁকা রাখলে আপনার গ্লোবাল ouo লিংক স্বয়ংক্রিয়ভাবে কাজ করবে।
                  </p>
                </div>

                {/* Checkboxes */}
                <div className="pt-2 flex flex-wrap gap-4 text-xs">
                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="rounded border-brand-border text-brand-violet focus:ring-brand-violet"
                    />
                    <span className="text-brand-text font-medium">Free Prompt for Users</span>
                  </label>

                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-brand-border text-brand-violet focus:ring-brand-violet"
                    />
                    <span className="text-brand-text font-medium">Feature on Homepage Trending</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-brand-border/60">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-sm font-bold shadow-glow-sm hover:shadow-glow-violet transition-all flex items-center justify-center space-x-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish to Live Website</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Live Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center space-x-2 text-brand-lavender text-xs uppercase tracking-wider font-semibold">
                <Eye className="w-4 h-4 text-brand-violet" />
                <span>Real-Time Website Card Preview</span>
              </div>

              <div className="max-w-sm mx-auto lg:max-w-none">
                <PromptCard prompt={previewPrompt} priority={true} isPreview={true} />
              </div>

              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border text-xs text-brand-muted space-y-2">
                <p className="font-semibold text-brand-text">Instant Publishing</p>
                <p>
                  When you click Publish, this prompt and image will be immediately visible to all visitors on the Homepage, Category Page, and Explore Page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: MONETIZATION & OUO.IO SHORT LINKS                          */}
        {/* ================================================================= */}
        {activeTab === 'monetization' && (
          <div className="max-w-3xl mx-auto bg-brand-card p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border/80 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-brand-text">
                    Monetization & Shortener Link Settings (ouo.io)
                  </h3>
                  <p className="text-xs text-brand-muted">
                    ব্যাকগ্রাউন্ডে শর্ট লিংক চালানোর কন্ট্রোল প্যানেল। লিংকগুলো সাধারণ ইউজারদের কাছে দৃশ্যমান হবে না।
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  monetizationConfig.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-brand-surface text-brand-muted border-brand-border'
                }`}
              >
                {monetizationConfig.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>

            <form onSubmit={handleSaveMonetization} className="space-y-5">
              {/* Enable / Disable Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-bg border border-brand-border">
                <div>
                  <h4 className="text-sm font-bold text-brand-text">Enable Background Shortener Links</h4>
                  <p className="text-xs text-brand-muted">
                    Turn on to trigger your ouo.io or shortener link upon user interaction.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monetizationConfig.enabled}
                    onChange={(e) =>
                      setMonetizationConfig({
                        ...monetizationConfig,
                        enabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-brand-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-violet"></div>
                </label>
              </div>

              {/* Shortener URL Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
                  Your Shortener / Ad URL (ouo.io Link) *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={monetizationConfig.shortenerUrl}
                    onChange={(e) =>
                      setMonetizationConfig({
                        ...monetizationConfig,
                        shortenerUrl: e.target.value,
                      })
                    }
                    placeholder="https://ouo.io/s/your_token or https://ouo.io/xxxx"
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-mono text-brand-text focus:outline-none focus:border-brand-violet"
                  />
                </div>
                <p className="text-[11px] text-brand-muted mt-1.5">
                  মূল গ্লোবাল লিংক। ইউজারদের পেজে সরাসরি কোনো টেক্সট বা বিজ্ঞাপন হিসেবে দেখানো হবে না।
                </p>
              </div>

              {/* Dedicated Button Shortener URL Input (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center justify-between">
                  <span>Button Specific ouo.io Link (Optional)</span>
                  <span className="text-[10px] text-brand-lavender font-mono">Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={monetizationConfig.buttonShortenerUrl || ''}
                    onChange={(e) =>
                      setMonetizationConfig({
                        ...monetizationConfig,
                        buttonShortenerUrl: e.target.value,
                      })
                    }
                    placeholder="https://ouo.io/xxxx (খালি রাখলে ওপরের মূল ouo লিংক কাজ করবে)"
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-mono text-brand-text focus:outline-none focus:border-brand-violet"
                  />
                </div>
                <p className="text-[11px] text-brand-muted mt-1.5">
                  বাটনগুলোর জন্য যদি আলাদা কোনো শর্ট লিংক দিতে চান তবে এখানে দিন। খালি রাখলে ওপরের মূল লিংকটিই সব বাটনে কাজ করবে।
                </p>
              </div>

              {/* Behavior 0: All Buttons Trigger (User Requested) */}
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-violet/40 space-y-3">
                <div className="flex items-start justify-between">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={monetizationConfig.triggerOnButtons}
                      onChange={(e) =>
                        setMonetizationConfig({
                          ...monetizationConfig,
                          triggerOnButtons: e.target.checked,
                        })
                      }
                      className="mt-1 rounded border-brand-border text-brand-violet focus:ring-brand-violet"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-text flex items-center space-x-2">
                        <span>Trigger on ALL Buttons (Except Search, Explore, Categories, Trending, Free Prompts)</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                          Active
                        </span>
                      </span>
                      <span className="text-[11px] text-brand-muted leading-relaxed block mt-1">
                        সার্চ, এক্সপ্লোর, ক্যাটাগরি, ট্রেন্ডিং এবং ফ্রি প্রম্পটস বাদে অন্য যেকোনো বাটনে ১ম ক্লিকে ouo.io শর্ট লিংক ওপেন হবে এবং ২য় ক্লিকে মূল কাজটি হবে।
                      </span>
                    </div>
                  </label>
                </div>

                {/* Exemption Badges List */}
                <div className="pt-2 border-t border-brand-border/60">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block mb-1.5">
                    বিজ্ঞাপন-মুক্ত এক্সক্লুসিভ ফিচারসমূহ (Always 100% Free of Ads):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ Search Input & Bar
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ Explore Page Nav
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ Categories Nav
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ Trending Chips
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ Free Prompts Nav
                    </span>
                  </div>
                </div>
              </div>

              {/* Behavior 1: Every Image Click 2-Step Trigger (User Requested) */}
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-violet/40 space-y-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monetizationConfig.triggerOnImageClick}
                    onChange={(e) =>
                      setMonetizationConfig({
                        ...monetizationConfig,
                        triggerOnImageClick: e.target.checked,
                      })
                    }
                    className="mt-1 rounded border-brand-border text-brand-violet focus:ring-brand-violet"
                  />
                  <div>
                    <span className="text-xs font-bold text-brand-text flex items-center space-x-2">
                      <span>Every Image Click: 1st Click Opens ouo.io, 2nd Click Opens Main Page</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-violet/20 text-brand-lavender font-bold">
                        Active
                      </span>
                    </span>
                    <span className="text-[11px] text-brand-muted leading-relaxed block mt-0.5">
                      ওয়েবসাইটের যেকোনো ইমেজে (Prompt Card) ইউজার প্রথম ক্লিক করলে ouo.io শর্ট লিংকটি নতুন ট্যাবে ওপেন হবে। ইউজার ফিরে এসে আবার ক্লিক করলে মেইন প্রম্পট ডিটেইল পেজ ওপেন হবে।
                    </span>
                  </div>
                </label>
              </div>

              {/* Behavior 2: Copy Button 2-Step Trigger */}
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border space-y-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monetizationConfig.triggerOnCopyPrompt}
                    onChange={(e) =>
                      setMonetizationConfig({
                        ...monetizationConfig,
                        triggerOnCopyPrompt: e.target.checked,
                      })
                    }
                    className="mt-1 rounded border-brand-border text-brand-violet focus:ring-brand-violet"
                  />
                  <div>
                    <span className="text-xs font-bold text-brand-text block">
                      1st Click: Open Short Link, 2nd Click: Copy Prompt
                    </span>
                    <span className="text-[11px] text-brand-muted leading-relaxed block mt-0.5">
                      ইউজার যখন প্রথমবার &quot;Copy Prompt&quot; বাটনে ক্লিক করবে, তখন ব্যাকগ্রাউন্ড নতুন ট্যাবে শর্ট লিংকটি ওপেন হবে। পরের ক্লিকে প্রম্পটটি সাথে সাথে কপি হবে।
                    </span>
                  </div>
                </label>
              </div>

              {/* Behavior 2: Full Website First Touch Trigger */}
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border space-y-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monetizationConfig.triggerOnFirstSiteClick}
                    onChange={(e) =>
                      setMonetizationConfig({
                        ...monetizationConfig,
                        triggerOnFirstSiteClick: e.target.checked,
                      })
                    }
                    className="mt-1 rounded border-brand-border text-brand-violet focus:ring-brand-violet"
                  />
                  <div>
                    <span className="text-xs font-bold text-brand-text block">
                      First Touch Anywhere on Full Website (প্রথম ক্লিকে শর্ট লিংক)
                    </span>
                    <span className="text-[11px] text-brand-muted leading-relaxed block mt-0.5">
                      ইউজার ওয়েবসাইটে ঢুকে যেকোনো জায়গায় প্রথমবার টাচ বা ক্লিক করলে ব্যাকগ্রাউন্ড ট্যাবে লিংক ওপেন হবে (প্রতি সেশনে একবার)।
                    </span>
                  </div>
                </label>
              </div>

              {/* Frequency Cooldown */}
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                  Cooldown Between Triggers (মিনিট)
                </label>
                <select
                  value={monetizationConfig.frequencyLimitMinutes}
                  onChange={(e) =>
                    setMonetizationConfig({
                      ...monetizationConfig,
                      frequencyLimitMinutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-medium text-brand-text focus:outline-none focus:border-brand-violet"
                >
                  <option value={0}>No Cooldown (Always 1st Click Link, 2nd Click Copy)</option>
                  <option value={1}>Every 1 Minute</option>
                  <option value={5}>Every 5 Minutes</option>
                  <option value={15}>Every 15 Minutes (Recommended)</option>
                  <option value={30}>Every 30 Minutes</option>
                  <option value={60}>Every 1 Hour</option>
                </select>
              </div>

              {/* Save & Test Buttons */}
              <div className="pt-4 border-t border-brand-border/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const url = monetizationConfig.buttonShortenerUrl?.trim() || monetizationConfig.shortenerUrl?.trim();
                    if (url) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } else {
                      showToast('Please enter an ouo.io shortener URL first.', 'error');
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-brand-lavender hover:underline flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Active ouo.io Link</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-xs font-bold shadow-glow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Monetization Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* DELETE CONFIRMATION MODAL                                         */}
        {/* ================================================================= */}
        {promptToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-brand-text">Confirm Prompt Deletion</h3>
                  <p className="text-xs text-brand-muted">এই প্রম্পট ও ছবি স্থায়ীভাবে ডিলিট করতে চান?</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-brand-bg border border-brand-border text-xs space-y-1">
                <p className="font-bold text-brand-text truncate">{promptToDelete.title}</p>
                <p className="text-brand-muted truncate font-mono text-[11px]">{promptToDelete.promptText}</p>
              </div>

              <p className="text-xs text-rose-300">
                Removing this item will instantly delete it from the website gallery and user discovery catalog.
              </p>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPromptToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Yes, Remove Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* CHANGE PASSCODE MODAL                                             */}
        {/* ================================================================= */}
        {showPasscodeChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center space-x-3 text-brand-lavender">
                <div className="w-10 h-10 rounded-xl bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-brand-violet">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-brand-text">Change Master Passcode</h3>
                  <p className="text-xs text-brand-muted">মাস্টার পাসকোড পরিবর্তন করুন</p>
                </div>
              </div>

              <form onSubmit={handleChangePasscode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                    Current Passcode (বর্তমান পাসকোড)
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPasscodeAttempt}
                    onChange={(e) => setCurrentPasscodeAttempt(e.target.value)}
                    placeholder="Enter current master passcode"
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-brand-muted">
                      New Passcode (নতুন পাসকোড)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPasscode(!showNewPasscode)}
                      className="text-[11px] text-brand-lavender hover:underline flex items-center space-x-1"
                    >
                      {showNewPasscode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showNewPasscode ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showNewPasscode ? 'text' : 'password'}
                    required
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter at least 4 characters"
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                    Confirm New Passcode (নতুন পাসকোড নিশ্চিত করুন)
                  </label>
                  <input
                    type={showNewPasscode ? 'text' : 'password'}
                    required
                    value={confirmNewPasscode}
                    onChange={(e) => setConfirmNewPasscode(e.target.value)}
                    placeholder="Re-type new master passcode"
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text focus:outline-none focus:border-brand-violet font-mono"
                  />
                </div>

                {isCustomPass && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleResetToDefaultPasscode}
                      className="text-xs text-rose-400 hover:text-rose-300 underline inline-flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to default passcode (admin123)</span>
                    </button>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-3 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasscodeChangeModal(false);
                      setCurrentPasscodeAttempt('');
                      setNewPasscode('');
                      setConfirmNewPasscode('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white text-xs font-bold transition-all shadow-glow-sm"
                  >
                    Save New Passcode
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminApp() {
  return (
    <ToastProvider>
      <AdminDashboardInner />
    </ToastProvider>
  );
}

export { AdminDashboardInner };
export default AdminApp;
