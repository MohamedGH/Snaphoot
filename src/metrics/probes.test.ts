import test from 'node:test';
import assert from 'node:assert/strict';
import { computeMemoryMetric } from './memoryProbe';
import { computeBatteryMetric } from './batteryProbe';
import { deriveCpuStatus, calculateCpuLoadMetric } from './cpuBenchmark';

test('Memory Probe: computeMemoryMetric', () => {
  const MB = 1024 * 1024;
  const metric = computeMemoryMetric(
    50 * MB,
    100 * MB,
    200 * MB,
    'performance.memory',
    true
  );

  assert.equal(metric.usedMB, 50);
  assert.equal(metric.totalMB, 100);
  assert.equal(metric.limitMB, 200);
  assert.equal(metric.percentage, 25);
  assert.equal(metric.isSupported, true);
  assert.equal(metric.source, 'performance.memory');
});

test('Battery Probe: computeBatteryMetric', () => {
  // Test with decimal 0.75
  const metricDec = computeBatteryMetric(0.75, true, 1800, null, true);
  assert.equal(metricDec.level, 75);
  assert.equal(metricDec.charging, true);
  assert.equal(metricDec.chargingTime, 1800);
  assert.equal(metricDec.dischargingTime, null);
  assert.equal(metricDec.isSupported, true);

  // Test with percentage 50
  const metricPct = computeBatteryMetric(50, false, null, 7200, false);
  assert.equal(metricPct.level, 50);
  assert.equal(metricPct.charging, false);
  assert.equal(metricPct.dischargingTime, 7200);
});

test('CPU Benchmark: deriveCpuStatus', () => {
  assert.equal(deriveCpuStatus(25), 'optimal');
  assert.equal(deriveCpuStatus(55), 'moderate');
  assert.equal(deriveCpuStatus(75), 'elevated');
  assert.equal(deriveCpuStatus(92), 'critical');
});

test('CPU Benchmark: calculateCpuLoadMetric', () => {
  const metric = calculateCpuLoadMetric(1.2, 1.2, 0, 8);
  assert.ok(metric.loadPercentage >= 5 && metric.loadPercentage <= 20);
  assert.equal(metric.coreCount, 8);
  assert.equal(metric.eventLoopLagMs, 0);

  // High load with heavy lag
  const highMetric = calculateCpuLoadMetric(5.0, 1.2, 25, 4);
  assert.ok(highMetric.loadPercentage > 60);
});
