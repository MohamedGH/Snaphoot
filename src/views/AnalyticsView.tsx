import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../state/store';
import { calculatePerformanceStats, findAnomalies } from '../analytics/stats';
import { selectSnapshot } from '../state/actions';
import {
  BarChart3,
  Cpu,
  HardDrive,
  Battery,
  ShieldAlert,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const snapshots = useAppSelector(s => s.snapshots);

  const [activeCurves, setActiveCurves] = useState({
    cpu: true,
    memory: true,
    battery: true,
  });

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    time: string;
    cpu: number;
    mem: number;
    bat: number;
  } | null>(null);

  const stats = calculatePerformanceStats(snapshots);
  const anomalies = findAnomalies(snapshots);

  const chartSnapshots = snapshots.slice(-40); // Max 40 points for sharp presentation

  return (
    <div className="space-y-4 pb-16 sm:pb-8">
      {/* Overview Stat Cards */}
      <section aria-label="Performance Statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* CPU Stats */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">CPU Average</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {stats.cpu.avg}%
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <div>Peak Load: <span className="font-mono text-slate-200 font-bold">{stats.cpu.max}%</span></div>
            <div>Min Load: <span className="font-mono text-slate-200">{stats.cpu.min}%</span></div>
            <div>Std Dev: <span className="font-mono text-slate-200">±{stats.cpu.stdDev}%</span></div>
          </div>
        </div>

        {/* Memory Stats */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Memory Peak</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {stats.memory.maxMB} <span className="text-xs font-normal text-slate-400">MB</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <div>Avg Used: <span className="font-mono text-slate-200 font-bold">{stats.memory.avgMB} MB</span></div>
            <div>Avg Util: <span className="font-mono text-slate-200">{stats.memory.avgPercentage}%</span></div>
            <div>Current: <span className="font-mono text-slate-200">{stats.memory.currentMB} MB</span></div>
          </div>
        </div>

        {/* Battery Stats */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Battery Level</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {stats.battery.current}%
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <div>Net Change: <span className={`font-mono font-bold ${stats.battery.netChange >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{stats.battery.netChange > 0 ? `+${stats.battery.netChange}` : stats.battery.netChange}%</span></div>
            <div>Start Level: <span className="font-mono text-slate-200">{stats.battery.initial}%</span></div>
            <div>Charging: <span className="text-slate-200 font-semibold">{stats.battery.isCharging ? 'Yes' : 'No'}</span></div>
          </div>
        </div>

        {/* Health Score & Anomaly count */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Health Score</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {stats.healthScore.avg}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <div>Trend: <span className="font-bold capitalize text-slate-200">{stats.healthScore.trend}</span></div>
            <div>Total Alerts: <span className="font-mono text-rose-400 font-bold">{stats.alertCount}</span></div>
            <div>Anomalies: <span className="font-mono text-slate-200">{anomalies.length}</span></div>
          </div>
        </div>
      </section>

      {/* Main Multi-Metric Interactive SVG Graph */}
      <section aria-label="Interactive Metric Timeline" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Interactive Metric Timeline</h2>
            </div>
            <p className="text-xs text-slate-400">
              Correlated telemetry across periodic snapshot intervals
            </p>
          </div>

          {/* Curve Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCurves(c => ({ ...c, cpu: !c.cpu }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                activeCurves.cpu
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/40'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>CPU</span>
            </button>

            <button
              onClick={() => setActiveCurves(c => ({ ...c, memory: !c.memory }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                activeCurves.memory
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Memory %</span>
            </button>

            <button
              onClick={() => setActiveCurves(c => ({ ...c, battery: !c.battery }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                activeCurves.battery
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Battery</span>
            </button>
          </div>
        </div>

        {/* SVG Canvas Chart */}
        <div className="relative h-64 w-full bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 overflow-hidden">
          {chartSnapshots.length < 2 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Insufficient snapshot data to plot curves. Please wait for periodic ticks.
            </div>
          ) : (
            <div className="h-full w-full relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-dashed border-slate-500 text-[10px] text-slate-400 font-mono">100%</div>
                <div className="border-b border-dashed border-slate-500 text-[10px] text-slate-400 font-mono">75%</div>
                <div className="border-b border-dashed border-slate-500 text-[10px] text-slate-400 font-mono">50%</div>
                <div className="border-b border-dashed border-slate-500 text-[10px] text-slate-400 font-mono">25%</div>
                <div className="border-b border-dashed border-slate-500 text-[10px] text-slate-400 font-mono">0%</div>
              </div>

              {/* Chart SVG */}
              <svg
                viewBox="0 0 600 200"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Battery Line */}
                {activeCurves.battery && (
                  <polyline
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    points={chartSnapshots
                      .map((s, idx) => {
                        const x = (idx / (chartSnapshots.length - 1)) * 600;
                        const y = 200 - (s.battery.level / 100) * 190 - 5;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Memory Line */}
                {activeCurves.memory && (
                  <polyline
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                    strokeLinecap="round"
                    points={chartSnapshots
                      .map((s, idx) => {
                        const x = (idx / (chartSnapshots.length - 1)) * 600;
                        const y = 200 - (s.memory.percentage / 100) * 190 - 5;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* CPU Line */}
                {activeCurves.cpu && (
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    points={chartSnapshots
                      .map((s, idx) => {
                        const x = (idx / (chartSnapshots.length - 1)) * 600;
                        const y = 200 - (s.cpu.loadPercentage / 100) * 190 - 5;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Interactive Points on hover */}
                {chartSnapshots.map((s, idx) => {
                  const x = (idx / (chartSnapshots.length - 1)) * 600;
                  const yCpu = 200 - (s.cpu.loadPercentage / 100) * 190 - 5;
                  return (
                    <circle
                      key={s.id}
                      cx={x}
                      cy={yCpu}
                      r="4"
                      className="fill-sky-400 hover:fill-white hover:r-6 transition cursor-pointer"
                      onClick={() => dispatch(selectSnapshot(s.id))}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          x,
                          y: yCpu,
                          time: s.formattedTime,
                          cpu: s.cpu.loadPercentage,
                          mem: s.memory.percentage,
                          bat: s.battery.level,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white shadow-2xl pointer-events-none z-20 font-mono"
                  style={{
                    left: `${Math.min(80, Math.max(10, (hoveredPoint.x / 600) * 100))}%`,
                    top: '10px',
                  }}
                >
                  <div className="font-bold text-sky-400 mb-1">{hoveredPoint.time}</div>
                  <div>CPU: <strong className="text-white">{hoveredPoint.cpu}%</strong></div>
                  <div>Memory: <strong className="text-indigo-300">{hoveredPoint.mem}%</strong></div>
                  <div>Battery: <strong className="text-emerald-300">{hoveredPoint.bat}%</strong></div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Anomaly & Peak Spike List */}
      <section aria-label="Detected Anomalies" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-white">Detected Anomalies & Alerts</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {anomalies.length} event(s)
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No system anomalies or critical threshold breaches observed. Operating cleanly.
          </div>
        ) : (
          <div className="space-y-2">
            {anomalies.slice(-5).map(snap => (
              <div
                key={snap.id}
                onClick={() => dispatch(selectSnapshot(snap.id))}
                className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/50 transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {snap.formattedTime}
                    </span>
                    <span className="text-[10px] text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                      Health: {snap.systemHealthScore}/100
                    </span>
                  </div>
                  <div className="text-xs text-rose-300 mt-1">
                    {snap.triggeredAlerts.join(', ') || `Elevated CPU load: ${snap.cpu.loadPercentage}%`}
                  </div>
                </div>
                <div className="font-mono text-xs text-slate-300 text-right">
                  <div>CPU: <strong className="text-white">{snap.cpu.loadPercentage}%</strong></div>
                  <div>Mem: <strong className="text-white">{snap.memory.usedMB}MB</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
