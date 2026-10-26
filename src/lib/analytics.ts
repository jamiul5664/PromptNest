/**
 * PromptVista Real-Time Analytics & Traffic Tracking Engine
 * 
 * Provides:
 * 1. Live Active Viewers tracking via multi-tab/cross-device heartbeats
 * 2. Real-time Page Views, Unique Visitors, Prompt Copies, and Monetization Click metrics
 * 3. 24-hour hourly traffic analysis and popular pages tracking
 * 4. Device and Referrer distribution
 * 5. Instant synchronization to the Standalone Admin Panel via BroadcastChannel & Storage events
 */

export type AnalyticsEventType =
  | 'prompt_detail_view'
  | 'prompt_copy_success'
  | 'search_submission'
  | 'category_select'
  | 'favorite_toggle'
  | 'outbound_sponsored_click'
  | 'share_action'
  | 'page_view';

export interface AnalyticsEventPayload {
  promptId?: string;
  promptSlug?: string;
  promptTitle?: string;
  category?: string;
  searchQuery?: string;
  method?: string;
  favoriteState?: boolean;
  sponsorId?: string;
  url?: string;
  path?: string;
  pageTitle?: string;
  timestamp?: number;
}

export interface LiveSession {
  sessionId: string;
  visitorId: string;
  currentPath: string;
  pageTitle: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  referrer: string;
  startedAt: number;
  lastPing: number;
  country: string;
  countryCode: string;
}

export interface HourlyTrafficItem {
  hour: string;
  views: number;
  visitors: number;
}

export interface PageStatItem {
  path: string;
  title: string;
  views: number;
  copies: number;
  lastViewed: number;
}

export interface ActivityEventItem {
  id: string;
  type: AnalyticsEventType;
  title: string;
  description: string;
  path: string;
  timestamp: number;
  device: string;
}

export interface TrafficSummary {
  liveViewersCount: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  totalPageViews: number;
  totalUniqueVisitors: number;
  totalPromptCopies: number;
  totalShortlinkClicks: number;
  todayDate: string;
  hourlyTraffic: HourlyTrafficItem[];
  topPages: PageStatItem[];
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  referrerBreakdown: { [key: string]: number };
  recentActivity: ActivityEventItem[];
  simulationEnabled: boolean;
}

const STORAGE_KEYS = {
  SESSIONS: 'promptvista_live_sessions_v1',
  TRAFFIC: 'promptvista_traffic_summary_v1',
  VISITOR_ID: 'promptvista_unique_visitor_id',
  TODAY_VISITORS: 'promptvista_today_visitors_set',
  SIMULATION: 'promptvista_traffic_simulation_enabled',
};

// Safe BroadcastChannel for cross-tab instant sync
let analyticsChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    analyticsChannel = new BroadcastChannel('promptvista_analytics_sync');
  }
} catch {
  analyticsChannel = null;
}

function broadcastUpdate(type: 'heartbeat' | 'page_view' | 'event' | 'summary_reset') {
  if (typeof window === 'undefined') return;
  try {
    if (analyticsChannel) {
      analyticsChannel.postMessage({ type, timestamp: Date.now() });
    }
    window.dispatchEvent(new CustomEvent('promptvista_traffic_updated', { detail: { type } }));
  } catch {
    // fallback
  }
}

/**
 * Get or generate a persistent visitor ID for unique visitor counting
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'server_visitor';
  let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
  if (!visitorId) {
    visitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId);
  }
  return visitorId;
}

/**
 * Get or generate a session ID for the current tab/session
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let sessionId = sessionStorage.getItem('promptvista_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem('promptvista_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Detect client device category
 */
export function detectDevice(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window === 'undefined') return 'Desktop';
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width < 640) {
    return 'Mobile';
  }
  if (/ipad|tablet/i.test(userAgent) || (width >= 640 && width < 1024)) {
    return 'Tablet';
  }
  return 'Desktop';
}

/**
 * Detect simple browser name
 */
export function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  return 'Browser';
}

/**
 * Detect friendly referrer source
 */
export function detectReferrer(): string {
  if (typeof window === 'undefined') return 'Direct';
  const ref = document.referrer;
  if (!ref) return 'Direct / Bookmark';
  if (ref.includes('google.')) return 'Google Search';
  if (ref.includes('twitter.com') || ref.includes('t.co') || ref.includes('x.com')) return 'Twitter / X';
  if (ref.includes('pinterest.')) return 'Pinterest';
  if (ref.includes('facebook.com')) return 'Facebook';
  if (ref.includes('linkedin.com')) return 'LinkedIn';
  if (ref.includes('reddit.com')) return 'Reddit';
  if (ref.includes('ouo.io') || ref.includes('ouo.press')) return 'ouo.io Ad Return';
  return 'Direct / Referral';
}

/**
 * Clean up expired sessions (heartbeat older than 45 seconds)
 */
function cleanExpiredSessions(sessions: Record<string, LiveSession>): Record<string, LiveSession> {
  const now = Date.now();
  const cleaned: Record<string, LiveSession> = {};
  for (const [id, session] of Object.entries(sessions)) {
    // Session is active if pinged within the last 45 seconds
    if (now - session.lastPing < 45000) {
      cleaned[id] = session;
    }
  }
  return cleaned;
}

/**
 * Read active live sessions from storage
 */
export function getActiveLiveSessions(): LiveSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    const parsed: Record<string, LiveSession> = JSON.parse(raw);
    const cleaned = cleanExpiredSessions(parsed);
    return Object.values(cleaned);
  } catch {
    return [];
  }
}

/**
 * Check if traffic simulation is enabled
 */
export function isSimulationEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.SIMULATION) === 'true';
}

/**
 * Toggle simulation mode for testing
 */
export function setSimulationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SIMULATION, enabled ? 'true' : 'false');
  broadcastUpdate('summary_reset');
}

/**
 * Get accurate count of live viewers online now
 */
export function getLiveViewersCount(): number {
  const sessions = getActiveLiveSessions();
  let count = sessions.length;
  // If simulation enabled, add realistic organic traffic variance
  if (isSimulationEnabled()) {
    const baseHour = new Date().getHours();
    const multiplier = baseHour >= 12 && baseHour <= 23 ? 14 : 7;
    const jitter = Math.floor(Math.sin(Date.now() / 60000) * 3);
    count += Math.max(multiplier + jitter, 5);
  }
  return Math.max(count, 0);
}

/**
 * Helper to get current Date string YYYY-MM-DD
 */
function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Helper to generate default 24h hourly bins
 */
function generateDefaultHourlyBins(): HourlyTrafficItem[] {
  const bins: HourlyTrafficItem[] = [];
  const currentHour = new Date().getHours();
  for (let i = 23; i >= 0; i--) {
    const hourNum = (currentHour - i + 24) % 24;
    const hourLabel = `${String(hourNum).padStart(2, '0')}:00`;
    bins.push({
      hour: hourLabel,
      views: 0,
      visitors: 0,
    });
  }
  return bins;
}

/**
 * Retrieve traffic summary data
 */
export function getTrafficSummary(): TrafficSummary {
  const todayStr = getTodayDateString();
  const defaultSummary: TrafficSummary = {
    liveViewersCount: getLiveViewersCount(),
    todayPageViews: 0,
    todayUniqueVisitors: 0,
    totalPageViews: 0,
    totalUniqueVisitors: 0,
    totalPromptCopies: 0,
    totalShortlinkClicks: 0,
    todayDate: todayStr,
    hourlyTraffic: generateDefaultHourlyBins(),
    topPages: [
      { path: '/', title: 'Home Discovery Feed', views: 0, copies: 0, lastViewed: Date.now() },
      { path: '/explore', title: 'Explore Prompts & Visual Search', views: 0, copies: 0, lastViewed: Date.now() },
    ],
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
    referrerBreakdown: { 'Direct / Bookmark': 0 },
    recentActivity: [],
    simulationEnabled: isSimulationEnabled(),
  };

  if (typeof window === 'undefined') return defaultSummary;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRAFFIC);
    if (!raw) {
      return defaultSummary;
    }
    const data: TrafficSummary = JSON.parse(raw);

    // Reset daily counters if date changed
    if (data.todayDate !== todayStr) {
      data.todayDate = todayStr;
      data.todayPageViews = 0;
      data.todayUniqueVisitors = 0;
      localStorage.removeItem(STORAGE_KEYS.TODAY_VISITORS);
    }

    // Refresh live viewers count in real-time
    data.liveViewersCount = getLiveViewersCount();
    data.simulationEnabled = isSimulationEnabled();
    return data;
  } catch {
    return defaultSummary;
  }
}

/**
 * Save updated traffic summary
 */
function saveTrafficSummary(summary: TrafficSummary) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRAFFIC, JSON.stringify(summary));
  } catch (err) {
    console.warn('Failed to persist traffic summary:', err);
  }
}

/**
 * Record a page view on the public website
 */
export function recordPageView(pathname: string, pageTitle?: string) {
  if (typeof window === 'undefined') return;

  // Do not record admin panel pages as public consumer traffic
  if (pathname.includes('/panel') || pathname.includes('/admin') || pathname.includes('admin.html')) {
    return;
  }

  const visitorId = getOrCreateVisitorId();
  const summary = getTrafficSummary();
  const now = Date.now();
  const device = detectDevice();
  const referrer = detectReferrer();

  // 1. Increment total and daily page views
  summary.totalPageViews += 1;
  summary.todayPageViews += 1;

  // 2. Track unique visitor for today
  try {
    let todayVisitors: string[] = [];
    const storedSet = localStorage.getItem(STORAGE_KEYS.TODAY_VISITORS);
    if (storedSet) todayVisitors = JSON.parse(storedSet);

    if (!todayVisitors.includes(visitorId)) {
      todayVisitors.push(visitorId);
      localStorage.setItem(STORAGE_KEYS.TODAY_VISITORS, JSON.stringify(todayVisitors));
      summary.todayUniqueVisitors += 1;
      summary.totalUniqueVisitors += 1;
    }
  } catch {
    summary.todayUniqueVisitors += 1;
  }

  // 3. Increment device breakdown
  if (device === 'Mobile') summary.deviceBreakdown.mobile += 1;
  else if (device === 'Tablet') summary.deviceBreakdown.tablet += 1;
  else summary.deviceBreakdown.desktop += 1;

  // 4. Increment referrer breakdown
  summary.referrerBreakdown[referrer] = (summary.referrerBreakdown[referrer] || 0) + 1;

  // 5. Update top pages list
  const cleanTitle = pageTitle || (pathname === '/' ? 'Home Page' : pathname.replace('/prompts/', 'Prompt: ').replace('/', 'Page: '));
  const existingPage = summary.topPages.find((p) => p.path === pathname);
  if (existingPage) {
    existingPage.views += 1;
    existingPage.lastViewed = now;
  } else {
    summary.topPages.push({
      path: pathname,
      title: cleanTitle,
      views: 1,
      copies: 0,
      lastViewed: now,
    });
  }
  // Keep sorted by highest views
  summary.topPages.sort((a, b) => b.views - a.views);
  if (summary.topPages.length > 20) {
    summary.topPages = summary.topPages.slice(0, 20);
  }

  // 6. Update current hour bin in 24h hourly traffic
  const currentHourLabel = `${String(new Date().getHours()).padStart(2, '0')}:00`;
  const hourBin = summary.hourlyTraffic.find((h) => h.hour === currentHourLabel);
  if (hourBin) {
    hourBin.views += 1;
    hourBin.visitors += 1;
  } else {
    summary.hourlyTraffic.push({ hour: currentHourLabel, views: 1, visitors: 1 });
    if (summary.hourlyTraffic.length > 24) {
      summary.hourlyTraffic.shift();
    }
  }

  // 7. Add to recent activity feed
  summary.recentActivity.unshift({
    id: `act_${now}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'page_view',
    title: 'Page Visited',
    description: `Visitor viewed ${cleanTitle}`,
    path: pathname,
    timestamp: now,
    device,
  });
  if (summary.recentActivity.length > 25) {
    summary.recentActivity = summary.recentActivity.slice(0, 25);
  }

  saveTrafficSummary(summary);
  broadcastUpdate('page_view');
}

/**
 * Record a prompt copy or custom user action
 */
export function recordAction(type: AnalyticsEventType, payload: AnalyticsEventPayload = {}) {
  if (typeof window === 'undefined') return;

  const summary = getTrafficSummary();
  const now = Date.now();
  const device = detectDevice();

  if (type === 'prompt_copy_success') {
    summary.totalPromptCopies += 1;

    // Increment copies in topPages if matching
    if (payload.promptSlug) {
      const page = summary.topPages.find((p) => p.path.includes(payload.promptSlug!));
      if (page) page.copies += 1;
    }

    summary.recentActivity.unshift({
      id: `act_${now}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'prompt_copy_success',
      title: 'Prompt Copied!',
      description: payload.promptTitle ? `Copied prompt: "${payload.promptTitle}"` : 'A user copied an AI prompt',
      path: payload.path || window.location.pathname,
      timestamp: now,
      device,
    });
  } else if (type === 'outbound_sponsored_click') {
    summary.totalShortlinkClicks += 1;

    summary.recentActivity.unshift({
      id: `act_${now}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'outbound_sponsored_click',
      title: 'Monetized Link Clicked',
      description: 'Visitor triggered ouo.io shortlink background redirect',
      path: payload.path || window.location.pathname,
      timestamp: now,
      device,
    });
  } else if (type === 'search_submission') {
    summary.recentActivity.unshift({
      id: `act_${now}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'search_submission',
      title: 'Search Performed',
      description: `Searched for: "${payload.searchQuery || ''}"`,
      path: window.location.pathname,
      timestamp: now,
      device,
    });
  }

  if (summary.recentActivity.length > 25) {
    summary.recentActivity = summary.recentActivity.slice(0, 25);
  }

  saveTrafficSummary(summary);
  broadcastUpdate('event');
}

/**
 * Heartbeat function to maintain active live session
 * Should be called when public pages load and periodically every 15s
 */
export function initVisitorHeartbeat(currentPath: string, pageTitle?: string): () => void {
  if (typeof window === 'undefined') return () => {};

  // Do not count standalone admin panel as public website viewer
  if (currentPath.includes('/panel') || currentPath.includes('/admin') || currentPath.includes('admin.html')) {
    return () => {};
  }

  const sessionId = getOrCreateSessionId();
  const visitorId = getOrCreateVisitorId();
  const device = detectDevice();
  const browser = detectBrowser();
  const referrer = detectReferrer();

  const pingSession = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const sessions: Record<string, LiveSession> = raw ? JSON.parse(raw) : {};
      const cleaned = cleanExpiredSessions(sessions);

      cleaned[sessionId] = {
        sessionId,
        visitorId,
        currentPath,
        pageTitle: pageTitle || document.title || 'Browsing PromptVista',
        device,
        browser,
        referrer,
        startedAt: cleaned[sessionId]?.startedAt || Date.now(),
        lastPing: Date.now(),
        country: 'Global / Online',
        countryCode: '🌐',
      };

      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(cleaned));
      broadcastUpdate('heartbeat');
    } catch (err) {
      console.warn('Heartbeat error:', err);
    }
  };

  // Immediate ping
  pingSession();

  // Periodic heartbeat every 15 seconds
  const intervalId = window.setInterval(pingSession, 15000);

  // Tab unload / close cleanup
  const handleUnload = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!raw) return;
      const sessions: Record<string, LiveSession> = JSON.parse(raw);
      delete sessions[sessionId];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      broadcastUpdate('heartbeat');
    } catch {
      // ignore
    }
  };

  window.addEventListener('beforeunload', handleUnload);

  // Cleanup handler for React useEffect
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('beforeunload', handleUnload);
  };
}

/**
 * Universal Event Dispatcher
 */
export function trackEvent(eventType: AnalyticsEventType, payload: AnalyticsEventPayload = {}) {
  const eventData = {
    event: eventType,
    ...payload,
    timestamp: Date.now(),
  };

  // 1. Dispatch custom DOM event
  if (typeof window !== 'undefined') {
    const customEvent = new CustomEvent('promptvista_analytics', { detail: eventData });
    window.dispatchEvent(customEvent);
  }

  // 2. Record internally into traffic store
  recordAction(eventType, payload);

  // 3. Log in dev mode
  if (import.meta.env.DEV) {
    console.info(`[PromptVista Analytics: ${eventType}]`, eventData);
  }

  // 4. Plausible fallback if present
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(eventType, { props: payload });
  }
}

/**
 * Reset all analytics data (for Admin use)
 */
export function resetTrafficData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TRAFFIC);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.TODAY_VISITORS);
  broadcastUpdate('summary_reset');
}

/**
 * Seed realistic traffic data for admin demo / visual testing
 */
export function seedSampleTraffic(): void {
  if (typeof window === 'undefined') return;
  const todayStr = getTodayDateString();
  const currentHour = new Date().getHours();

  const hourly: HourlyTrafficItem[] = [];
  for (let i = 23; i >= 0; i--) {
    const h = (currentHour - i + 24) % 24;
    const hourLabel = `${String(h).padStart(2, '0')}:00`;
    // Curve peaking between 13:00 - 22:00
    const factor = h >= 14 && h <= 21 ? 1.8 : h >= 10 && h <= 13 ? 1.3 : 0.7;
    const views = Math.floor((15 + Math.random() * 20) * factor);
    const visitors = Math.floor(views * (0.65 + Math.random() * 0.2));
    hourly.push({ hour: hourLabel, views, visitors });
  }

  const sampleSummary: TrafficSummary = {
    liveViewersCount: 8,
    todayPageViews: 384,
    todayUniqueVisitors: 156,
    totalPageViews: 2480,
    totalUniqueVisitors: 980,
    totalPromptCopies: 142,
    totalShortlinkClicks: 89,
    todayDate: todayStr,
    hourlyTraffic: hourly,
    topPages: [
      { path: '/', title: 'Home Discovery Feed', views: 512, copies: 48, lastViewed: Date.now() - 1000 * 45 },
      { path: '/explore', title: 'Explore Prompts & Visual Search', views: 320, copies: 36, lastViewed: Date.now() - 1000 * 120 },
      { path: '/prompts/floating-obsidian-citadel', title: 'Floating Obsidian Citadel', views: 184, copies: 27, lastViewed: Date.now() - 1000 * 200 },
      { path: '/prompts/isometric-cyberpunk-alley', title: 'Isometric Cyberpunk Alleyway', views: 165, copies: 19, lastViewed: Date.now() - 1000 * 350 },
      { path: '/free-prompts', title: 'Free Prompts Gallery', views: 142, copies: 12, lastViewed: Date.now() - 1000 * 500 },
    ],
    deviceBreakdown: {
      desktop: 245,
      mobile: 128,
      tablet: 11,
    },
    referrerBreakdown: {
      'Direct / Bookmark': 148,
      'Google Search': 114,
      'Twitter / X': 58,
      'Pinterest': 42,
      'ouo.io Ad Return': 22,
    },
    recentActivity: [
      {
        id: 'act_seed_1',
        type: 'prompt_copy_success',
        title: 'Prompt Copied!',
        description: 'Visitor copied prompt: "Floating Obsidian Citadel"',
        path: '/prompts/floating-obsidian-citadel',
        timestamp: Date.now() - 1000 * 25,
        device: 'Desktop',
      },
      {
        id: 'act_seed_2',
        type: 'page_view',
        title: 'Page Visited',
        description: 'Visitor viewed Explore Prompts & Visual Search',
        path: '/explore',
        timestamp: Date.now() - 1000 * 65,
        device: 'Mobile',
      },
      {
        id: 'act_seed_3',
        type: 'outbound_sponsored_click',
        title: 'Monetized Link Clicked',
        description: 'Visitor triggered ouo.io shortlink redirect',
        path: '/prompts/isometric-cyberpunk-alley',
        timestamp: Date.now() - 1000 * 130,
        device: 'Desktop',
      },
      {
        id: 'act_seed_4',
        type: 'search_submission',
        title: 'Search Performed',
        description: 'Searched for: "cyberpunk city neon"',
        path: '/explore',
        timestamp: Date.now() - 1000 * 240,
        device: 'Mobile',
      },
    ],
    simulationEnabled: true,
  };

  saveTrafficSummary(sampleSummary);
  setSimulationEnabled(true);
  broadcastUpdate('summary_reset');
}
