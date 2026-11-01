import React, { useState } from 'react';
import { useRouter } from '../router/RouteManager';
import { useAppDispatch, useAppSelector } from '../state/store';
import {
  addSnapshot,
  setIntervalSeconds,
  toggleMonitoring,
} from '../state/actions';
import { captureSnapshot } from '../metrics/snapshotEngine';
import { isOk } from '../types/result';
import { useErrorManager } from '../error/ErrorManager';
import {
  Activity,
  Camera,
  Play,
  Pause,
  Clock,
  LayoutDashboard,
  Layers,
  BarChart3,
  Flame,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { AppRoute } from '../router/routes';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate } = useRouter();
  const dispatch = useAppDispatch();
  const isMonitoring = useAppSelector(s => s.isMonitoring);
  const intervalSeconds = useAppSelector(s => s.intervalSeconds);
  const secondsRemaining = useAppSelector(s => s.secondsRemaining);
  const thresholds = useAppSelector(s => s.thresholds);
  const stressTest = useAppSelector(s => s.stressTest);
  const { errors } = useErrorManager();

  const [isCapturing, setIsCapturing] = useState(false);

  const handleCaptureInstant = async () => {
    setIsCapturing(true);
    try {
      const res = await captureSnapshot(
        thresholds,
        ['manual'],
        'Manual on-demand trigger'
      );
      if (isOk(res)) {
        dispatch(addSnapshot(res.value));
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const navItems: { route: AppRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { route: 'dashboard', label: 'Monitor', icon: LayoutDashboard },
    { route: 'snapshots', label: 'Snapshots', icon: Layers },
    { route: 'analytics', label: 'Analytics', icon: BarChart3 },
    { route: 'stresstest', label: 'Stress Lab', icon: Flame },
    { route: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  PulseMetrics
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Telemetry
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden xs:block">
                Memory • Battery • CPU Snapshot Engine
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Desktop Navigation" className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Runner Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Interval Selector Pill */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-sky-400 hidden xs:block" />
              <span className="text-[11px] text-slate-400 hidden sm:inline">Interval:</span>
              <select
                aria-label="Snapshot Interval"
                value={intervalSeconds}
                onChange={e => dispatch(setIntervalSeconds(Number(e.target.value)))}
                className="bg-transparent text-xs font-mono font-bold text-sky-400 focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-slate-900 text-slate-200">1s</option>
                <option value={2} className="bg-slate-900 text-slate-200">2s</option>
                <option value={5} className="bg-slate-900 text-slate-200">5s</option>
                <option value={10} className="bg-slate-900 text-slate-200">10s</option>
                <option value={30} className="bg-slate-900 text-slate-200">30s</option>
                <option value={60} className="bg-slate-900 text-slate-200">60s</option>
              </select>
            </div>

            {/* Countdown Badge */}
            <div
              className={`flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-xl border ${
                isMonitoring
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="Time until next automated snapshot"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isMonitoring ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span className="font-bold">{isMonitoring ? `${secondsRemaining}s` : 'Paused'}</span>
            </div>

            {/* Play/Pause Toggle */}
            <button
              onClick={() => dispatch(toggleMonitoring())}
              className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                isMonitoring
                  ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-900/30'
              }`}
              title={isMonitoring ? 'Pause automated snapshots' : 'Resume automated snapshots'}
              aria-label={isMonitoring ? 'Pause monitoring' : 'Resume monitoring'}
            >
              {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            {/* Instant Snapshot Trigger */}
            <button
              onClick={handleCaptureInstant}
              disabled={isCapturing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/30 cursor-pointer disabled:opacity-50"
              title="Capture a snapshot immediately"
            >
              <Camera className={`w-3.5 h-3.5 ${isCapturing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isCapturing ? 'Saving...' : 'Snap Now'}</span>
            </button>

            {/* Active Errors Indicator */}
            {errors.length > 0 && (
              <button
                onClick={() => navigate('settings')}
                className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-400 hover:bg-rose-900/60 transition cursor-pointer"
                title={`${errors.length} error(s) logged`}
                aria-label="View errors"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex justify-around items-center">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition cursor-pointer ${
                isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? 'bg-sky-500/15 border border-sky-500/30' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
