import React, { useState } from 'react';
import { PerformanceSnapshot } from '../metrics/types';
import { useAppDispatch, useAppSelector } from '../state/store';
import { addTagOrNote, selectSnapshot, setComparison } from '../state/actions';
import { X, Cpu, HardDrive, Battery, ShieldAlert, Tag, FileText, ArrowRightLeft } from 'lucide-react';
import { roundTo } from '../utils/fp';

export const SnapshotDetailModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector(s => s.selectedSnapshotId);
  const comparisonIds = useAppSelector(s => s.comparisonIds);
  const snapshots = useAppSelector(s => s.snapshots);

  const snapshot = snapshots.find(s => s.id === selectedId);
  const compareSnapshot = snapshots.find(s => s.id === (comparisonIds[0] === selectedId ? comparisonIds[1] : comparisonIds[0]));

  const [newTag, setNewTag] = useState('');
  const [noteInput, setNoteInput] = useState(snapshot?.notes || '');

  if (!snapshot) return null;

  const handleClose = () => {
    dispatch(selectSnapshot(null));
  };

  const handleSaveNote = () => {
    dispatch(addTagOrNote(snapshot.id, undefined, noteInput));
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    dispatch(addTagOrNote(snapshot.id, newTag.trim().toLowerCase()));
    setNewTag('');
  };

  const isComparing = !!compareSnapshot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                {snapshot.id}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(snapshot.timestamp).toLocaleString()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Snapshot Performance Inspector</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Comparison Banner if comparing */}
          {isComparing && (
            <div className="bg-indigo-950/50 border border-indigo-700/50 rounded-xl p-3 text-xs text-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                <span>Comparing with snapshot <strong>{compareSnapshot.id}</strong> ({compareSnapshot.formattedTime})</span>
              </div>
              <button
                onClick={() => dispatch(setComparison(1, null))}
                className="text-[11px] underline hover:text-white cursor-pointer"
              >
                Clear Compare
              </button>
            </div>
          )}

          {/* Metric Comparison or Single Snapshot Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* CPU */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold">CPU Metric</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {snapshot.cpu.loadPercentage}%
                {isComparing && (
                  <span className={`text-xs ml-2 ${snapshot.cpu.loadPercentage >= compareSnapshot.cpu.loadPercentage ? 'text-amber-400' : 'text-emerald-400'}`}>
                    ({snapshot.cpu.loadPercentage >= compareSnapshot.cpu.loadPercentage ? '+' : ''}
                    {roundTo(1)(snapshot.cpu.loadPercentage - compareSnapshot.cpu.loadPercentage)}%)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Status: <span className="font-semibold text-slate-200 capitalize">{snapshot.cpu.status}</span></div>
                <div>Event Lag: <span className="font-mono text-slate-200">{snapshot.cpu.eventLoopLagMs} ms</span></div>
                <div>Cores: <span className="font-mono text-slate-200">{snapshot.cpu.coreCount}</span></div>
              </div>
            </div>

            {/* Memory */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold">Memory Metric</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {snapshot.memory.usedMB} <span className="text-xs font-normal text-slate-400">MB</span>
                {isComparing && (
                  <span className={`text-xs ml-1.5 ${snapshot.memory.usedMB >= compareSnapshot.memory.usedMB ? 'text-amber-400' : 'text-emerald-400'}`}>
                    ({snapshot.memory.usedMB >= compareSnapshot.memory.usedMB ? '+' : ''}
                    {roundTo(1)(snapshot.memory.usedMB - compareSnapshot.memory.usedMB)}MB)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Utilization: <span className="font-mono text-slate-200">{snapshot.memory.percentage}%</span></div>
                <div>Allocated: <span className="font-mono text-slate-200">{snapshot.memory.totalMB} MB</span></div>
                <div>Limit: <span className="font-mono text-slate-200">{snapshot.memory.limitMB} MB</span></div>
              </div>
            </div>

            {/* Battery */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold">Battery Metric</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {snapshot.battery.level}%
                {isComparing && (
                  <span className={`text-xs ml-2 ${snapshot.battery.level >= compareSnapshot.battery.level ? 'text-emerald-400' : 'text-amber-400'}`}>
                    ({snapshot.battery.level >= compareSnapshot.battery.level ? '+' : ''}
                    {roundTo(1)(snapshot.battery.level - compareSnapshot.battery.level)}%)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>State: <span className="font-semibold text-slate-200">{snapshot.battery.charging ? 'Charging' : 'Discharging'}</span></div>
                <div>Health Score: <span className="font-mono text-slate-200 font-bold">{snapshot.systemHealthScore}/100</span></div>
                <div>API Support: <span className="text-slate-300">{snapshot.battery.isSupported ? 'Native' : 'Estimated'}</span></div>
              </div>
            </div>
          </div>

          {/* Triggered Alerts */}
          {snapshot.triggeredAlerts.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Threshold Triggered Alerts</span>
              </div>
              <ul className="list-disc list-inside text-xs text-rose-200 space-y-1">
                {snapshot.triggeredAlerts.map((alert, idx) => (
                  <li key={idx}>{alert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Tag className="w-4 h-4 text-sky-400" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {snapshot.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  #{t}
                </span>
              ))}
              <form onSubmit={handleAddTag} className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="+ tag"
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-2 py-0.5 rounded-lg w-20 focus:outline-none focus:border-sky-500"
                />
              </form>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Operator Notes</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Add contextual observation for this snapshot..."
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleSaveNote}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
