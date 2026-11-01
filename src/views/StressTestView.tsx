import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../state/store';
import { setStressState } from '../state/actions';
import { stressEngine } from '../utils/stressWorker';
import {
  Flame,
  HardDrive,
  Cpu,
  Play,
  Square,
  RefreshCw,
  Zap,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const StressTestView: React.FC = () => {
  const dispatch = useAppDispatch();
  const stressTest = useAppSelector(s => s.stressTest);
  const snapshots = useAppSelector(s => s.snapshots);
  const intervalSeconds = useAppSelector(s => s.intervalSeconds);

  const [intensity, setIntensity] = useState(0.85);

  const handleToggleCpuStress = () => {
    if (stressTest.activeCpuStress) {
      stressEngine.stopCpuStress();
      dispatch(setStressState({ activeCpuStress: false }));
    } else {
      stressEngine.startCpuStress(intensity);
      dispatch(setStressState({ activeCpuStress: true }));
    }
  };

  const handleAllocateMB = (mb: number) => {
    const currentTotal = stressEngine.allocateMemoryMB(mb);
    dispatch(setStressState({ allocatedMB: currentTotal }));
  };

  const handleFreeMemory = () => {
    stressEngine.releaseMemory();
    dispatch(setStressState({ allocatedMB: 0 }));
  };

  const latest = snapshots[snapshots.length - 1];

  return (
    <div className="space-y-4 pb-16 sm:pb-8">
      {/* Intro Header */}
      <section aria-label="Stress Lab Header" className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-900/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Diagnostic Workload Lab
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Simulate Workloads & Verify Snapshot Fidelity
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Spin up controlled CPU load cycles or allocate physical memory buffers to observe how your periodic
          snapshot engine (every <strong className="text-sky-400 font-mono">{intervalSeconds}s</strong>) captures
          the spikes, evaluates threshold alerts, and adjusts health score.
        </p>
      </section>

      {/* Control Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Workload Generator */}
        <section aria-label="CPU Stress Generator" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-950 text-sky-400 border border-sky-800">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">CPU Execution Burner</h2>
                  <p className="text-[11px] text-slate-400">Math iteration thread workload</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  stressTest.activeCpuStress
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {stressTest.activeCpuStress ? 'BURNING ACTIVE' : 'IDLE'}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Target Stress Intensity</span>
                <span className="font-mono font-bold text-sky-400">{Math.round(intensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.05"
                value={intensity}
                disabled={stressTest.activeCpuStress}
                onChange={e => setIntensity(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Mild (30%)</span>
                <span>Heavy (95%)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleCpuStress}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              stressTest.activeCpuStress
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/30'
            }`}
          >
            {stressTest.activeCpuStress ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>Stop CPU Burner</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Engage CPU Stress</span>
              </>
            )}
          </button>
        </section>

        {/* Memory Buffer Allocator */}
        <section aria-label="Memory Allocator" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Memory Allocator</h2>
                  <p className="text-[11px] text-slate-400">Allocate real Uint8Array memory buffers</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                {stressTest.allocatedMB} MB HELD
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Allocate Memory Blocks:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAllocateMB(25)}
                  className="py-2 px-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                >
                  +25 MB
                </button>
                <button
                  onClick={() => handleAllocateMB(50)}
                  className="py-2 px-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                >
                  +50 MB
                </button>
                <button
                  onClick={() => handleAllocateMB(100)}
                  className="py-2 px-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                >
                  +100 MB
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleFreeMemory}
            disabled={stressTest.allocatedMB === 0}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Free All Allocated Memory</span>
          </button>
        </section>
      </div>

      {/* Live Reaction Card */}
      <section aria-label="Real-time Reaction Telemetry" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-sky-400">
          <Zap className="w-4 h-4" />
          <h2 className="text-sm font-bold text-white">Live Reaction Telemetry</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Current Registered CPU</span>
            <div className="text-xl font-bold text-sky-400 mt-0.5">
              {latest ? `${latest.cpu.loadPercentage}%` : '--'}
            </div>
            <span className="text-[11px] text-slate-400 capitalize">{latest?.cpu.status || 'unknown'}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Current Registered Memory</span>
            <div className="text-xl font-bold text-indigo-400 mt-0.5">
              {latest ? `${latest.memory.usedMB} MB` : '--'}
            </div>
            <span className="text-[11px] text-slate-400">{latest ? `${latest.memory.percentage}% limit` : '--'}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">System Health Impact</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {latest ? `${latest.systemHealthScore}/100` : '--'}
            </div>
            <span className="text-[11px] text-slate-400">
              {latest && latest.systemHealthScore < 70 ? 'Degraded under stress' : 'Healthy condition'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
