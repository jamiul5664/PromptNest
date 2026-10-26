/**
 * Monetization & Shortener Link Module
 *
 * Configurable via the dedicated Account Holder / Admin Panel.
 * Supports shortener ad links (such as ouo.io) in the background:
 * - 1st click on Copy opens the shortener link in a new tab; 2nd click copies the prompt.
 * - Optional first click anywhere on the website opens the shortener link once per session.
 */

export interface MonetizationConfig {
  enabled: boolean;
  shortenerUrl: string; // Global ouo.io URL
  buttonShortenerUrl?: string; // Optional dedicated ouo.io URL for buttons
  triggerOnButtons: boolean; // 1st click on buttons opens ouo.io, 2nd click performs action (except Search, Explore, Categories, Trending, Free Prompts)
  triggerOnImageClick: boolean; // 1st click on any image opens ouo.io, 2nd click opens main prompt page
  triggerOnCopyPrompt: boolean; // 1st click opens shortlink, 2nd click copies
  triggerOnFirstSiteClick: boolean; // First click anywhere on website opens link
  frequencyLimitMinutes: number; // Cooldown between link opens (0 = every time)
}

const MONETIZATION_STORAGE_KEY = 'promptvista_monetization_config';
const LAST_OPEN_KEY = 'promptvista_last_shortener_open';
const PROMPT_CLICKS_KEY = 'promptvista_prompt_clicks_tracker';
const IMAGE_CLICKS_KEY = 'promptvista_image_clicks_tracker';
const BUTTON_CLICKS_KEY = 'promptvista_button_clicks_tracker';

export const DEFAULT_MONETIZATION_CONFIG: MonetizationConfig = {
  enabled: true,
  shortenerUrl: 'https://ouo.io/',
  buttonShortenerUrl: '',
  triggerOnButtons: true,
  triggerOnImageClick: true,
  triggerOnCopyPrompt: true,
  triggerOnFirstSiteClick: false,
  frequencyLimitMinutes: 0,
};

export function getMonetizationConfig(): MonetizationConfig {
  if (typeof window === 'undefined') return DEFAULT_MONETIZATION_CONFIG;
  try {
    const stored = localStorage.getItem(MONETIZATION_STORAGE_KEY);
    return stored ? { ...DEFAULT_MONETIZATION_CONFIG, ...JSON.parse(stored) } : DEFAULT_MONETIZATION_CONFIG;
  } catch {
    return DEFAULT_MONETIZATION_CONFIG;
  }
}

export function saveMonetizationConfig(config: MonetizationConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MONETIZATION_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('monetization_config_updated'));
  } catch (err) {
    console.error('Failed to save monetization config', err);
  }
}

/**
 * Checks if the cooldown between popup/shortener triggers has elapsed.
 */
function isCooldownActive(cooldownMinutes: number): boolean {
  if (typeof window === 'undefined') return false;
  if (cooldownMinutes <= 0) return false; // 0 means always active on every interaction
  try {
    const lastOpen = sessionStorage.getItem(LAST_OPEN_KEY);
    if (!lastOpen) return false;
    const elapsedMinutes = (Date.now() - parseInt(lastOpen, 10)) / (1000 * 60);
    return elapsedMinutes < cooldownMinutes;
  } catch {
    return false;
  }
}

function markShortenerOpened(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LAST_OPEN_KEY, Date.now().toString());
}

/**
 * Checks if an element is strictly EXEMPT from monetization triggers.
 * Excludes:
 * - Search: Search bar inputs, search submit buttons, suggestions
 * - Explore: Explore page links and buttons
 * - Categories: Categories page links and buttons
 * - Trending: Trending filter chips and tabs
 * - Free Prompts: Free Prompts nav links and buttons
 * - Admin Panel: All admin/owner controls
 * - Core UI utilities: Theme switcher, modal dismiss/close
 */
export function isElementExemptFromMonetization(el: HTMLElement | null): boolean {
  if (!el) return true;

  // 1. Admin panel check
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('admin') || path.includes('panel')) return true;
  }
  if (el.closest('#admin-root') || el.closest('[data-admin-panel]')) {
    return true;
  }

  // Explicit exemption attribute
  if (el.closest('[data-ouo-exempt="true"]')) {
    return true;
  }

  // Find clickable ancestor (button, a, input, select, textarea)
  const target = (el.closest('button, a, input, select, textarea, [role="button"]') || el) as HTMLElement;

  // 2. Search exemption (Inputs, search form, search buttons)
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.getAttribute('type') === 'search' ||
    target.closest('form[role="search"]') ||
    target.closest('[data-search-container]')
  ) {
    return true;
  }

  const ariaLabel = (target.getAttribute('aria-label') || '').toLowerCase();
  const href = (target.getAttribute('href') || target.getAttribute('to') || '').toLowerCase();
  const text = (target.textContent || '').toLowerCase().trim();
  const id = (target.id || '').toLowerCase();
  const className = (typeof target.className === 'string' ? target.className : '').toLowerCase();

  // Search keyword check
  if (
    text === 'search' ||
    ariaLabel.includes('search') ||
    id.includes('search') ||
    className.includes('search')
  ) {
    return true;
  }

  // 3. Explore exemption
  if (
    href === '/explore' ||
    href.startsWith('/explore?') ||
    text === 'explore' ||
    text === 'explore all' ||
    text.includes('explore prompts') ||
    ariaLabel.includes('explore')
  ) {
    return true;
  }

  // 4. Categories exemption
  if (
    href === '/categories' ||
    href.startsWith('/categories?') ||
    text === 'categories' ||
    text === 'all categories' ||
    ariaLabel.includes('categories')
  ) {
    return true;
  }

  // 5. Trending exemption
  if (
    text === 'trending' ||
    text.includes('trending prompts') ||
    ariaLabel.includes('trending') ||
    id.includes('trending') ||
    target.getAttribute('data-filter') === 'trending'
  ) {
    return true;
  }

  // 6. Free Prompts exemption
  if (
    href === '/free-prompts' ||
    href.startsWith('/free-prompts?') ||
    text === 'free prompts' ||
    ariaLabel.includes('free prompts')
  ) {
    return true;
  }

  // 7. Core UI utilities (Theme toggle, Close buttons)
  if (
    ariaLabel.includes('close') ||
    ariaLabel.includes('dismiss') ||
    ariaLabel.includes('toggle theme') ||
    ariaLabel.includes('switch theme') ||
    id.includes('theme-toggle') ||
    id.includes('close-modal')
  ) {
    return true;
  }

  return false;
}

/**
 * Generates a stable key for a button or clickable element
 */
function getButtonIdentifier(el: HTMLElement): string {
  const promptId = el.getAttribute('data-prompt-id') || el.closest('[data-prompt-id]')?.getAttribute('data-prompt-id');
  const action = el.getAttribute('data-action') || el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30);
  if (promptId && action) {
    return `prompt_${promptId}_${action}`;
  }

  if (el.id) return `id_${el.id}`;

  const href = el.getAttribute('href') || el.getAttribute('to');
  if (href) return `link_${href}`;

  const text = el.textContent?.trim().slice(0, 30).replace(/\s+/g, '_') || 'btn';
  const tag = el.tagName.toLowerCase();
  return `${tag}_${text}`;
}

/**
 * Handles 2-step Button Click monetization:
 * Triggered on ANY button or clickable element
 * EXCEPT: Search, Explore, Categories, Trending, Free Prompts!
 *
 * 1st click -> opens ouo.io shortlink in a new background tab.
 * 2nd click -> allows the normal button action to execute.
 */
export function handleButtonMonetization(
  buttonEl: HTMLElement
): {
  shouldOpenLink: boolean;
  linkToOpen?: string;
  readyToProceed: boolean;
} {
  // If in admin panel, never trigger monetization
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('admin') || path.includes('panel')) {
      return { shouldOpenLink: false, readyToProceed: true };
    }
  }

  const config = getMonetizationConfig();

  // Active URL to use (dedicated button shortlink or global shortenerUrl)
  const targetUrl = (config.buttonShortenerUrl && config.buttonShortenerUrl.trim())
    ? config.buttonShortenerUrl.trim()
    : config.shortenerUrl.trim();

  // If monetization is disabled or no URL or triggerOnButtons is false, proceed immediately
  if (!config.enabled || !targetUrl || !config.triggerOnButtons) {
    return { shouldOpenLink: false, readyToProceed: true };
  }

  // Check exemption (Search, Explore, Categories, Trending, Free Prompts, etc.)
  if (isElementExemptFromMonetization(buttonEl)) {
    return { shouldOpenLink: false, readyToProceed: true };
  }

  // Generate a stable identifier for this button
  const buttonId = getButtonIdentifier(buttonEl);

  // Check if this button was already clicked once in this session
  let clickedButtons: string[] = [];
  try {
    clickedButtons = JSON.parse(sessionStorage.getItem(BUTTON_CLICKS_KEY) || '[]');
  } catch {
    clickedButtons = [];
  }

  if (clickedButtons.includes(buttonId) || buttonEl.dataset.ouoClicked === 'true') {
    // 2nd click: user already opened the link for this button, allow normal action!
    return { shouldOpenLink: false, readyToProceed: true };
  }

  // If cooldown is active (and greater than 0), allow normal action
  if (config.frequencyLimitMinutes > 0 && isCooldownActive(config.frequencyLimitMinutes)) {
    return { shouldOpenLink: false, readyToProceed: true };
  }

  // 1st click: record this button and trigger link open
  buttonEl.dataset.ouoClicked = 'true';
  clickedButtons.push(buttonId);
  try {
    sessionStorage.setItem(BUTTON_CLICKS_KEY, JSON.stringify(clickedButtons));

    // If associated with a prompt, synchronize prompt-level trackers too
    const promptId = buttonEl.getAttribute('data-prompt-id') || buttonEl.closest('[data-prompt-id]')?.getAttribute('data-prompt-id');
    if (promptId) {
      const promptClicks = JSON.parse(sessionStorage.getItem(PROMPT_CLICKS_KEY) || '[]');
      if (!promptClicks.includes(promptId)) {
        promptClicks.push(promptId);
        sessionStorage.setItem(PROMPT_CLICKS_KEY, JSON.stringify(promptClicks));
      }
      const imgClicks = JSON.parse(sessionStorage.getItem(IMAGE_CLICKS_KEY) || '[]');
      if (!imgClicks.includes(promptId)) {
        imgClicks.push(promptId);
        sessionStorage.setItem(IMAGE_CLICKS_KEY, JSON.stringify(imgClicks));
      }
    }
  } catch {
    // ignore
  }

  markShortenerOpened();
  return {
    shouldOpenLink: true,
    linkToOpen: targetUrl,
    readyToProceed: false,
  };
}

/**
 * Handles 2-step Image Click monetization:
 * 1st click on ANY image -> opens ouo.io shortlink in a new tab.
 * 2nd click on that same image (after user comes back) -> navigates to the main prompt detail page!
 */
export function handleImageMonetization(
  promptId: string,
  customShortlink?: string
): {
  shouldOpenLink: boolean;
  linkToOpen?: string;
  readyToNavigate: boolean;
} {
  // If in admin panel, never trigger monetization
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('admin') || path.includes('panel')) {
      return { shouldOpenLink: false, readyToNavigate: true };
    }
  }

  const config = getMonetizationConfig();

  // Resolve target URL: prompt custom shortlink takes precedence over global shortenerUrl
  const targetUrl = (customShortlink && customShortlink.trim()) ? customShortlink.trim() : config.shortenerUrl.trim();

  // If monetization is disabled or no URL or triggerOnImageClick is false, allow direct navigation
  if (!config.enabled || !targetUrl || !config.triggerOnImageClick) {
    return { shouldOpenLink: false, readyToNavigate: true };
  }

  // Check if this image was already clicked once in this session
  let clickedImages: string[] = [];
  try {
    clickedImages = JSON.parse(sessionStorage.getItem(IMAGE_CLICKS_KEY) || '[]');
  } catch {
    clickedImages = [];
  }

  if (clickedImages.includes(promptId)) {
    // 2nd click: user already triggered the link, now allow opening the main page!
    return { shouldOpenLink: false, readyToNavigate: true };
  }

  // If cooldown is active (and greater than 0), allow direct navigation
  if (config.frequencyLimitMinutes > 0 && isCooldownActive(config.frequencyLimitMinutes)) {
    return { shouldOpenLink: false, readyToNavigate: true };
  }

  // 1st click: record this prompt image click and trigger link open
  clickedImages.push(promptId);
  try {
    sessionStorage.setItem(IMAGE_CLICKS_KEY, JSON.stringify(clickedImages));
  } catch {
    // ignore
  }

  markShortenerOpened();
  return {
    shouldOpenLink: true,
    linkToOpen: targetUrl,
    readyToNavigate: false,
  };
}

/**
 * Handles the 2-step Copy Prompt monetization:
 * 1st click -> opens shortener ad link in a new background tab.
 * 2nd click -> copies the prompt to clipboard.
 */
export function handleCopyMonetization(
  promptId: string,
  customShortlink?: string
): {
  shouldOpenLink: boolean;
  linkToOpen?: string;
  readyToCopy: boolean;
} {
  // If in admin panel, never trigger monetization
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('admin') || path.includes('panel')) {
      return { shouldOpenLink: false, readyToCopy: true };
    }
  }

  const config = getMonetizationConfig();

  // Resolve target URL: prompt custom shortlink takes precedence over global shortenerUrl
  const targetUrl = (customShortlink && customShortlink.trim()) ? customShortlink.trim() : config.shortenerUrl.trim();

  // If monetization is disabled or URL is missing, proceed immediately to copy
  if (!config.enabled || !targetUrl || !config.triggerOnCopyPrompt) {
    return { shouldOpenLink: false, readyToCopy: true };
  }

  // Check if this prompt was already clicked once in this session
  let clickedPrompts: string[] = [];
  try {
    clickedPrompts = JSON.parse(sessionStorage.getItem(PROMPT_CLICKS_KEY) || '[]');
  } catch {
    clickedPrompts = [];
  }

  if (clickedPrompts.includes(promptId)) {
    // 2nd click: user already opened the link once, now allow copy!
    return { shouldOpenLink: false, readyToCopy: true };
  }

  // If cooldown is active (and greater than 0), let the user copy directly
  if (config.frequencyLimitMinutes > 0 && isCooldownActive(config.frequencyLimitMinutes)) {
    return { shouldOpenLink: false, readyToCopy: true };
  }

  // 1st click: record this prompt and trigger link open
  clickedPrompts.push(promptId);
  try {
    sessionStorage.setItem(PROMPT_CLICKS_KEY, JSON.stringify(clickedPrompts));
  } catch {
    // ignore
  }

  markShortenerOpened();
  return {
    shouldOpenLink: true,
    linkToOpen: targetUrl,
    readyToCopy: false,
  };
}

/**
 * Handles full website first touch: opens shortener link once on the first click anywhere.
 */
export function handleFirstSiteTouch(): boolean {
  if (typeof window === 'undefined') return false;

  // Never trigger on admin pages
  const path = window.location.pathname.toLowerCase();
  if (path.includes('admin') || path.includes('panel')) {
    return false;
  }

  const config = getMonetizationConfig();

  if (!config.enabled || !config.shortenerUrl.trim() || !config.triggerOnFirstSiteClick) {
    return false;
  }

  // Check if already triggered this session
  const alreadyTriggered = sessionStorage.getItem('promptvista_site_first_click_done');
  if (alreadyTriggered) return false;

  sessionStorage.setItem('promptvista_site_first_click_done', 'true');
  markShortenerOpened();

  try {
    const opened = window.open(config.shortenerUrl.trim(), '_blank', 'noopener,noreferrer');
    return !!opened;
  } catch (err) {
    console.warn('Failed to open background shortlink', err);
    return false;
  }
}

export interface SponsoredResource {
  id: string;
  title: string;
  description: string;
  categoryTag?: string;
  badgeText: string;
  targetUrl: string;
  isSponsored: boolean;
  sponsorName: string;
}

export const SPONSORED_RESOURCES: SponsoredResource[] = [
  {
    id: 'res-compute-gpu',
    title: 'High-Speed Cloud GPUs for Stable Diffusion & Flux',
    description: 'Rent dedicated on-demand GPUs (RTX 4090, A100) by the minute for local AI image synthesis workflows.',
    badgeText: 'Sponsored Partner',
    targetUrl: 'https://runpod.io/',
    isSponsored: true,
    sponsorName: 'RunPod',
  },
];

export function getRelevantResourceForPrompt(_category?: string): SponsoredResource | null {
  return SPONSORED_RESOURCES[0] || null;
}
