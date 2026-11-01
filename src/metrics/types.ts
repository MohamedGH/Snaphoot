/**
 * Metric and snapshot domain models
 */

export interface MemoryMetric {
  readonly usedMB: number;
  readonly totalMB: number;
  readonly limitMB: number;
  readonly percentage: number;
  readonly isSupported: boolean;
  readonly source: 'performance.memory' | 'deviceMemory' | 'synthetic-benchmark';
}

export interface BatteryMetric {
  readonly level: number; // 0 to 100
  readonly charging: boolean;
  readonly chargingTime: number | null; // seconds or null
  readonly dischargingTime: number | null; // seconds or null
  readonly isSupported: boolean;
}

export type CpuStatus = 'optimal' | 'moderate' | 'elevated' | 'critical';

export interface CpuMetric {
  readonly loadPercentage: number; // 0 to 100
  readonly eventLoopLagMs: number;
  readonly coreCount: number;
  readonly status: CpuStatus;
}

export interface PerformanceSnapshot {
  readonly id: string;
  readonly timestamp: number;
  readonly formattedTime: string;
  readonly memory: MemoryMetric;
  readonly battery: BatteryMetric;
  readonly cpu: CpuMetric;
  readonly systemHealthScore: number; // 0 to 100
  readonly triggeredAlerts: readonly string[];
  readonly tags: readonly string[];
  readonly notes?: string;
}

export interface AlertThresholds {
  readonly cpuThreshold: number; // e.g. 80%
  readonly memoryThreshold: number; // e.g. 85%
  readonly batteryThreshold: number; // e.g. 20%
}
