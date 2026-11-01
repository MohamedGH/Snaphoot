import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../state/store';
import {
  setIntervalSeconds,
  setMaxRetention,
  toggleSoundAlerts,
  updateThresholds,
} from '../state/actions';
import { useErrorManager } from '../error/ErrorManager';
import {
  Settings,
  Clock,
  Bell,
  HardDrive,
  Volume2,
  VolumeX,
  Cpu,
  Battery,
  AlertTriangle,
  Info,
  CheckCircle,
  Trash2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const intervalSeconds = useAppSelector(s => s.intervalSeconds);
  const thresholds = useAppSelector(s => s.thresholds);
  const maxRetention = useAppSelector(s => s.maxRetention);
  const soundAlerts = useAppSelector(s => s.soundAlerts);
  const snapshots = useAppSelector(s => s.snapshots);

  const { errors, clearAllErrors } = useErrorManager();

  const [customInterval, setCustomInterval] = useState(intervalSeconds.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveInterval = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInterval, 10);
    if (!isNaN(val) && val >= 1 && val <= 3600) {
      dispatch(setIntervalSeconds(val));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const latest = snapshots[snapshots.length - 1];

  return (
    <div className="space-y-4 pb-16 sm:pb-8 max-w-4xl mx-auto">
      {/* Title */}
      <section aria-label="Settings Header" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-800 text-sky-400 border border-slate-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">System & Monitor Settings</h1>
            <p className="text-xs text-slate-400">Configure snapshot frequency, alert thresholds, and retention</p>
          </div>
        </div>
        {savedSuccess && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Saved</span>
          </span>
        )}
      </section>

      {/* Snapshot Interval Configuration (Interval X) */}
      <section aria-label="Interval Configuration" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-sky-400">
          <Clock className="w-4 h-4" />
          <h2 className="text-sm font-bold text-white">Snapshot Interval (X Time)</h2>
        </div>
        <p className="text-xs text-slate-300">
          Define how frequently the telemetry engine automatically records a system state snapshot.
        </p>

        {/* Quick Chips */}
        <div className="flex items-center flex-wrap gap-2">
          {[1, 2, 5, 10, 15, 30, 60, 300].map(sec => (
            <button
              key={sec}
              onClick={() => {
                dispatch(setIntervalSeconds(sec));
                setCustomInterval(sec.toString());
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                intervalSeconds === sec
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {sec < 60 ? `${sec}s` : `${sec / 60}m`}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleSaveInterval} className="flex items-center gap-2 pt-2 max-w-sm">
          <label htmlFor="custom-interval-input" className="text-xs text-slate-400 whitespace-nowrap">Custom Seconds:</label>
          <input
            id="custom-interval-input"
            type="number"
            min={1}
            max={3600}
            value={customInterval}
            onChange={e => setCustomInterval(e.target.value)}
            className="w-24 bg-slate-950 border border-slate-800 text-xs font-mono text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Apply
          </button>
        </form>
      </section>

      {/* Threshold Alert Rules */}
      <section aria-label="Alert Thresholds" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <Bell className="w-4 h-4" />
          <h2 className="text-sm font-bold text-white">Alert Threshold Triggers</h2>
        </div>
        <p className="text-xs text-slate-300">
          When a snapshot exceeds these limits, warning flags and alerts are automatically recorded.
        </p>

        <div className="space-y-4 pt-1">
          {/* CPU Threshold */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>CPU Load Alert Threshold</span>
              </span>
              <span className="font-mono font-bold text-sky-400">{thresholds.cpuThreshold}%</span>
            </div>
            <input
              type="range"
              min={30}
              max={95}
              value={thresholds.cpuThreshold}
              onChange={e =>
                dispatch(
                  updateThresholds({
                    ...thresholds,
                    cpuThreshold: parseInt(e.target.value, 10),
                  })
                )
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Memory Threshold */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>Memory Utilization Threshold</span>
              </span>
              <span className="font-mono font-bold text-indigo-400">{thresholds.memoryThreshold}%</span>
            </div>
            <input
              type="range"
              min={40}
              max={95}
              value={thresholds.memoryThreshold}
              onChange={e =>
                dispatch(
                  updateThresholds({
                    ...thresholds,
                    memoryThreshold: parseInt(e.target.value, 10),
                  })
                )
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Battery Threshold */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <span>Low Battery Alert Threshold</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">{thresholds.batteryThreshold}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={thresholds.batteryThreshold}
              onChange={e =>
                dispatch(
                  updateThresholds({
                    ...thresholds,
                    batteryThreshold: parseInt(e.target.value, 10),
                  })
                )
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Audio Alert Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2.5">
            {soundAlerts ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Sound Chimes on Alert</span>
              <span className="text-[10px] text-slate-400">Play subtle synthesized audio beep when threshold breaches</span>
            </div>
          </div>
          <button
            onClick={() => dispatch(toggleSoundAlerts())}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
              soundAlerts
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {soundAlerts ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </section>

      {/* Snapshot Retention & Storage Policy */}
      <section aria-label="Retention Policy" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-indigo-400">
          <HardDrive className="w-4 h-4" />
          <h2 className="text-sm font-bold text-white">Retention & Memory Safety</h2>
        </div>
        <p className="text-xs text-slate-300">
          Limit how many historical snapshots are maintained in memory to avoid unbounded RAM growth.
        </p>
        <div className="flex items-center gap-2">
          {[50, 100, 200, 500].map(count => (
            <button
              key={count}
              onClick={() => dispatch(setMaxRetention(count))}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                maxRetention === count
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              Last {count}
            </button>
          ))}
        </div>
      </section>

      {/* System Hardware & API Capabilities */}
      <section aria-label="System Capabilities" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white">Host Capabilities & Browser APIs</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Memory API</span>
            <span className="text-emerald-400 font-bold">
              {latest?.memory.isSupported ? 'Native (performance.memory)' : 'Synthesized Runtime Model'}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Battery API</span>
            <span className="text-emerald-400 font-bold">
              {latest?.battery.isSupported ? 'Native (navigator.getBattery)' : 'Fallback Dynamic Model'}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Logical Cores</span>
            <span className="text-sky-400 font-bold">
              {latest ? `${latest.cpu.coreCount} Threads` : '4 Threads'}
            </span>
          </div>
        </div>
      </section>

      {/* Error & Warning Diagnostic Log */}
      <section aria-label="Error Log" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-sm font-bold text-white">Error & Warning Audit Log</h2>
          </div>
          {errors.length > 0 && (
            <button
              onClick={clearAllErrors}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {errors.length === 0 ? (
          <div className="text-xs text-slate-500 py-3 text-center">
            Zero runtime exceptions or errors recorded.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
            {errors.map(err => (
              <div
                key={err.id}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-2"
              >
                <div>
                  <span className="text-rose-400 font-bold">[{err.code}]</span>{' '}
                  <span className="text-slate-200">{err.message}</span>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(err.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
