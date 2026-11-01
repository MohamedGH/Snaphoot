import { CpuMetric, CpuStatus } from './types';
import { clamp, roundTo } from '../utils/fp';

// Base benchmark target duration in milliseconds for an idle CPU on the reference task
const REFERENCE_BASELINE_MS = 1.2;

/**
 * Pure function to map numerical load to status string
 */
export const deriveCpuStatus = (loadPercentage: number): CpuStatus => {
  if (loadPercentage < 40) return 'optimal';
  if (loadPercentage < 70) return 'moderate';
  if (loadPercentage < 88) return 'elevated';
  return 'critical';
};

/**
 * Pure function to calculate CPU load from execution delta and jitter
 */
export const calculateCpuLoadMetric = (
  measuredTaskMs: number,
  baselineMs: number,
  eventLoopLagMs: number,
  cores: number
): CpuMetric => {
  // Ratio of task duration over baseline
  const taskRatio = measuredTaskMs / Math.max(0.1, baselineMs);
  
  // Base load estimation: idle is ~5-15%, scaled up with event loop lag
  const taskFactor = (taskRatio - 1) * 20;
  const cappedLag = Math.min(50, eventLoopLagMs);
  const lagFactor = cappedLag * 0.9;
  
  const estimatedRawLoad = 10 + taskFactor + lagFactor;
  const loadPercentage = clamp(4, 99)(roundTo(1)(estimatedRawLoad));
  const status = deriveCpuStatus(loadPercentage);

  return {
    loadPercentage,
    eventLoopLagMs: roundTo(1)(eventLoopLagMs),
    coreCount: Math.max(1, cores),
    status,
  };
};

/**
 * Measures event loop lag using high-resolution performance timer
 */
export const measureEventLoopLag = (): Promise<number> => {
  return new Promise((resolve) => {
    const start = performance.now();
    const expectedDelay = 10;
    setTimeout(() => {
      const elapsed = performance.now() - start;
      const lag = Math.max(0, elapsed - expectedDelay);
      resolve(lag);
    }, expectedDelay);
  });
};

/**
 * Executes a deterministic, bounded math micro-benchmark to evaluate active execution latency
 */
export const runMicroBenchmark = (): number => {
  const start = performance.now();
  let acc = 0;
  // Bounded math work: 60,000 operations
  for (let i = 0; i < 60000; i++) {
    acc += Math.sqrt(i % 100) * Math.sin(i);
  }
  // Prevent optimization dead-code elimination
  if (acc === -99999999) console.log(acc);
  return performance.now() - start;
};

/**
 * Async probe to collect CPU load metric
 */
export const probeCpu = async (): Promise<CpuMetric> => {
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  
  // Run micro benchmark
  const taskMs = runMicroBenchmark();
  
  // Measure event loop lag
  const lagMs = await measureEventLoopLag();

  return calculateCpuLoadMetric(taskMs, REFERENCE_BASELINE_MS, lagMs, cores);
};
