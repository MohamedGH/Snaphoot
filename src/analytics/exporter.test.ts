import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshotsToCSV, snapshotsToJSON } from './exporter';
import { PerformanceSnapshot } from '../metrics/types';

const mockSnap: PerformanceSnapshot = {
  id: 'snap-123',
  timestamp: 1700000000000,
  formattedTime: '10:00:00 AM',
  memory: {
    usedMB: 45.2,
    totalMB: 100,
    limitMB: 2048,
    percentage: 2.2,
    isSupported: true,
    source: 'performance.memory',
  },
  battery: {
    level: 95,
    charging: true,
    chargingTime: 600,
    dischargingTime: null,
    isSupported: true,
  },
  cpu: {
    loadPercentage: 18.5,
    eventLoopLagMs: 0.8,
    coreCount: 8,
    status: 'optimal',
  },
  systemHealthScore: 100,
  triggeredAlerts: ['Warning: Sample alert'],
  tags: ['auto', 'baseline'],
  notes: 'Calibration run',
};

test('Exporter: snapshotsToCSV produces CSV format with headers and rows', () => {
  const csv = snapshotsToCSV([mockSnap]);
  assert.ok(csv.includes('Snapshot ID,Timestamp ISO,Time,CPU Load (%)'));
  assert.ok(csv.includes('"snap-123"'));
  assert.ok(csv.includes('18.5'));
  assert.ok(csv.includes('45.2'));
  assert.ok(csv.includes('95'));
  assert.ok(csv.includes('YES'));
  assert.ok(csv.includes('Calibration run'));
});

test('Exporter: snapshotsToJSON produces valid JSON string', () => {
  const json = snapshotsToJSON([mockSnap]);
  const parsed = JSON.parse(json);
  assert.equal(parsed.snapshotCount, 1);
  assert.equal(parsed.snapshots[0].id, 'snap-123');
  assert.equal(parsed.snapshots[0].cpu.loadPercentage, 18.5);
});
