import { PerformanceSnapshot } from '../metrics/types';
import { mean, roundTo, stdDev } from '../utils/fp';

export interface PerformanceStats {
  readonly totalSnapshots: number;
  readonly cpu: {
    readonly current: number;
    readonly avg: number;
    readonly min: number;
    readonly max: number;
    readonly stdDev: number;
  };
  readonly memory: {
    readonly currentMB: number;
    readonly currentPercentage: number;
    readonly avgMB: number;
    readonly maxMB: number;
    readonly avgPercentage: number;
  };
  readonly battery: {
    readonly current: number;
    readonly initial: number;
    readonly netChange: number;
    readonly isCharging: boolean;
  };
  readonly healthScore: {
    readonly current: number;
    readonly avg: number;
    readonly trend: 'improving' | 'declining' | 'stable';
  };
  readonly alertCount: number;
}

/**
 * Pure function to calculate comprehensive summary statistics across snapshots
 */
export const calculatePerformanceStats = (
  snapshots: readonly PerformanceSnapshot[]
): PerformanceStats => {
  if (snapshots.length === 0) {
    return {
      totalSnapshots: 0,
      cpu: { current: 0, avg: 0, min: 0, max: 0, stdDev: 0 },
      memory: { currentMB: 0, currentPercentage: 0, avgMB: 0, maxMB: 0, avgPercentage: 0 },
      battery: { current: 0, initial: 0, netChange: 0, isCharging: false },
      healthScore: { current: 100, avg: 100, trend: 'stable' },
      alertCount: 0,
    };
  }

  const latest = snapshots[snapshots.length - 1];
  const first = snapshots[0];

  const cpuLoads = snapshots.map(s => s.cpu.loadPercentage);
  const memoryMBs = snapshots.map(s => s.memory.usedMB);
  const memoryPcts = snapshots.map(s => s.memory.percentage);
  const healthScores = snapshots.map(s => s.systemHealthScore);
  const alertCount = snapshots.reduce((acc, s) => acc + s.triggeredAlerts.length, 0);

  const avgCpu = roundTo(1)(mean(cpuLoads));
  const minCpu = roundTo(1)(Math.min(...cpuLoads));
  const maxCpu = roundTo(1)(Math.max(...cpuLoads));
  const cpuStd = roundTo(1)(stdDev(cpuLoads));

  const avgMemMB = roundTo(1)(mean(memoryMBs));
  const maxMemMB = roundTo(1)(Math.max(...memoryMBs));
  const avgMemPct = roundTo(1)(mean(memoryPcts));

  const avgHealth = roundTo(0)(mean(healthScores));

  // Determine trend: compare average of first half with second half
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (snapshots.length >= 4) {
    const half = Math.floor(snapshots.length / 2);
    const firstHalfAvg = mean(healthScores.slice(0, half));
    const secondHalfAvg = mean(healthScores.slice(half));
    const delta = secondHalfAvg - firstHalfAvg;
    if (delta > 3) trend = 'improving';
    else if (delta < -3) trend = 'declining';
  }

  return {
    totalSnapshots: snapshots.length,
    cpu: {
      current: latest.cpu.loadPercentage,
      avg: avgCpu,
      min: minCpu,
      max: maxCpu,
      stdDev: cpuStd,
    },
    memory: {
      currentMB: latest.memory.usedMB,
      currentPercentage: latest.memory.percentage,
      avgMB: avgMemMB,
      maxMB: maxMemMB,
      avgPercentage: avgMemPct,
    },
    battery: {
      current: latest.battery.level,
      initial: first.battery.level,
      netChange: roundTo(1)(latest.battery.level - first.battery.level),
      isCharging: latest.battery.charging,
    },
    healthScore: {
      current: latest.systemHealthScore,
      avg: avgHealth,
      trend,
    },
    alertCount,
  };
};

/**
 * Pure function to detect anomalous snapshots
 */
export const findAnomalies = (
  snapshots: readonly PerformanceSnapshot[]
): PerformanceSnapshot[] => {
  if (snapshots.length < 3) {
    return snapshots.filter(s => s.triggeredAlerts.length > 0);
  }

  const cpuLoads = snapshots.map(s => s.cpu.loadPercentage);
  const avgCpu = mean(cpuLoads);
  const sdCpu = stdDev(cpuLoads);
  const cpuThreshold = avgCpu + (sdCpu * 2);

  return snapshots.filter(s => 
    s.triggeredAlerts.length > 0 ||
    s.cpu.loadPercentage > cpuThreshold ||
    s.cpu.status === 'critical' ||
    s.systemHealthScore < 60
  );
};
