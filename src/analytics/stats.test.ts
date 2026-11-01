import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePerformanceStats, findAnomalies } from './stats';
import { PerformanceSnapshot } from '../metrics/types';

const createSnap = (
  id: string,
  cpuLoad: number,
  memMB: number,
  battery: number,
  alerts: string[] = []
): PerformanceSnapshot => ({
  id,
  timestamp: Date.now(),
  formattedTime: '12:00:00',
  memory: {
    usedMB: memMB,
    totalMB: 200,
    limitMB: 2000,
    percentage: 25,
    isSupported: true,
    source: 'performance.memory',
  },
  battery: {
    level: battery,
    charging: false,
    chargingTime: null,
    dischargingTime: 3600,
    isSupported: true,
  },
  cpu: {
    loadPercentage: cpuLoad,
    eventLoopLagMs: 2,
    coreCount: 4,
    status: cpuLoad > 80 ? 'critical' : 'optimal',
  },
  systemHealthScore: 100 - (cpuLoad > 50 ? (cpuLoad - 50) : 0),
  triggeredAlerts: alerts,
  tags: ['auto'],
});

test('Analytics Stats: calculatePerformanceStats returns empty stats for 0 snapshots', () => {
  const stats = calculatePerformanceStats([]);
  assert.equal(stats.totalSnapshots, 0);
  assert.equal(stats.cpu.avg, 0);
});

test('Analytics Stats: calculatePerformanceStats aggregates min, max, avg correctly', () => {
  const snaps = [
    createSnap('s1', 20, 50, 90),
    createSnap('s2', 40, 70, 85),
    createSnap('s3', 60, 90, 80),
  ];

  const stats = calculatePerformanceStats(snaps);
  assert.equal(stats.totalSnapshots, 3);
  assert.equal(stats.cpu.min, 20);
  assert.equal(stats.cpu.max, 60);
  assert.equal(stats.cpu.avg, 40);
  assert.equal(stats.memory.maxMB, 90);
  assert.equal(stats.memory.avgMB, 70);
  assert.equal(stats.battery.initial, 90);
  assert.equal(stats.battery.current, 80);
  assert.equal(stats.battery.netChange, -10);
});

test('Analytics Stats: findAnomalies identifies critical alerts and spikes', () => {
  const snaps = [
    createSnap('s1', 15, 50, 90),
    createSnap('s2', 20, 50, 90),
    createSnap('s3', 18, 50, 90),
    createSnap('s4', 95, 50, 90, ['High CPU Load: 95% exceeds 75%']),
  ];

  const anomalies = findAnomalies(snaps);
  assert.ok(anomalies.length >= 1);
  assert.equal(anomalies[0].id, 's4');
});
