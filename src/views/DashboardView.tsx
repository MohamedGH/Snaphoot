import React from 'react';
import { useAppDispatch, useAppSelector } from '../state/store';
import { selectSnapshot, setIntervalSeconds, toggleMonitoring } from '../state/actions';
import { MetricCard } from '../components/MetricCard';
import { useRouter } from '../router/RouteManager';
import {
  Cpu,
  HardDrive,
  Battery,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { roundTo } from '../utils/fp';

export const DashboardView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { navigate } = useRouter();

  const snapshots = useAppSelector(s => s.snapshots);
  const intervalSeconds = useAppSelector(s => s.intervalSeconds);
  const isMonitoring = useAppSelector(s => s.isMonitoring);
  const secondsRemaining = useAppSelector(s => s.secondsRemaining);
  const stressTest = useAppSelector(s => s.stressTest);

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  // Derive sparkline data series (last 20 snapshots)
  const recentWindow = snapshots.slice(-20);
  const cpuHistory = recentWindow.map(s => s.cpu.loadPercentage);
  const memoryHistory = recentWindow.map(s => s.memory.percentage);
  const batteryHistory = recentWindow.map(s => s.battery.level);

  // Compute deltas
  const cpuDelta = previous
    ? {
        text: `${latest.cpu.loadPercentage >= previous.cpu.loadPercentage ? '+' : ''}${roundTo(1)(
          latest.cpu.loadPercentage - previous.cpu.loadPercentage
        )}%`,
        isPositive: latest.cpu.loadPercentage >= previous.cpu.loadPercentage,
      }
    : undefined;

  const memDelta = previous
    ? {
        text: `${latest.memory.usedMB >= previous.memory.usedMB ? '+' : ''}${roundTo(1)(
          latest.memory.usedMB - previous.memory.usedMB
        )} MB`,
        isPositive: latest.memory.usedMB >= previous.memory.usedMB,
      }
    : undefined;

  const batteryDelta = previous
    ? {
        text: `${latest.battery.level >= previous.battery.level ? '+' : ''}${roundTo(0)(
          latest.battery.level - previous.battery.level
        )}%`,
        isPositive: latest.battery.level >= previous.battery.level,
      }
    : undefined;

  const cpuBadgeColor = !latest
    ? 'sky'
    : latest.cpu.status === 'optimal'
    ? 'emerald'
    : latest.cpu.status === 'moderate'
    ? 'sky'
    : latest.cpu.status === 'elevated'
    ? 'amber'
    : 'rose';

  const memBadgeColor = !latest
    ? 'sky'
    : latest.memory.percentage < 60
    ? 'emerald'
    : latest.memory.percentage < 80
    ? 'amber'
    : 'rose';

  const batteryBadgeColor = !latest
    ? 'sky'
    : latest.battery.level > 30
    ? 'emerald'
    : latest.battery.level > 15
    ? 'amber'
    : 'rose';

  return (
    <div className="space-y-5 pb-16 sm:pb-8">
      {/* Hero Control Banner */}
      <section aria-label="System Monitor Overview" className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                System Telemetry Engine
              </span>
              {stressTest.activeCpuStress && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Stress Mode Active
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Periodic Snapshot Monitor
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Capturing memory footprint, battery charge rate, and thread execution load automatically every{' '}
              <strong className="text-sky-400 font-mono">{intervalSeconds} seconds</strong>.
            </p>
          </div>

          {/* Quick Interval Preset Buttons */}
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 px-2">Set X:</span>
            {[1, 2, 5, 10, 30].map(sec => (
              <button
                key={sec}
                onClick={() => dispatch(setIntervalSeconds(sec))}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  intervalSeconds === sec
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar for Current Countdown */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Next snapshot:{' '}
              <strong className="text-slate-200 font-mono font-bold">
                {isMonitoring ? `${secondsRemaining}s` : 'Paused'}
              </strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Recorded: <strong className="text-slate-200 font-mono">{snapshots.length}</strong> snapshots
            </span>
          </div>

          <button
            onClick={() => dispatch(toggleMonitoring())}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition cursor-pointer"
          >
            {isMonitoring ? 'Pause Runner' : 'Resume Runner'}
          </button>
        </div>
      </section>

      {/* Primary Metrics Grid (3 Pillars: Memory, Battery, CPU) */}
      <section aria-label="Current Performance Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CPU Load Metric Card */}
        <MetricCard
          title="CPU Load"
          value={latest ? `${latest.cpu.loadPercentage}` : '--'}
          unit="%"
          subtitle="Execution lag & thread stress"
          icon={Cpu}
          badgeText={latest ? latest.cpu.status : 'Loading'}
          badgeColor={cpuBadgeColor}
          sparklineData={cpuHistory}
          sparklineColor="#38bdf8"
          details={[
            { label: 'Event Loop Lag', value: latest ? `${latest.cpu.eventLoopLagMs} ms` : '--' },
            { label: 'CPU Cores', value: latest ? `${latest.cpu.coreCount} threads` : '--' },
            { label: 'Status', value: latest ? latest.cpu.status.toUpperCase() : '--' },
            { label: 'Sample Delay', value: `${intervalSeconds}s` },
          ]}
          delta={cpuDelta}
        />

        {/* Memory Used Metric Card */}
        <MetricCard
          title="Memory Used"
          value={latest ? `${latest.memory.usedMB}` : '--'}
          unit="MB"
          subtitle={latest?.memory.isSupported ? 'Native Heap Allocation' : 'Estimated Footprint'}
          icon={HardDrive}
          badgeText={latest ? `${latest.memory.percentage}% Used` : 'Loading'}
          badgeColor={memBadgeColor}
          sparklineData={memoryHistory}
          sparklineColor="#818cf8"
          details={[
            { label: 'Utilization', value: latest ? `${latest.memory.percentage}%` : '--' },
            { label: 'Allocated Total', value: latest ? `${latest.memory.totalMB} MB` : '--' },
            { label: 'Max Heap Limit', value: latest ? `${latest.memory.limitMB} MB` : '--' },
            { label: 'Data Source', value: latest ? latest.memory.source : '--' },
          ]}
          delta={memDelta}
        />

        {/* Battery Level Metric Card */}
        <MetricCard
          title="Battery Level"
          value={latest ? `${latest.battery.level}` : '--'}
          unit="%"
          subtitle={latest?.battery.charging ? 'Power Connected (Charging)' : 'Discharging Battery'}
          icon={Battery}
          badgeText={latest?.battery.charging ? 'Charging' : 'On Battery'}
          badgeColor={batteryBadgeColor}
          sparklineData={batteryHistory}
          sparklineColor="#34d399"
          details={[
            { label: 'Power State', value: latest?.battery.charging ? 'Plugged In' : 'Unplugged' },
            {
              label: 'Remaining Time',
              value: latest?.battery.dischargingTime
                ? `${Math.round(latest.battery.dischargingTime / 60)} min`
                : latest?.battery.charging
                ? 'Full in ~' + (latest.battery.chargingTime ? `${Math.round(latest.battery.chargingTime / 60)}m` : '60m')
                : 'Normal',
            },
            { label: 'Health Score', value: latest ? `${latest.systemHealthScore}/100` : '--' },
            { label: 'API Provider', value: latest?.battery.isSupported ? 'Native API' : 'Simulated' },
          ]}
          delta={batteryDelta}
        />
      </section>

      {/* Multi-Metric Live Stream Timeline preview */}
      <section aria-label="Telemetry Stream Preview" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Telemetry Stream Preview</h2>
            <span className="text-[11px] text-slate-400 font-mono">(Last {recentWindow.length} snapshots)</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-1 rounded-full bg-sky-400 inline-block" />
              <span>CPU %</span>
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-1 rounded-full bg-indigo-400 inline-block" />
              <span>Mem %</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-1 rounded-full bg-emerald-400 inline-block" />
              <span>Battery %</span>
            </span>
            <button
              onClick={() => navigate('analytics')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 ml-2 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Combined Visual Track */}
        <div className="h-44 w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          {recentWindow.length < 2 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Collecting snapshots every {intervalSeconds}s...
            </div>
          ) : (
            <div className="relative h-full w-full">
              {/* Background Reference Grid */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-dashed border-slate-500 text-[9px] text-slate-400 font-mono">100%</div>
                <div className="border-b border-dashed border-slate-500 text-[9px] text-slate-400 font-mono">50%</div>
                <div className="border-b border-dashed border-slate-500 text-[9px] text-slate-400 font-mono">0%</div>
              </div>

              {/* Responsive SVG Curves */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                {/* CPU Line */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={recentWindow
                    .map((s, idx) => {
                      const x = (idx / (recentWindow.length - 1)) * 500;
                      const y = 120 - (s.cpu.loadPercentage / 100) * 110 - 5;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ')}
                />
                {/* Memory Line */}
                <polyline
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  points={recentWindow
                    .map((s, idx) => {
                      const x = (idx / (recentWindow.length - 1)) * 500;
                      const y = 120 - (s.memory.percentage / 100) * 110 - 5;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ')}
                />
                {/* Battery Line */}
                <polyline
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  points={recentWindow
                    .map((s, idx) => {
                      const x = (idx / (recentWindow.length - 1)) * 500;
                      const y = 120 - (s.battery.level / 100) * 110 - 5;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ')}
                />
              </svg>
            </div>
          )}
        </div>
      </section>

      {/* Recent Snapshot Feed */}
      <section aria-label="Recent Snapshots Feed" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Recent Snapshots Ticker</h2>
            <p className="text-xs text-slate-400">Click any snapshot to inspect all parameters</p>
          </div>
          <button
            onClick={() => navigate('snapshots')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({snapshots.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No snapshots recorded yet. Capture will start automatically or click "Snap Now".
          </div>
        ) : (
          <div className="space-y-2">
            {snapshots
              .slice(-5)
              .reverse()
              .map(snap => (
                <div
                  key={snap.id}
                  onClick={() => dispatch(selectSnapshot(snap.id))}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 text-sky-400 border border-slate-800 group-hover:border-sky-500/50 transition">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {snap.formattedTime}
                        </span>
                        {snap.triggeredAlerts.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800/50">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Alert</span>
                          </span>
                        )}
                        {snap.tags.map(t => (
                          <span key={t} className="text-[10px] text-slate-400 font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Health: {snap.systemHealthScore}/100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">CPU</span>
                      <span className="font-bold text-sky-400">{snap.cpu.loadPercentage}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">MEM</span>
                      <span className="font-bold text-indigo-400">{snap.memory.usedMB}M</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">BAT</span>
                      <span className="font-bold text-emerald-400">{snap.battery.level}%</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};
