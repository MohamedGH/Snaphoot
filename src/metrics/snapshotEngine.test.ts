import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHealthScore,
  evaluateAlerts,
  buildSnapshot,
} from './snapshotEngine';
import { BatteryMetric, CpuMetric, MemoryMetric } from './types';

const mockCpu: CpuMetric = {
  loadPercentage: 25,
  eventLoopLagMs: 1.5,
  coreCount: 8,
  status: 'optimal',
};

const mockMemory: MemoryMetric = {
  usedMB: 60,
  totalMB: 120,
  limitMB: 2048,
  percentage: 2.9,
  isSupported: true,
  source: 'performance.memory',
};

const mockBattery: BatteryMetric = {
  level: 80,
  charging: true,
  chargingTime: 2000,
  dischargingTime: null,
  isSupported: true,
};

test('Snapshot Engine: calculateHealthScore returns high score for normal load', () => {
  const score = calculateHealthScore(mockCpu, mockMemory, mockBattery);
  assert.equal(score, 100);
});

test('Snapshot Engine: calculateHealthScore degrades with heavy CPU and low battery', () => {
  const heavyCpu: CpuMetric = {
    ...mockCpu,
    loadPercentage: 90,
    eventLoopLagMs: 30,
    status: 'critical',
  };
  const deadBattery: BatteryMetric = {
    ...mockBattery,
    level: 10,
    charging: false,
  };
  const score = calculateHealthScore(heavyCpu, mockMemory, deadBattery);
  assert.ok(score < 70);
});

test('Snapshot Engine: evaluateAlerts identifies threshold breaches', () => {
  const thresholds = {
    cpuThreshold: 75,
    memoryThreshold: 80,
    batteryThreshold: 20,
  };

  const normalAlerts = evaluateAlerts(mockCpu, mockMemory, mockBattery, thresholds);
  assert.equal(normalAlerts.length, 0);

  const breachedCpu: CpuMetric = { ...mockCpu, loadPercentage: 85 };
  const alerts = evaluateAlerts(breachedCpu, mockMemory, mockBattery, thresholds);
  assert.equal(alerts.length, 1);
  assert.ok(alerts[0].includes('High CPU Load'));
});

test('Snapshot Engine: buildSnapshot constructs snapshot model correctly', () => {
  const snap = buildSnapshot(
    'test-1',
    1700000000000,
    mockMemory,
    mockBattery,
    mockCpu,
    { cpuThreshold: 75, memoryThreshold: 80, batteryThreshold: 20 },
    ['test-tag'],
    'Test notes'
  );

  assert.equal(snap.id, 'test-1');
  assert.equal(snap.timestamp, 1700000000000);
  assert.equal(snap.cpu.loadPercentage, 25);
  assert.equal(snap.notes, 'Test notes');
  assert.deepEqual(snap.tags, ['test-tag']);
});
