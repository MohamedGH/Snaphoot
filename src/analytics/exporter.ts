import { PerformanceSnapshot } from '../metrics/types';

/**
 * Pure function to format a snapshot array as CSV
 */
export const snapshotsToCSV = (snapshots: readonly PerformanceSnapshot[]): string => {
  const headers = [
    'Snapshot ID',
    'Timestamp ISO',
    'Time',
    'CPU Load (%)',
    'CPU Status',
    'Event Loop Lag (ms)',
    'Memory Used (MB)',
    'Memory Total (MB)',
    'Memory Limit (MB)',
    'Memory (%)',
    'Battery Level (%)',
    'Battery Charging',
    'Health Score',
    'Triggered Alerts',
    'Tags',
    'Notes',
  ];

  const rows = snapshots.map(s => [
    `"${s.id}"`,
    `"${new Date(s.timestamp).toISOString()}"`,
    `"${s.formattedTime}"`,
    s.cpu.loadPercentage,
    `"${s.cpu.status}"`,
    s.cpu.eventLoopLagMs,
    s.memory.usedMB,
    s.memory.totalMB,
    s.memory.limitMB,
    s.memory.percentage,
    s.battery.level,
    s.battery.charging ? 'YES' : 'NO',
    s.systemHealthScore,
    `"${s.triggeredAlerts.join('; ')}"`,
    `"${s.tags.join(', ')}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

/**
 * Pure function to format snapshots as pretty JSON
 */
export const snapshotsToJSON = (snapshots: readonly PerformanceSnapshot[]): string => {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      snapshotCount: snapshots.length,
      snapshots,
    },
    null,
    2
  );
};
