import React, { useState } from 'react';
import {
  Activity,
  Users,
  Eye,
  BarChart2,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  RefreshCw,
  Trash2,
  Sparkles,
  DollarSign,
  Copy,
  Globe,
  Radio,
  TrendingUp,
  Search,
} from 'lucide-react';
import type { TrafficSummary, LiveSession } from '../lib/analytics';

interface TrafficAnalyticsViewProps {
  trafficSummary: TrafficSummary;
  liveSessions: LiveSession[];
  liveCount: number;
  onRefresh: () => void;
  onReset: () => void;
  onSeedSample: () => void;
  onToggleSimulation: (enabled: boolean) => void;
}

export const TrafficAnalyticsView: React.FC<TrafficAnalyticsViewProps> = ({
  trafficSummary,
  liveSessions,
  liveCount,
  onRefresh,
  onReset,
  onSeedSample,
  onToggleSimulation,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Calculate device percentages
  const totalDeviceActions =
    (trafficSummary.deviceBreakdown.desktop || 0) +
    (trafficSummary.deviceBreakdown.mobile || 0) +
    (trafficSummary.deviceBreakdown.tablet || 0);

  const desktopPct = totalDeviceActions > 0
    ? Math.round((trafficSummary.deviceBreakdown.desktop / totalDeviceActions) * 100)
    : 65;
  const mobilePct = totalDeviceActions > 0
    ? Math.round((trafficSummary.deviceBreakdown.mobile / totalDeviceActions) * 100)
    : 30;
  const tabletPct = totalDeviceActions > 0
    ? 100 - desktopPct - mobilePct
    : 5;

  // Find max views in hourly traffic for chart scale
  const maxHourlyViews = Math.max(
    ...trafficSummary.hourlyTraffic.map((h) => h.views),
    10
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Live Beacon Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171727] via-[#1b1733] to-[#161f30] border border-brand-violet/30 shadow-2xl relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>PromptVista Real-Time Traffic Radar</span>
            </div>

            <div className="flex items-baseline space-x-3 pt-1">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {liveCount}
              </h2>
              <span className="text-lg sm:text-xl font-bold text-emerald-400">
                Active Live Viewers Online
              </span>
            </div>

            <p className="text-xs sm:text-sm text-brand-muted max-w-2xl leading-relaxed">
              রিয়েল-টাইমে ওয়েবসাইটে কত জন ভিজিটর লাইভ আছেন, কোন পেজটি দেখছেন এবং কি কি প্রম্পট কপি করছেন তা সরাসরি এখানে আপডেট হচ্ছে।
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-brand-surface hover:bg-brand-card border border-brand-border text-xs font-semibold text-brand-text transition-colors shadow-sm"
              title="Refresh live metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-violet ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Now</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSimulation(!trafficSummary.simulationEnabled)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                trafficSummary.simulationEnabled
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-glow-sm'
                  : 'bg-brand-surface hover:bg-brand-card text-brand-muted border-brand-border'
              }`}
              title="Toggle Organic Baseline Traffic Simulation"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Traffic: {trafficSummary.simulationEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={onSeedSample}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-brand-violet/20 hover:bg-brand-violet/30 border border-brand-violet/40 text-xs font-semibold text-brand-lavender transition-colors"
              title="Populate 24-hour sample graph data"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-violet" />
              <span>Seed Sample Data</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-colors"
              title="Reset all recorded traffic counters"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Live Now */}
        <div className="p-5 rounded-2xl bg-brand-card border border-brand-border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Live Online
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-text">
              {liveCount}
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              <span>Currently on website</span>
            </span>
          </div>
        </div>

        {/* Card 2: Today's Page Views */}
        <div className="p-5 rounded-2xl bg-brand-card border border-brand-border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Today Views
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-violet/15 border border-brand-violet/30 flex items-center justify-center text-brand-lavender">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-text">
              {trafficSummary.todayPageViews}
            </h3>
            <span className="text-[11px] text-brand-muted font-medium mt-1 block">
              Total all-time: {trafficSummary.totalPageViews}
            </span>
          </div>
        </div>

        {/* Card 3: Unique Visitors */}
        <div className="p-5 rounded-2xl bg-brand-card border border-brand-border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Unique Visitors
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-text">
              {trafficSummary.todayUniqueVisitors}
            </h3>
            <span className="text-[11px] text-brand-muted font-medium mt-1 block">
              Total unique: {trafficSummary.totalUniqueVisitors}
            </span>
          </div>
        </div>

        {/* Card 4: Prompts Copied */}
        <div className="p-5 rounded-2xl bg-brand-card border border-brand-border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Prompts Copied
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-text">
              {trafficSummary.totalPromptCopies}
            </h3>
            <span className="text-[11px] text-brand-muted font-medium mt-1 block">
              User copies across site
            </span>
          </div>
        </div>

        {/* Card 5: Monetized Shortlink Clicks */}
        <div className="p-5 rounded-2xl bg-brand-card border border-brand-border shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              ouo.io Ad Clicks
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400">
              {trafficSummary.totalShortlinkClicks}
            </h3>
            <span className="text-[11px] text-brand-muted font-medium mt-1 block">
              Background ad triggers
            </span>
          </div>
        </div>
      </div>

      {/* 3. 24-Hour Traffic Activity Bar Chart */}
      <div className="p-6 rounded-3xl bg-brand-card border border-brand-border shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-brand-text flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-brand-violet" />
              <span>24-Hour Traffic Trend (গত ২৪ ঘণ্টার ট্রাফিক গ্রাফ)</span>
            </h3>
            <p className="text-xs text-brand-muted">
              প্রতি ঘণ্টার পেজ ভিউ এবং ভিজিটরদের উপস্থিতির ওঠানামা।
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-brand-violet inline-block"></span>
              <span className="text-brand-muted">Page Views</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-cyan-400/80 inline-block"></span>
              <span className="text-brand-muted">Unique Visitors</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4">
          <div className="h-48 w-full flex items-end gap-1 sm:gap-2 px-1">
            {trafficSummary.hourlyTraffic.map((hourData, idx) => {
              const viewHeightPct = Math.max((hourData.views / maxHourlyViews) * 100, 4);
              const isCurrent = idx === trafficSummary.hourlyTraffic.length - 1;
              return (
                <div
                  key={hourData.hour}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-surface border border-brand-border text-brand-text text-[11px] px-2.5 py-1.5 rounded-lg pointer-events-none shadow-xl z-20 whitespace-nowrap">
                    <p className="font-bold">{hourData.hour}</p>
                    <p className="text-brand-lavender">{hourData.views} Views • {hourData.visitors} Visitors</p>
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[20px] rounded-t-md bg-brand-surface relative flex items-end justify-center overflow-hidden">
                    <div
                      style={{ height: `${viewHeightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isCurrent
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : 'bg-gradient-to-t from-brand-violet/70 to-brand-violet hover:from-brand-lavender hover:to-brand-lavender'
                      }`}
                    />
                  </div>

                  {/* Hour label below (every 2 or 3 bars on mobile) */}
                  <span className="text-[10px] text-brand-muted font-mono mt-2 truncate">
                    {idx % 3 === 0 || isCurrent ? hourData.hour.replace(':00', 'h') : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Active Live Sessions Roster & Real-time Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Live Sessions (Left 7 Columns) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-brand-card border border-brand-border shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-brand-text flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Active Live Visitors ({liveSessions.length})</span>
              </h3>
              <p className="text-xs text-brand-muted">
                এই মুহূর্তে যারা আপনার পাবলিক ওয়েবসাইটে সক্রিয়ভাবে আছেন।
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Live Sync
            </span>
          </div>

          {liveSessions.length === 0 ? (
            <div className="py-12 text-center text-brand-muted space-y-2">
              <Users className="w-10 h-10 mx-auto text-brand-surface opacity-60" />
              <p className="text-xs">No active live visitors detected on localhost right now.</p>
              <p className="text-[11px] text-brand-muted">
                Open <a href="/" target="_blank" className="text-brand-lavender underline font-medium">PromptVista in a new tab</a> to see your session appear here instantly!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-brand-border/60 max-h-80 overflow-y-auto">
              {liveSessions.map((session) => {
                const secondsAgo = Math.max(0, Math.floor((Date.now() - session.lastPing) / 1000));
                return (
                  <div key={session.sessionId} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold text-brand-lavender bg-brand-bg px-1.5 py-0.5 rounded border border-brand-border">
                          {session.sessionId.substring(0, 10)}
                        </span>
                        <span className="text-brand-text font-medium truncate max-w-[200px] sm:max-w-xs">
                          {session.currentPath === '/' ? 'Home Page' : session.currentPath}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-brand-muted">
                        <span className="flex items-center space-x-1">
                          {session.device === 'Mobile' ? (
                            <Smartphone className="w-3 h-3 text-brand-violet" />
                          ) : session.device === 'Tablet' ? (
                            <Tablet className="w-3 h-3 text-brand-violet" />
                          ) : (
                            <Monitor className="w-3 h-3 text-brand-violet" />
                          )}
                          <span>{session.device}</span>
                        </span>
                        <span>•</span>
                        <span>{session.browser}</span>
                        <span>•</span>
                        <span className="truncate max-w-[120px]">{session.referrer}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Active ({secondsAgo}s ago)</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time Activity Feed (Right 5 Columns) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-brand-card border border-brand-border shadow-xl space-y-4">
          <div className="border-b border-brand-border/80 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-brand-text flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Activity Feed</span>
            </h3>
            <span className="text-[11px] text-brand-muted">Recent events</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {trafficSummary.recentActivity.length === 0 ? (
              <div className="py-12 text-center text-brand-muted text-xs">
                No recent activity recorded yet.
              </div>
            ) : (
              trafficSummary.recentActivity.slice(0, 12).map((item) => {
                const secondsAgo = Math.floor((Date.now() - item.timestamp) / 1000);
                const timeString =
                  secondsAgo < 60
                    ? `${secondsAgo}s ago`
                    : `${Math.floor(secondsAgo / 60)}m ago`;

                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-brand-bg/80 border border-brand-border/60 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        {item.type === 'prompt_copy_success' ? (
                          <Copy className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        ) : item.type === 'outbound_sponsored_click' ? (
                          <DollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : item.type === 'search_submission' ? (
                          <Search className="w-3.5 h-3.5 text-brand-violet shrink-0" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="font-semibold text-brand-text truncate">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-muted truncate pl-5">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-[10px] text-brand-muted font-mono shrink-0">
                      {timeString}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Top Visited Pages & Device / Referrer Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Visited Prompts & Pages (Left 7 Columns) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-brand-card border border-brand-border shadow-xl space-y-4">
          <div className="border-b border-brand-border/80 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-text flex items-center space-x-2">
                <Globe className="w-4 h-4 text-brand-violet" />
                <span>Top Visited Pages & Prompts (জনপ্রিয় পেজসমূহ)</span>
              </h3>
              <p className="text-xs text-brand-muted">ভিজিটররা কোন প্রম্পট ও পেজ সবচেয়ে বেশি দেখছেন।</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-muted text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Page Title / URL</th>
                  <th className="py-2.5 text-center font-semibold">Total Views</th>
                  <th className="py-2.5 text-center font-semibold">Copies</th>
                  <th className="py-2.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {trafficSummary.topPages.slice(0, 6).map((page) => (
                  <tr key={page.path} className="hover:bg-brand-surface/40 transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold text-brand-text truncate max-w-xs">
                        {page.title}
                      </div>
                      <div className="font-mono text-[10px] text-brand-muted truncate">
                        {page.path}
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-bold text-brand-text">
                      {page.views}
                    </td>
                    <td className="py-2.5 text-center font-bold text-emerald-400">
                      {page.copies}
                    </td>
                    <td className="py-2.5 text-right">
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-[11px] text-brand-lavender hover:underline"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Devices & Referrers (Right 5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Device Distribution */}
          <div className="p-6 rounded-3xl bg-brand-card border border-brand-border shadow-xl space-y-4">
            <h3 className="text-base font-bold text-brand-text flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Device Distribution (ডিভাইস ভাগ)</span>
            </h3>

            {/* Combined Bar */}
            <div className="h-3 w-full bg-brand-surface rounded-full overflow-hidden flex">
              <div style={{ width: `${desktopPct}%` }} className="bg-brand-violet h-full" title={`Desktop: ${desktopPct}%`} />
              <div style={{ width: `${mobilePct}%` }} className="bg-cyan-400 h-full" title={`Mobile: ${mobilePct}%`} />
              <div style={{ width: `${tabletPct}%` }} className="bg-amber-400 h-full" title={`Tablet: ${tabletPct}%`} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded-xl bg-brand-bg border border-brand-border">
                <span className="text-brand-muted text-[11px] block">Desktop</span>
                <span className="font-bold text-brand-text text-sm">{desktopPct}%</span>
              </div>
              <div className="p-2 rounded-xl bg-brand-bg border border-brand-border">
                <span className="text-brand-muted text-[11px] block">Mobile</span>
                <span className="font-bold text-cyan-400 text-sm">{mobilePct}%</span>
              </div>
              <div className="p-2 rounded-xl bg-brand-bg border border-brand-border">
                <span className="text-brand-muted text-[11px] block">Tablet</span>
                <span className="font-bold text-amber-400 text-sm">{tabletPct}%</span>
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="p-6 rounded-3xl bg-brand-card border border-brand-border shadow-xl space-y-3">
            <h3 className="text-base font-bold text-brand-text flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Traffic Sources (ট্রাফিক উৎস)</span>
            </h3>

            <div className="space-y-2 text-xs">
              {Object.entries(trafficSummary.referrerBreakdown).slice(0, 5).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between p-2 rounded-xl bg-brand-bg border border-brand-border">
                  <span className="text-brand-text font-medium truncate max-w-[180px]">{source}</span>
                  <span className="font-mono font-bold text-brand-lavender">{count} views</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-text">Reset Traffic Analytics?</h3>
                <p className="text-xs text-brand-muted">সব ট্রাফিক কাউন্টার এবং পেজ ভিউ রিসেট করতে চান?</p>
              </div>
            </div>

            <p className="text-xs text-brand-muted">
              এটি সব পেজভিউ, ইউনিক ভিজিটর ও কপি স্ট্যাট ০ করে দিবে। লাইভ ব্রাউজিং হিস্টোরি নতুনভাবে কাউন্ট শুরু করবে।
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-brand-bg hover:bg-brand-surface border border-brand-border text-xs font-semibold text-brand-text transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  onReset();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-glow-sm"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
