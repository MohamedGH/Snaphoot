import {
  AlertThresholds,
  BatteryMetric,
  CpuMetric,
  MemoryMetric,
  PerformanceSnapshot,
} from './types';
import { probeMemory } from './memoryProbe';
import { probeBattery } from './batteryProbe';
import { probeCpu } from './cpuBenchmark';
import { clamp, roundTo } from '../utils/fp';
import { Result, tryCatchAsync } from '../types/result';

/**
 * Pure function to compute overall system health score (0-100)
 */
export const calculateHealthScore = (
  cpu: CpuMetric,
  memory: MemoryMetric,
  battery: BatteryMetric
): number => {
  let score = 100;

  // CPU impact: load > 50 drops score
  if (cpu.loadPercentage > 50) {
    score -= (cpu.loadPercentage - 50) * 0.6;
  }

  // Event loop lag impact (> 15ms)
  if (cpu.eventLoopLagMs > 15) {
    score -= Math.min(15, (cpu.eventLoopLagMs - 15) * 0.5);
  }

  // Memory impact (> 70% drops score)
  if (memory.percentage > 70) {
    score -= (memory.percentage - 70) * 0.5;
  }

  // Battery impact (low and discharging)
  if (battery.level < 20 && !battery.charging) {
    score -= (20 - battery.level) * 0.8;
  }

  return clamp(10, 100)(roundTo(0)(score));
};

/**
 * Pure function to check thresholds and return triggered alerts
 */
export const evaluateAlerts = (
  cpu: CpuMetric,
  memory: MemoryMetric,
  battery: BatteryMetric,
  thresholds: AlertThresholds
): readonly string[] => {
  const alerts: string[] = [];

  if (cpu.loadPercentage >= thresholds.cpuThreshold) {
    alerts.push(`High CPU Load: ${cpu.loadPercentage}% exceeds ${thresholds.cpuThreshold}% threshold`);
  }

  if (memory.percentage >= thresholds.memoryThreshold) {
    alerts.push(`High Memory Usage: ${memory.percentage}% exceeds ${thresholds.memoryThreshold}% threshold`);
  }

  if (battery.level <= thresholds.batteryThreshold && !battery.charging) {
    alerts.push(`Critical Battery Level: ${battery.level}% is below ${thresholds.batteryThreshold}%`);
  }

  return alerts;
};

/**
 * Pure factory function to build a PerformanceSnapshot object
 */
export const buildSnapshot = (
  id: string,
  timestamp: number,
  memory: MemoryMetric,
  battery: BatteryMetric,
  cpu: CpuMetric,
  thresholds: AlertThresholds,
  tags: readonly string[] = [],
  notes?: string
): PerformanceSnapshot => {
  const systemHealthScore = calculateHealthScore(cpu, memory, battery);
  const triggeredAlerts = evaluateAlerts(cpu, memory, battery, thresholds);
  
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    id,
    timestamp,
    formattedTime,
    memory,
    battery,
    cpu,
    systemHealthScore,
    triggeredAlerts,
    tags,
    notes,
  };
};

/**
 * Capture a complete snapshot safely returning a Result monad
 */
export const captureSnapshot = async (
  thresholds: AlertThresholds,
  tags: readonly string[] = ['auto'],
  notes?: string
): Promise<Result<PerformanceSnapshot, Error>> => {
  return tryCatchAsync(async () => {
    const timestamp = Date.now();
    const id = `snap-${timestamp}-${Math.random().toString(36).slice(2, 7)}`;

    // Probe metrics concurrently
    const [memory, battery, cpu] = await Promise.all([
      Promise.resolve(probeMemory()),
      probeBattery(),
      probeCpu(),
    ]);

    return buildSnapshot(id, timestamp, memory, battery, cpu, thresholds, tags, notes);
  });
};
