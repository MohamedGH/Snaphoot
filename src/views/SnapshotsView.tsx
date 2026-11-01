import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../state/store';
import {
  clearSnapshots,
  selectSnapshot,
  setComparison,
  setFilter,
} from '../state/actions';
import { snapshotsToCSV, snapshotsToJSON } from '../analytics/exporter';
import {
  Search,
  Filter,
  Download,
  Trash2,
  ShieldAlert,
  ArrowRightLeft,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';

export const SnapshotsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const snapshots = useAppSelector(s => s.snapshots);
  const filter = useAppSelector(s => s.filter);
  const comparisonIds = useAppSelector(s => s.comparisonIds);

  const [compareMode, setCompareMode] = useState(false);

  // Pure functional filtering
  const filteredSnapshots = snapshots.filter(s => {
    if (filter.onlyAlerts && s.triggeredAlerts.length === 0) return false;
    if (filter.tag !== 'all' && !s.tags.includes(filter.tag)) return false;
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const matchId = s.id.toLowerCase().includes(q);
      const matchNotes = (s.notes || '').toLowerCase().includes(q);
      const matchTags = s.tags.some(t => t.toLowerCase().includes(q));
      if (!matchId && !matchNotes && !matchTags) return false;
    }
    return true;
  });

  // Extract unique tags functionally
  const allTags = Array.from(new Set(snapshots.flatMap(s => s.tags)));

  const handleExportCSV = () => {
    const csv = snapshotsToCSV(filteredSnapshots);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshots-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = snapshotsToJSON(filteredSnapshots);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshots-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleCompare = (id: string) => {
    if (comparisonIds[0] === id) {
      dispatch(setComparison(0, null));
    } else if (comparisonIds[1] === id) {
      dispatch(setComparison(1, null));
    } else if (!comparisonIds[0]) {
      dispatch(setComparison(0, id));
    } else {
      dispatch(setComparison(1, id));
      // Open inspection modal with both
      dispatch(selectSnapshot(comparisonIds[0]));
    }
  };

  return (
    <div className="space-y-4 pb-16 sm:pb-8">
      {/* Header and Controls */}
      <section aria-label="Snapshots Controls" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h1 className="text-base sm:text-lg font-bold text-white">
                Performance Snapshot Registry
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Showing {filteredSnapshots.length} of {snapshots.length} captured states
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                compareMode
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{compareMode ? 'Exit Compare' : 'Compare Mode'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={snapshots.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-40"
              title="Download snapshot history as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              disabled={snapshots.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-40"
              title="Download raw snapshots as JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xs:inline">JSON</span>
            </button>

            {snapshots.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all recorded snapshots?')) {
                    dispatch(clearSnapshots());
                  }
                }}
                className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 transition cursor-pointer"
                title="Clear all snapshots"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-slate-800/80">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filter.search}
              onChange={e => dispatch(setFilter({ search: e.target.value }))}
              placeholder="Search by ID, tag (#auto, #stress), or note..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Filter Chips & Tag Selector */}
          <div className="sm:col-span-6 flex items-center flex-wrap gap-1.5">
            <button
              onClick={() => dispatch(setFilter({ onlyAlerts: !filter.onlyAlerts }))}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                filter.onlyAlerts
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                  : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Only Alerts</span>
            </button>

            <select
              aria-label="Filter by Tag"
              value={filter.tag}
              onChange={e => dispatch(setFilter({ tag: e.target.value }))}
              className="bg-slate-950/70 text-xs text-slate-300 border border-slate-800 rounded-xl px-2.5 py-2 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Comparison Instruction Bar if compare mode active */}
      {compareMode && (
        <aside aria-label="Comparison Instructions" className="bg-indigo-950/40 border border-indigo-700/60 rounded-xl p-3 text-xs text-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Select two snapshots to compare. Slot 1:{' '}
              <strong>{comparisonIds[0] || 'None'}</strong> • Slot 2:{' '}
              <strong>{comparisonIds[1] || 'None'}</strong>
            </span>
          </div>
          {comparisonIds[0] && comparisonIds[1] && (
            <button
              onClick={() => dispatch(selectSnapshot(comparisonIds[0]))}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer shadow-md"
            >
              Inspect Diff
            </button>
          )}
        </aside>
      )}

      {/* Snapshots Feed */}
      {filteredSnapshots.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400 space-y-2">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-300">No matching snapshots found</p>
          <p className="text-[11px] text-slate-500">Try adjusting your search query or alert filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSnapshots
            .slice()
            .reverse()
            .map(snap => {
              const isSelectedForCompare =
                comparisonIds[0] === snap.id || comparisonIds[1] === snap.id;

              return (
                <div
                  key={snap.id}
                  className={`bg-slate-900/70 border rounded-xl p-3.5 sm:p-4 shadow-md transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelectedForCompare
                      ? 'border-indigo-500 bg-indigo-950/20'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Left Column: ID & Tags */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {snap.formattedTime}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
                        ({snap.id})
                      </span>
                      {snap.triggeredAlerts.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/70 px-1.5 py-0.5 rounded border border-rose-800/60">
                          <ShieldAlert className="w-3 h-3" />
                          <span>{snap.triggeredAlerts.length} alert(s)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-1">
                      {snap.tags.map(t => (
                        <span
                          key={t}
                          className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800"
                        >
                          #{t}
                        </span>
                      ))}
                      {snap.notes && (
                        <span className="text-[11px] text-amber-300/80 italic truncate max-w-xs block">
                          "{snap.notes}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: 3 Pillars Telemetry Reading */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 font-mono text-xs">
                    <div className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/60 text-center sm:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">
                        CPU Load
                      </span>
                      <span className="font-bold text-sky-400">
                        {snap.cpu.loadPercentage}%
                      </span>
                    </div>

                    <div className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/60 text-center sm:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">
                        Memory
                      </span>
                      <span className="font-bold text-indigo-400">
                        {snap.memory.usedMB} MB
                      </span>
                    </div>

                    <div className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/60 text-center sm:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">
                        Battery
                      </span>
                      <span className="font-bold text-emerald-400">
                        {snap.battery.level}%
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    {compareMode && (
                      <button
                        onClick={() => handleToggleCompare(snap.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          isSelectedForCompare
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        {isSelectedForCompare ? 'Selected' : 'Select'}
                      </button>
                    )}

                    <button
                      onClick={() => dispatch(selectSnapshot(snap.id))}
                      className="px-3 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white text-xs font-semibold border border-sky-500/40 transition cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
